# NAKIME — API Route Reference

All routes are under `/src/app/api/`. Unless noted they are `GET` only.

---

## Data Feed Routes

| Route | Source | Cache | Notes |
|-------|--------|-------|-------|
| `/api/flights` | adsb.lol (ADS-B) | 45s in-memory + `s-maxage=30` | 6 regions in parallel; deduped by ICAO hex; classifies commercial / private / jet / military; GPS jamming detection via NACp ≤ 4 |
| `/api/earthquakes` | USGS GeoJSON feed | `s-maxage=300` | M2.5+; polled every 15 min client-side |
| `/api/fires` | NASA FIRMS | `s-maxage=3600` | Requires `FIRMS_API_KEY` for higher limits |
| `/api/cctv` | 21 regional fetchers | `s-maxage=300` | `?region=all` loads all; `?region=uk,us-east` for subset; `?lat=&lng=&radius=` for proximity; 21 region fetcher functions |
| `/api/cctv/stream-status` | HEAD check | none | Validates if a camera URL is reachable |
| `/api/maritime` | Static JSON | `s-maxage=3600` | 39 global ports, 10 chokepoints; ships via AIS if `AIS_API_KEY` set |
| `/api/satellites` | N2YO TLE API | `s-maxage=300` | Requires `N2YO_API_KEY`; propagates TLE with `satellite.js` |
| `/api/live-news` | Static registry | `s-maxage=86400` | 25+ YouTube/HLS streams; hardcoded feed list |
| `/api/news` | Multi-source RSS | `s-maxage=1800` | `rss-parser` aggregates Reuters, AP, BBC, Al Jazeera, etc.; attaches NLP risk score + geo coords |
| `/api/gdelt` | GDELT GKG/Events API | `s-maxage=3600` | Global conflict/political events |
| `/api/weather` | NASA EONET | `s-maxage=3600` | Severe weather, volcanic, flooding events |
| `/api/space-weather` | NOAA SWPC | `s-maxage=1800` | Kp index; Kp color coding (green/yellow/red) |
| `/api/markets` | CoinGecko + commodity APIs | `s-maxage=900` | BTC, ETH, gold, oil; no API key needed |
| `/api/infrastructure` | Static JSON | `s-maxage=86400` | Nuclear plants, power grids, pipelines |
| `/api/frontlines` | Static OSINT | none | 13 active conflict/tension zones |
| `/api/air-quality` | OpenAQ | `s-maxage=3600` | PM2.5/PM10 readings |
| `/api/cyber-threats` | CISA KEV feed | `s-maxage=3600` | Known Exploited Vulnerabilities |
| `/api/sentinel` | Internal | none | Watchlist-based alert generation |

---

## AI Routes

| Route | Method | Body | Notes |
|-------|--------|------|-------|
| `/api/ai/analyze` | POST | `{ query, context }` | Gemini 2.0 Flash; ad-hoc intelligence query |
| `/api/ai/briefing` | POST | `{ context }` | Gemini 2.0 Flash; structured daily briefing in 8 sections |

Context shape (both routes):
```ts
{
  earthquakes: EarthquakeEvent[],
  news: NewsItem[],
  threats: ThreatEvent[],
  cyberAlerts: CyberAlert[],
  timestamp: string,
}
```
Requires `GEMINI_API_KEY` (or `GEMINI_API_KEY_1` … `GEMINI_API_KEY_N` for rotation).

---

## OSINT / RECON Routes (`/api/osint/`)

All take query params. All go through rate-limiting. IP-targeting routes go through SSRF guard.

| Sub-route | Param | External Service | Notes |
|-----------|-------|-----------------|-------|
| `/osint/ip` | `?ip=` | ip-api.com | Geo + ASN + proxy flag + OFAC SDN cross-check |
| `/osint/dns` | `?domain=` | Node `dns/promises` | A, AAAA, MX, NS, TXT, CNAME resolution |
| `/osint/whois` | `?domain=` | whois via rdap.org | Registrant cross-checked against OFAC SDN |
| `/osint/certs` | `?domain=` | crt.sh | Certificate transparency log search |
| `/osint/bgp` | `?target=` | bgpview.io | BGP route, ASN, prefix info |
| `/osint/mac` | `?mac=` | maclookup.app | OUI / vendor lookup |
| `/osint/phone` | `?phone=` | google-libphonenumber | NANP inference + area-code geolocation |
| `/osint/leaks` | `?email=` | HaveIBeenPwned (proxied) | Breach data lookup |
| `/osint/github` | `?username=` | GitHub public API | Profile, repos, gists, org memberships |
| `/osint/cve` | `?cve=` | NVD API | CVE detail, CVSS score, CWE, affected products |
| `/osint/shodan` | `?ip=` | Shodan InternetDB (client-side bypass) | Open ports, services, CVEs; client-side to avoid EPYC rate limits |
| `/osint/sweep` | `?ip=&cidr=` | ip-api.com + client Shodan | IP geolocation init; actual sweep done client-side via InternetDB |
| `/osint/threats` | `?target=` | VirusTotal / OTX (if keyed) | Reputation, malware hashes |
| `/osint/sanctions` | `?q=` | OpenSanctions in-memory mirror | Full-text OFAC SDN search; persons, orgs, vessels, aircraft |

---

## Utility Routes

| Route | Notes |
|-------|-------|
| `/api/health` | Returns `{ status: 'ok', version }` |
| `/api/stats` | Returns cached entity counts (flights, sats, CCTV, etc.) for the HUD |
| `/api/region-dossier` | `?lat=&lng=` — Nominatim reverse geocode + restcountries.com + Wikipedia summary |
| `/api/country-risk` | `?country=` — risk score aggregation |
| `/api/scanner` | Proxy to external scanner backend; requires `SCANNER_URL` + `SCANNER_KEY` env vars |
| `/api/scm-suppliers` | SCM supplier data (currently returning empty/disabled) |
| `/api/github-webhook` | Receives push webhooks for auto-deploy notifications |

---

## Security Notes

- All OSINT routes that accept `ip`/`host` parameters go through `ssrf-guard.ts` (`validateHost()` or `safeFetch()`)
- Rate limiting is per-isolate in-memory (`isRateLimited()` in `ssrf-guard.ts`): 20 req/60s default, 5 req/60s for sweep
- OFAC SDN list is cached in memory for 24h, fetched from OpenSanctions on first request
- `next.config.ts` sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options headers globally

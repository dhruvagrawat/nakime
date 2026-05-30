# NAKIME — External Data Sources

All sources used, keyed or keyless, and their status.

---

## Keyless (No API Key Required)

| Source | What | URL |
|--------|------|-----|
| adsb.lol | Real-time ADS-B aircraft positions | `api.adsb.lol/v2/lat/{}/lon/{}/dist/{}` |
| USGS GeoJSON | Earthquakes M2.5+ past 30 days | `earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson` |
| NASA EONET | Natural events (weather, volcanic, floods) | `eonet.gsfc.nasa.gov/api/v3/events` |
| NOAA SWPC | Space weather / Kp index | `services.swpc.noaa.gov` |
| CoinGecko | BTC/ETH prices | `api.coingecko.com` |
| ip-api.com | IP geolocation + ASN | `ip-api.com/json/{ip}` |
| Shodan InternetDB | Passive port/CVE data (no key, rate-limited) | `internetdb.shodan.io/{ip}` |
| bgpview.io | BGP route info | `api.bgpview.io` |
| maclookup.app | MAC OUI vendor | `api.maclookup.app` |
| crt.sh | Certificate transparency | `crt.sh/?q={domain}&output=json` |
| rdap.org | WHOIS via RDAP | `rdap.org` |
| nominatim.openstreetmap.org | Reverse geocode + search | OpenStreetMap Nominatim |
| restcountries.com | Country metadata | `restcountries.com/v3.1` |
| Wikipedia API | Country/location summary | `en.wikipedia.org/api/rest_v1` |
| GitHub public API | User profile / repos | `api.github.com` |
| OpenSanctions | OFAC SDN list mirror | `data.opensanctions.org` (CC-BY 4.0) |
| Google Gemini AI | Intelligence analysis | `@google/generative-ai` SDK |
| HaveIBeenPwned | Email breach data | `haveibeenpwned.com/api/v3` |
| TfL JamCams | London CCTV (~900) | `api.tfl.gov.uk/Place/Type/JamCam` |
| WSDOT | Washington State cameras | `data.wsdot.wa.gov` |
| Caltrans | California cameras (9 districts) | `cwwp2.dot.ca.gov` |
| FL-511 | Florida cameras | `fl511.com` |
| 511 Ontario | Ontario/Alberta Canada cameras | `511on.ca`, `511.alberta.ca` |
| Ville Montréal | Montréal cameras | `ville.montreal.qc.ca` |
| Netherlands RWS | Dutch highway cameras | `opendata.ndw.nu` |
| Singapore LTA | Singapore traffic cameras | `api.data.gov.sg` |
| ASFINAG | Austrian motorway cameras | Custom fetcher |
| GDELT | Global events database | `api.gdeltproject.org` |
| CISA KEV | Known exploited vulnerabilities | `cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json` |

---

## Keyed (API Key Enhances or Required)

| Source | What | Env Var | Free Tier |
|--------|------|---------|-----------|
| NASA FIRMS | Active fire hotspots | `FIRMS_API_KEY` | Yes (lower rate limit) |
| OpenSky Network | Commercial flight positions (backup) | `OPENSKY_CLIENT_ID` + `OPENSKY_CLIENT_SECRET` | Yes (rate limited) |
| N2YO | Satellite TLE + tracking | `N2YO_API_KEY` | Yes (1000 req/hr) |
| aisstream.io | Live AIS maritime ship positions | `AIS_API_KEY` | Yes (limited) |
| Google Gemini | AI analysis + briefing | `GEMINI_API_KEY` | Yes (free tier) |
| VirusTotal | Threat reputation | `VIRUSTOTAL_API_KEY` | Yes (limited) |
| External scanner backend | Port scanning | `SCANNER_URL` + `SCANNER_KEY` | Self-hosted |

---

## Static / In-Memory Data (Zero External Calls)

| Data | Location | Notes |
|------|----------|-------|
| Live news feed registry (25+ streams) | `/api/live-news/route.ts` | YouTube/HLS URLs hardcoded |
| Conflict zones (13) | `/api/frontlines/route.ts` | Static GeoJSON-like objects |
| Maritime ports (39) + chokepoints (10) | `/api/maritime/route.ts` | Static lat/lng objects |
| Nuclear plants + infrastructure | `/api/infrastructure/route.ts` | Static list |
| OFAC SDN sanctions list | `src/lib/sanctions.ts` | Fetched from OpenSanctions once, cached 24h in memory |

---

## Data Freshness Summary

| Tier | Interval | Examples |
|------|----------|---------|
| Near-real-time | 10s | Maritime ships (AIS) |
| Fast | 45s–5 min | Flights (45s cache, 5 min poll) |
| Standard | 15–30 min | Earthquakes (15 min), news (30 min), markets (15 min) |
| Slow | 1 hour | Fires, weather events, air quality |
| Daily | 24 hours | Satellites, OFAC SDN cache |
| Static | Session | CCTV (once per session), news streams, conflict zones |

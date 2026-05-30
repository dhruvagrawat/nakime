# NAKIME — Research Notes & Ideas

This file is for tracking research, open questions, potential improvements, and things to investigate.
Update this as we work through the project.

---

## Current State (as of 2026-05-30)

- Version: V4.2
- Branch: `research` (this branch, safe to experiment)
- Prod: `master` → deployed at osirislive.app / osirisai.live

### What's Working Well
- 19-layer WebGL map with solid performance
- CCTV aggregation across 21 regions (~3000+ cameras)
- Full RECON toolkit (17 tools including OFAC SDN cross-check)
- AI analyst via Gemini 2.0 Flash
- Progressive layer loading (no wasted API calls)
- SSRF protection on all OSINT routes
- GPS jamming detection from ADS-B NACp values

### Known Issues / TODOs
- [ ] SCM panel is disabled/returns empty data (`/api/scm-suppliers`)
- [ ] `radiation` layer — `/api/radiation` endpoint exists in client polling but no route file found in `src/app/api/`
- [ ] `balloons` layer — `/api/balloons` endpoint referenced but route file not found
- [ ] Greece CCTV feeds were broken (fixed in V2 per commit history)
- [ ] Shodan sweep is client-side only (EPYC server rate limit workaround) — fragile if InternetDB changes API
- [ ] `next.config.ts` has `ignoreBuildErrors: true` — TypeScript errors won't fail CI
- [ ] In-memory caches (flight data, OFAC SDN) are per-isolate on Vercel — no shared state across instances

---

## Open Research Questions

1. **What should the SCM panel actually show?** Currently `ScmPanel.tsx` exists and `showScmPanel` state is tracked, but `/api/scm-suppliers` returns nothing useful. Was removed per V2 commit.

2. **Radiation layer** — no server route. Was it planned? What source would feed it?

3. **Balloons layer** — no server route. NOAA/Sonde data? Loon network?

4. **AIS maritime ships** — only active with `AIS_API_KEY`. Without it, what does the maritime layer show? Just static ports + chokepoints.

5. **Scanner backend** — the external scanner (`SCANNER_URL`) is self-hosted. What does it run? Custom Rust/Go TCP scanner?

6. **Telegram OSINT** — README mentions it, code not found in current file listing. Was it removed?

7. **`announce_upgrade.js`** in root — what does this do? Looks like it broadcasts to some notification channel on deploy.

---

## Potential Improvements to Research

### Data Layer Ideas
- Real-time vessel tracking without AIS key (MarineTraffic has a public embed)
- NOTAM (Notices to Air Missions) overlay — FAA/ICAO APIs
- Active hurricane/cyclone tracks — NHC API
- GDELT article geolocation heatmap (currently events only)
- Nuclear plant real-time status (IAEA PRIS)
- Protest/civil unrest events (ACLED data)

### RECON Toolkit Ideas
- Passive DNS (SecurityTrails-style) — historical DNS lookup
- Email header analysis / DMARC/SPF check
- Dark web mention search (OnionSearch API)
- Company/domain OSINT aggregation (similar to Maltego community edition)
- Reverse IP lookup (who else is on this server)

### Infrastructure / Scale
- Vercel KV for shared flight cache across isolates (resolves per-isolate cache issue)
- Redis for OFAC SDN list instead of in-memory (would survive cold starts)
- WebSocket layer for truly real-time flight positions (currently polling)
- Service worker for offline layer data caching

### UI / UX Ideas
- Timeline scrubber to replay historical event data
- Measurement tool (distance between two points on map)
- Screenshot / export current map view
- Alert subscriptions (email/push when entity enters region)
- Comparison mode (split-screen two regions)

---

## Architecture Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Per-isolate flight cache | Low-Medium | Multiple Vercel instances each fetch adsb.lol independently. Coalescing within isolate helps but global cache needs KV. |
| Client-side Shodan sweep | Medium | If InternetDB rate-limits the user's browser IP, sweep fails silently |
| `ignoreBuildErrors: true` | Medium | TypeScript errors won't be caught at build. Could mask bugs. |
| OFAC SDN 24h cache | Low | Fresh data only after restart or after 24h. Not a problem for compliance but worth noting. |
| Nominatim ToS | Low | Nominatim requires reasonable use; current 3s debounce + 0.5° grid should be compliant |
| adsb.lol rate limits | Medium | 6-region parallel fetch could hit limits; 45s cache mitigates. |

---

## Commit History Notes (from git log)

- `37c4cc4` — Phone tracking: NANP area-code geolocation + inference
- `545a63e` — V2: UI improvements, removed SCM suppliers, purged broken news, fixed Greece CCTV
- `ac0ea43` — Shodan sweep moved to client-side to bypass server rate limits
- `e005bfc` — Removed test scripts
- `8ac7692` — Fixed Next.js fetch caching that was breaking Shodan wrappers

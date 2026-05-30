# OSIRIS — Map Layers Reference

19 toggleable layers. State lives in `activeLayers` in `page.tsx`. Layers are grouped visually in `LayerPanel.tsx`.

Default ON: `maritime`, `cctv`, `live_news`, `news_intel`, `earthquakes`, `global_incidents`, `day_night`

---

## Layer Definitions

| Layer Key | Default | API Route | Poll Interval | Map Representation |
|-----------|---------|-----------|---------------|--------------------|
| `flights` | OFF | `/api/flights` | 5 min | Cyan aircraft icons, oriented by heading |
| `private` | OFF | `/api/flights` (shared) | 5 min | Green aircraft icons |
| `jets` | OFF | `/api/flights` (shared) | 5 min | Gold aircraft icons |
| `military` | OFF | `/api/flights` (shared) | 5 min | Red aircraft icons |
| `maritime` | ON | `/api/maritime` | 10 s | Blue port dots; orange chokepoints; ship icons |
| `satellites` | OFF | `/api/satellites` | none (once) | Cyan dots with orbit paths |
| `balloons` | OFF | `/api/balloons` | 5 min | White balloon icons |
| `cctv` | ON | `/api/cctv?region=all&v=2` | none (once) | Small green dots; click → CameraViewer |
| `live_news` | ON | `/api/live-news` | none (once) | Red pulsing dots; click → live stream iframe |
| `news_intel` | ON | `/api/news` | 30 min | Heatmap / clustered dots by risk score |
| `earthquakes` | ON | `/api/earthquakes` | 15 min | Circle radius = magnitude; color = depth |
| `fires` | OFF | `/api/fires` | none (once) | Orange/red hotspot dots |
| `weather` | OFF | `/api/weather` | none (once) | Yellow weather event markers |
| `radiation` | OFF | `/api/radiation` | 5 min | Cyan radiation station dots |
| `infrastructure` | OFF | `/api/infrastructure` | none (once) | Purple nuclear/grid icons |
| `global_incidents` | ON | `/api/gdelt` | none (once) | Blue incident markers |
| `war_alerts` | OFF | `/api/frontlines` (static) | none | Red conflict zone polygons + severity markers |
| `gps_jamming` | OFF | derived from `/api/flights` | 5 min | Orange heatmap overlay |
| `day_night` | ON | computed client-side | 30 s (solar terminator) | Dark fill polygon for night side |

---

## CCTV Layer — Regions

The CCTV layer loads **all regions at once** (`?region=all`) on first toggle. 21 fetchers run in parallel server-side.

| Region Key | Source | ~Camera Count |
|------------|--------|---------------|
| `uk` | Transport for London JamCams | ~900 |
| `us-west` | WSDOT Washington + Caltrans CA (9 districts) | ~500 |
| `us-east` | FL-511, Butler County OH, Cincinnati | ~800 |
| `us-central` | Illinois DOT (TravelMidwest) | ~800 |
| `canada` | 511 Ontario, Ville Montréal, Alberta 511, Ottawa curated | ~300 |
| `europe` | Netherlands RWS + ASFINAG Austria | ~300 |
| `bulgaria` | Dedicated fetcher | ~200 |
| `greece` | Dedicated fetcher | ~100 |
| `serbia` | Dedicated fetcher | ~50 |
| `macedonia` | Dedicated fetcher | ~30 |
| `turkey` | Dedicated fetcher | ~100 |
| `romania` | Dedicated fetcher | ~150 |
| `australia` | VicRoads + others | ~200 |
| `italy` | Dedicated fetcher | ~200 |
| `czechia` | Dedicated fetcher | ~100 |
| `slovakia` | Dedicated fetcher | ~80 |
| `germany` | Dedicated fetcher | ~300 |
| `france` | Dedicated fetcher | ~200 |
| `spain` | Dedicated fetcher | ~150 |
| `poland` | Dedicated fetcher | ~100 |
| `japan` | Dedicated fetcher | ~150 |
| `asia` | Singapore LTA, others | ~100 |

---

## Flight Classification Logic

Source: `src/app/api/flights/route.ts: classifyFlight()`

1. `dbFlags & 1` → military
2. Model code in `MILITARY_INDICATORS` set → military
3. Callsign matches military pattern (`RCH`, `KING`, `DUKE`, etc.) → military
4. Model code in `PRIVATE_JET_TYPES` set → jet
5. No IATA airline prefix AND model not in common airline list → private
6. Otherwise → commercial
7. `aircraft_category`: `HELI_TYPES` → helicopter; else → plane
8. GPS jamming: `nac_p ≤ 4` AND not grounded → flag; grid-aggregated to zones (min 3 aircraft)

---

## Day/Night Overlay

Computed entirely client-side via `computeSolarTerminator()` in `OsirisMap.tsx`. Uses:
- Day-of-year declination: `−23.44 × cos(2π/365 × (doy + 10))`
- Sub-solar longitude from UTC hours
- 181 longitude points sampled at 2° intervals

Recomputed every 30 seconds and pushed to a MapLibre `fill` layer.

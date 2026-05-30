# NAKIME — Architecture Overview

**Version:** V4.2  
**Stack:** Next.js 16 (App Router) · TypeScript 5 · MapLibre GL JS · Framer Motion · Tailwind CSS v4

---

## High-Level Structure

```
Browser (Client)
  └── page.tsx (Dashboard)           ← single-page app shell, all state lives here
        ├── NakimeMap (WebGL/GPU)    ← MapLibre GL, canvas-only, zero DOM elements per entity
        ├── LayerPanel               ← toggle 19 data layers
        ├── OsintPanel (RECON)       ← 17-tab OSINT toolkit
        ├── IntelFeed                ← news + threat scroll
        ├── MarketsPanel             ← crypto + space weather
        ├── ScmPanel                 ← placeholder SCM supplier panel
        ├── SearchBar                ← geocode search → flyTo
        ├── LiveAlerts               ← aggregated alert stream
        ├── CameraViewer             ← CCTV stream viewer
        ├── GlobalStatusBar          ← bottom ticker
        └── misc overlays / HUD

Next.js API Routes (/src/app/api/)
  └── 30+ server-side routes         ← data proxies, OSINT tools, AI engine
        ├── /flights                 ← ADS-B (adsb.lol)
        ├── /cctv                    ← 21-region camera aggregator
        ├── /earthquakes             ← USGS feed
        ├── /fires                   ← NASA FIRMS
        ├── /maritime                ← static ports + chokepoints + live ships
        ├── /satellites              ← N2YO TLE propagation
        ├── /live-news               ← static feed registry
        ├── /news                    ← multi-source RSS aggregation
        ├── /gdelt                   ← GDELT event feed
        ├── /weather                 ← NASA EONET events
        ├── /markets                 ← crypto + commodity prices
        ├── /space-weather           ← NOAA SWPC Kp index
        ├── /ai/analyze              ← Gemini 2.0 Flash query
        ├── /ai/briefing             ← Gemini 2.0 Flash daily briefing
        ├── /region-dossier          ← right-click country intel
        ├── /country-risk            ← country risk scoring
        ├── /scanner                 ← external scanner backend proxy
        ├── /sentinel                ← watchlist / sentinel alerts
        └── /osint/*                 ← 12 RECON sub-routes (see API_REFERENCE.md)
```

---

## Key Design Decisions

### 1. Single-Page State Machine (`page.tsx`)
All UI state (active layers, panels, fly-to target, live feed URL, region dossier, etc.) lives in the root `Dashboard` component. Child components receive props; there is no global state library (no Redux, no Zustand).

`dataRef` is a mutable ref holding the accumulated data object — it is mutated on every fetch and a `dataVersion` integer triggers re-renders only when new data arrives. This avoids re-rendering the heavy map on every polling tick.

### 2. Layer-Aware Progressive Loading
Layers default to OFF. When a layer is toggled ON for the first time `layerFetchedRef.current.add(key)` marks it fetched. Subsequent toggles do **not** refetch — data stays in `dataRef` until the page is refreshed. Layer-specific polling (e.g., maritime at 10s, flights at 5 min) only starts when that layer is active.

### 3. GPU-Only Map Rendering
`NakimeMap.tsx` uses raw `maplibre-gl` (not the react-map-gl wrapper) to avoid reconciler overhead. Every entity type (flights, satellites, CCTV dots, earthquake circles, conflict zones, etc.) is a MapLibre `GeoJSON` source + symbol/circle/fill layer. Aircraft icons and dots are rendered as `Uint8Array` pixel buffers via canvas and registered with `map.addImage()`. No DOM markers are used for entities.

### 4. SSRF Defense
Any route that takes a user-supplied host/IP for outbound requests goes through `src/lib/ssrf-guard.ts`. It validates:
- Non-canonical IPv4 forms (decimal, hex, octal) are rejected
- All RFC 1918, loopback, link-local, CGNAT, cloud-metadata ranges are blocked
- Hostnames are DNS-resolved and each answer IP is re-checked
- Redirects are followed manually and each hop is re-validated

### 5. AI Intelligence Engine (`src/lib/ai-engine.ts`)
Uses `@google/generative-ai` with `gemini-2.0-flash`. Supports round-robin key rotation across multiple `GEMINI_API_KEY_*` env vars. The system prompt gives the model a "Palantir FDE / CIA PDB analyst" persona. Context is serialized as compact plaintext (not JSON) to minimize tokens.

### 6. OFAC SDN Sanctions Cross-Check
`src/lib/sanctions.ts` holds an in-memory mirror of the OpenSanctions OFAC SDN list (~7 MB, cached 24h). Every WHOIS, IP-intel, and crypto-wallet RECON lookup automatically cross-checks against this list and surfaces a red badge if a hit is found.

---

## Data Flow (simplified)

```
User toggles layer ON
  → page.tsx fetchEndpoint('/api/<layer>')
      → Next.js Route Handler
          → stealthFetch() to external API   (or static data)
              → JSON response
          → NextResponse.json({ ... })
      → dataRef.current = { ...dataRef.current, ...newData }
      → setDataVersion(v+1)                  ← triggers re-render
  → NakimeMap receives updated `data` prop
      → GeoJSON source setData()             ← GPU re-renders affected layers
```

---

## Deployment

- **Vercel** (primary): `next build` → Edge + Serverless Functions
- **Docker**: multi-stage `node:22-alpine` standalone image (~220 MB), non-root user
- **CasaOS**: `docker-compose.yml` carries `x-casaos:` metadata for one-click install
- **GHCR**: prebuilt image at `ghcr.io/aiacos/osiris:latest`

See [OPERATIONS.md](OPERATIONS.md) for env vars and startup commands.

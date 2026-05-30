# NAKIME — Operations Guide

---

## Local Development

```bash
git clone https://github.com/simplifaisoul/osiris.git
cd osiris
npm install
cp .env.template .env     # edit as needed
npm run dev               # http://localhost:3000
```

**Turbopack** is used by default in `next dev`. TypeScript errors are ignored at build (`ignoreBuildErrors: true` in `next.config.ts`).

---

## Environment Variables

Copy `.env.template` → `.env`. Only the scanner keys are strictly required for full functionality.

| Variable | Required | Description |
|----------|----------|-------------|
| `NAKIME_PORT` | No (default: 3000) | Published host port for Docker |
| `SCANNER_URL` | For port scanner | URL of external scanner backend |
| `SCANNER_KEY` | For port scanner | Shared secret — must match backend `NAKIME_KEY` |
| `FIRMS_API_KEY` | No | NASA FIRMS fire data higher rate limits |
| `OPENSKY_CLIENT_ID` | No | OpenSky OAuth2 (since Mar 2025) |
| `OPENSKY_CLIENT_SECRET` | No | OpenSky OAuth2 |
| `N2YO_API_KEY` | No | Satellite tracking (N2YO profile → API key) |
| `AIS_API_KEY` | No | aisstream.io live maritime ship positions |
| `GEMINI_API_KEY` | No | Google Gemini — AI analyst feature |
| `GEMINI_API_KEY_1` … `_N` | No | Multiple keys for round-robin rotation |

Without `SCANNER_URL`/`SCANNER_KEY`: port scanner returns 503. All other layers work.

---

## Docker

```bash
# Build and run
cp .env.template .env
docker compose up -d

# Prebuilt GHCR image (skip build)
docker pull ghcr.io/aiacos/osiris:latest
docker run -d -p 3000:3000 --env-file .env ghcr.io/aiacos/osiris:latest

# Custom host port (container always binds 3000)
NAKIME_PORT=3005 docker compose up -d
```

See `DOCKER.md` for full CasaOS and compose documentation.

---

## Vercel Deployment

```bash
vercel deploy
```

`vercel.json` is present for edge config. The `next.config.ts` `output: 'standalone'` is required for Docker but is also fine on Vercel.

Security headers (CSP, HSTS, X-Frame-Options, etc.) are set in `next.config.ts → headers()` and apply globally.

---

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint (config in `eslint.config.mjs`) |

---

## Key Files for Operations

| File | Purpose |
|------|---------|
| `next.config.ts` | Build config, security headers, standalone output |
| `.env.template` | Template for all env vars |
| `docker-compose.yml` | Docker + CasaOS compose |
| `Dockerfile` | Multi-stage node:22-alpine build |
| `vercel.json` | Vercel edge config |
| `src/middleware.ts` | Next.js edge middleware (request filtering) |
| `public/manifest.json` | PWA manifest |
| `public/robots.txt` | Search engine directives |
| `public/sitemap.xml` | Sitemap |

---

## Performance Notes

- **75% reduction in edge requests** vs initial release (per README)
- Core feeds polled at 15–30 min intervals (earthquakes 15 min, news 30 min, markets 15 min)
- Layer data fetched only once on first toggle (`layerFetchedRef` prevents re-fetch)
- Flight data: 45s in-memory cache, 6-region parallel fetch, dedup by ICAO hex
- CCTV: loaded once per session, cached server-side 5 min (`s-maxage=300`)
- Geocode cache: 500-entry LRU, 0.5° grid resolution, 3s debounce
- `document.hidden` check in `fetchEndpoint` — no API calls when tab is in background

---

## Utility Scripts (root)

| Script | Purpose |
|--------|---------|
| `generate_countries.js` | Regenerates country data JSON |
| `generate_region_map.js` | Regenerates region mapping data |
| `announce_upgrade.js` | Broadcast upgrade announcement |

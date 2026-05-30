# NAKIME — Component Reference

All components live in `src/components/`. They are all client-side (`'use client'`).

---

## Core Layout

### `NakimeMap.tsx`
The GPU-rendered map. Uses raw `maplibre-gl` (not the react-map-gl abstraction).

**Props:**
- `data` — accumulated data object from `dataRef.current`
- `activeLayers` — which layers to render
- `projection` — `'globe'` | `'mercator'`
- `mapStyle` — `'dark'` (CartoCDN dark-matter) or satellite tile URL
- `onEntityClick(entity)` — fires when user clicks a map entity
- `onMouseCoords(coords)` — fires on mouse move (used for coordinates HUD)
- `onRightClick(coords)` — fires on right-click (triggers region dossier)
- `onViewStateChange(vs)` — fires on zoom/pan
- `flyToLocation` — `{ lat, lng, ts }` — changes trigger `map.flyTo()`
- `sweepData` — IP sweep visualization overlay
- `scanTargets` — geolocated scan results

**How rendering works:**
1. On mount: `new maplibregl.Map(...)` with CartoCDN dark-matter base style
2. Each entity type gets a GeoJSON source + layer pair
3. `useEffect` on `data` / `activeLayers` calls `source.setData(featureCollection)` to update
4. Aircraft icons are canvas-drawn `Uint8Array` pixel buffers added via `map.addImage()`
5. Popup on entity click uses `new maplibregl.Popup()`
6. Day/night: `computeSolarTerminator()` → GeoJSON fill polygon, recomputed every 30s

---

## Left HUD Components

### `LayerPanel.tsx`
Renders the 19 layer toggles. Groups layers visually (Aviation, Maritime, Intelligence, etc.).
Props: `data`, `activeLayers`, `setActiveLayers`.

### `IntelFeed.tsx`
Scrollable news + threat events feed. Shows risk-scored news items with locate buttons.
Props: `data`, `onLocate(lat, lng)`.

### `MarketsPanel.tsx`
Crypto prices (BTC/ETH), space weather Kp gauge, commodity prices.
Props: `data`, `spaceWeather`.

### `ScmPanel.tsx`
SCM supplier intelligence panel (currently disabled/empty data).
Props: `data`.

### `ViewPresets.tsx`
Quick-nav buttons to fly to specific regions (Middle East, Ukraine, Taiwan Strait, etc.).
Props: `onNavigate(lat, lng, zoom)`.

---

## Right HUD Components

### `SearchBar.tsx`
Geocode search using Nominatim (`nominatim.openstreetmap.org`). Debounced 400ms.
Props: `onLocate(lat, lng)`.

### `OsintPanel.tsx`
17-tab RECON toolkit. Manages its own tab state, query input, results, history.
Props: `isOpen`, `onClose`, `isMobile`, `onSweepVisualize(data)`, `onScanGeolocate(target, data)`.

Tabs: PORT SCAN, VULN SWEEP, DNS, WHOIS, CERTS, THREATS, HEADERS, SSL/TLS, SUBDOMAINS, TECH DETECT, SHODAN IOT, BGP ROUTE, MAC ADDR, PHONE INTEL, DATA LEAKS, GITHUB RECON, IP SWEEP

### `LiveAlerts.tsx`
Aggregated real-time alert stream from earthquakes, news, threats.
Props: `data`, `onLocate(lat, lng)`, `onWatchFeed(url, name)`.

### `SharePanel.tsx`
Generates a shareable URL encoding current map view (lat/lon/zoom) and active layers as query params.
Props: `mapView`, `activeLayers`, `mouseCoords`.

---

## Overlay Components

### `CameraViewer.tsx`
Full-screen CCTV camera viewer. Shows still image feed (auto-refreshes every 5s) or links to stream.
Props: `camera`, `onClose`, `onLocate(lat, lng)`.

Camera object shape:
```ts
{
  id: string, lat: number, lng: number,
  name: string, city: string, country: string,
  feed_url: string,           // direct image/stream URL
  external_url?: string,      // fallback external link
  source: string,
}
```

### `AiAnalyst.tsx`
AI intelligence analyst panel. Query mode + briefing mode.
Assembles context from `data` prop and POSTs to `/api/ai/analyze` or `/api/ai/briefing`.

### `GlobalStatusBar.tsx`
Ticker bar at the bottom. Cycles through live status items (earthquake alerts, news headlines, etc.).

### `ErrorBoundary.tsx`
React error boundary wrapping the map. Shows a "Map failed to load" fallback if MapLibre crashes.
Props: `name` (for error reporting context).

### `KeyboardShortcuts.tsx`
`?` key toggles a shortcuts overlay. Lists all keyboard bindings.

### `ScaleBar.tsx`
Physical distance scale bar. Computes real-world km/miles from zoom + latitude.
Props: `zoom`, `latitude`.

---

## Utility Hooks (in `page.tsx`)

| Hook / Util | Purpose |
|-------------|---------|
| `useIsMobile()` | Detects mobile/tablet viewport; enables bottom nav drawer |
| `UptimeClock` | Session uptime counter (HH:MM:SS) |
| `ZuluClock` | Live UTC time display |
| `ActiveEntityCount` | Counts total loaded entities across all data arrays |
| `getYouTubeWatchUrl()` | Extracts a watchable URL from embed/channel URLs |

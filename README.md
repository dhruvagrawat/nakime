<div align="center">

# ⬡ NAKIME VOLT

### Enterprise Cybersecurity Monitoring Platform

[![GitHub Stars](https://img.shields.io/github/stars/dhruvagrawat/nakime?style=for-the-badge&color=D4AF37)](https://github.com/dhruvagrawat/nakime/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-GPU_Rendered-396CB2?style=for-the-badge)](https://maplibre.org)

**A self-hosted, GPU-accelerated enterprise security operations dashboard. Aggregates Wazuh SIEM, Suricata IDS, network traffic analytics, personnel presence, and physical asset tracking into a single real-time interface — deployable in minutes via Docker.**

[Quick Start](#quick-start) · [Features](#features) · [Architecture](#architecture) · [Configuration](#configuration) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

</div>

---

## What Is NAKIME VOLT?

NAKIME VOLT is an open-source **Security Operations Centre (SOC) dashboard** designed for organisations managing distributed physical and digital infrastructure. It provides a single pane of glass across:

- **Cyber threats** — Wazuh SIEM alerts, Suricata network intrusion events
- **Infrastructure health** — live HTTP probe monitoring of all security tools
- **Physical assets** — GPS-mapped ports, airports, power plants, offices, and data centres on a WebGL globe
- **Personnel presence** — real-time office occupancy with 2D SVG floor plans per floor
- **Camera feeds** — CCTV integration per facility, viewable directly in the dashboard
- **Threat intelligence** — live CVE feed from CISA KEV / NVD

Everything runs **on-premise**. No data leaves your network. No cloud dependency required.

---

## Features

### Security Operations

| Feature | Description |
|---------|-------------|
| **Unified Alert Feed** | Wazuh + Suricata alerts normalised, severity-sorted, 10s polling |
| **Alert Detail Popup** | Full event breakdown — src/dst IP, protocol, agent, groups, recommended response actions |
| **Severity Filtering** | Critical / High / Medium / Low filter with live counts |
| **System Health Monitor** | HTTP probe grid — configurable service list, latency display, 30s auto-refresh |
| **CVE Threat Intel** | CISA KEV feed with vendor, product, due date, NVD links |

### Asset & Facility Management

| Feature | Description |
|---------|-------------|
| **Interactive Globe** | GPU-rendered WebGL map — 3D globe and 2D mercator modes |
| **Asset Browser** | Global / India / International tabs, 9 asset-type filters, country grouping, search |
| **Asset Detail Modal** | Click any map marker — facility info, cameras, staff count, floor plans for offices |
| **Office Floor Plans** | SVG floor plans with real-time employee dots, camera icons, room colour coding |
| **Office Focus Modal** | Full-screen floor plan: large SVG, floor tabs, camera list (click to open feed), full personnel roster |
| **Fly-to Navigation** | Click any asset, office tab, or alert → map flies to that location |

### Dashboard & UX

| Feature | Description |
|---------|-------------|
| **Collapsible Panels** | Every section collapses to a title bar — reclaim screen space instantly |
| **Dashboard Customiser** | Gear icon → right slide-out with panel toggles, map layer switches, quick presets |
| **4 View Presets** | FULL VIEW · SECURITY OPS · EXECUTIVE · MINIMAL |
| **Camera Viewer** | In-dashboard CCTV viewer accessible from any asset modal or floor plan |
| **Keyboard Shortcuts** | `F` fullscreen · `G` globe/2D toggle · `R` reset view |
| **Mobile Responsive** | Bottom-nav drawer layout for tablet and phone |

### Deployment

| Feature | Description |
|---------|-------------|
| **Docker Compose** | `docker compose up -d` brings up both services |
| **Sample Data Mode** | `USE_SAMPLE_DATA=true` — full realistic demo without any real security tools |
| **Zero Cloud Deps** | Fully air-gapped deployment possible |
| **EC2 / VPS Ready** | Tested on AWS t3.medium, Ubuntu 24.04 LTS |
| **CasaOS Compatible** | One-click install via CasaOS app store metadata |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       BROWSER CLIENT                         │
│                                                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  MapLibre GL     │  │  Left Panel  │  │ Right Panel  │  │
│  │  WebGL Globe     │  │  • Assets    │  │ • Security   │  │
│  │  Asset Markers   │  │  • Offices   │  │ • Operations │  │
│  │  Click Handlers  │  │  • Layers    │  │ • Intel      │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────┬────────────────────────────────┘
                              │  fetch / polling
┌─────────────────────────────▼────────────────────────────────┐
│                   NEXT.JS 16 APP SERVER                       │
│                                                              │
│  /api/volt/alerts    → aggregates Wazuh + Suricata           │
│  /api/volt/agents    → Wazuh agent roster + counts           │
│  /api/volt/health    → async HTTP probe runner               │
│  /api/volt/employees → in-memory personnel presence store    │
│  /api/volt/traffic   → ntopng throughput + top talkers       │
│  /api/cyber-threats  → CISA KEV + NVD CVE feed               │
└─────────────────────────────┬────────────────────────────────┘
                              │  HTTP (internal Docker bridge)
┌─────────────────────────────▼────────────────────────────────┐
│               VOLT-SERVER  (Python FastAPI)                   │
│                                                              │
│  wazuh.py      — JWT auth cache → /agents /alerts /stats     │
│  suricata.py   — tails eve.json → alert / stats / flow       │
│  health.py     — async httpx probe per service               │
│  employees.py  — in-memory presence store, auto-seed         │
│  ntopng.py     — ntopng REST v2 proxy                        │
│  splunk.py     — Splunk search job proxy                     │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack), TypeScript 5, Tailwind CSS v4 |
| Map | MapLibre GL JS — WebGL GPU rendering |
| Animations | Framer Motion |
| Backend | Python 3.12, FastAPI, uvicorn |
| Security integrations | Wazuh SIEM, Suricata IDS, ntopng, Splunk |
| Containerisation | Docker, Docker Compose v2 |
| Deployment targets | AWS EC2, bare-metal VPS, CasaOS |

---

## Quick Start

### Option A — Docker Compose (recommended)

```bash
# 1. Clone the repository
git clone https://github.com/dhruvagrawat/nakime.git
cd nakime
git checkout volt

# 2. Start with sample data (no real security tools required)
docker compose up -d

# 3. Open the dashboard
open http://localhost:3000
```

> **First build:** ~3 minutes (compiles Next.js). Subsequent starts use Docker layer cache and take ~10 seconds.

### Option B — Local Development

```bash
# Terminal 1 — Frontend
npm install
npm run dev
# http://localhost:3000

# Terminal 2 — Backend
cd volt-server
pip install -r requirements.txt
USE_SAMPLE_DATA=true uvicorn main:app --reload --port 8000
```

---

## Configuration

Copy the environment template and fill in what applies to your setup:

```bash
cp .env.template .env
# edit .env
```

### volt-server variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_SAMPLE_DATA` | `true` | Return demo data — no real tools needed |
| `WAZUH_URL` | — | `https://your-wazuh-manager:55000` |
| `WAZUH_USER` | — | Wazuh API username |
| `WAZUH_PASS` | — | Wazuh API password |
| `SURICATA_EVE_PATH` | `/var/log/suricata/eve.json` | Path to Suricata EVE JSON |
| `NTOPNG_URL` | — | `http://your-ntopng:3000` |
| `NTOPNG_USER` | `admin` | ntopng username |
| `NTOPNG_PASS` | — | ntopng password |
| `SPLUNK_URL` | — | Splunk base URL |
| `SPLUNK_TOKEN` | — | Splunk bearer token |

### Connecting real security tools

**Wazuh** — set `WAZUH_URL`, credentials, and `USE_SAMPLE_DATA=false`.

**Suricata** — uncomment the volume mount in `docker-compose.yml`:
```yaml
volumes:
  - /var/log/suricata/eve.json:/var/log/suricata/eve.json:ro
```

---

## Customising for Your Organisation

### Assets (map markers)

Edit [`src/data/adani-assets.ts`](src/data/adani-assets.ts) — replace the 32 sample assets with your organisation's facilities:

```typescript
export const MY_ASSETS: AdaniAsset[] = [
  {
    id: 'hq-london',
    name: 'London Headquarters',
    short: 'LON HQ',
    type: 'hq',
    region: 'international',
    country: 'United Kingdom',
    city: 'London',
    lat: 51.5074, lng: -0.1278,
    status: 'operational',
    cameras: [
      { id: 'lon-cam-1', name: 'Main Entrance', status: 'online' },
    ],
  },
];
```

### Floor plans

Edit [`src/data/offices.ts`](src/data/offices.ts) — define rooms as rectangles in a 400×280 SVG coordinate space:

```typescript
{ id: 'room-1', name: 'Reception', x: 0, y: 0, w: 200, h: 60, type: 'reception' }
```

---

## Deploying to AWS EC2

**Recommended:** t3.medium (2 vCPU, 4 GB RAM), Ubuntu 24.04 LTS, 30 GB gp3 volume.

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# Deploy
git clone https://github.com/dhruvagrawat/nakime.git
cd nakime && git checkout volt
sudo docker compose up -d --build
```

Open inbound ports `3000` (dashboard) and optionally `8000` (API) in your EC2 security group.

**Update to latest:**
```bash
cd ~/nakime && git pull && sudo docker compose up -d --build
```

---

## Roadmap

- [ ] Role-based access control (RBAC) — analyst / operator / admin roles
- [ ] Alert acknowledgement and ticketing integration
- [ ] Wazuh active response trigger from dashboard
- [ ] Webhook outbound — Slack, PagerDuty, Microsoft Teams
- [ ] MITRE ATT&CK mapping on alert detail view
- [ ] Multi-tenancy — multiple organisations in one instance
- [ ] Grafana panel embedding
- [ ] Mobile app (React Native)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions welcome — bug fixes, new integrations, UI improvements, and documentation.

---

## Security

To report a security vulnerability, see [SECURITY.md](SECURITY.md). Please do not open public GitHub issues for security vulnerabilities.

---

## License

MIT — see [LICENSE](LICENSE). Free for commercial and non-commercial use. Attribution appreciated but not required.

---

<div align="center">

Built by [Dhruv Agrawal](https://github.com/dhruvagrawat) &nbsp;·&nbsp; [Report a Bug](https://github.com/dhruvagrawat/nakime/issues) &nbsp;·&nbsp; [Request a Feature](https://github.com/dhruvagrawat/nakime/issues)

</div>

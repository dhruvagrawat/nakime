# NAKIME VOLT — Business Presentation

> **For:** Enterprise IT / Cybersecurity leadership, infrastructure teams, open-source evaluators
> **Format:** Markdown pitch deck — each `---` is a slide break

---

## Slide 1 — The Problem

### Enterprise security is fragmented

Large organisations operate across dozens of tools, locations, and teams — with no unified view.

| Pain Point | Reality Today |
|------------|---------------|
| Alert overload | Wazuh, Suricata, Splunk — three different UIs, three dashboards, three logins |
| Blind spots | Physical assets (ports, plants, offices) aren't in any cyber dashboard |
| Response latency | By the time an analyst correlates an alert across tools, the window has closed |
| Data leaving the network | SaaS SOC tools mean your threat data lives on someone else's server |
| Visibility gaps | No single view of "who is where" + "what is happening on the network" simultaneously |

---

## Slide 2 — The Solution

### NAKIME VOLT: One dashboard. Everything.

```
  Wazuh Alerts  +  Suricata IDS  +  Network Traffic
       +  Physical Assets  +  Personnel Presence
              +  CCTV Feeds  +  Threat Intel
                       ↓
            One GPU-rendered, self-hosted
            security operations dashboard
```

**Open source. Self-hosted. Zero data egress.**

---

## Slide 3 — What It Does

### Live Demo Walkthrough

1. **Globe view** — all 32 facilities plotted on a WebGL 3D globe. Click any marker to open full facility detail.

2. **Security tab** — unified Wazuh + Suricata alert feed. Click any alert → full detail popup with recommended response actions.

3. **Office floor plan** — click the `⤢` expand button on any office → full-screen SVG floor plan with live employee positions and camera icons.

4. **Collapsible panels** — collapse sections you don't need. Four one-click presets: FULL VIEW, SECURITY OPS, EXECUTIVE, MINIMAL.

5. **Camera viewer** — click any camera in a floor plan or facility modal → opens live feed overlay.

---

## Slide 4 — Architecture

### Designed for enterprise on-premise deployment

```
Browser
  │
  ├── MapLibre GL (WebGL, GPU)      ← renders 32+ asset markers at 60fps
  ├── Next.js 16 (App Router)       ← single-page dashboard, SSR API routes
  └── Framer Motion                 ← smooth panel transitions
       │
  Next.js API Routes (proxy layer)
       │
  FastAPI (volt-server, Python)
       ├── Wazuh SIEM  (JWT auth)
       ├── Suricata IDS (EVE JSON tail)
       ├── ntopng       (REST v2)
       └── Splunk       (search jobs)
```

**No external services.** No analytics. No telemetry sent anywhere.

---

## Slide 5 — Deployment

### From git clone to running dashboard in under 5 minutes

```bash
git clone https://github.com/dhruvagrawat/nakime.git
cd nakime && git checkout volt
docker compose up -d
# → http://localhost:3000
```

| Environment | Recommended Spec | Cost estimate |
|-------------|-----------------|---------------|
| Laptop / desktop | Any modern machine | Free |
| AWS EC2 | t3.medium (2 vCPU, 4 GB) | ~$30/month |
| Bare-metal server | 4 GB RAM, 20 GB disk | Existing hardware |
| Raspberry Pi 5 | 8 GB model | ~$80 one-time |

**Sample data mode** (`USE_SAMPLE_DATA=true`) — runs full demo with realistic alerts, agents, employees, health results. No Wazuh or Suricata needed to evaluate.

---

## Slide 6 — Integrations

### Connect your existing security stack

| Tool | Status | Notes |
|------|--------|-------|
| **Wazuh SIEM** | ✅ Supported | JWT auth, agents + alerts + vulnerabilities |
| **Suricata IDS** | ✅ Supported | EVE JSON log tail, alert/stats/flow events |
| **ntopng** | ✅ Supported | REST v2 proxy, throughput + top talkers |
| **Splunk** | ✅ Supported | Search job API, bearer token auth |
| **CISA KEV / NVD** | ✅ Built-in | CVE feed, no key required |
| **Elasticsearch** | 🔜 Roadmap | Direct index queries |
| **Grafana** | 🔜 Roadmap | Panel embedding |
| **PagerDuty / Slack** | 🔜 Roadmap | Alert webhook outbound |

---

## Slide 7 — Customisation

### Your assets. Your floor plans. Your branding.

**Asset data** — one TypeScript file defines all your facilities:
- Name, location (lat/lng), type, status
- Camera list per facility
- Employee count, capacity, established date

**Floor plans** — SVG room layout in 400×280 coordinate space:
- Room type determines colour (reception, office, server room, meeting)
- Employee dots auto-placed by room assignment
- Camera icons rendered per room

**Dashboard config** — users can toggle panels, map layers, and choose from 4 presets. Config is per-session (no database needed).

---

## Slide 8 — Security & Compliance

### Built for security-conscious organisations

| Concern | How NAKIME handles it |
|---------|----------------------|
| **Data sovereignty** | Entirely self-hosted — no data sent outside your network |
| **Credentials** | All secrets in `.env` file, never committed (`.gitignore` enforced) |
| **API auth** | JWT token caching for Wazuh, bearer tokens for Splunk |
| **Transport** | Internal Docker bridge network — volt-server not exposed to public internet by default |
| **Audit trail** | All alert data flows from your existing SIEM — NAKIME is read-only |
| **Open source** | Full source available — security audit the code yourself |

---

## Slide 9 — Open Source Model

### MIT licensed — free for commercial use

```
MIT License
Copyright (c) 2026 Dhruv Agrawal

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software... including without limitation
the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software...
```

**What this means for your organisation:**

- ✅ Deploy internally — no licence fee
- ✅ Modify for your use case — no restriction
- ✅ White-label or rebrand — allowed
- ✅ Integrate with commercial products — allowed
- ✅ No vendor lock-in — you own your deployment

**Contribution welcome** — bug fixes, new integrations, UI improvements all accepted via GitHub PR.

---

## Slide 10 — Roadmap

### Near-term (3–6 months)

- **RBAC** — analyst / operator / admin role separation with login
- **Alert acknowledgement** — mark alerts reviewed, assign to analyst
- **Webhook outbound** — push critical alerts to Slack, PagerDuty, Teams
- **MITRE ATT&CK mapping** — classify alerts by technique on detail popup

### Medium-term (6–12 months)

- **Multi-tenancy** — host multiple organisations in one instance
- **Grafana embedding** — pull existing Grafana panels into Operations tab
- **Elasticsearch direct** — native Elasticsearch/OpenSearch queries
- **Mobile app** — React Native wrapper for on-the-go SOC access

---

## Slide 11 — Getting Started

### Three paths forward

**1. Evaluate now (5 minutes)**
```bash
git clone https://github.com/dhruvagrawat/nakime.git
cd nakime && git checkout volt && docker compose up -d
```
Full demo with sample data — no real tools needed.

**2. Pilot with real tools (1 day)**
- Deploy on a VM or EC2 instance
- Connect your Wazuh manager (URL + credentials)
- Mount Suricata eve.json log
- Set `USE_SAMPLE_DATA=false`

**3. Customise for your organisation (1 week)**
- Replace asset data with your facilities
- Draw SVG floor plans for key offices
- Configure employee data source
- Add your logo and branding

---

## Slide 12 — Contact & Links

| Resource | Link |
|----------|------|
| GitHub | [github.com/dhruvagrawat/nakime](https://github.com/dhruvagrawat/nakime) |
| Issues / Feature requests | [github.com/dhruvagrawat/nakime/issues](https://github.com/dhruvagrawat/nakime/issues) |
| Security reports | See [SECURITY.md](SECURITY.md) |
| Contributing | See [CONTRIBUTING.md](CONTRIBUTING.md) |
| Author | [Dhruv Agrawal](https://github.com/dhruvagrawat) |

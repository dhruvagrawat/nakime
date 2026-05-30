# NAKIME Volt — Enterprise Cybersecurity Platform

Branch: `volt` — built on top of the `research` / Nakime base.

Volt adds a full cybersecurity operations layer: Wazuh SIEM, Suricata IDS,
ntopng traffic analysis, Splunk integration, employee presence tracking,
and system health monitoring — all on the existing GPU-accelerated map.

---

## Quick Start (Docker — both services)

```bash
git checkout volt

# Build and start everything (uses sample data by default)
docker compose up -d --build

# Open the dashboard
open http://localhost:3000
```

Both containers start automatically:
- **nakime** (Next.js) → `http://localhost:3000`
- **volt-server** (Python FastAPI) → `http://localhost:8000`
- API docs (Swagger UI) → `http://localhost:8000/docs`

Switch to the **VOLT ENTERPRISE** tab in the right panel to see all security dashboards.

---

## Accessing the Volt Panels

The right panel has a **RECON / VOLT ENTERPRISE** tab switcher at the top.

| Tab | What you see |
|-----|-------------|
| **RECON** | OSINT toolkit (17 tools), Live Alerts — original Nakime behaviour |
| **VOLT ENTERPRISE** | Security Alerts, System Health, Personnel, Network Traffic |

A red pulse dot appears on the VOLT tab whenever there are critical or high-severity alerts.

### Panel breakdown

| Panel | Data source | Refresh |
|-------|------------|---------|
| **SECURITY ALERTS** | Wazuh + Suricata unified feed | 10 s |
| **SYSTEM HEALTH** | HTTP probe on any service list | 30 s |
| **PERSONNEL** | Employee check-in/out (in-memory) | 15 s |
| **NETWORK TRAFFIC** | ntopng throughput + Suricata stats | 15 s |

---

## Architecture

```
Browser ──► Next.js (port 3000)
               │
               ├── /api/volt/alerts    ──►  volt-server /wazuh/alerts
               │                            volt-server /suricata/alerts
               │
               ├── /api/volt/agents    ──►  volt-server /wazuh/agents
               │
               ├── /api/volt/health    ──►  volt-server /health/check
               │
               ├── /api/volt/employees ──►  volt-server /employees/presence
               │
               └── /api/volt/traffic   ──►  volt-server /ntopng/stats
                                            volt-server /suricata/stats

volt-server (FastAPI, port 8000)
               │
               ├── Wazuh Manager      (HTTPS :55000)
               ├── Suricata           (eve.json file / Redis)
               ├── ntopng             (HTTP :3000)
               └── Splunk             (HTTPS :8089)
```

---

## Configuration

### Sample / demo mode (default)

`USE_SAMPLE_DATA=true` in `docker-compose.yml` means volt-server returns
realistic fake data with no real tools required. 8 agents, real-looking
alerts, 8 employees, traffic stats — all immediately visible.

### Connecting real tools

Edit `volt-server/.env` (copy from `volt-server/.env.template`):

```env
# Wazuh
WAZUH_URL=https://your-wazuh-manager:55000
WAZUH_USER=wazuh-wui
WAZUH_PASS=your_password
WAZUH_VERIFY_SSL=false   # set true if you have a trusted TLS cert

# Suricata — two options:
# Option A: mount eve.json (uncomment volumes block in docker-compose.yml)
SURICATA_EVE_PATH=/var/log/suricata/eve.json
# Option B: point directly at the file on the volt-server host

# ntopng
NTOPNG_URL=http://your-ntopng:3000
NTOPNG_USER=admin
NTOPNG_PASS=your_password

# Splunk (optional)
SPLUNK_URL=https://your-splunk:8089
SPLUNK_TOKEN=your_api_token

# Disable sample data when real tools are configured
USE_SAMPLE_DATA=false
```

Then rebuild: `docker compose up -d --build volt-server`

---

## volt-server API Reference

Base URL: `http://localhost:8000` — Swagger UI at `/docs`

### Wazuh

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wazuh/agents` | Agent list with status, OS, last_seen |
| GET | `/wazuh/alerts?limit=50` | Recent security alerts |
| GET | `/wazuh/summary` | Agent count by status |
| GET | `/wazuh/stats` | Manager stats |
| GET | `/wazuh/vulnerabilities/{agent_id}` | CVEs per agent |

### Suricata

| Method | Path | Description |
|--------|------|-------------|
| GET | `/suricata/alerts?limit=100` | IDS alerts from eve.json |
| GET | `/suricata/stats` | Engine stats (uptime, packet drops, alert count) |
| GET | `/suricata/flows?limit=50` | Recent network flows |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health/ping` | Volt-server liveness probe |
| POST | `/health/check` | Check a list of services (body: `[{name, url, method}]`) |

### Employees

| Method | Path | Description |
|--------|------|-------------|
| GET | `/employees/presence` | All employees with current status |
| POST | `/employees/checkin` | Check in an employee |
| POST | `/employees/checkout/{id}` | Check out an employee |
| PUT | `/employees/status/{id}?status=away` | Update status only |
| DELETE | `/employees/{id}` | Remove employee record |

### ntopng

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ntopng/stats?ifid=0` | Interface throughput and flow counts |
| GET | `/ntopng/top-hosts?limit=20` | Top bandwidth consumers |
| GET | `/ntopng/flows?limit=50` | Active flows |
| GET | `/ntopng/interfaces` | Available interfaces |

### Splunk

| Method | Path | Description |
|--------|------|-------------|
| GET | `/splunk/search?q=index%3Dmain` | Run an SPL search |
| GET | `/splunk/notable-events?limit=50` | Splunk ES notable events |

---

## Connecting Suricata (live eve.json)

If Suricata runs on the same Docker host:

```yaml
# In docker-compose.yml, under volt-server:
volumes:
  - /var/log/suricata/eve.json:/var/log/suricata/eve.json:ro
environment:
  - USE_SAMPLE_DATA=false
  - SURICATA_EVE_PATH=/var/log/suricata/eve.json
```

If Suricata runs on a different host, forward its eve.json via:
- **Redis**: set `output.redis` in `suricata.yaml`, then read from Redis (TODO: Redis router)
- **Filebeat → Elasticsearch**: query ES at `:9200`

---

## Running without Docker

```bash
# Terminal 1 — Python backend
cd volt-server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
USE_SAMPLE_DATA=true uvicorn main:app --port 8000 --reload

# Terminal 2 — Next.js frontend
VOLT_SERVER_URL=http://localhost:8000 npm run dev
```

---

## Adding more tools

The pattern for any new integration is:

1. Add a new router in `volt-server/routers/your_tool.py`
2. Register it in `volt-server/main.py` with a prefix
3. Add a Next.js proxy at `src/app/api/volt/your-tool/route.ts`
4. Add sample data to `volt-server/sample_data.py`
5. Consume the route in a new component or an existing panel

---

## Roadmap / Open Items

- [ ] Persistent employee store (SQLite / Postgres)
- [ ] Redis-backed Suricata live stream (bypass eve.json file access)
- [ ] Wazuh webhook → push new alerts in real time (replace polling)
- [ ] Employee layer on map (circle markers at lat/lng)
- [ ] Wazuh agent dots on world map (geolocate agent IPs via ip-api.com)
- [ ] Splunk dashboard tiles (alert trends, top sources)
- [ ] Active Directory / LDAP import for employee roster
- [ ] Role-based panel visibility (SOC vs management vs exec view)

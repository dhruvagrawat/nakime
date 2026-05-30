# NAKIME — RECON / OSINT Toolkit

The RECON toolkit lives in `src/components/OsintPanel.tsx` and calls `src/app/api/osint/*` routes.

Desktop: right panel, always visible. Mobile: bottom drawer, `RECON` tab.

---

## Tabs

### PORT SCAN (`scanner`)
- Input: IP or hostname
- Scan types: Quick (common ports), Full (top 1000), Stealth
- Backend: proxied to external `SCANNER_URL` via `/api/scanner`
- Returns: open ports, detected services, banners
- Requires `SCANNER_URL` + `SCANNER_KEY` env vars or returns 503

### VULN SWEEP (`vuln`)
- Input: IP or hostname
- Uses Shodan InternetDB (`/api/osint/shodan`) for passive port/CVE data
- Client-side IP subnet sweep via `/api/osint/sweep` for geolocation init
- Full subnet devices loaded client-side from Shodan InternetDB to bypass rate limits
- CIDR selector: /24 to /32

### DNS (`dns`)
- Input: domain name
- Returns: A, AAAA, MX, NS, TXT, CNAME records via Node `dns/promises`
- Server-side resolution (bypasses client DNS)

### WHOIS (`whois`)
- Input: domain name
- Source: rdap.org RDAP protocol
- Registrant name auto cross-checked against OFAC SDN list
- Shows: registrar, dates, nameservers, registrant info, sanctions flag

### CERTS (`certs`)
- Input: domain name
- Source: crt.sh Certificate Transparency logs
- Returns: all issued certs, SANs, issuer, validity dates
- Useful for subdomain discovery

### THREATS (`threats`)
- Input: IP, domain, or file hash
- Sources: VirusTotal, AbuseIPDB, OTX AlienVault (keys optional)
- Returns: detection count, categories, last seen, community score

### HEADERS (`headers`)
- Input: URL
- Returns: HTTP response headers via `safeFetch()` (SSRF-guarded)
- Security headers analysis (CSP, HSTS, X-Frame-Options, etc.)

### SSL/TLS (`ssl`)
- Input: domain name
- Returns: cert chain, cipher suites, protocol versions, expiry
- Grade assessment (A/B/C/F style)

### SUBDOMAINS (`subdomains`)
- Input: domain
- Source: crt.sh + brute-force DNS resolution of common prefixes
- Returns: live subdomains with resolved IPs

### TECH DETECT (`tech`)
- Input: URL
- Returns: detected technologies (CMS, frameworks, analytics, CDN)
- Based on HTTP headers + HTML fingerprinting

### SHODAN IOT (`shodan`)
- Input: IP address
- Source: Shodan InternetDB (keyless, public API)
- Returns: open ports, hostnames, CPEs, CVE list
- **Note**: fetched client-side to avoid EPYC server-side rate limits

### BGP ROUTE (`bgp`)
- Input: IP or ASN
- Source: bgpview.io
- Returns: ASN info, prefix, announcing ISP, upstream peers, IXP presence

### MAC ADDR (`mac`)
- Input: MAC address (any delimiter format)
- Source: maclookup.app
- Returns: OUI vendor, device type, country of manufacturer

### PHONE INTEL (`phone`)
- Input: Phone number in E.164 format (e.g. `+1 415 555 0100`)
- Library: `google-libphonenumber`
- Returns: carrier, country, number type (mobile/landline/VOIP), NANP area-code geolocation
- US/CA numbers: maps area code to city/state/region

### DATA LEAKS (`leaks`)
- Input: email address
- Source: HaveIBeenPwned (proxied via `/api/osint/leaks`)
- Returns: breach list, breach dates, data types exposed

### GITHUB RECON (`github`)
- Input: GitHub username
- Source: GitHub public API (no auth)
- Returns: profile, public repos, language breakdown, recent commits, org memberships, gists

### IP SWEEP (`sweep`)
- Input: IP address (seed)
- CIDR: /24 to /32 (selector in panel)
- Phase 1: server-side geolocation of seed IP via `ip-api.com`
- Phase 2: client-side Shodan InternetDB sweep of the subnet
- Results visualized on map (geolocated to seed IP region)
- Rate limited: 5 requests / 60s

---

## Sanctions Search (standalone tab)

- Full-text search across OFAC SDN persons, organizations, vessels, aircraft
- Source: OpenSanctions (CC-BY 4.0) — ~7 MB, cached in-memory 24h
- Auto cross-check is built into WHOIS, IP lookup, and crypto wallet routes

---

## AI Analyst (`AiAnalyst.tsx`)

- Separate panel component (accessible from HUD)
- Two modes:
  - **Query**: ask ad-hoc intelligence questions (`/api/ai/analyze`)
  - **Briefing**: generate a full 8-section daily intelligence brief (`/api/ai/briefing`)
- Context automatically assembled from live `data` prop (earthquakes, news, threats, cyber alerts)
- Model: Gemini 2.0 Flash via `src/lib/ai-engine.ts`
- Persona: "Palantir FDE / CIA PDB analyst" — outputs BLUF, confidence levels, RECOMMENDED ACTIONS

---

## Security Controls on RECON Routes

- **SSRF guard**: all routes that take user-supplied host/IP use `validateHost()` or `safeFetch()` from `src/lib/ssrf-guard.ts`
- **Rate limiting**: per-client-IP, in-memory, per-isolate
  - Default: 20 requests / 60s
  - Sweep: 5 requests / 60s (tighter — subnet scan is heavy)
- **Input validation**: IPv4 format, CIDR range (24–32 only), hostname regex
- **Private range blocking**: RFC1918, loopback, link-local, CGNAT, cloud metadata all blocked

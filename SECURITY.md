# Security Policy

## Supported Versions

| Branch | Supported |
|--------|-----------|
| `volt` (latest) | ✅ Active |
| `master` | ✅ Active |
| `research` | ❌ Archived |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

To report a security vulnerability, email:

**dhruvagrawat9@gmail.com**

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

You will receive an acknowledgement within **48 hours** and a resolution timeline within **7 days**.

---

## Security Considerations for Self-Hosting

### Credentials
- All secrets go in `.env` — the `.gitignore` blocks all `.env*` variants from being committed
- Never commit `.env` files; use `.env.template` as a reference
- Rotate Wazuh and Splunk credentials regularly

### Network
- The `volt-server` service binds to `0.0.0.0:8000` — **restrict port 8000 at your firewall** unless you need external API access
- Place NAKIME behind a reverse proxy (Nginx/Caddy) with TLS for production use
- The internal Docker bridge (`nakime_net`) prevents volt-server from being directly reachable from outside the host by default

### Data
- NAKIME is **read-only** with respect to your security tools — it does not write to Wazuh, Suricata, or Splunk
- No telemetry is sent anywhere — the only outbound requests are to your own configured endpoints and the public CVE/CISA feeds

### Authentication
- NAKIME does not currently include a built-in authentication layer — deploy behind a VPN or authenticated reverse proxy
- JWT tokens for Wazuh are cached in-memory only and never persisted to disk

---

## Responsible Disclosure

We follow a **90-day disclosure policy**. If a reported vulnerability is not addressed within 90 days, the reporter is free to disclose it publicly.

# Contributing to NAKIME VOLT

Thank you for your interest in contributing. All contributions — bug fixes, new integrations, UI improvements, documentation — are welcome.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nakime.git
   cd nakime
   git checkout volt
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Start the dev environment:**
   ```bash
   # Terminal 1
   npm install && npm run dev

   # Terminal 2
   cd volt-server && pip install -r requirements.txt
   USE_SAMPLE_DATA=true uvicorn main:app --reload --port 8000
   ```

---

## What to Work On

### Good first issues
- Improve error messages in volt-server routers
- Add loading skeletons to right-panel tabs
- Add tooltips to map layer toggle buttons
- Fix mobile layout edge cases

### Feature contributions welcome
- New security tool integrations (Elastic SIEM, Zeek, etc.)
- Additional asset types in `adani-assets.ts` schema
- New floor plan room types in `offices.ts`
- Webhook outbound (Slack, PagerDuty, Teams)
- RBAC / authentication layer

---

## Code Style

**TypeScript / React**
- Functional components with hooks only
- No `any` types unless interfacing with external APIs
- Tailwind v4 canonical syntax — use `text-(--variable)` not `text-[var(--variable)]`
- No comments unless explaining a non-obvious constraint or workaround
- No extra error handling for scenarios that can't happen

**Python (volt-server)**
- Type hints on all function signatures
- Async where possible (httpx, not requests)
- `settings.use_sample_data` check at top of each endpoint

**Commits**
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- One logical change per commit

---

## Pull Request Process

1. Make sure `npm run build` completes without errors
2. Run `cd volt-server && python -m py_compile *.py routers/*.py` to check Python syntax
3. Write a clear PR description: what changed and why
4. Reference any related issues with `Closes #123`
5. Keep PRs focused — one feature or fix per PR

---

## Adding a New Security Integration

1. Create `volt-server/routers/mytool.py` following the pattern in `wazuh.py`
2. Mount the router in `volt-server/main.py`
3. Add sample data to `volt-server/sample_data.py`
4. Add a Next.js proxy route in `src/app/api/volt/mytool/route.ts`
5. Wire the data into `page.tsx` via `fetchEndpoint`

---

## Reporting Bugs

Open a [GitHub issue](https://github.com/dhruvagrawat/nakime/issues) with:
- Steps to reproduce
- Expected vs actual behaviour
- Browser / OS / Docker version
- Any relevant console errors

For **security vulnerabilities**, see [SECURITY.md](SECURITY.md) — do not open public issues.

---

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).

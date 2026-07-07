# Parjad Minooei — Portfolio

Interactive full-stack portfolio at [parjadm.ca](https://parjadm.ca): React SPA, Express API, MongoDB, bilingual EN/FR routing, PWA, and a playful in-browser Desktop OS.

## Features

- **Bilingual site** — English and French (`/fr/*`) with hreflang, RSS, and dynamic sitemap
- **Desktop OS & CLI** — Window manager, apps, terminal, session persistence, Alt+Tab switcher
- **Blog** — Markdown posts, reading time, related posts, table of contents, per-post OG images, optional Giscus comments
- **AI tools** — Site chatbot, mock interview, complexity analyzer, code review
- **Admin dashboard** — Blog/projects CRUD, analytics, Core Web Vitals, client error monitoring
- **PWA** — Service worker, install prompt, offline banner
- **Security** — CSP headers, rate limiting, honeypots, client error reporting

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, Tailwind, Framer Motion, react-i18next, react-helmet-async |
| Backend | Node.js, Express, Mongoose, JWT admin auth, Nodemailer |
| Deploy | Vercel (static + serverless API) |
| CI | ESLint, Vitest, Playwright smoke tests, Lighthouse CI |

## Scripts

```bash
npm run dev              # Vite (5173) + API (5175)
npm run build            # Production build → dist/
npm run preview          # Serve dist/ locally
npm run lint             # ESLint (blocking in CI)
npm run test:unit        # Vitest unit tests
npm run test:i18n        # EN/FR translation key parity
npm run test:smoke       # Playwright smoke tests (needs build first)
npm run test:lighthouse  # Lighthouse CI performance budget
npm run generate:assets  # WebP, PWA icons, OG image, blur placeholders
```

## Environment variables

### Server (`server/.env` or Vercel project settings)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Admin auth |
| `SMTP_USER`, `SMTP_PASS` | Contact form email |
| `TO_EMAIL` | Contact form recipient |
| `ERROR_ALERT_WEBHOOK` | Slack webhook URL for client error spikes |
| `ERROR_ALERT_EMAIL` | Email for error alerts (falls back to `TO_EMAIL`) |
| `ERROR_ALERT_THRESHOLD` | Errors in window before alert (default `5`) |
| `ERROR_ALERT_WINDOW_MINUTES` | Alert window (default `15`) |

### Frontend (Vercel / `.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_GISCUS_REPO` | GitHub repo for blog comments (`owner/name`) |
| `VITE_GISCUS_REPO_ID` | Giscus repo ID |
| `VITE_GISCUS_CATEGORY_ID` | Giscus discussion category ID |

## Local development

1. Clone and install:
   ```bash
   git clone https://github.com/ParjadM/ParjadM-Portfolio.git
   cd ParjadM-Portfolio
   npm install
   cd server && npm install && cd ..
   ```

2. Create `server/.env` with MongoDB URI, JWT secret, and SMTP credentials.

3. Generate optimized assets (optional but recommended):
   ```bash
   npm run generate:assets
   ```

4. Start dev servers:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

## Deployment

Push to `main` — GitHub Actions runs lint, i18n check, unit tests, build, smoke tests, and Lighthouse CI. Vercel deploys `dist/` and the serverless API at `/api/*`.

Dynamic routes served by the API:
- `/sitemap.xml` — static pages + published blog posts
- `/feed.xml` — RSS feed
- `/api/og/:id` — per-post Open Graph images

## Contact

[parjadm.ca/contact](https://parjadm.ca/contact) · [LinkedIn](https://www.linkedin.com/in/parjadminooei)

© 2026 Parjad Minooei

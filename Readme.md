# fpl-trends-app

Frontend for **FPL Trends** (https://fpltrends.live) — a Fantasy Premier League analytics platform focused on outlier detection, player comparison, and gameweek-range analysis.

Consumes the [`fpl-trends-api`](https://github.com/soseen/fpl-trends-api) backend.

---

## Table of contents

1. [Overview](#overview)
2. [Stack](#stack)
3. [Project structure](#project-structure)
4. [Routes](#routes)
5. [State management](#state-management)
6. [Local development](#local-development)
7. [Production deployment](#production-deployment)
8. [Updating production](#updating-production)
9. [Start-of-season checklist](#start-of-season-checklist)
10. [Troubleshooting](#troubleshooting)
11. [Known issues](#known-issues)

---

## Overview

A React 19 SPA with three views:

- **Home** — Best XI on a pitch (greedy selection by points within a chosen GW range), differentials and xGI leader tabs, attacking/defensive teams table.
- **Players** — Full sortable / filterable / paginated table with 25+ stat columns.
- **Compare** — Side-by-side comparison of 2–4 players with rankings on goals/90, assists/90, xGI/90, xGC/90, finishing (goals − xG), and upcoming-fixture difficulty.

A dual-thumb gameweek slider in the navbar (GW 1–38) controls the range; all stats are recomputed client-side from each player's `history` array on change.

---

## Stack

- **Framework:** React 19 + React Router 7
- **Language:** TypeScript 5.7
- **State:** Redux Toolkit 2.5 (6 slices) + Context APIs (modal/drawer state, app init)
- **Server cache:** TanStack React Query v5
- **Tables:** TanStack Table v8
- **Charts:** Recharts 2
- **Styling:** Tailwind CSS 3 + shadcn/ui (Radix primitives) + Motion for animation
- **Build:** Webpack 5 + Babel + dotenv-webpack
- **Lint/format:** ESLint 9 (flat config) + Prettier (with tailwindcss plugin)

---

## Project structure

```
src/
├── index.js                                — React DOM entry, QueryClientProvider
├── index.css                               — Globals, CSS variables, Tailwind imports
├── App.tsx                                 — Root component, React Router setup
├── components/
│   ├── Layout/
│   │   ├── layout.tsx                      — Navbar + Outlet + Footer
│   │   ├── navbar.tsx                      — Sticky nav with GW slider
│   │   └── footer.tsx
│   ├── AppInitializer/
│   │   └── app-initializer-context.tsx     — Initial data fetch + enrichment
│   ├── AppContext/
│   │   └── app-context.tsx
│   ├── Home/
│   │   ├── home.tsx
│   │   ├── BestScoringFootballers/pitch.tsx
│   │   ├── OutliersTab/
│   │   │   ├── outliers-tab.tsx
│   │   │   ├── best-differentials-tab.tsx
│   │   │   └── best-footballers-xgi-tab.tsx
│   │   ├── TeamsTable/teams-table.tsx
│   │   └── GameweekSlider/gameweek-slider.tsx
│   ├── Players/PlayersTable/players-table.tsx
│   ├── CompareFootballers/CompareTool/
│   │   ├── compare-tool.tsx
│   │   ├── CompareToolSearch/
│   │   └── rankings/
│   │       ├── rankStats.ts
│   │       ├── rankFinishing.ts
│   │       └── rankFixtures.ts
│   └── FootballerDetails/
│       ├── footballer-details-context.tsx
│       ├── footballer-details-modal.tsx    — Desktop dialog
│       ├── footballer-details-drawer.tsx   — Mobile slide-up drawer
│       └── FootballerDetailsChart/
├── redux/                                  — Store + 6 slices
├── queries/                                — Axios API calls
├── hooks/                                  — useBestScoringFootballers, useBestDifferentials, useBestXGIFootballers, ...
├── utils/                                  — Constants + helpers
├── lib/axios.ts                            — Axios instance (baseURL, 8s timeout)
└── assets/
```

---

## Routes

| Path       | Component          | Description                                       |
| ---------- | ------------------ | ------------------------------------------------- |
| `/`        | Home               | Best XI pitch, outliers, teams table              |
| `/players` | Players            | Full data table with 25+ stat columns             |
| `/compare` | CompareFootballers | Side-by-side player comparison (2–4 players)      |

All routes are wrapped in `<Layout>` (navbar + footer + GW slider).

---

## State management

### Redux slices (6)

| Slice | Holds | Async thunk |
|---|---|---|
| `footballersSlice` | `Footballer[]` from API | `fetchFootballersData` |
| `teamsSlice` | `TeamData[]` from API | `fetchTeams` |
| `gameweeksSlice` | `{ startGameweek, endGameweek }` | — (slider-controlled) |
| `eventsSlice` | `Event[]` from API | `fetchEvents` |
| `totalPlayersSlice` | `number` from API | `fetchTotalPlayers` |
| `footballersGameweekStatsSlice` | Per-range enriched stats | — (computed locally) |

### Enriched stats (client-side, per GW range)

Computed from each player's `history` array within the selected range:

- `totalPoints`, `pointsPerGame`
- `totalGoals`, `goalsPerGame`, `goalsPer90`
- `totalAssists`, `assistsPerGame`, `assistsPer90`
- `totalXGS`, `xGSPerGame`, `xGSPer90`
- `totalXGI`, `xGIPerGame`, `xGIPer90`
- `totalXGC`, `xGCPerGame`, `xGCPer90`
- `totalMinutes`, `minPerGame`
- `totalSaves`, `savesPerGame`
- `maxOwnership`
- `teamName`

### Context APIs

- **AppInitializerContext** — loading / error during initial fetch + enrichment
- **FootballerDetailsContext** — controls which player's modal/drawer is open
- **AppContextProvider** — general app-level context

---

## Local development

### Prerequisites

- Node 22+
- A running `fpl-trends-api` (defaults to `http://localhost:3000/api`)

### One-time setup

```bash
git clone git@github.com:soseen/fpl-trends-app.git
cd fpl-trends-app

npm install

# .env — point at your local API
echo 'API_BASE_URL=http://localhost:3000/api' > .env
```

### Running

```bash
npm run dev    # webpack-dev-server on port 5000, opens browser
```

### Building

```bash
npm run build  # production bundle into dist/
npm start      # serves dist/ via `serve` on port 5000
```

### Notes for editors

- Webpack config exports a **function** `(env, argv) => ({ ... })` so it can read `argv.mode` reliably. Don't move the dev-only plugins (`HotModuleReplacementPlugin`, `ReactRefreshWebpackPlugin`) outside the `isDevelopment` guard — they leak `$RefreshReg$ is not defined` into prod and blank-page the site.
- `API_BASE_URL` is baked into the bundle at build time via `dotenv-webpack`. Production uses **`API_BASE_URL=/api`** (relative — nginx proxies to the Node API on the same origin).

---

## Production deployment

The frontend is built on the production server (Hetzner CX23 at `91.98.145.120`) and served as static files by **nginx**. The API is reverse-proxied at `/api/`. TLS via Let's Encrypt.

For the full Hetzner bootstrap (server hardening, stack install, DB setup, TLS, cron), see the [`fpl-trends-api` Readme](../fpl-trends-api/Readme.md#production-deployment-hetzner). The frontend-specific bits are:

### One-time

```bash
ssh deploy@91.98.145.120
cd ~
git clone git@github.com:soseen/fpl-trends-app.git
cd fpl-trends-app
echo 'API_BASE_URL=/api' > .env
npm install
npm run build
```

The build emits to `~/fpl-trends-app/dist/`. nginx is configured to serve from there; the relevant snippet:

```nginx
root /home/deploy/fpl-trends-app/dist;
index index.html;

location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    # ... headers
}

location / {
    try_files $uri $uri/ /index.html;   # SPA fallback
}
```

After the initial build, ensure nginx (running as `www-data`) can read the dist directory:

```bash
sudo chmod o+x /home/deploy
sudo chmod -R o+rX /home/deploy/fpl-trends-app/dist
```

---

## Updating production

After pushing changes to `main`:

```bash
ssh deploy@91.98.145.120
cd ~/fpl-trends-app && npm run deploy
```

`npm run deploy` runs `git pull && npm install && npm run build`. No restart needed — nginx serves the updated `dist/` immediately. The bundle filename includes a content hash (`bundle.[contenthash].js`) so browsers automatically pick up the new bundle; `index.html` is regenerated by `HtmlWebpackPlugin` to point at the new hash. `output.clean: true` wipes stale hashed bundles between builds.

---

## Start-of-season checklist

When a new Premier League season starts (typically mid-August), the backend's [season manager](../fpl-trends-api/Readme.md#start-of-season-runbook) handles data wipe + repopulate automatically. On the frontend side:

1. **No code changes are usually required** — the SPA reads everything dynamically from the API.
2. After the backend reset, hit the site and confirm the gameweek slider re-anchors (start = 1, end = current GW).
3. If pre-season copy / promotional content changed (e.g. "Coming soon — 2026/27 Premier League season"), update components and redeploy:
   ```bash
   git pull
   npm run build
   ```
4. Spot-check `/`, `/players`, `/compare` for empty state quirks during the first GW (very few matches → near-empty `history[]`, can break enriched-stat calculations).
5. If you've upgraded React, Tailwind, or webpack between seasons, do a clean install (`rm -rf node_modules package-lock.json && npm install`) to surface any peer-dep regressions early.

---

## Troubleshooting

### Blank page, console error `Uncaught ReferenceError: $RefreshReg$ is not defined`

React Refresh / HMR plugins are leaking into the production bundle. The webpack config must guard them on `isDevelopment` — see the editor note in [Local development](#local-development). Rebuild after fixing.

### Frontend loads but every API request fails with `ERR_CONNECTION_REFUSED`

The bundle is calling the wrong origin. Check `~/fpl-trends-app/.env` on the server — it should be:

```
API_BASE_URL=/api
```

(relative, not `https://fpltrends.live/api`). Then `npm run build` again.

### nginx returns "403 Forbidden" on `/`

nginx's `www-data` user can't traverse `/home/deploy/` or read inside `dist/`. Fix:

```bash
sudo chmod o+x /home/deploy
sudo chmod -R o+rX /home/deploy/fpl-trends-app/dist
```

### `npm install` fails with peer-dependency conflicts

Open an issue / PR. We previously had this problem with `cmdk@1.0.0` declaring `react@^18` as peer, fixed by upgrading to `cmdk@^1.1.1`. Future React major upgrades may surface similar conflicts; prefer upgrading the offending package over `--legacy-peer-deps`.

### Stale assets in browser

Shouldn't happen — the bundle filename is `bundle.[contenthash].js` and `index.html` is regenerated to match. If a user reports stale UI, ask them to hard-refresh once; investigate further only if it persists.

---

## Known issues

1. **React Query is installed but unused for data fetching** — all server data flows through Redux thunks + axios. The `QueryClientProvider` wrapper in `index.js` could be removed, or the migration to React Query for data fetching could be completed.
2. **Bundle is unsplit** — single ~1.4 MiB bundle; could be code-split per route via `React.lazy`.
3. **Large 404 GIF** (~1.6 MiB) shipped with the bundle.
4. **No error boundaries** — a single render throw blanks the page.
5. **`API_BASE_URL` is build-time** (via dotenv-webpack), not runtime. Switching environments requires rebuild.

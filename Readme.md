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
6. [My Trends feature](#my-trends-feature)
7. [Local development](#local-development)
8. [Production deployment](#production-deployment)
9. [Updating production](#updating-production)
10. [Start-of-season checklist](#start-of-season-checklist)
11. [Troubleshooting](#troubleshooting)
12. [Known issues](#known-issues)

---

## Overview

A React 19 SPA with four views:

- **Home** — Best XI on a pitch (greedy selection by points within a chosen GW range), differentials and xGI leader tabs, attacking/defensive teams table. Also surfaces an "Enter your FPL ID" prompt that links into My Trends.
- **Players** — Full sortable / filterable / paginated table with 25+ stat columns.
- **Compare** — Side-by-side comparison of 2–4 players with rankings on goals/90, assists/90, xGI/90, xGC/90, finishing (goals − xG), and upcoming-fixture difficulty.
- **My Trends** — Personal rank for the selected GW range vs. season overall rank, green/red coded. The user submits their FPL ID once (persisted in `localStorage`) and a "Switch ID" button opens a dialog to change it. See [My Trends feature](#my-trends-feature).

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
│   ├── MyTrends/
│   │   ├── my-trends.route.tsx             — Page; reads ID from localStorage, calls React Query
│   │   ├── my-trends-section.tsx           — Section wrapper: rank card + trajectory chart + comparison table
│   │   ├── fpl-id-input.tsx                — Validated numeric input + submit
│   │   ├── range-rank-card.tsx             — Overall vs range rank (green/red comparison)
│   │   ├── rank-trajectory-chart.tsx       — Recharts line chart of cumulative rank per GW
│   │   ├── manager-comparison-table.tsx    — Stat rows × (You / Average / Top 10k / Diff) with text variant for "Most captained"
│   │   ├── accuracy-meter.tsx              — Three-bar meter showing how complete the stratum sample is
│   │   └── home-fpl-id-prompt.tsx          — Card on the home page (collapses to a link once stored)
│   └── FootballerDetails/
│       ├── footballer-details-context.tsx
│       ├── footballer-details-modal.tsx    — Desktop dialog
│       ├── footballer-details-drawer.tsx   — Mobile slide-up drawer
│       └── FootballerDetailsChart/
├── redux/                                  — Store + 6 slices
├── queries/                                — Axios API calls (incl. getManagerSummary, getManagerRangeRank)
├── hooks/                                  — useBestScoringFootballers, useLocalStorage, ...
├── utils/                                  — Constants + helpers
├── lib/axios.ts                            — Axios instance (baseURL, 60s timeout)
└── assets/
```

---

## Routes

| Path         | Component          | Description                                                |
| ------------ | ------------------ | ---------------------------------------------------------- |
| `/`          | Home               | Best XI pitch, outliers, teams table, FPL ID prompt        |
| `/players`   | Players            | Full data table with 25+ stat columns                      |
| `/compare`   | CompareFootballers | Side-by-side player comparison (2–4 players)               |
| `/my-trends` | MyTrends           | Personal range-rank vs season overall rank for an FPL ID   |

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

### TanStack React Query

Bulk app data (footballers, teams, events, totals) flows through Redux thunks. **Manager data for the My Trends feature uses TanStack Query instead** — it's per-user, per-range, and request-scoped, so global Redux state would be the wrong shape. The hooks live in [`src/queries/getManagerSummary.ts`](src/queries/getManagerSummary.ts) and [`src/queries/getManagerRangeRank.ts`](src/queries/getManagerRangeRank.ts) and are used directly via `useQuery` in [`my-trends.route.tsx`](src/components/MyTrends/my-trends.route.tsx). Cache keys include the entry ID and gameweek range so changing either invalidates the cached result.

---

## My Trends feature

A four-pane personal dashboard at `/my-trends` combining range-rank estimation, rank trajectory, and head-to-head stat comparison against the overall sample plus the current top-10k cohort.

### How it's used

1. **First visit**: an "Enter your FPL ID" card appears on the home page above the pitch, and on `/my-trends` if the user navigates there directly. Submitting persists the ID to `localStorage` (key: `fpl_manager_id`) and routes to `/my-trends`.
2. **Returning visits**: the home prompt collapses to a discreet "FPL ID 12345 · View My Trends →" link. The navbar always shows the My Trends entry.
3. **On `/my-trends`**, four panes render together:
   - **Range rank card** — season overall rank vs. estimated rank within the current GW slider range, colour-coded green/red against the rank entering and leaving the range.
   - **Accuracy meter** — three-bar indicator showing how complete the stratum sample is. Tooltip exposes the raw probe count.
   - **Rank trajectory chart** — line chart of cumulative overall rank per GW within the range (data straight from the FPL `/entry/{id}/history/` payload).
   - **Comparison table** — stat-by-stat: You vs. Average (overall sampled) vs. Top 10k vs. Diff. Diff column compares user to average; the colour on "You" mirrors that comparison.
4. **Dragging the GW slider** re-fetches all four panes (TanStack Query keyed on `[entryId, start, end]`).
5. A "Switch ID" button opens a dialog with the same input.

### How the rank is computed

The frontend is a thin wrapper around the API endpoints. The actual rank estimation, captain-bonus aggregation, and top-10k SQL all run server-side — see [`fpl-trends-api` Readme: Manager rank estimation](../fpl-trends-api/Readme.md#manager-rank-estimation-my-trends) and [Manager comparison](../fpl-trends-api/Readme.md#manager-comparison-sample-averages--top-10k).

The range-rank card respects the `confidence` field returned by the API:

- `exact` — user is in the top 10k *and* stratum 1 is fully sampled. Number shown without prefix.
- `estimated` — sample-based extrapolation (cross-stratum sum × Bernoulli-urn scaling). Prefixed with `≈`.
- `approximate` — no sample yet anywhere. Falls back to overall rank, prefixed with `≈`.

### Comparison table

Built on `/api/manager/:id/comparison`. Rows render one of two shapes:

- **Numeric/chip** — number (or "Used / Not used" / "%" for chips). Diff column shows `+N` or `-N` against the overall average. Direction ("high-good" / "low-good" / "neutral") drives the green/red colour.
- **Text** — currently only "Most captained". Cells show player names (e.g. "Salah") instead of a number; no diff arithmetic, no colouring.

Mobile layout (sm and below) collapses to **You + Top 10k** to keep the table readable; the Average and Diff columns are hidden but the colour on "You" still reflects the user-vs-average comparison.

If `notes.captain_average_partial` (or `hits_average_partial` / `bench_average_partial`) is true — typically while the picks/history backfills are still in flight — the corresponding average cell shows `≈` to flag that the number isn't fully baked yet.

### Files

| File | Purpose |
|---|---|
| `src/components/MyTrends/my-trends.route.tsx` | Page. Reads ID from `useLocalStorage`, GW range from Redux, fans out four React Query hooks. |
| `src/components/MyTrends/my-trends-section.tsx` | Section wrapper combining the four panes. |
| `src/components/MyTrends/fpl-id-input.tsx` | Reusable validated input (numeric, 1–20M). |
| `src/components/MyTrends/range-rank-card.tsx` | Renders overall vs range rank with green/red colour logic and confidence label. |
| `src/components/MyTrends/rank-trajectory-chart.tsx` | Recharts line chart — cumulative overall rank per GW, derived from the FPL history payload. |
| `src/components/MyTrends/manager-comparison-table.tsx` | Stat × cohort table (You / Average / Top 10k / Diff). Renders both numeric and text rows. |
| `src/components/MyTrends/accuracy-meter.tsx` | Three-bar meter; lights up as the stratum sample target fills. |
| `src/components/MyTrends/home-fpl-id-prompt.tsx` | Home-page card that collapses to a link once an ID is stored. |
| `src/hooks/useLocalStorage.ts` | Generic `useState`-backed `localStorage` hook. |
| `src/queries/getManagerSummary.ts` | `GET /api/manager/:id/summary`. |
| `src/queries/getManagerRangeRank.ts` | `GET /api/manager/:id/range-rank?start=X&end=Y`. |
| `src/queries/getManagerTrajectory.ts` | `GET /api/manager/:id/trajectory?start=X&end=Y`. |
| `src/queries/getManagerComparison.ts` | `GET /api/manager/:id/comparison?start=X&end=Y`. |

### Privacy

The FPL `entry_id` is a public identifier visible in everyone's FPL team URL. Storing it in `localStorage` is no different from bookmarking the official FPL site. No other PII is sent to or stored by us.

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

1. **Mixed data-fetching patterns** — bulk app data goes through Redux thunks; My Trends uses TanStack Query. Long-term we may want to consolidate, but the split is intentional (per-user request-scoped data isn't a great fit for global Redux state).
2. **Bundle is unsplit** — single ~1.4 MiB bundle; could be code-split per route via `React.lazy`.
3. **Large 404 GIF** (~1.6 MiB) shipped with the bundle.
4. **No error boundaries** — a single render throw blanks the page.
5. **`API_BASE_URL` is build-time** (via dotenv-webpack), not runtime. Switching environments requires rebuild.
6. **My Trends precision below the top 10k depends on sample density** — see the API's [Manager rank estimation](../fpl-trends-api/Readme.md#manager-rank-estimation-my-trends) section. New servers show `confidence: "approximate"` for everyone outside the top 10k until the cron has run for several hours.

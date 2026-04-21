# fpl-trends-app — Frontend Context

React SPA for FPL Trends. Displays Fantasy Premier League analytics with focus on outlier detection, player comparison, and gameweek-range analysis.

## Stack

React 19, TypeScript 5.7, Redux Toolkit, TanStack React Query v5, TanStack Table v8, Recharts, Tailwind CSS 3, shadcn/ui (Radix UI), Webpack 5, Babel.

## Tooling

- **TypeScript**: `tsconfig.json` — `target: ES2022`, `module: ESNext`, `moduleResolution: Bundler`, strict mode with `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `isolatedModules: true`.
- **ESLint**: Flat config (`eslint.config.js`) — ESLint 9 with `typescript-eslint`, React + React Hooks rules, unused-imports auto-removal, Prettier integration, consistent type imports enforced.
- **Prettier**: Integrated via eslint-plugin-prettier with tailwindcss plugin. 2-space indent, semicolons, double quotes.
- **Node**: 22+ (LTS), aligned with backend.

## Project Structure

```
src/
├── index.js                               — React DOM entry, QueryClientProvider wrapper
├── index.css                              — Global styles, CSS variables, Tailwind imports
├── App.tsx                                — Root component, React Router setup (3 routes)
├── components/
│   ├── Layout/
│   │   ├── layout.tsx                     — Main layout: Navbar + Outlet + Footer
│   │   ├── navbar.tsx                     — Sticky nav with logo, links, GW slider
│   │   └── footer.tsx                     — Site footer
│   ├── AppInitializer/
│   │   └── app-initializer-context.tsx    — Fetches all data on mount, computes enriched stats
│   ├── AppContext/
│   │   └── app-context.tsx                — General app-level context provider
│   ├── Home/
│   │   ├── home.tsx                       — Home page composition
│   │   ├── BestScoringFootballers/
│   │   │   └── pitch.tsx                  — Best XI on pitch graphic (greedy selection)
│   │   ├── OutliersTab/
│   │   │   ├── outliers-tab.tsx           — Tabs: Differentials + xGI leaders
│   │   │   ├── best-differentials-tab.tsx — Low-owned high-performers (≤10% ownership)
│   │   │   └── best-footballers-xgi-tab.tsx — Top xGI/90 players
│   │   ├── TeamsTable/
│   │   │   └── teams-table.tsx            — Attack/defence toggle, ranking changes
│   │   └── GameweekSlider/
│   │       └── gameweek-slider.tsx        — Dual-thumb range slider (GW 1–38)
│   ├── Players/
│   │   └── PlayersTable/
│   │       └── players-table.tsx          — Full data table, 25+ cols, sort/filter/paginate
│   ├── CompareFootballers/
│   │   └── CompareTool/
│   │       ├── compare-tool.tsx           — 2–4 player comparison with stat cards
│   │       ├── CompareToolSearch/         — Player search/selection UI (cmdk)
│   │       └── rankings/
│   │           ├── rankStats.ts           — Rank by stat value (desc, xGC asc)
│   │           ├── rankFinishing.ts       — Rank by goals − xG (clinical finishing)
│   │           └── rankFixtures.ts        — Rank by next 4 fixture difficulty
│   └── FootballerDetails/
│       ├── footballer-details-context.tsx — Modal/drawer state management
│       ├── footballer-details-modal.tsx   — Desktop: dialog with full player stats
│       ├── footballer-details-drawer.tsx  — Mobile: slide-up drawer variant
│       └── FootballerDetailsChart/        — Recharts line chart of historical performance
├── redux/
│   ├── store.ts                           — Redux store with 6 slices
│   ├── footballersSlice.ts                — Player data + fetchFootballersData thunk
│   ├── teamsSlice.ts                      — Teams data + fetchTeams thunk
│   ├── gameweeksSlice.ts                  — GW start/end range (0–38)
│   ├── eventsSlice.ts                     — Gameweek events + fetchEvents thunk
│   ├── totalPlayersSlice.ts               — Total FPL players count
│   └── footballersGameweekStatsSlice.ts   — Enriched per-range stats
├── queries/
│   ├── getFootballersData.ts              — GET /footballersData
│   ├── getTeamsData.ts                    — GET /teamsData
│   ├── getEventsData.ts                   — GET /eventsData
│   └── getTotalPlayers.ts                 — GET /getTotalPlayers
├── hooks/
│   ├── useBestScoringFootballers.ts       — Best XI selection algorithm
│   ├── useBestDifferentials.ts            — Differential outlier detection
│   ├── useBestXGIFootballers.ts           — xGI/90 leader detection
│   └── (other custom hooks)
├── utils/
│   ├── constants.ts                       — Position labels, column definitions, etc.
│   └── helpers.ts                         — Formatting, calculation utilities
├── lib/
│   └── axios.ts                           — Axios instance (baseURL, timeout: 8s)
└── assets/                                — Logo, pitch SVG, 404 gif
```

## Routes

| Path       | Component          | Description                                          |
| ---------- | ------------------ | ---------------------------------------------------- |
| `/`        | Home               | Dashboard: Best XI pitch, outliers tabs, teams table |
| `/players` | Players            | Full sortable/filterable data table (TanStack Table) |
| `/compare` | CompareFootballers | Side-by-side player comparison (2–4 players)         |

All routes wrapped in `<Layout>` (navbar with GW slider + footer).

## State Management

### Redux Slices (6)

1. **footballersSlice** — `Footballer[]` from API, async thunk `fetchFootballersData`
2. **teamsSlice** — `TeamData[]` from API, async thunk `fetchTeams`
3. **gameweeksSlice** — `{ startGameweek, endGameweek }` controlled by slider
4. **eventsSlice** — `Event[]` from API, async thunk `fetchEvents`
5. **totalPlayersSlice** — `number` from API, async thunk `fetchTotalPlayers`
6. **footballersGameweekStatsSlice** — Enriched stats computed from history within GW range

### Enriched Stats (computed client-side per GW range)

For each player within the selected gameweek range, these are calculated from their `history` array:

- totalPoints, pointsPerGame
- totalGoals, goalsPerGame, goalsPer90
- totalAssists, assistsPerGame, assistsPer90
- totalXGS, xGSPerGame, xGSPer90
- totalXGI, xGIPerGame, xGIPer90
- totalXGC, xGCPerGame, xGCPer90
- totalMinutes, minPerGame
- totalSaves, savesPerGame
- maxOwnership (peak selected_by_percent in range)
- teamName (resolved from team relation)

### Context APIs

- **AppInitializerContext** — tracks loading/error state during initial data fetch and enrichment
- **FootballerDetailsContext** — controls which player's modal/drawer is open
- **AppContextProvider** — general app-level context

## Key Algorithms

### Best XI Selection (pitch view)

Greedy algorithm: sort all players by total points in GW range, then pick players respecting constraints — 1 GK, 3–5 DEF, 3–5 MID, 1–3 FWD, max 3 from same club. Final team: 1GK + 3DEF + 3MID + 2FWD + backfill remaining 2 slots.

### Outlier Detection

- **Differentials**: filter players with `selected_by_percent <= 10`, sort by totalPoints desc, take top 5
- **xGI Leaders**: sort all players by xGI/90 desc, take top 5

### Comparison Rankings

- **Stats**: rank by value descending (except xGC: ascending = better)
- **Finishing**: rank by (goals − xG), positive = clinical
- **Fixtures**: rank by next 4 fixture difficulty sum (ascending = easier), missing fixtures count as difficulty 6

### Teams Table

Aggregates `team_history` within GW range. Shows avg xGC or avg xGS vs full-season average. Displays rank change arrows.

## API Integration

Axios instance in `src/lib/axios.ts`:

- Base URL: `API_BASE_URL` env var (default `http://localhost:3000/api`)
- Timeout: 8 seconds
- Content-Type: application/json

Endpoints consumed:

```
GET /footballersData    → Footballer[] (with team, history[], footballer_fixtures[])
GET /teamsData          → TeamData[] (with team_history[])
GET /eventsData         → Event[]
GET /getTotalPlayers    → number
```

## Styling

- **Theme**: Dark (navy/gray background)
- **Primary accent**: Magenta (#c71e4d)
- **Highlight**: Cyan (#0dc5b6)
- **Font**: Roboto (Google Fonts)
- **UI library**: shadcn/ui components in `/@/components/ui/` (Button, Dialog, Drawer, Select, Slider, Table, Tooltip, Avatar, Card, Skeleton, etc.)
- **Animations**: Motion (Framer Motion) for transitions
- **Responsive**: Mobile-first, breakpoints at xs(510px), sm(640px), md(768px), lg(1024px)
- **Fixture difficulty colors**: CSS vars `--fixture-dif-2` through `--fixture-dif-5`
- **Chart colors**: CSS vars `--chart-1` through `--chart-5`

## Environment Variables

```
API_BASE_URL    — Backend API URL (default: http://localhost:3000/api)
```

Loaded via `dotenv-webpack` plugin into the bundle at build time.

## Commands

```bash
npm run dev      — Webpack dev server on port 5000 (hot reload, opens browser)
npm run build    — Production build to dist/
npm start        — Serve dist/ on port 5000
```

## Deployment

Previously deployed on Heroku with static buildpack. `static.json` routes all paths to `index.html` (SPA fallback). No Docker or CI/CD config.

## Key Dependencies

- react / react-dom: 19.0.0
- react-router: 7.1.3
- @reduxjs/toolkit: 2.5.0
- react-query: 3.39.3
- @tanstack/react-table: 8.21.2
- recharts: 2.15.1
- axios: 1.7.9
- tailwindcss: 3.4.17
- motion: 12.0.6
- cmdk: 1.0.0
- lucide-react, react-icons
- Radix UI primitives (avatar, dialog, select, slider, tooltip, toggle, popover)

## Known Issues

1. Node engine requirement is 23.x (mismatched with backend's 20.x)
2. No error boundary components for graceful failure handling
3. React Query v3 is outdated (v5 is
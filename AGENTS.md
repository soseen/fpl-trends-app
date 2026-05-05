# fpl-trends-app - Codex Context

React SPA for FPL Trends. It renders Fantasy Premier League analytics
for player/team trends, comparison workflows, and personalized manager
range analysis in "My Trends".

## Stack And Tooling

- React 19, TypeScript 5.7, React Router 7
- Redux Toolkit for global player/team/GW data
- TanStack React Query v5 for My Trends server queries
- TanStack Table v8 for the players table
- Recharts for charts
- Tailwind CSS 3 plus shadcn/ui-style components under `@/components/ui`
- Radix UI primitives, Vaul drawers, Motion, cmdk, lucide/react-icons
- Webpack 5 with Babel
- Node 22+

Common commands:

```bash
npm run dev
npm run build
npm start
```

`npm run dev` starts webpack dev server on port 5000 and opens a browser.
`npm run build` produces static files in `dist/`.

## Important Build Behavior

`webpack.config.js` exports a function and reads `argv.mode`. Keep the
development-only plugins guarded by `isDevelopment`:

- `react-refresh/babel`
- `HotModuleReplacementPlugin`
- `ReactRefreshWebpackPlugin`

Leaking React Refresh into production causes `$RefreshReg$` errors and a
blank page.

Production bundles are `bundle.[contenthash].js`, and
`HtmlWebpackPlugin` rewrites `index.html` each build. Do not hardcode
`bundle.js`.

`API_BASE_URL` is injected at build time via `dotenv-webpack`; it is not
runtime config. Production should build with `API_BASE_URL=/api`.
Changing environments requires rebuilding. The Axios instance is in
`src/lib/axios.ts` and currently uses a 60 second timeout.

## Main Structure

- `src/index.js`: React DOM entry, QueryClientProvider setup
- `src/App.tsx`: providers and routes
- `src/index.css` and `src/tailwind.css`: global styles and Tailwind
- `src/components/Layout/`: navbar, layout, footer, transfers panel
- `src/components/Home/`: dashboard, Best XI pitch, GW slider, outliers,
  teams table
- `src/components/Players/`: sortable/filterable players table
- `src/components/CompareFootballers/`: 2-4 player comparison workflow
- `src/components/FootballerDetails/`: modal/drawer details, charts,
  history, fixtures
- `src/components/MyTrends/`: FPL ID input, range rank, trajectory,
  comparison, transfer impact, team impact, rank killers
- `src/redux/`: store and slices for bulk app data
- `src/queries/`: API client functions and My Trends response types
- `src/hooks/`: shared hooks
- `src/utils/`: constants, image URLs, string helpers, defensive
  contribution helpers
- `src/assets/`: logo, pitch image, 404 GIF

Aliases:

- `src`: `src/`
- `@`: repository `@/` directory, where shadcn/ui components live

## Routes

Routes are nested under `<Layout />`:

- `/`: home dashboard
- `/players`: full players table
- `/compare`: footballer comparison tool
- `/my-trends`: personalized FPL manager analytics

The navbar includes the gameweek slider. That range is global state and
drives most analytics.

## State And Data Flow

Bulk footballer/team/event data is fetched on app initialization through
Redux thunks, then enriched client-side for the selected GW range.

Redux slices:

- `footballersSlice`
- `teamsSlice`
- `gameweeksSlice`
- `eventsSlice`
- `totalPlayersSlice`
- `footballersGameweekStatsSlice`

Context providers:

- `AppInitializerProvider`: initial fetch/enrichment status
- `AppContextProvider`: general app state
- `FootballerDetailsProvider`: active player details modal/drawer state

My Trends uses TanStack Query directly in
`src/components/MyTrends/my-trends.route.tsx` and stores the chosen FPL ID
in local storage under `fpl_manager_id`.

## API Calls

Axios requests are relative to `process.env.API_BASE_URL`.

Bulk data:

- `GET /footballersData`
- `GET /teamsData`
- `GET /eventsData`
- `GET /totalPlayersCount`

My Trends:

- `GET /manager/:id/summary`
- `GET /manager/:id/trajectory`
- `GET /manager/:id/range-rank?start=N&end=M`
- `GET /manager/:id/comparison?start=N&end=M`
- `GET /manager/:id/team-impact?start=N&end=M`
- `GET /manager/:id/transfers?start=N&end=M`

Keep query keys aligned with `entryId`, `startGameweek`, and
`endGameweek` so range changes invalidate correctly.

## Product Logic

Home:

- Best XI is selected greedily by range total points while respecting FPL
  formation constraints and max three players per club.
- Outliers include differentials, xGI leaders, and defensive contribution
  leaders.
- Teams table aggregates `team_history` over the selected range and can
  compare attack/defence views.

Players:

- Uses TanStack Table with filters, sorting, pagination, and route/search
  param integration. Keep dense-table ergonomics intact.

Compare:

- Supports 2-4 selected players with rankings for stats, finishing
  (`goals - xG`), and next fixture difficulty. Lower xGC and fixture
  difficulty are better.

My Trends:

- Uses an FPL entry ID plus the selected GW range.
- Shows estimated range rank, trajectory, sample comparison, transfer
  impact, team impact, and rank killers.
- Backend ranges are 1-based GWs and must satisfy `1 <= start <= end <= 38`.

## Styling Guidelines

The app is an analytics tool, not a marketing site. Keep screens dense,
scannable, and work-focused.

- Existing theme is dark with magenta `#c71e4d` and cyan `#0dc5b6`
  accents
- Font: Roboto
- Use existing shadcn/Radix components where possible
- Keep responsive behavior mobile-first
- Avoid card-inside-card layouts and oversized hero treatments for tool
  surfaces
- Use icons for compact commands where the existing UI pattern supports it
- Make table, slider, toolbar, and card dimensions stable so hover/loading
  states do not cause layout shifts

## Known Risks

- No React error boundaries, so render errors can blank the app
- Bundle is not route-split and is large
- Large 404 GIF is bundled
- API base URL is build-time only
- Some older docs still describe React Query as unused; current My Trends
  pages do use TanStack Query


import type React from "react";
import { useSelector } from "react-redux";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { RootState } from "src/redux/store";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import type { PlayerImpact } from "src/queries/getTeamImpact";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRankDelta, rankImpactBadgeClass, defconHighlightClass } from "./format";
import { useOpenPlayerDetails } from "./use-open-player-details";

type Props = {
  player: PlayerImpact;
  showRankImpact: boolean;
};

const POSITION_LABEL: Record<number, string> = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
};

// Position chip colour. Lifted to /25 background tint and -200 (or
// brand magenta) foreground so all four positions read at the same
// legibility level — the previous FWD entry used `text-magenta3` (a
// dark red), which was nearly invisible on a magenta tint.
const POSITION_CHIP_CLASS: Record<number, string> = {
  1: "bg-amber-500/25 text-amber-200",
  2: "bg-emerald-500/25 text-emerald-200",
  3: "bg-cyan-500/25 text-cyan-200",
  4: "bg-magenta/25 text-magenta",
};

// Compact stat chip: label + value. Solid `bg-accent4` with a subtle
// border lifts the chip clearly above the card's `bg-primary`. `tone`
// controls foreground for "earn-y" stats (defcon bonus > 0 gets
// emerald, others stay neutral). `tooltip` is the description shown on
// hover via the themed Tooltip primitive.
const StatChip: React.FC<{
  label: string;
  value: string | number;
  tone?: string | null;
  tooltip?: string;
}> = ({ label, value, tone, tooltip }) => {
  const chip = (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border border-accent/40 bg-accent4 px-1.5 py-[1px] text-[10px] sm:gap-1 sm:px-2 sm:py-[2px] sm:text-xs md:text-sm ${
        tone ?? "text-text"
      }`}
    >
      {/* Label inherits the parent text size so it matches the value's
          height — previously a one-step-smaller override (text-[10px]
          sm:text-xs md:text-sm) made the label noticeably shorter than
          the value, which read as a vertical-alignment glitch. */}
      <span className="uppercase text-text/70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );

  if (!tooltip) return chip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

const formatDecimal = (raw: string | number | null | undefined): string => {
  const n = typeof raw === "string" ? parseFloat(raw) : (raw ?? 0);
  if (!Number.isFinite(n)) return "0.0";
  return n.toFixed(1);
};

const PlayerImpactRow: React.FC<Props> = ({ player, showRankImpact }) => {
  const enriched = useSelector(
    (state: RootState) => state.footballersGameweekStats.footballers,
  );
  const stats: FootballerWithGameweekStats | undefined = enriched.find(
    (f) => f.id === player.player_id,
  );
  const openDetails = useOpenPlayerDetails();

  const positionLabel = POSITION_LABEL[player.element_type] ?? "—";
  const isKeeperOrDef = player.element_type === 1 || player.element_type === 2;
  // played_count === 0 marks a "rank killer" row (a player the user didn't
  // own who scored, hurting their relative rank). The data has all owned
  // metrics zeroed out; we render `raw_points` (the points the user
  // missed) under the same "pts" label so the row stays visually
  // consistent with the owned breakdown.
  const isRankKiller = player.played_count === 0;
  const pointsValue = isRankKiller ? player.raw_points : player.points_for_user;

  // rank impact per appearance. For owned players we use played_count
  // (autosubs count, matching the points figure). For rank killers — who
  // by definition have played_count === 0 — we count GWs where the
  // player actually took the field (minutes > 0), i.e. the games where
  // they had any chance to drag the user's relative rank.
  const appearances = isRankKiller
    ? player.per_gw.filter((r) => r.minutes > 0).length
    : player.played_count;
  const ranksPerAppearance = appearances > 0 ? player.rank_impact / appearances : 0;

  const rankPill = showRankImpact ? (
    <span
      className={`min-w-[3.5rem] rounded-md border px-2 py-0.5 text-center text-xs font-semibold sm:min-w-[5rem] sm:py-1 sm:text-base md:min-w-[5.5rem] md:text-lg ${rankImpactBadgeClass(
        player.rank_impact,
      )}`}
    >
      rank {formatRankDelta(player.rank_impact)}
    </span>
  ) : null;

  return (
    // Single horizontal flex with everything inside. Stats chips live in
    // the middle column rather than on a separate row below, so the
    // avatar and right-side block sit at the row's actual vertical
    // center (with `items-center`) — the prior two-row layout pushed
    // them into the upper half of the row, which read as misaligned.
    <div className="flex w-full items-center gap-2 px-2 py-4 sm:gap-4 sm:px-3 sm:py-5">
      <button
        type="button"
        onClick={(e) => {
          // The accordion trigger wraps this row, so a click would also
          // toggle the disclosure. Stop propagation so the avatar acts
          // as a dedicated "open details" affordance.
          e.stopPropagation();
          openDetails(player.player_id);
        }}
        className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md border border-accent4 bg-secondary transition hover:ring-2 hover:ring-magenta/60 sm:h-14 sm:w-12 md:h-16 md:w-14"
        aria-label={`Open ${player.web_name} details`}
      >
        <FootballerImage code={player.code} className="h-full w-full object-contain" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          {/* Club badge moved out of the avatar's corner (where it was
              clipped by the rounded-md overflow) to inline before the
              name — easier to read and visually couples the player to
              their club. */}
          <img
            src={getTeamsBadge(player.team_code)}
            alt=""
            className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
          />
          <span className="truncate text-sm font-medium text-text sm:text-base md:text-lg">
            {player.web_name}
          </span>
          <span
            className={`rounded-sm px-1.5 py-[1px] text-[10px] font-medium sm:text-xs md:text-sm ${
              POSITION_CHIP_CLASS[player.element_type] ?? "bg-accent3 text-text"
            }`}
          >
            {positionLabel}
          </span>
          {isRankKiller ? (
            <span className="rounded-sm bg-rose-500/20 px-1.5 py-[1px] text-[10px] font-semibold text-rose-300 sm:text-xs md:text-sm">
              EO {(player.avg_eo_in_stratum * 100).toFixed(0)}%
            </span>
          ) : (
            <span className="rounded-sm bg-magenta2/50 px-1.5 py-[1px] text-[10px] font-semibold text-text sm:text-xs md:text-sm">
              {player.starts} start{player.starts === 1 ? "" : "s"}
            </span>
          )}
          {player.captaincies > 0 && (
            <span className="rounded-sm bg-magenta/30 px-1.5 py-[1px] text-[10px] font-semibold text-magenta sm:text-xs md:text-sm">
              {player.captaincies}× C
            </span>
          )}
          {player.triple_captaincies > 0 && (
            <span className="rounded-sm bg-magenta px-1.5 py-[1px] text-[10px] font-semibold text-white sm:text-xs md:text-sm">
              {player.triple_captaincies}× TC
            </span>
          )}
        </div>
        {stats && (
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <StatChip
              label="G"
              value={stats.totalGoals ?? 0}
              tooltip="Goals scored in range"
            />
            <StatChip
              label="A"
              value={stats.totalAssists ?? 0}
              tooltip="Assists in range"
            />
            {isKeeperOrDef && (
              <StatChip
                label="CS"
                value={stats.totalCleanSheets ?? 0}
                tooltip="Clean sheets in range"
              />
            )}
            <StatChip
              label="D"
              value={stats.totalDefconBonuses ?? 0}
              tone={defconHighlightClass(stats.totalDefconBonuses ?? 0)}
              tooltip="Defensive-contribution +2 bonuses in range (threshold met)"
            />
            <StatChip
              label="xGI"
              value={formatDecimal(stats.totalXGI)}
              tooltip="Expected goal involvements (xG + xA)"
            />
            {isKeeperOrDef && (
              <StatChip
                label="xGC"
                value={formatDecimal(stats.totalXGC)}
                tooltip="Expected goals conceded"
              />
            )}
            {stats.totalSaves > 0 && (
              <StatChip label="Sv" value={stats.totalSaves} tooltip="Saves (keepers)" />
            )}
          </div>
        )}
      </div>

      {/* Right side: stacks the pts block on top of the rank pill on
          mobile (vertical = narrower footprint, frees horizontal space
          for the stats chips in the middle column). Switches to a
          side-by-side layout from `sm:` upward where there's room. */}
      <div className="ml-auto flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[10px] text-text/60 sm:text-sm">pts</span>
          <span className="text-base font-semibold text-text sm:text-lg md:text-2xl">
            {pointsValue}
          </span>
        </div>
        {rankPill && (
          <div className="flex flex-col items-end leading-tight">
            {rankPill}
            {appearances > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="mt-0.5 hidden text-[10px] text-text/60 sm:inline sm:text-xs">
                    {formatRankDelta(ranksPerAppearance)}
                    {isRankKiller ? "/game" : "/start"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Average rank impact per appearance</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerImpactRow;

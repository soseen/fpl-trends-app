import type React from "react";
import { useSelector } from "react-redux";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { RootState } from "src/redux/store";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import type { PlayerImpact } from "src/queries/getTeamImpact";
import { formatRankDelta, rankImpactPillClass, defconHighlightClass } from "./format";
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

// Position chip colour — mirrors fixture-difficulty palette feel without
// reusing the same vars (those are GW-fixture-specific). Magenta tones
// keep us inside the existing brand palette.
const POSITION_CHIP_CLASS: Record<number, string> = {
  1: "bg-amber-500/20 text-amber-300", // GK
  2: "bg-emerald-500/20 text-emerald-300", // DEF
  3: "bg-cyan-500/20 text-cyan-300", // MID
  4: "bg-magenta/30 text-magenta3", // FWD
};

// Compact stat chip: label + value. Used for goals / assists / xGI etc.
// `tone` controls the foreground colour for "earn-y" stats (defcon bonus
// >0 gets emerald, others stay neutral).
const StatChip: React.FC<{
  label: string;
  value: string | number;
  tone?: string | null;
  title?: string;
}> = ({ label, value, tone, title }) => (
  <span
    className={`bg-accent3/60 inline-flex items-center gap-1 rounded-sm px-1.5 py-[1px] text-[10px] sm:text-[11px] ${
      tone ?? "text-text/80"
    }`}
    title={title}
  >
    <span className="text-text/50 text-[9px] uppercase">{label}</span>
    <span className="font-semibold">{value}</span>
  </span>
);

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
  const captaincyCount = player.captaincies + player.triple_captaincies;
  const isKeeperOrDef = player.element_type === 1 || player.element_type === 2;

  // rank-gain per start: how many places gained on average each time the
  // user fielded this player. Expressed in the same units as the total
  // (negative = lost rank). Use played_count rather than starts so
  // autosubs (multiplier becomes 1) count, matching the points figure.
  const ranksPerStart =
    player.played_count > 0 ? player.rank_impact / player.played_count : 0;

  return (
    <div className="flex w-full flex-col gap-1 px-2 py-2 sm:gap-1.5 sm:px-3">
      {/* Top line: avatar + name + position chip on the left, points + rank pill on the right */}
      <div className="flex w-full items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={(e) => {
            // The accordion trigger wraps this row, so a click would also
            // toggle the disclosure. Stop propagation so the avatar acts
            // as a dedicated "open details" affordance and doesn't also
            // expand the row.
            e.stopPropagation();
            openDetails(player.player_id);
          }}
          className="hover:ring-magenta/60 relative h-9 w-9 shrink-0 rounded-full transition hover:ring-2 sm:h-11 sm:w-11"
          aria-label={`Open ${player.web_name} details`}
        >
          <FootballerImage
            code={player.code}
            className="bg-accent4/20 h-full w-full rounded-full object-contain"
          />
          <img
            src={getTeamsBadge(player.team_code)}
            alt=""
            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary p-[1px]"
          />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-start text-left">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-semibold text-text sm:text-sm">
              {player.web_name}
            </span>
            <span
              className={`rounded-sm px-1.5 py-[1px] text-[9px] font-semibold sm:text-[10px] ${
                POSITION_CHIP_CLASS[player.element_type] ?? "bg-accent3 text-text"
              }`}
            >
              {positionLabel}
            </span>
          </div>
          {/* Starts + captaincy chips */}
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <span className="bg-magenta2/50 rounded-sm px-1.5 py-[1px] text-[9px] font-semibold text-text sm:text-[10px]">
              {player.starts} start{player.starts === 1 ? "" : "s"}
            </span>
            {captaincyCount > 0 && (
              <span className="bg-magenta/30 rounded-sm px-1.5 py-[1px] text-[9px] font-semibold text-magenta3 sm:text-[10px]">
                {captaincyCount}× C
                {player.triple_captaincies > 0
                  ? ` (incl. ${player.triple_captaincies}× TC)`
                  : ""}
              </span>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-text/60 text-[10px] sm:text-xs">pts</span>
            <span className="text-sm font-semibold text-text sm:text-base">
              {player.points_for_user}
            </span>
          </div>
          {showRankImpact && (
            <div className="flex flex-col items-end gap-0.5">
              <span
                className={`min-w-[3.5rem] rounded-md px-2 py-1 text-center text-xs font-semibold sm:min-w-[4.5rem] sm:text-sm ${rankImpactPillClass(
                  player.rank_impact,
                )}`}
              >
                {formatRankDelta(player.rank_impact)}
              </span>
              {player.played_count > 0 && (
                <span
                  className="text-text/50 text-[9px] sm:text-[10px]"
                  title="Average rank places gained per appearance"
                >
                  {formatRankDelta(ranksPerStart)} / start
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats line: only render when we have enriched stats from Redux for this player */}
      {stats && (
        <div className="flex flex-wrap items-center gap-1 pl-11 sm:pl-14">
          <StatChip
            label="G"
            value={stats.totalGoals ?? 0}
            title="Goals scored in range"
          />
          <StatChip label="A" value={stats.totalAssists ?? 0} title="Assists in range" />
          {isKeeperOrDef && (
            <StatChip
              label="CS"
              value={stats.totalCleanSheets ?? 0}
              title="Clean sheets in range"
            />
          )}
          <StatChip
            label="D"
            value={stats.totalDefconBonuses ?? 0}
            tone={defconHighlightClass(stats.totalDefconBonuses ?? 0)}
            title="Defensive-contribution +2 bonuses in range (threshold met)"
          />
          <StatChip
            label="xGI"
            value={formatDecimal(stats.totalXGI)}
            title="Expected goal involvements (xG + xA)"
          />
          {isKeeperOrDef && (
            <StatChip
              label="xGC"
              value={formatDecimal(stats.totalXGC)}
              title="Expected goals conceded"
            />
          )}
          {stats.totalSaves > 0 && (
            <StatChip label="Sv" value={stats.totalSaves} title="Saves (keepers)" />
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerImpactRow;

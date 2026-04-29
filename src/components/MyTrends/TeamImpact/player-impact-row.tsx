import type React from "react";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { PlayerImpact } from "src/queries/getTeamImpact";
import { formatRankDelta, rankImpactPillClass } from "./format";

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

// Collapsed row for the player-impact accordion. Mirrors the visual rhythm
// of the comparison table — magenta accents, right-aligned numbers — and
// shows the four fields that matter at a glance: avatar/name/team, points
// the player gave the user, rank impact pill, and a compact start/captaincy
// counter.
const PlayerImpactRow: React.FC<Props> = ({ player, showRankImpact }) => {
  const position = POSITION_LABEL[player.element_type] ?? "—";
  const captaincyCount = player.captaincies + player.triple_captaincies;

  return (
    <div className="flex w-full items-center gap-2 px-2 py-1 sm:gap-3 sm:px-3">
      <div className="relative h-8 w-8 shrink-0 sm:h-10 sm:w-10">
        <FootballerImage
          code={player.code}
          className="bg-accent4/20 h-full w-full rounded-full object-contain"
        />
        <img
          src={getTeamsBadge(player.team_code)}
          alt=""
          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary p-[1px]"
        />
      </div>

      <div className="flex min-w-0 flex-col items-start text-left">
        <span className="truncate text-xs font-semibold text-text sm:text-sm">
          {player.web_name}
        </span>
        <span className="text-text/60 text-[10px] sm:text-xs">
          {position} · {player.starts} start{player.starts === 1 ? "" : "s"}
          {captaincyCount > 0 ? ` · ${captaincyCount}× C` : ""}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-text/60 text-[10px] sm:text-xs">pts</span>
          <span className="text-sm font-semibold text-text sm:text-base">
            {player.points_for_user}
          </span>
        </div>
        {showRankImpact && (
          <span
            className={`min-w-[3.5rem] rounded-md px-2 py-1 text-center text-xs font-semibold sm:min-w-[4.5rem] sm:text-sm ${rankImpactPillClass(
              player.rank_impact,
            )}`}
          >
            {formatRankDelta(player.rank_impact)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerImpactRow;

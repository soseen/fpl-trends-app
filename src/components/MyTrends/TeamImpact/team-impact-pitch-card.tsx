import type React from "react";
import clsx from "clsx";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { TeamImpactTile } from "src/queries/getTeamImpact";
import { formatRankDelta, rankImpactColorClass } from "./format";
import { useOpenPlayerDetails } from "./use-open-player-details";
import PlayerCardShell from "src/components/PlayerCard/player-card-shell";

type Props = {
  tile: TeamImpactTile;
  showRankImpact: boolean;
};

const TeamImpactPitchCard: React.FC<Props> = ({ tile, showRankImpact }) => {
  const openDetails = useOpenPlayerDetails();
  return (
    <PlayerCardShell
      onClick={() => openDetails(tile.player_id)}
      ariaLabel={`Open ${tile.web_name} details`}
      className="h-[100px] w-16 sm:w-20 md:h-[140px] md:w-24 lg:h-[188px] lg:w-32"
      imageAreaClassName="flex-1 pt-1.5 md:pt-2"
      topLeft={
        <span className="inline-flex items-center rounded-md bg-accent3/85 p-0.5 shadow-sm ring-1 ring-inset ring-accent4/40 md:p-1">
          <img
            src={getTeamsBadge(tile.team_code)}
            alt=""
            className="block h-3 w-3 object-contain md:h-4 md:w-4"
          />
        </span>
      }
      image={
        <FootballerImage
          code={tile.code}
          className="h-auto max-h-full w-auto max-w-[92%] rounded-none object-contain md:max-h-[88%] md:max-w-[78%]"
        />
      }
      name={tile.web_name}
      middleRow={
        showRankImpact ? (
          <span
            className={clsx(
              "text-[9px] font-semibold tabular-nums leading-none sm:text-[10px] md:text-xs",
              rankImpactColorClass(tile.rank_impact),
            )}
          >
            {formatRankDelta(tile.rank_impact)}
          </span>
        ) : null
      }
      points={`${tile.points_for_user} pts`}
    />
  );
};

export default TeamImpactPitchCard;

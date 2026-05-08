import type React from "react";
import clsx from "clsx";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { TeamImpactTile } from "src/queries/getTeamImpact";
import { useOpenPlayerDetails } from "./use-open-player-details";
import PlayerCardShell from "src/components/PlayerCard/player-card-shell";
import { formatRankDelta, rankImpactColorClass } from "./format";

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
      className="h-[104px] w-[68px] xs:h-[128px] xs:w-24 md:h-[152px] md:w-28 lg:h-[182px] lg:w-36"
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
      topRight={
        showRankImpact ? (
          <span
            className={clsx(
              "rounded-l-md bg-accent3/95 px-1 py-[2px] text-[8px] font-semibold tabular-nums leading-none shadow-md ring-1 ring-inset ring-accent4/60 sm:text-[9px] md:px-1.5 md:text-[10px]",
              rankImpactColorClass(tile.rank_impact),
            )}
            title="Estimated rank impact"
          >
            {formatRankDelta(tile.rank_impact)}
          </span>
        ) : undefined
      }
      topRightClassName="bottom-1 top-auto gap-0.5 md:bottom-2"
      image={
        <FootballerImage
          code={tile.code}
          className="h-auto max-h-[88%] w-auto max-w-[86%] rounded-none object-contain md:max-h-[86%] md:max-w-[78%]"
        />
      }
      name={tile.web_name}
      points={`${tile.points_for_user} pts`}
    />
  );
};

export default TeamImpactPitchCard;

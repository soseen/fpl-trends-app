import type React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { TeamImpactTile } from "src/queries/getTeamImpact";
import { formatRankDelta, rankImpactColorClass } from "./format";
import { useOpenPlayerDetails } from "./use-open-player-details";

type Props = {
  tile: TeamImpactTile;
  // When the API couldn't compute rank-per-point (no stratum, missing
  // sample), the tile hides the rank-impact row entirely so we don't show
  // misleading zeros.
  showRankImpact: boolean;
};

// Tile layout follows the user's spec:
//   [shirt]
//   PlayerName
//   +15.0k  <- rank impact (between name and points)
//   42 pts
//
// Visually mirrors Home/BestScoringFootballers/pitch-card.tsx so the
// pitch reads consistently. The middle row is the only structural change.
//
// Tile is clickable: opens the global FootballerDetails modal/drawer (the
// same one Players table, Compare tool, and Home Best XI use). We look up
// the enriched-stats version of the player by id; if it's missing (rare,
// e.g. mid-season transfer out of the league), the click is a no-op
// rather than throwing.
const TeamImpactPitchCard: React.FC<Props> = ({ tile, showRankImpact }) => {
  const rankColor = rankImpactColorClass(tile.rank_impact);
  const openDetails = useOpenPlayerDetails();
  return (
    <div className="flex">
      <Button
        onClick={() => openDetails(tile.player_id)}
        className="relative m-auto flex h-[92px] w-14 flex-col items-center justify-center gap-0 overflow-hidden rounded-md bg-secondary p-0 pt-4 text-text shadow-large before:absolute before:-left-12 before:-top-10 before:z-10 before:h-[80px] before:w-[85px] before:skew-x-[-48deg] before:bg-magenta2 before:shadow-large sm:w-20 md:h-[136px] md:w-24 md:before:-left-10 md:before:-top-8 lg:h-[188px] lg:w-32"
      >
        <FootballerImage
          code={tile.code}
          className="m-auto h-auto w-12 rounded-none object-contain px-2 sm:w-[72px] md:h-auto md:w-[64px] lg:w-[105px]"
        />
        <div className="flex w-full items-center justify-center bg-magenta md:p-[2px]">
          <p className="md:text-md overflow-hidden text-ellipsis whitespace-nowrap text-center text-[8px] leading-3 text-text sm:text-xs">
            {tile.web_name}
          </p>
        </div>
        {showRankImpact && (
          <div
            className={clsx(
              "flex w-full items-center justify-center bg-primary px-1 md:p-[2px]",
              rankColor,
            )}
          >
            <p className="md:text-md text-[8px] font-semibold leading-3 sm:text-xs">
              {formatRankDelta(tile.rank_impact)}
            </p>
          </div>
        )}
        <div className="flex w-full items-center justify-center rounded-b-md bg-magenta2 text-text md:p-[2px]">
          <p className="md:text-md text-[8px] leading-3 sm:text-xs">
            {tile.points_for_user} pts
          </p>
        </div>
        <img
          src={getTeamsBadge(tile.team_code)}
          alt=""
          className="absolute left-1 top-1 z-20 w-3 object-cover md:w-5"
        />
      </Button>
    </div>
  );
};

export default TeamImpactPitchCard;

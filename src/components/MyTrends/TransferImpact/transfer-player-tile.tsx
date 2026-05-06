import type React from "react";
import clsx from "clsx";
import { Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { TransferImpactPlayer } from "src/queries/getManagerTransfers";
import { formatRankDelta } from "../TeamImpact/format";
import { useOpenPlayerDetails } from "../TeamImpact/use-open-player-details";

type Props = {
  player: TransferImpactPlayer;
  // "out" tiles get a faded treatment so the eye reads OUT-on-the-left,
  // IN-on-the-right at a glance without needing to parse labels.
  side: "in" | "out";
  // GW the IN player was later transferred out. When set on an "in"
  // tile, we render a small "→ GW X" chip in the top-right corner so
  // the user can see at a glance how long they held the player.
  // Ignored on "out" tiles.
  soldGw?: number | null;
};

// Compact pitch-style tile for a single transferred player. Layout mirrors
// TeamImpactPitchCard so the visual language is consistent across My
// Trends sections, but it's narrower (we render two of these side-by-side
// on mobile with an arrow between them, so each tile must fit in <half
// the viewport). Clicking opens the global FootballerDetails modal.
const TransferPlayerTile: React.FC<Props> = ({ player, side, soldGw }) => {
  const openDetails = useOpenPlayerDetails();
  const isOut = side === "out";
  const showSoldBadge = !isOut && typeof soldGw === "number";
  const rankImpact = player.rank_impact;
  const showRank = rankImpact != null;

  return (
    // The wrapper is `relative` so the sold-gw badge can be a sibling of
    // the Button rather than a child. The Button needs `overflow-hidden`
    // to clip the diagonal magenta `before:` banner that intrudes from
    // outside its bounds, but that same overflow would also clip the
    // sold-gw badge if it lived inside. Lifting the badge one level up
    // breaks it out of the clip without giving up the banner effect.
    <div className="relative flex">
      <Button
        onClick={() => openDetails(player.player_id)}
        className={clsx(
          "relative m-auto flex h-[80px] w-12 flex-col items-center justify-center gap-0 overflow-hidden rounded-md bg-secondary p-0 pt-3 text-text shadow-large before:absolute before:-left-12 before:-top-10 before:z-10 before:h-[80px] before:w-[85px] before:skew-x-[-48deg] before:bg-magenta2 before:shadow-large sm:h-[100px] sm:w-16 md:h-[120px] md:w-20",
          isOut && "opacity-60 grayscale-[40%]",
        )}
      >
        <FootballerImage
          code={player.code}
          className="m-auto h-auto w-10 rounded-none object-contain px-1 sm:w-14 md:w-16"
        />
        <div className="flex w-full items-center justify-center bg-magenta md:p-[2px]">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap px-1 text-center text-[8px] leading-3 text-text sm:text-[10px] md:text-xs">
            {player.web_name}
          </p>
        </div>
        <div
          className="flex w-full items-center justify-center rounded-b-md bg-magenta2 text-text md:p-[2px]"
          title={
            showRank
              ? `${player.points_in_window} pts · ${formatRankDelta(
                  rankImpact,
                )} estimated rank`
              : undefined
          }
        >
          <p className="text-[8px] font-semibold leading-3 sm:text-[10px] md:text-xs">
            {player.points_in_window} pts
          </p>
        </div>
        <img
          src={getTeamsBadge(player.team_code)}
          alt=""
          className="absolute left-0.5 top-0.5 z-20 w-3 object-cover md:w-4"
        />
      </Button>
      {showSoldBadge && (
        // pointer-events-none lets clicks on the badge area pass through
        // to the Button beneath, preserving the open-details click target.
        <span
          className="pointer-events-none absolute -top-2 right-0 z-30 flex items-center gap-[2px] rounded-full bg-magenta2 px-[2px]"
          title={`Sold in GW ${soldGw}`}
        >
          <span className="flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-magenta px-[3px] text-[8px] font-semibold leading-none text-white shadow-md sm:h-5 sm:min-w-5 sm:text-[9px]">
            {soldGw}
          </span>
          <Redo className="h-4 w-4 text-text/90" aria-hidden />
        </span>
      )}
    </div>
  );
};

export default TransferPlayerTile;

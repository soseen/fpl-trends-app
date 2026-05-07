import type React from "react";
import clsx from "clsx";
import { Redo } from "lucide-react";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { TransferImpactPlayer } from "src/queries/getManagerTransfers";
import { useOpenPlayerDetails } from "../TeamImpact/use-open-player-details";
import PlayerCardShell from "src/components/PlayerCard/player-card-shell";

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

// Compact pitch-style tile for a single transferred player. Shares the
// PlayerCardShell visual language used elsewhere in the app (Best XI,
// Outliers, Team Impact). The relative wrapper exists so the sold-gw
// badge can sit OUTSIDE the card's overflow-hidden boundary while
// still anchoring to the tile's top-right.
const TransferPlayerTile: React.FC<Props> = ({ player, side, soldGw }) => {
  const openDetails = useOpenPlayerDetails();
  const isOut = side === "out";
  const showSoldBadge = !isOut && typeof soldGw === "number";

  return (
    <div
      className={clsx(
        "relative flex",
        isOut && "opacity-60 grayscale-[40%]",
      )}
    >
      <PlayerCardShell
        onClick={() => openDetails(player.player_id)}
        ariaLabel={`Open ${player.web_name} details`}
        className="h-[88px] w-12 sm:h-[108px] sm:w-16 md:h-[128px] md:w-20"
        topLeft={
          <span className="inline-flex items-center rounded-md bg-accent3/85 p-0.5 shadow-sm ring-1 ring-inset ring-accent4/40 md:p-1">
            <img
              src={getTeamsBadge(player.team_code)}
              alt=""
              className="block h-3 w-3 object-contain md:h-4 md:w-4"
            />
          </span>
        }
        image={
          <FootballerImage
            code={player.code}
            className="h-auto max-h-full w-auto max-w-[92%] rounded-none object-contain md:max-h-[88%] md:max-w-[78%]"
          />
        }
        name={player.web_name}
        points={`${player.points_in_window} pts`}
      />
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

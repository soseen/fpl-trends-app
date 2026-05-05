import type React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { CaptainPlayer } from "src/queries/getCaptainImpact";
import { useOpenPlayerDetails } from "../TeamImpact/use-open-player-details";

type Props = {
  player: CaptainPlayer;
  // "user" tiles are the manager's actual pick (full opacity).
  // "reference" tiles are counterfactual captains (top-10k consensus or
  // overall most-captained) and render faded.
  variant: "user" | "reference";
};

// Compact captain tile mirroring TransferPlayerTile's visual language.
// Variant-only opacity differentiation: user picks at full strength,
// reference picks faded — no chip overlay needed since the section's
// labels above each tile carry the meaning.
const CaptainTile: React.FC<Props> = ({ player, variant }) => {
  const openDetails = useOpenPlayerDetails();
  const isReference = variant === "reference";

  return (
    <Button
      onClick={() => openDetails(player.player_id)}
      className={clsx(
        "relative m-auto flex h-[80px] w-12 flex-col items-center justify-center gap-0 overflow-hidden rounded-md bg-secondary p-0 pt-3 text-text shadow-large before:absolute before:-left-12 before:-top-10 before:z-10 before:h-[80px] before:w-[85px] before:skew-x-[-48deg] before:bg-magenta2 before:shadow-large sm:h-[100px] sm:w-16 md:h-[120px] md:w-20",
        isReference && "opacity-60 grayscale-[40%]",
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
      <div className="flex w-full items-center justify-center rounded-b-md bg-magenta2 text-text md:p-[2px]">
        <p className="text-[8px] leading-3 sm:text-[10px] md:text-xs">
          {player.effective_points} pts
        </p>
      </div>
      <img
        src={getTeamsBadge(player.team_code)}
        alt=""
        className="absolute left-0.5 top-0.5 z-20 w-3 object-cover md:w-4"
      />
    </Button>
  );
};

export default CaptainTile;

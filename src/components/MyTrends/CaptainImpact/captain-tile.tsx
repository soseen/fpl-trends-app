import type React from "react";
import clsx from "clsx";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { getTeamsBadge } from "src/utils/images";
import type { CaptainPlayer } from "src/queries/getCaptainImpact";
import { useOpenPlayerDetails } from "../TeamImpact/use-open-player-details";
import PlayerCardShell from "src/components/PlayerCard/player-card-shell";

type Props = {
  player: CaptainPlayer;
  // "user" tiles are the manager's actual pick (full opacity).
  // "reference" tiles are counterfactual captains (top-10k consensus or
  // overall most-captained) and render faded.
  variant: "user" | "reference";
};

// Compact captain tile that mirrors the PlayerCardShell language used
// across the app. Variant-only opacity differentiation: user picks at
// full strength, reference picks faded — no chip overlay needed since
// the section's labels above each tile carry the meaning.
// Effective ownership: ownership weighted by armband multipliers. Mirrors the
// backend formula in fpl-trends-api/src/managers/getTeamImpact.ts (line 865):
//   eo = ownership_pct + captain_rate + 2 * triple_captain_rate
const computeEO = (player: CaptainPlayer): number =>
  (player.ownership_pct ?? 0) +
  (player.captain_rate ?? 0) +
  2 * (player.triple_captain_rate ?? 0);

const CaptainTile: React.FC<Props> = ({ player, variant }) => {
  const openDetails = useOpenPlayerDetails();
  const isReference = variant === "reference";
  const pointsLabel = Number.isInteger(player.effective_points)
    ? `${player.effective_points}`
    : player.effective_points.toFixed(1);
  const eo = computeEO(player);

  return (
    <div className={clsx("flex", isReference && "opacity-60 grayscale-[40%]")}>
      <PlayerCardShell
        onClick={() => openDetails(player.player_id)}
        ariaLabel={`Open ${player.web_name} details`}
        className="h-[88px] w-12 sm:h-[108px] sm:w-16 md:h-[140px] md:w-[84px] lg:h-[160px] lg:w-24"
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
        middleRow={
          eo > 0 ? (
            <span className="text-[9px] text-text/60 sm:text-[10px]">
              EO {(eo * 100).toFixed(1)}%
            </span>
          ) : undefined
        }
        points={`${pointsLabel} pts`}
      />
    </div>
  );
};

export default CaptainTile;

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
  const eoPct = eo * 100;
  const eoLabel = eoPct >= 10 ? eoPct.toFixed(0) : eoPct.toFixed(1);

  return (
    <div className={clsx("flex", isReference && "opacity-60 grayscale-[40%]")}>
      <PlayerCardShell
        onClick={() => openDetails(player.player_id)}
        ariaLabel={`Open ${player.web_name} details`}
        className="h-[112px] w-20 xs:h-[128px] xs:w-24 md:h-[152px] md:w-28 lg:h-[182px] lg:w-36"
        topLeft={
          <span className="inline-flex items-center rounded-md bg-accent3/85 p-0.5 shadow-sm ring-1 ring-inset ring-accent4/40 md:p-1">
            <img
              src={getTeamsBadge(player.team_code)}
              alt=""
              className="block h-3 w-3 object-contain md:h-4 md:w-4"
            />
          </span>
        }
        topRight={
          eo > 0 ? (
            <span
              title={`Effective ownership: ${eoPct.toFixed(1)}%`}
              className="rounded-l-md bg-accent3/95 px-1 py-[2px] text-[8px] font-semibold leading-none text-text shadow-md ring-1 ring-inset ring-accent4/60 sm:text-[9px] md:px-1.5 md:text-[10px]"
            >
              EO {eoLabel}%
            </span>
          ) : undefined
        }
        topRightClassName="bottom-1 top-auto gap-0.5 md:bottom-2"
        image={
          <FootballerImage
            code={player.code}
            className="h-auto max-h-[88%] w-auto max-w-[86%] rounded-none object-contain md:max-h-[86%] md:max-w-[78%]"
          />
        }
        name={player.web_name}
        points={`${pointsLabel} pts`}
      />
    </div>
  );
};

export default CaptainTile;

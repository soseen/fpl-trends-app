import type React from "react";
import type { TeamImpact } from "src/queries/getTeamImpact";
import PlayerImpactAccordion from "./player-impact-accordion";

type Props = { data: TeamImpact };

const RankKillersView: React.FC<Props> = ({ data }) => {
  const killers = data.rank_killers;
  if (killers.length === 0) return null;

  return (
    <div className="rounded-md border border-accent4 bg-primary p-2 sm:p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold text-text sm:text-base">
          Top 10 rank killers
        </h3>
        <p className="text-text/60 text-[11px] sm:text-xs">
          Highly-owned players you didn&apos;t have that scored big
        </p>
      </div>
      <PlayerImpactAccordion players={killers} showRankImpact />
    </div>
  );
};

export default RankKillersView;

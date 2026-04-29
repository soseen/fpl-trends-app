import type React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PlayerImpact } from "src/queries/getTeamImpact";
import PlayerImpactRow from "./player-impact-row";
import PlayerImpactDetail from "./player-impact-detail";

type Props = {
  players: PlayerImpact[];
  showRankImpact: boolean;
};

// Sort order is set by the backend (rank_impact desc when available, else
// points desc as fallback). Frontend just renders.
const PlayerImpactAccordion: React.FC<Props> = ({ players, showRankImpact }) => {
  if (players.length === 0) {
    return (
      <div className="text-text/60 px-4 py-6 text-center text-sm">
        No player data for this gameweek range yet.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {players.map((p) => (
        <AccordionItem key={p.player_id} value={`p-${p.player_id}`}>
          <AccordionTrigger className="px-1 py-0">
            <PlayerImpactRow player={p} showRankImpact={showRankImpact} />
          </AccordionTrigger>
          <AccordionContent>
            <PlayerImpactDetail player={p} showRankImpact={showRankImpact} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default PlayerImpactAccordion;

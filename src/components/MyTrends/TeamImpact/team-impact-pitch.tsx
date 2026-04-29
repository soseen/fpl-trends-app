import type React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TeamImpactTile } from "src/queries/getTeamImpact";
import TeamImpactPitchCard from "./team-impact-pitch-card";

type Props = {
  xi: {
    gk: TeamImpactTile;
    def: TeamImpactTile[];
    mid: TeamImpactTile[];
    fwd: TeamImpactTile[];
  };
  startGw: number;
  endGw: number;
  showRankImpact: boolean;
};

const PitchRow: React.FC<{ tiles: TeamImpactTile[]; showRankImpact: boolean }> = ({
  tiles,
  showRankImpact,
}) => (
  <div className="mx-auto mb-2 flex max-w-[900px] items-center justify-center gap-4 px-4 text-text md:mb-4 lg:mb-8 lg:px-8">
    {tiles.map((t) => (
      <div key={t.player_id} className="flex justify-center md:mx-2 lg:mx-2">
        <TeamImpactPitchCard tile={t} showRankImpact={showRankImpact} />
      </div>
    ))}
  </div>
);

const TeamImpactPitch: React.FC<Props> = ({ xi, startGw, endGw, showRankImpact }) => {
  return (
    <div className="mt-4 flex w-full flex-col justify-center md:mt-6">
      <h3 className="text-center text-sm text-text md:text-xl">
        {`Your most-played XI (gameweek ${startGw}–${endGw})`}
      </h3>
      <div className="mt-2 min-h-[380px] w-full bg-[url(src/assets/pitch.png)] bg-cover bg-center bg-no-repeat sm:min-h-[580px] md:mt-6 md:min-h-[660px] md:bg-contain lg:min-h-[900px]">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex w-full justify-around"
            key={`${startGw}-${endGw}-${xi.gk.player_id}`}
          >
            <div className="mb-6 mt-0 min-h-[380px] w-full sm:min-h-[580px] md:-mt-1 md:mb-0 md:min-h-[660px] lg:-mt-4 lg:min-h-[900px]">
              <PitchRow tiles={[xi.gk]} showRankImpact={showRankImpact} />
              <PitchRow tiles={xi.def} showRankImpact={showRankImpact} />
              <PitchRow tiles={xi.mid} showRankImpact={showRankImpact} />
              <PitchRow tiles={xi.fwd} showRankImpact={showRankImpact} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamImpactPitch;

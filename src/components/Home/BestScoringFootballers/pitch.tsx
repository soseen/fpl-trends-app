import React from "react";
import {
  BestScoringFootballer,
  useBestScoringFootballers,
} from "./use-best-scoring-footballers";
import PitchCard from "./pitch-card";
import { AnimatePresence, motion } from "motion/react";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import PitchSkeleton from "./pitch.skeleton";

const PitchRow = ({ data }: { data: BestScoringFootballer[] }) => {
  return (
    <div className="mx-auto mb-2 flex max-w-[900px] items-center justify-center gap-4 px-4 text-text md:mb-4 lg:mb-8 lg:px-8">
      {data.map((f) => (
        <div key={f.id} className="flex justify-center md:mx-2 lg:mx-2">
          <PitchCard footballer={f} />
        </div>
      ))}
    </div>
  );
};

const Pitch = () => {
  const {
    footballers: { goalkeepers, defenders, midfielders, strikers },
    startGameweek,
    endGameweek,
  } = useBestScoringFootballers({
    teamLimitationOn: true,
  });
  const { status } = useAppInitContext();

  if (status === AppInitStatus.loading) return <PitchSkeleton />;
  return (
    <div className="mt-4 flex w-full flex-col justify-center md:mt-6">
      <h2 className="text-center text-sm text-text md:text-xl">
        {`Highest Scoring Team (gameweek ${startGameweek}-${endGameweek})`}
      </h2>
      <div className="mt-2 min-h-[350px] w-full bg-[url(src/assets/pitch.png)] bg-cover bg-center bg-no-repeat sm:min-h-[550px] md:mt-6 md:min-h-[620px] md:bg-contain lg:min-h-[860px]">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex w-full justify-around"
            key={`${startGameweek}${endGameweek}`}
          >
            <div className="mb-6 mt-0 min-h-[350px] w-full sm:min-h-[550px] md:-mt-1 md:mb-0 md:min-h-[620px] lg:-mt-4 lg:min-h-[860px]">
              <PitchRow data={goalkeepers} />
              <PitchRow data={defenders} />
              <PitchRow data={midfielders} />
              <PitchRow data={strikers} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Pitch;

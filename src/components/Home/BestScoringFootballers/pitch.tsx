import type { BestScoringFootballer } from "./use-best-scoring-footballers";
import { useBestScoringFootballers } from "./use-best-scoring-footballers";
import PitchCard from "./pitch-card";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import PitchSkeleton from "./pitch.skeleton";

const PitchRow = ({ data }: { data: BestScoringFootballer[] }) => {
  return (
    <div className="mx-auto mb-2 flex max-w-[900px] flex-nowrap items-center justify-center gap-x-1 gap-y-2 px-2 text-text md:mb-4 md:gap-x-4 md:gap-y-3 md:px-4 lg:mb-8 lg:px-8">
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
  const selectedPlayersCount =
    goalkeepers.length + defenders.length + midfielders.length + strikers.length;

  if (status === AppInitStatus.loading || selectedPlayersCount === 0) {
    return <PitchSkeleton />;
  }
  return (
    <div className="mt-4 flex w-full flex-col justify-center md:mt-6">
      <h2 className="mb-6 text-center text-sm text-text md:mb-12 md:text-xl">
        {`Highest Scoring Team (gameweek ${startGameweek}-${endGameweek})`}
      </h2>
      <div className="relative mt-2 min-h-[350px] w-full overflow-hidden sm:min-h-[550px] md:mt-6 md:min-h-[620px] lg:min-h-[860px]">
        <img
          src="/pitch.png"
          alt=""
          width={2850}
          height={2200}
          className="absolute inset-0 h-full w-full object-cover object-center md:object-contain"
          decoding="sync"
          fetchPriority="high"
        />
        <div
          className="relative z-10 flex w-full justify-around"
          key={`${startGameweek}${endGameweek}`}
        >
          <div className="mb-6 mt-0 min-h-[350px] w-full -translate-y-5 sm:min-h-[550px] sm:-translate-y-7 md:-mt-1 md:mb-0 md:min-h-[620px] md:-translate-y-8 lg:-mt-4 lg:min-h-[860px] lg:-translate-y-10">
            <PitchRow data={goalkeepers} />
            <PitchRow data={defenders} />
            <PitchRow data={midfielders} />
            <PitchRow data={strikers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pitch;

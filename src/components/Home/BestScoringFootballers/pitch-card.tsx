import { useMemo } from "react";
import { type BestScoringFootballer } from "./use-best-scoring-footballers";
import { getTeamsBadge } from "src/utils/images";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import PlayerCardShell from "src/components/PlayerCard/player-card-shell";
import StatBadge from "src/components/PlayerCard/stat-badge";
import { buildReturnStats } from "src/components/PlayerCard/return-stats";

type Props = {
  footballer: BestScoringFootballer;
};

const PitchCard = ({ footballer }: Props) => {
  const { setFootballer } = useFootballerDetailsContext();
  const returnStats = useMemo(() => buildReturnStats(footballer), [footballer]);

  return (
    <PlayerCardShell
      onClick={() => setFootballer(footballer)}
      ariaLabel={`Open ${footballer.web_name} details`}
      className="h-[104px] w-[68px] xs:h-[128px] xs:w-24 md:h-[152px] md:w-28 lg:h-[182px] lg:w-36"
      imageAreaClassName="min-h-0 flex-1 pt-1.5 md:pt-2"
      topLeft={
        <span className="inline-flex items-center rounded-md bg-accent3/85 p-0.5 shadow-sm ring-1 ring-inset ring-accent4/40 md:p-1">
          <img
            src={getTeamsBadge(footballer.team_code)}
            alt={footballer.teams?.short_name}
            className="block h-3 w-3 object-contain md:h-4 md:w-4"
          />
        </span>
      }
      topRight={returnStats.slice(0, 2).map((stat) => (
        <StatBadge
          key={stat.key}
          value={stat.value}
          icon={stat.icon}
          label={stat.label}
          compact
        />
      ))}
      topRightClassName="bottom-1 top-auto gap-0.5 md:bottom-2"
      image={
        <FootballerImage
          code={footballer.code}
          className="h-[62px] w-auto max-w-[86%] rounded-none object-contain xs:h-[82px] md:h-[98px] md:max-w-[78%] lg:h-[120px]"
        />
      }
      name={footballer.web_name}
      points={`${footballer.totalPoints} pts`}
      pointsHighlight={!!footballer.isBestScoringPlayer}
    />
  );
};

export default PitchCard;

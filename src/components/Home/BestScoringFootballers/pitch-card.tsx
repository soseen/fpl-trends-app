import type React from "react";
import { useMemo } from "react";
import { type BestScoringFootballer } from "./use-best-scoring-footballers";
import { getTeamsBadge } from "src/utils/images";
import { CircleDot, Handshake, LockKeyhole, Shield } from "lucide-react";
import { FootballerPosition } from "src/queries/types";
import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import PlayerCardShell from "src/components/PlayerCard/player-card-shell";
import StatBadge from "src/components/PlayerCard/stat-badge";

type Props = {
  footballer: BestScoringFootballer;
};

type StatKey = "totalGoals" | "totalAssists" | "totalCleanSheets" | "totalDefconBonuses";

type SelectedStats = Pick<FootballerWithGameweekStats, StatKey>;

const STAT_META: Record<StatKey, { icon: React.ReactNode; label: string }> = {
  totalGoals: { icon: <CircleDot />, label: "Goals" },
  totalAssists: { icon: <Handshake />, label: "Assists" },
  totalCleanSheets: { icon: <LockKeyhole />, label: "Clean sheets" },
  totalDefconBonuses: { icon: <Shield />, label: "Defcons" },
};

const PitchCard = ({ footballer }: Props) => {
  const { setFootballer } = useFootballerDetailsContext();
  const selectedStats = useMemo(() => {
    const keys: StatKey[] = [
      "totalGoals",
      "totalAssists",
      "totalCleanSheets",
      "totalDefconBonuses",
    ];
    return keys
      .filter((key) => ((footballer[key as keyof SelectedStats] as number) ?? 0) > 0)
      .filter(
        (key) =>
          !(
            key === "totalCleanSheets" &&
            [FootballerPosition.MID, FootballerPosition.FWD].includes(
              footballer.element_type,
            )
          ),
      )
      .map((key) => ({
        key,
        value: footballer[key as keyof SelectedStats] as number,
      }));
  }, [footballer]);

  return (
    <PlayerCardShell
      onClick={() => setFootballer(footballer)}
      ariaLabel={`Open ${footballer.web_name} details`}
      className="h-[104px] w-[68px] xs:h-[128px] xs:w-24 md:h-[152px] md:w-28 lg:h-[182px] lg:w-36"
      imageAreaClassName="flex-1 pt-1.5 md:pt-2"
      topLeft={
        <span className="inline-flex items-center rounded-md bg-accent3/85 p-0.5 shadow-sm ring-1 ring-inset ring-accent4/40 md:p-1">
          <img
            src={getTeamsBadge(footballer.team_code)}
            alt={footballer.teams?.short_name}
            className="block h-3 w-3 object-contain md:h-4 md:w-4"
          />
        </span>
      }
      topRight={selectedStats.slice(0, 2).map((stat) => (
        <StatBadge
          key={stat.key}
          value={stat.value}
          icon={STAT_META[stat.key].icon}
          label={STAT_META[stat.key].label}
          compact
        />
      ))}
      topRightClassName="bottom-1 top-auto gap-0.5 md:bottom-2"
      image={
        <FootballerImage
          code={footballer.code}
          mobileSize="small"
          className="h-auto max-h-[88%] w-auto max-w-[86%] rounded-none object-contain md:max-h-[86%] md:max-w-[78%]"
        />
      }
      name={footballer.web_name}
      points={`${footballer.totalPoints} pts`}
      pointsHighlight={!!footballer.isBestScoringPlayer}
    />
  );
};

export default PitchCard;

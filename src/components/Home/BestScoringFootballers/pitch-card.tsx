import React, { useMemo } from "react";
import { AggregatedStats, BestScoringFootballer } from "./use-best-scoring-footballers";
import { getFootballersImage, getTeamsBadge } from "src/utils/images";
import { FaFutbol, FaHandshake } from "react-icons/fa";
import { TbLockFilled } from "react-icons/tb";
import { FootballerPosition } from "src/queries/types";
import clsx from "clsx";

type Props = {
  footballer: BestScoringFootballer;
};

type SelectedStats = Pick<AggregatedStats, "sumGoals" | "sumAssists" | "sumCleansheets">;

const getIcon = (key: keyof SelectedStats) => {
  switch (key) {
    case "sumGoals":
      return <FaFutbol />;
    case "sumAssists":
      return <FaHandshake />;
    case "sumCleansheets":
      return <TbLockFilled />;
    default:
      return null;
  }
};

const PitchCard = ({ footballer }: Props) => {
  const selectedStats = useMemo(() => {
    const stats = Object.keys(footballer.aggregatedStats)
      .filter(
        (key) =>
          ["sumGoals", "sumAssists", "sumCleansheets"].includes(key) &&
          footballer.aggregatedStats[key as keyof typeof footballer.aggregatedStats] > 0,
      )
      .filter(
        (key) =>
          !(
            key === "sumCleansheets" &&
            [FootballerPosition.midfielder, FootballerPosition.striker].includes(
              footballer.element_type,
            )
          ),
      );
    return stats.map((stat) => ({
      key: stat,
      value: footballer.aggregatedStats[stat as keyof typeof footballer.aggregatedStats],
    }));
  }, [footballer]);

  return (
    <div className="flex">
      <div className="relative m-auto w-14 flex-col items-center justify-center overflow-hidden rounded-md bg-secondary pt-4 text-text shadow-large before:absolute before:-left-12 before:-top-10 before:z-10 before:h-[80px] before:w-[85px] before:skew-x-[-48deg] before:bg-magenta2 before:shadow-large sm:w-20 md:w-24 md:before:-left-10 md:before:-top-8 lg:w-32">
        <img
          src={getFootballersImage(footballer.code)}
          alt={footballer.web_name}
          className="xs:w-9 m-auto w-7 object-cover sm:w-12 md:w-14 lg:w-[84px]"
        />
        <div className="flex items-center justify-center bg-magenta md:p-[2px]">
          <p className="md:text-md overflow-hidden text-ellipsis whitespace-nowrap text-center text-[8px] text-text sm:text-xs">
            {footballer.web_name}
          </p>
        </div>
        <div
          className={clsx(
            "flex items-center justify-center rounded-b-md md:p-[2px]",
            footballer?.isBestScoringPlayer
              ? "bg-highlight text-primary"
              : "bg-magenta2 text-text",
          )}
        >
          <p className="md:text-md text-[8px] sm:text-xs">
            {footballer.aggregatedStats.sumPoints} pts
          </p>
        </div>
        <div className="absolute right-0 top-[2px] z-50 flex-col gap-[2px] md:top-1">
          {selectedStats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-end gap-[1px] rounded-r-md px-[2px] text-[8px] md:gap-1 md:px-2 md:text-xs lg:text-sm"
            >
              {stat.value} {getIcon(stat.key as keyof SelectedStats)}
            </div>
          ))}
        </div>
        <img
          src={getTeamsBadge(footballer.team_code)}
          alt={footballer.teams[0]?.short_name}
          className="absolute left-1 top-1 z-20 w-3 object-cover md:w-5"
        />
      </div>
    </div>
  );
};

export default PitchCard;

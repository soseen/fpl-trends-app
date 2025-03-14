import React, { useMemo } from "react";
import { BestScoringFootballer } from "./use-best-scoring-footballers";
import { getTeamsBadge } from "src/utils/images";
import { FaFutbol, FaHandshake } from "react-icons/fa";
import { TbLockFilled } from "react-icons/tb";
import { FootballerPosition } from "src/queries/types";
import clsx from "clsx";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { Button } from "@/components/ui/button";
import FootballerImage from "src/components/FootballerImage/footballer-image";

type Props = {
  footballer: BestScoringFootballer;
};

type SelectedStats = Pick<
  FootballerWithGameweekStats,
  "totalGoals" | "totalAssists" | "totalCleanSheets"
>;

const getIcon = (key: keyof SelectedStats) => {
  switch (key) {
    case "totalGoals":
      return <FaFutbol />;
    case "totalAssists":
      return <FaHandshake />;
    case "totalCleanSheets":
      return <TbLockFilled />;
    default:
      return null;
  }
};

const PitchCard = ({ footballer }: Props) => {
  const { setFootballer } = useFootballerDetailsContext();
  const selectedStats = useMemo(() => {
    const stats = Object.keys(footballer)
      .filter(
        (key) =>
          ["totalGoals", "totalAssists", "totalCleanSheets"].includes(key) &&
          (footballer[key as keyof typeof footballer] as number) > 0,
      )
      .filter(
        (key) =>
          !(
            key === "totalCleanSheets" &&
            [FootballerPosition.MID, FootballerPosition.FWD].includes(
              footballer.element_type,
            )
          ),
      );
    return stats.map((stat) => ({
      key: stat,
      value: footballer[stat as keyof typeof footballer] as number,
    }));
  }, [footballer]);

  return (
    <div className="flex">
      <Button
        onClick={() => setFootballer(footballer)}
        className="relative m-auto flex h-[81px] w-14 flex-col items-center justify-center gap-0 overflow-hidden rounded-md bg-secondary p-0 pt-4 text-text shadow-large before:absolute before:-left-12 before:-top-10 before:z-10 before:h-[80px] before:w-[85px] before:skew-x-[-48deg] before:bg-magenta2 before:shadow-large sm:w-20 md:h-[118px] md:w-24 md:before:-left-10 md:before:-top-8 lg:h-[170px] lg:w-32"
      >
        <FootballerImage
          code={footballer.code}
          className="m-auto h-auto w-12 rounded-none object-contain px-2 sm:w-[72px] md:h-auto md:w-[64px] lg:w-[105px]"
        />
        <div className="flex w-full items-center justify-center bg-magenta md:p-[2px]">
          <p className="md:text-md overflow-hidden text-ellipsis whitespace-nowrap text-center text-[8px] leading-3 text-text sm:text-xs">
            {footballer.web_name}
          </p>
        </div>
        <div
          className={clsx(
            "flex w-full items-center justify-center rounded-b-md md:p-[2px]",
            footballer?.isBestScoringPlayer
              ? "bg-highlight text-primary"
              : "bg-magenta2 text-text",
          )}
        >
          <p className="md:text-md text-[8px] leading-3 sm:text-xs">
            {footballer.totalPoints} pts
          </p>
        </div>
        <div className="absolute right-[2px] top-1 z-50 flex flex-col gap-[2px] md:top-1">
          {selectedStats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-end gap-[1px] rounded-r-md px-[2px] text-[7px] leading-[8px] md:gap-1 md:px-2 md:text-xs lg:text-sm"
            >
              <span className="flex">{stat.value}</span>
              <span className="flex h-2 items-center md:h-4 lg:h-5">
                {getIcon(stat.key as keyof SelectedStats)}
              </span>
            </div>
          ))}
        </div>
        <img
          src={getTeamsBadge(footballer.team_code)}
          alt={footballer.teams?.short_name}
          className="absolute left-1 top-1 z-20 w-3 object-cover md:w-5"
        />
      </Button>
    </div>
  );
};

export default PitchCard;

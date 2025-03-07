import clsx from "clsx";
import React, { useCallback, useMemo } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { getFootballersImage, getTeamsBadge } from "src/utils/images";
import CompareToolSearch from "./CompareToolSearch/compare-tool-search";
import { MdClose as CloseIcon } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { COMPARE_TOOL_STAT_KEYS } from "./use-compare-tool";
import { isNumber } from "lodash";
import {
  FaArrowDown,
  FaArrowUp,
  FaChevronRight,
  FaFutbol,
  FaHandshake,
} from "react-icons/fa";
import FootballerUpcomingFixtures from "src/components/FootballerDetails/footballer-upcoming-fixtures";
import { useDimensions } from "src/hooks/use-dimensions";
import { FootballerPosition } from "src/queries/types";
import { TbLockFilled } from "react-icons/tb";
import { RankedFootballer } from "./types";

type SelectedStats = Pick<
  RankedFootballer,
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

type Props = {
  index: number;
  footballer: RankedFootballer | null;
  selectedFootballers: (RankedFootballer | null)[];
  addFootballer: (footballerToAdd: FootballerWithGameweekStats, index: number) => void;
  removeFootballer: (footballerToRemove: RankedFootballer) => void;
  openFootballersProfile: (footballer: RankedFootballer) => void;
};

const CompareToolFootballerCard = ({
  index,
  footballer,
  selectedFootballers,
  addFootballer,
  removeFootballer,
  openFootballersProfile,
}: Props) => {
  const { isMD } = useDimensions();

  const seasonTotalComparison = useCallback(
    (key: keyof RankedFootballer) => {
      if (!footballer) return;
      const gamesPer90 = footballer?.minutes / 90;

      switch (key) {
        case "goalsPer90":
          return footballer?.goals_scored / gamesPer90;
        case "assistsPer90":
          return footballer?.assists / gamesPer90;
        case "xGIPer90":
          return footballer?.expected_goal_involvements_per_90;
        case "xGCPer90":
          return footballer?.expected_goals_conceded_per_90;
        case "minPerGame":
          return footballer?.minutes / footballer?.history?.length;
        default:
          return 0;
      }
    },
    [footballer],
  );

  const selectedStats = useMemo(() => {
    if (!footballer) return;
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
    <div className="w-min max-w-[110px] self-start shadow-large md:max-w-[165px] lg:max-w-[205px] xl:max-w-[268px]">
      <div className="relative rounded-t-md border-0 border-text bg-accent2 shadow-lg">
        {footballer && (
          <Button
            className="absolute -right-1 -top-2 z-50 bg-transparent p-0 hover:opacity-85 md:-right-3 md:-top-3"
            onClick={() => removeFootballer(footballer)}
          >
            <CloseIcon className="box-content h-2 w-2 rounded-full bg-accent p-1 text-text md:h-4 md:w-4 lg:h-6 lg:w-6" />
          </Button>
        )}
        <div
          className={clsx(
            "relative flex aspect-[220/280] h-[140px] flex-col items-end justify-end overflow-hidden rounded-md before:absolute before:-left-[84px] before:-top-32 before:z-10 before:h-[155px] before:w-[155px] before:-rotate-[45deg] before:bg-magenta2 before:shadow-large md:h-[210px] md:before:-left-28 md:before:-top-20 lg:h-[260px] lg:before:-left-36 lg:before:-top-11 lg:before:h-[150px] lg:before:w-[255px] xl:h-[310px]",
            !footballer && "before:hidden",
          )}
        >
          {footballer ? (
            <>
              <img
                src={getFootballersImage(footballer.code)}
                className="h-auto w-full self-end object-contain px-2 pt-10 lg:px-4"
              />

              <img
                src={getTeamsBadge(footballer.team_code)}
                className="absolute left-2 top-2 z-40 h-4 w-4 object-contain md:h-6 md:w-6 lg:h-12 lg:w-12"
              />
              <div className="absolute right-0 top-4 z-50 flex flex-col gap-1 md:top-6 md:gap-2">
                {!!selectedStats?.length &&
                  selectedStats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-end gap-1 rounded-l-md bg-accent3 px-1 text-[8px] text-text shadow-md md:gap-1 md:px-2 md:text-xs lg:px-3 lg:text-base"
                    >
                      {stat.value} {getIcon(stat.key as keyof SelectedStats)}
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <span className="m-auto">
              <CompareToolSearch
                selectedFootballers={selectedFootballers}
                addFootballer={addFootballer}
                index={index}
              />
            </span>
          )}
        </div>
        <div
          className={
            "flex w-full flex-col self-end text-center text-sm text-text md:text-base lg:text-lg"
          }
        >
          {footballer && (
            <>
              <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap bg-magenta px-2 text-center text-xs md:text-sm lg:text-base">
                {footballer?.web_name}
              </p>
              <p className="w-full bg-magenta2 text-center text-xs md:text-sm lg:text-base">
                {footballer?.totalPoints} pts
              </p>
              <div className="m-auto mb-2 md:mb-4">
                <FootballerUpcomingFixtures
                  max={isMD ? 3 : 4}
                  footballer={footballer as unknown as FootballerWithGameweekStats}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {footballer && (
        <>
          <div className="flex flex-col flex-nowrap justify-center rounded-b-md bg-accent3 text-text">
            {COMPARE_TOOL_STAT_KEYS.map((stat, index) => {
              const { rank, value } = footballer[stat.key];
              const parsedValue = isNumber(value) ? value : parseFloat(value);
              const seasonTotal = seasonTotalComparison(stat.key) ?? 0;

              const minValue = Math.min(parsedValue, seasonTotal);
              const maxValue = Math.max(parsedValue, seasonTotal);

              const isIncrease =
                stat.key === "xGIPer90"
                  ? parsedValue < seasonTotal
                  : parsedValue > seasonTotal;

              const diff =
                stat.key === "minPerGame"
                  ? `${(maxValue - minValue).toFixed(0)}'`
                  : (maxValue - minValue).toFixed(2);

              const isEqual =
                minValue === maxValue || diff === "0" || maxValue - minValue <= 0.02;

              return (
                <div key={footballer.id + stat.key}>
                  <div className="flex items-center gap-1 px-1 py-1 md:px-1 md:py-2 lg:px-2">
                    <p className="flex flex-1 text-[10px] sm:text-xs lg:text-base">
                      {stat.label}
                    </p>
                    {!isEqual && (
                      <span className="ml-auto flex gap-1 text-xs md:text-sm">
                        {!isMD && diff}
                        {isIncrease ? (
                          <FaArrowUp className="h-2 w-2 rotate-45 text-green-600 md:h-auto md:w-auto" />
                        ) : (
                          <FaArrowDown className="h-2 w-2 -rotate-45 text-red-600 md:h-auto md:w-auto" />
                        )}
                      </span>
                    )}

                    <div
                      className={clsx(
                        "rounded-md, flex w-fit flex-col justify-center gap-1 rounded-md px-1 text-xs text-text lg:text-base",
                        rank === 1
                          ? "bg-magenta"
                          : rank === 2
                            ? "bg-magenta2"
                            : "bg-secondary",
                      )}
                    >
                      {isNumber(value)
                        ? stat.key === "minPerGame"
                          ? value.toFixed(0)
                          : value.toFixed(2)
                        : value}
                    </div>
                  </div>
                  {index !== COMPARE_TOOL_STAT_KEYS.length - 1 && (
                    <span className="m-auto h-[1px] w-[85%] bg-accent3" />
                  )}
                </div>
              );
            })}
          </div>
          <Button
            className="flex w-full items-center justify-between gap-1 rounded-t-none bg-magenta px-2 py-[2px] text-xs text-text hover:opacity-85 md:text-base lg:px-4 lg:py-2"
            onClick={() => openFootballersProfile(footballer)}
          >
            {isMD ? "Profile" : "View Player's Profile"} <FaChevronRight />
          </Button>
        </>
      )}
    </div>
  );
};

export default CompareToolFootballerCard;

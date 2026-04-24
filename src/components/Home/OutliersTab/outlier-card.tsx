import React from "react";
import { FaFutbol, FaHandshake, FaShieldAlt } from "react-icons/fa";
import { FootballerPosition } from "src/queries/types";
import { TbLockFilled } from "react-icons/tb";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import FootballerImage from "src/components/FootballerImage/footballer-image";

type Props = {
  footballer: FootballerWithGameweekStats;
  include: {
    returns?: boolean;
    xGI?: boolean;
    selectedBy?: boolean;
    defcons?: boolean;
    totalPoints?: boolean;
  };
};

const getTopLeftBadge = (
  footballer: FootballerWithGameweekStats,
  include: Props["include"],
): { text: string; label: string } | null => {
  if (include.xGI)
    return { text: `${footballer?.xGIPerGame} xGI`, label: "xGI / g" };
  if (include.defcons)
    return {
      text: `${footballer?.defconsPerGame}`,
      label: "Defcons / g",
    };
  if (include.selectedBy)
    return { text: `${footballer?.selected_by_percent} %`, label: "Selected by" };
  return null;
};

const OutlierCard = ({ footballer, include }: Props) => {
  const { setFootballer } = useFootballerDetailsContext();
  const topLeftBadge = getTopLeftBadge(footballer, include);
  return (
    <Button
      onClick={() => setFootballer(footballer)}
      key={footballer.id}
      className="relative mb-4 flex h-auto w-full flex-col items-center justify-center gap-0 justify-self-center rounded-md border-accent2 bg-secondary p-0 pt-2 text-center shadow-lg md:pt-6"
    >
      {topLeftBadge && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute -left-[2px] -top-[2px] min-w-6 rotate-[-28deg] whitespace-nowrap rounded-md bg-magenta px-1 py-[2px] text-[10px] leading-4 text-white shadow-md md:-left-3 md:top-0 md:min-w-16 md:px-2 md:py-[2px] md:text-sm xl:text-base">
              {topLeftBadge.text}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-magenta3 px-2 py-1 text-white shadow-sm">
            {topLeftBadge.label}
          </TooltipContent>
        </Tooltip>
      )}
      <div className="flex max-h-[110px] w-auto flex-grow items-center justify-center px-2 md:max-h-[180px] md:px-4 lg:px-6">
        <FootballerImage
          code={footballer.code}
          className="aspect-[calc(220/280)] w-auto min-w-16 rounded-none object-contain"
        />
      </div>
      <p className="flex w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap bg-magenta px-1 text-center text-xs text-text md:py-[2px] md:text-base">
        {footballer?.web_name}
      </p>
      <p className="flex w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-b-md bg-magenta2 px-1 text-center text-xs text-text md:py-[2px] md:text-base">
        {footballer?.totalPoints} pts
      </p>
      {include?.returns && (
        <div className="absolute right-0 top-1 flex flex-col gap-[2px] md:gap-1">
          {!!footballer?.totalGoals && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="xl-text-sm flex items-center justify-end gap-1 rounded-l-md bg-accent2 px-1 py-[2px] pr-1 text-[9px] leading-3 text-text shadow-md md:text-sm lg:gap-1 lg:py-[2px] lg:pr-1 lg:text-xs xl:gap-2 xl:py-1 xl:pl-2 xl:pr-4 xl:text-base">
                  <p>{footballer.totalGoals}</p> <FaFutbol />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-magenta3 px-2 py-1 text-white shadow-sm">Goals</TooltipContent>
            </Tooltip>
          )}
          {!!footballer?.totalAssists && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="xl-text-sm flex items-center justify-end gap-1 rounded-l-md bg-accent2 px-1 py-[2px] pr-1 text-[9px] leading-3 text-text shadow-md md:text-sm lg:gap-1 lg:py-[2px] lg:pr-1 lg:text-xs xl:gap-2 xl:py-1 xl:pl-2 xl:pr-4 xl:text-base">
                  <p>{footballer?.totalAssists}</p> <FaHandshake />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-magenta3 px-2 py-1 text-white shadow-sm">Assists</TooltipContent>
            </Tooltip>
          )}
          {!!footballer.totalCleanSheets &&
            [FootballerPosition.DEF, FootballerPosition.GK].includes(
              footballer.element_type,
            ) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="xl-text-sm flex items-center justify-end gap-1 rounded-l-md bg-accent2 px-1 py-[2px] pr-1 text-[9px] leading-3 text-text shadow-md md:text-sm lg:gap-1 lg:py-[2px] lg:pr-1 lg:text-xs xl:gap-2 xl:py-1 xl:pl-2 xl:pr-4 xl:text-base">
                    <p>{footballer?.totalCleanSheets}</p> <TbLockFilled />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-magenta3 px-2 py-1 text-white shadow-sm">Clean sheets</TooltipContent>
              </Tooltip>
            )}
          {!!footballer?.totalDefconBonuses && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="xl-text-sm flex items-center justify-end gap-1 rounded-l-md bg-accent2 px-1 py-[2px] pr-1 text-[9px] leading-3 text-text shadow-md md:text-sm lg:gap-1 lg:py-[2px] lg:pr-1 lg:text-xs xl:gap-2 xl:py-1 xl:pl-2 xl:pr-4 xl:text-base">
                  <p>{footballer.totalDefconBonuses}</p> <FaShieldAlt />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-magenta3 px-2 py-1 text-white shadow-sm">Defcons</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </Button>
  );
};

export default OutlierCard;

import React from "react";
import { FaFutbol, FaHandshake } from "react-icons/fa";
import { FootballerPosition } from "src/queries/types";
import { TbLockFilled } from "react-icons/tb";
import { getFootballersImage } from "src/utils/images";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { Button } from "@/components/ui/button";

type Props = {
  footballer: FootballerWithGameweekStats;
  include: {
    returns?: boolean;
    xGI?: boolean;
    selectedBy?: boolean;
    totalPoints?: boolean;
  };
};

const OutlierCard = ({ footballer, include }: Props) => {
  const { setFootballer } = useFootballerDetailsContext();
  return (
    <Button
      onClick={() => setFootballer(footballer)}
      key={footballer.id}
      className="relative mb-4 flex h-auto w-full flex-col items-center justify-center gap-0 justify-self-center rounded-md border-accent2 bg-secondary p-0 pt-2 text-center shadow-lg md:pt-6"
    >
      {(include?.xGI || include?.selectedBy) && (
        <div className="absolute -left-[10px] -top-[6px] min-w-6 rotate-[-28deg] whitespace-nowrap rounded-md bg-magenta px-[2px] py-[2px] text-[10px] text-white shadow-md md:-left-3 md:top-2 md:min-w-16 md:px-2 md:py-1 md:text-sm xl:text-base">
          {`${include.xGI ? `${footballer?.xGIPerGame} xGI` : `${footballer?.selected_by_percent} %`}`}
        </div>
      )}
      <div className="flex max-h-[110px] w-auto px-2 md:max-h-[180px] md:px-4 lg:px-6">
        <img
          src={getFootballersImage(footballer.code)}
          alt={footballer.web_name}
          className="aspect-[calc(220/280)] w-auto object-contain"
        />
      </div>
      <p className="flex w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap bg-magenta px-1 text-center text-sm text-text md:py-[2px] md:text-base">
        {footballer?.web_name}
      </p>
      <p className="flex w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-b-md bg-magenta2 px-1 text-center text-sm text-text md:py-[2px] md:text-base">
        {footballer?.totalPoints} pts
      </p>
      {include?.returns && (
        <div className="absolute right-0 top-1 flex flex-col gap-1">
          {!!footballer?.totalGoals && (
            <div className="xl-text-sm flex items-center justify-end gap-2 rounded-l-md bg-accent2 px-1 py-1 pr-2 text-[10px] leading-3 text-text shadow-md md:text-sm lg:gap-1 lg:py-[2px] lg:pr-1 lg:text-xs xl:gap-2 xl:py-1 xl:pl-2 xl:pr-4 xl:text-base">
              <p>{footballer.totalGoals}</p> <FaFutbol />
            </div>
          )}
          {!!footballer?.totalAssists && (
            <div className="xl-text-sm flex items-center justify-end gap-2 rounded-l-md bg-accent2 px-1 py-1 pr-2 text-[10px] leading-3 text-text shadow-md md:text-sm lg:gap-1 lg:py-[2px] lg:pr-1 lg:text-xs xl:gap-2 xl:py-1 xl:pl-2 xl:pr-4 xl:text-base">
              <p>{footballer?.totalAssists}</p> <FaHandshake />
            </div>
          )}
          {!!footballer.totalCleanSheets &&
            [FootballerPosition.DEF, FootballerPosition.GK].includes(
              footballer.element_type,
            ) && (
              <div className="xl-text-sm flex items-center justify-end gap-2 rounded-l-md bg-accent2 px-1 py-1 pr-2 text-[10px] leading-3 text-text shadow-md md:text-sm lg:gap-1 lg:py-[2px] lg:pr-1 lg:text-xs xl:gap-2 xl:py-1 xl:pl-2 xl:pr-4 xl:text-base">
                <p>{footballer?.totalCleanSheets}</p> <TbLockFilled />
              </div>
            )}
        </div>
      )}
    </Button>
  );
};

export default OutlierCard;

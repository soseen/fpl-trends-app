import React, { useCallback, useEffect, useRef } from "react";
import { History } from "src/queries/types";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { GiWinterGloves as GlovesIcon } from "react-icons/gi";
import { FaFutbol, FaHandshake, FaLock } from "react-icons/fa";
import { getTeamsBadge } from "src/utils/images";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

type Props = {
  footballer: FootballerWithGameweekStats | null;
};

const FootballerDetailsHistory = ({ footballer }: Props) => {
  const teams = useSelector((state: RootState) => state.teams.list);
  const ref = useRef<HTMLDivElement>(null);

  const getGameweekEvents = useCallback(
    (event: History) => {
      const baseValues = [
        { icon: <FaFutbol />, value: event.goals_scored },
        { icon: <FaHandshake />, value: event.assists },
      ];
      const additionalValues = (() => {
        switch (footballer?.element_type) {
          case 1:
            return [
              { icon: <GlovesIcon />, value: event.saves },
              { icon: <FaLock />, value: event.clean_sheets },
            ];
          case 2:
            return [{ icon: <FaLock />, value: event.clean_sheets }];
          default:
            return [];
        }
      })();

      return [...baseValues, ...additionalValues].filter(({ value }) => !!value);
    },
    [footballer],
  );

  const getTeamById = useCallback(
    (teamId: number) => teams.find((team) => team.id === teamId),
    [teams],
  );

  const getBackgroundBasedOnResult = useCallback((event: History) => {
    const homeScore = event.team_h_score ?? 0;
    const awayScore = event.team_a_score ?? 0;

    if (homeScore === awayScore) return "bg-gray-400";

    const isWin = event.was_home ? homeScore > awayScore : awayScore > homeScore;

    return isWin ? "bg-green-500" : "bg-red-500";
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollLeft = ref.current.scrollWidth;
    }
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-1 items-end overflow-x-auto rounded-md bg-accent2 px-2 py-3 text-text"
    >
      {footballer?.history?.map((event, index) => (
        <div
          key={index}
          className="ml-1 flex flex-none flex-col items-center gap-1 md:ml-4"
        >
          <span className="flex flex-col items-center justify-center gap-[2px] md:gap-1">
            {getGameweekEvents(event).map(({ icon, value }, gwIndex) => (
              <span
                key={`${gwIndex}-${index}`}
                className="flex items-center justify-center gap-[2px] text-[9px] md:gap-1 md:text-xs"
              >
                {value} {icon}
              </span>
            ))}
          </span>
          {event?.total_points > 0 ? (
            <span
              className={clsx(
                "w-9 whitespace-nowrap rounded-sm py-1 text-center text-xs shadow-sm md:w-10",
                event?.total_points >= 9 ? "bg-magenta" : "bg-magenta2",
              )}
            >
              {event?.total_points} pts
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-secondary md:h-3 md:w-3" />
          )}

          <span className="relative h-8 w-[1px] bg-secondary md:h-12">
            {!!event?.minutes && (
              <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs">
                {event?.minutes}&apos;
              </span>
            )}
          </span>
          <span className="relative mb-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[8px] md:h-6 md:w-6 md:text-xs">
            {event?.round}
            {index !== footballer?.history?.length - 1 && (
              <span className="absolute left-full top-1/2 h-[3px] w-8 -translate-y-1/2 bg-secondary" />
            )}
          </span>
          <div className="flex flex-col items-center justify-center gap-1">
            <img
              src={getTeamsBadge(getTeamById(event?.opponent_team)?.code)}
              alt="opponent team"
              className="mb-[2px] h-4 w-4 rounded-full object-contain md:h-5 md:w-5"
            />
            <span
              className={clsx(
                "whitespace-nowrap rounded-sm px-2 py-[2px] text-xs text-black",
                getBackgroundBasedOnResult(event),
              )}
            >
              {event?.team_h_score} : {event?.team_a_score}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FootballerDetailsHistory;

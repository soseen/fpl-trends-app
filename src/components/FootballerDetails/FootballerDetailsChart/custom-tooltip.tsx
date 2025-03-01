import { TooltipProps } from "recharts";
import { Card } from "@/components/ui/card";
import React, { useCallback } from "react";
import { getTeamsBadge } from "src/utils/images";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import { FootballerPosition, History } from "src/queries/types";
import { FaClock, FaFutbol, FaHandshake, FaLock } from "react-icons/fa";
import { TbRectangleVerticalFilled as CardIcon } from "react-icons/tb";

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { list: teams } = useSelector((state: RootState) => state.teams);

  const getTeamById = useCallback(
    (teamId: number) => teams.find((team) => team.id === teamId),
    [teams],
  );

  const getGameweekEvents = useCallback(
    (history: History) => {
      const events = [
        { key: "minutes", value: history.minutes, icon: <FaClock /> },
        {
          key: "goals",
          value: history.goals_scored,
          icon: <FaFutbol />,
        },
        { key: "assists", value: history.assists, icon: <FaHandshake /> },
        ...([FootballerPosition.DEF, FootballerPosition.GK].includes(
          payload![0]?.payload?.element_type,
        )
          ? [{ key: "cs", value: history.clean_sheets, icon: <FaLock /> }]
          : []),
        {
          key: "yellows",
          value: history.yellow_cards,
          icon: <CardIcon className="-skew-x-12 skew-y-3 text-yellow-500" />,
        },
        {
          key: "reds",
          value: history.red_cards,
          icon: <CardIcon className="-skew-x-12 skew-y-3 text-red-500" />,
        },
      ].filter((event) => event.value);

      return events;
    },
    [payload],
  );

  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  const matchInfo = data?.matchInfo as History[];

  return (
    <Card className="rounded-md bg-background p-2 text-xs text-text shadow-md lg:text-sm">
      <p className="text-center font-bold">Gameweek {label}</p>
      {matchInfo.map((history, index) => {
        const opponentTeamCode = getTeamById(history.opponent_team as number)?.code;
        const homeTeamBadge = getTeamsBadge(
          history.was_home ? data?.team_code : opponentTeamCode,
        );
        const awayTeamBadge = getTeamsBadge(
          history.was_home ? opponentTeamCode : data?.team_code,
        );
        const gameweekEvents = getGameweekEvents(history);

        return (
          <div key={index} className="mb-2 w-full">
            <div className="m-auto my-1 mb-2 flex w-fit items-center justify-center gap-1 text-text">
              <img
                src={homeTeamBadge}
                className="h-5 w-5 object-contain"
                alt="Home Team Badge"
              />
              <span className="m-auto mx-1">
                {history.team_h_score}:{history.team_a_score}
              </span>
              <img
                src={awayTeamBadge}
                className="h-5 w-5 object-contain"
                alt="Away Team Badge"
              />
            </div>
            {!!gameweekEvents.length && (
              <div className="flex w-full flex-col items-start gap-1 rounded-md bg-secondary p-1 py-[4px] text-xs">
                {gameweekEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex w-full flex-grow items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-1 text-xs text-chart3">
                      {event.key} {event.icon}
                    </span>
                    <p>{event.value}</p>
                  </div>
                ))}

                <span className="w-fit self-end justify-self-end rounded-sm bg-magenta p-[2px] py-[1px] shadow-sm">
                  {history.total_points} pts
                </span>
              </div>
            )}
            <div className="flex justify-items-end"></div>
          </div>
        );
      })}
    </Card>
  );
};

export default CustomTooltip;

import { FaFutbol, FaHandshake, FaLock } from "react-icons/fa";
import { FootballerPosition } from "src/queries/types";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import React from "react";

const CustomXAxisTick = ({
  x,
  y,
  payload,
  footballer,
}: {
  x: number;
  y: number;
  payload: { value: number };
  footballer: FootballerWithGameweekStats;
}) => {
  if (!footballer) return null;

  const gameweekData = footballer?.history?.filter((h) => h.round === payload.value);

  const { goals, assists, cleanSheets } = gameweekData.reduce(
    (acc, val) => ({
      ...acc,
      goals: acc.goals + val.goals_scored,
      assists: acc.assists + val.assists,
      cleanSheets: acc.cleanSheets + val.clean_sheets,
    }),
    { goals: 0, assists: 0, cleanSheets: 0 },
  );

  const events = [
    { icon: <FaFutbol className="m-auto w-[10px]" />, value: goals },
    { icon: <FaHandshake className="m-auto w-[10px]" />, value: assists },
    ...([FootballerPosition.DEF, FootballerPosition.GK].includes(
      footballer?.element_type as FootballerPosition,
    )
      ? [{ icon: <FaLock className="m-auto w-[10px]" />, value: cleanSheets }]
      : []),
  ].filter(({ value }) => value > 0);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={10}
        textAnchor="middle"
        width="20"
        height="20"
        fontSize="12"
        fill="var(--text)"
      >
        {payload.value}
      </text>

      {events.map((event, index) => (
        <foreignObject key={index} x="-10" y={15 + index * 15} width="20" height="20">
          <span className="flex w-4 items-center justify-center gap-[1px] text-text">
            <span className="text-xs">{event.value}</span>
            {event.icon}
          </span>
        </foreignObject>
      ))}
    </g>
  );
};

export default CustomXAxisTick;

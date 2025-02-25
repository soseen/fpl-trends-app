"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  Rectangle,
  ReferenceLine,
  XAxis,
} from "recharts";
import React, { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

import { ArrowUp, ArrowDown, Circle } from "lucide-react";
import { FaFutbol, FaHandshake, FaLock } from "react-icons/fa";
import { FootballerPosition } from "src/queries/types";

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

  const gameweekData = footballer?.history?.find((h) => h.round === payload.value);

  const goals = gameweekData?.goals_scored ?? 0;
  const assists = gameweekData?.assists ?? 0;
  const cleanSheets = gameweekData?.clean_sheets ?? 0;

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
      {/* X-Axis Label */}
      <text x={0} y={10} textAnchor="middle" fontSize="12" fill="var(--text)">
        {payload.value}
      </text>

      {/* Icons Below X-Axis */}
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

type Props = {
  footballer: FootballerWithGameweekStats | null;
};

export function Component({ footballer }: Props) {
  const chartConfig: ChartConfig = {
    xGI: { color: "var(--chart-1)", label: "xGI" },
    returns: { color: "var(--chart-2)", label: "Returns" },
  };

  const chartData = useMemo(() => {
    const allGameweeks = Array.from({ length: 38 }, (_, index) => ({
      gw: index + 1,
      xGI: "0.0",
      returns: 0,
      isFake: true,
    }));

    footballer?.history.forEach((h) => {
      allGameweeks[h.round - 1] = {
        gw: h.round,
        xGI: h.expected_goal_involvements,
        returns: h.goals_scored + h.assists,
        isFake: false,
      };
    });

    return allGameweeks;
  }, [footballer]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>xGI over the gameweeks</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[350px] max-h-[450px] min-h-[200px] w-[900px] rounded-md py-4"
        >
          <BarChart data={chartData} className="bar-chart" margin={{ left: 0, right: 0 }}>
            <ReferenceLine y={1} stroke="var(--accent)" className="text-magenta" />
            <XAxis
              dataKey="gw"
              tick={(props) => <CustomXAxisTick {...props} footballer={footballer} />}
              padding={{ left: 0, right: 0 }}
            />
            <Bar
              dataKey="xGI"
              fill="var(--chart-1)"
              radius={2}
              barSize={20}
              activeBar={<Rectangle fill="var(--accent-3)" stroke="var(--accent)" />}
            >
              <LabelList
                dataKey="xGI"
                position="top"
                fill="var(--text)"
                content={({ x, y, value, index }) =>
                  chartData[index as number].isFake ? null : (
                    <text
                      x={x}
                      y={y}
                      dx={10}
                      dy={-8}
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--text)"
                    >
                      {value}
                    </text>
                  )
                }
              />
            </Bar>
            {/* <Bar dataKey="returns" fill="var(--chart-2)" radius={4} /> */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

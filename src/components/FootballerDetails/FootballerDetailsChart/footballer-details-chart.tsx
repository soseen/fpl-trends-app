import { Bar, BarChart, LabelList, Rectangle, Tooltip, XAxis } from "recharts";
import React, { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { FootballerPosition, History } from "src/queries/types";
import { TOTAL_GAMEWEEKS_COUNT } from "src/utils/constants";

import CustomTooltip from "./custom-tooltip";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { ToggleGroupItem } from "@radix-ui/react-toggle-group";
import clsx from "clsx";

enum SelectedChartStat {
  xGI = "xGI",
  xGC = "xGC",
  minutes = "minutes",
  points = "points",
}

type Props = {
  footballer: FootballerWithGameweekStats | null;
};

export type ChartData = {
  gw: number;
  xGI: number;
  xGC: number;
  minutes: number;
  points: number;
  matchInfo: History;
  team_code: string;
  element_type: FootballerPosition;
  isFake: boolean;
};

const FootballerDetailsChart = ({ footballer }: Props) => {
  const [displayedChartStat, setDisplayedChartStat] = useState<SelectedChartStat>(() =>
    [FootballerPosition.DEF, FootballerPosition.GK].includes(
      footballer?.element_type ?? 1,
    )
      ? SelectedChartStat.xGC
      : SelectedChartStat.xGI,
  );

  const chartConfig: ChartConfig = {
    xGI: { color: "var(--chart-1)", label: "xGI" },
  };

  const chartData = useMemo(() => {
    const gameweekMap = new Map<number, ChartData>();

    footballer?.history.forEach((h) => {
      const round = h.round;
      const existing = gameweekMap.get(round);

      if (existing) {
        gameweekMap.set(round, {
          ...existing,
          xGI: existing.xGI + parseFloat(h.expected_goal_involvements),
          xGC: existing.xGC + parseFloat(h.expected_goals_conceded),
          minutes: existing.minutes + h.minutes,
          points: existing.points + h.total_points,
          matchInfo: [...existing.matchInfo, h],
        });
      } else {
        gameweekMap.set(round, {
          gw: round,
          xGI: parseFloat(h.expected_goal_involvements),
          xGC: parseFloat(h.expected_goals_conceded),
          minutes: h.minutes,
          points: h.total_points,
          matchInfo: [h],
          teamCode: footballer?.team_code,
          element_type: footballer.element_type,
          isFake: false,
        });
      }
    });

    const allGameweeks = Array.from({ length: 38 }, (_, index) => {
      const round = index + 1;
      return (
        gameweekMap.get(round) || {
          gw: round,
          xGI: 0,
          xGC: 0,
          minutes: 0,
          points: 0,
          matchInfo: [],
          isFake: true,
        }
      );
    });

    return allGameweeks;
  }, [footballer]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <p>Gameweek trends chart</p>
          <ToggleGroup
            type="single"
            value={displayedChartStat}
            className="flex flex-nowrap items-center gap-1"
            onValueChange={(value: SelectedChartStat) => setDisplayedChartStat(value)}
          >
            {Object.keys(SelectedChartStat).map((stat, index) => (
              <ToggleGroupItem
                key={index}
                className={clsx(
                  "flex-grow rounded-md p-1 text-sm text-text",
                  stat === displayedChartStat ? "bg-magenta" : "bg-magenta2",
                )}
                value={stat}
              >
                {stat}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          key={displayedChartStat}
          config={chartConfig}
          className="mt-2 h-[350px] max-h-[450px] min-h-[200px] w-[890px] rounded-md bg-accent2 px-2 py-4 pb-10"
        >
          <BarChart data={chartData} className="bar-chart" margin={{ left: 0, right: 0 }}>
            <XAxis
              dataKey="gw"
              padding={{ left: 0, right: 0 }}
              tickCount={TOTAL_GAMEWEEKS_COUNT}
              style={{ color: "var(--text)" }}
              fill="var(--text)"
              color="var(--text)"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-2)" }} />
            <Bar
              dataKey={displayedChartStat}
              fill="var(--chart-1)"
              radius={2}
              barSize={20}
              activeBar={<Rectangle fill="var(--chart-3)" stroke="var(--accent)" />}
            >
              <LabelList
                dataKey={displayedChartStat}
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
                      {value === 0
                        ? ""
                        : [SelectedChartStat.xGI, SelectedChartStat.xGC].includes(
                              displayedChartStat,
                            )
                          ? (value as number).toFixed(2)
                          : value}
                    </text>
                  )
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default FootballerDetailsChart;

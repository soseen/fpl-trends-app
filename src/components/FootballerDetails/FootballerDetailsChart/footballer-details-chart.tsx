import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { FootballerPosition, type History } from "src/queries/types";
import { getDefconThreshold } from "src/utils/defcon";

import CustomTooltip from "./custom-tooltip";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { ToggleGroupItem } from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import { useDimensions } from "src/hooks/use-dimensions";

// Width per gameweek bar on mobile. Multiplied by 38 GWs gives the chart
// inner width — wide enough that ~10 bars fit in a phone viewport while the
// rest are accessible by horizontal scroll.
const MOBILE_BAR_WIDTH = 36;

enum SelectedChartStat {
  xGI = "xGI",
  xGC = "xGC",
  minutes = "minutes",
  points = "points",
  defcons = "defcons",
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
  defcons: number;
  matchInfo: History[];
  team_code: number;
  element_type: FootballerPosition;
  isFake: boolean;
};

const FootballerDetailsChart = ({ footballer }: Props) => {
  const { isMD } = useDimensions();
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

  // Per-stat colour palette. Cyan/magenta tones tie back to the brand
  // accents already used elsewhere; rose is reserved for "stat-bad-when-
  // higher" (xGC = expected goals conceded) so a defender's chart reads
  // intuitively (red = bad). Each stat also gets a distinct gradient
  // ID so the SVG fills don't clash.
  const STAT_COLORS: Record<
    SelectedChartStat,
    { stroke: string; gradientFrom: string; gradientTo: string; activeFill: string }
  > = {
    [SelectedChartStat.xGI]: {
      stroke: "#27dfff",
      gradientFrom: "#27dfff",
      gradientTo: "rgba(39, 223, 255, 0.15)",
      activeFill: "#7ce9ff",
    },
    [SelectedChartStat.xGC]: {
      stroke: "#fb7185",
      gradientFrom: "#fb7185",
      gradientTo: "rgba(251, 113, 133, 0.15)",
      activeFill: "#fda4af",
    },
    [SelectedChartStat.minutes]: {
      stroke: "#0dc5b6",
      gradientFrom: "#0dc5b6",
      gradientTo: "rgba(13, 197, 182, 0.15)",
      activeFill: "#5eead4",
    },
    [SelectedChartStat.points]: {
      stroke: "#c71e4d",
      gradientFrom: "#c71e4d",
      gradientTo: "rgba(199, 30, 77, 0.15)",
      activeFill: "#f0598c",
    },
    [SelectedChartStat.defcons]: {
      stroke: "#fbbf24",
      gradientFrom: "#fbbf24",
      gradientTo: "rgba(251, 191, 36, 0.15)",
      activeFill: "#fcd34d",
    },
  };
  const palette = STAT_COLORS[displayedChartStat];
  const gradientId = `chart-grad-${displayedChartStat}`;

  // One row per gameweek (1..38). Real GWs sum across double-GWs; missing
  // rounds (future or unplayed) are zeroed and flagged isFake so labels and
  // tooltips skip them. Same data source on mobile and desktop — mobile just
  // wraps the chart in a horizontal-scroll container so all 38 GWs are
  // accessible.
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
          defcons: existing.defcons + (h.defensive_contribution ?? 0),
          matchInfo: [...existing.matchInfo, h],
        });
      } else {
        gameweekMap.set(round, {
          gw: round,
          xGI: parseFloat(h.expected_goal_involvements),
          xGC: parseFloat(h.expected_goals_conceded),
          minutes: h.minutes,
          points: h.total_points,
          defcons: h.defensive_contribution ?? 0,
          matchInfo: [h],
          team_code: footballer?.team_code,
          element_type: footballer.element_type,
          isFake: false,
        });
      }
    });

    const allGameweeks: ChartData[] = Array.from({ length: 38 }, (_, index) => {
      const round = index + 1;
      return (
        gameweekMap.get(round) ?? {
          gw: round,
          xGI: 0,
          xGC: 0,
          minutes: 0,
          points: 0,
          defcons: 0,
          matchInfo: [],
          team_code: footballer?.team_code ?? 0,
          element_type: footballer?.element_type ?? FootballerPosition.MID,
          isFake: true,
        }
      );
    });

    return allGameweeks;
  }, [footballer]);

  // On mobile, default the scroll position so the latest *played* gameweek
  // sits near the right edge of the viewport — matches the previous "last 10
  // GWs" default. If we're early in the season (e.g. GW 5), this just shows
  // GW 1–10 without dragging the user past empty placeholder bars. The user
  // can still swipe right to peek at upcoming-but-unplayed GWs if they want.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isMD || !scrollRef.current) return;
    const el = scrollRef.current;
    const lastPlayedGw = chartData.reduce(
      (max, d) => (!d.isFake && d.gw > max ? d.gw : max),
      0,
    );
    if (lastPlayedGw === 0) {
      el.scrollLeft = 0;
      return;
    }
    const target = lastPlayedGw * MOBILE_BAR_WIDTH - el.clientWidth;
    el.scrollLeft = Math.max(0, target);
  }, [isMD, displayedChartStat, chartData]);

  const defconThreshold = getDefconThreshold(footballer?.element_type);

  const defconDataAvailable = useMemo(
    () =>
      !!footballer?.history?.some((h) => typeof h.defensive_contribution === "number"),
    [footballer],
  );

  const availableStats = useMemo(
    () =>
      (Object.keys(SelectedChartStat) as SelectedChartStat[]).filter((s) => {
        if (s !== SelectedChartStat.defcons) return true;
        // hide the defcons tab for GK or when the field is entirely absent
        return defconThreshold !== null && defconDataAvailable;
      }),
    [defconThreshold, defconDataAvailable],
  );

  return (
    <Card className="border-transparent">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4 border-transparent p-1 md:p-0">
          <p className="text-sm md:text-base">Gameweek trends chart</p>
          <ToggleGroup
            type="single"
            value={displayedChartStat}
            className="flex flex-nowrap items-center gap-1"
            onValueChange={(value: SelectedChartStat) => setDisplayedChartStat(value)}
          >
            {availableStats.map((stat, index) => (
              <ToggleGroupItem
                key={index}
                className={clsx(
                  "flex-grow rounded-md px-2.5 py-1 text-xs font-semibold transition-all sm:text-sm",
                  stat === displayedChartStat
                    ? "bg-magenta text-text shadow-[0_0_0_1px_rgb(var(--magenta-rgb)/0.6)]"
                    : "bg-magenta2/60 text-text/70 hover:bg-magenta2",
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
        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div style={isMD ? { minWidth: 38 * MOBILE_BAR_WIDTH } : undefined}>
            <ChartContainer
              key={displayedChartStat}
              config={chartConfig}
              className="m-auto mt-2 h-[350px] max-h-[450px] min-h-[200px] rounded-md bg-accent2 px-2 py-4 pb-2"
            >
              <BarChart
                data={chartData}
                className="bar-chart"
                margin={{ top: 20, left: 4, right: 12, bottom: 4 }}
              >
                {/* Per-stat vertical gradient (top-saturated → bottom-faded)
                    so each bar reads as a 'building up from the floor'
                    quantity rather than a flat block. */}
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={palette.gradientFrom}
                      stopOpacity={0.95}
                    />
                    <stop offset="100%" stopColor={palette.gradientTo} stopOpacity={1} />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines give the eye something to anchor
                    against — without them, a 0.86 vs a 1.27 are basically
                    indistinguishable in a 200px-tall chart. */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--accent-4)"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="gw"
                  padding={{ left: 4, right: 4 }}
                  interval={isMD ? 0 : "preserveStartEnd"}
                  tick={{ fill: "var(--text)", fontSize: 11, opacity: 0.75 }}
                  stroke="var(--accent-4)"
                  tickLine={false}
                  axisLine={{ stroke: "var(--accent-4)" }}
                />
                <YAxis
                  tick={{ fill: "var(--text)", fontSize: 11, opacity: 0.6 }}
                  stroke="var(--accent-4)"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tickCount={5}
                  // xGI / xGC are floats; everything else is integer counts.
                  tickFormatter={(v: number) =>
                    [SelectedChartStat.xGI, SelectedChartStat.xGC].includes(
                      displayedChartStat,
                    )
                      ? v.toFixed(1)
                      : `${v}`
                  }
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: palette.stroke, fillOpacity: 0.08 }}
                  {...(isMD && { offset: 10 })}
                />
                <Bar
                  dataKey={displayedChartStat}
                  fill={`url(#${gradientId})`}
                  stroke={palette.stroke}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                  radius={[3, 3, 0, 0]}
                  activeBar={
                    <Rectangle
                      fill={palette.activeFill}
                      stroke={palette.stroke}
                      strokeWidth={1.5}
                    />
                  }
                >
                  <LabelList
                    dataKey={displayedChartStat}
                    position="top"
                    fill="var(--text)"
                    content={({ x, y, value, index, width }) =>
                      chartData[index as number]?.isFake ? null : (
                        <text
                          x={x}
                          y={y}
                          dx={(width as number) / 2}
                          dy={-6}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="600"
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
                {displayedChartStat === SelectedChartStat.defcons &&
                  defconThreshold !== null && (
                    <ReferenceLine
                      y={defconThreshold}
                      stroke={palette.stroke}
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                      label={{
                        value: `+2 pts @ ${defconThreshold}`,
                        position: "insideTopRight",
                        fill: palette.stroke,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )}
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FootballerDetailsChart;

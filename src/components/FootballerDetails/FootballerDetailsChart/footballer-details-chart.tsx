import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  Rectangle,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { FootballerPosition, type History } from "src/queries/types";
import type { RootState } from "src/redux/store";
import { getDefconThreshold } from "src/utils/defcon";

import CustomTooltip from "./custom-tooltip";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { ToggleGroupItem } from "@radix-ui/react-toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ownership = "ownership",
}

const CHART_STAT_COPY: Record<SelectedChartStat, { label: string; description: string }> =
  {
    [SelectedChartStat.xGI]: {
      label: "Expected involvement",
      description: "xG + xA by gameweek",
    },
    [SelectedChartStat.xGC]: {
      label: "Expected conceded",
      description: "Defensive exposure by gameweek",
    },
    [SelectedChartStat.minutes]: {
      label: "Minutes",
      description: "Playing time by gameweek",
    },
    [SelectedChartStat.points]: {
      label: "Points",
      description: "FPL output by gameweek",
    },
    [SelectedChartStat.defcons]: {
      label: "Defensive contributions",
      description: "DefCon actions by gameweek",
    },
    [SelectedChartStat.ownership]: {
      label: "Ownership",
      description: "Manager ownership trend",
    },
  };

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
  // % of FPL managers owning this player at GW. null on fake (pre-debut /
  // future) rounds so the line chart leaves a gap instead of dipping to 0.
  ownership: number | null;
  matchInfo: History[];
  team_code: number;
  element_type: FootballerPosition;
  isFake: boolean;
};

const FootballerDetailsChart = ({ footballer }: Props) => {
  const { isMD } = useDimensions();
  const totalPlayers = useSelector((state: RootState) => state.totalPlayers.totalPlayers);
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
    [SelectedChartStat.ownership]: {
      stroke: "#a78bfa",
      gradientFrom: "#a78bfa",
      gradientTo: "rgba(167, 139, 250, 0.15)",
      activeFill: "#c4b5fd",
    },
  };
  const palette = STAT_COLORS[displayedChartStat];
  const gradientId = `chart-grad-${displayedChartStat}`;
  const selectedStatCopy = CHART_STAT_COPY[displayedChartStat];

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

      // Approximation: FPL only exposes the *current* total managers, not
      // the per-GW total. Using the current denominator slightly understates
      // historical % (the league grows over the season), but it matches what
      // FPL itself surfaces as `selected_by_percent`.
      const ownership = totalPlayers > 0 ? (h.selected / totalPlayers) * 100 : 0;

      if (existing) {
        gameweekMap.set(round, {
          ...existing,
          xGI: existing.xGI + parseFloat(h.expected_goal_involvements),
          xGC: existing.xGC + parseFloat(h.expected_goals_conceded),
          minutes: existing.minutes + h.minutes,
          points: existing.points + h.total_points,
          defcons: existing.defcons + (h.defensive_contribution ?? 0),
          // Ownership is a snapshot, not a per-fixture event — for DGWs take
          // the higher of the two reported values rather than summing.
          ownership: Math.max(existing.ownership ?? 0, ownership),
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
          ownership,
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
          ownership: null,
          matchInfo: [],
          team_code: footballer?.team_code ?? 0,
          element_type: footballer?.element_type ?? FootballerPosition.MID,
          isFake: true,
        }
      );
    });

    return allGameweeks;
  }, [footballer, totalPlayers]);

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
    <Card className="relative overflow-hidden rounded-md border border-accent4/70 bg-accent2 text-text shadow-large">
      <div className="absolute inset-x-0 top-0 h-1 bg-magenta" />
      <CardHeader className="p-3 pb-2 md:p-4 md:pb-3">
        <CardTitle className="flex flex-col gap-3 border-transparent p-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold md:text-base">Gameweek trends</p>
            <p className="mt-1 text-xs font-normal text-text/50">
              {selectedStatCopy.description}
            </p>
          </div>
          {isMD ? (
            <Select
              value={displayedChartStat}
              onValueChange={(value: SelectedChartStat) => setDisplayedChartStat(value)}
            >
              <SelectTrigger className="h-9 w-full border border-accent4/60 bg-accent3 px-2 py-1 text-xs font-semibold text-text shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 xs:w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                sideOffset={5}
                className="z-[400] w-[190px] border border-accent4/70 bg-accent2 text-text shadow-large"
              >
                {availableStats.map((stat) => (
                  <SelectItem
                    key={stat}
                    value={stat}
                    className="cursor-pointer px-2 py-1 text-xs font-semibold text-text hover:bg-accent3"
                  >
                    {CHART_STAT_COPY[stat].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <ToggleGroup
              type="single"
              value={displayedChartStat}
              className="flex flex-wrap items-center justify-end gap-1.5"
              onValueChange={(value: SelectedChartStat) => setDisplayedChartStat(value)}
            >
              {availableStats.map((stat, index) => (
                <ToggleGroupItem
                  key={index}
                  className={clsx(
                    "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                    stat === displayedChartStat
                      ? "bg-magenta text-text shadow-[0_0_0_1px_rgb(var(--magenta-rgb)/0.55)]"
                      : "bg-accent3/70 text-text/65 hover:bg-accent3 hover:text-text",
                  )}
                  value={stat}
                >
                  {stat}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text/60">
          <span
            className="inline-flex items-center gap-1.5 rounded-sm bg-accent3 px-2 py-1 font-semibold text-text"
            style={{ color: palette.stroke }}
          >
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: palette.stroke }}
            />
            {selectedStatCopy.label}
          </span>
          {isMD && (
            <span className="rounded-sm bg-accent4/30 px-2 py-1">
              Swipe horizontally for all GWs
            </span>
          )}
        </div>
        <div
          ref={scrollRef}
          className="overflow-x-auto rounded-md bg-accent5/80 p-2 ring-1 ring-inset ring-accent4/50"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div
            // On desktop we want the chart to stretch to the column width
            // (`w-full`); on mobile the parent <div ref=scrollRef> handles
            // horizontal scroll, so the inner div carries the explicit
            // 38-bars-wide minWidth instead.
            className={isMD ? undefined : "w-full"}
            style={isMD ? { minWidth: 38 * MOBILE_BAR_WIDTH } : undefined}
          >
            <ChartContainer
              key={displayedChartStat}
              config={chartConfig}
              // shadcn's ChartContainer ships with `aspect-video` (16/9)
              // which, combined with our fixed h-[350px], computes width
              // as ~622px and leaves the chart short of the modal's
              // edges. Force `aspect-auto w-full` so width tracks the
              // parent and height stays at 350px.
              className="aspect-auto h-[300px] max-h-[450px] min-h-[220px] w-full rounded-md bg-accent2/70 px-2 py-4 pb-2 md:h-[360px]"
            >
              <ComposedChart
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
                  opacity={0.42}
                  vertical={false}
                />
                <XAxis
                  dataKey="gw"
                  padding={{ left: 4, right: 4 }}
                  interval={isMD ? 0 : "preserveStartEnd"}
                  tick={{ fill: "var(--text)", fontSize: 11, opacity: 0.7 }}
                  stroke="var(--accent-4)"
                  tickLine={false}
                  axisLine={{ stroke: "var(--accent-4)" }}
                />
                <YAxis
                  tick={{ fill: "var(--text)", fontSize: 11, opacity: 0.58 }}
                  stroke="var(--accent-4)"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tickCount={5}
                  // xGI / xGC are floats; ownership is a percentage; the rest
                  // are integer counts. Drop trailing `.0` on whole-number
                  // ownership ticks (e.g. show "5%" not "5.0%").
                  tickFormatter={(v: number) =>
                    [SelectedChartStat.xGI, SelectedChartStat.xGC].includes(
                      displayedChartStat,
                    )
                      ? v.toFixed(1)
                      : displayedChartStat === SelectedChartStat.ownership
                        ? `${v % 1 === 0 ? v : v.toFixed(1)}%`
                        : `${v}`
                  }
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: palette.stroke, fillOpacity: 0.08 }}
                  // Pin the wrapper exactly at the cursor and let it leave
                  // the chart viewBox; CustomTooltip itself translates the
                  // visible card to top-left of the cursor (see its render).
                  // Without this, Recharts auto-flips placement near edges
                  // and can push the tooltip below the viewport, scrolling
                  // the modal as a side-effect.
                  offset={0}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                {displayedChartStat === SelectedChartStat.ownership ? (
                  <Line
                    dataKey="ownership"
                    type="monotone"
                    stroke={palette.stroke}
                    strokeWidth={2}
                    dot={{
                      fill: palette.stroke,
                      stroke: palette.stroke,
                      r: 2.5,
                    }}
                    activeDot={{
                      r: 5,
                      fill: palette.activeFill,
                      stroke: palette.stroke,
                      strokeWidth: 1.5,
                    }}
                    // Pre-debut and future GWs are stored as null — leave a
                    // gap rather than dragging the line down to 0.
                    connectNulls={false}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="ownership"
                      position="top"
                      fill="var(--text)"
                      content={({ x, y, value, index }) =>
                        chartData[index as number]?.isFake || value == null ? null : (
                          <text
                            x={x}
                            y={y}
                            dy={-8}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="var(--text)"
                          >
                            {`${(value as number).toFixed(1)}%`}
                          </text>
                        )
                      }
                    />
                  </Line>
                ) : (
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
                )}
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
              </ComposedChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FootballerDetailsChart;

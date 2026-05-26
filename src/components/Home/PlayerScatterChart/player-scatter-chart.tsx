import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import { MdClose } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import {
  COMPARE_METRICS,
  normaliseMetricValue,
  type CompareMetric,
  type CompareMetricKey,
} from "src/components/CompareFootballers/CompareTool/compare-tool-metrics";
import { useDimensions } from "src/hooks/use-dimensions";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import type { RootState } from "src/redux/store";
import { getTeamsBadge } from "src/utils/images";
import { mapElementTypeToPosition } from "src/utils/strings";

const TOP_PLAYERS_PER_AXIS = 30;
const DESKTOP_LABEL_LIMIT = 14;
const MOBILE_LABEL_LIMIT = 8;
const DEFAULT_X_METRIC: CompareMetricKey = "xGIPer90";
const DEFAULT_Y_METRIC: CompareMetricKey = "pointsPer90";
const HOME_SCATTER_EXCLUDED_METRIC_KEYS = new Set<CompareMetricKey>([
  "totalBonus",
  "totalDefconBonuses",
  "totalCleanSheets",
  "totalSaves",
]);

const chartConfig: ChartConfig = {
  players: { label: "Players", color: "var(--chart-1)" },
};

const POSITION_COLORS: Record<number, string> = {
  1: "#a78bfa",
  2: "#27dfff",
  3: "#c71e4d",
  4: "#fbbf24",
};

type ScatterPlayerPoint = {
  id: number;
  name: string;
  teamCode: number;
  teamShortName: string;
  position: string;
  x: number;
  y: number;
  xFormatted: string;
  yFormatted: string;
  xRatio: number;
  yRatio: number;
  color: string;
  showLabel: boolean;
  labelAnchor: "start" | "end";
  labelDx: number;
  labelDy: number;
  footballer: FootballerWithGameweekStats;
};

type ActiveScatterPoint = {
  point: ScatterPlayerPoint;
  x: number;
  y: number;
};

type ScatterDotShapeProps = {
  cx?: number;
  cy?: number;
  payload?: ScatterPlayerPoint;
};

const numberOrZero = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "number" ? value : parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMetric = (key: CompareMetricKey, metrics: CompareMetric[]): CompareMetric =>
  metrics.find((metric) => metric.key === key) ?? COMPARE_METRICS[0]!;

const getTopFootballers = (
  footballers: FootballerWithGameweekStats[],
  metric: CompareMetric,
): FootballerWithGameweekStats[] => {
  const withSignal =
    metric.better === "higher"
      ? footballers.filter((footballer) => metric.getValue(footballer) > 0)
      : footballers;
  const candidates = withSignal.length >= TOP_PLAYERS_PER_AXIS ? withSignal : footballers;

  return [...candidates]
    .sort((a, b) => {
      const aValue = numberOrZero(metric.getValue(a));
      const bValue = numberOrZero(metric.getValue(b));
      return metric.better === "lower" ? aValue - bValue : bValue - aValue;
    })
    .slice(0, TOP_PLAYERS_PER_AXIS);
};

const getDomainMax = (values: number[]): number => {
  const max = Math.max(...values, 0);
  return max > 0 ? max * 1.08 : 1;
};

const getReliablePlayerPool = (
  footballers: FootballerWithGameweekStats[],
  rangeLength: number,
): FootballerWithGameweekStats[] => {
  const playersWithMinutes = footballers.filter(
    (footballer) => footballer.totalMinutes > 0,
  );
  const minimumMinutes = Math.min(270, Math.max(45, rangeLength * 45));
  const reliablePlayers = playersWithMinutes.filter(
    (footballer) => footballer.totalMinutes >= minimumMinutes,
  );

  return reliablePlayers.length >= TOP_PLAYERS_PER_AXIS
    ? reliablePlayers
    : playersWithMinutes;
};

const selectLabelIds = ({
  points,
  xMetric,
  yMetric,
  selectedIds,
  isCompact,
}: {
  points: ScatterPlayerPoint[];
  xMetric: CompareMetric;
  yMetric: CompareMetric;
  selectedIds: Set<number>;
  isCompact: boolean;
}): Set<number> => {
  const labelIds = new Set<number>();
  const chosen: ScatterPlayerPoint[] = [];
  const labelLimit = isCompact ? MOBILE_LABEL_LIMIT : DESKTOP_LABEL_LIMIT;
  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);

  const byMetric = (metric: CompareMetric, key: "x" | "y") =>
    [...points]
      .sort((a, b) => {
        const aValue = key === "x" ? a.x : a.y;
        const bValue = key === "x" ? b.x : b.y;
        return metric.better === "lower" ? aValue - bValue : bValue - aValue;
      })
      .slice(0, 5);

  const byCombinedScore = [...points]
    .sort((a, b) => {
      const aScore =
        normaliseMetricValue(xMetric, a.x, xValues) +
        normaliseMetricValue(yMetric, a.y, yValues);
      const bScore =
        normaliseMetricValue(xMetric, b.x, xValues) +
        normaliseMetricValue(yMetric, b.y, yValues);
      return bScore - aScore;
    })
    .slice(0, 10);

  const tryAdd = (point: ScatterPlayerPoint, force = false) => {
    if (labelIds.has(point.id)) return;
    if (!force && chosen.length >= labelLimit) return;

    const tooClose = chosen.some(
      (existing) =>
        Math.abs(existing.xRatio - point.xRatio) < 0.085 &&
        Math.abs(existing.yRatio - point.yRatio) < 0.105,
    );

    if (!force && tooClose) return;

    chosen.push(point);
    labelIds.add(point.id);
  };

  points
    .filter((point) => selectedIds.has(point.id))
    .forEach((point) => tryAdd(point, true));
  [...byMetric(xMetric, "x"), ...byMetric(yMetric, "y"), ...byCombinedScore].forEach(
    (point) => tryAdd(point),
  );

  return labelIds;
};

const PlayerScatterChartSkeleton = () => (
  <div className="w-full rounded-md border border-accent4/70 bg-accent2 p-3 shadow-large md:p-4">
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <Skeleton className="mb-2 h-5 w-44" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
    <Skeleton className="h-[390px] w-full md:h-[460px]" />
  </div>
);

const PlayerScatterChart = () => {
  const navigate = useNavigate();
  const { isSM, isMD } = useDimensions();
  const { status } = useAppInitContext();
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const chartSurfaceRef = useRef<HTMLDivElement | null>(null);
  const hideTooltipTimeoutRef = useRef<number | null>(null);
  const [xMetricKey, setXMetricKey] = useState<CompareMetricKey>(DEFAULT_X_METRIC);
  const [yMetricKey, setYMetricKey] = useState<CompareMetricKey>(DEFAULT_Y_METRIC);
  const [selectedFootballerIds, setSelectedFootballerIds] = useState<number[]>([]);
  const [activePoint, setActivePoint] = useState<ActiveScatterPoint | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  const maxComparePlayers = isSM ? 2 : isMD ? 3 : 4;

  const availableMetrics = useMemo(
    () =>
      COMPARE_METRICS.filter(
        (metric) =>
          !HOME_SCATTER_EXCLUDED_METRIC_KEYS.has(metric.key) &&
          (!metric.isAvailable || metric.isAvailable(footballers)),
      ),
    [footballers],
  );

  const xMetric = useMemo(
    () => getMetric(xMetricKey, availableMetrics),
    [availableMetrics, xMetricKey],
  );
  const yMetric = useMemo(
    () => getMetric(yMetricKey, availableMetrics),
    [availableMetrics, yMetricKey],
  );

  const selectedIds = useMemo(
    () => new Set(selectedFootballerIds),
    [selectedFootballerIds],
  );

  const selectedFootballers = useMemo(
    () =>
      selectedFootballerIds
        .map((id) => footballers.find((footballer) => footballer.id === id))
        .filter(Boolean) as FootballerWithGameweekStats[],
    [footballers, selectedFootballerIds],
  );

  const chartData = useMemo(() => {
    const rangeLength = Math.max(1, endGameweek - startGameweek + 1);
    const reliablePool = getReliablePlayerPool(footballers, rangeLength);
    const topByX = getTopFootballers(reliablePool, xMetric);
    const topByY = getTopFootballers(reliablePool, yMetric);
    const selected = footballers.filter((footballer) => selectedIds.has(footballer.id));
    const plottedFootballers = Array.from(
      new Map(
        [...topByX, ...topByY, ...selected].map((footballer) => [
          footballer.id,
          footballer,
        ]),
      ).values(),
    );
    const xValues = plottedFootballers.map((footballer) =>
      numberOrZero(xMetric.getValue(footballer)),
    );
    const yValues = plottedFootballers.map((footballer) =>
      numberOrZero(yMetric.getValue(footballer)),
    );
    const xMax = getDomainMax(xValues);
    const yMax = getDomainMax(yValues);

    const points = plottedFootballers.map<ScatterPlayerPoint>((footballer) => {
      const x = numberOrZero(xMetric.getValue(footballer));
      const y = numberOrZero(yMetric.getValue(footballer));
      const xRatio = xMax > 0 ? x / xMax : 0;
      const yRatio = yMax > 0 ? y / yMax : 0;

      return {
        id: footballer.id,
        name: footballer.web_name,
        teamCode: footballer.team_code,
        teamShortName: footballer.teams?.short_name ?? footballer.teamName,
        position: mapElementTypeToPosition(footballer.element_type),
        x,
        y,
        xFormatted: xMetric.format(x),
        yFormatted: yMetric.format(y),
        xRatio,
        yRatio,
        color: POSITION_COLORS[footballer.element_type] ?? "#0dc5b6",
        showLabel: false,
        labelAnchor: xRatio > 0.72 ? "end" : "start",
        labelDx: xRatio > 0.72 ? -9 : 9,
        labelDy: yRatio > 0.84 ? 15 : -9,
        footballer,
      };
    });

    const labelIds = selectLabelIds({
      points,
      xMetric,
      yMetric,
      selectedIds,
      isCompact: isMD,
    });

    return points.map((point) => ({
      ...point,
      showLabel: labelIds.has(point.id),
    }));
  }, [endGameweek, footballers, isMD, selectedIds, startGameweek, xMetric, yMetric]);

  const xDomainMax = useMemo(
    () => getDomainMax(chartData.map((point) => point.x)),
    [chartData],
  );
  const yDomainMax = useMemo(
    () => getDomainMax(chartData.map((point) => point.y)),
    [chartData],
  );

  useEffect(() => {
    setActivePoint(null);
  }, [xMetricKey, yMetricKey, isMD]);

  useEffect(
    () => () => {
      if (hideTooltipTimeoutRef.current !== null) {
        window.clearTimeout(hideTooltipTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    setSelectedFootballerIds((current) => current.slice(0, maxComparePlayers));
  }, [maxComparePlayers]);

  useEffect(() => {
    if (!availableMetrics.some((metric) => metric.key === xMetricKey)) {
      setXMetricKey(DEFAULT_X_METRIC);
    }
    if (!availableMetrics.some((metric) => metric.key === yMetricKey)) {
      setYMetricKey(DEFAULT_Y_METRIC);
    }
  }, [availableMetrics, xMetricKey, yMetricKey]);

  useEffect(() => {
    const node = chartSurfaceRef.current;
    if (!node) return;

    const updateSize = () =>
      setChartSize({ width: node.clientWidth, height: node.clientHeight });
    updateSize();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const setActiveFromDot = (point: ScatterPlayerPoint, x: number, y: number) => {
    clearScheduledTooltipHide();
    setActivePoint({ point, x, y });
  };

  const clearScheduledTooltipHide = () => {
    if (hideTooltipTimeoutRef.current === null) return;

    window.clearTimeout(hideTooltipTimeoutRef.current);
    hideTooltipTimeoutRef.current = null;
  };

  const hideActivePoint = () => {
    clearScheduledTooltipHide();
    setActivePoint(null);
  };

  const scheduleDesktopTooltipHide = () => {
    if (isMD) return;

    clearScheduledTooltipHide();
    hideTooltipTimeoutRef.current = window.setTimeout(() => {
      setActivePoint(null);
      hideTooltipTimeoutRef.current = null;
    }, 120);
  };

  const addFootballerToCompare = (footballerId: number) => {
    setSelectedFootballerIds((current) => {
      if (current.includes(footballerId) || current.length >= maxComparePlayers) {
        return current;
      }

      return [...current, footballerId];
    });
  };

  const removeFootballerFromCompare = (footballerId: number) => {
    setSelectedFootballerIds((current) => current.filter((id) => id !== footballerId));
  };

  const onSelectXAxis = (value: CompareMetricKey) => {
    if (value === yMetricKey) {
      setYMetricKey(xMetricKey);
    }
    setXMetricKey(value);
  };

  const onSelectYAxis = (value: CompareMetricKey) => {
    if (value === xMetricKey) {
      setXMetricKey(yMetricKey);
    }
    setYMetricKey(value);
  };

  const onCompare = () => {
    if (selectedFootballers.length < 2) return;

    const params = new URLSearchParams({
      players: selectedFootballers.map((footballer) => `${footballer.id}`).join(","),
      gw: `${startGameweek}-${endGameweek}`,
    });

    navigate(`/compare?${params.toString()}`);
  };

  const renderDot = (props: unknown) => {
    const { cx, cy, payload } = props as ScatterDotShapeProps;
    if (typeof cx !== "number" || typeof cy !== "number" || !payload) return <g />;

    const isSelected = selectedIds.has(payload.id);
    const radius = isSelected ? 6 : payload.showLabel ? 5 : 4;

    return (
      <g
        role="button"
        tabIndex={0}
        aria-label={`Show ${payload.name}`}
        className="cursor-pointer outline-none"
        onClick={() => setActiveFromDot(payload, cx, cy)}
        onFocus={() => setActiveFromDot(payload, cx, cy)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActiveFromDot(payload, cx, cy);
          }
        }}
        onPointerEnter={() => {
          if (!isMD) setActiveFromDot(payload, cx, cy);
        }}
        onPointerLeave={scheduleDesktopTooltipHide}
      >
        <circle cx={cx} cy={cy} r={radius + 5} fill={payload.color} opacity={0.12} />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={isSelected ? "#ffffff" : payload.color}
          stroke={isSelected ? "#c71e4d" : "var(--accent-2)"}
          strokeWidth={isSelected ? 2.5 : 1.5}
        />
        {payload.showLabel && (
          <text
            x={cx}
            y={cy}
            dx={payload.labelDx}
            dy={payload.labelDy}
            textAnchor={payload.labelAnchor}
            className="pointer-events-none select-none text-[10px] font-semibold md:text-xs"
            fill="var(--text)"
            stroke="var(--accent-2)"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {payload.name}
          </text>
        )}
      </g>
    );
  };

  const activeTooltipStyle: CSSProperties | undefined = activePoint
    ? {
        left: activePoint.x,
        top: Math.min(Math.max(activePoint.y, 92), Math.max(92, chartSize.height - 92)),
        transform:
          activePoint.x > chartSize.width / 2
            ? "translate(calc(-100% - 14px), -50%)"
            : "translate(14px, -50%)",
      }
    : undefined;

  const activeIsSelected = activePoint ? selectedIds.has(activePoint.point.id) : false;
  const compareLimitReached = selectedFootballers.length >= maxComparePlayers;

  if (status === AppInitStatus.loading) return <PlayerScatterChartSkeleton />;

  return (
    <section className="relative w-full rounded-md border border-accent4/70 bg-accent2 p-3 text-text shadow-large md:p-4">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-md bg-magenta" />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold md:text-lg">Player metric map</h2>
          <p className="mt-1 max-w-2xl text-xs text-text/55 md:text-sm">
            Top 30 players on either selected axis for GW {startGameweek}-{endGameweek}.
            Labelled names highlight the standout and selected dots.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text/45">
              X axis
            </p>
            <Select value={xMetricKey} onValueChange={onSelectXAxis}>
              <SelectTrigger className="h-9 border border-accent4/60 bg-accent3 px-2 py-1 text-xs font-semibold text-text shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                sideOffset={5}
                className="z-[400] border border-accent4/70 bg-accent2 text-text shadow-large"
              >
                {availableMetrics.map((metric) => (
                  <SelectItem
                    key={metric.key}
                    value={metric.key}
                    className="cursor-pointer px-2 py-1 text-xs font-semibold text-text hover:bg-accent3"
                  >
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text/45">
              Y axis
            </p>
            <Select value={yMetricKey} onValueChange={onSelectYAxis}>
              <SelectTrigger className="h-9 border border-accent4/60 bg-accent3 px-2 py-1 text-xs font-semibold text-text shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                sideOffset={5}
                className="z-[400] border border-accent4/70 bg-accent2 text-text shadow-large"
              >
                {availableMetrics.map((metric) => (
                  <SelectItem
                    key={metric.key}
                    value={metric.key}
                    className="cursor-pointer px-2 py-1 text-xs font-semibold text-text hover:bg-accent3"
                  >
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text/60">
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-accent3 px-2 py-1 font-semibold text-text">
          <span className="h-2 w-2 rounded-sm bg-magenta" />
          {yMetric.shortLabel}
        </span>
        <span className="rounded-sm bg-accent4/30 px-2 py-1">
          {isMD ? "Tap a dot for details" : "Hover or focus a dot for details"}
        </span>
      </div>

      <div className="rounded-md bg-accent5/80 p-2 ring-1 ring-inset ring-accent4/50">
        <div
          ref={chartSurfaceRef}
          className="relative"
          onPointerLeave={() => {
            if (!isMD) hideActivePoint();
          }}
        >
          {selectedFootballers.length > 0 && (
            <div className="absolute right-2 top-2 z-20 flex max-w-[78%] flex-wrap justify-end gap-1.5">
              {selectedFootballers.map((footballer) => (
                <span
                  key={footballer.id}
                  className="inline-flex max-w-[150px] items-center gap-1.5 rounded-full bg-accent3/95 px-2 py-1 text-[11px] font-semibold text-text shadow-md ring-1 ring-inset ring-accent4/60"
                >
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {footballer.web_name}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${footballer.web_name}`}
                    className="rounded-full p-0.5 text-text/65 transition-colors hover:bg-accent4 hover:text-text"
                    onClick={() => removeFootballerFromCompare(footballer.id)}
                  >
                    <MdClose className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[390px] w-full rounded-md bg-accent2/70 md:h-[460px]"
          >
            <ScatterChart margin={{ top: 28, right: 18, bottom: 30, left: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--accent-4)"
                opacity={0.42}
              />
              <XAxis
                type="number"
                dataKey="x"
                name={xMetric.shortLabel}
                domain={[0, xDomainMax]}
                tick={{ fill: "var(--text)", fontSize: 11, opacity: 0.65 }}
                tickLine={false}
                axisLine={{ stroke: "var(--accent-4)" }}
                tickFormatter={(value: number) => xMetric.format(value)}
                label={{
                  value: xMetric.label,
                  position: "insideBottom",
                  offset: -18,
                  fill: "var(--text)",
                  opacity: 0.65,
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={yMetric.shortLabel}
                domain={[0, yDomainMax]}
                width={52}
                tick={{ fill: "var(--text)", fontSize: 11, opacity: 0.65 }}
                tickLine={false}
                axisLine={{ stroke: "var(--accent-4)" }}
                tickFormatter={(value: number) => yMetric.format(value)}
                label={{
                  value: yMetric.label,
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--text)",
                  opacity: 0.65,
                  fontSize: 12,
                }}
              />
              <Scatter
                name="Players"
                data={chartData}
                shape={renderDot}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ChartContainer>

          {activePoint && (
            <div
              className="absolute z-30 w-[218px] rounded-md border border-accent4 bg-accent2 p-3 text-xs text-text shadow-large"
              style={activeTooltipStyle}
              onPointerEnter={() => {
                if (!isMD) clearScheduledTooltipHide();
              }}
              onPointerLeave={scheduleDesktopTooltipHide}
            >
              <button
                type="button"
                aria-label="Close player details"
                className="absolute right-1.5 top-1.5 rounded-full p-1 text-text/55 transition-colors hover:bg-accent4 hover:text-text"
                onClick={() => setActivePoint(null)}
              >
                <MdClose className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-start gap-2 pr-5">
                <img
                  src={getTeamsBadge(activePoint.point.teamCode)}
                  alt={activePoint.point.teamShortName}
                  className="h-8 w-8 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold">
                    {activePoint.point.name}
                  </p>
                  <p className="text-[11px] text-text/55">
                    {activePoint.point.teamShortName} - {activePoint.point.position}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-accent3/70 px-2 py-1.5">
                  <p className="text-[10px] uppercase text-text/45">
                    {xMetric.shortLabel}
                  </p>
                  <p className="font-semibold">{activePoint.point.xFormatted}</p>
                </div>
                <div className="rounded-md bg-accent3/70 px-2 py-1.5">
                  <p className="text-[10px] uppercase text-text/45">
                    {yMetric.shortLabel}
                  </p>
                  <p className="font-semibold">{activePoint.point.yFormatted}</p>
                </div>
              </div>

              <Button
                className={clsx(
                  "mt-3 h-8 w-full rounded-md text-xs font-semibold text-text",
                  activeIsSelected || compareLimitReached
                    ? "bg-accent4"
                    : "bg-magenta hover:bg-magenta/90",
                )}
                disabled={activeIsSelected || compareLimitReached}
                onClick={() => addFootballerToCompare(activePoint.point.id)}
              >
                {activeIsSelected
                  ? "Added"
                  : compareLimitReached
                    ? "Limit reached"
                    : "Add to compare"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text/55">
          {maxComparePlayers === 2
            ? "Pick 2 players from the map to open them in the compare tool."
            : `Pick 2-${maxComparePlayers} players from the map to open them in the compare tool.`}
        </p>
        <Button
          className="h-9 bg-magenta px-5 text-sm font-semibold text-text hover:bg-magenta/90 disabled:bg-accent4"
          disabled={selectedFootballers.length < 2}
          onClick={onCompare}
        >
          Compare
        </Button>
      </div>
    </section>
  );
};

export default PlayerScatterChart;

import React, { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import {
  COMPARE_PLAYER_COLORS,
  normaliseMetricValue,
  type CompareMetric,
} from "./compare-tool-metrics";

type Props = {
  footballers: FootballerWithGameweekStats[];
  metrics: CompareMetric[];
};

type RadarTooltipEntry = {
  dataKey?: string | number;
  color?: string;
  name?: string | number;
  payload?: Record<string, unknown>;
};

type RadarTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: RadarTooltipEntry[];
};

const CompareRadarTooltip = ({ active, label, payload }: RadarTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-36 rounded-md border border-accent4 bg-accent2 px-3 py-2 text-xs text-text shadow-large">
      <p className="mb-1 font-semibold">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => {
          const dataKey = String(entry.dataKey ?? "");
          const rawValue = entry.payload?.[`${dataKey}Raw`];
          if (typeof rawValue !== "string") return null;

          return (
            <div key={dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-text/80">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="font-semibold text-text">{rawValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CompareToolRadar = ({ footballers, metrics }: Props) => {
  const playerSeries = useMemo(
    () =>
      footballers.map((footballer, index) => ({
        key: `player${footballer.id}`,
        label: footballer.web_name,
        color: COMPARE_PLAYER_COLORS[index % COMPARE_PLAYER_COLORS.length] ?? "#c71e4d",
      })),
    [footballers],
  );

  const chartData = useMemo(
    () =>
      metrics.map((metric) => {
        const values = footballers.map((footballer) => metric.getValue(footballer));
        const row: Record<string, number | string> = {
          metric: metric.shortLabel,
          label: metric.label,
        };

        playerSeries.forEach((series, index) => {
          const value = values[index] ?? 0;
          row[series.key] = normaliseMetricValue(metric, value, values);
          row[`${series.key}Raw`] = metric.format(value);
        });

        return row;
      }),
    [footballers, metrics, playerSeries],
  );

  return (
    <section className="min-w-0 overflow-hidden rounded-md bg-accent2 p-2 shadow-md md:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold md:text-base">Performance radar</h2>
        <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] md:text-xs">
          {playerSeries.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5 text-text/80">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </span>
          ))}
        </div>
      </div>
      <div className="h-[300px] w-full min-w-0 md:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="var(--accent-4)" radialLines />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "var(--text)", fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<CompareRadarTooltip />} />
            {playerSeries.map((series) => (
              <Radar
                key={series.key}
                name={series.label}
                dataKey={series.key}
                stroke={series.color}
                fill={series.color}
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ r: 2, fill: series.color }}
                isAnimationActive={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default CompareToolRadar;

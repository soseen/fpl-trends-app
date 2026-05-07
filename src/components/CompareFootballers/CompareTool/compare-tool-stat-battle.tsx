import clsx from "clsx";
import React, { useMemo } from "react";

import FootballerImage from "src/components/FootballerImage/footballer-image";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import {
  COMPARE_PLAYER_COLORS,
  isMetricWinner,
  normaliseMetricValue,
  type CompareMetric,
} from "./compare-tool-metrics";

type Props = {
  footballers: FootballerWithGameweekStats[];
  metrics: CompareMetric[];
};

const CompareToolStatBattle = ({ footballers, metrics }: Props) => {
  const gridTemplateColumns = useMemo(
    () => `minmax(104px, 0.85fr) repeat(${footballers.length}, minmax(124px, 1fr))`,
    [footballers.length],
  );

  return (
    <section className="min-w-0 overflow-hidden rounded-md bg-accent2 p-2 shadow-md md:p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold md:text-base">Stat battle</h2>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="w-max min-w-full">
          <div
            className="grid items-center gap-2 border-b border-accent4/70 pb-2 text-xs text-text/70"
            style={{ gridTemplateColumns }}
          >
            <span>Metric</span>
            {footballers.map((footballer, index) => (
              <div key={footballer.id} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{
                    backgroundColor:
                      COMPARE_PLAYER_COLORS[index % COMPARE_PLAYER_COLORS.length],
                  }}
                />
                <FootballerImage
                  code={footballer.code}
                  className="h-7 w-7 rounded-none object-contain"
                />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-text">
                  {footballer.web_name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-1.5">
            {metrics.map((metric) => {
              const values = footballers.map((footballer) => metric.getValue(footballer));
              const hasSignal = values.some((value) => value !== 0);

              return (
                <div
                  key={metric.key}
                  className="grid items-center gap-2 rounded-md bg-accent3/55 px-2 py-2"
                  style={{ gridTemplateColumns }}
                >
                  <div>
                    <p className="text-xs font-semibold text-text md:text-sm">
                      {metric.label}
                    </p>
                    <p className="text-[10px] uppercase text-text/45">{metric.group}</p>
                  </div>

                  {footballers.map((footballer, index) => {
                    const value = values[index] ?? 0;
                    const score = normaliseMetricValue(metric, value, values);
                    const winner = hasSignal && isMetricWinner(metric, value, values);
                    const color =
                      COMPARE_PLAYER_COLORS[index % COMPARE_PLAYER_COLORS.length] ??
                      "#c71e4d";

                    return (
                      <div key={footballer.id} className="min-w-0">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span
                            className={clsx(
                              "text-sm font-semibold",
                              winner ? "text-white" : "text-text",
                            )}
                          >
                            {metric.format(value)}
                          </span>
                          {winner && (
                            <span className="rounded-sm bg-magenta px-1.5 py-[1px] text-[10px] font-semibold text-white">
                              best
                            </span>
                          )}
                        </div>
                        <div className="h-3 overflow-hidden rounded-sm bg-accent4/80">
                          <div
                            className="h-full rounded-sm transition-[width] duration-300"
                            style={{
                              width: `${score}%`,
                              backgroundColor: color,
                              opacity: winner ? 1 : 0.72,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompareToolStatBattle;

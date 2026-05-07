import clsx from "clsx";
import React from "react";

import type { CompareMetric, CompareMetricKey } from "./compare-tool-metrics";
import { MIN_SELECTED_COMPARE_METRICS } from "./compare-tool-metrics";

type Props = {
  metrics: CompareMetric[];
  selectedMetricKeys: CompareMetricKey[];
  onToggleMetric: (key: CompareMetricKey) => void;
};

const CompareToolMetricControls = ({
  metrics,
  selectedMetricKeys,
  onToggleMetric,
}: Props) => {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-md bg-accent2 p-2 shadow-md md:gap-2">
      {metrics.map((metric) => {
        const isSelected = selectedMetricKeys.includes(metric.key);
        const isLocked =
          isSelected && selectedMetricKeys.length <= MIN_SELECTED_COMPARE_METRICS;

        return (
          <button
            key={metric.key}
            type="button"
            aria-pressed={isSelected}
            disabled={isLocked}
            onClick={() => onToggleMetric(metric.key)}
            className={clsx(
              "h-7 rounded-md px-2 text-[11px] font-semibold transition md:h-8 md:px-3 md:text-xs",
              isSelected
                ? "bg-magenta text-white shadow-[0_0_0_1px_rgb(var(--magenta-rgb)/0.45)]"
                : "bg-accent4/70 text-text/70 hover:bg-accent",
              isLocked && "cursor-default opacity-80",
            )}
          >
            {metric.shortLabel}
          </button>
        );
      })}
    </div>
  );
};

export default CompareToolMetricControls;

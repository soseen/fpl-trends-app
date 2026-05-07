import React, { useEffect, useMemo, useState } from "react";
import CompareToolFootballerCard from "./compare-tool-footballer-card";
import { Button } from "@/components/ui/button";
import { FaPlus, FaTools } from "react-icons/fa";
import { useCompareTool } from "./use-compare-tool";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import CompareToolSkeleton from "./compare-tool.skeleton";
import CompareToolRankings from "./compare-tool-rankings";
import CompareToolMetricControls from "./compare-tool-metric-controls";
import CompareToolRadar from "./compare-tool-radar";
import CompareToolStatBattle from "./compare-tool-stat-battle";
import {
  DEFAULT_COMPARE_METRIC_KEYS,
  getAvailableCompareMetrics,
  MIN_SELECTED_COMPARE_METRICS,
  type CompareMetricKey,
} from "./compare-tool-metrics";

const areMetricKeysEqual = (
  first: CompareMetricKey[],
  second: CompareMetricKey[],
): boolean =>
  first.length === second.length && first.every((key, index) => key === second[index]);

const CompareTool = () => {
  const {
    footballersComparisonArray,
    setSelectedFootballers,
    canAddNewCard,
    validFootballers,
    bestAttributes,
    addFootballer,
    removeFootballer,
    openFootballersProfile,
  } = useCompareTool();
  const { status } = useAppInitContext();
  const [selectedMetricKeys, setSelectedMetricKeys] = useState<CompareMetricKey[]>(
    DEFAULT_COMPARE_METRIC_KEYS,
  );

  const availableMetrics = useMemo(
    () => getAvailableCompareMetrics(validFootballers),
    [validFootballers],
  );

  useEffect(() => {
    setSelectedMetricKeys((current) => {
      const availableKeys = availableMetrics.map((metric) => metric.key);
      const next = current.filter((key) => availableKeys.includes(key));

      for (const metric of availableMetrics) {
        if (next.length >= MIN_SELECTED_COMPARE_METRICS) break;
        if (!next.includes(metric.key)) next.push(metric.key);
      }

      return areMetricKeysEqual(current, next) ? current : next;
    });
  }, [availableMetrics]);

  const selectedMetrics = useMemo(
    () => availableMetrics.filter((metric) => selectedMetricKeys.includes(metric.key)),
    [availableMetrics, selectedMetricKeys],
  );

  const toggleMetric = (key: CompareMetricKey) => {
    setSelectedMetricKeys((current) => {
      if (current.includes(key)) {
        if (current.length <= MIN_SELECTED_COMPARE_METRICS) return current;
        return current.filter((metricKey) => metricKey !== key);
      }

      return [...current, key];
    });
  };

  if (status === AppInitStatus.loading) return <CompareToolSkeleton />;

  return (
    <div className="text-md mt-4 flex w-full min-w-0 flex-col rounded-sm pb-4 text-text md:text-base lg:bg-accent3 lg:p-2 lg:pb-8 lg:text-xl">
      <h1 className="flex items-center gap-2">
        Comparison Tool <FaTools className="text-magenta" />
      </h1>
      <div className="-mx-2 mt-4 overflow-x-auto px-2 pb-2 lg:mx-0 lg:mt-8 lg:px-0">
        <div className="flex w-max min-w-full snap-x items-stretch justify-center gap-3 md:gap-4 lg:gap-5 xl:gap-6">
          {footballersComparisonArray.map((selectedFootballer, index) => (
            <CompareToolFootballerCard
              key={index}
              index={index}
              footballer={selectedFootballer}
              selectedFootballers={footballersComparisonArray}
              addFootballer={addFootballer}
              removeFootballer={removeFootballer}
              openFootballersProfile={openFootballersProfile}
            />
          ))}
          {canAddNewCard && (
            <div className="flex w-14 shrink-0 snap-start items-center justify-center self-stretch md:w-16">
              <Button
                aria-label="Add comparison player"
                className="h-11 w-11 rounded-full bg-magenta p-0 text-text shadow-md hover:bg-magenta/90 md:h-14 md:w-14"
                onClick={() => setSelectedFootballers((current) => [...current, null])}
              >
                <FaPlus className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {validFootballers.length >= 2 && (
        <div className="mt-4 flex min-w-0 flex-col gap-3 lg:mt-6">
          <CompareToolMetricControls
            metrics={availableMetrics}
            selectedMetricKeys={selectedMetricKeys}
            onToggleMetric={toggleMetric}
          />
          <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
            <CompareToolRadar footballers={validFootballers} metrics={selectedMetrics} />
            <CompareToolStatBattle
              footballers={validFootballers}
              metrics={selectedMetrics}
            />
          </div>
        </div>
      )}
      {validFootballers.length >= 2 && (
        <CompareToolRankings
          selectedFootballers={footballersComparisonArray}
          bestAttributes={bestAttributes}
        />
      )}
    </div>
  );
};

export default CompareTool;

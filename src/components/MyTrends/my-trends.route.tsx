import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { selectGameweekRange } from "src/redux/slices/gameweeksSlice";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import { getManagerSummary, type ManagerSummary } from "src/queries/getManagerSummary";
import {
  getManagerRangeRank,
  type ManagerRangeRank,
} from "src/queries/getManagerRangeRank";
import {
  getManagerTrajectory,
  type ManagerTrajectory,
} from "src/queries/getManagerTrajectory";
import {
  getManagerComparison,
  type ManagerComparison,
} from "src/queries/getManagerComparison";
import FplIdInput from "./fpl-id-input";
import RangeRankCard from "./range-rank-card";
import RangeRankCardSkeleton from "./range-rank-card.skeleton";
import RankTrajectoryChart from "./rank-trajectory-chart";
import RankTrajectoryChartSkeleton from "./rank-trajectory-chart.skeleton";
import ManagerComparisonTable from "./manager-comparison-table";
import ManagerComparisonTableSkeleton from "./manager-comparison-table.skeleton";
import MyTrendsSection from "./my-trends-section";
import AccuracyMeter from "./accuracy-meter";
import TeamImpactView from "./TeamImpact/team-impact";

export const FPL_ID_STORAGE_KEY = "fpl_manager_id";

const MyTrends: React.FC = () => {
  const [entryId, setEntryId] = useLocalStorage<number>(FPL_ID_STORAGE_KEY);
  const { startGameweek, endGameweek } = useSelector(selectGameweekRange);
  const [switchOpen, setSwitchOpen] = useState(false);

  const summaryQuery = useQuery<ManagerSummary>({
    queryKey: ["manager-summary", entryId],
    queryFn: () => getManagerSummary(entryId as number),
    enabled: typeof entryId === "number",
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const rangeRankQuery = useQuery<ManagerRangeRank>({
    queryKey: ["manager-range-rank", entryId, startGameweek, endGameweek],
    queryFn: () => getManagerRangeRank(entryId as number, startGameweek, endGameweek),
    enabled: typeof entryId === "number" && startGameweek > 0 && endGameweek > 0,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const trajectoryQuery = useQuery<ManagerTrajectory>({
    queryKey: ["manager-trajectory", entryId],
    queryFn: () => getManagerTrajectory(entryId as number),
    enabled: typeof entryId === "number",
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const comparisonQuery = useQuery<ManagerComparison>({
    queryKey: ["manager-comparison", entryId, startGameweek, endGameweek],
    queryFn: () => getManagerComparison(entryId as number, startGameweek, endGameweek),
    enabled: typeof entryId === "number" && startGameweek > 0 && endGameweek > 0,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const handleSubmitId = (id: number) => {
    setEntryId(id);
    setSwitchOpen(false);
  };

  if (entryId === null) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-4">
        <h1 className="text-xl font-semibold text-text">My Trends</h1>
        <p className="text-text/70 text-sm">
          Enter your FPL ID to see how you&apos;ve performed in the selected gameweek
          range.
        </p>
        <Card className="w-full border-secondary bg-primary p-4 shadow-lg">
          <FplIdInput onSubmit={handleSubmitId} autoFocus />
        </Card>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const summaryError = summaryQuery.isError ? (summaryQuery.error as Error) : null;

  return (
    <div className="container mx-auto flex w-full flex-col gap-4 rounded-md p-4">
      <h1 className="text-xl font-semibold text-text md:text-3xl">My Trends</h1>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {summary && (
            <>
              <p className="truncate text-sm text-text md:text-base">
                {summary.player_first_name} {summary.player_last_name} ·{" "}
                <span className="text-text">{summary.name}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="w-fit rounded-md bg-magenta2 px-2 py-[2px] text-sm text-text shadow-md">
                  ID {entryId}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSwitchOpen(true)}
                  className="text-md border-secondary bg-transparent text-text underline hover:bg-none"
                >
                  Switch ID
                </Button>
              </div>
            </>
          )}

          {!summary && summaryQuery.isPending && <Skeleton className="mt-1 h-5 w-64" />}
        </div>
      </div>

      {summaryError && (
        <Card className="border-rose-400/40 bg-primary p-4 text-sm text-rose-300">
          Couldn&apos;t load that FPL ID — double-check it and try switching.
        </Card>
      )}

      {(rangeRankQuery.data || rangeRankQuery.isPending) && (
        <MyTrendsSection
          title="My rank"
          headerRight={
            <AccuracyMeter
              stratum={rangeRankQuery.data?.stratum_used ?? null}
              sampleSize={rangeRankQuery.data?.sample_size ?? 0}
              isLoading={rangeRankQuery.isPending || trajectoryQuery.isPending}
            />
          }
        >
          {rangeRankQuery.data ? (
            <RangeRankCard
              data={rangeRankQuery.data}
              startGw={startGameweek}
              endGw={endGameweek}
            />
          ) : (
            <RangeRankCardSkeleton />
          )}
          {trajectoryQuery.data && trajectoryQuery.data.gws.length > 0 ? (
            <RankTrajectoryChart
              data={trajectoryQuery.data}
              startGw={startGameweek}
              endGw={endGameweek}
            />
          ) : (
            trajectoryQuery.isPending && <RankTrajectoryChartSkeleton />
          )}
        </MyTrendsSection>
      )}

      {(comparisonQuery.data || comparisonQuery.isPending) && (
        <MyTrendsSection title="How you compare">
          {comparisonQuery.data ? (
            <ManagerComparisonTable data={comparisonQuery.data} />
          ) : (
            <ManagerComparisonTableSkeleton />
          )}
        </MyTrendsSection>
      )}

      {typeof entryId === "number" && (
        <MyTrendsSection title="Team impact">
          <TeamImpactView entryId={entryId} />
        </MyTrendsSection>
      )}

      <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <DialogContent className="border-secondary bg-primary text-text">
          <DialogHeader>
            <DialogTitle>Switch FPL ID</DialogTitle>
          </DialogHeader>
          <FplIdInput
            onSubmit={handleSubmitId}
            initialValue={entryId}
            submitLabel="Use this ID"
            autoFocus
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTrends;

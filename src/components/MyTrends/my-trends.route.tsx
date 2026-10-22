import type { RootState } from "src/redux/store";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { selectGameweekRange } from "src/redux/slices/gameweeksSlice";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import { getManagerAnalysis, type SectionQuery } from "src/queries/getManagerAnalysis";
import type { ReadyAnalysis } from "src/queries/analytics-contracts.generated";
import FplIdInput from "./fpl-id-input";
import RangeRankCard from "./range-rank-card";
import RangeRankCardSkeleton from "./range-rank-card.skeleton";
import RankTrajectoryChart from "./rank-trajectory-chart";
import RankTrajectoryChartSkeleton from "./rank-trajectory-chart.skeleton";
import ManagerComparisonTable from "./manager-comparison-table";
import ManagerComparisonTableSkeleton from "./manager-comparison-table.skeleton";
import MyTrendsSection from "./my-trends-section";
import AccuracyMeter from "./accuracy-meter";
import TeamAndRankKillersView from "./TeamImpact/team-and-rank-killers";
import TransfersCaptaincyView from "./TransfersCaptaincy/transfers-captaincy";
import { FPL_ID_STORAGE_KEY } from "./constants";

const MyTrends: React.FC = () => {
  const [entryId, setEntryId] = useLocalStorage<number>(FPL_ID_STORAGE_KEY);
  const { startGameweek, endGameweek, isPreseason, analysisSeasonLabel } =
    useSelector(selectGameweekRange);
  const hasProvisionalGameweek = useSelector((state: RootState) =>
    state.events.events.some(
      (event) =>
        event.id >= startGameweek && event.id <= endGameweek && !event.data_checked,
    ),
  );
  const refetchInterval = hasProvisionalGameweek ? 60 * 1000 : false;
  const [switchOpen, setSwitchOpen] = useState(false);
  const canLoadManager = !isPreseason && typeof entryId === "number";

  const forceRefresh = useRef(false);
  const analysisQuery = useQuery({
    queryKey: [
      "manager-analysis",
      analysisSeasonLabel,
      entryId,
      startGameweek,
      endGameweek,
    ],
    queryFn: ({ signal }) => {
      const refresh = forceRefresh.current;
      forceRefresh.current = false;
      return getManagerAnalysis(
        entryId as number,
        startGameweek,
        endGameweek,
        signal,
        refresh,
      );
    },
    enabled: canLoadManager && startGameweek > 0 && endGameweek > 0,
    staleTime: 60_000,
    refetchInterval: (query) =>
      query.state.data?.state === "preparing" ||
      (query.state.data?.state === "ready" &&
        query.state.data.stale &&
        !query.state.data.sectionErrors["refresh"])
        ? 2000
        : refetchInterval,
    retry: 1,
  });
  const analysis = analysisQuery.data;
  const section = <K extends keyof ReadyAnalysis["sections"]>(
    key: K,
  ): SectionQuery<Extract<ReadyAnalysis["sections"][K], { status: "ready" }>["data"]> => {
    const value = analysis?.state === "ready" ? analysis.sections[key] : undefined;
    const error =
      value?.status === "error"
        ? new Error(value.error.message)
        : analysis?.state === "failed"
          ? new Error(analysis.error.message)
          : analysisQuery.error;
    return {
      data: value?.status === "ready" ? value.data : undefined,
      isPending: analysisQuery.isPending || analysis?.state === "preparing",
      isError: !!error,
      error,
    };
  };
  const summaryQuery = section("summary"),
    trajectoryQuery = section("trajectory"),
    rangeRankQuery = section("rangeRank"),
    comparisonQuery = section("comparison"),
    teamImpactQuery = section("teamImpact"),
    transfersQuery = section("transfers"),
    captainImpactQuery = section("captainImpact");
  const retryAnalysis = () => {
    forceRefresh.current = true;
    void analysisQuery.refetch();
  };

  const handleSubmitId = (id: number) => {
    setEntryId(id);
    setSwitchOpen(false);
  };

  if (isPreseason) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-4 text-center">
        <h1 className="text-xl font-semibold text-text md:text-3xl">My Trends</h1>
        {hasProvisionalGameweek && (
          <p className="text-xs text-text/70">
            Live gameweek: points, ownership and rank estimates are provisional. This page
            refreshes automatically as data arrives.
          </p>
        )}
        <Card className="w-full border-secondary bg-primary p-5 shadow-lg">
          <p className="text-sm font-semibold text-text">Returns after Gameweek 1</p>
          <p className="mt-2 text-sm leading-6 text-text/65">
            Preseason player analysis uses {analysisSeasonLabel ?? "previous-season"}{" "}
            totals, but manager IDs and picks belong to the new season. My Trends will
            activate once current gameweek data is available.
          </p>
        </Card>
      </div>
    );
  }

  if (entryId === null) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-4">
        <h1 className="text-xl font-semibold text-text">My Trends</h1>
        <p className="text-sm text-text/70">
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
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-text md:text-3xl">My Trends</h1>
        <Link
          to="/case-studies/manager-sampling"
          className="text-xs font-medium text-text/65 underline underline-offset-4 transition-colors hover:text-highlight md:text-sm"
        >
          Case study: manager sampling
        </Link>
      </div>
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

      <div
        className="flex flex-wrap items-center justify-between gap-2 text-xs text-text/65"
        aria-live="polite"
      >
        <span>
          {analysis?.state === "preparing"
            ? analysis.message
            : analysis?.state === "ready"
              ? analysis.stale
                ? "Showing saved results while your analysis refreshes."
                : `Updated ${new Date(analysis.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={retryAnalysis}
            disabled={analysisQuery.isFetching}
          >
            Refresh analysis
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSwitchOpen(true)}>
            Switch ID
          </Button>
        </div>
      </div>
      {analysisQuery.isError && analysis?.state === "ready" && (
        <p className="text-sm text-amber-300">
          The refresh failed. Your saved results are still shown.
        </p>
      )}
      {analysis?.state === "ready" && Object.keys(analysis.sectionErrors).length > 0 && (
        <p className="text-sm text-amber-300">
          Some sections could not refresh. Saved sections retain their earlier data. Use
          Refresh analysis to retry.
        </p>
      )}
      {summaryError && (
        <Card className="border-rose-400/40 bg-primary p-4 text-sm text-rose-300">
          {summaryError.message}
        </Card>
      )}

      {(rangeRankQuery.data || rangeRankQuery.isPending || rangeRankQuery.isError) && (
        <MyTrendsSection
          title="My rank"
          headerRight={
            startGameweek > 1 && rangeRankQuery.data?.range_rank_official == null ? (
              <AccuracyMeter
                stratum={rangeRankQuery.data?.stratum_used ?? null}
                sampleSize={rangeRankQuery.data?.sample_size ?? 0}
                sampleStatus={rangeRankQuery.data?.sample_status}
                isLoading={rangeRankQuery.isPending || trajectoryQuery.isPending}
              />
            ) : undefined
          }
        >
          {rangeRankQuery.isError && !rangeRankQuery.data ? (
            <p className="text-sm text-rose-300">{rangeRankQuery.error?.message}</p>
          ) : rangeRankQuery.data ? (
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

      {(comparisonQuery.data || comparisonQuery.isPending || comparisonQuery.isError) && (
        <MyTrendsSection title="How you compare">
          {comparisonQuery.isError && !comparisonQuery.data ? (
            <p className="text-sm text-rose-300">{comparisonQuery.error?.message}</p>
          ) : comparisonQuery.data ? (
            <ManagerComparisonTable data={comparisonQuery.data} />
          ) : (
            <ManagerComparisonTableSkeleton />
          )}
        </MyTrendsSection>
      )}

      {(transfersQuery.data ||
        transfersQuery.isPending ||
        transfersQuery.isError ||
        captainImpactQuery.isError ||
        captainImpactQuery.data ||
        captainImpactQuery.isPending) && (
        <MyTrendsSection title="Transfers & Captaincy">
          <TransfersCaptaincyView
            transfersQuery={transfersQuery}
            captainQuery={captainImpactQuery}
          />
        </MyTrendsSection>
      )}

      {typeof entryId === "number" && (
        <MyTrendsSection title="Team impact">
          <TeamAndRankKillersView query={teamImpactQuery} />
        </MyTrendsSection>
      )}

      <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md border-secondary bg-primary p-4 text-text sm:p-6">
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

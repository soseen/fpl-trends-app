import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { selectGameweekRange } from "src/redux/slices/gameweeksSlice";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import {
  getManagerSummary,
  type ManagerSummary,
} from "src/queries/getManagerSummary";
import {
  getManagerRangeRank,
  type ManagerRangeRank,
} from "src/queries/getManagerRangeRank";
import FplIdInput from "./fpl-id-input";
import RangeRankCard from "./range-rank-card";

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
    queryFn: () =>
      getManagerRangeRank(
        entryId as number,
        startGameweek,
        endGameweek,
      ),
    enabled:
      typeof entryId === "number" && startGameweek > 0 && endGameweek > 0,
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
        <p className="text-sm text-text/70">
          Enter your FPL ID to see how you've performed in the selected gameweek
          range.
        </p>
        <Card className="w-full border-secondary bg-primary p-4 shadow-lg">
          <FplIdInput onSubmit={handleSubmitId} autoFocus />
        </Card>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const summaryError =
    summaryQuery.isError ? (summaryQuery.error as Error) : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-text">My Trends</h1>
          {summary && (
            <p className="truncate text-sm text-text/70">
              {summary.player_first_name} {summary.player_last_name} ·{" "}
              <span className="text-text">{summary.name}</span> · ID{" "}
              {entryId}
            </p>
          )}
          {!summary && summaryQuery.isPending && (
            <Skeleton className="mt-1 h-4 w-48" />
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSwitchOpen(true)}
          className="border-secondary bg-secondary text-text hover:bg-secondary/80"
        >
          Switch ID
        </Button>
      </div>

      {summaryError && (
        <Card className="border-rose-400/40 bg-primary p-4 text-sm text-rose-300">
          Couldn't load that FPL ID — double-check it and try switching.
        </Card>
      )}

      {rangeRankQuery.isPending && !rangeRankQuery.data && (
        <Card className="border-secondary bg-primary p-4">
          <CardContent className="space-y-2 p-0">
            <Skeleton className="h-5 w-32 bg-secondary" />
            <Skeleton className="h-8 w-48 bg-secondary" />
          </CardContent>
        </Card>
      )}

      {rangeRankQuery.data && (
        <RangeRankCard
          data={rangeRankQuery.data}
          startGw={startGameweek}
          endGw={endGameweek}
        />
      )}

      <Card className="border-secondary bg-primary p-4 text-xs text-text/60">
        Range rank is estimated from a sample of FPL managers and gradually
        gets sharper as more data is collected. Use the gameweek slider above
        to change the range.
      </Card>

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

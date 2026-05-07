import { useState, type FC } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ManagerTransfers } from "src/queries/getManagerTransfers";
import type { CaptainImpact } from "src/queries/getCaptainImpact";
import TransferImpactSummary from "../TransferImpact/transfer-impact-summary";
import TransferEventCard from "../TransferImpact/transfer-event-card";
import RolledTransferCard from "../TransferImpact/rolled-transfer-card";
import TransferImpactSkeleton from "../TransferImpact/transfer-impact.skeleton";
import CaptainImpactSummary from "../CaptainImpact/captain-impact-summary";
import CaptainEventCard from "../CaptainImpact/captain-event-card";
import CaptainImpactSkeleton from "../CaptainImpact/captain-impact.skeleton";
import TabSwitch from "../tab-switch";

const TABS = [
  { id: "transfers", label: "Transfers" },
  { id: "captaincy", label: "Captaincy" },
] as const;

type Props = {
  transfersQuery: UseQueryResult<ManagerTransfers>;
  captainQuery: UseQueryResult<CaptainImpact>;
};

// Initial visible per-GW item count when expanded.
const DEFAULT_VISIBLE_GWS = 5;

type Tab = "transfers" | "captaincy";

// Two full-width tabs at the top let the user toggle between transfer
// detail and captaincy detail. This gives each section the entire row
// width — important for transfer GWs (especially WC/FH) that have lots
// of player tiles, and lets the captain section comfortably show three
// reference tiles (you / top 10k / most captained) side by side.
const TransfersCaptaincyView: FC<Props> = ({ transfersQuery, captainQuery }) => {
  const [tab, setTab] = useState<Tab>("transfers");
  const [showAll, setShowAll] = useState(false);

  const transfers = transfersQuery.data;
  const captain = captainQuery.data;
  const transfersLoading = transfersQuery.isPending;
  const captainLoading = captainQuery.isPending;

  // Build a unified GW range so both tabs render the same set of GWs
  // in the same order — only the cell content differs by tab.
  const startGw = Math.min(
    transfers?.start_gw ?? Number.POSITIVE_INFINITY,
    captain?.start_gw ?? Number.POSITIVE_INFINITY,
  );
  const endGw = Math.max(transfers?.end_gw ?? 0, captain?.end_gw ?? 0);

  const transferByGw = new Map((transfers?.events ?? []).map((e) => [e.gw, e]));
  const captainByGw = new Map((captain?.events ?? []).map((e) => [e.gw, e]));

  const orderedGws: number[] = [];
  if (Number.isFinite(startGw) && endGw >= startGw) {
    // Skip GW 1: no transfers are possible before the season starts,
    // so a "rolled" placeholder there is misleading.
    const fromGw = Math.max(startGw, 2);
    for (let gw = endGw; gw >= fromGw; gw -= 1) orderedGws.push(gw);
  }
  const visibleGws = showAll ? orderedGws : orderedGws.slice(0, DEFAULT_VISIBLE_GWS);
  const hiddenCount = Math.max(0, orderedGws.length - DEFAULT_VISIBLE_GWS);

  return (
    <div className="flex w-full flex-col gap-5">
      <TabSwitch tabs={TABS} value={tab} onChange={(id) => setTab(id as Tab)} />

      {/* Active tab content. Each section gets the full container
          width — no inner column split — so cards have plenty of room. */}
      {tab === "transfers" ? (
        <div className="flex w-full flex-col gap-4">
          {transfersQuery.isError ? (
            <Card className="border-rose-400/40 bg-primary p-4 text-center text-sm text-rose-300">
              Couldn&apos;t load transfer impact for this range.
            </Card>
          ) : transfersLoading ? (
            <TransferImpactSkeleton />
          ) : transfers ? (
            <>
              <TransferImpactSummary
                totalNet={transfers.total_net_points}
                totalTransfers={transfers.total_transfers}
                totalRankImpact={transfers.total_rank_impact}
              />
              {transfers.incomplete && (
                <p className="text-center text-[10px] text-text/60 sm:text-xs">
                  Working from cached transfers — couldn&apos;t reach FPL just now.
                </p>
              )}
              {transfers.notes?.incomplete_picks && (
                <p className="text-center text-[10px] text-text/60 sm:text-xs">
                  Some lineups couldn&apos;t be loaded — rank impact may be partial.
                </p>
              )}
              <div className="flex flex-col gap-3">
                {visibleGws.map((gw) => {
                  const ev = transferByGw.get(gw);
                  return ev ? (
                    <TransferEventCard key={`tev-${gw}`} event={ev} />
                  ) : (
                    <RolledTransferCard key={`tr-${gw}`} gw={gw} />
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4">
          {captainQuery.isError ? (
            <Card className="border-rose-400/40 bg-primary p-4 text-center text-sm text-rose-300">
              Couldn&apos;t load captain impact for this range.
            </Card>
          ) : captainLoading ? (
            <CaptainImpactSkeleton />
          ) : captain ? (
            <>
              <CaptainImpactSummary
                totalUser={captain.total_user_captain_pts}
                totalTop10k={captain.total_top10k_captain_pts}
                totalTemplate={captain.total_template_captain_pts}
                totalDiffVsTop10k={captain.total_diff_vs_top10k}
                totalDiffVsTemplate={captain.total_diff_vs_template}
                totalRankImpact={captain.total_rank_impact ?? null}
                matchedTop10kCount={captain.matched_top10k_count}
                matchedTemplateCount={captain.matched_template_count}
                totalGws={captain.total_with_captain}
              />
              {captain.notes?.partial_rank_impact && (
                <p className="text-center text-[10px] text-text/60 sm:text-xs">
                  Some captain sample data is missing — rank impact is based on available
                  GWs.
                </p>
              )}
              <div className="flex flex-col gap-3">
                {visibleGws.map((gw) => {
                  const ev = captainByGw.get(gw);
                  if (!ev) return null;
                  return (
                    <CaptainEventCard
                      key={`cev-${gw}`}
                      event={ev}
                      rankPerPoint={captain.notes.rank_per_point}
                    />
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      )}

      {hiddenCount > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll((s) => !s)}
            className="border-secondary bg-transparent text-sm text-text hover:bg-accent4/20"
          >
            {showAll ? "Show fewer" : `Show all (${orderedGws.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransfersCaptaincyView;

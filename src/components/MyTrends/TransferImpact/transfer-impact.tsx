import { useState, type FC } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  ManagerTransfers,
  TransferImpactEvent,
} from "src/queries/getManagerTransfers";
import TransferImpactSummary from "./transfer-impact-summary";
import TransferEventCard from "./transfer-event-card";
import RolledTransferCard from "./rolled-transfer-card";
import TransferImpactSkeleton from "./transfer-impact.skeleton";

type Props = {
  query: UseQueryResult<ManagerTransfers>;
};

// Initially-visible item count (events + rolled placeholders combined).
const DEFAULT_VISIBLE_ITEMS = 5;

type DisplayItem =
  | { kind: "event"; gw: number; event: TransferImpactEvent }
  | { kind: "rolled"; gw: number };

// Mix transfer events with placeholder rows for GWs in range that had
// no transfers and no chip. Newest GW first (matches event ordering
// from backend). GW 1 is dropped because no transfers are possible
// before the season starts.
const buildItems = (data: ManagerTransfers): DisplayItem[] => {
  const eventByGw = new Map(data.events.map((e) => [e.gw, e]));
  const items: DisplayItem[] = [];
  const fromGw = Math.max(data.start_gw, 2);
  for (let gw = data.end_gw; gw >= fromGw; gw -= 1) {
    const ev = eventByGw.get(gw);
    if (ev) {
      items.push({ kind: "event", gw, event: ev });
    } else {
      items.push({ kind: "rolled", gw });
    }
  }
  return items;
};

const TransferImpactView: FC<Props> = ({ query }) => {
  const [showAll, setShowAll] = useState(false);

  if (query.isPending) {
    return <TransferImpactSkeleton />;
  }

  if (query.isError) {
    return (
      <Card className="border-rose-400/40 bg-primary p-4 text-center text-sm text-rose-300">
        Couldn&apos;t load transfer impact for this range. Try switching IDs or adjusting
        the gameweek range.
      </Card>
    );
  }

  const data = query.data;
  if (!data) return null;

  const items = buildItems(data);
  const visibleItems = showAll ? items : items.slice(0, DEFAULT_VISIBLE_ITEMS);
  const hiddenCount = Math.max(0, items.length - DEFAULT_VISIBLE_ITEMS);

  return (
    <div className="flex w-full flex-col gap-4">
      <TransferImpactSummary
        totalNet={data.total_net_points}
        totalTransfers={data.total_transfers}
        totalRankImpact={data.total_rank_impact}
      />

      {data.incomplete && (
        <p className="text-center text-[10px] text-text/60 sm:text-xs">
          Working from cached transfers — couldn&apos;t reach FPL just now.
        </p>
      )}
      {data.notes?.incomplete_picks && (
        <p className="text-center text-[10px] text-text/60 sm:text-xs">
          Some lineups couldn&apos;t be loaded — rank impact may be partial.
        </p>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleItems.map((item) =>
            item.kind === "event" ? (
              <TransferEventCard key={`ev-${item.gw}`} event={item.event} />
            ) : (
              <RolledTransferCard key={`rolled-${item.gw}`} gw={item.gw} />
            ),
          )}
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
            {showAll ? "Show fewer" : `Show all (${items.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransferImpactView;

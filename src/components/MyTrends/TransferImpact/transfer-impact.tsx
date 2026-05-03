import { useState } from "react";
import type React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ManagerTransfers } from "src/queries/getManagerTransfers";
import TransferImpactSummary from "./transfer-impact-summary";
import TransferEventCard from "./transfer-event-card";
import TransferImpactSkeleton from "./transfer-impact.skeleton";

type Props = {
  query: UseQueryResult<ManagerTransfers>;
};

// Initially-visible event count. The user explicitly asked for "maximum
// of 5 rows and have the Show more button to view all".
const DEFAULT_VISIBLE_EVENTS = 5;

const TransferImpactView: React.FC<Props> = ({ query }) => {
  const [showAll, setShowAll] = useState(false);

  if (query.isPending) {
    return <TransferImpactSkeleton />;
  }

  if (query.isError) {
    return (
      <Card className="border-rose-400/40 bg-primary p-4 text-center text-sm text-rose-300">
        Couldn&apos;t load transfer impact for this range. Try switching IDs
        or adjusting the gameweek range.
      </Card>
    );
  }

  const data = query.data;
  if (!data) return null;

  const visibleEvents = showAll
    ? data.events
    : data.events.slice(0, DEFAULT_VISIBLE_EVENTS);
  const hiddenCount = Math.max(0, data.events.length - DEFAULT_VISIBLE_EVENTS);

  return (
    <div className="flex w-full flex-col gap-4">
      <TransferImpactSummary
        totalNet={data.total_net_points}
        totalTransfers={data.total_transfers}
        avgNetPerTransfer={data.avg_net_per_transfer}
      />

      {data.incomplete && (
        <p className="text-text/60 text-center text-[10px] sm:text-xs">
          Working from cached transfers — couldn&apos;t reach FPL just now.
        </p>
      )}

      {data.events.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleEvents.map((event) => (
            <TransferEventCard key={event.gw} event={event} />
          ))}
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
            {showAll ? "Show fewer" : `Show all (${data.events.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransferImpactView;

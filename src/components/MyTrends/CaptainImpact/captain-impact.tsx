import { useState, type FC } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CaptainImpact } from "src/queries/getCaptainImpact";
import CaptainImpactSummary from "./captain-impact-summary";
import CaptainEventCard from "./captain-event-card";
import CaptainImpactSkeleton from "./captain-impact.skeleton";

type Props = {
  query: UseQueryResult<CaptainImpact>;
};

// Same default-visible count as TransferImpact for consistency.
const DEFAULT_VISIBLE_EVENTS = 5;

const CaptainImpactView: FC<Props> = ({ query }) => {
  const [showAll, setShowAll] = useState(false);

  if (query.isPending) {
    return <CaptainImpactSkeleton />;
  }

  if (query.isError) {
    return (
      <Card className="border-rose-400/40 bg-primary p-4 text-center text-sm text-rose-300">
        Couldn&apos;t load captain impact for this range. Try switching IDs or adjusting
        the gameweek range.
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
      <CaptainImpactSummary
        totalUser={data.total_user_captain_pts}
        totalTop10k={data.total_top10k_captain_pts}
        totalTemplate={data.total_template_captain_pts}
        totalDiffVsTop10k={data.total_diff_vs_top10k}
        totalDiffVsTemplate={data.total_diff_vs_template}
        totalRankImpact={data.total_rank_impact ?? null}
        matchedTop10kCount={data.matched_top10k_count}
        matchedTemplateCount={data.matched_template_count}
        totalGws={data.total_with_captain}
      />

      {data.notes?.partial_rank_impact && (
        <p className="text-center text-[10px] text-text/60 sm:text-xs">
          Some captain sample data is missing — rank impact is based on available GWs.
        </p>
      )}

      {data.events.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleEvents.map((event) => (
            <CaptainEventCard key={event.gw} event={event} />
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

export default CaptainImpactView;

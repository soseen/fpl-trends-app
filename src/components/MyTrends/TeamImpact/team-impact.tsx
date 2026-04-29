import type React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { selectGameweekRange } from "src/redux/slices/gameweeksSlice";
import { getTeamImpact, type TeamImpact } from "src/queries/getTeamImpact";
import TeamImpactPitch from "./team-impact-pitch";
import PlayerImpactAccordion from "./player-impact-accordion";

type Props = {
  entryId: number;
};

const TeamImpactView: React.FC<Props> = ({ entryId }) => {
  const { startGameweek, endGameweek } = useSelector(selectGameweekRange);

  const teamImpactQuery = useQuery<TeamImpact>({
    queryKey: ["team-impact", entryId, startGameweek, endGameweek],
    queryFn: () => getTeamImpact(entryId, startGameweek, endGameweek),
    enabled: startGameweek > 0 && endGameweek > 0,
    // The first request for a (entry, range) tuple may take 5–10s while we
    // fetch and persist picks from the FPL API. Subsequent requests hit
    // our DB and are sub-second, hence a generous staleTime so the user
    // doesn't pay that cost twice on the same session.
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (teamImpactQuery.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-72 w-full bg-accent3 sm:h-[480px] md:h-[600px]" />
        <Skeleton className="h-64 w-full bg-accent3" />
      </div>
    );
  }

  if (teamImpactQuery.isError || !teamImpactQuery.data) {
    return (
      <Card className="border-rose-400/40 bg-primary p-4 text-sm text-rose-300">
        Couldn&apos;t load team impact for this range. Try again in a moment.
      </Card>
    );
  }

  const data = teamImpactQuery.data;
  const showRankImpact = data.totals.rank_per_point !== null;

  return (
    <div className="flex flex-col gap-4">
      {data.most_played_xi ? (
        <TeamImpactPitch
          xi={data.most_played_xi}
          startGw={data.start_gw}
          endGw={data.end_gw}
          showRankImpact={showRankImpact}
        />
      ) : (
        <Card className="text-text/70 border-secondary bg-primary p-4 text-sm">
          We couldn&apos;t reconstruct your starting XI for this range — most likely the
          gameweeks aren&apos;t finished yet, or your picks history isn&apos;t available
          from FPL.
        </Card>
      )}

      <div className="border-accent4/40 rounded-md border bg-primary p-2 sm:p-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
          <h3 className="text-sm font-semibold text-text sm:text-base">
            Player breakdown
          </h3>
          <p className="text-text/60 text-[11px] sm:text-xs">
            {showRankImpact
              ? "Sorted by rank impact (rank places gained)"
              : "Sorted by points contributed"}
          </p>
        </div>
        <PlayerImpactAccordion players={data.players} showRankImpact={showRankImpact} />
        {data.notes.fallback_used && (
          <p className="text-text/60 mt-2 px-2 text-[11px] sm:text-xs">
            We don&apos;t have you ranked yet, so rank impact isn&apos;t shown — points
            are still attributed.
          </p>
        )}
        {data.notes.incomplete_picks && (
          <p className="text-text/60 mt-1 px-2 text-[11px] sm:text-xs">
            Some gameweeks couldn&apos;t be loaded from FPL — totals may be partial.
          </p>
        )}
        {data.notes.small_sample_gws.length > 0 && (
          <p className="text-text/60 mt-1 px-2 text-[11px] sm:text-xs">
            Sample data is light for GW {data.notes.small_sample_gws.join(", ")} — captain
            uplift approximated as global ownership.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamImpactView;

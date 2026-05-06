import type React from "react";
import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TeamImpact } from "src/queries/getTeamImpact";
import TeamImpactPitch from "./team-impact-pitch";
import PlayerImpactAccordion from "./player-impact-accordion";
import TeamImpactSkeleton from "./team-impact.skeleton";

const INITIAL_VISIBLE = 8;

type Props = {
  query: UseQueryResult<TeamImpact>;
};

const TeamImpactView: React.FC<Props> = ({ query }) => {
  const [expanded, setExpanded] = useState(false);

  if (query.isPending) {
    return <TeamImpactSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <Card className="border-rose-400/40 bg-primary p-4 text-sm text-rose-300">
        Couldn&apos;t load team impact for this range. Try again in a moment.
      </Card>
    );
  }

  const data = query.data;
  const showRankImpact = data.totals.rank_per_point !== null;
  const orderedPlayers = showRankImpact
    ? data.players
    : [...data.players].sort(
        (a, b) =>
          (b.played_count === 0 ? b.raw_points : b.points_for_user) -
          (a.played_count === 0 ? a.raw_points : a.points_for_user),
      );
  const visiblePlayers = expanded
    ? orderedPlayers
    : orderedPlayers.slice(0, INITIAL_VISIBLE);
  const canExpand = orderedPlayers.length > INITIAL_VISIBLE;

  return (
    <div className="flex flex-col gap-4">
      {data.most_played_xi ? (
        <TeamImpactPitch
          xi={{
            gk: [data.most_played_xi.gk],
            def: data.most_played_xi.def,
            mid: data.most_played_xi.mid,
            fwd: data.most_played_xi.fwd,
          }}
          title={`Your most-played XI (gameweek ${data.start_gw}–${data.end_gw})`}
          animationKey={`${data.start_gw}-${data.end_gw}-${data.most_played_xi.gk.player_id}`}
          showRankImpact={showRankImpact}
        />
      ) : (
        <Card className="border-secondary bg-primary p-4 text-sm text-text/70">
          We couldn&apos;t reconstruct your starting XI for this range — most likely the
          gameweeks aren&apos;t finished yet, or your picks history isn&apos;t available
          from FPL.
        </Card>
      )}

      <div className="rounded-md border border-accent4 bg-primary p-2 sm:p-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
          <h3 className="text-sm font-semibold text-text sm:text-base">
            Player breakdown
          </h3>
          <p className="text-[11px] text-text/60 sm:text-xs">
            {showRankImpact
              ? "Sorted by rank impact (rank places gained)"
              : "Sorted by points contributed"}
          </p>
        </div>
        <PlayerImpactAccordion players={visiblePlayers} showRankImpact={showRankImpact} />
        {canExpand && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-text/80 sm:text-sm"
            >
              {expanded ? "Show less" : `Show all ${orderedPlayers.length}`}
              {expanded ? (
                <FaChevronUp className="ml-1 h-3 w-3" />
              ) : (
                <FaChevronDown className="ml-1 h-3 w-3" />
              )}
            </Button>
          </div>
        )}
        {data.notes.fallback_used && (
          <p className="mt-2 px-2 text-[11px] text-text/60 sm:text-xs">
            We don&apos;t have you ranked yet, so rank impact isn&apos;t shown — points
            are still attributed.
          </p>
        )}
        {data.notes.incomplete_picks && (
          <p className="mt-1 px-2 text-[11px] text-text/60 sm:text-xs">
            Some gameweeks couldn&apos;t be loaded from FPL — totals may be partial.
          </p>
        )}
        {data.notes.small_sample_gws.length > 0 && (
          <p className="mt-1 px-2 text-[11px] text-text/60 sm:text-xs">
            EO sample is light for some GWs, so those rows fall back to global
            ownership and captain data.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamImpactView;

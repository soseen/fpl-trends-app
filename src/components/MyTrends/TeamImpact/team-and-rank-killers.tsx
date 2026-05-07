import { useState, type FC } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { PlayerImpact, TeamImpact, TeamImpactTile } from "src/queries/getTeamImpact";
import TabSwitch from "../tab-switch";
import TeamImpactView from "./team-impact";
import TeamImpactPitch from "./team-impact-pitch";
import PlayerImpactAccordion from "./player-impact-accordion";

type Props = {
  query: UseQueryResult<TeamImpact>;
};

const TABS = [
  { id: "your-xi", label: "Your XI" },
  { id: "rank-killers", label: "Rank killers" },
] as const;

type Tab = (typeof TABS)[number]["id"];

// Map a PlayerImpact (rank-killer entry) to the lighter TeamImpactTile shape
// the pitch card consumes. For rank killers, `points_for_user` is always 0
// (they didn't play for this user) so we surface `raw_points` in its place —
// the "Rank killers" tab framing makes it clear this is points the user
// missed out on.
const toTile = (p: PlayerImpact): TeamImpactTile => ({
  player_id: p.player_id,
  code: p.code,
  web_name: p.web_name,
  team_code: p.team_code,
  element_type: p.element_type,
  points_for_user: p.raw_points,
  rank_impact: p.rank_impact,
});

const TeamAndRankKillersView: FC<Props> = ({ query }) => {
  const [tab, setTab] = useState<Tab>("your-xi");

  const data = query.data;
  const hasRankKillers = !!data && data.rank_killers.length > 0;

  // While loading, on error, or when there are no rank killers to switch to,
  // fall back to the standalone Team impact view (no toggle).
  if (!hasRankKillers) {
    return <TeamImpactView query={query} />;
  }

  const killers = data!.rank_killers;
  // The API normally returns a formation-valid rank-killer XI. Group directly
  // by FPL position so each line lands in the right pitch row.
  const killerXi = {
    gk: killers.filter((p) => p.element_type === 1).map(toTile),
    def: killers.filter((p) => p.element_type === 2).map(toTile),
    mid: killers.filter((p) => p.element_type === 3).map(toTile),
    fwd: killers.filter((p) => p.element_type === 4).map(toTile),
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <TabSwitch tabs={TABS} value={tab} onChange={(id) => setTab(id as Tab)} />

      {tab === "your-xi" ? (
        <TeamImpactView query={query} />
      ) : (
        <div className="flex flex-col gap-4">
          <TeamImpactPitch
            xi={killerXi}
            title={`Top rank killers (gameweek ${data!.start_gw}–${data!.end_gw})`}
            animationKey={`rk-${data!.start_gw}-${data!.end_gw}-${killers.length}`}
            showRankImpact
          />

          <div className="rounded-md border border-accent4 bg-primary p-2 sm:p-3">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
              <h3 className="text-sm font-semibold text-text sm:text-base">
                Top rank killers
              </h3>
              <p className="text-[11px] text-text/60 sm:text-xs">
                Highly-owned players you didn&apos;t have that scored big
              </p>
            </div>
            <PlayerImpactAccordion players={killers} showRankImpact />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAndRankKillersView;

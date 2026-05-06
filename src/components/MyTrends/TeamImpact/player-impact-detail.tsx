import type React from "react";
import {
  FaFutbol,
  FaHandshake,
  FaShieldAlt,
  FaStar,
  FaRegHandPaper,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { TbLockFilled } from "react-icons/tb";
import { GiSoccerKick } from "react-icons/gi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RootState } from "src/redux/store";
import type {
  PlayerImpact,
  PlayerImpactGwBreakdown,
  PlayerMatch,
} from "src/queries/getTeamImpact";
import { getTeamsBadge } from "src/utils/images";
import { formatRankDelta, rankImpactColorClass, POINTS_HAUL_THRESHOLD } from "./format";

type Props = {
  player: PlayerImpact;
  showRankImpact: boolean;
};

// FPL defcon thresholds (per GW): outfield = 10 / 12 / 12 (DEF / MID / FWD)
// for the +2 bonus. GKs have clean-sheet/saves rules instead — defcon
// scoring isn't applied to them, so the chip is hidden for keepers.
const ELEMENT_TYPE_GK = 1;
const ELEMENT_TYPE_DEF = 2;
const ELEMENT_TYPE_MID = 3;
const ELEMENT_TYPE_FWD = 4;

const defconThreshold = (elementType: number): number =>
  elementType === ELEMENT_TYPE_DEF ? 10 : 12;

// "vs ARS 2-1" / "@ LIV 0-2" sub-line under the GW number. Multiple
// fixtures (DGWs) stack vertically. Score color reflects the result
// from the player's club's perspective: green = win, amber = draw,
// rose = loss. Score may be null if the fixture hasn't been finalised
// in our DB — we just omit the score in that case.
const matchResultClass = (m: PlayerMatch): string => {
  if (m.team_score === null || m.opponent_score === null) return "text-text/50";
  if (m.team_score > m.opponent_score) return "text-emerald-400/80";
  if (m.team_score < m.opponent_score) return "text-rose-400/80";
  return "text-amber-400/80";
};

const MatchSummary: React.FC<{ matches: PlayerMatch[] }> = ({ matches }) => {
  const teams = useSelector((state: RootState) => state.teams.list);

  if (matches.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      {matches.map((m, i) => {
        const badgeCode =
          m.opponent_code > 0
            ? m.opponent_code
            : teams.find((team) => team.short_name === m.opponent_short)?.code;

        return (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 rounded-md bg-accent3/50 px-1.5 py-1 ring-1 ring-inset ring-accent4/60 ${matchResultClass(
              m,
            )}`}
            title={`${m.was_home ? "Home vs" : "Away at"} ${m.opponent_short}`}
          >
            <img
              src={getTeamsBadge(badgeCode)}
              alt={m.opponent_short}
              className="h-5 w-5 shrink-0 object-contain"
            />
            {m.team_score !== null && m.opponent_score !== null ? (
              <span className="text-[10px] font-semibold tabular-nums leading-none">
                {m.team_score}-{m.opponent_score}
              </span>
            ) : (
              <span className="text-[10px] font-semibold leading-none">
                {m.opponent_short}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

// Icon + count chip used to render the per-GW match-event breakdown.
// Mirrors the icon vocabulary used by the home-page pitch card
// (`Home/BestScoringFootballers/pitch-card.tsx`) so the same visual
// shorthand reads consistently across the app: ball = goals, handshake
// = assists, lock = clean sheet, shield = defcon (only shown when
// threshold met), star = bonus, open hand = saves, kick = goal
// conceded. Tooltip explains the FPL scoring rule on hover.
//
// Rendered as a proper chip — rounded background tile, subtle border
// matching the icon tone — instead of a bare icon + number. The tile
// makes each event read as one discrete "thing earned points" unit and
// keeps the row compact when several events stack up.
const IconChip: React.FC<{
  icon: React.ReactNode;
  value: number;
  tone: string;
  title: string;
}> = ({ icon, value, tone, title }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-accent3/70 px-1.5 py-[2px] text-[11px] ring-1 ring-inset sm:text-xs ${tone}`}
      >
        <span className="flex h-3 items-center sm:h-3.5">{icon}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </span>
    </TooltipTrigger>
    <TooltipContent>{title}</TooltipContent>
  </Tooltip>
);

// Tone palette for the chips. Bundles foreground text colour and inset
// ring colour so each event type reads as a distinct family of points.
// Greens = "this earned points", cyan = assists, amber = bonus, rose =
// goals conceded (cost points).
const TONE = {
  good: "text-emerald-400 ring-emerald-400/40",
  assist: "text-cyan-300 ring-cyan-300/40",
  bonus: "text-amber-400 ring-amber-400/40",
  bad: "text-rose-400 ring-rose-400/40",
} as const;

// Renders the relevant match events for a GW. Shows only what's
// position-relevant AND scoring-relevant — a chip appears when the
// player actually earned (or lost) points from that event. So a
// midfielder who got 8 defcons (under the 12 threshold) won't have a
// shield chip; only when the +2 bonus was awarded does the shield
// show up. Same logic for saves (only at 3+) and goals conceded
// (only at 2+).
const EventChips: React.FC<{
  row: PlayerImpactGwBreakdown;
  elementType: number;
}> = ({ row, elementType }) => {
  // had_fixture absent from older API responses → assume the player had
  // a fixture (the old default), so a stale backend doesn't paint every
  // row as "No fixture".
  if (row.had_fixture === false) {
    return <span className="text-[10px] text-text/40">No fixture</span>;
  }
  if (row.minutes === 0) {
    return <span className="text-[10px] text-text/40">DNP</span>;
  }
  const isGk = elementType === ELEMENT_TYPE_GK;
  const isDef = elementType === ELEMENT_TYPE_DEF;
  const isMid = elementType === ELEMENT_TYPE_MID;
  const isFwd = elementType === ELEMENT_TYPE_FWD;
  const isOutfield = !isGk;

  const defconCount = row.defensive_contribution;
  const defconMet = isOutfield && defconCount >= defconThreshold(elementType);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {row.goals > 0 && (
        <IconChip
          icon={<FaFutbol />}
          value={row.goals}
          tone={TONE.good}
          title={`${row.goals} goal${row.goals === 1 ? "" : "s"}`}
        />
      )}
      {row.assists > 0 && (
        <IconChip
          icon={<FaHandshake />}
          value={row.assists}
          tone={TONE.assist}
          title={`${row.assists} assist${row.assists === 1 ? "" : "s"}`}
        />
      )}
      {(isGk || isDef) && row.clean_sheets > 0 && (
        <IconChip
          icon={<TbLockFilled />}
          value={row.clean_sheets}
          tone={TONE.good}
          title="Clean sheet (+4 pts)"
        />
      )}
      {isMid && row.clean_sheets > 0 && (
        <IconChip
          icon={<TbLockFilled />}
          value={row.clean_sheets}
          tone={TONE.good}
          title="Clean sheet (+1 pt for midfielders)"
        />
      )}
      {/* Forwards: clean sheets don't earn pts, so we don't show the chip. */}
      {/* Defcon shield only renders when the threshold was met for the
          player's position (+2 bonus awarded). Below threshold the chip
          is just visual noise — the points didn't change. */}
      {defconMet && (
        <IconChip
          icon={<FaShieldAlt />}
          value={defconCount}
          tone={TONE.good}
          title={`Defensive contributions: ${defconCount} (≥ ${defconThreshold(elementType)} threshold met → +2 bonus)`}
        />
      )}
      {/* Saves chip only when 3+ (= +1 pt). Below that, it didn't score. */}
      {isGk && row.saves >= 3 && (
        <IconChip
          icon={<FaRegHandPaper />}
          value={row.saves}
          tone={TONE.good}
          title={`${row.saves} saves (every 3 = +1 pt)`}
        />
      )}
      {/* Goals conceded penalty only kicks in at 2+ (-1 pt for GK/DEF). */}
      {(isGk || isDef) && row.goals_conceded >= 2 && (
        <IconChip
          icon={<GiSoccerKick />}
          value={row.goals_conceded}
          tone={TONE.bad}
          title="Goals conceded (every 2 = -1 pt)"
        />
      )}
      {row.bonus > 0 && (
        <IconChip
          icon={<FaStar />}
          value={row.bonus}
          tone={TONE.bonus}
          title="Bonus points (BPS top 3)"
        />
      )}
      {/* Suppress unused-var lints for branches we don't currently render. */}
      {/* (isFwd flag retained for future per-position chip variants) */}
      {isFwd && null}
    </div>
  );
};

// The chip that sits next to the points cell in the per-GW table.
// Folds the role information (B / C / TC) into the same column as the
// points value, so the previous standalone "Role" column can be dropped.
type MultiplierChip = { label: string; className: string; tooltip: string } | null;

const multiplierChip = (mult: number): MultiplierChip => {
  if (mult === 0)
    return {
      label: "B",
      className: "bg-accent4 text-text/60",
      tooltip: "Benched — points didn't count toward your score",
    };
  if (mult === 2)
    return {
      label: "C",
      className: "bg-magenta text-white",
      tooltip: "Captained — points doubled",
    };
  if (mult === 3)
    return {
      label: "TC",
      className: "bg-magenta text-white",
      tooltip: "Triple captain — points tripled",
    };
  return null;
};

const PointsValue: React.FC<{
  value: string | number;
  chip: MultiplierChip;
  big: boolean;
  muted: boolean;
}> = ({ value, chip, big, muted }) => (
  <span className="inline-flex min-w-[4.75rem] items-center justify-end gap-1.5">
    {chip && (
      <span
        className={`flex h-5 min-w-5 items-center justify-center rounded-sm px-1.5 text-[10px] font-semibold leading-none ${chip.className}`}
      >
        {chip.label}
      </span>
    )}
    <span
      className={`inline-flex min-w-8 justify-center rounded-md px-2 py-1 text-sm font-bold tabular-nums leading-none ring-1 ring-inset sm:text-base ${
        big
          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
          : muted
            ? "bg-accent4/20 text-text/40 ring-text/10"
            : "bg-accent4/45 text-text ring-text/10"
      }`}
    >
      {value}
    </span>
  </span>
);

// What the user actually got from this player on this GW: 0 if benched
// (multiplier === 0), otherwise raw_points × multiplier.
const effectivePoints = (mult: number, raw: number): number =>
  mult === 0 ? 0 : raw * mult;

const PlayerImpactDetail: React.FC<Props> = ({ player, showRankImpact }) => {
  // For rank-killer rows the user didn't own the player, so multiplier is
  // always 0 but the meaning is "not in the squad" rather than "benched".
  // We display the player's raw points and skip the multiplier chip.
  const isRankKiller = player.played_count === 0;
  const totalPts = isRankKiller ? player.raw_points : player.points_for_user;
  const totalExcess = player.per_gw.reduce((s, r) => s + r.excess, 0);
  return (
    <div className="overflow-x-auto">
      <Table className="border-transparent text-xs sm:text-sm">
        <TableHeader>
          <TableRow className="border-b border-accent4 hover:bg-transparent">
            <TableHead className="h-7 px-1.5 text-text/70 sm:px-2">GW</TableHead>
            <TableHead className="h-7 px-1.5 text-text/70 sm:px-2">Events</TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              Pts
            </TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              Own%
            </TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              EO
            </TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              Excess
            </TableHead>
            {showRankImpact && (
              <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
                Rank
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {player.per_gw.map((row) => {
            // Strict false-check so older API responses (where had_fixture
            // is undefined) don't get misread as "no fixture".
            const noFixture = !isRankKiller && row.had_fixture === false;
            const benched = !isRankKiller && row.multiplier === 0 && !noFixture;
            // For owned non-starters with a fixture, show the points the
            // player actually scored (faded) — those are points the user
            // missed out on. The Total row still uses points_for_user, so
            // these "shown but un-earned" points don't inflate it.
            let pts: string | number;
            if (noFixture) pts = "—";
            else if (isRankKiller) pts = row.points;
            else if (benched) pts = row.points;
            else pts = effectivePoints(row.multiplier, row.points);
            const big =
              !benched &&
              !noFixture &&
              typeof pts === "number" &&
              pts >= POINTS_HAUL_THRESHOLD;
            const chip =
              isRankKiller || noFixture ? null : multiplierChip(row.multiplier);

            const ptsValue = (
              <PointsValue
                value={pts}
                chip={chip}
                big={big}
                muted={benched || noFixture}
              />
            );

            return (
              <TableRow
                key={row.gw}
                className="border-b border-accent4 hover:bg-transparent"
              >
                <TableCell className="px-1.5 py-1.5 text-text/80 sm:px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 shrink-0 font-semibold tabular-nums">
                      {row.gw}
                    </span>
                    <MatchSummary matches={row.matches ?? []} />
                  </div>
                </TableCell>
                <TableCell className="px-1.5 py-1.5 sm:px-2">
                  <EventChips row={row} elementType={player.element_type} />
                </TableCell>
                <TableCell className="px-1.5 py-1.5 text-right sm:px-2">
                  {chip ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{ptsValue}</TooltipTrigger>
                      <TooltipContent>{chip.tooltip}</TooltipContent>
                    </Tooltip>
                  ) : big ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{ptsValue}</TooltipTrigger>
                      <TooltipContent>
                        Big GW haul ({POINTS_HAUL_THRESHOLD}+ pts)
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    ptsValue
                  )}
                </TableCell>
                <TableCell className="px-1.5 py-1.5 text-right text-text/80 sm:px-2">
                  {(row.ownership_pct * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="px-1.5 py-1.5 text-right text-text/80 sm:px-2">
                  {(row.eo * 100).toFixed(1)}%
                </TableCell>
                <TableCell
                  className={`px-1.5 py-1.5 text-right sm:px-2 ${
                    row.excess > 0
                      ? "text-emerald-400"
                      : row.excess < 0
                        ? "text-rose-400"
                        : "text-text/60"
                  }`}
                >
                  {row.excess >= 0 ? "+" : ""}
                  {row.excess.toFixed(1)}
                </TableCell>
                {showRankImpact && (
                  <TableCell
                    className={`px-1.5 py-1.5 text-right font-semibold sm:px-2 ${rankImpactColorClass(
                      row.rank_impact_gw,
                    )}`}
                  >
                    {formatRankDelta(row.rank_impact_gw)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          <TableRow className="border-t-2 border-accent4 bg-accent4/30 hover:bg-accent4/30">
            <TableCell className="px-1.5 py-1.5 font-semibold text-text sm:px-2">
              Total
            </TableCell>
            <TableCell className="px-1.5 py-1.5 sm:px-2" />
            <TableCell className="px-1.5 py-1.5 text-right font-semibold text-text sm:px-2">
              <PointsValue
                value={totalPts}
                chip={null}
                big={typeof totalPts === "number" && totalPts >= POINTS_HAUL_THRESHOLD}
                muted={false}
              />
            </TableCell>
            <TableCell className="px-1.5 py-1.5 text-right text-text/70 sm:px-2">
              {(player.avg_ownership_pct * 100).toFixed(1)}%
            </TableCell>
            <TableCell className="px-1.5 py-1.5 text-right text-text/70 sm:px-2">
              {(player.avg_eo_in_stratum * 100).toFixed(1)}%
            </TableCell>
            <TableCell
              className={`px-1.5 py-1.5 text-right font-semibold sm:px-2 ${
                totalExcess > 0
                  ? "text-emerald-400"
                  : totalExcess < 0
                    ? "text-rose-400"
                    : "text-text/60"
              }`}
            >
              {totalExcess >= 0 ? "+" : ""}
              {totalExcess.toFixed(1)}
            </TableCell>
            {showRankImpact && (
              <TableCell
                className={`px-1.5 py-1.5 text-right font-semibold sm:px-2 ${rankImpactColorClass(
                  player.rank_impact,
                )}`}
              >
                {formatRankDelta(player.rank_impact)}
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayerImpactDetail;

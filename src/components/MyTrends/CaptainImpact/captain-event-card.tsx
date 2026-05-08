import type React from "react";
import {
  FaFutbol,
  FaHandshake,
  FaRegHandPaper,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";
import { GiSoccerKick } from "react-icons/gi";
import { TbLockFilled } from "react-icons/tb";
import { HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CaptainEvent, CaptainPlayer } from "src/queries/getCaptainImpact";
import ImpactPill from "../shared/impact-pill";
import CaptainTile from "./captain-tile";

type Props = {
  event: CaptainEvent;
  rankPerPoint: number | null;
};

const formatNet = (n: number): string => {
  const value = Number.isInteger(n) ? `${n}` : n.toFixed(1);
  if (n === 0) return "0 pts";
  return `${n > 0 ? "+" : ""}${value} pts`;
};

const formatLinePoints = (n: number): string => `${n > 0 ? "+" : ""}${n}`;

const captainBonusExposure = (player: CaptainPlayer): number =>
  (player.captain_rate ?? 0) + 2 * (player.triple_captain_rate ?? 0);

// FPL points lookup tables by element_type (1=GK, 2=DEF, 3=MID, 4=FWD).
const GOAL_PTS: Record<number, number> = { 1: 6, 2: 6, 3: 5, 4: 4 };
const CS_PTS: Record<number, number> = { 1: 4, 2: 4, 3: 1, 4: 0 };
const DC_THRESH: Record<number, number> = {
  1: Number.POSITIVE_INFINITY,
  2: 10,
  3: 12,
  4: 12,
};

type IconComponent = React.ComponentType<{ className?: string }>;

type BreakdownLine = {
  key: string;
  icon: IconComponent;
  label: string;
  points: number;
  tone: string;
};

// Decompose a captain's match into FPL points lines. Only emits non-zero rows;
// the residual "Appearance / other" absorbs minutes points and any data we
// don't track (cards, penalty misses, OG) so the rows always reconcile to
// raw_points.
const captainPointsBreakdown = (player: CaptainPlayer): BreakdownLine[] => {
  const et = player.element_type;
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const cleanSheets = player.clean_sheets ?? 0;
  const goalsConceded = player.goals_conceded ?? 0;
  const defcon = player.defensive_contribution ?? 0;
  const saves = player.saves ?? 0;
  const bonus = player.bonus ?? 0;
  const minutes = player.minutes ?? 0;

  const goalPts = goals * (GOAL_PTS[et] ?? 0);
  const assistPts = assists * 3;
  const csEligible = minutes >= 60;
  const csPts = csEligible ? cleanSheets * (CS_PTS[et] ?? 0) : 0;
  const dcThreshold = DC_THRESH[et] ?? Number.POSITIVE_INFINITY;
  const dcPts = defcon >= dcThreshold ? 2 : 0;
  const savesPts = et === 1 ? Math.floor(saves / 3) : 0;
  const concededPts = et === 1 || et === 2 ? -Math.floor(goalsConceded / 2) : 0;
  const bonusPts = bonus;

  const sum = goalPts + assistPts + csPts + dcPts + savesPts + concededPts + bonusPts;
  const otherPts = (player.raw_points ?? 0) - sum;

  const lines: BreakdownLine[] = [
    {
      key: "g",
      icon: FaFutbol,
      label: goals > 1 ? `${goals} goals` : "Goal",
      points: goalPts,
      tone: "text-emerald-400",
    },
    {
      key: "a",
      icon: FaHandshake,
      label: assists > 1 ? `${assists} assists` : "Assist",
      points: assistPts,
      tone: "text-cyan-300",
    },
    {
      key: "cs",
      icon: TbLockFilled,
      label: "Clean sheet",
      points: csPts,
      tone: "text-emerald-400",
    },
    {
      key: "dc",
      icon: FaShieldAlt,
      label: "Defensive contribution",
      points: dcPts,
      tone: "text-emerald-400",
    },
    {
      key: "sv",
      icon: FaRegHandPaper,
      label: `${saves} saves`,
      points: savesPts,
      tone: "text-emerald-400",
    },
    {
      key: "gc",
      icon: GiSoccerKick,
      label: goalsConceded === 1 ? "1 goal conceded" : `${goalsConceded} goals conceded`,
      points: concededPts,
      tone: "text-rose-400",
    },
    {
      key: "b",
      icon: FaStar,
      label: bonus > 1 ? `${bonus} bonus` : "Bonus",
      points: bonusPts,
      tone: "text-amber-400",
    },
  ].filter((line) => line.points !== 0);

  if (otherPts !== 0) {
    lines.push({
      key: "other",
      icon: HelpCircle,
      label: "Appearance / other",
      points: otherPts,
      tone: "text-text/60",
    });
  }

  return lines;
};

// Shared inner-box dimensions match CaptainTile so all 3 reference slots stay
// the same size regardless of matched/missing-data state.
const SLOT_BODY_CLASS =
  "flex h-[112px] w-20 items-center justify-center rounded-md xs:h-[128px] xs:w-24 md:h-[152px] md:w-28 lg:h-[182px] lg:w-36";

const SlotFrame: React.FC<{
  label: string;
  matched?: boolean;
  children: React.ReactNode;
}> = ({ label, matched, children }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-center text-[9px] uppercase tracking-wide text-text/60 sm:text-[10px]">
      {label}
    </span>
    {children}
    <span className="text-[9px] text-text/40 sm:text-[10px]">
      {matched ? "= your pick" : " "}
    </span>
  </div>
);

const MissingDataPlaceholder: React.FC = () => (
  <div
    className={`${SLOT_BODY_CLASS} border border-dashed border-accent4/40 bg-accent3/20 text-text/30`}
  >
    <span className="text-base">—</span>
  </div>
);

const renderReferenceSlot = (player: CaptainPlayer | null): React.ReactNode => {
  if (!player) return <MissingDataPlaceholder />;
  return <CaptainTile player={player} variant="reference" />;
};

const CaptainEventCard: React.FC<Props> = ({ event, rankPerPoint }) => {
  const { gw, differential_vs_top10k, differential_vs_template } = event;
  const primaryDiff = event.template_captain
    ? { label: "vs popular", value: differential_vs_template }
    : event.top10k_captain
      ? { label: "vs top 10k", value: differential_vs_top10k }
      : null;
  const secondaryDiff =
    event.template_captain && event.top10k_captain
      ? { label: "vs top 10k", value: differential_vs_top10k }
      : null;
  const rankImpact =
    event.rank_impact ??
    (event.captaincy_excess != null && rankPerPoint != null
      ? event.captaincy_excess * rankPerPoint
      : null);
  const isTripleCaptain = event.user_captain.multiplier === 3;
  const templateCaptain = event.template_captain;
  const userCaptainExposure = Math.max((event.user_captain.multiplier ?? 0) - 1, 0);
  const userCaptainFieldExposure = captainBonusExposure(event.user_captain);
  const templateCaptainFieldExposure = templateCaptain
    ? captainBonusExposure(templateCaptain)
    : null;
  const rankTitle =
    event.captaincy_excess != null
      ? `Captaincy excess ${formatNet(event.captaincy_excess)}. Your armband exposure ${(userCaptainExposure * 100).toFixed(0)}%; ${event.user_captain.web_name} captain EO ${(userCaptainFieldExposure * 100).toFixed(1)}%${
          templateCaptain && templateCaptainFieldExposure != null
            ? `; ${templateCaptain.web_name} captain EO ${(templateCaptainFieldExposure * 100).toFixed(1)}%`
            : ""
        }`
      : "Rank impact unavailable for this GW";

  const userPlayer = event.user_captain;
  const breakdown = captainPointsBreakdown(userPlayer);
  const didNotPlay = (userPlayer.minutes ?? 0) === 0;
  const captaincyDidntApply = userPlayer.multiplier === 0;
  const multiplier = userPlayer.multiplier ?? 1;
  const showMultiplier = multiplier > 1;

  return (
    <Card className="flex flex-col overflow-hidden border-accent4 bg-primary/40 shadow-md">
      <div className="flex w-full flex-wrap items-center justify-between gap-2 bg-accent5/80 px-3 py-1.5 sm:py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text sm:text-sm md:text-base">
            GW {gw}
          </span>
          {isTripleCaptain && (
            <span className="rounded-sm bg-magenta/30 px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wide text-magenta sm:text-xs">
              Triple Captain
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {primaryDiff && (
            <ImpactPill
              points={primaryDiff.value}
              pointsLabel={primaryDiff.label}
              pointsSubtitle={
                secondaryDiff
                  ? `${formatNet(secondaryDiff.value)} ${secondaryDiff.label}`
                  : undefined
              }
              pointsTitle={
                `${formatNet(differential_vs_template)} vs popular captain` +
                (event.top10k_captain
                  ? ` · ${formatNet(differential_vs_top10k)} vs top 10k captain`
                  : "")
              }
              rankImpact={rankImpact}
              rankTitle={rankTitle}
            />
          )}
        </div>
      </div>

      <div className="flex items-start justify-center gap-2 px-3 py-3 sm:gap-3 sm:py-4 md:gap-4">
        <SlotFrame label="Your pick">
          <CaptainTile player={userPlayer} variant="user" />
        </SlotFrame>
        <SlotFrame label="Average" matched={event.matched_template}>
          {renderReferenceSlot(event.template_captain)}
        </SlotFrame>
        <SlotFrame label="Top 10k" matched={event.matched_top10k}>
          {renderReferenceSlot(event.top10k_captain)}
        </SlotFrame>
      </div>

      <div className="border-t border-accent4/40 px-3 py-2 sm:py-2.5">
        <div className="mb-1 text-[10px] uppercase tracking-wide text-text/50">
          {userPlayer.web_name} breakdown
        </div>
        {captaincyDidntApply && (
          <div className="mb-1 text-[10px] text-text/50">
            Captaincy didn&apos;t apply this GW.
          </div>
        )}
        <ul className="flex flex-col gap-0.5 text-[11px] sm:text-xs">
          {didNotPlay ? (
            <li className="flex items-center justify-between gap-2 text-text/50">
              <span>Did not play</span>
              <span className="font-semibold tabular-nums">0</span>
            </li>
          ) : breakdown.length === 0 ? (
            <li className="flex items-center justify-between gap-2 text-text/50">
              <span>No scoring events</span>
              <span className="font-semibold tabular-nums">0</span>
            </li>
          ) : (
            breakdown.map((line) => {
              const Icon = line.icon;
              return (
                <li key={line.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-text/80">
                    <Icon className={`${line.tone} h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5`} />
                    {line.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatLinePoints(line.points)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
        <div className="mt-1 flex items-center justify-between border-t border-accent4/30 pt-1 text-xs">
          <span className="text-text/70">Total</span>
          <span className="font-semibold tabular-nums">
            <span>{userPlayer.raw_points}</span>
            {showMultiplier && (
              <>
                <span className="px-1 text-text/50">×{multiplier}</span>
                <span>= {userPlayer.effective_points}</span>
              </>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CaptainEventCard;

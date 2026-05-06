import type React from "react";
import clsx from "clsx";
import {
  FaFutbol,
  FaHandshake,
  FaRegHandPaper,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";
import { GiSoccerKick } from "react-icons/gi";
import { TbLockFilled } from "react-icons/tb";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CaptainEvent, CaptainPlayer } from "src/queries/getCaptainImpact";
import { formatRankDelta, rankImpactBadgeClass } from "../TeamImpact/format";
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

const differentialBadgeClass = (n: number): string => {
  if (!Number.isFinite(n) || Math.abs(n) < 0.05) {
    return "bg-accent4/40 text-text/70 ring-text/15";
  }
  return n > 0
    ? "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30"
    : "bg-rose-500/20 text-rose-300 ring-rose-400/30";
};

type LabeledTile = {
  key: string;
  label: string;
  player: CaptainPlayer;
  variant: "user" | "reference";
};

type Slot = { tile: LabeledTile };

const EventChip: React.FC<{
  icon: React.ReactNode;
  value: number;
  tone: string;
  title: string;
}> = ({ icon, value, tone, title }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-accent3/70 px-1.5 py-[2px] text-[11px] ring-1 ring-inset ${tone}`}
      >
        {icon}
        <span className="font-semibold tabular-nums">{value}</span>
      </span>
    </TooltipTrigger>
    <TooltipContent>{title}</TooltipContent>
  </Tooltip>
);

const CaptainBreakdown: React.FC<{ player: CaptainPlayer }> = ({ player }) => {
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const cleanSheets = player.clean_sheets ?? 0;
  const goalsConceded = player.goals_conceded ?? 0;
  const defensiveContribution = player.defensive_contribution ?? 0;
  const saves = player.saves ?? 0;
  const bonus = player.bonus ?? 0;
  const minutes = player.minutes ?? 0;
  const defconThreshold = player.element_type === 2 ? 10 : 12;
  const showDefcon =
    player.element_type !== 1 && defensiveContribution >= defconThreshold;

  const chips = [
    goals > 0 && {
      key: "g",
      node: (
        <EventChip
          icon={<FaFutbol />}
          value={goals}
          tone="text-emerald-400 ring-emerald-400/40"
          title={`${goals} goal${goals === 1 ? "" : "s"}`}
        />
      ),
    },
    assists > 0 && {
      key: "a",
      node: (
        <EventChip
          icon={<FaHandshake />}
          value={assists}
          tone="text-cyan-300 ring-cyan-300/40"
          title={`${assists} assist${assists === 1 ? "" : "s"}`}
        />
      ),
    },
    cleanSheets > 0 && {
      key: "cs",
      node: (
        <EventChip
          icon={<TbLockFilled />}
          value={cleanSheets}
          tone="text-emerald-400 ring-emerald-400/40"
          title="Clean sheet"
        />
      ),
    },
    showDefcon && {
      key: "def",
      node: (
        <EventChip
          icon={<FaShieldAlt />}
          value={defensiveContribution}
          tone="text-emerald-400 ring-emerald-400/40"
          title="Defensive contributions"
        />
      ),
    },
    saves >= 3 && {
      key: "sv",
      node: (
        <EventChip
          icon={<FaRegHandPaper />}
          value={saves}
          tone="text-emerald-400 ring-emerald-400/40"
          title="Saves"
        />
      ),
    },
    (player.element_type === 1 || player.element_type === 2) &&
      goalsConceded >= 2 && {
        key: "gc",
        node: (
          <EventChip
            icon={<GiSoccerKick />}
            value={goalsConceded}
            tone="text-rose-400 ring-rose-400/40"
            title="Goals conceded"
          />
        ),
      },
    bonus > 0 && {
      key: "b",
      node: (
        <EventChip
          icon={<FaStar />}
          value={bonus}
          tone="text-amber-400 ring-amber-400/40"
          title="Bonus points"
        />
      ),
    },
  ].filter(Boolean) as Array<{ key: string; node: React.ReactNode }>;

  return (
    <div className="mt-2 flex min-h-6 flex-col items-center gap-1 text-center">
      <div className="flex flex-wrap justify-center gap-1">
        {chips.length > 0 ? (
          chips.map((chip) => <span key={chip.key}>{chip.node}</span>)
        ) : (
          <span className="text-[10px] text-text/40">
            {minutes > 0 ? "No scoring events" : "DNP"}
          </span>
        )}
      </div>
    </div>
  );
};

const slotsFor = (event: CaptainEvent): Slot[] => {
  const slots: Slot[] = [
    {
      tile: {
        key: "user",
        label: "Your pick",
        player: event.user_captain,
        variant: "user",
      },
    },
  ];

  if (event.top10k_captain) {
    slots.push({
      tile: {
        key: "top10k",
        label: "Top 10k",
        player: event.top10k_captain,
        variant: "reference",
      },
    });
  }

  if (event.template_captain) {
    slots.push({
      tile: {
        key: "template",
        label: "Average",
        player: event.template_captain,
        variant: "reference",
      },
    });
  }

  return slots;
};

const captainBonusExposure = (player: CaptainPlayer): number =>
  (player.captain_rate ?? 0) + 2 * (player.triple_captain_rate ?? 0);

const CaptainEventCard: React.FC<Props> = ({ event, rankPerPoint }) => {
  const { gw, differential_vs_top10k, differential_vs_template } = event;
  const slots = slotsFor(event);
  const headlineDiff = event.template_captain
    ? {
        label: "vs popular",
        value: differential_vs_template,
      }
    : event.top10k_captain
      ? {
          label: "vs top 10k",
          value: differential_vs_top10k,
        }
      : null;
  const rankImpact =
    event.rank_impact ??
    (event.captaincy_excess != null && rankPerPoint != null
      ? event.captaincy_excess * rankPerPoint
      : null);
  const showRank = rankImpact != null;
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
          {headlineDiff && (
            <span
              className={clsx(
                "rounded-full px-2.5 py-1 text-xs font-semibold ring-1 sm:text-sm md:text-base",
                differentialBadgeClass(headlineDiff.value),
              )}
              title={`${formatNet(differential_vs_template)} vs popular captain${
                event.top10k_captain
                  ? `; ${formatNet(differential_vs_top10k)} vs top 10k captain`
                  : ""
              }`}
            >
              {formatNet(headlineDiff.value)} {headlineDiff.label}
            </span>
          )}
          {showRank ? (
            <span
              className={clsx(
                "rounded-full border px-2.5 py-1 text-xs font-semibold sm:text-sm md:text-base",
                rankImpactBadgeClass(rankImpact),
              )}
              title={rankTitle}
            >
              rank {formatRankDelta(rankImpact)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-3 px-3 py-3 sm:gap-5 sm:py-4">
        {slots.map((slot) => (
          <div
            key={slot.tile.key}
            className="flex w-24 flex-col items-center gap-1 sm:w-28 md:w-32"
          >
            <span className="text-center text-[9px] uppercase tracking-wide text-text/60 sm:text-[10px]">
              {slot.tile.label}
            </span>
            <CaptainTile player={slot.tile.player} variant={slot.tile.variant} />
            <CaptainBreakdown player={slot.tile.player} />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CaptainEventCard;

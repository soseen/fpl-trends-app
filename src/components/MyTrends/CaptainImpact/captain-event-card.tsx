import type React from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/card";
import type { CaptainEvent, CaptainPlayer } from "src/queries/getCaptainImpact";
import { formatRankDelta, rankImpactPillClass } from "../TeamImpact/format";
import CaptainTile from "./captain-tile";

type Props = {
  event: CaptainEvent;
};

const formatNet = (n: number): string => {
  if (n === 0) return "0 pts";
  return `${n > 0 ? "+" : ""}${n} pts`;
};

const netPillClass = (n: number): string => {
  if (n > 0) return "bg-emerald-500/20 text-emerald-300";
  if (n < 0) return "bg-rose-500/20 text-rose-300";
  return "bg-accent4/40 text-text/70";
};

type LabeledTile = {
  key: string;
  label: string;
  player: CaptainPlayer;
  variant: "user" | "reference";
};

type Slot =
  | { kind: "tile"; tile: LabeledTile }
  | { kind: "missing"; key: string; label: string };

// Always show three slots: user's pick, top-10k consensus, and
// most-captained. When the underlying aggregation has no data for the
// GW (older GWs without manager_picks coverage), we render a "no data"
// placeholder so the column structure stays consistent and the user
// knows it's a data gap, not a bug.
const slotsFor = (event: CaptainEvent): Slot[] => {
  const slots: Slot[] = [
    {
      kind: "tile",
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
      kind: "tile",
      tile: {
        key: "top10k",
        label: "Top 10k",
        player: event.top10k_captain,
        variant: "reference",
      },
    });
  } else {
    slots.push({ kind: "missing", key: "top10k", label: "Top 10k" });
  }
  if (event.template_captain) {
    slots.push({
      kind: "tile",
      tile: {
        key: "template",
        label: "Average",
        player: event.template_captain,
        variant: "reference",
      },
    });
  } else {
    slots.push({
      kind: "missing",
      key: "template",
      label: "Average",
    });
  }
  return slots;
};

// One row per GW. Header carries GW number plus a status badge
// (matched-top10k / matched-template / differential) and a pill
// summarising the user's diff vs top10k. Body shows up to 3 captain
// tiles labeled "Your pick" / "Top 10k" / "Most captained" — the
// reference tiles are faded so the eye reads "this is what others did".
const CaptainEventCard: React.FC<Props> = ({ event }) => {
  const { gw, differential_vs_top10k, differential_vs_template } = event;

  const slots = slotsFor(event);
  // Headline = differential vs the most-captained (template). The
  // diff vs top 10k stays in the section summary and tooltip.
  const headlineDiff = differential_vs_template;
  const showRank = event.rank_impact != null;
  const isTripleCaptain = event.user_captain.multiplier === 3;

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
        <span
          className={clsx(
            "rounded-md px-2 py-0.5 text-xs font-semibold sm:text-sm md:text-base",
            showRank
              ? rankImpactPillClass(event.rank_impact)
              : netPillClass(headlineDiff),
          )}
          title={
            showRank
              ? `${formatNet(headlineDiff)} vs average captain · ${formatNet(
                  differential_vs_top10k,
                )} vs top 10k`
              : `Differential vs top 10k: ${formatNet(differential_vs_top10k)}`
          }
        >
          {showRank ? formatRankDelta(event.rank_impact) : formatNet(headlineDiff)}
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-3 px-3 py-3 sm:gap-5 sm:py-4">
        {slots.map((slot) =>
          slot.kind === "tile" ? (
            // Fixed column width matching the tile so the labels can't
            // stretch one column wider than the others. Labels wrap to
            // a second line if needed; tiles stay perfectly aligned.
            <div
              key={slot.tile.key}
              className="flex w-12 flex-col items-center gap-1 sm:w-16 md:w-20"
            >
              <span className="text-center text-[9px] uppercase tracking-wide text-text/60 sm:text-[10px]">
                {slot.tile.label}
              </span>
              <CaptainTile player={slot.tile.player} variant={slot.tile.variant} />
            </div>
          ) : (
            <div
              key={slot.key}
              className="flex w-12 flex-col items-center gap-1 sm:w-16 md:w-20"
              title="Aggregated picks data not yet populated for this GW"
            >
              <span className="text-center text-[9px] uppercase tracking-wide text-text/60 sm:text-[10px]">
                {slot.label}
              </span>
              <div className="flex h-[80px] w-12 items-center justify-center rounded-md border border-dashed border-accent4/60 bg-secondary/30 px-1 text-center text-[8px] leading-tight text-text/40 sm:h-[100px] sm:w-16 sm:text-[9px] md:h-[120px] md:w-20 md:text-[10px]">
                no data
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  );
};

export default CaptainEventCard;

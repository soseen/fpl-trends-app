import type { FC } from "react";
import type { TeamImpact } from "src/queries/getTeamImpact";

type Props = {
  notes: TeamImpact["notes"];
};

const capturedTime = (value: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const RankCurveNote: FC<Props> = ({ notes }) => {
  const time = capturedTime(notes.rank_curve_captured_at);

  if (notes.rank_curve_status === "unavailable") {
    return (
      <p>
        The live rank-impact curve is warming up. Player points and EO are available;
        rank-place estimates will appear after the next standings sample.
      </p>
    );
  }
  if (notes.rank_curve_status === "provisional") {
    return (
      <p>
        Rank impact is temporarily based on a recent live manager sample while the
        standings curve warms up. It may move as the sample grows.
      </p>
    );
  }
  if (notes.rank_curve_status === "stale") {
    return (
      <p>
        The latest live standings curve is older than 45 minutes. Rank estimates may lag
        until the next refresh.
      </p>
    );
  }
  if (notes.rank_curve_status === "refreshing") {
    return (
      <p>
        Final standings are refreshing; rank estimates use the latest live snapshot
        {time ? ` from ${time}` : ""}.
      </p>
    );
  }
  if (notes.rank_curve_status === "live" && time) {
    return <p>Rank impact uses the live Overall standings captured at {time}.</p>;
  }
  return null;
};

const TeamImpactNotes: FC<Props> = ({ notes }) => {
  const eoGws = notes.small_sample_gws.join(", ");
  const hasNotes =
    notes.rank_curve_status !== "final" || notes.fallback_used || notes.incomplete_picks;
  if (!hasNotes) return null;

  return (
    <div className="rounded-md border border-accent4 bg-primary px-3 py-2 text-[11px] text-text/60 sm:text-xs">
      <RankCurveNote notes={notes} />
      {notes.fallback_used && (
        <p>
          {eoGws ? `EO sample is light for GW ${eoGws}. ` : ""}
          Official ownership and sampled captaincy are used as the live EO fallback for
          affected rows.
        </p>
      )}
      {notes.incomplete_picks && (
        <p>Some gameweeks couldn&apos;t be loaded from FPL, so totals may be partial.</p>
      )}
    </div>
  );
};

export default TeamImpactNotes;

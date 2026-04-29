import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CaptainSummary,
  ChipUsageStat,
  ComparisonStat,
  ManagerComparison,
} from "src/queries/getManagerComparison";

type Direction = "high-good" | "low-good" | "neutral";

type NumericRow = {
  kind: "numeric";
  label: string;
  stat: ComparisonStat;
  direction: Direction;
  approximate?: boolean;
};

type ChipRow = {
  kind: "chip";
  label: string;
  stat: ChipUsageStat;
};

type TextRow = {
  kind: "text";
  label: string;
  user: string | null;
  average: string | null;
  top10k: string | null;
  top100k: string | null;
};

type Row = NumericRow | ChipRow | TextRow;

type Props = {
  data: ManagerComparison;
};

const formatNumber = (n: number, decimals = 0): string =>
  n.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

// Each chip type has two copies per season — one usable in the first half
// (GW1–19), one in the second half (GW20–38). The backend reports each
// half's usage as a fraction (0..1) of sampled managers who played that
// copy, so a single half's rate translates directly to a 0–100% bar
// without any per-range normalization.
const rateToPct = (rate: number | null): number | null => {
  if (rate === null) return null;
  return Math.max(0, Math.min(100, Math.round(rate * 100)));
};

const captainNameOrDash = (
  s: CaptainSummary,
  side: "user" | "average" | "top10k" | "top100k",
): string => {
  if (side === "user") return s.user_player_name ?? "—";
  if (side === "average") return s.average_player_name ?? "—";
  if (side === "top10k") return s.top10k_player_name ?? "—";
  return s.top100k_player_name ?? "—";
};

const buildRows = (data: ManagerComparison): Row[] => [
  {
    kind: "numeric",
    label: "Total points",
    stat: data.total_points,
    direction: "high-good",
  },
  {
    kind: "numeric",
    label: "Avg GW score",
    stat: data.avg_gw_score,
    direction: "high-good",
  },
  {
    kind: "numeric",
    label: "Captain bonus",
    stat: data.captain_bonus,
    direction: "high-good",
    approximate: data.notes.captain_average_partial,
  },
  {
    kind: "text",
    label: "Most captained",
    user: captainNameOrDash(data.most_captained, "user"),
    average: captainNameOrDash(data.most_captained, "average"),
    top10k: captainNameOrDash(data.most_captained, "top10k"),
    top100k: captainNameOrDash(data.most_captained, "top100k"),
  },
  {
    kind: "numeric",
    label: "Transfers made",
    stat: data.transfers,
    direction: "neutral",
  },
  { kind: "chip", label: "Wildcards", stat: data.wildcards },
  { kind: "chip", label: "Free hits", stat: data.free_hits },
  { kind: "chip", label: "Bench boosts", stat: data.bench_boosts },
  {
    kind: "numeric",
    label: "Hits taken",
    stat: data.hits,
    direction: "low-good",
    approximate: data.notes.hits_average_partial,
  },
  {
    kind: "numeric",
    label: "Points benched",
    stat: data.bench_points,
    direction: "low-good",
    approximate: data.notes.bench_average_partial,
  },
];

const diffColor = (
  user: number,
  comparator: number | null,
  direction: Direction,
): string => {
  if (comparator === null || direction === "neutral") return "text-text";
  if (user === comparator) return "text-text";
  const userIsBetter = direction === "high-good" ? user > comparator : user < comparator;
  return userIsBetter ? "text-emerald-400" : "text-rose-400";
};

const formatComparator = (
  value: number | null,
  decimals: number,
  approximate: boolean,
): string => {
  if (value === null) return "—";
  const prefix = approximate ? "≈ " : "";
  return `${prefix}${formatNumber(value, decimals)}`;
};

// Single magenta progress bar with 4 tick-mark breakpoints at 20/40/60/80%.
// Ticks sit on top of both the fill and the empty track at half the bar's
// height so they remain visible on either side, giving the bar a
// "ruler-like" feel without clutter.
//
// `copyLabel` ("1st" / "2nd") shows up to the left of the bar when both
// halves are rendered, so the user can tell which copy of the chip the
// rate refers to. Empty when only one half is active for the range.
const TICK_POSITIONS = [20, 40, 60, 80] as const;

const ChipBarSegment: React.FC<{
  pct: number;
  tooltip: string;
  copyLabel?: string;
}> = ({ pct, tooltip, copyLabel }) => (
  <div className="flex items-center gap-1.5" title={tooltip}>
    {copyLabel && (
      <span className="text-text/60 w-5 shrink-0 text-right text-[9px] font-semibold sm:text-[10px]">
        {copyLabel}
      </span>
    )}
    <div className="border-accent4/60 relative h-4 w-full max-w-[58px] overflow-hidden rounded-sm border bg-accent3 sm:max-w-[90px]">
      <div
        className="absolute inset-y-0 left-0 bg-magenta transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
      {TICK_POSITIONS.map((t) => (
        <div
          key={t}
          className="bg-text/40 absolute top-1/2 h-1.5 w-px -translate-y-1/2"
          style={{ left: `${t}%` }}
          aria-hidden
        />
      ))}
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-text sm:text-xs">
        {pct}%
      </span>
    </div>
  </div>
);

// Renders the chip-usage cell. Two bars stacked vertically when the range
// spans the GW20 reset (top bar = first-half copy, bottom bar = second-half
// copy); otherwise a single bar for whichever half is active.
const ChipCell: React.FC<{
  label: string;
  h1Rate: number | null;
  h2Rate: number | null;
}> = ({ label, h1Rate, h2Rate }) => {
  const h1Pct = rateToPct(h1Rate);
  const h2Pct = rateToPct(h2Rate);

  if (h1Pct === null && h2Pct === null) {
    return <div className="text-text/60 text-right">—</div>;
  }

  const showBoth = h1Pct !== null && h2Pct !== null;

  if (!showBoth) {
    const onlyPct = h1Pct ?? h2Pct ?? 0;
    const half = h1Pct !== null ? "GW 1–19" : "GW 20–38";
    return (
      <div className="ml-auto flex items-center justify-end">
        <ChipBarSegment
          pct={onlyPct}
          tooltip={`${label} ${half}: ${onlyPct}% of sampled managers used this chip`}
        />
      </div>
    );
  }

  return (
    <div className="ml-auto flex flex-col items-end gap-1">
      <ChipBarSegment
        pct={h1Pct}
        copyLabel="1st"
        tooltip={`${label} (1st copy, GW 1–19): ${h1Pct}% of sampled managers`}
      />
      <ChipBarSegment
        pct={h2Pct}
        copyLabel="2nd"
        tooltip={`${label} (2nd copy, GW 20–38): ${h2Pct}% of sampled managers`}
      />
    </div>
  );
};

const ManagerComparisonTable: React.FC<Props> = ({ data }) => {
  const rows = buildRows(data);

  return (
    <Table className="text-[11px] sm:text-xs md:text-sm">
      <TableHeader>
        <TableRow className="border-b border-accent4 hover:bg-transparent">
          <TableHead className="text-text/70 h-8 px-1.5 sm:px-2">Stat</TableHead>
          <TableHead className="text-text/70 h-8 px-1.5 text-right sm:px-2">
            You
          </TableHead>
          <TableHead className="text-text/70 h-8 px-1.5 text-right sm:px-2">
            <span className="sm:hidden">Avg</span>
            <span className="hidden sm:inline">Average</span>
          </TableHead>
          <TableHead className="text-text/70 h-8 px-1.5 text-right sm:px-2">
            <span className="sm:hidden">T100k</span>
            <span className="hidden sm:inline">Top 100k</span>
          </TableHead>
          <TableHead className="text-text/70 h-8 px-1.5 text-right sm:px-2">
            <span className="sm:hidden">T10k</span>
            <span className="hidden sm:inline">Top 10k</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          if (row.kind === "text") {
            return (
              <TableRow
                key={row.label}
                className="border-accent4/40 border-b border-accent4 hover:bg-transparent"
              >
                <TableCell className="text-text/80 px-1.5 py-2 sm:px-2">
                  {row.label}
                </TableCell>
                <TableCell className="px-1.5 py-2 text-right font-semibold text-text sm:px-2">
                  {row.user ?? "—"}
                </TableCell>
                <TableCell className="text-text/80 px-1.5 py-2 text-right sm:px-2">
                  {row.average ?? "—"}
                </TableCell>
                <TableCell className="text-text/80 px-1.5 py-2 text-right sm:px-2">
                  {row.top100k ?? "—"}
                </TableCell>
                <TableCell className="text-text/80 px-1.5 py-2 text-right sm:px-2">
                  {row.top10k ?? "—"}
                </TableCell>
              </TableRow>
            );
          }

          if (row.kind === "chip") {
            return (
              <TableRow
                key={row.label}
                className="border-accent4/40 border-b border-accent4 hover:bg-transparent"
              >
                <TableCell className="text-text/80 px-1.5 py-2 sm:px-2">
                  {row.label}
                </TableCell>
                <TableCell className="px-1.5 py-2 text-right font-semibold text-text sm:px-2">
                  {row.stat.user}
                </TableCell>
                <TableCell className="px-1.5 py-2 sm:px-2">
                  <ChipCell
                    label={row.label}
                    h1Rate={row.stat.h1?.average ?? null}
                    h2Rate={row.stat.h2?.average ?? null}
                  />
                </TableCell>
                <TableCell className="px-1.5 py-2 sm:px-2">
                  <ChipCell
                    label={row.label}
                    h1Rate={row.stat.h1?.top100k_average ?? null}
                    h2Rate={row.stat.h2?.top100k_average ?? null}
                  />
                </TableCell>
                <TableCell className="px-1.5 py-2 sm:px-2">
                  <ChipCell
                    label={row.label}
                    h1Rate={row.stat.h1?.top10k_average ?? null}
                    h2Rate={row.stat.h2?.top10k_average ?? null}
                  />
                </TableCell>
              </TableRow>
            );
          }

          // numeric row
          const decimals = row.stat.user < 10 ? 1 : 0;

          return (
            <TableRow
              key={row.label}
              className="border-accent4/40 border-b border-accent4 hover:bg-transparent"
            >
              <TableCell className="text-text/80 px-1.5 py-2 sm:px-2">
                {row.label}
              </TableCell>
              <TableCell
                className={`px-1.5 py-2 text-right font-semibold sm:px-2 ${diffColor(
                  row.stat.user,
                  row.stat.average,
                  row.direction,
                )}`}
              >
                {formatNumber(row.stat.user, decimals)}
              </TableCell>
              <TableCell className="text-text/80 px-1.5 py-2 text-right sm:px-2">
                {formatComparator(
                  row.stat.average,
                  row.stat.average !== null && row.stat.average < 10 ? 1 : 0,
                  row.approximate ?? false,
                )}
              </TableCell>
              <TableCell className="text-text/80 px-1.5 py-2 text-right sm:px-2">
                {formatComparator(
                  row.stat.top100k_average,
                  row.stat.top100k_average !== null && row.stat.top100k_average < 10
                    ? 1
                    : 0,
                  false,
                )}
              </TableCell>
              <TableCell className="text-text/80 px-1.5 py-2 text-right sm:px-2">
                {formatComparator(
                  row.stat.top10k_average,
                  row.stat.top10k_average !== null && row.stat.top10k_average < 10
                    ? 1
                    : 0,
                  false,
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ManagerComparisonTable;

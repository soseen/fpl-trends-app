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
  stat: ComparisonStat;
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

// Each chip type comes with two copies per season — one in the first half
// (GW1–19), one after the mid-season reset (GW20–38). For ranges that span
// the reset, the per-manager max is 2; otherwise 1. Bars are normalized
// against this max so 100% always means "every sampled manager used every
// available copy in this range" regardless of which half is being viewed.
const maxChipsForRange = (startGw: number, endGw: number): 1 | 2 =>
  startGw <= 19 && endGw >= 20 ? 2 : 1;

// Convert backend chip rate (raw plays / managers) to a [0..100] bar
// percentage normalized by the per-manager max for the current range.
const chipRateToPct = (
  rate: number | null,
  startGw: number,
  endGw: number,
): number | null => {
  if (rate === null) return null;
  const max = maxChipsForRange(startGw, endGw);
  return Math.max(0, Math.min(100, Math.round((rate / max) * 100)));
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

// Inline magenta progress bar for chip-usage rates. Renders the percentage
// label centered on top of the bar so the cell stays compact even on
// narrow phone screens.
const ChipBar: React.FC<{ pct: number | null; label?: string }> = ({ pct, label }) => {
  if (pct === null) {
    return <span className="text-text/60">—</span>;
  }
  const display = label ?? `${pct}%`;
  return (
    <div className="ml-auto flex items-center justify-end">
      <div
        className="bg-accent4/40 relative h-4 w-full max-w-[58px] overflow-hidden rounded-sm sm:max-w-[90px]"
        title={`${pct}% of available chip usage in this range`}
      >
        <div
          className="absolute inset-y-0 left-0 bg-magenta transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-text sm:text-xs">
          {display}
        </span>
      </div>
    </div>
  );
};

const ManagerComparisonTable: React.FC<Props> = ({ data }) => {
  const rows = buildRows(data);
  const startGw = data.start_gw;
  const endGw = data.end_gw;

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
                  <ChipBar pct={chipRateToPct(row.stat.average, startGw, endGw)} />
                </TableCell>
                <TableCell className="px-1.5 py-2 sm:px-2">
                  <ChipBar
                    pct={chipRateToPct(row.stat.top100k_average, startGw, endGw)}
                  />
                </TableCell>
                <TableCell className="px-1.5 py-2 sm:px-2">
                  <ChipBar pct={chipRateToPct(row.stat.top10k_average, startGw, endGw)} />
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

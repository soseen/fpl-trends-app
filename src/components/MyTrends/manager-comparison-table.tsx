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
import { useDimensions } from "src/hooks/use-dimensions";

type Direction = "high-good" | "low-good" | "neutral";

type NumericRow = {
  kind: "numeric" | "chip";
  label: string;
  stat: ComparisonStat;
  direction: Direction;
  approximate?: boolean;
};

type TextRow = {
  kind: "text";
  label: string;
  user: string | null;
  average: string | null;
  top10k: string | null;
};

type Row = NumericRow | TextRow;

type Props = {
  data: ManagerComparison;
};

const formatNumber = (n: number, decimals = 0): string =>
  n.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const formatChipUsage = (user: number): string => (user >= 1 ? "Used" : "Not used");

const formatChipAverage = (avg: number | null): string => {
  if (avg === null) return "—";
  const pct = avg * 100;
  if (pct < 1 && pct > 0) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
};

const captainNameOrDash = (
  s: CaptainSummary,
  side: "user" | "average" | "top10k",
): string => {
  if (side === "user") return s.user_player_name ?? "—";
  if (side === "average") return s.average_player_name ?? "—";
  return s.top10k_player_name ?? "—";
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
  },
  {
    kind: "numeric",
    label: "Transfers made",
    stat: data.transfers,
    direction: "neutral",
  },
  {
    kind: "numeric",
    label: "Wildcards",
    stat: data.wildcards,
    direction: "neutral",
  },
  {
    kind: "numeric",
    label: "Free hits",
    stat: data.free_hits,
    direction: "neutral",
  },
  {
    kind: "numeric",
    label: "Bench boosts",
    stat: data.bench_boosts,
    direction: "neutral",
  },
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

const formatDiff = (
  user: number,
  comparator: number | null,
  kind: "numeric" | "chip",
): string => {
  if (comparator === null || kind === "chip") return "—";
  const diff = user - comparator;
  const rounded = Math.abs(diff) < 1 ? diff.toFixed(1) : Math.round(diff);
  const num = Number(rounded);
  if (num === 0) return "0";
  return num > 0 ? `+${rounded}` : `${rounded}`;
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

const ManagerComparisonTable: React.FC<Props> = ({ data }) => {
  const { isSM } = useDimensions();
  const rows = buildRows(data);

  return (
    <Table className="text-xs md:text-sm">
      <TableHeader>
        <TableRow className="border-b border-accent4 hover:bg-transparent">
          <TableHead className="text-text/70 h-8 px-2">Stat</TableHead>
          <TableHead className="text-text/70 h-8 px-2 text-right">You</TableHead>
          {!isSM && (
            <TableHead className="text-text/70 h-8 px-2 text-right">Average</TableHead>
          )}
          <TableHead className="text-text/70 h-8 px-2 text-right">Top 10k</TableHead>
          {!isSM && (
            <TableHead className="text-text/70 h-8 px-2 text-right">Diff</TableHead>
          )}
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
                <TableCell className="text-text/80 px-2 py-2">{row.label}</TableCell>
                <TableCell className="px-2 py-2 text-right font-semibold text-text">
                  {row.user ?? "—"}
                </TableCell>
                {!isSM && (
                  <TableCell className="text-text/80 px-2 py-2 text-right">
                    {row.average ?? "—"}
                  </TableCell>
                )}
                <TableCell className="text-text/80 px-2 py-2 text-right">
                  {row.top10k ?? "—"}
                </TableCell>
                {!isSM && (
                  <TableCell className="px-2 py-2 text-right text-text">—</TableCell>
                )}
              </TableRow>
            );
          }

          // numeric / chip row
          // Diff column compares user to the AVERAGE (overall sample); the
          // colour on "You" mirrors that comparison so mobile readers can
          // still tell whether they're above or below the field.
          const userAvgColor =
            row.stat.average === null || row.kind === "chip"
              ? "text-text"
              : diffColor(row.stat.user, row.stat.average, row.direction);
          const decimals = row.kind === "chip" ? 0 : row.stat.user < 10 ? 1 : 0;

          return (
            <TableRow
              key={row.label}
              className="border-accent4/40 border-b border-accent4 hover:bg-transparent"
            >
              <TableCell className="text-text/80 px-2 py-2">{row.label}</TableCell>
              <TableCell
                className={`px-2 py-2 text-right font-semibold ${
                  isSM ? userAvgColor : "text-text"
                }`}
              >
                {row.kind === "chip"
                  ? formatChipUsage(row.stat.user)
                  : formatNumber(row.stat.user, decimals)}
              </TableCell>
              {!isSM && (
                <TableCell className="text-text/80 px-2 py-2 text-right">
                  {row.kind === "chip"
                    ? formatChipAverage(row.stat.average)
                    : formatComparator(
                        row.stat.average,
                        row.stat.average !== null && row.stat.average < 10 ? 1 : 0,
                        row.approximate ?? false,
                      )}
                </TableCell>
              )}
              <TableCell className="text-text/80 px-2 py-2 text-right">
                {row.kind === "chip"
                  ? formatChipAverage(row.stat.top10k_average)
                  : formatComparator(
                      row.stat.top10k_average,
                      row.stat.top10k_average !== null && row.stat.top10k_average < 10
                        ? 1
                        : 0,
                      false,
                    )}
              </TableCell>
              {!isSM && (
                <TableCell className={`px-2 py-2 text-right font-medium ${userAvgColor}`}>
                  {formatDiff(row.stat.user, row.stat.average, row.kind)}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ManagerComparisonTable;

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComparisonStat, ManagerComparison } from "src/queries/getManagerComparison";
import { useDimensions } from "src/hooks/use-dimensions";

type Direction = "high-good" | "low-good" | "neutral";

type Row = {
  label: string;
  stat: ComparisonStat;
  direction: Direction;
  // "numeric" = format both sides as numbers; "chip" = user shows Used/Not used,
  // average shows percentage
  kind: "numeric" | "chip";
  approximate?: boolean;
};

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

const buildRows = (data: ManagerComparison): Row[] => [
  {
    label: "Total points",
    stat: data.total_points,
    direction: "high-good",
    kind: "numeric",
  },
  {
    label: "Transfers made",
    stat: data.transfers,
    direction: "neutral",
    kind: "numeric",
  },
  {
    label: "Wildcards",
    stat: data.wildcards,
    direction: "neutral",
    kind: "chip",
  },
  {
    label: "Free hits",
    stat: data.free_hits,
    direction: "neutral",
    kind: "chip",
  },
  {
    label: "Bench boosts",
    stat: data.bench_boosts,
    direction: "neutral",
    kind: "chip",
  },
  {
    label: "Hits taken",
    stat: data.hits,
    direction: "low-good",
    kind: "numeric",
    approximate: data.notes.hits_average_partial,
  },
  {
    label: "Points benched",
    stat: data.bench_points,
    direction: "low-good",
    kind: "numeric",
    approximate: data.notes.bench_average_partial,
  },
];

const diffColor = (user: number, average: number, direction: Direction): string => {
  if (direction === "neutral") return "text-text";
  if (user === average) return "text-text";
  const userIsBetter = direction === "high-good" ? user > average : user < average;
  return userIsBetter ? "text-emerald-400" : "text-rose-400";
};

const formatDiff = (
  user: number,
  average: number | null,
  kind: "numeric" | "chip",
): string => {
  if (average === null || kind === "chip") return "—";
  const diff = user - average;
  const rounded = Math.abs(diff) < 1 ? diff.toFixed(1) : Math.round(diff);
  const num = Number(rounded);
  if (num === 0) return "0";
  return num > 0 ? `+${rounded}` : `${rounded}`;
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
          <TableHead className="text-text/70 h-8 px-2 text-right">Average</TableHead>
          {!isSM && (
            <TableHead className="text-text/70 h-8 px-2 text-right">Diff</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const userColor =
            row.stat.average === null || row.kind === "chip"
              ? "text-text"
              : diffColor(row.stat.user, row.stat.average, row.direction);
          return (
            <TableRow
              key={row.label}
              className="border-accent4/40 border-b border-accent4 hover:bg-transparent"
            >
              <TableCell className="text-text/80 px-2 py-2">{row.label}</TableCell>
              <TableCell
                className={`px-2 py-2 text-right font-semibold ${
                  isSM ? userColor : "text-text"
                }`}
              >
                {row.kind === "chip"
                  ? formatChipUsage(row.stat.user)
                  : formatNumber(row.stat.user)}
              </TableCell>
              <TableCell className="text-text/80 px-2 py-2 text-right">
                {row.kind === "chip"
                  ? formatChipAverage(row.stat.average)
                  : row.stat.average === null
                    ? "—"
                    : `${row.approximate ? "≈ " : ""}${formatNumber(
                        row.stat.average,
                        row.stat.average < 10 ? 1 : 0,
                      )}`}
              </TableCell>
              {!isSM && (
                <TableCell className={`px-2 py-2 text-right font-medium ${userColor}`}>
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

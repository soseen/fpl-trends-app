import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ManagerTrajectory } from "src/queries/getManagerTrajectory";
import { useDimensions } from "src/hooks/use-dimensions";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";

type Props = {
  data: ManagerTrajectory;
  startGw: number;
  endGw: number;
};

const formatRank = (n: number): string => n.toLocaleString("en-GB");

const compactRank = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)}k`
      : `${n}`;

type TooltipPayload = {
  value: number;
  payload: {
    gw: number;
    overall_rank: number;
    gw_rank: number;
    points: number;
  };
};

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <div className="rounded-md border border-secondary bg-primary px-3 py-2 text-xs text-text shadow-md">
      <div className="mb-1 font-semibold">GW {p.gw}</div>
      <div>Points: {p.points}</div>
      <div>GW rank: {formatRank(p.gw_rank)}</div>
      <div>Overall: {formatRank(p.overall_rank)}</div>
    </div>
  );
};

const RankTrajectoryChart: React.FC<Props> = ({ data, startGw, endGw }) => {
  const points = data.gws;
  const { isSM } = useDimensions();
  const { totalPlayers } = useSelector((state: RootState) => state.totalPlayers);
  if (points.length === 0) return null;

  // Anchor Y axis between the user's best rank (with a small log-space
  // buffer above so the line doesn't kiss the top edge) and the full FPL
  // field size below — gives "where am I in the field" context without the
  // empty headroom that domain=[1, totalPlayers] would add.
  const minRank = Math.min(
    ...points.flatMap((p) => [p.gw_rank, p.overall_rank]),
  );
  const yTop = Math.max(1, Math.floor(minRank * 0.7));
  const yBottom = totalPlayers > 0 ? totalPlayers : Math.max(...points.map((p) => p.gw_rank));

  // Match the colour logic of RangeRankCard: compare overall rank entering
  // the range vs overall rank leaving it. emerald = improved, rose = worse,
  // cyan (existing chart-3) = neutral or no "before" reference.
  const before =
    startGw > 1
      ? (points.find((p) => p.gw === startGw - 1)?.overall_rank ?? null)
      : null;
  const after = points.find((p) => p.gw === endGw)?.overall_rank ?? null;
  let highlightColor = "var(--chart-3)";
  if (before !== null && after !== null) {
    if (after < before) highlightColor = "#34d399";
    else if (after > before) highlightColor = "#fb7185";
  }

  return (
    <div className="h-72 w-full sm:h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={points}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--accent-4)" opacity={0.4} />
          <XAxis
            dataKey="gw"
            tickFormatter={(v: number) => `${v}`}
            tick={{ fill: "var(--text)", fontSize: isSM ? 10 : 11, opacity: 0.7 }}
            stroke="var(--accent-4)"
            tickLine={false}
            interval={isSM ? 3 : "preserveStartEnd"}
            minTickGap={isSM ? 8 : 4}
          />
          <YAxis
            reversed
            scale="log"
            domain={[yTop, yBottom]}
            allowDataOverflow={false}
            tickFormatter={compactRank}
            tick={{ fill: "var(--text)", fontSize: isSM ? 10 : 11, opacity: 0.7 }}
            stroke="var(--accent-4)"
            width={isSM ? 36 : 48}
            tickLine={false}
            tickCount={isSM ? 4 : 6}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: highlightColor, strokeOpacity: 0.4 }}
          />
          <ReferenceArea
            x1={startGw}
            x2={endGw}
            fill={highlightColor}
            fillOpacity={0.18}
            stroke={highlightColor}
            strokeOpacity={0.6}
            strokeDasharray="3 3"
            ifOverflow="extendDomain"
          />
          <Area
            type="monotone"
            dataKey="gw_rank"
            stroke="var(--chart-1)"
            strokeWidth={isSM ? 1.5 : 2}
            fill="url(#rankFill)"
            baseValue="dataMax"
            isAnimationActive={false}
            dot={
              isSM
                ? false
                : { r: 2.5, fill: "var(--chart-1)", stroke: "var(--chart-1)" }
            }
            activeDot={{ r: 4.5, fill: highlightColor, stroke: "var(--text)" }}
          />
          <Line
            type="monotone"
            dataKey="overall_rank"
            stroke="#fbbf24"
            strokeWidth={2.5}
            strokeDasharray="4 3"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 4, fill: "#fbbf24", stroke: "var(--text)" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RankTrajectoryChart;

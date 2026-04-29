import { useState } from "react";
import {
  Area,
  Bar,
  Cell,
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
import { Toggle } from "@/components/ui/toggle";

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
    event_transfers: number;
    event_transfers_cost: number;
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
  // event_transfers_cost is -4 per paid transfer, stored as a positive
  // number (4/8/12). Divide by 4 to render as "1 hit" / "2 hits" instead
  // of the raw cost.
  const hitsTaken = Math.max(0, Math.floor((p.event_transfers_cost ?? 0) / 4));
  return (
    <div className="rounded-md border border-secondary bg-primary px-3 py-2 text-xs text-text shadow-md">
      <div className="mb-1 font-semibold">GW {p.gw}</div>
      <div>Points: {p.points}</div>
      <div>GW rank: {formatRank(p.gw_rank)}</div>
      <div>Overall: {formatRank(p.overall_rank)}</div>
      <div>
        Transfers: {p.event_transfers}
        {hitsTaken > 0 && (
          <span className="ml-1 font-semibold text-rose-300">
            ({hitsTaken} hit{hitsTaken === 1 ? "" : "s"})
          </span>
        )}
      </div>
    </div>
  );
};

// Series toggles. "transfers" defaults off because most users care about
// rank trajectory; transfers/hits are a deeper-dive view we want to
// surface but not lead with.
type SeriesKey = "overall" | "gw" | "transfers";

type SeriesConfig = {
  key: SeriesKey;
  label: string;
  defaultOn: boolean;
  // Tailwind text colour for the toggle label when active. Mirrors the
  // colour used by the corresponding chart series so the legend reads at
  // a glance.
  activeColor: string;
};

const SERIES: SeriesConfig[] = [
  { key: "gw", label: "GW rank", defaultOn: true, activeColor: "text-cyan-300" },
  {
    key: "overall",
    label: "Overall rank",
    defaultOn: true,
    activeColor: "text-amber-300",
  },
  {
    key: "transfers",
    label: "Transfers / hits",
    defaultOn: false,
    activeColor: "text-magenta3",
  },
];

const RankTrajectoryChart: React.FC<Props> = ({ data, startGw, endGw }) => {
  const points = data.gws;
  const { isSM } = useDimensions();
  const { totalPlayers } = useSelector((state: RootState) => state.totalPlayers);

  const [enabled, setEnabled] = useState<Record<SeriesKey, boolean>>(() => ({
    gw: SERIES.find((s) => s.key === "gw")?.defaultOn ?? true,
    overall: SERIES.find((s) => s.key === "overall")?.defaultOn ?? true,
    transfers: SERIES.find((s) => s.key === "transfers")?.defaultOn ?? false,
  }));

  if (points.length === 0) return null;

  // Anchor Y axis between the user's best rank (with a small log-space
  // buffer above so the line doesn't kiss the top edge) and the full FPL
  // field size below — gives "where am I in the field" context without the
  // empty headroom that domain=[1, totalPlayers] would add.
  const minRank = Math.min(...points.flatMap((p) => [p.gw_rank, p.overall_rank]));
  const yTop = Math.max(1, Math.floor(minRank * 0.7));
  const yBottom =
    totalPlayers > 0 ? totalPlayers : Math.max(...points.map((p) => p.gw_rank));

  // Match the colour logic of RangeRankCard: compare overall rank entering
  // the range vs overall rank leaving it. emerald = improved, rose = worse,
  // cyan (existing chart-3) = neutral or no "before" reference.
  const before =
    startGw > 1 ? (points.find((p) => p.gw === startGw - 1)?.overall_rank ?? null) : null;
  const after = points.find((p) => p.gw === endGw)?.overall_rank ?? null;
  let highlightColor = "var(--chart-3)";
  if (before !== null && after !== null) {
    if (after < before) highlightColor = "#34d399";
    else if (after > before) highlightColor = "#fb7185";
  }

  // Transfers axis upper bound. FPL's effective max in any one GW is
  // ~30 (insanely-active wildcard), but typical is 0–5. We pad to twice
  // the observed max so the bar doesn't dominate the chart.
  const maxTransfers = Math.max(1, ...points.map((p) => p.event_transfers ?? 0));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-text/60 mr-1 text-[10px] uppercase sm:text-xs">Show</span>
        {SERIES.map((s) => {
          const on = enabled[s.key];
          return (
            <Toggle
              key={s.key}
              size="sm"
              pressed={on}
              onPressedChange={(p) => setEnabled((prev) => ({ ...prev, [s.key]: p }))}
              className={`border-accent4/40 data-[state=on]:bg-accent3/60 h-7 rounded-md border bg-transparent px-2 text-[11px] data-[state=on]:text-text sm:text-xs ${
                on ? s.activeColor : "text-text/60 hover:bg-accent3/40"
              }`}
            >
              {s.label}
            </Toggle>
          );
        })}
      </div>

      <div className="h-72 w-full sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            {/* Primary axis: rank (log-scale). Always present so the chart
                grid stays consistent even when only transfers are enabled. */}
            <YAxis
              yAxisId="rank"
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
            {/* Right-hand axis for transfers. Hidden when off so we don't
                waste horizontal space on a phantom scale. */}
            {enabled.transfers && (
              <YAxis
                yAxisId="transfers"
                orientation="right"
                domain={[0, Math.max(maxTransfers * 2, 4)]}
                allowDecimals={false}
                tick={{
                  fill: "var(--text)",
                  fontSize: isSM ? 10 : 11,
                  opacity: 0.7,
                }}
                stroke="var(--accent-4)"
                width={28}
                tickLine={false}
              />
            )}
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: highlightColor, strokeOpacity: 0.4 }}
            />
            <ReferenceArea
              yAxisId="rank"
              x1={startGw}
              x2={endGw}
              fill={highlightColor}
              fillOpacity={0.18}
              stroke={highlightColor}
              strokeOpacity={0.6}
              strokeDasharray="3 3"
              ifOverflow="extendDomain"
            />
            {/* Transfers bar (drawn first so the rank lines sit on top).
                Each bar is rose-tinted when the GW carried a hit cost,
                magenta otherwise — instant visual cue for "this is where
                you took a hit". */}
            {enabled.transfers && (
              <Bar
                yAxisId="transfers"
                dataKey="event_transfers"
                isAnimationActive={false}
                radius={[2, 2, 0, 0]}
              >
                {points.map((p) => (
                  <Cell
                    key={p.gw}
                    fill={
                      (p.event_transfers_cost ?? 0) > 0 ? "#fb7185" : "var(--magenta)"
                    }
                    fillOpacity={(p.event_transfers_cost ?? 0) > 0 ? 0.85 : 0.55}
                  />
                ))}
              </Bar>
            )}
            {enabled.gw && (
              <Area
                yAxisId="rank"
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
            )}
            {enabled.overall && (
              <Line
                yAxisId="rank"
                type="monotone"
                dataKey="overall_rank"
                stroke="#fbbf24"
                strokeWidth={2.5}
                strokeDasharray="4 3"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4, fill: "#fbbf24", stroke: "var(--text)" }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RankTrajectoryChart;

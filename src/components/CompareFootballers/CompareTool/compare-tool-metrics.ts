import { FootballerPosition } from "src/queries/types";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { getDefconThreshold } from "src/utils/defcon";

export type CompareMetricKey =
  | "pointsPerGame"
  | "goalsPer90"
  | "assistsPer90"
  | "xGIPerGame"
  | "xGSPerGame"
  | "xAPerGame"
  | "xGCPer90"
  | "minPerGame"
  | "totalBonus"
  | "totalHauls"
  | "totalCleanSheets"
  | "totalSaves"
  | "defconsPerGame"
  | "totalDefconBonuses"
  | "pointsPerMillion";

type MetricGroup = "Output" | "Attack" | "Role" | "Defense" | "Value";

export type CompareMetric = {
  key: CompareMetricKey;
  label: string;
  shortLabel: string;
  group: MetricGroup;
  better: "higher" | "lower";
  defaultSelected?: boolean;
  format: (value: number) => string;
  getValue: (footballer: FootballerWithGameweekStats) => number;
  isAvailable?: (footballers: FootballerWithGameweekStats[]) => boolean;
};

export const MIN_SELECTED_COMPARE_METRICS = 3;

export const COMPARE_PLAYER_COLORS = ["#c71e4d", "#27dfff", "#fbbf24", "#a78bfa"];

const numberOrZero = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "number" ? value : parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatInt = (value: number): string => numberOrZero(value).toFixed(0);
const formatOne = (value: number): string => numberOrZero(value).toFixed(1);
const formatTwo = (value: number): string => numberOrZero(value).toFixed(2);
const formatMinutes = (value: number): string => `${formatInt(value)}'`;

const hasOutfieldDefconPlayer = (footballers: FootballerWithGameweekStats[]): boolean =>
  footballers.some((footballer) => getDefconThreshold(footballer.element_type) !== null);

const hasKeeper = (footballers: FootballerWithGameweekStats[]): boolean =>
  footballers.some((footballer) => footballer.element_type === FootballerPosition.GK);

const hasKeeperOrDefender = (footballers: FootballerWithGameweekStats[]): boolean =>
  footballers.some((footballer) =>
    [FootballerPosition.GK, FootballerPosition.DEF].includes(footballer.element_type),
  );

export const COMPARE_METRICS: CompareMetric[] = [
  {
    key: "pointsPerGame",
    label: "Points / game",
    shortLabel: "Pts/g",
    group: "Output",
    better: "higher",
    defaultSelected: true,
    format: formatOne,
    getValue: (footballer) => footballer.pointsPerGame,
  },
  {
    key: "totalBonus",
    label: "Bonus",
    shortLabel: "B",
    group: "Output",
    better: "higher",
    format: formatInt,
    getValue: (footballer) => footballer.totalBonus,
  },
  {
    key: "totalHauls",
    label: "Hauls",
    shortLabel: "Hauls",
    group: "Output",
    better: "higher",
    format: formatInt,
    getValue: (footballer) => footballer.totalHauls,
  },
  {
    key: "goalsPer90",
    label: "Goals / 90",
    shortLabel: "G/90",
    group: "Attack",
    better: "higher",
    defaultSelected: true,
    format: formatTwo,
    getValue: (footballer) => footballer.goalsPer90,
  },
  {
    key: "assistsPer90",
    label: "Assists / 90",
    shortLabel: "A/90",
    group: "Attack",
    better: "higher",
    defaultSelected: true,
    format: formatTwo,
    getValue: (footballer) => footballer.assistsPer90,
  },
  {
    key: "xGIPerGame",
    label: "xGI / game",
    shortLabel: "xGI/g",
    group: "Attack",
    better: "higher",
    defaultSelected: true,
    format: formatTwo,
    getValue: (footballer) => numberOrZero(footballer.xGIPerGame),
  },
  {
    key: "xGSPerGame",
    label: "xG / game",
    shortLabel: "xG/g",
    group: "Attack",
    better: "higher",
    defaultSelected: true,
    format: formatTwo,
    getValue: (footballer) => numberOrZero(footballer.xGSPerGame),
  },
  {
    key: "xAPerGame",
    label: "xA / game",
    shortLabel: "xA/g",
    group: "Attack",
    better: "higher",
    defaultSelected: true,
    format: formatTwo,
    getValue: (footballer) => numberOrZero(footballer.xAPerGame),
  },
  {
    key: "minPerGame",
    label: "Minutes / game",
    shortLabel: "Min/g",
    group: "Role",
    better: "higher",
    format: formatMinutes,
    getValue: (footballer) => footballer.minPerGame,
  },
  {
    key: "pointsPerMillion",
    label: "Points / million",
    shortLabel: "Pts/m",
    group: "Value",
    better: "higher",
    format: formatOne,
    getValue: (footballer) => {
      const price = footballer.now_cost / 10;
      return price > 0 ? footballer.totalPoints / price : 0;
    },
  },
  {
    key: "defconsPerGame",
    label: "Defcons / game",
    shortLabel: "Def/g",
    group: "Defense",
    better: "higher",
    defaultSelected: true,
    format: formatTwo,
    getValue: (footballer) => numberOrZero(footballer.defconsPerGame),
    isAvailable: hasOutfieldDefconPlayer,
  },
  {
    key: "totalDefconBonuses",
    label: "Defcon bonuses",
    shortLabel: "Def+",
    group: "Defense",
    better: "higher",
    format: formatInt,
    getValue: (footballer) => footballer.totalDefconBonuses,
    isAvailable: hasOutfieldDefconPlayer,
  },
  {
    key: "totalCleanSheets",
    label: "Clean sheets",
    shortLabel: "CS",
    group: "Defense",
    better: "higher",
    format: formatInt,
    getValue: (footballer) => footballer.totalCleanSheets,
    isAvailable: hasKeeperOrDefender,
  },
  {
    key: "totalSaves",
    label: "Saves",
    shortLabel: "Saves",
    group: "Defense",
    better: "higher",
    format: formatInt,
    getValue: (footballer) => footballer.totalSaves,
    isAvailable: hasKeeper,
  },
  {
    key: "xGCPer90",
    label: "xGC / 90",
    shortLabel: "xGC/90",
    group: "Defense",
    better: "lower",
    format: formatTwo,
    getValue: (footballer) => numberOrZero(footballer.xGCPer90),
  },
];

export const DEFAULT_COMPARE_METRIC_KEYS = COMPARE_METRICS.filter(
  (metric) => metric.defaultSelected,
).map((metric) => metric.key);

export const getAvailableCompareMetrics = (
  footballers: FootballerWithGameweekStats[],
): CompareMetric[] =>
  COMPARE_METRICS.filter(
    (metric) => !metric.isAvailable || metric.isAvailable(footballers),
  );

export const normaliseMetricValue = (
  _metric: CompareMetric,
  value: number,
  allValues: number[],
): number => {
  const safeValues = allValues.map(numberOrZero);
  const safeValue = numberOrZero(value);
  const max = Math.max(...safeValues);

  if (max <= 0) return 0;

  return Math.max(0, Math.min(100, (safeValue / max) * 100));
};

export const isMetricWinner = (
  metric: CompareMetric,
  value: number,
  allValues: number[],
): boolean => {
  const safeValue = numberOrZero(value);
  const target =
    metric.better === "lower"
      ? Math.min(...allValues.map(numberOrZero))
      : Math.max(...allValues.map(numberOrZero));

  return safeValue === target;
};

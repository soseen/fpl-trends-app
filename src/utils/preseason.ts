import type { Footballer, HistoryPast } from "src/queries/types";
import type { AdditionalStats } from "src/redux/slices/footballersGameweekStatsSlice";

const parseStat = (value: string | number | null | undefined): number => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeDivide = (numerator: number, denominator: number): number =>
  denominator > 0 ? numerator / denominator : 0;

const formatRate = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(2) : "0.00";

export const getLatestHistoryPast = (
  footballer: Pick<Footballer, "history_past">,
): HistoryPast | null => footballer.history_past?.at(-1) ?? null;

export const getHistoryPastForSeason = (
  footballer: Pick<Footballer, "history_past">,
  seasonLabel: string | null,
): HistoryPast | null => {
  if (!seasonLabel) return null;
  return (
    footballer.history_past?.find((history) => history.season_name === seasonLabel) ??
    null
  );
};

export const getPreseasonSeasonLabel = (
  footballers: Array<Pick<Footballer, "history_past">>,
): string | null => {
  const seasonCounts = new Map<string, number>();

  footballers.forEach((footballer) => {
    const seasonName = getLatestHistoryPast(footballer)?.season_name;
    if (seasonName) {
      seasonCounts.set(seasonName, (seasonCounts.get(seasonName) ?? 0) + 1);
    }
  });

  return (
    [...seasonCounts.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] ??
    null
  );
};

export type PreseasonFootballerStats = {
  base: Partial<Footballer>;
  additional: AdditionalStats;
};

export const getPreseasonFootballerStats = (
  footballer: Footballer,
  seasonLabel: string | null,
): PreseasonFootballerStats | null => {
  const previous = getHistoryPastForSeason(footballer, seasonLabel);
  if (!previous) return null;

  const starts = Math.max(0, previous.starts ?? 0);
  const minutes = Math.max(0, previous.minutes ?? 0);
  const minutesPer90 = minutes / 90;
  const totalPoints = previous.total_points ?? 0;
  const bootstrapPointsPerGame = parseStat(footballer.points_per_game);
  const inferredAppearances =
    bootstrapPointsPerGame > 0 && footballer.total_points === totalPoints
      ? Math.round(totalPoints / bootstrapPointsPerGame)
      : 0;
  const appearances = Math.max(starts, inferredAppearances);
  const totalGoals = previous.goals_scored ?? 0;
  const totalAssists = previous.assists ?? 0;
  const totalSaves = previous.saves ?? 0;
  const totalXGI = parseStat(previous.expected_goal_involvements);
  const totalXA = parseStat(previous.expected_assists);
  const totalXGS = parseStat(previous.expected_goals);
  const totalXGC = parseStat(previous.expected_goals_conceded);
  const totalDefcons = previous.defensive_contribution ?? 0;
  const currentOwnership = parseStat(footballer.selected_by_percent);

  return {
    base: {
      total_points: totalPoints,
      minutes,
      goals_scored: totalGoals,
      assists: totalAssists,
      clean_sheets: previous.clean_sheets ?? 0,
      goals_conceded: previous.goals_conceded ?? 0,
      penalties_saved: previous.penalties_saved ?? 0,
      penalties_missed: previous.penalties_missed ?? 0,
      yellow_cards: previous.yellow_cards ?? 0,
      red_cards: previous.red_cards ?? 0,
      saves: totalSaves,
      bonus: previous.bonus ?? 0,
      bps: previous.bps ?? 0,
      influence: previous.influence,
      creativity: previous.creativity,
      threat: previous.threat,
      ict_index: previous.ict_index,
      starts,
      expected_goals: previous.expected_goals,
      expected_assists: previous.expected_assists,
      expected_goal_involvements: previous.expected_goal_involvements,
      expected_goals_conceded: previous.expected_goals_conceded,
      expected_goals_per_90: safeDivide(totalXGS, minutesPer90),
      expected_assists_per_90: safeDivide(totalXA, minutesPer90),
      expected_goal_involvements_per_90: safeDivide(totalXGI, minutesPer90),
      expected_goals_conceded_per_90: safeDivide(totalXGC, minutesPer90),
      defensive_contribution: totalDefcons,
      defensive_contribution_per_90: safeDivide(totalDefcons, minutesPer90),
      points_per_game: formatRate(safeDivide(totalPoints, appearances)),
    },
    additional: {
      totalPoints,
      pointsPerGame: safeDivide(totalPoints, appearances),
      pointsPer90: safeDivide(totalPoints, minutesPer90),
      totalGoals,
      goalsPerGame: safeDivide(totalGoals, appearances),
      goalsPer90: safeDivide(totalGoals, minutesPer90),
      totalAssists,
      assistsPerGame: safeDivide(totalAssists, appearances),
      assistsPer90: safeDivide(totalAssists, minutesPer90),
      totalCleanSheets: previous.clean_sheets ?? 0,
      totalSaves,
      savesPerGame: safeDivide(totalSaves, appearances),
      totalXGI,
      xGIPerGame: formatRate(safeDivide(totalXGI, appearances)),
      xGIPer90: formatRate(safeDivide(totalXGI, minutesPer90)),
      totalXA,
      xAPerGame: formatRate(safeDivide(totalXA, appearances)),
      xAPer90: formatRate(safeDivide(totalXA, minutesPer90)),
      totalXGS,
      xGSPerGame: formatRate(safeDivide(totalXGS, appearances)),
      xGSPer90: formatRate(safeDivide(totalXGS, minutesPer90)),
      totalXGC,
      xGCPerGame: formatRate(safeDivide(totalXGC, appearances)),
      xGCPer90: formatRate(safeDivide(totalXGC, minutesPer90)),
      teamName: footballer.teams.name,
      maxOwnership: currentOwnership,
      totalMinutes: minutes,
      minPerGame: safeDivide(minutes, appearances),
      totalBonus: previous.bonus ?? 0,
      totalHauls: 0,
      totalDefconBonuses: 0,
      totalDefcons,
      defconsPerGame: formatRate(safeDivide(totalDefcons, appearances)),
      defconsPer90: formatRate(safeDivide(totalDefcons, minutesPer90)),
    },
  };
};

import { AdditionalStats, FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

export type SelectedStatKey = keyof Pick<
  AdditionalStats,
  "xGIPerGame" | "goalsPerGame" | "assistsPerGame" | "minPerGame" | "xGCPerGame"
>;

export type RankedFootballer = Omit<FootballerWithGameweekStats, SelectedStatKey> & {
  [K in SelectedStatKey]: { value: number | string; rank: number; label?: string };
} & {
    finishingRank: { value: number | string; rank: number; label?: string };
    fixtureDifficultyRank: { value: number | string; rank: number; label?: string };
};

export type BestAttributes = Record<
number,
{
  isBestMinutes: boolean;
  isBestFinisher: boolean;
  isBestFixtures: boolean;
  isBestDefender: boolean;
  isBestAttacker: boolean;
  isDifferential: boolean;
  isBestHighScoringGames: boolean;
  isBestLowScoringGames: boolean;
  isMostHauls: { value: boolean; count: number };
  isBestAttackingTeam: boolean;
  avgGoalsPerGame: number;
  totalTeamGoals: number;
  returns: number;
}
>

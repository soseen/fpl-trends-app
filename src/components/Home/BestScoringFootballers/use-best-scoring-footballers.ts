import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Footballer, FootballerPosition } from "src/queries/types";
import { RootState } from "src/redux/store";

export type AggregatedStats = {
  sumGoals: number;
  sumAssists: number;
  sumBonus: number;
  sumPoints: number;
  sumMinutes: number;
  sumPenaltiesSaved: number;
  sumSaves: number;
  sumCleansheets: number;
};

export type BestScoringFootballer = Footballer & { aggregatedStats: AggregatedStats, isBestScoringPlayer?: boolean };

type Props = {
  teamLimitationOn?: boolean;
};

// Position mapping
const positionMap: Record<FootballerPosition, "GK" | "DEF" | "MID" | "FWD"> = {
  [FootballerPosition.goalkeeper]: "GK",
  [FootballerPosition.defender]: "DEF",
  [FootballerPosition.midfielder]: "MID",
  [FootballerPosition.striker]: "FWD",
};

// Position constraints
const MIN_REQUIREMENTS = { GK: 1, DEF: 3, MID: 3, FWD: 1 };
const MAX_LIMITS = { GK: 1, DEF: 5, MID: 5, FWD: 3 };

export const useBestScoringFootballers = ({ teamLimitationOn }: Props) => {
  const { list } = useSelector((state: RootState) => state.footballers);
  const { startGameweek, endGameweek } = useSelector((state: RootState) => state.gameweeks);

  const footballers = useMemo<{
    goalkeepers: BestScoringFootballer[];
    defenders: BestScoringFootballer[];
    midfielders: BestScoringFootballer[];
    strikers: BestScoringFootballer[];
  }>(() => {
    if (!list.length) {
      return { goalkeepers: [], defenders: [], midfielders: [], strikers: [] };
    }

    // Map players with aggregated stats
    const bestFootballers = list
      .map((footballer) => {
        const filteredHistory = footballer.history.filter(
          (h) => h.round >= startGameweek && h.round <= endGameweek
        );

        const aggregatedStats = filteredHistory.reduce(
          (acc, val) => ({
            sumGoals: acc.sumGoals + val.goals_scored,
            sumAssists: acc.sumAssists + val.assists,
            sumBonus: acc.sumBonus + val.bonus,
            sumPoints: acc.sumPoints + val.total_points,
            sumMinutes: acc.sumMinutes + val.minutes,
            sumPenaltiesSaved: acc.sumPenaltiesSaved + val.penalties_saved,
            sumSaves: acc.sumSaves + val.saves,
            sumCleansheets: acc.sumCleansheets + val.clean_sheets,
          }),
          { sumGoals: 0, sumAssists: 0, sumBonus: 0, sumPoints: 0, sumSaves: 0, sumPenaltiesSaved: 0, sumMinutes: 0, sumCleansheets: 0 }
        );

        return { ...footballer, aggregatedStats };
      })
      .sort((a, b) => b.aggregatedStats.sumPoints - a.aggregatedStats.sumPoints)
      .slice(0, 150);

    let selectedTeam: BestScoringFootballer[] = [];
    let footballersPool = [...bestFootballers];
    let teamCount: Record<number, number> = {};
    let positionCount: Record<"GK" | "DEF" | "MID" | "FWD", number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

    const addPlayer = (player: BestScoringFootballer) => {
      const pos = positionMap[player.element_type as FootballerPosition];
      selectedTeam.push({...player, isBestScoringPlayer: Object.keys(teamCount).length === 0});
      positionCount[pos]++;
      teamCount[player.team_code] = (teamCount[player.team_code] || 0) + 1;
    };

    for (const footballer of bestFootballers) {
      const pos = positionMap[footballer.element_type as FootballerPosition];

      if (teamLimitationOn && ((teamCount[footballer.team_code] || 0) >= 3 || positionCount[pos] === MAX_LIMITS[pos])) continue;
      addPlayer(footballer);
      footballersPool = bestFootballers.filter((f) => f.id !== footballer.id);
      if (selectedTeam.length === 11) break;
    }

    // ✅ **Ensure minimum position requirements are met**
    while (Object.entries(MIN_REQUIREMENTS).some(([pos, min]) => positionCount[pos as keyof typeof positionCount] < min)) {
      const missingPosition = Object.entries(MIN_REQUIREMENTS)
        .find(([pos, min]) => positionCount[pos as keyof typeof positionCount] < min)?.[0] as keyof typeof positionCount;

      if (!missingPosition) break; // If no missing positions, exit

      // Find the **last added player** that is **not** from the missing position
      const playerToRemove = [...selectedTeam].reverse().find(
        (p) =>
          positionMap[p.element_type as FootballerPosition] !== missingPosition &&
          positionCount[positionMap[p.element_type as FootballerPosition]] > MIN_REQUIREMENTS[positionMap[p.element_type as FootballerPosition]]
      );
      

      if (!playerToRemove) break; // No valid player to remove

      // Remove the last player of a non-missing position
      selectedTeam = selectedTeam.filter((p) => p !== playerToRemove);
      positionCount[positionMap[playerToRemove.element_type as FootballerPosition]]--;

      // Find the **best available player** for the missing position
      const replacement = footballersPool.find(
        (p) =>
          positionMap[p.element_type as FootballerPosition] === missingPosition &&
          (teamLimitationOn ? (teamCount[p.team_code] || 0) < 3 : true) &&
          !selectedTeam.find(f => f.id === p.id)
      );
      if (replacement) {
        addPlayer(replacement);
        footballersPool = footballersPool.filter((p) => p.id !== replacement.id);
      }
    }

    // ✅ **Split into separate arrays**
    const goalkeepers = selectedTeam.filter((p) => p.element_type === FootballerPosition.goalkeeper);
    const defenders = selectedTeam.filter((p) => p.element_type === FootballerPosition.defender);
    const midfielders = selectedTeam.filter((p) => p.element_type === FootballerPosition.midfielder);
    const strikers = selectedTeam.filter((p) => p.element_type === FootballerPosition.striker);

    return { goalkeepers, defenders, midfielders, strikers };
  }, [list, startGameweek, endGameweek, teamLimitationOn]);

  return {footballers, startGameweek, endGameweek};
};




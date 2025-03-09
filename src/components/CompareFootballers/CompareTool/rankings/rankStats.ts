import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { SelectedStatKey } from "../types";


export const rankStats = (
  footballers: FootballerWithGameweekStats[],
  statKey: SelectedStatKey
) => {
  const sortedByKey = [...footballers].sort((a, b) => {
    const aValue = parseFloat(a[statKey] as string) || 0;
    const bValue = parseFloat(b[statKey] as string) || 0;

    return statKey === "xGCPer90" ? aValue - bValue : bValue - aValue;
  });

  const rankMap = new Map<number, number>();
  let rank = 1;

  sortedByKey.forEach((player, index) => {
    const playerValue = parseFloat(player[statKey] as string) || 0;
    if (!rankMap.has(playerValue)) rankMap.set(playerValue, rank);

    if (index < sortedByKey.length - 1) {
      const nextValue = parseFloat(sortedByKey[index + 1][statKey] as string) || 0;
      if (playerValue !== nextValue) rank++;
    }
  });

  return (player: FootballerWithGameweekStats) => ({
    value: player[statKey],
    rank: rankMap.get(parseFloat(player[statKey] as string) || 0) ?? rank,
    label: statKey,
  });
};

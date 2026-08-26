import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

const finishing = (player: FootballerWithGameweekStats): number =>
  Number(((player.totalNonPenaltyGoals || 0) - (player.totalNpxG || 0)).toFixed(2));

export const rankFinishing = (footballers: FootballerWithGameweekStats[]) => {
  const sortedByFinishing = [...footballers]
    .filter((f) => f.totalNonPenaltyGoals > 0)
    ?.sort((a, b) => {
      const aFinishing = finishing(a);
      const bFinishing = finishing(b);

      return bFinishing - aFinishing; // Bigger positive difference is better
    });

  const rankMap = new Map<number, number>();
  let rank = 1;

  sortedByFinishing.forEach((player, index) => {
    const playerFinishing = finishing(player);

    if (!rankMap.has(playerFinishing)) rankMap.set(playerFinishing, rank);

    if (index < sortedByFinishing.length - 1) {
      const nextPlayer = sortedByFinishing[index + 1];
      const nextFinishing = nextPlayer ? finishing(nextPlayer) : playerFinishing;

      if (playerFinishing !== nextFinishing) rank++;
    }
  });

  return (player: FootballerWithGameweekStats) => ({
    value: finishing(player),
    rank: rankMap.get(finishing(player)) ?? rank,
    label: "Finishing Ability",
  });
};

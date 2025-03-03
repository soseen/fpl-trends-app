import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";


export const rankFinishing = (footballers: FootballerWithGameweekStats[]) => {
    const sortedByFinishing = [...footballers].sort((a, b) => {
      const aFinishing = (a.totalGoals || 0) - (a.totalXGS || 0);
      const bFinishing = (b.totalGoals || 0) - (b.totalXGS || 0);
  
      return bFinishing - aFinishing; // Bigger positive difference is better
    });
  
    const rankMap = new Map<number, number>();
    let rank = 1;
  
    sortedByFinishing.forEach((player, index) => {
      const playerFinishing = (player.totalGoals || 0) - (player.totalXGS || 0);
  
      if (!rankMap.has(playerFinishing)) rankMap.set(playerFinishing, rank);
  
      if (index < sortedByFinishing.length - 1) {
        const nextFinishing =
          (sortedByFinishing[index + 1].totalGoals || 0) - (sortedByFinishing[index + 1].totalXGS || 0);
  
        if (playerFinishing !== nextFinishing) rank++;
      }
    });
  
    return (player: FootballerWithGameweekStats) => ({
      value: (player.totalGoals || 0) - (player.totalXGS || 0),
      rank: rankMap.get((player.totalGoals || 0) - (player.totalXGS || 0)) ?? rank,
      label: "Finishing Ability",
    });
  };

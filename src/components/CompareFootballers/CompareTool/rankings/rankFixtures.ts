import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

export const rankFixtures = (
  footballers: FootballerWithGameweekStats[],
  currentGameweek: number,
) => {
  const playerFixtures = footballers.map((player) => {
    const upcomingFixtures = player.footballer_fixtures.filter(
      (fixture) =>
        fixture.event >= currentGameweek && fixture.event < currentGameweek + 4,
    );

    const missingFixtures = Math.max(0, 4 - upcomingFixtures.length);
    const totalDifficulty =
      upcomingFixtures.reduce((sum, fixture) => sum + (fixture?.difficulty ?? 6), 0) +
      missingFixtures * 6;

    return {
      player,
      totalFixtures: upcomingFixtures.length,
      totalDifficulty,
    };
  });

  const sortedByFixtureCount = [...playerFixtures].sort((a, b) => {
    if (b.totalFixtures !== a.totalFixtures) {
      return b.totalFixtures - a.totalFixtures;
    }
    return a.totalDifficulty - b.totalDifficulty;
  });

  const rankMap = new Map<string, number>();
  let rank = 1;

  sortedByFixtureCount.forEach((entry, index) => {
    const { totalFixtures, totalDifficulty } = entry;

    const rankKey = `${totalFixtures}-${totalDifficulty}`;
    if (!rankMap.has(rankKey)) rankMap.set(rankKey, rank);

    if (index < sortedByFixtureCount.length - 1) {
      const nextEntry = sortedByFixtureCount[index + 1];
      if (
        nextEntry &&
        (nextEntry.totalFixtures !== totalFixtures ||
          nextEntry.totalDifficulty !== totalDifficulty)
      ) {
        rank++;
      }
    }
  });

  return (player: FootballerWithGameweekStats) => {
    const playerData = playerFixtures.find((p) => p.player.id === player.id);
    return {
      value: playerData?.totalDifficulty ?? 24,
      rank:
        rankMap.get(`${playerData?.totalFixtures}-${playerData?.totalDifficulty}`) ??
        rank,
      label: "Upcoming Fixtures",
    };
  };
};

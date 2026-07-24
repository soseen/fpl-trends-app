import type { Fixture, Footballer } from "src/queries/types";

export type SeasonStart = {
  date: string;
  shortDate: string;
  kickoffTime: string;
  openingFixture: string | null;
  seasonLabel: string;
  storageKey: string;
};

const findFirstUpcomingFixture = (footballers: Footballer[]): Fixture | null => {
  let firstFixture: Fixture | null = null;
  let firstKickoff = Number.POSITIVE_INFINITY;

  footballers.forEach((footballer) => {
    footballer.footballer_fixtures.forEach((fixture) => {
      if (fixture.finished) return;

      const kickoff = Date.parse(fixture.kickoff_time);
      if (!Number.isFinite(kickoff) || kickoff >= firstKickoff) return;

      firstFixture = fixture;
      firstKickoff = kickoff;
    });
  });

  return firstFixture;
};

const getSeasonLabel = (kickoff: Date) => {
  const startYear = kickoff.getFullYear();
  const endYear = String(startYear + 1).slice(-2);
  return `${startYear}/${endYear}`;
};

export const getSeasonStart = (footballers: Footballer[]): SeasonStart | null => {
  const firstFixture = findFirstUpcomingFixture(footballers);
  if (!firstFixture) return null;

  const kickoff = new Date(firstFixture.kickoff_time);
  if (!Number.isFinite(kickoff.getTime())) return null;

  const seasonLabel = getSeasonLabel(kickoff);
  const teamNames = new Map(
    footballers.map((footballer) => [footballer.team, footballer.teams.name]),
  );
  const homeTeam = teamNames.get(firstFixture.team_h);
  const awayTeam = teamNames.get(firstFixture.team_a);

  return {
    date: new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(kickoff),
    shortDate: new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(kickoff),
    kickoffTime: new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(kickoff),
    openingFixture: homeTeam && awayTeam ? `${homeTeam} v ${awayTeam}` : null,
    seasonLabel,
    storageKey: `fpl-trends:preseason-notice:${seasonLabel.replace("/", "-")}`,
  };
};

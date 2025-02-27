import React, { useCallback, useMemo } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import { getTeamsBadge } from "src/utils/images";
import clsx from "clsx";
import { Fixture } from "src/queries/types";
import { TOTAL_GAMEWEEKS_COUNT } from "src/utils/constants";

type Props = {
  footballer: FootballerWithGameweekStats | null;
};

const FootballerUpcomingFixtures = ({ footballer }: Props) => {
  const { list: teams } = useSelector((state: RootState) => state.teams);

  const upcomingFixtures: Record<number, Fixture | undefined> = useMemo(() => {
    const start = footballer?.footballer_fixtures[0]?.event ?? 0;
    const end = Math.min(start + 7, TOTAL_GAMEWEEKS_COUNT);

    const footballerFixturesObject: Record<number, Fixture | undefined> = {};
    Array.from({ length: end - start + 1 }).forEach((_, i) => {
      const fix = footballer?.footballer_fixtures.find((f) => f.event === start + i);
      footballerFixturesObject[start + i] = fix;
    });

    return footballerFixturesObject as Record<number, Fixture | undefined>;
  }, [footballer]);

  const findTeamById = useCallback(
    (id?: number) => teams?.find((t) => t?.id === id),
    [teams],
  );

  const getFixtureDifficultyColor = useCallback((difficulty?: number) => {
    switch (difficulty) {
      case 1:
        return "bg-fixDif1";
      case 2:
        return "bg-fixDif2";
      case 3:
        return "bg-fixDif3";
      case 4:
        return "bg-fixDif4";
      case 5:
        return "bg-fixDif5";
      default:
        return "bg-gray-600 text-text";
    }
  }, []);

  return (
    <div className="mt-2 flex w-full items-center gap-4">
      <div className="flex items-end gap-[6px]">
        {Object.keys(upcomingFixtures).map((key) => {
          const fix = upcomingFixtures[parseInt(key)];
          const team = findTeamById(
            [fix?.team_a, fix?.team_h].find((t) => t !== footballer?.teams.id),
          );
          return (
            <div key={key} className="flex flex-col items-center">
              {team?.code && (
                <img
                  src={getTeamsBadge(team?.code)}
                  className="mb-1 h-auto w-6 object-cover"
                />
              )}
              <div
                className={clsx(
                  "flex w-14 items-center justify-center whitespace-nowrap rounded-sm border-none px-4 py-1 text-sm text-background",
                  getFixtureDifficultyColor(fix?.difficulty),
                  fix?.is_home ? "uppercase" : "lowercase",
                )}
              >
                {team ? `${team?.short_name} (${fix?.is_home ? "H" : "A"})` : "-"}
              </div>
              <p className="rounded-b-sm bg-gray-800 px-2 text-xs text-text">{key}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FootballerUpcomingFixtures;

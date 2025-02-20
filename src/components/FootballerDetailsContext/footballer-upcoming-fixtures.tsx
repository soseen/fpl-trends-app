import React, { useCallback, useMemo } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useFootballerDetailsContext } from "./footballer-details.context";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import { getTeamsBadge } from "src/utils/images";
import clsx from "clsx";

const FootballerUpcomingFixtures = () => {
  const { footballer } = useFootballerDetailsContext();
  const { list: teams } = useSelector((state: RootState) => state.teams);

  const upcoming5 = useMemo(
    () => [...(footballer?.footballer_fixtures ?? [])].slice(0, 5) ?? [],
    [footballer],
  );

  const findTeamById = useCallback(
    (id?: number) => teams?.find((t) => t?.id === id),
    [teams],
  );

  const getFixtureDifficultyColor = useCallback((difficulty: number) => {
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
        return "bg-fixDif1";
    }
  }, []);

  return (
    <div className="flex w-full items-center justify-center gap-4">
      {/* <h2 className="text-text">Upcoming fixtures</h2> */}
      <div className="flex items-end gap-1">
        {upcoming5.map((fix) => {
          const team = findTeamById([fix?.team_a, fix?.team_h].find((t) => t !== footballer?.teams.id));
                            console.log(fix.difficulty);
          if (team) {
            return (
              <div className="flex flex-col items-center gap-2">
                <img src={getTeamsBadge(team.code)} className="h-auto w-6 object-cover" />
                <div
                  className={clsx(
                    "flex w-14 items-center justify-center rounded-sm px-4 py-1 text-background text-sm",
                    getFixtureDifficultyColor(fix.difficulty),
                  )}
                >
                  {team.short_name}
                </div>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default FootballerUpcomingFixtures;

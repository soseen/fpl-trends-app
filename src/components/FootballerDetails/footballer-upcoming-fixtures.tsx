import clsx from "clsx";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { type Fixture } from "src/queries/types";
import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { type RootState } from "src/redux/store";
import { TOTAL_GAMEWEEKS_COUNT } from "src/utils/constants";
import { getTeamsBadge } from "src/utils/images";

type Props = {
  footballer: FootballerWithGameweekStats | null;
  max?: number;
  ignoreBadge?: boolean;
  ignoreGWCount?: boolean;
};

const FootballerUpcomingFixtures = ({
  footballer,
  max,
  ignoreBadge,
  ignoreGWCount,
}: Props) => {
  const { list: teams } = useSelector((state: RootState) => state.teams);

  const upcomingFixtures = useMemo(() => {
    const start = footballer?.footballer_fixtures[0]?.event;

    if (!start) {
      return [];
    }

    const end = max
      ? Math.min(start + max - 1, TOTAL_GAMEWEEKS_COUNT)
      : TOTAL_GAMEWEEKS_COUNT;

    return Array.from({ length: end - start + 1 }).flatMap((_, index) => {
      const event = start + index;
      const fixtures =
        footballer?.footballer_fixtures.filter((fixture) => fixture.event === event) ??
        [];

      return fixtures.length > 0
        ? fixtures.map((fixture) => ({ event, fixture }))
        : [{ event, fixture: undefined as Fixture | undefined }];
    });
  }, [footballer, max]);

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
        return "bg-fixDif3";
    }
  }, []);

  if (!upcomingFixtures.length) {
    return null;
  }

  return (
    <div className="flex w-max min-w-full items-center">
      <div className="flex items-end gap-[6px]">
        {upcomingFixtures.map(({ event, fixture: fix }, index) => {
          const team = findTeamById(
            [fix?.team_a, fix?.team_h].find((t) => t !== footballer?.teams.id),
          );
          return (
            <div
              key={fix?.id ?? `blank-${event}-${index}`}
              className="flex shrink-0 flex-col items-center"
            >
              {team?.code && !ignoreBadge && (
                <img
                  src={getTeamsBadge(team?.code)}
                  alt=""
                  className="mb-1 h-auto w-4 object-cover lg:w-6"
                />
              )}
              <div
                className={clsx(
                  "flex w-7 items-center justify-center whitespace-nowrap rounded-sm border-none px-[2px] text-[7px] leading-4 text-background md:w-10 lg:w-[54px] lg:px-4 lg:py-1 lg:text-[13px]",
                  getFixtureDifficultyColor(fix?.difficulty),
                  fix?.is_home ? "uppercase" : "lowercase",
                )}
              >
                {team ? `${team?.short_name} (${fix?.is_home ? "H" : "A"})` : "-"}
              </div>
              {!ignoreGWCount && (
                <p className="rounded-b-sm bg-gray-800 px-[2px] text-[6px] leading-[1.8] text-text md:text-xs lg:px-2">
                  {event}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FootballerUpcomingFixtures;

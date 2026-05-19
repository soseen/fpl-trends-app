import clsx from "clsx";
import { useCallback, useMemo } from "react";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { getFootballersImage, getTeamsBadge } from "src/utils/images";
import CompareToolSearch from "./CompareToolSearch/compare-tool-search";
import { MdClose as CloseIcon } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { COMPARE_TOOL_STAT_KEYS } from "./use-compare-tool";
import {
  FaArrowDown,
  FaArrowUp,
  FaChevronRight,
  FaFutbol,
  FaHandshake,
  FaShieldAlt,
} from "react-icons/fa";
import { useDimensions } from "src/hooks/use-dimensions";
import { FootballerPosition } from "src/queries/types";
import { TbLockFilled } from "react-icons/tb";
import type { RankedFootballer } from "./types";
import { mapElementTypeToPosition } from "src/utils/strings";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";

type SelectedStats = Pick<
  RankedFootballer,
  "totalGoals" | "totalAssists" | "totalCleanSheets" | "totalDefconBonuses"
>;

const isNumber = (value: unknown): value is number => typeof value === "number";

const getIcon = (key: keyof SelectedStats) => {
  switch (key) {
    case "totalGoals":
      return <FaFutbol />;
    case "totalAssists":
      return <FaHandshake />;
    case "totalCleanSheets":
      return <TbLockFilled />;
    case "totalDefconBonuses":
      return <FaShieldAlt />;
    default:
      return null;
  }
};

const getFixtureDifficultyClass = (difficulty?: number) => {
  switch (difficulty) {
    case 1:
      return "bg-fixDif1 text-white";
    case 2:
      return "bg-fixDif2 text-background";
    case 3:
      return "bg-fixDif3 text-background";
    case 4:
      return "bg-fixDif4 text-white";
    case 5:
      return "bg-fixDif5 text-white";
    default:
      return "bg-accent text-text";
  }
};

const CompareCardFixtures = ({
  footballer,
  max,
}: {
  footballer: RankedFootballer;
  max: number;
}) => {
  const { list: teams } = useSelector((state: RootState) => state.teams);
  const fixtures = useMemo(
    () =>
      Array.from({ length: max }, (_, index) => footballer.footballer_fixtures[index]),
    [footballer.footballer_fixtures, max],
  );

  return (
    <div
      className="grid w-full gap-1.5"
      style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}
    >
      {fixtures.map((fixture, index) => {
        const opponentId = fixture
          ? fixture.is_home
            ? fixture.team_a
            : fixture.team_h
          : undefined;
        const team = teams.find((t) => t.id === opponentId);
        const fixtureLabel = team?.short_name ?? "-";
        const venue = fixture ? (fixture.is_home ? "H" : "A") : "-";

        return (
          <div
            key={fixture?.id ?? `missing-${index}`}
            className="min-w-0 rounded-md bg-accent2/70 px-1 py-1.5 text-center shadow-sm ring-1 ring-inset ring-accent4/50 md:px-1.5 md:py-2"
          >
            {team?.code ? (
              <img
                src={getTeamsBadge(team.code)}
                className="mx-auto mb-1 h-5 w-5 object-contain md:mb-1.5 md:h-7 md:w-7"
              />
            ) : (
              <span className="mx-auto mb-1 block h-5 w-5 rounded-full bg-accent md:mb-1.5 md:h-7 md:w-7" />
            )}
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-semibold leading-3 text-text md:text-xs">
              {fixtureLabel}
            </span>
            <span
              className={clsx(
                "mt-1 inline-flex max-w-full items-center justify-center rounded-sm px-1 py-[2px] text-[7px] font-semibold leading-3 md:px-1.5 md:text-[9px]",
                getFixtureDifficultyClass(fixture?.difficulty),
              )}
              title={`${fixtureLabel} (${venue}) GW${fixture?.event ?? "-"}`}
            >
              {venue} GW{fixture?.event ?? "-"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

type Props = {
  index: number;
  footballer: RankedFootballer | null;
  selectedFootballers: (RankedFootballer | null)[];
  addFootballer: (footballerToAdd: FootballerWithGameweekStats, index: number) => void;
  removeFootballer: (footballerToRemove: RankedFootballer) => void;
  openFootballersProfile: (footballer: RankedFootballer) => void;
};

const CompareToolFootballerCard = ({
  index,
  footballer,
  selectedFootballers,
  addFootballer,
  removeFootballer,
  openFootballersProfile,
}: Props) => {
  const { isMD } = useDimensions();

  const seasonTotalComparison = useCallback(
    (key: keyof RankedFootballer) => {
      if (!footballer) return;
      const gamesPer90 = footballer?.minutes / 90;
      const completedTeamGames = footballer.history.filter(
        (h) => h.team_a_score !== null && h.team_h_score !== null,
      ).length;

      switch (key) {
        case "pointsPer90":
          return gamesPer90 > 0 ? footballer?.total_points / gamesPer90 : 0;
        case "goalsPer90":
          return gamesPer90 > 0 ? footballer?.goals_scored / gamesPer90 : 0;
        case "assistsPer90":
          return gamesPer90 > 0 ? footballer?.assists / gamesPer90 : 0;
        case "xGIPer90":
          return footballer?.expected_goal_involvements_per_90;
        case "xGCPer90":
          return footballer?.expected_goals_conceded_per_90;
        case "defconsPer90": {
          return gamesPer90 > 0
            ? (footballer.defensive_contribution ?? 0) / gamesPer90
            : 0;
        }
        case "minPerGame":
          return completedTeamGames > 0 ? footballer?.minutes / completedTeamGames : 0;
        default:
          return 0;
      }
    },
    [footballer],
  );

  const selectedStats = useMemo(() => {
    if (!footballer) return;
    const stats = Object.keys(footballer)
      .filter(
        (key) =>
          [
            "totalGoals",
            "totalAssists",
            "totalCleanSheets",
            "totalDefconBonuses",
          ].includes(key) && (footballer[key as keyof typeof footballer] as number) > 0,
      )
      .filter(
        (key) =>
          !(
            key === "totalCleanSheets" &&
            [FootballerPosition.MID, FootballerPosition.FWD].includes(
              footballer.element_type,
            )
          ),
      );
    return stats.map((stat) => ({
      key: stat as keyof SelectedStats,
      value: footballer[stat as keyof typeof footballer] as number,
    }));
  }, [footballer]);

  return (
    <div className="w-[184px] shrink-0 snap-start self-stretch md:w-[220px] lg:w-[238px] xl:w-[268px]">
      <div className="relative flex h-full flex-col overflow-hidden rounded-md border border-accent4/70 bg-accent2 shadow-large">
        {!footballer ? (
          <div className="flex min-h-[390px] items-center justify-center p-4 md:min-h-[470px]">
            <CompareToolSearch
              selectedFootballers={selectedFootballers}
              addFootballer={addFootballer}
              index={index}
            />
          </div>
        ) : (
          <>
            <Button
              aria-label={`Remove ${footballer.web_name}`}
              className="absolute right-2 top-2 z-50 h-7 w-7 rounded-full bg-accent/90 p-0 text-text hover:bg-accent"
              onClick={() => removeFootballer(footballer)}
            >
              <CloseIcon className="h-4 w-4" />
            </Button>

            <div className="relative h-[210px] overflow-hidden bg-accent5 md:h-[260px] lg:h-[280px] xl:h-[310px]">
              <div className="absolute inset-x-0 top-0 h-1 bg-magenta" />
              <div className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-md bg-accent3/90 px-2 py-1 shadow-md">
                <img
                  src={getTeamsBadge(footballer.team_code)}
                  className="h-6 w-6 object-contain md:h-8 md:w-8"
                />
                <span className="text-[10px] font-semibold text-text/80 md:text-xs">
                  {footballer.teams?.short_name}
                </span>
              </div>
              <div className="absolute bottom-2 right-2 z-30 flex flex-col items-end gap-1">
                {!!selectedStats?.length &&
                  selectedStats.slice(0, 4).map((stat) => (
                    <span
                      key={stat.key}
                      className="inline-flex items-center gap-1 rounded-md bg-accent3/95 px-1.5 py-[2px] text-[10px] font-semibold text-text shadow-md md:text-xs"
                    >
                      <span>{stat.value}</span>
                      <span className="text-text/75">{getIcon(stat.key)}</span>
                    </span>
                  ))}
              </div>
              <img
                src={getFootballersImage(footballer.code)}
                className="absolute inset-x-0 bottom-0 m-auto h-[92%] w-auto object-contain px-2 pt-8"
              />
            </div>

            <div className="flex flex-col gap-3 px-3 py-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-5 text-text md:text-lg">
                      {footballer.web_name}
                    </p>
                    <p className="text-[11px] text-text/55 md:text-xs">
                      {mapElementTypeToPosition(footballer.element_type)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-magenta px-2 py-1 text-xs font-semibold text-white md:text-sm">
                    {footballer.totalPoints} pts
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-text/70 md:text-xs">
                  <span className="rounded-sm bg-accent3 px-1.5 py-[2px]">
                    {"\u00a3"}
                    {(footballer.now_cost / 10).toFixed(1)}m
                  </span>
                  <span className="rounded-sm bg-accent3 px-1.5 py-[2px]">
                    {(isNumber(footballer.pointsPer90.value)
                      ? footballer.pointsPer90.value
                      : parseFloat(footballer.pointsPer90.value as string)
                    ).toFixed(1)}{" "}
                    pts/90
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-md bg-accent4/30 px-1.5 py-2 ring-1 ring-inset ring-accent4/40 md:px-2.5">
                <CompareCardFixtures footballer={footballer} max={3} />
              </div>

              <div className="flex flex-col gap-1">
                {COMPARE_TOOL_STAT_KEYS.map((stat) => {
                  const { rank, value } = footballer[stat.key];
                  const parsedValue = isNumber(value) ? value : parseFloat(value);
                  const seasonTotal = seasonTotalComparison(stat.key) ?? 0;

                  const minValue = Math.min(parsedValue, seasonTotal);
                  const maxValue = Math.max(parsedValue, seasonTotal);

                  const isIncrease =
                    stat.key === "xGCPer90"
                      ? parsedValue < seasonTotal
                      : parsedValue > seasonTotal;

                  const diff =
                    stat.key === "minPerGame"
                      ? `${(maxValue - minValue).toFixed(0)}'`
                      : (maxValue - minValue).toFixed(2);

                  const isEqual =
                    minValue === maxValue || diff === "0" || maxValue - minValue <= 0.02;

                  return (
                    <div
                      key={footballer.id + stat.key}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md bg-accent3/55 px-2 py-1.5"
                    >
                      <p className="min-w-0 text-[11px] font-medium text-text/85 md:text-xs">
                        {stat.label}
                      </p>
                      {!isEqual ? (
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 text-[10px] md:text-xs",
                            isIncrease ? "text-highlight" : "text-red-400",
                          )}
                        >
                          {!isMD && diff}
                          {isIncrease ? (
                            <FaArrowUp className="h-2.5 w-2.5 rotate-45" />
                          ) : (
                            <FaArrowDown className="h-2.5 w-2.5 -rotate-45" />
                          )}
                        </span>
                      ) : (
                        <span />
                      )}

                      <span
                        className={clsx(
                          "min-w-9 rounded-sm px-1.5 py-[2px] text-right text-[11px] font-semibold text-text md:text-xs",
                          rank === 1
                            ? "bg-magenta"
                            : rank === 2
                              ? "bg-magenta2"
                              : "bg-secondary",
                        )}
                      >
                        {isNumber(value)
                          ? stat.key === "minPerGame"
                            ? value.toFixed(0)
                            : value.toFixed(2)
                          : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              className="mt-auto flex h-10 w-full items-center justify-between rounded-none bg-magenta px-3 text-sm text-text hover:bg-magenta/90"
              onClick={() => openFootballersProfile(footballer)}
            >
              Profile <FaChevronRight />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CompareToolFootballerCard;

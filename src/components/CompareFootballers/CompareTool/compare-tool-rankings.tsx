import React, { useMemo } from "react";
import { BestAttributes, RankedFootballer } from "./types";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import FootballerUpcomingFixtures from "src/components/FootballerDetails/footballer-upcoming-fixtures";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

type Props = {
  bestAttributes: BestAttributes;
  selectedFootballers: (RankedFootballer | null)[];
};

const CompareToolRankings = ({ bestAttributes, selectedFootballers }: Props) => {
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const validFootballers = useMemo(
    () => selectedFootballers.filter(Boolean),
    [selectedFootballers],
  ) as RankedFootballer[];

  return (
    <div className="mt-4 w-full">
      <div className="w-full rounded-md bg-accent2 p-1">
        {validFootballers.map((footballer) => {
          const {
            isBestFinisher,
            isBestFixtures,
            isBestHighScoringGames,
            isMostHauls,
            isBestAttacker,
            isBestDefender,
            isDifferential,
            totalTeamGoals,
            avgGoalsPerGame,
            isBestAttackingTeam,
            returns,
          } = bestAttributes[footballer.id] || {};

          const contribution = (returns / totalTeamGoals) * 100;
          const isTalisman = contribution >= 40;

          return (
            <div key={footballer.id} className="w-full">
              <div className="mb-4 flex w-full items-center gap-1 bg-accent5 px-2 pr-8 pt-1 shadow-md md:pt-2 lg:gap-2">
                <FootballerImage
                  code={footballer.code}
                  className="h-8 w-8 rounded-none md:h-12 md:w-12 lg:h-16 lg:w-16"
                />
                <p className="lg:text-xl">{footballer.web_name}</p>
              </div>
              <div className="mb-2 flex flex-col gap-2 md:mb-4 md:gap-3 lg:mb-6">
                {(footballer?.minPerGame?.value as number) > 80 && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1">
                      ⏳ Secure Minutes
                    </p>
                    <p className="">
                      On average played{" "}
                      <b className="text-magenta">
                        {(footballer?.minPerGame?.value as number).toFixed(0)}{" "}
                      </b>
                      min. per game
                    </p>
                  </span>
                )}
                {isTalisman && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1">
                      👑 Talisman
                    </p>
                    <p className="">
                      Contributed in{" "}
                      <b className="text-magenta">{contribution.toFixed(0)}</b>% of his
                      team goals, having scored{" "}
                      <b className="text-magenta">{footballer.totalGoals}</b> goal
                      {footballer.totalGoals !== 1 ? "s" : ""} and{" "}
                      <b className="text-magenta">{footballer?.totalAssists}</b> assist
                      {footballer.totalAssists !== 1 ? "s" : ""}
                    </p>
                  </span>
                )}
                {isBestFinisher && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1">
                      🎯 Best Finisher{" "}
                    </p>
                    <p className="">
                      Scored <b className="text-magenta">{footballer?.totalGoals}</b>{" "}
                      goals from{" "}
                      <b className="text-magenta">{footballer?.totalXGS.toFixed(2)}</b>{" "}
                      expected goals scored
                    </p>
                  </span>
                )}

                {isBestFixtures && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1">
                      📆 Best Upcoming Fixtures
                    </p>
                    <p className="">
                      Next <b className="text-magenta">4</b> fixtures:
                    </p>
                    <FootballerUpcomingFixtures
                      footballer={footballer as unknown as FootballerWithGameweekStats}
                      max={4}
                      ignoreBadge
                      ignoreGWCount
                    />
                  </span>
                )}
                {isBestHighScoringGames && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1">
                      ⚽ Most High-Scoring Matches
                    </p>
                    <p className="">
                      On average there&apos;s been{" "}
                      <b className="text-magenta">{avgGoalsPerGame.toFixed(2)}</b> goals
                      per game in this player&apos;s games
                    </p>
                  </span>
                )}

                {isBestAttackingTeam && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1">
                      🚀 Best attacking team
                    </p>
                    <p className="">
                      His team scored <b className="text-magenta">{totalTeamGoals}</b>{" "}
                      goals in GW {startGameweek}-{endGameweek}
                    </p>
                  </span>
                )}

                {isMostHauls.value && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1 pr-4">
                      💥 Most Hauls{" "}
                    </p>
                    <p className="">
                      Scored at least 9 points{" "}
                      <b className="text-magenta">{isMostHauls?.count}</b> time
                      {isMostHauls?.count !== 1 ? "s" : ""}
                    </p>
                  </span>
                )}

                {isBestAttacker && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1 pr-4">
                      🔥 Highest goal threat{" "}
                    </p>
                    <p className="">
                      Accumulated <b className="text-magenta">{footballer?.xGSPerGame}</b>{" "}
                      expected goals scored per game
                    </p>
                  </span>
                )}

                {isBestDefender && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1 pr-4">
                      🛡️ Best Defense{" "}
                    </p>
                    <p className="">
                      Plays for a defense that accumulated{" "}
                      <b className="text-magenta">{footballer?.xGCPerGame?.value}</b>{" "}
                      expected goals conceded per game
                    </p>
                  </span>
                )}

                {isDifferential && (
                  <span className="flex w-fit flex-col gap-1 text-sm md:flex-row md:items-center md:gap-2 md:text-base">
                    <p className="w-fit whitespace-nowrap rounded-r-md bg-magenta2 p-1 pr-4">
                      🎭 Biggest Differential{" "}
                    </p>
                    <p className="">
                      Owned by{" "}
                      <b className="text-magenta">
                        {footballer?.maxOwnership.toFixed(2)}%
                      </b>{" "}
                      managers
                    </p>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompareToolRankings;

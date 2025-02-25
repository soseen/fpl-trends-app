import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import React, { useMemo } from "react";

type Props = {
  footballer: FootballerWithGameweekStats | null;
};

const FootballerDetailsStatsPanel = ({ footballer }: Props) => {
  const seasonStats = useMemo(() => {
    const historyLength = footballer?.history?.length ?? 0;

    const baseInfo = [
      { title: "Points", value: footballer?.total_points },
      { title: "Goals", value: footballer?.goals_scored },
      { title: "Assists", value: footballer?.assists },
      {
        title: "Minutes/G",
        value: ((footballer?.minutes ?? 1) / historyLength).toFixed(1),
      },
    ];

    const additionalInfo = (() => {
      switch (footballer?.element_type) {
        case 1:
        case 2:
          return [{ title: "Cleansheets", value: footballer?.clean_sheets }];
        case 3:
        case 4:
          return [{ title: "xG/G", value: footballer?.expected_goals_per_90.toFixed(2) }];
        default:
          return [];
      }
    })();

    return [...baseInfo, ...additionalInfo];
  }, [footballer]);
  return (
    <div className="mt-2 flex-col shadow-sm">
      <h3 className="ml-6 w-fit min-w-[45%] rounded-t-md bg-magenta px-4 pb-[0px] pt-1 text-center text-text">
        Season Stats
      </h3>
      <div className="flex w-full items-center gap-1 rounded-md bg-accent3 px-4 pb-2 pt-4 shadow-lg">
        {seasonStats.map((stat, index) => (
          <>
            <div
              key={stat.title}
              className="flex w-[68px] flex-col items-center justify-center gap-1 whitespace-nowrap"
            >
              <p className="text-sm">{stat.title}</p>
              <p>{stat.value}</p>
            </div>
            {index < seasonStats.length - 1 && (
              <span className="mx-3 block h-6 w-[1px] rounded-md bg-text align-middle opacity-10" />
            )}
          </>
        ))}
      </div>
    </div>
  );
};

export default FootballerDetailsStatsPanel;

import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import React, { useMemo } from "react";

type Props = {
  footballer: FootballerWithGameweekStats | null;
};

const FootballerDetailsStatsPanel = ({ footballer }: Props) => {
  const seasonStats = useMemo(() => {
    const historyLength = footballer?.history?.filter((h) => h.minutes > 0)?.length ?? 0;

    const baseInfo = [
      { title: "Points", value: footballer?.total_points },
      { title: "Goals", value: footballer?.goals_scored },
      { title: "Assists", value: footballer?.assists },
      {
        title: "Min/G",
        value: ((footballer?.minutes ?? 1) / historyLength).toFixed(0) + "`",
      },
    ];

    const additionalInfo = (() => {
      switch (footballer?.element_type) {
        case 1:
        case 2:
          return [{ title: "CS", value: footballer?.clean_sheets }];
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
      <h3 className="ml-2 w-fit rounded-t-md bg-magenta px-2 pb-[0px] pt-1 text-center text-xs text-text md:text-sm lg:ml-6 lg:min-w-[45%] lg:px-4 lg:text-base">
        Season Stats
      </h3>
      <div className="flex w-full items-center gap-1 rounded-md bg-accent5 px-2 pb-1 pt-2 shadow-lg lg:bg-accent3 lg:px-4 lg:pb-2 lg:pt-4">
        {seasonStats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="flex w-7 flex-col items-center justify-center gap-1 whitespace-nowrap lg:w-[68px]">
              <p className="text-[9px] sm:text-xs lg:text-sm">{stat.title}</p>
              <p className="text-[9px] sm:text-xs lg:text-base">{stat.value}</p>
            </div>
            {index < seasonStats.length - 1 && (
              <span className="mx-1 block h-6 w-[1px] rounded-md bg-text align-middle opacity-10 lg:mx-3" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FootballerDetailsStatsPanel;

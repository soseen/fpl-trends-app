import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useMemo } from "react";

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
    <div className="rounded-md bg-accent4/25 p-2 ring-1 ring-inset ring-accent4/40">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase text-text/45 md:text-xs">
          Season stats
        </h3>
        <span className="h-[1px] flex-1 bg-accent4/60" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
        {seasonStats.map((stat, index) => (
          <div
            key={`${stat.title}-${index}`}
            className="min-w-0 rounded-md bg-accent3/60 px-2 py-1.5 text-center"
          >
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-text/55 md:text-xs">
              {stat.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-text md:text-sm">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FootballerDetailsStatsPanel;

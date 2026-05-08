import clsx from "clsx";
import { useMemo } from "react";
import { FaArrowDown, FaArrowUp, FaStar } from "react-icons/fa";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { getTeamsBadge } from "src/utils/images";
import { mapElementTypeToPosition, roundToThousands } from "src/utils/strings";
import FootballerImage from "../FootballerImage/footballer-image";
import FootballerDetailsStatsPanel from "./footballer-details-stats-panel";
import FootballerUpcomingFixtures from "./footballer-upcoming-fixtures";

type Props = {
  footballer: FootballerWithGameweekStats;
  compact?: boolean;
};

const FootballerDetailsSummary = ({ footballer, compact }: Props) => {
  const info = useMemo(() => {
    const price = footballer.now_cost ? footballer.now_cost / 10 : 0;
    const position = mapElementTypeToPosition(footballer.element_type);
    const isTransfersIn =
      (footballer.transfers_in_event ?? 0) >= (footballer.transfers_out_event ?? 0);
    const transfersCount = isTransfersIn
      ? footballer.transfers_in_event
      : footballer.transfers_out_event;

    const fullName = `${footballer.first_name} ${footballer.second_name}`.trim();
    const displayName = compact && fullName.length > 20 ? footballer.web_name : fullName;

    return {
      displayName,
      isTransfersIn,
      position,
      price,
      transfersCount,
    };
  }, [compact, footballer]);

  const featureStats = useMemo(
    () => [
      { label: "Range pts", value: footballer.totalPoints ?? footballer.total_points },
      {
        label: "Pts/g",
        value:
          typeof footballer.pointsPerGame === "number"
            ? footballer.pointsPerGame.toFixed(1)
            : "-",
      },
      {
        label: "xGI",
        value:
          typeof footballer.totalXGI === "number" ? footballer.totalXGI.toFixed(2) : "-",
      },
      {
        label: "Min/g",
        value:
          typeof footballer.minPerGame === "number"
            ? `${footballer.minPerGame.toFixed(0)}'`
            : "-",
      },
    ],
    [footballer],
  );

  return (
    <section className="relative overflow-hidden rounded-md border border-accent4/70 bg-accent2 shadow-large">
      <div className="absolute left-1 right-1 top-0 h-1 bg-magenta" />
      <div
        className={clsx(
          "grid min-w-0 gap-0",
          compact
            ? "xs:grid-cols-[132px_minmax(0,1fr)]"
            : "md:grid-cols-[320px_minmax(0,1fr)]",
        )}
      >
        <div
          className={clsx(
            "relative min-h-full overflow-hidden bg-accent5",
            compact
              ? "flex min-h-[170px] items-end justify-center px-2 pt-7"
              : "px-4 pt-10",
          )}
        >
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-md bg-accent3/90 px-2 py-1 shadow-md">
            <img
              src={getTeamsBadge(footballer.team_code)}
              className="h-6 w-6 object-contain md:h-8 md:w-8"
            />
            {!compact && (
              <span className="text-xs font-semibold text-text/80">
                {footballer.teams?.short_name}
              </span>
            )}
          </div>
          {footballer.in_dreamteam && (
            <FaStar className="absolute right-3 top-3 z-10 h-4 w-4 text-yellow-400 md:h-5 md:w-5" />
          )}
          <FootballerImage
            code={footballer.code}
            className={clsx(
              "mx-auto rounded-none px-1",
              compact ? "h-36 w-28 self-end" : "h-[280px] w-full md:h-[360px]",
            )}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3 p-3 md:gap-4 md:p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase text-text/45">
                {info.position}
              </p>
              <h2 className="overflow-hidden text-ellipsis text-xl font-semibold leading-6 text-text md:text-3xl md:leading-9">
                {info.displayName}
              </h2>
            </div>
            <span className="shrink-0 rounded-md bg-magenta px-2.5 py-1 text-sm font-semibold text-white md:text-base">
              {footballer.totalPoints ?? footballer.total_points} pts
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-text/75 md:text-sm">
            {!!footballer.now_cost && (
              <span className="rounded-sm bg-accent3 px-2 py-1">
                {"\u00a3"}
                {info.price.toFixed(1)}m
              </span>
            )}
            <span className="rounded-sm bg-accent3 px-2 py-1">
              {footballer.selected_by_percent}% selected
            </span>
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-sm px-2 py-1 font-semibold",
                info.isTransfersIn
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400",
              )}
            >
              {info.isTransfersIn ? (
                <FaArrowUp className="h-3 w-3 rotate-45" />
              ) : (
                <FaArrowDown className="h-3 w-3 -rotate-45" />
              )}
              {roundToThousands(info.transfersCount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {featureStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md bg-accent3/60 px-2.5 py-2 ring-1 ring-inset ring-accent4/40"
              >
                <p className="text-[10px] font-semibold uppercase text-text/45">
                  {stat.label}
                </p>
                <p className="mt-1 text-base font-semibold leading-5 text-text">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <FootballerDetailsStatsPanel footballer={footballer} />

          <div className="min-w-0 overflow-x-auto rounded-md bg-accent4/25 p-2 ring-1 ring-inset ring-accent4/40">
            <FootballerUpcomingFixtures footballer={footballer} max={compact ? 5 : 7} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FootballerDetailsSummary;

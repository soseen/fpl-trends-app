import React from "react";
import clsx from "clsx";
import { FaFutbol, FaHandshake, FaShieldAlt } from "react-icons/fa";
import { TbLockFilled } from "react-icons/tb";
import { FootballerPosition } from "src/queries/types";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import PlayerCardShell from "src/components/PlayerCard/player-card-shell";
import StatBadge from "src/components/PlayerCard/stat-badge";
import { getTeamsBadge } from "src/utils/images";

type Props = {
  footballer: FootballerWithGameweekStats;
  include: {
    returns?: boolean;
    xGI?: boolean;
    selectedBy?: boolean;
    defcons?: boolean;
    totalPoints?: boolean;
  };
};

type ReturnStat = { icon: React.ReactNode; label: string; value: number };

const buildReturnStats = (f: FootballerWithGameweekStats): ReturnStat[] => {
  const stats: ReturnStat[] = [];
  if (f.totalGoals)
    stats.push({ icon: <FaFutbol />, label: "Goals", value: f.totalGoals });
  if (f.totalAssists)
    stats.push({ icon: <FaHandshake />, label: "Assists", value: f.totalAssists });
  if (
    f.totalCleanSheets &&
    [FootballerPosition.DEF, FootballerPosition.GK].includes(f.element_type)
  )
    stats.push({
      icon: <TbLockFilled />,
      label: "Clean sheets",
      value: f.totalCleanSheets,
    });
  if (f.totalDefconBonuses)
    stats.push({
      icon: <FaShieldAlt />,
      label: "Defcons",
      value: f.totalDefconBonuses,
    });
  return stats;
};

type MetricChip = { value: string; suffix: string; label: string };

const getMetricChip = (
  footballer: FootballerWithGameweekStats,
  include: Props["include"],
): MetricChip | null => {
  if (include.xGI)
    return {
      value: `${footballer?.xGIPerGame}`,
      suffix: "xGI",
      label: "xGI per game",
    };
  if (include.defcons)
    return {
      value: `${footballer?.defconsPerGame}`,
      suffix: "DEF",
      label: "Defcons per game",
    };
  if (include.selectedBy)
    return {
      value: `${footballer?.selected_by_percent}%`,
      suffix: "own",
      label: "Selected by (current)",
    };
  return null;
};

const OutlierCard = ({ footballer, include }: Props) => {
  const { setFootballer } = useFootballerDetailsContext();
  const metric = getMetricChip(footballer, include);
  const returnStats = include?.returns ? buildReturnStats(footballer) : [];

  return (
    <PlayerCardShell
      onClick={() => setFootballer(footballer)}
      ariaLabel={`Open ${footballer.web_name} details`}
      className="h-auto w-full"
      imageAreaClassName="aspect-[8/9] pt-3 md:pt-4"
      topLeft={
        <span className="inline-flex items-center gap-1 rounded-md bg-accent3/90 px-1 py-0.5 shadow-sm ring-1 ring-inset ring-accent4/40 md:gap-1.5 md:px-1.5">
          <img
            src={getTeamsBadge(footballer.team_code)}
            alt={footballer.teams?.short_name}
            className="block h-3.5 w-3.5 shrink-0 object-contain md:h-4 md:w-4"
          />
          {metric && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold leading-none text-text md:text-[12px]",
                  )}
                >
                  <span className="tabular-nums text-magenta">{metric.value}</span>
                  <span className="text-text/60">{metric.suffix}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{metric.label}</TooltipContent>
            </Tooltip>
          )}
        </span>
      }
      topRight={returnStats.map((stat) => (
        <StatBadge
          key={stat.label}
          value={stat.value}
          icon={stat.icon}
          label={stat.label}
        />
      ))}
      image={
        <FootballerImage
          code={footballer.code}
          className="h-auto max-h-full w-auto max-w-[92%] rounded-none object-contain md:max-h-[88%] md:max-w-[78%]"
        />
      }
      name={footballer?.web_name}
      points={`${footballer?.totalPoints} pts`}
    />
  );
};

export default OutlierCard;

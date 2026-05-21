import type React from "react";
import { FaFutbol, FaHandshake, FaShieldAlt } from "react-icons/fa";
import { TbLockFilled } from "react-icons/tb";
import { FootballerPosition } from "src/queries/types";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

export type ReturnStat = {
  key: string;
  icon: React.ReactNode;
  label: string;
  value: number;
};

export const buildReturnStats = (
  footballer: Pick<
    FootballerWithGameweekStats,
    | "element_type"
    | "totalGoals"
    | "totalAssists"
    | "totalCleanSheets"
    | "totalDefconBonuses"
  >,
): ReturnStat[] => {
  const stats: ReturnStat[] = [];

  if (footballer.totalGoals) {
    stats.push({
      key: "goals",
      icon: <FaFutbol />,
      label: "Goals",
      value: footballer.totalGoals,
    });
  }

  if (footballer.totalAssists) {
    stats.push({
      key: "assists",
      icon: <FaHandshake />,
      label: "Assists",
      value: footballer.totalAssists,
    });
  }

  if (
    footballer.totalCleanSheets &&
    [FootballerPosition.DEF, FootballerPosition.GK].includes(footballer.element_type)
  ) {
    stats.push({
      key: "clean-sheets",
      icon: <TbLockFilled />,
      label: "Clean sheets",
      value: footballer.totalCleanSheets,
    });
  }

  if (footballer.totalDefconBonuses) {
    stats.push({
      key: "defcons",
      icon: <FaShieldAlt />,
      label: "Defcons",
      value: footballer.totalDefconBonuses,
    });
  }

  return stats;
};

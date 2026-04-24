import type { History } from "src/queries/types";
import { FootballerPosition } from "src/queries/types";

// FPL 2025-26 "Defensive Contribution" bonus thresholds.
// Defenders need 10+ CBIT (clearances/blocks/interceptions/tackles);
// midfielders & forwards need 12+ (CBIT + ball recoveries).
// Goalkeepers don't earn this bonus — they have saves instead.
const DEFCON_THRESHOLDS: Partial<Record<FootballerPosition, number>> = {
  [FootballerPosition.DEF]: 10,
  [FootballerPosition.MID]: 12,
  [FootballerPosition.FWD]: 12,
};

export const DEFCON_BONUS_POINTS = 2;

export const getDefconThreshold = (
  elementType: number | undefined | null,
): number | null => {
  if (elementType === null) return null;
  return DEFCON_THRESHOLDS[elementType as FootballerPosition] ?? null;
};

export const hasDefconBonus = (
  entry: Pick<History, "defensive_contribution"> | null | undefined,
  elementType: number | undefined | null,
): boolean => {
  const threshold = getDefconThreshold(elementType);
  if (threshold === null) return false;
  const value = entry?.defensive_contribution;
  if (typeof value !== "number") return false;
  return value >= threshold;
};

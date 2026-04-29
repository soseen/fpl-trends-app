import { useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";

// Bridge from "I have a player_id" → "open the global details modal/drawer".
// The FootballerDetailsProvider lives at the App root (App.tsx), so any
// component can call this hook to show the same modal used elsewhere
// (Players table, Compare tool, Best XI pitch on Home).
//
// We look the player up in the enriched-stats slice rather than in the raw
// footballers list because the modal expects the enriched shape (per-range
// totals, per-90 etc.). If the player isn't currently in the enriched
// list (e.g. transferred out of the league mid-season but the user owned
// them), we fall through silently — better than crashing the modal.
export const useOpenPlayerDetails = (): ((playerId: number) => void) => {
  const { setFootballer } = useFootballerDetailsContext();
  const enriched = useSelector(
    (state: RootState) => state.footballersGameweekStats.footballers,
  );

  return useCallback(
    (playerId: number) => {
      const found = enriched.find((f) => f.id === playerId);
      if (found) setFootballer(found);
    },
    [enriched, setFootballer],
  );
};

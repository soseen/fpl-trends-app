import React, { useCallback, useContext, useState } from "react";

import { useDimensions } from "src/hooks/use-dimensions";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import FootballerDetailsModal from "./footballer-details-modal";
import FootballerDetailsDrawer from "./footballer-details-drawer";

type FootballerDetailsStateProvider = {
  children: React.ReactNode;
};

type FootballerDetailsState = {
  footballer: FootballerWithGameweekStats | null;
  setFootballer: React.Dispatch<React.SetStateAction<FootballerWithGameweekStats | null>>;
  onClose: () => void;
};
const FootballerDetailsContext = React.createContext<FootballerDetailsState | undefined>(
  undefined,
);

export const FootballerDetailsProvider = ({
  children,
}: FootballerDetailsStateProvider) => {
  const [footballer, setFootballer] = useState<FootballerWithGameweekStats | null>(null);
  const { isMD } = useDimensions();

  const onClose = useCallback(() => setFootballer(null), [setFootballer]);

  return (
    <FootballerDetailsContext.Provider value={{ footballer, setFootballer, onClose }}>
      {isMD ? (
        <FootballerDetailsDrawer footballer={footballer} onClose={onClose} />
      ) : (
        <FootballerDetailsModal footballer={footballer} onClose={onClose} />
      )}
      {children}
    </FootballerDetailsContext.Provider>
  );
};

export const useFootballerDetailsContext = () => {
  const context = useContext(FootballerDetailsContext);
  if (!context) {
    throw new Error(
      "useFootballerDetailsContext must be used within FootballerDetailsProvider",
    );
  }
  return context;
};

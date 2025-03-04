import React from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { RankedFootballer } from "../types";
import { useDimensions } from "src/hooks/use-dimensions";
import CompareToolSearchDrawer from "./compare-tool-search-drawer";
import CompareToolSearchPopover from "./compare-tool-search-popover";

type Props = {
  index: number;
  selectedFootballers: (RankedFootballer | null)[];
  addFootballer: (footballerToAdd: FootballerWithGameweekStats, index: number) => void;
};

const CompareToolSearch = (props: Props) => {
  const { isMD } = useDimensions();

  return isMD ? (
    <CompareToolSearchDrawer {...props} />
  ) : (
    <CompareToolSearchPopover {...props} />
  );
};

export default CompareToolSearch;

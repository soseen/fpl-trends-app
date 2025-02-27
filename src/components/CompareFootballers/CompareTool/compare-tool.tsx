import { useState } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import React from "react";
import CompareToolSearch from "./compare-tool-search";

const CompareTool = () => {
  const [selectedFootballers, setSelectedFootballers] = useState<
    FootballerWithGameweekStats[]
  >([]);

  return (
    <div className="container w-full">
      <CompareToolSearch
        selectedFootballers={selectedFootballers}
        setSelectedFootballers={setSelectedFootballers}
      />
    </div>
  );
};

export default CompareTool;

import React from "react";
import OutlierCard from "../outlier-card";
import { useBestDifferentials } from "./use-best-differentials";
import OutliersHeader from "../outliers-header";

const BestDifferentialsTab = () => {
  const { bestDifferentials } = useBestDifferentials();

  return (
    <div>
      <OutliersHeader
        title="Best Differentials"
        search={new URLSearchParams({
          sorting: JSON.stringify([{ id: "totalPoints", desc: true }]),
          filters: JSON.stringify([{ id: "maxOwnership", value: [0, 10] }]),
        }).toString()}
      />
      <div className="grid w-full grid-cols-4 gap-4 md:gap-6 lg:grid-cols-5">
        {bestDifferentials.map((footballer) => (
          <OutlierCard
            key={footballer.id}
            footballer={footballer}
            include={{ totalPoints: true, returns: true, selectedBy: true }}
          />
        ))}
      </div>
      <p className="text-xs italic text-text md:text-sm">
        * displayed ownership represents current state
      </p>
    </div>
  );
};

export default BestDifferentialsTab;

import React from "react";
import { useBestDefcons } from "./use-best-defcons";
import OutlierCard from "../outlier-card";
import OutliersHeader from "../outliers-header";

const BestDefconsTab = () => {
  const { bestDefcons } = useBestDefcons();

  return (
    <div>
      <OutliersHeader
        title="Best Defensive Contributors / game"
        search={new URLSearchParams({
          sorting: JSON.stringify([
            { id: "defconsPerGame", desc: true },
            { id: "totalDefconBonuses", desc: true },
          ]),
        }).toString()}
      />
      <div className="grid w-full grid-cols-4 gap-4 md:gap-6 lg:grid-cols-5">
        {bestDefcons.map((footballer) => (
          <OutlierCard
            key={footballer.id}
            footballer={footballer}
            include={{ defcons: true, returns: true }}
          />
        ))}
      </div>
    </div>
  );
};

export default BestDefconsTab;

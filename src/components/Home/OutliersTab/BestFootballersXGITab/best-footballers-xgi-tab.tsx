import React from "react";
import { useBestXGIFootballers } from "./use-best-xgi-footballers";
import OutlierCard from "../outlier-card";
import OutliersHeader from "../outliers-header";

const BestFootballersXGITab = () => {
  const { bestXGIFootballers } = useBestXGIFootballers();

  return (
    <div>
      <OutliersHeader
        title="Players with the Highest xGI / game"
        search={new URLSearchParams({
          sorting: JSON.stringify([
            { id: "xGIPerGame", desc: true },
            { id: "totalGoals", desc: true },
          ]),
        }).toString()}
      />
      <div className="grid w-full grid-cols-4 gap-4 md:gap-6 lg:grid-cols-5">
        {bestXGIFootballers.map((footballer) => (
          <OutlierCard
            key={footballer.id}
            footballer={footballer}
            include={{ xGI: true, returns: true }}
          />
        ))}
      </div>
    </div>
  );
};

export default BestFootballersXGITab;

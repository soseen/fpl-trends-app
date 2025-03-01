import React from "react";
import BestFootballersXGITab from "./BestFootballersXGITab/best-footballers-xgi-tab";
import BestDifferentialsTab from "./BestDifferentialsTab/best-differentials-tab";
import OutliersTabRow from "./outliers-tab-row";

const OutliersTab = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <OutliersTabRow component={<BestFootballersXGITab />} />
      <OutliersTabRow component={<BestDifferentialsTab />} />
    </div>
  );
};

export default OutliersTab;

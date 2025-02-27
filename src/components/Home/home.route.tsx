import React from "react";
import TeamsTable from "./TeamsTable/teams-table";
import Pitch from "./BestScoringFootballers/pitch";
import OutliersTab from "./OutliersTab/outliers-tab";

const Home = () => {
  return (
    <div className="flex w-full flex-col items-center">
      <Pitch />
      <div className="my-2 grid w-full grid-cols-1 gap-6 md:my-12 lg:grid-cols-3">
        <div className="w-full lg:col-span-2">
          <OutliersTab />
        </div>
        <div className="lg:col-span-1">
          <TeamsTable />
        </div>
      </div>
    </div>
  );
};

export default Home;

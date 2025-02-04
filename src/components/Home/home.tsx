import React from "react";
import GameweekSlider from "./GameweekSlider/gameweek-slider";
import BestFootballersXGITab from "./BestFootballersXGITab/best-footballers-xgi-tab";
import TeamsTable from "./TeamsTable/teams-table";

const Home = () => {
  return (
    <div className="flex w-full flex-col items-center">
      <GameweekSlider />
      <div className="my-12 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <BestFootballersXGITab />
        </div>
        <div className="md:col-span-1">
          <TeamsTable />
        </div>
      </div>
    </div>
  );
};

export default Home;

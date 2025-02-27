import React from "react";
import { Link } from "react-router-dom";
import TransfersPanel from "./transfersPanel";
import {
  AppInitStatus,
  useAppInitContext,
} from "../AppInitializer/app-initializer.context";
import GameweekSlider from "../Home/GameweekSlider/gameweek-slider";

const Navbar: React.FC = () => {
  const { status } = useAppInitContext();
  return (
    <>
      <nav className="sticky top-0 z-[300] w-full border-b-2 border-secondary bg-primary pt-4 text-xs text-text md:text-lg">
        <div className="flex w-full justify-between px-2 md:px-4">
          <Link to="/" className="text-lg font-bold">
            FPL Trends
          </Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-gray-400">
              Home
            </Link>
            <Link to="/players" className="hover:text-gray-400">
              Players
            </Link>
            <Link to="/compare" className="hover:text-gray-400">
              Comparison Tool
            </Link>
          </div>
        </div>
        <GameweekSlider />
      </nav>
      {status === AppInitStatus.idle && <TransfersPanel />}
    </>
  );
};

export default Navbar;

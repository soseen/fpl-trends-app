import React from "react";
import { Link } from "react-router-dom";
import TransfersPanel from "./transfersPanel";
import {
  AppInitStatus,
  useAppInitContext,
} from "../AppInitializer/app-initializer.context";
import GameweekSlider from "../Home/GameweekSlider/gameweek-slider";
import logo from "../../assets/logo.png";
import { FaHome, FaTools, FaUser } from "react-icons/fa";

const Navbar: React.FC = () => {
  const { status } = useAppInitContext();
  return (
    <>
      <nav className="sticky top-0 z-[300] w-full border-b-2 border-secondary bg-primary pt-4 text-xs text-text md:text-lg">
        <div className="flex w-full items-center justify-between px-2 md:px-4">
          <Link to="/" className="text-lg font-bold">
            <img
              src={logo}
              alt="logo"
              className="box-content h-6 w-auto bg-transparent p-1 md:h-7 lg:h-10"
            />
          </Link>
          <div className="flex items-center space-x-1 md:space-x-4">
            <Link to="/" className="hover:text-gray-400">
              <span className="flex items-center gap-1 text-xs md:gap-2 md:text-base">
                Home <FaHome className="text-magenta" />
              </span>
            </Link>
            <span className="h-4 w-[1px] bg-text opacity-40" />
            <Link to="/players" className="hover:text-gray-400">
              <span className="flex items-center gap-1 text-xs md:gap-2 md:text-base">
                Players <FaUser className="text-magenta" />
              </span>
            </Link>
            <span className="h-4 w-[1px] bg-text opacity-40" />
            <Link to="/compare" className="hover:text-gray-400">
              <span className="flex items-center gap-1 text-xs md:gap-2 md:text-base">
                Comparison Tool <FaTools className="text-magenta" />
              </span>
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

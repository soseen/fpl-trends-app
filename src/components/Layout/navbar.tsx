import React from "react";
import { Link } from "react-router-dom";
import TransfersPanel from "./transfersPanel";
import {
  AppInitStatus,
  useAppInitContext,
} from "../AppInitializer/app-initializer.context";

const Navbar: React.FC = () => {
  const { status } = useAppInitContext();
  return (
    <nav className="w-full overflow-hidden border-b-2 border-secondary bg-primary pt-4 text-xs text-text md:text-lg">
      <div className="flex w-full justify-between px-4 pb-4">
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
          <Link to="/teams" className="hover:text-gray-400">
            Teams
          </Link>
        </div>
      </div>
      {status === AppInitStatus.idle && <TransfersPanel />}
    </nav>
  );
};

export default Navbar;

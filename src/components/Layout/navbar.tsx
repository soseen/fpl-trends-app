import type React from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import TransfersPanel from "./transfersPanel";
import {
  AppInitStatus,
  useAppInitContext,
} from "../AppInitializer/app-initializer.context";
import GameweekSlider from "../Home/GameweekSlider/gameweek-slider";
import logo from "../../assets/logo.png";
import { FaChartLine, FaHome, FaTools, FaUser } from "react-icons/fa";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: <FaHome /> },
  { to: "/my-trends", label: "My Trends", icon: <FaChartLine /> },
  { to: "/players", label: "Players", icon: <FaUser /> },
  { to: "/compare", label: "Compare", icon: <FaTools /> },
];

// Mobile shows icons only — labels were wrapping/clumping at 375px.
// Desktop (md+) gets full label + icon.
const NavPill: React.FC<{ item: NavItem }> = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.to === "/"}
    aria-label={item.label}
    title={item.label}
    className={({ isActive }) =>
      clsx(
        "inline-flex items-center justify-center gap-2 rounded-md transition-colors",
        // Mobile: square-ish icon button
        "h-8 w-8 text-base",
        // Desktop: pill with label
        "md:h-auto md:w-auto md:gap-2 md:px-3 md:py-1.5 md:text-sm md:font-medium",
        isActive
          ? "bg-accent3 text-magenta"
          : "text-text/80 hover:bg-accent3/60 hover:text-text",
      )
    }
  >
    <span className="flex items-center [&_svg]:size-4">{item.icon}</span>
    <span className="hidden whitespace-nowrap md:inline">{item.label}</span>
  </NavLink>
);

const Navbar: React.FC = () => {
  const { status } = useAppInitContext();
  return (
    <>
      <nav className="sticky top-0 z-[300] w-full border-b-2 border-secondary bg-primary text-text">
        <div className="flex w-full items-center justify-between gap-2 px-2 py-1.5 md:px-4 md:py-2">
          <NavLink to="/" aria-label="FPL Trends home">
            <img
              src={logo}
              alt="logo"
              className="box-content h-5 w-auto bg-transparent p-1 md:h-7 lg:h-9"
            />
          </NavLink>
          <div className="flex items-center gap-1 md:gap-2">
            {NAV_ITEMS.map((item) => (
              <NavPill key={item.to} item={item} />
            ))}
          </div>
        </div>
        <GameweekSlider />
      </nav>
      {status === AppInitStatus.idle && <TransfersPanel />}
    </>
  );
};

export default Navbar;

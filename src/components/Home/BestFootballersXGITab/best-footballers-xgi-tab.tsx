import React from "react";
import { useBestXGIFootballers } from "./useBestXGIFootballers";
import { FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import { Skeleton } from "@/components/ui/skeleton";
import FootballerCard from "./footballer-card";
import BestFootballersXGISkeleton from "./best-footballers-xgi-tab.skeleton";

const BestFootballersXGITab = () => {
  const { isLoading, bestXGIFootballers } = useBestXGIFootballers();
  const { status } = useAppInitContext();

  if (isLoading || status === AppInitStatus.loading)
    return <BestFootballersXGISkeleton />;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-lg md:text-xl">
        <div className="flex w-full justify-between">
          <div className="mr-4 flex items-center gap-2">
            <h2 className="text-xs text-text md:text-lg">
              Players with the Highest xGI / game
            </h2>
            <FaFire className="text-magenta" />
          </div>
          <Link
            className="whitespace-nowrap text-xs text-text underline md:text-lg"
            to={{ pathname: "/players", search: "?sort=XGI" }}
          >
            View All...
          </Link>
        </div>
      </div>
      <div className="wrap flex items-center gap-2 md:gap-6">
        {bestXGIFootballers.map((footballer) => (
          <FootballerCard key={footballer.id} footballer={footballer} />
        ))}
      </div>
    </div>
  );
};

export default BestFootballersXGITab;

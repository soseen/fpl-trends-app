import { lazy, Suspense, useEffect, useState } from "react";
import Pitch from "./BestScoringFootballers/pitch";
import HomeFplIdPrompt from "../MyTrends/home-fpl-id-prompt";
import OutliersRowSkeleton from "./OutliersTab/outliers-row.skeleton";
import TeamsTableSkeleton from "./TeamsTable/teams-table.skeleton";

const TeamsTable = lazy(() => import("./TeamsTable/teams-table"));
const OutliersTab = lazy(() => import("./OutliersTab/outliers-tab"));

const HomeSecondarySkeleton = () => (
  <div className="-my-2 grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="flex w-full flex-col gap-4 lg:col-span-2">
      <OutliersRowSkeleton />
      <OutliersRowSkeleton />
      <OutliersRowSkeleton />
    </div>
    <div className="lg:col-span-1">
      <TeamsTableSkeleton />
    </div>
  </div>
);

const useIdleRender = () => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const idleWindow = window as Window & {
      cancelIdleCallback?: (id: number) => void;
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
    };

    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(() => setShouldRender(true), {
        timeout: 2500,
      });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setShouldRender(true), 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return shouldRender;
};

const Home = () => {
  const showSecondaryContent = useIdleRender();

  return (
    <div className="flex w-full flex-col items-center">
      <HomeFplIdPrompt />
      <Pitch />
      {showSecondaryContent ? (
        <Suspense fallback={<HomeSecondarySkeleton />}>
          <div className="-my-2 grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="w-full lg:col-span-2">
              <OutliersTab />
            </div>
            <div className="lg:col-span-1">
              <TeamsTable />
            </div>
          </div>
        </Suspense>
      ) : (
        <HomeSecondarySkeleton />
      )}
    </div>
  );
};

export default Home;

import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors `rank-trajectory-chart.tsx`:
//   - Top row: "Show" label + 3 toggle buttons.
//   - Below: chart canvas, ~h-72 mobile / h-80 desktop.
const RankTrajectoryChartSkeleton: React.FC = () => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-1.5">
      <Skeleton className="h-4 w-10 bg-accent3" />
      <Skeleton className="h-7 w-20 rounded-md bg-accent3" />
      <Skeleton className="h-7 w-24 rounded-md bg-accent3" />
      <Skeleton className="h-7 w-28 rounded-md bg-accent3" />
    </div>
    <Skeleton className="h-72 w-full bg-accent3 md:h-80" />
  </div>
);

export default RankTrajectoryChartSkeleton;

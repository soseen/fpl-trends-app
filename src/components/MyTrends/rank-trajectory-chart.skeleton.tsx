import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors `rank-trajectory-chart.tsx`:
//   - Top row: "Show" label + 3 toggle buttons.
//   - Below: chart canvas, compact on phones and taller on larger screens.
const RankTrajectoryChartSkeleton: React.FC = () => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-1.5">
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-7 w-20 rounded-md" />
      <Skeleton className="h-7 w-24 rounded-md" />
      <Skeleton className="h-7 w-28 rounded-md" />
    </div>
    <Skeleton className="h-56 w-full xs:h-64 md:h-80" />
  </div>
);

export default RankTrajectoryChartSkeleton;

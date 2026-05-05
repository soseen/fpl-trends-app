import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonEventCard: React.FC = () => (
  <div className="flex flex-col gap-2 rounded-md border border-accent4 bg-primary/40 p-3 shadow-md">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-20 rounded-md" />
    </div>
    <div className="flex items-center justify-center gap-3 py-2 sm:gap-6">
      <Skeleton className="h-[80px] w-12 rounded-md sm:h-[100px] sm:w-16 md:h-[120px] md:w-20" />
      <Skeleton className="h-[80px] w-12 rounded-md sm:h-[100px] sm:w-16 md:h-[120px] md:w-20" />
    </div>
  </div>
);

const CaptainImpactSkeleton: React.FC = () => (
  <div className="flex w-full flex-col gap-3">
    <div className="flex flex-col items-center gap-1 py-2">
      <Skeleton className="h-9 w-32 md:h-12 md:w-44" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
    <div className="flex flex-col gap-3">
      <SkeletonEventCard />
      <SkeletonEventCard />
      <SkeletonEventCard />
    </div>
  </div>
);

export default CaptainImpactSkeleton;

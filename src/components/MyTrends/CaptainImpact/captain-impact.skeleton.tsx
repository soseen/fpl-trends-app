import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonSlot: React.FC = () => (
  <div className="flex flex-col items-center gap-1">
    <Skeleton className="h-2.5 w-12" />
    <Skeleton className="h-[88px] w-12 rounded-md sm:h-[108px] sm:w-16 md:h-[140px] md:w-[84px] lg:h-[160px] lg:w-24" />
    <Skeleton className="h-2 w-10" />
  </div>
);

const SkeletonBreakdownLine: React.FC = () => (
  <div className="flex items-center justify-between gap-2">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-3 w-6" />
  </div>
);

const SkeletonEventCard: React.FC = () => (
  <div className="flex flex-col overflow-hidden rounded-md border border-accent4 bg-primary/40 shadow-md">
    <div className="flex items-center justify-between bg-accent5/80 px-3 py-1.5 sm:py-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-20 rounded-md" />
    </div>
    <div className="flex items-start justify-center gap-2 px-3 py-3 sm:gap-3 sm:py-4 md:gap-4">
      <SkeletonSlot />
      <SkeletonSlot />
      <SkeletonSlot />
    </div>
    <div className="flex flex-col gap-1 border-t border-accent4/40 px-3 py-2 sm:py-2.5">
      <Skeleton className="mb-1 h-2.5 w-32" />
      <SkeletonBreakdownLine />
      <SkeletonBreakdownLine />
      <SkeletonBreakdownLine />
      <div className="mt-1 flex items-center justify-between border-t border-accent4/30 pt-1">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-16" />
      </div>
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

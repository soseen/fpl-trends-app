import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the layout of `range-rank-card.tsx`:
//
//   [magenta header chip]    [magenta header chip]
//   [big number block]   |   [big number block]
//   [magenta footer chip]    [magenta footer chip]
//
// Both side blocks are `w-fit min-w-[80%]` content-sized in the real card,
// so the skeleton uses fixed-ish widths centered in their column to avoid
// the previous skeleton's "stretches edge-to-edge" look. Heights mirror
// the real card's responsive breakpoints (mobile compact, desktop tall).
const RankCardColumnSkeleton: React.FC = () => (
  <div className="flex flex-col items-center gap-1.5 md:gap-2">
    <Skeleton className="h-5 w-20 md:h-6 md:w-32 lg:w-40" />
    <Skeleton className="h-16 w-full max-w-[180px] md:h-28 md:max-w-[260px] lg:h-32 lg:max-w-[320px]" />
    <Skeleton className="h-5 w-24 md:h-6 md:w-36 lg:w-44" />
  </div>
);

const RangeRankCardSkeleton: React.FC = () => (
  <div className="grid grid-cols-9 gap-2">
    <div className="col-span-4">
      <RankCardColumnSkeleton />
    </div>
    <div className="col-span-1 h-full w-[1px] self-center justify-self-center bg-accent4" />
    <div className="col-span-4">
      <RankCardColumnSkeleton />
    </div>
  </div>
);

export default RangeRankCardSkeleton;

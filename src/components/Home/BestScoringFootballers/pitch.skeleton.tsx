import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const PitchSkeleton = () => {
  return (
    <div className="mt-4 flex w-full flex-col gap-4 px-2 md:mt-8 md:gap-6 md:px-20">
      <Skeleton className="min-h-[40px] w-full md:min-h-[60px] lg:min-h-[75px]" />
      <Skeleton className="min-h-[480px] w-full md:min-h-[620px] lg:min-h-[920px]" />
    </div>
  );
};

export default PitchSkeleton;

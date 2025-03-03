import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
const CompareToolSkeleton = () => {
  return (
    <div className="mt-4 flex w-full items-center justify-center gap-4 rounded-sm bg-accent3 p-2 pb-4 lg:gap-8 lg:pb-8 lg:text-xl">
      {[...Array(2).keys()].map((_, index) => (
        <Skeleton
          key={index}
          className="mt-4 aspect-[220/280] h-[140px] rounded-md bg-accent2 md:h-[210px] lg:mt-8 lg:h-[260px] xl:h-[310px]"
        />
      ))}
    </div>
  );
};

export default CompareToolSkeleton;

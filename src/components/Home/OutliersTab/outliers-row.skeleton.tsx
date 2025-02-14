import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const OutliersRowSkeleton = () => {
  return (
    <div className="w-full">
      <Skeleton className="mb-4 h-[20px] lg:h-[40px]" />
      <div className="wrap flex items-center justify-center gap-2 md:gap-6">
        {[...Array(5).keys()].map((_, index) => (
          <Skeleton
            key={index}
            className="xs:h-[140px] flex h-[105px] w-full md:h-[190px] xl:h-[240px]"
          />
        ))}
      </div>
    </div>
  );
};

export default OutliersRowSkeleton;

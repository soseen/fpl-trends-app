import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const BestFootballersXGISkeleton = () => {
  return (
    <div className="wrap flex items-center gap-2 md:gap-6">
      {[...Array(5).keys()].map((_, index) => (
        <Skeleton key={index} className="h-[105px] w-[60px] md:h-[250px] md:w-[170px]" />
      ))}
    </div>
  );
};

export default BestFootballersXGISkeleton;

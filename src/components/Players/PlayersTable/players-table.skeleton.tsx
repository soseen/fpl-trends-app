import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const PlayersTableSkeleton = () => {
  return (
    <div className="container flex w-full flex-col space-y-3">
      <Skeleton className="h-8 w-full" />
      {[...Array(50).keys()].map((_, index) => (
        <Skeleton key={index} className="h-6 w-full shadow-xl md:h-8" />
      ))}
    </div>
  );
};

export default PlayersTableSkeleton;

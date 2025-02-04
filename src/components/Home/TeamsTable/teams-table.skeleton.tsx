import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const TeamsTableSkeleton = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-8 w-full" />
      {[...Array(10).keys()].map((_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
  );
};

export default TeamsTableSkeleton;

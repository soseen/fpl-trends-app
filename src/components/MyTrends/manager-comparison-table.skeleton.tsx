import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors `manager-comparison-table.tsx`:
//   - 5-column table: Stat | You | Avg | T100k | T10k
//   - 10 data rows (Total points, Avg GW score, Captain bonus, Most
//     captained, Transfers made, Wildcards, Free hits, Bench boosts,
//     Hits taken, Points benched).
//
// The label column is wider; the four numeric columns are narrower and
// right-aligned in the real table, so we use a `grid-cols-12` layout
// (4 / 2 / 2 / 2 / 2) to mimic that proportion roughly.
const HeaderRow: React.FC = () => (
  <div className="grid grid-cols-12 items-center gap-2 border-b border-accent4 py-2">
    <Skeleton className="col-span-4 h-3 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3 w-10 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3 w-10 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3 w-10 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3 w-10 bg-accent3" />
  </div>
);

const DataRow: React.FC = () => (
  <div className="border-accent4/40 grid grid-cols-12 items-center gap-2 border-b py-2.5">
    <Skeleton className="col-span-4 h-3.5 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3.5 w-12 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3.5 w-12 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3.5 w-12 bg-accent3" />
    <Skeleton className="col-span-2 ml-auto h-3.5 w-12 bg-accent3" />
  </div>
);

const ManagerComparisonTableSkeleton: React.FC = () => (
  <div className="flex flex-col">
    <HeaderRow />
    {Array.from({ length: 10 }).map((_, i) => (
      <DataRow key={i} />
    ))}
  </div>
);

export default ManagerComparisonTableSkeleton;

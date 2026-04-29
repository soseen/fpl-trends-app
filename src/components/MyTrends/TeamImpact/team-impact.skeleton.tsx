import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors `team-impact.tsx`'s rendered shape:
//   1. Pitch section: a centered title + the pitch graphic with 4 rows
//      of player tiles (1 GK, 4 DEF, 4 MID, 2 FWD as a representative
//      formation). Heights match the real `team-impact-pitch.tsx`
//      breakpoints so the page doesn't jump on data arrival.
//   2. Player breakdown: section header + ~6 accordion-row placeholders
//      shaped like the collapsed `player-impact-row` (avatar, two-line
//      label stack, points block, rank pill).

const TileSkeleton: React.FC = () => (
  // Match the dimensions of `team-impact-pitch-card.tsx`:
  //   h-[92px] w-14 → md:h-[136px] w-24 → lg:h-[188px] w-32
  <Skeleton className="h-[92px] w-14 rounded-md bg-accent3 sm:w-20 md:h-[136px] md:w-24 lg:h-[188px] lg:w-32" />
);

const PitchRow: React.FC<{ count: number }> = ({ count }) => (
  <div className="mx-auto mb-2 flex max-w-[900px] items-center justify-center gap-4 px-4 md:mb-4 lg:mb-8 lg:px-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex justify-center md:mx-2 lg:mx-2">
        <TileSkeleton />
      </div>
    ))}
  </div>
);

const PitchSkeleton: React.FC = () => (
  <div className="mt-4 flex w-full flex-col justify-center md:mt-6">
    <Skeleton className="mx-auto h-5 w-64 bg-accent3 md:h-7 md:w-96" />
    <div className="mt-2 min-h-[380px] w-full bg-[url(src/assets/pitch.png)] bg-cover bg-center bg-no-repeat sm:min-h-[580px] md:mt-6 md:min-h-[660px] md:bg-contain lg:min-h-[900px]">
      <div className="mb-6 mt-0 min-h-[380px] w-full sm:min-h-[580px] md:-mt-1 md:mb-0 md:min-h-[660px] lg:-mt-4 lg:min-h-[900px]">
        <PitchRow count={1} />
        <PitchRow count={4} />
        <PitchRow count={4} />
        <PitchRow count={2} />
      </div>
    </div>
  </div>
);

const PlayerRowSkeleton: React.FC = () => (
  // Mirrors the collapsed `player-impact-row.tsx`: avatar (round) +
  // two-line text stack on the left, points block + rank pill on the
  // right, plus a stat-chip strip below. Heights/widths chosen to leave
  // the row at the same total height as a real row to avoid jank when
  // data arrives.
  <div className="border-accent4/20 flex w-full flex-col gap-1 border-b px-2 py-2 sm:gap-1.5 sm:px-3">
    <div className="flex w-full items-center gap-2 sm:gap-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-accent3 sm:h-11 sm:w-11" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-24 bg-accent3 sm:w-32" />
        <Skeleton className="h-3 w-16 bg-accent3 sm:w-20" />
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-7 w-10 bg-accent3 sm:w-12" />
        <Skeleton className="h-7 w-14 rounded-md bg-accent3 sm:w-20" />
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-1 pl-11 sm:pl-14">
      <Skeleton className="h-3.5 w-10 bg-accent3" />
      <Skeleton className="h-3.5 w-10 bg-accent3" />
      <Skeleton className="h-3.5 w-12 bg-accent3" />
      <Skeleton className="h-3.5 w-14 bg-accent3" />
    </div>
  </div>
);

const PlayerBreakdownSkeleton: React.FC = () => (
  <div className="border-accent4/40 rounded-md border bg-primary p-2 sm:p-3">
    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
      <Skeleton className="h-4 w-32 bg-accent3 sm:h-5 sm:w-40" />
      <Skeleton className="h-3 w-44 bg-accent3 sm:w-56" />
    </div>
    {Array.from({ length: 6 }).map((_, i) => (
      <PlayerRowSkeleton key={i} />
    ))}
  </div>
);

const TeamImpactSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4">
    <PitchSkeleton />
    <PlayerBreakdownSkeleton />
  </div>
);

export default TeamImpactSkeleton;

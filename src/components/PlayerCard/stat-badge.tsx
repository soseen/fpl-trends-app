import type React from "react";
import clsx from "clsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  // `compact` shrinks for tight tiles (pitch cards on mobile) where the
  // default size stacks too tall and obscures the player photo.
  compact?: boolean;
};

const StatBadge = ({ icon, value, label, compact }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={clsx(
            "inline-flex items-center rounded-l-md bg-accent3/95 font-semibold text-text shadow-md ring-1 ring-inset ring-accent4/60",
            compact
              ? "gap-0.5 px-1 py-[1px] text-[8px] leading-[10px] sm:gap-1 sm:px-1.5 sm:py-[2px] sm:text-[10px] md:text-[11px] [&_svg]:!size-2 sm:[&_svg]:!size-2.5 md:[&_svg]:!size-3"
              : "gap-1 px-1.5 py-[2px] text-[10px] leading-[12px] sm:px-2 sm:py-[3px] sm:text-[11px] md:text-xs [&_svg]:!size-2.5 sm:[&_svg]:!size-3 md:[&_svg]:!size-3.5",
          )}
        >
          <span className="tabular-nums">{value}</span>
          <span className="flex items-center text-text/85">{icon}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export default StatBadge;

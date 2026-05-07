import React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

type Props = {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  imageAreaClassName?: string;
  bodyClassName?: string;
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  imageOverlay?: React.ReactNode;
  image: React.ReactNode;
  name: React.ReactNode;
  middleRow?: React.ReactNode;
  points: React.ReactNode;
  pointsHighlight?: boolean;
};

const PlayerCardShell = ({
  onClick,
  ariaLabel,
  className,
  imageAreaClassName,
  bodyClassName,
  topLeft,
  topRight,
  imageOverlay,
  image,
  name,
  middleRow,
  points,
  pointsHighlight,
}: Props) => {
  return (
    <Button
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx(
        "relative m-auto flex flex-col items-stretch gap-0 overflow-hidden rounded-md border border-accent4/70 bg-accent2 p-0 text-text shadow-large hover:bg-accent2",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1 bg-magenta"
      />

      <div
        className={clsx(
          "relative flex w-full items-end justify-center overflow-hidden bg-accent5",
          imageAreaClassName ?? "flex-1 pt-2",
        )}
      >
        {image}
        {imageOverlay}
        {topLeft && (
          <div className="absolute left-1 top-1.5 z-30 md:left-1.5 md:top-2">
            {topLeft}
          </div>
        )}
        {topRight && (
          <div className="absolute right-0 top-2 z-30 flex flex-col items-end gap-0.5 md:gap-1">
            {topRight}
          </div>
        )}
      </div>

      <div
        className={clsx(
          "flex w-full flex-col items-center justify-center gap-0.5 border-t-[1px] border-t-accent4 bg-accent3 px-1 py-0.5 md:px-1.5",
          bodyClassName,
        )}
      >
        <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[10px] font-semibold leading-tight text-text sm:text-[11px] md:text-xs">
          {name}
        </span>
        {middleRow !== undefined && middleRow !== null && (
          <span className="block text-center leading-tight">{middleRow}</span>
        )}
      </div>

      <div
        className={clsx(
          "flex w-full items-center justify-center px-1 py-0.5 text-[10px] font-semibold tabular-nums leading-tight shadow-inner sm:text-[11px] md:text-xs",
          pointsHighlight ? "bg-highlight text-primary" : "bg-magenta text-white",
        )}
      >
        {points}
      </div>
    </Button>
  );
};

export default PlayerCardShell;

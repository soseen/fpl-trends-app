import type React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

type Props = {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  imageAreaClassName?: string;
  bodyClassName?: string;
  topLeft?: React.ReactNode;
  topLeftClassName?: string;
  topRight?: React.ReactNode;
  topRightClassName?: string;
  imageOverlay?: React.ReactNode;
  image: React.ReactNode;
  name: React.ReactNode;
  nameClassName?: string;
  footerVariant?: "strip" | "profile";
  middleRow?: React.ReactNode;
  detailsRow?: React.ReactNode;
  detailsRowClassName?: string;
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
  topLeftClassName,
  topRight,
  topRightClassName,
  imageOverlay,
  image,
  name,
  nameClassName,
  footerVariant = "strip",
  middleRow,
  detailsRow,
  detailsRowClassName,
  points,
  pointsHighlight,
}: Props) => {
  const pointsTone = pointsHighlight
    ? "bg-highlight text-primary"
    : "bg-accent5 text-white";

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
          imageAreaClassName ?? "min-h-0 flex-1 pt-2",
        )}
      >
        {image}
        {imageOverlay}
        {topLeft && (
          <div
            className={clsx(
              "absolute left-1 top-1.5 z-30 md:left-1.5 md:top-2",
              topLeftClassName,
            )}
          >
            {topLeft}
          </div>
        )}
        {topRight && (
          <div
            className={clsx(
              "absolute right-0 top-2 z-30 flex flex-col items-end gap-0.5 md:gap-1",
              topRightClassName,
            )}
          >
            {topRight}
          </div>
        )}
      </div>

      {footerVariant === "profile" ? (
        <div
          className={clsx(
            "flex w-full flex-col gap-1 border-t border-accent4 bg-accent2 px-1.5 py-1.5 md:gap-1.5 md:px-2 md:py-2",
            bodyClassName,
          )}
        >
          <div className="flex w-full items-start justify-between gap-1.5">
            <div className="min-w-0 text-left">
              <span
                className={clsx(
                  "block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold leading-tight text-text sm:text-xs md:text-sm lg:text-base",
                  nameClassName,
                )}
              >
                {name}
              </span>
              {middleRow !== undefined && middleRow !== null && (
                <span className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-left text-[8px] leading-none text-text/55 sm:text-[9px] md:text-[10px] lg:text-xs">
                  {middleRow}
                </span>
              )}
            </div>
            <span
              className={clsx(
                "shrink-0 rounded-md px-1.5 py-1 text-[9px] font-semibold tabular-nums leading-none sm:text-[10px] md:px-2 md:text-xs",
                pointsTone,
              )}
            >
              {points}
            </span>
          </div>

          {detailsRow !== undefined && detailsRow !== null && (
            <div
              className={clsx(
                "flex min-h-4 w-full min-w-0 flex-wrap items-center gap-1 overflow-hidden text-[8px] font-semibold leading-none text-text/70 sm:text-[9px] md:text-[10px]",
                detailsRowClassName,
              )}
            >
              {detailsRow}
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className={clsx(
              "flex w-full flex-col items-center justify-center gap-0.5 border-t-[1px] border-t-accent4 bg-accent3 px-1 py-0.5 md:px-1.5",
              bodyClassName,
            )}
          >
            <span
              className={clsx(
                "block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-center text-[10px] font-semibold leading-tight text-text sm:text-[11px] md:text-xs",
                nameClassName,
              )}
            >
              {name}
            </span>
            {middleRow !== undefined && middleRow !== null && (
              <span className="block text-center leading-tight">{middleRow}</span>
            )}
          </div>

          {detailsRow !== undefined && detailsRow !== null && (
            <div
              className={clsx(
                "flex w-full min-w-0 items-center justify-center gap-1 border-t border-accent4/50 bg-accent2 px-1 py-0.5 text-[8px] font-semibold leading-none text-text/80 sm:text-[9px] md:text-[10px]",
                detailsRowClassName,
              )}
            >
              {detailsRow}
            </div>
          )}

          <div
            className={clsx(
              "flex w-full items-center justify-center border-t-[1px] border-t-accent2 px-1 py-0.5 text-[10px] font-semibold tabular-nums leading-tight shadow-inner sm:text-[11px] md:text-xs",
              pointsTone,
            )}
          >
            {points}
          </div>
        </>
      )}
    </Button>
  );
};

export default PlayerCardShell;

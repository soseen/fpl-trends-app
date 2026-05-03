import { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import * as SliderPrimitive from "@radix-ui/react-slider";
import clsx from "clsx";

import type { RootState, AppDispatch } from "src/redux/store";
import { setGameweekRange } from "src/redux/slices/gameweeksSlice";
import { Button } from "@/components/ui/button";
import { useDimensions } from "src/hooks/use-dimensions";
import { TOTAL_GAMEWEEKS_COUNT } from "src/utils/constants";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import { Skeleton } from "@/components/ui/skeleton";

// `?gw=5-12` round-trip helpers. Bounds validate against the live
// `maxGameweek` so a stale share-link (or a hand-typed bogus value)
// silently falls back to the default range instead of breaking the app.
const parseGwParam = (param: string | null, max: number) => {
  if (!param) return null;
  const match = /^(\d+)-(\d+)$/.exec(param);
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (!startStr || !endStr) return null;
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 1 ||
    end < start ||
    end > max
  ) {
    return null;
  }
  return { start, end };
};

// Quick-pick chips. Inline next to the slider so the navbar stays one
// row tall. Mobile uses tight labels ("3", "5", "10", "All") to keep the
// row from overflowing on narrow screens; desktop gets the more
// descriptive "Last N" form. "All" maps to the season-to-date span
// (1..max), not 1..38, so a click in GW 5 doesn't dilute the data with
// 33 unplayed rounds.
type Preset = {
  shortLabel: string;
  longLabel: string;
  range: (max: number) => { start: number; end: number };
};
const PRESETS: Preset[] = [
  {
    shortLabel: "3",
    longLabel: "Last 3",
    range: (max) => ({ start: Math.max(1, max - 2), end: max }),
  },
  {
    shortLabel: "5",
    longLabel: "Last 5",
    range: (max) => ({ start: Math.max(1, max - 4), end: max }),
  },
  {
    shortLabel: "10",
    longLabel: "Last 10",
    range: (max) => ({ start: Math.max(1, max - 9), end: max }),
  },
  {
    shortLabel: "All",
    longLabel: "All",
    range: (max) => ({ start: 1, end: max }),
  },
];

const GameweekSlider = () => {
  const { status } = useAppInitContext();
  const { startGameweek, endGameweek, maxGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSM } = useDimensions();

  const [currentRange, setCurrentRange] = useState<[number, number]>([
    startGameweek || 1,
    endGameweek || 1,
  ]);

  // Mirror redux → local slider state whenever redux updates externally
  // (e.g. via a preset click, the URL sync below, or a future tab-sync).
  useEffect(() => {
    if (startGameweek && endGameweek) {
      setCurrentRange([startGameweek, endGameweek]);
    }
  }, [startGameweek, endGameweek]);

  // One-shot URL → redux sync. We wait until `maxGameweek` is settled —
  // the store's auto-init populates it once the footballers fetch
  // resolves; if we dispatched our URL value before then, the auto-init
  // would clobber it on arrival.
  const urlSyncedRef = useRef(false);
  useEffect(() => {
    if (urlSyncedRef.current) return;
    if (!maxGameweek) return;
    urlSyncedRef.current = true;
    const parsed = parseGwParam(searchParams.get("gw"), maxGameweek);
    if (!parsed) return;
    if (parsed.start === startGameweek && parsed.end === endGameweek) return;
    dispatch(setGameweekRange(parsed));
  }, [maxGameweek, searchParams, dispatch, startGameweek, endGameweek]);

  const isDisabled = useMemo(
    () => currentRange[0] === startGameweek && currentRange[1] === endGameweek,
    [startGameweek, endGameweek, currentRange],
  );

  const onValueChange = (value: number[]) => {
    const [a, b] = value;
    if (typeof a === "number" && typeof b === "number") {
      setCurrentRange([a, b]);
    }
  };

  const applyRange = (start: number, end: number) => {
    dispatch(setGameweekRange({ start, end }));
    // `replace: true` — each apply shouldn't push a new history entry,
    // otherwise back-button mashing replays every range tweak.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("gw", `${start}-${end}`);
        return next;
      },
      { replace: true },
    );
  };

  const confirmNewRange = () => {
    applyRange(currentRange[0], currentRange[1]);
  };

  if (status === AppInitStatus.loading)
    return (
      <div className="my-2 flex h-2 w-full items-center px-2 md:my-4 md:px-4 lg:my-6">
        <Skeleton className="h-2 w-full md:h-3" />
      </div>
    );

  return (
    <div className="my-2 px-2 md:my-4 md:px-4 lg:my-6">
      <div className="flex w-full items-center gap-2 md:gap-4">
        {/* Header doubles as a live range readout — mobile drops the long
            "Gameweek Range" prefix to recover horizontal space; the
            currentRange numbers update on every drag tick, replacing the
            per-thumb labels we used to render below the slider (which
            forced a separate vertical row to clear the chip strip). */}
        <h1 className="whitespace-nowrap text-sm text-text md:text-xl">
          <span className="md:hidden">GW</span>
          <span className="hidden md:inline">Gameweek Range</span>
          <span className="ml-1.5 font-semibold text-magenta md:ml-2">
            {currentRange[0]}–{currentRange[1]}
          </span>
        </h1>
        <SliderPrimitive.Root
          value={currentRange}
          min={1}
          max={maxGameweek || TOTAL_GAMEWEEKS_COUNT}
          step={1}
          minStepsBetweenThumbs={1}
          onValueChange={onValueChange}
          aria-label="Gameweek range"
          className="relative flex h-5 min-w-0 flex-1 touch-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-white dark:bg-magenta">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-magenta dark:bg-white" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full bg-magenta focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-2 dark:bg-white" />
          <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full bg-magenta focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-2 dark:bg-white" />
        </SliderPrimitive.Root>
        {/* Inline preset chips. Auto-apply on click — the user has
            stated their intent unambiguously, no Apply confirm needed. */}
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          {PRESETS.map((preset) => {
            const max = maxGameweek || TOTAL_GAMEWEEKS_COUNT;
            const range = preset.range(max);
            const active =
              range.start === startGameweek && range.end === endGameweek;
            return (
              <button
                key={preset.longLabel}
                type="button"
                onClick={() => applyRange(range.start, range.end)}
                className={clsx(
                  "rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors md:px-2.5 md:text-sm",
                  active
                    ? "bg-magenta text-text"
                    : "bg-magenta2/60 text-text/80 hover:bg-magenta2",
                )}
              >
                <span className="md:hidden">{preset.shortLabel}</span>
                <span className="hidden md:inline">{preset.longLabel}</span>
              </button>
            );
          })}
        </div>
        <Button
          onClick={confirmNewRange}
          disabled={isDisabled}
          className="shrink-0 bg-magenta px-2 py-1 text-center text-xs text-text disabled:opacity-40 md:px-4 md:text-base"
        >
          {isSM ? "Apply" : "Apply Range"}
        </Button>
      </div>
    </div>
  );
};

export default GameweekSlider;

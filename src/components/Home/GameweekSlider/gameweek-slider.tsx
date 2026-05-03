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

// Quick-pick chips covering the 80% of cases where users just want a
// recent window without precisely dragging two thumbs on a phone. "All"
// maps to the season-to-date span (1..max), not 1..38, so a click in
// GW 5 doesn't dilute the data with 33 unplayed rounds.
type Preset = {
  label: string;
  range: (max: number) => { start: number; end: number };
};
const PRESETS: Preset[] = [
  { label: "Last 3", range: (max) => ({ start: Math.max(1, max - 2), end: max }) },
  { label: "Last 5", range: (max) => ({ start: Math.max(1, max - 4), end: max }) },
  { label: "Last 10", range: (max) => ({ start: Math.max(1, max - 9), end: max }) },
  { label: "All", range: (max) => ({ start: 1, end: max }) },
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
      <div className="flex w-full items-center">
        <h1 className="mb-1 mr-2 whitespace-nowrap text-center text-sm text-text md:mb-2 md:mr-6 md:text-xl">
          Gameweek Range
        </h1>
        <div className="flex w-full items-center justify-between gap-4 md:gap-8">
          <SliderPrimitive.Root
            value={currentRange}
            min={1}
            max={maxGameweek || TOTAL_GAMEWEEKS_COUNT}
            step={1}
            minStepsBetweenThumbs={1}
            onValueChange={onValueChange}
            aria-label="Gameweek range"
            className="relative flex h-5 w-full touch-none items-center"
          >
            <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-white dark:bg-magenta">
              <SliderPrimitive.Range className="absolute h-full rounded-full bg-magenta dark:bg-white" />
            </SliderPrimitive.Track>
            {/* 20px thumbs on every breakpoint (was 12px on mobile) — a
                comfortable touch target on a phone, still discreet on
                desktop. */}
            <SliderPrimitive.Thumb className="relative block h-5 w-5 rounded-full bg-magenta focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-2 dark:bg-white">
              <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-text md:-bottom-8 md:text-base">
                {currentRange[0]}
              </p>
            </SliderPrimitive.Thumb>
            <SliderPrimitive.Thumb className="relative block h-5 w-5 rounded-full bg-magenta focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-2 dark:bg-white">
              <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-text md:-bottom-8 md:text-base">
                {currentRange[1]}
              </p>
            </SliderPrimitive.Thumb>
          </SliderPrimitive.Root>
          <Button
            onClick={confirmNewRange}
            disabled={isDisabled}
            className="bg-magenta px-2 py-1 text-center text-sm text-text disabled:opacity-40 md:px-4 md:text-base"
          >
            {isSM ? "Apply" : "Apply Range"}
          </Button>
        </div>
      </div>
      {/* Quick-pick presets. Auto-apply on click — no Apply press needed
          since chips are explicit one-tap actions, not exploratory drags. */}
      <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 md:mt-4 md:gap-2">
        {PRESETS.map((preset) => {
          const max = maxGameweek || TOTAL_GAMEWEEKS_COUNT;
          const range = preset.range(max);
          const active =
            range.start === startGameweek && range.end === endGameweek;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyRange(range.start, range.end)}
              className={clsx(
                "rounded-md px-2 py-0.5 text-xs font-medium transition-colors md:px-2.5 md:text-sm",
                active
                  ? "bg-magenta text-text"
                  : "bg-magenta2/60 text-text/80 hover:bg-magenta2",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameweekSlider;

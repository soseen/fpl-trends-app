import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import * as SliderPrimitive from "@radix-ui/react-slider";
import clsx from "clsx";

import type { RootState, AppDispatch } from "src/redux/store";
import { setGameweekRange } from "src/redux/slices/gameweeksSlice";
import { TOTAL_GAMEWEEKS_COUNT } from "src/utils/constants";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import { Skeleton } from "@/components/ui/skeleton";

// `?gw=5-12` round-trip helpers. Bounds validate against the live
// `maxGameweek` so a stale share-link silently falls back to the default
// range instead of breaking the app.
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

type Preset = {
  shortLabel: string;
  longLabel: string;
  range: (max: number) => { start: number; end: number };
};
const PRESETS: Preset[] = [
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

const TICKS = [5, 10, 15, 20, 25, 30, 35];

const GameweekSlider = () => {
  const { status } = useAppInitContext();
  const { startGameweek, endGameweek, maxGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentRange, setCurrentRange] = useState<[number, number]>([
    startGameweek || 1,
    endGameweek || 1,
  ]);

  // Mirror redux → local slider state whenever redux updates externally
  // (preset click, URL sync, future tab-sync).
  useEffect(() => {
    if (startGameweek && endGameweek) {
      setCurrentRange([startGameweek, endGameweek]);
    }
  }, [startGameweek, endGameweek]);

  // One-shot URL → redux sync. Wait until `maxGameweek` is settled —
  // the store auto-init populates it once the footballers fetch
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

  const onValueChange = (value: number[]) => {
    const [a, b] = value;
    if (typeof a === "number" && typeof b === "number") {
      setCurrentRange([a, b]);
    }
  };

  const applyRange = (start: number, end: number) => {
    dispatch(setGameweekRange({ start, end }));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("gw", `${start}-${end}`);
        return next;
      },
      { replace: true },
    );
  };

  const onValueCommit = (value: number[]) => {
    const [a, b] = value;
    if (typeof a === "number" && typeof b === "number") {
      applyRange(a, b);
    }
  };

  if (status === AppInitStatus.loading)
    return (
      <div className="flex h-2 w-full items-center px-2 pb-2 md:px-4 md:pb-3">
        <Skeleton className="h-2 w-full md:h-3" />
      </div>
    );

  const max = maxGameweek || TOTAL_GAMEWEEKS_COUNT;

  return (
    <div className="px-2 pb-1.5 md:px-4 md:pb-2.5">
      <div className="flex w-full items-center gap-2 md:gap-4">
        {/* Fixed-width heading so the slider doesn't shift as digit count
            changes. tabular-nums + min-width on the value reserves enough
            room for the widest possible "NN–NN" rendering. */}
        <h1 className="flex shrink-0 items-baseline whitespace-nowrap text-xs font-medium text-text md:text-base">
          <span className="md:hidden">GW</span>
          <span className="hidden md:inline">Gameweek</span>
          <span className="ml-1.5 inline-block min-w-[42px] text-center font-semibold tabular-nums text-magenta md:ml-2 md:min-w-[58px]">
            {currentRange[0]}–{currentRange[1]}
          </span>
        </h1>

        <SliderPrimitive.Root
          value={currentRange}
          min={1}
          max={max}
          step={1}
          minStepsBetweenThumbs={1}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
          aria-label="Gameweek range"
          className="group relative flex h-7 min-w-0 flex-1 touch-none items-center md:h-9"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-accent3">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-magenta/80" />
            {TICKS.map((tick) => {
              if (tick >= max) return null;
              const percent = ((tick - 1) / (max - 1)) * 100;
              const inRange =
                tick >= currentRange[0] && tick <= currentRange[1];
              return (
                <span
                  key={tick}
                  aria-hidden
                  style={{
                    left: `${percent}%`,
                    backgroundColor: inRange
                      ? "rgb(255 255 255 / 0.95)"
                      : "rgb(201 197 197 / 0.35)",
                  }}
                  className="pointer-events-none absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
                />
              );
            })}
          </SliderPrimitive.Track>

          <SliderPrimitive.Thumb
            className="relative block h-[18px] w-[18px] rounded-full bg-magenta shadow-md ring-2 ring-magenta/30 before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:content-[''] focus:outline-none focus-visible:ring-4 focus-visible:ring-magenta/50"
            aria-label="Start gameweek"
          >
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-magenta px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-md group-focus-within:opacity-100 group-hover:opacity-100">
              {currentRange[0]}
            </span>
          </SliderPrimitive.Thumb>
          <SliderPrimitive.Thumb
            className="relative block h-[18px] w-[18px] rounded-full bg-magenta shadow-md ring-2 ring-magenta/30 before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:content-[''] focus:outline-none focus-visible:ring-4 focus-visible:ring-magenta/50"
            aria-label="End gameweek"
          >
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-magenta px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-md group-focus-within:opacity-100 group-hover:opacity-100">
              {currentRange[1]}
            </span>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>

        <div className="flex shrink-0 items-center gap-1 md:gap-1.5">
          {PRESETS.map((preset) => {
            const range = preset.range(max);
            const active = range.start === startGameweek && range.end === endGameweek;
            return (
              <button
                key={preset.longLabel}
                type="button"
                onClick={() => applyRange(range.start, range.end)}
                className={clsx(
                  "rounded-md px-2 py-0.5 text-xs font-medium transition-colors md:px-2.5 md:text-sm",
                  active
                    ? "bg-accent3 text-magenta"
                    : "bg-accent3/30 text-text/70 hover:bg-accent3/60 hover:text-text",
                )}
              >
                <span className="md:hidden">{preset.shortLabel}</span>
                <span className="hidden md:inline">{preset.longLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameweekSlider;

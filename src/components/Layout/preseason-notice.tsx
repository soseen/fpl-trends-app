import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  ShieldAlert,
  Sparkles,
  Swords,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SeasonStart } from "src/utils/season";

const hasSeenNotice = (storageKey: string) => {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(storageKey) === "seen";
  } catch {
    return false;
  }
};

const rememberNotice = (storageKey: string) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(storageKey, "seen");
  } catch {
    // The notice still works when browser storage is unavailable.
  }
};

type PreseasonNoticeProps = {
  seasonStart: SeasonStart;
  analysisSeasonLabel: string | null;
};

const PreseasonNotice = ({ seasonStart, analysisSeasonLabel }: PreseasonNoticeProps) => {
  const noticeStorageKey = `${seasonStart.storageKey}:analytics`;
  const [open, setOpen] = useState(() => !hasSeenNotice(noticeStorageKey));
  const statsSeason = analysisSeasonLabel ?? "previous season";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) rememberNotice(noticeStorageKey);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Preseason mode using ${statsSeason} performance data. Premier League starts ${seasonStart.date} at ${seasonStart.kickoffTime}. Open details.`}
          className="group flex w-full items-center gap-3 border-t border-accent4/70 bg-accent5 px-3 py-2 text-left transition-colors hover:bg-accent3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-magenta md:px-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-magenta/35 bg-magenta/10 text-magenta">
            <ShieldAlert className="h-4 w-4" aria-hidden />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-text sm:text-sm">
              Preseason mode
            </span>
            <span className="block truncate text-[11px] text-text/55 sm:text-xs">
              <span className="sm:hidden">
                {statsSeason} stats · {seasonStart.seasonLabel} prices
              </span>
              <span className="hidden sm:inline">
                Using {statsSeason} performance with {seasonStart.seasonLabel} prices,
                clubs and fixtures
              </span>
            </span>
          </span>

          <span className="hidden shrink-0 items-center gap-2 rounded-md bg-background/55 px-2.5 py-1.5 text-xs font-medium text-highlight lg:flex">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {seasonStart.shortDate}
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-text/35 transition-transform group-hover:translate-x-0.5 group-hover:text-highlight"
            aria-hidden
          />
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100vh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto overflow-x-hidden border border-magenta/40 bg-primary p-0 text-text shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-magenta via-magenta2 to-highlight"
        />
        <div
          aria-hidden
          className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-magenta/10 blur-3xl"
        />

        <div className="relative p-5 sm:p-7">
          <DialogHeader className="items-center text-center">
            <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-magenta/40 bg-magenta/10 text-magenta shadow-[0_0_35px_rgba(199,30,77,0.22)]">
              <ShieldAlert className="h-8 w-8" aria-hidden />
              <Sparkles
                className="absolute -right-2 -top-2 h-5 w-5 text-highlight"
                aria-hidden
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-highlight">
              Preseason analytics
            </p>
            <DialogTitle className="text-2xl leading-tight text-text sm:text-3xl">
              Last season&apos;s signal. This season&apos;s squad.
            </DialogTitle>
            <DialogDescription className="max-w-md pt-2 leading-6 text-text/70">
              No {seasonStart.seasonLabel} matches have been played yet, so player
              analytics use {statsSeason} totals while prices, clubs, availability and
              upcoming fixtures stay current.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-3 rounded-xl border border-accent4 bg-background/50 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-magenta" aria-hidden />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text/50">
                  Analytics season
                </p>
                <p className="text-sm font-semibold text-text">{statsSeason}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:border-l sm:border-accent4 sm:pl-4">
              <Clock3 className="h-5 w-5 shrink-0 text-highlight" aria-hidden />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text/50">
                  New season starts
                </p>
                <p className="text-sm font-semibold text-text">
                  {seasonStart.shortDate} · {seasonStart.kickoffTime}
                </p>
              </div>
            </div>
          </div>

          {seasonStart.openingFixture && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-accent3/60 px-3 py-2.5 text-sm text-text/80">
              <Swords className="h-4 w-4 shrink-0 text-highlight" aria-hidden />
              <span>
                First fixture:{" "}
                <strong className="font-semibold text-text">
                  {seasonStart.openingFixture}
                </strong>
              </span>
            </div>
          )}

          <div className="mt-4 space-y-2 text-xs leading-5 text-text/60">
            <p>
              Best XI, Players, Compare and the metric map are ready for preseason
              research. Players without prior Premier League history show zeroes.
            </p>
            <p>
              Gameweek-level charts, team trends and My Trends will return when current
              match data is available.
            </p>
          </div>

          <DialogFooter className="mt-6 sm:justify-center">
            <DialogClose asChild>
              <Button className="h-10 bg-magenta px-6 text-white hover:bg-magenta2">
                Explore preseason stats
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreseasonNotice;

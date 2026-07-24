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
};

const PreseasonNotice = ({ seasonStart }: PreseasonNoticeProps) => {
  const [open, setOpen] = useState(() => !hasSeenNotice(seasonStart.storageKey));

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) rememberNotice(seasonStart.storageKey);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`No match data yet. Premier League starts ${seasonStart.date} at ${seasonStart.kickoffTime}. Open details.`}
          className="group flex w-full items-center gap-3 border-t border-accent4/70 bg-accent5 px-3 py-2 text-left transition-colors hover:bg-accent3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-magenta md:px-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-magenta/35 bg-magenta/10 text-magenta">
            <ShieldAlert className="h-4 w-4" aria-hidden />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-text sm:text-sm">
              No match data yet
            </span>
            <span className="block truncate text-[11px] text-text/55 sm:text-xs">
              <span className="sm:hidden">
                PL starts {seasonStart.shortDate} · {seasonStart.kickoffTime}
              </span>
              <span className="hidden sm:inline">
                The {seasonStart.seasonLabel} Premier League season starts{" "}
                {seasonStart.date} at {seasonStart.kickoffTime}
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
              Season warm-up
            </p>
            <DialogTitle className="text-2xl leading-tight text-text sm:text-3xl">
              The pitch is ready. The data isn&apos;t—yet.
            </DialogTitle>
            <DialogDescription className="max-w-md pt-2 leading-6 text-text/70">
              The {seasonStart.seasonLabel} FPL season is live, but no Premier League
              matches have been played. Trends, comparisons, and player form will fill in
              as soon as results start rolling in.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-3 rounded-xl border border-accent4 bg-background/50 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-magenta" aria-hidden />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text/50">
                  Season starts
                </p>
                <p className="text-sm font-semibold text-text">{seasonStart.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:border-l sm:border-accent4 sm:pl-4">
              <Clock3 className="h-5 w-5 shrink-0 text-highlight" aria-hidden />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text/50">
                  Kick-off · your time
                </p>
                <p className="text-sm font-semibold text-text">
                  {seasonStart.kickoffTime}
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
              You can still explore the app, but analytics may be empty or show zeroes
              before kick-off.
            </p>
            <p>
              The gameweek range will return here automatically once live match data is
              available.
            </p>
          </div>

          <DialogFooter className="mt-6 sm:justify-center">
            <DialogClose asChild>
              <Button className="h-10 bg-magenta px-6 text-white hover:bg-magenta2">
                Got it — see you at kick-off
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreseasonNotice;

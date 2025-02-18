import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Dialog } from "radix-ui";
import React from "react";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { RootState } from "src/redux/store";
import { getFootballersImage, getTeamsBadge } from "src/utils/images";
import FootballerUpcomingFixtures from "./footballer-upcoming-fixtures";

type Props = {
  footballer: FootballerWithGameweekStats | null;
  onClose: () => void;
};

const FootballerDetailsModal = ({ footballer, onClose }: Props) => {
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  return (
    <Dialog open={!!footballer} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[9999] bg-black/60" />
        <DialogContent
          forceMount
          className="container fixed left-1/2 top-1/2 z-[99999] w-[90%] -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-background px-12 py-6 text-text shadow-lg lg:px-20"
        >
          <div className="w-full flex-col items-center">
            <div className="relative flex gap-4 lg:gap-8">
              <img
                src={getFootballersImage(footballer?.code)}
                className="h-auto w-48 rounded-md object-cover lg:w-64"
              />
              {footballer?.in_dreamteam && (
                <FaStar className="absolute left-2 top-2 h-6 w-6 text-yellow-500" />
              )}
              <div className="flex flex-grow flex-col items-center gap-4 py-8 text-text">
                <div className="flex items-center gap-4">
                  <img
                    src={getTeamsBadge(footballer?.team_code)}
                    className="h-auto w-10 object-cover"
                  />
                  <h2 className="text-center text-xl lg:text-3xl">
                    {footballer?.first_name} {footballer?.second_name}
                  </h2>
                </div>
                <div className="flex w-full items-center justify-around">
                  <div className="flex-col shadow-sm">
                    <h3 className="mx-6 rounded-t-md bg-magenta px-4 pb-1 pt-1 text-center text-text">
                      Season Stats
                    </h3>
                    <div className="flex items-center gap-1 rounded-md bg-accent3 px-4 pb-2 pt-4 shadow-lg">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm">Points</p>
                        <p>{footballer?.total_points}</p>
                      </div>
                      <span className="mx-3 block h-6 w-[1px] rounded-md bg-text align-middle opacity-10" />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm">Goals</p>
                        <p>{footballer?.goals_scored}</p>
                      </div>
                      <span className="mx-3 block h-6 w-[1px] rounded-md bg-text align-middle opacity-10" />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm">Assists</p>
                        <p>{footballer?.assists}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-col shadow-sm">
                    <h3 className="mx-6 rounded-t-md bg-magenta px-4 pb-1 pt-1 text-center text-text">
                      GW {startGameweek}-{endGameweek}
                    </h3>
                    <div className="flex items-center gap-1 rounded-md bg-accent3 px-4 pb-2 pt-4 shadow-lg">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm">Points</p>
                        <p>{footballer?.totalPoints}</p>
                      </div>
                      <span className="mx-3 block h-6 w-[1px] rounded-md bg-text align-middle opacity-10" />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm">Goals</p>
                        <p>{footballer?.totalGoals}</p>
                      </div>
                      <span className="mx-3 block h-6 w-[1px] rounded-md bg-text align-middle opacity-10" />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm">Assists</p>
                        <p>{footballer?.totalAssists}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <FootballerUpcomingFixtures />
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default FootballerDetailsModal;

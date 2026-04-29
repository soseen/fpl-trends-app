import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaStar, FaUserCircle } from "react-icons/fa";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { getFootballersImage, getTeamsBadge } from "src/utils/images";
import FootballerUpcomingFixtures from "./footballer-upcoming-fixtures";
import clsx from "clsx";
import { mapElementTypeToPosition, roundToThousands } from "src/utils/strings";
import FootballerDetailsStatsPanel from "./footballer-details-stats-panel";
import FootballerDetailsHistory from "./footballer-details-history";
import FootballerDetailsChart from "./FootballerDetailsChart/footballer-details-chart";

type Props = {
  footballer: FootballerWithGameweekStats | null;
  onClose: () => void;
};

const FootballerDetailsModal = ({ footballer, onClose }: Props) => {
  const [isError, setIsError] = useState(false);
  const info = useMemo(() => {
    const price = footballer?.now_cost ? footballer.now_cost / 10 : 0;
    const position = mapElementTypeToPosition(footballer?.element_type);
    const isTransfersIn = !!(
      (footballer?.transfers_in_event ?? 0) > (footballer?.transfers_out_event ?? 0)
    );
    const transfersCount =
      (isTransfersIn
        ? footballer?.transfers_in_event
        : footballer?.transfers_out_event) || 0;
    return {
      price,
      position,
      isTransfersIn,
      transfersCount,
    };
  }, [footballer]);

  return (
    <Dialog open={!!footballer} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[9999] bg-black/60" />
        <DialogTitle>{footballer?.web_name}</DialogTitle>
        <DialogContent
          forceMount
          aria-describedby={undefined}
          // Override the default DialogContent positioning. We don't want
          // the shadcn defaults (`grid w-full p-6 sm:rounded-lg border`)
          // because they constrain the modal to grid layout and stretch
          // it full-width; the player view has its own internal scrolling
          // container. We DO need the standard 50/50 + translate centering
          // — `inset-0 w-fit` was fighting the translates and parking the
          // modal in the top-left corner.
          className="fixed left-1/2 top-1/2 z-[99999] w-fit max-w-[95vw] -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 text-text shadow-lg"
        >
          <div className="max-h-[85vh] w-full flex-col items-center overflow-y-auto rounded-md bg-background px-6 py-6 sm:px-12 lg:max-w-[1060px] lg:px-20">
            <div className="relative flex items-end justify-around gap-4 lg:gap-8">
              {isError ? (
                <FaUserCircle className="mb-8 h-12 w-12 object-contain text-accent shadow-md lg:h-72 lg:w-72" />
              ) : (
                <img
                  src={getFootballersImage(footballer?.code)}
                  className="h-auto w-auto object-contain md:h-44 md:w-44 lg:h-72 lg:w-72"
                  onError={() => setIsError(true)}
                />
              )}

              {footballer?.in_dreamteam && (
                <FaStar className="absolute left-2 top-2 h-6 w-6 text-yellow-500" />
              )}
              <div className="flex flex-col gap-4 py-8 text-text">
                <div className="flex items-center gap-4">
                  <img
                    src={getTeamsBadge(footballer?.team_code)}
                    className="h-auto w-10 object-cover"
                  />
                  <h2 className="text-center text-xl lg:text-3xl">
                    {footballer?.first_name} {footballer?.second_name}
                  </h2>
                  <p className="flex items-center justify-center rounded-md bg-magenta2 p-2 shadow-md">
                    {footballer?.selected_by_percent}%
                  </p>
                </div>
                <div className="flex w-fit gap-4">
                  {footballer?.now_cost && (
                    <div className="flex flex-col items-center justify-center">
                      <span className="">£{info.price}m</span>
                    </div>
                  )}
                  <div className="w-fit rounded-md bg-magenta2 px-4 py-[2px] text-sm shadow-md">
                    {info.position}
                  </div>
                  <span
                    className={clsx(
                      "flex items-center gap-[2px]",
                      info.isTransfersIn ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {info.isTransfersIn ? (
                      <FaArrowUp className="mb-[1px] rotate-45" />
                    ) : (
                      <FaArrowDown className="mb-[1px] -rotate-45" />
                    )}
                    {roundToThousands(info.transfersCount)}
                  </span>
                </div>
                <FootballerDetailsStatsPanel footballer={footballer} />
                <FootballerUpcomingFixtures footballer={footballer} />
              </div>
            </div>
            <span className="flex flex-grow justify-center rounded-t-sm bg-magenta3 py-1 text-center text-lg text-text" />
            <FootballerDetailsHistory footballer={footballer} />
            <div className="mt-8 flex flex-col gap-4">
              <FootballerDetailsChart footballer={footballer} />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default FootballerDetailsModal;

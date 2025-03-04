import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import React, { useMemo } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { AiFillCloseCircle as CloseIcon } from "react-icons/ai";
import FootballerImage from "../FootballerImage/footballer-image";
import { FaArrowDown, FaArrowUp, FaStar } from "react-icons/fa";
import { getTeamsBadge } from "src/utils/images";
import { mapElementTypeToPosition, roundToThousands } from "src/utils/strings";
import clsx from "clsx";
import FootballerDetailsStatsPanel from "./footballer-details-stats-panel";
import FootballerUpcomingFixtures from "./footballer-upcoming-fixtures";
import FootballerDetailsHistory from "./footballer-details-history";
import FootballerDetailsChart from "./FootballerDetailsChart/footballer-details-chart";
import { DialogTitle } from "@radix-ui/react-dialog";

type Props = {
  footballer: FootballerWithGameweekStats | null;
  onClose: () => void;
};

const FootballerDetailsDrawer = ({ footballer, onClose }: Props) => {
  const info = useMemo(() => {
    const price = footballer?.now_cost ? footballer.now_cost / 10 : 0;
    const position = mapElementTypeToPosition(footballer?.element_type);
    const isTransfersIn = !!(
      (footballer?.transfers_in ?? 0) > (footballer?.transfers_out ?? 0)
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

  const name = useMemo(
    () =>
      ((footballer?.first_name ?? "") + (footballer?.second_name ?? "")).length > 15
        ? footballer?.web_name
        : `${footballer?.first_name} ${footballer?.second_name}`,
    [footballer],
  );

  if (!footballer) return null;
  return (
    <Drawer open={!!footballer} direction="right" onClose={onClose}>
      <DrawerContent
        className="inset-0 z-[300] h-full w-full overflow-x-hidden px-2 pt-3 text-text"
        aria-describedby={undefined}
      >
        <DialogTitle className="hidden">{footballer?.web_name}</DialogTitle>
        <Button
          className="absolute right-1 top-1 box-content bg-transparent p-0 text-text opacity-70 hover:opacity-100"
          onClick={onClose}
        >
          <CloseIcon className="h-5 w-5 text-magenta" />
        </Button>
        <div className="w-full flex-col items-center overflow-y-auto overflow-x-hidden rounded-md px-2 py-6">
          <div className="relative flex w-full items-center justify-center gap-4 bg-secondary px-2 pt-4">
            <FootballerImage
              code={footballer?.code}
              className="h-auto w-28 self-end rounded-none md:h-auto md:w-32"
            />

            {footballer?.in_dreamteam && (
              <FaStar className="absolute left-3 top-3 h-3 w-3 text-yellow-500" />
            )}
            <div className="flex flex-col gap-1 py-2 text-text">
              <div className="flex w-min items-center gap-2">
                <img
                  src={getTeamsBadge(footballer?.team_code)}
                  className="h-8 w-8 object-contain"
                />
                <h2 className="whitespace-nowrap text-center text-sm">{name}</h2>
                <p className="flex items-center justify-center rounded-md bg-magenta2 p-1 text-xs shadow-md">
                  {footballer?.selected_by_percent}%
                </p>
              </div>
              <div className="flex w-fit gap-2 text-xs">
                {footballer?.now_cost && (
                  <div className="flex flex-col items-center justify-center">
                    <span className="">£{info.price}m</span>
                  </div>
                )}
                <div className="w-fit rounded-md bg-magenta2 px-2 py-[1px] text-xs shadow-md">
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
            </div>
          </div>
          <span className="flex flex-grow justify-center rounded-t-sm bg-magenta3 py-1 text-center text-lg text-text" />
          <div className="m-auto my-2 w-fit justify-center">
            <FootballerUpcomingFixtures footballer={footballer} max={10} />
          </div>

          <FootballerDetailsHistory footballer={footballer} />
          <div className="mt-8 flex flex-col gap-4">
            <FootballerDetailsChart footballer={footballer} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FootballerDetailsDrawer;

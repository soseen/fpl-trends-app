import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import FootballerAvatar from "../FootballerAvatar/footballer-avatar";
import { AnimatePresence, motion } from "motion/react";
import { roundToThousands } from "src/utils/strings";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import clsx from "clsx";

const MAX_TRANSFER_CHIPS = 6;

const TransfersPanel = () => {
  const { list } = useSelector((state: RootState) => state.footballers);
  const [displayMostTransferredIn, setDisplayMostTransferredIn] = useState(true);

  const footballersData = useMemo(() => {
    const footballersToDisplay = [...list]
      .sort((a, b) =>
        displayMostTransferredIn
          ? b.transfers_in_event - a.transfers_in_event
          : b.transfers_out_event - a.transfers_out_event,
      )
      .slice(0, MAX_TRANSFER_CHIPS);

    return footballersToDisplay;
  }, [list, displayMostTransferredIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMostTransferredIn((prev) => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const isTransfersIn = displayMostTransferredIn;

  return (
    <div className="hidden h-[64px] w-full overflow-hidden border-b border-accent4/70 bg-accent5 px-4 py-2 md:flex">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="flex min-w-0 flex-1 items-center gap-6 px-3"
          key={isTransfersIn ? "transfers-in" : "transfers-out"}
        >
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-md",
                isTransfersIn
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400",
              )}
            >
              {isTransfersIn ? (
                <FaArrowUp className="h-3.5 w-3.5 rotate-45" />
              ) : (
                <FaArrowDown className="h-3.5 w-3.5 -rotate-45" />
              )}
            </span>
            <div className="leading-4">
              <p className="text-[10px] font-semibold uppercase text-text/45">Market</p>
              <p className="whitespace-nowrap text-xs font-semibold text-text">
                {isTransfersIn ? "Most bought" : "Most sold"}
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="ml-auto flex min-w-0 items-center justify-end gap-3 lg:gap-4 xl:gap-5">
              {footballersData.map((footballer, index) => {
                const transfersCount = isTransfersIn
                  ? footballer.transfers_in_event
                  : footballer.transfers_out_event;

                return (
                  <div
                    key={footballer.id}
                    className={clsx(
                      "min-w-0 shrink-0 items-center gap-2 rounded-md bg-accent2/85 px-2.5 py-1 shadow-sm ring-1 ring-inset ring-accent4/40",
                      index < 2
                        ? "flex"
                        : index < 4
                          ? "hidden lg:flex"
                          : index === 4
                            ? "hidden xl:flex"
                            : "hidden 2xl:flex",
                    )}
                  >
                    <FootballerAvatar
                      footballer={footballer}
                      size={42}
                      className="rounded-none bg-transparent"
                      imageClassName="rounded-none object-contain"
                    />
                    <div className="min-w-0 leading-4">
                      <p className="max-w-20 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-text lg:max-w-24 2xl:max-w-32">
                        {footballer.web_name}
                      </p>
                      <p className="whitespace-nowrap text-[10px] text-text/50">
                        {footballer.selected_by_percent}%
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "ml-1 flex items-center gap-1 rounded-sm px-1.5 py-[2px] text-xs font-semibold",
                        isTransfersIn
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400",
                      )}
                    >
                      {isTransfersIn ? (
                        <FaArrowUp className="h-2.5 w-2.5 rotate-45" />
                      ) : (
                        <FaArrowDown className="h-2.5 w-2.5 -rotate-45" />
                      )}
                      {roundToThousands(transfersCount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TransfersPanel;

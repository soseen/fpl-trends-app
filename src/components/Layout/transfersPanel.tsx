import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import FootballerAvatar from "../FootballerAvatar/footballer-avatar";
import { AnimatePresence, motion } from "motion/react";
import { roundToThousands } from "src/utils/strings";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useDimensions } from "src/hooks/use-dimensions";

const TransfersPanel = () => {
  const { list, error, status } = useSelector((state: RootState) => state.footballers);
  const [displayMostTransferredIn, setDisplayMostTransferredIn] = useState(true);
  const { isSM, isMD } = useDimensions();

  const footballersData = useMemo(() => {
    const footballersToDisplay = [...list]
      .sort((a, b) =>
        displayMostTransferredIn
          ? b.transfers_in_event - a.transfers_in_event
          : b.transfers_out_event - a.transfers_out_event,
      )
      .slice(0, isMD ? 3 : 5);

    return footballersToDisplay;
  }, [list, displayMostTransferredIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMostTransferredIn((prev) => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-[52px] justify-around bg-accent2 p-2">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex w-full justify-around"
          key={displayMostTransferredIn ? "transfers-in" : "transfers-out"}
        >
          {footballersData.map((footballer) => (
            <div
              key={footballer.id}
              className="flex items-center justify-center gap-1 md:gap-2"
            >
              <FootballerAvatar footballer={footballer} size={isSM ? 24 : 40} />
              <p className="whitespace-nowrap text-text">{`${footballer.web_name} ${isSM ? "" : `(${footballer.selected_by_percent}%)`}`}</p>
              {displayMostTransferredIn ? (
                <FaArrowUp className="rotate-45 text-green-600" />
              ) : (
                <FaArrowDown className="-rotate-45 text-red-600" />
              )}
              <p
                className={`${displayMostTransferredIn ? "text-green-600" : "text-red-600"}`}
              >
                {roundToThousands(
                  displayMostTransferredIn
                    ? footballer.transfers_in_event
                    : footballer.transfers_out_event,
                )}
              </p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TransfersPanel;

import React from "react";
import { BestXGIFootballer } from "./useBestXGIFootballers";
import { isSM } from "src/utils/dimensions";
import FootballerAvatar from "src/components/FootballerAvatar/footballer-avatar";
import { FaFutbol, FaHandshake } from "react-icons/fa";

type Props = {
  footballer: BestXGIFootballer;
};

const FootballerCard = ({ footballer }: Props) => {
  return (
    <div
      key={footballer.id}
      className="relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-accent2 bg-secondary p-4 pb-24 text-center shadow-xl md:gap-4"
    >
      <FootballerAvatar footballer={footballer} size={isSM() ? 40 : 140} />
      <div className="md:text-md absolute -left-3 top-2 w-16 rotate-[-35deg] rounded-md bg-magenta px-1 py-1 text-xs font-bold text-white shadow-md">
        {footballer.xGIperGame.toFixed(2)} xGI
      </div>
      <div className="absolute bottom-10 left-0 flex flex-col gap-2">
        <div className="flex w-20 items-center justify-end gap-4 rounded-r-md bg-accent2 px-4 py-1 text-xs text-text shadow-xl md:text-base">
          {footballer.totalGoals} <FaFutbol />
        </div>
        <div className="flex w-20 items-center justify-end gap-4 rounded-r-md bg-accent2 px-4 py-1 text-xs text-text shadow-xl md:text-base">
          {footballer.totalAssists} <FaHandshake />
        </div>
      </div>
      <p className="absolute -bottom-2 w-1/2 overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-magenta px-1 text-sm text-text shadow-md md:text-base">
        {footballer.web_name}
      </p>
    </div>
  );
};

export default FootballerCard;

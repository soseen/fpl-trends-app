import React from "react";
import CompareToolFootballerCard from "./compare-tool-footballer-card";
import { Button } from "@/components/ui/button";
import { FaPlus, FaTools } from "react-icons/fa";
import { useCompareTool } from "./use-compare-tool";

const CompareTool = () => {
  const {
    footballersComparisonArray,
    setSelectedFootballers,
    canAddNewCard,
    addFootballer,
    removeFootballer,
    openFootballersProfile,
  } = useCompareTool();

  return (
    <div className="text-md mt-4 w-full rounded-sm bg-accent3 p-2 pb-4 md:text-base lg:pb-8 lg:text-xl">
      <h1 className="flex items-center gap-2 text-text">
        Comparison Tool <FaTools className="text-magenta" />
      </h1>
      <div className="mt-4 flex w-full items-center justify-center gap-4 lg:mt-8 lg:gap-8">
        {footballersComparisonArray.map((selectedFootballer, index) => (
          <CompareToolFootballerCard
            key={index}
            index={index}
            footballer={selectedFootballer}
            selectedFootballers={footballersComparisonArray}
            addFootballer={addFootballer}
            removeFootballer={removeFootballer}
            openFootballersProfile={openFootballersProfile}
          />
        ))}
        {canAddNewCard && (
          <div className="lg:h relative flex h-[140px] self-start md:h-[210px] lg:h-[260px] xl:h-[310px]">
            <Button
              className="bg-transparent p-0"
              onClick={() => setSelectedFootballers((current) => [...current, null])}
            >
              <FaPlus className="h-5 w-5 rounded-full bg-magenta p-1 text-text shadow-md md:h-8 md:w-8" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareTool;

import React from "react";
import CompareToolFootballerCard from "./compare-tool-footballer-card";
import { Button } from "@/components/ui/button";
import { FaPlus, FaTools } from "react-icons/fa";
import { useCompareTool } from "./use-compare-tool";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import CompareToolSkeleton from "./compare-tool.skeleton";
import CompareToolRankings from "./compare-tool-rankings";

const CompareTool = () => {
  const {
    footballersComparisonArray,
    setSelectedFootballers,
    canAddNewCard,
    validFootballers,
    bestAttributes,
    addFootballer,
    removeFootballer,
    openFootballersProfile,
  } = useCompareTool();
  const { status } = useAppInitContext();

  if (status === AppInitStatus.loading) return <CompareToolSkeleton />;

  return (
    <div className="text-md mt-4 flex w-full flex-col rounded-sm bg-accent3 p-2 pb-4 text-text md:text-base lg:pb-8 lg:text-xl">
      <h1 className="flex items-center gap-2">
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
      {validFootballers.length >= 2 && (
        <CompareToolRankings
          selectedFootballers={footballersComparisonArray}
          bestAttributes={bestAttributes}
        />
      )}
    </div>
  );
};

export default CompareTool;

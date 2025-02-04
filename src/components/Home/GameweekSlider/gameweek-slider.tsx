import { Slider } from "@/components/ui/slider";
import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "src/redux/store";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { setGameweekRange } from "src/redux/slices/gameweeksSlice";
import { Button } from "@/components/ui/button";
import { isSM } from "src/utils/dimensions";

const GameweekSlider = () => {
  const { startGameweek, endGameweek, maxGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const dispatch = useDispatch<AppDispatch>();

  const [currentRange, setCurrentRange] = useState<[number, number]>([
    startGameweek || 1,
    endGameweek || 1,
  ]);

  useEffect(() => {
    if (startGameweek && endGameweek) {
      setCurrentRange([startGameweek, endGameweek]);
    }
  }, [startGameweek, endGameweek]);

  const isDisabled = useMemo(
    () => currentRange[0] === startGameweek && currentRange[1] === endGameweek,
    [startGameweek, endGameweek, currentRange],
  );

  const onValueChange = (value: number[]) => {
    if (value.length === 2) {
      setCurrentRange([value[0], value[1]]);
    }
  };

  const confirmNewRange = () => {
    dispatch(setGameweekRange({ start: currentRange[0], end: currentRange[1] }));
  };

  return (
    <div className="w-full flex-col items-center px-4">
      <h1 className="mb-4 text-center text-sm text-text md:text-xl">
        Select Gameweek Range
      </h1>
      <div className="flex w-full items-center gap-4 md:gap-8">
        <SliderPrimitive.Root
          value={currentRange}
          min={1}
          max={maxGameweek || 38}
          step={1}
          minStepsBetweenThumbs={1}
          onValueChange={onValueChange}
          aria-label="value"
          className="relative flex h-5 w-full touch-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-white dark:bg-magenta">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-magenta dark:bg-white" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="relative block h-2 w-2 rounded-full bg-magenta focus:outline-none md:h-5 md:w-5 dark:bg-white">
            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-text md:-bottom-8 md:text-base">
              {currentRange[0]}
            </p>
          </SliderPrimitive.Thumb>
          <SliderPrimitive.Thumb className="relative block h-2 w-2 rounded-full bg-magenta focus:outline-none md:h-5 md:w-5 dark:bg-white">
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-text md:-bottom-8 md:text-base">
              {currentRange[1]}
            </p>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
        <Button
          onClick={confirmNewRange}
          disabled={isDisabled}
          className="bg-magenta px-2 py-1 text-sm text-text disabled:opacity-40 md:px-4 md:py-2 md:text-xl"
        >
          {isSM() ? "Apply" : "Apply Range"}
        </Button>
      </div>
    </div>
  );
};

export default GameweekSlider;

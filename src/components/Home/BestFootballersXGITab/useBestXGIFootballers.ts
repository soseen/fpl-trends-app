import { useMemo, useState } from "react";
import { useSelector } from "react-redux"
import { Footballer } from "src/queries/types";
import { RootState } from "src/redux/store"

export type BestXGIFootballer = Footballer & {
    totalXGI: number;
    totalGoals: number;
    totalAssists: number;
    xGIperGame: number;
}

export const useBestXGIFootballers = () => {

    const [isLoading, setIsLoading] = useState(false);
    const {list} = useSelector((state: RootState) => state.footballers);
    const {startGameweek, endGameweek} = useSelector((state: RootState) => state.gameweeks);

    const bestXGIFootballers: BestXGIFootballer[] = useMemo(() => {
        setIsLoading(true);
        const footballersWithXGI = list.map((footballer) => {
            const additionalInfo = footballer.history.reduce((acc, val) => val.round >=startGameweek && val.round <= endGameweek ? ({...acc, totalXGI: acc.totalXGI + parseFloat(val.expected_goal_involvements), totalGoals: acc.totalGoals + val.goals_scored, totalAssists: acc.totalAssists + val.assists}) : {...acc}, {totalXGI: 0, totalGoals: 0, totalAssists: 0});
            return {...footballer, ...additionalInfo, xGIperGame: additionalInfo.totalXGI / ((endGameweek - startGameweek) + 1)}
        })
        const result = [...footballersWithXGI].sort((a,b) => b.totalXGI - a.totalXGI).slice(0,5);
        setIsLoading(false);
        return result;

    }, [list, startGameweek, endGameweek])

    return {bestXGIFootballers, isLoading}
}

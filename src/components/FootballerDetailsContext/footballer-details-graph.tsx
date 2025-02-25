import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import React, { useMemo } from "react";

type Props = {
  footballer: FootballerWithGameweekStats | null;
};

const FootballerDetailsGraph = ({ footballer }: Props) => {
  const chartConfig: ChartConfig = {
    xGI: { color: "var(--magenta-2)", label: "xGI" },
    returns: { color: "var(--magenta-1)", label: "Returns" },
  };

  const chartData = useMemo(() => {
    const data = footballer?.history.map((h) => ({
      gw: h.round,
      xGI: h.expected_goal_involvements,
      returns: h.goals_scored + h.assists,
    }));

    return data;
  }, [footballer]);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>xGI vs Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="h-[350px] max-h-[450px] min-h-[200px] w-[900px] rounded-md bg-secondary py-4"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="gw" tickLine={false} axisLine={false} tickMargin={12} />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
                cursor={false}
              />
              <Line
                dataKey="xGI"
                type="monotone"
                stroke="var(--chart-2)"
                strokeWidth={4}
                dot={false}
              />
              <Line
                dataKey="returns"
                type="monotone"
                stroke="var(--magenta)"
                strokeWidth={4}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FootballerDetailsGraph;

'use client';

import * as React from 'react';
import { PolarGrid, PolarAngleAxis, Radar, RadarChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ChargingHabitChartProps {
  data: number[];
}

export default function ChargingHabitChart({ data: propData }: ChargingHabitChartProps) {
  const chartData = [
    { period: 'Morning', likelihood: propData[0] },
    { period: 'Afternoon', likelihood: propData[1] },
    { period: 'Evening', likelihood: propData[2] },
    { period: 'Night', likelihood: propData[3] },
    { period: 'Weekend', likelihood: propData[4] },
  ];

  const chartConfig = {
    likelihood: {
      label: 'Likelihood',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="w-full aspect-square h-full max-h-64">
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value, payload) => payload[0]?.payload.period}
              formatter={(value) => [`${(value as number).toFixed(0)}%`, 'Likelihood']}
            />
          }
        />
        <PolarGrid />
        <PolarAngleAxis dataKey="period" />
        <Radar
          dataKey="likelihood"
          fill="var(--color-likelihood)"
          fillOpacity={0.6}
          stroke="var(--color-likelihood)"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
}

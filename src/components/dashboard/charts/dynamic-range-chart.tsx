
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { VehicleState } from '@/lib/types';

interface DynamicRangeChartProps {
  state: VehicleState;
}

export default function DynamicRangeChart({ state }: DynamicRangeChartProps) {
    const idealRange = state.initialRange * (state.batterySOC / 100);
    const predictedRange = state.predictedDynamicRange;
    const totalPenalty = Math.max(0, idealRange - predictedRange);

    const weights = {
      ac: state.acOn ? 0.3 : 0,
      temp: Math.abs(22 - state.outsideTemp) > 5 ? 0.2 : 0,
      driveMode: state.driveMode === 'Sports' ? 0.4 : (state.driveMode === 'City' ? 0.2 : 0),
      load: (state.passengers > 1 || state.goodsInBoot) ? 0.1 : 0,
    };

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

    const acPenalty = totalWeight > 0 ? (weights.ac / totalWeight) * totalPenalty : 0;
    const tempPenalty = totalWeight > 0 ? (weights.temp / totalWeight) * totalPenalty : 0;
    const driveModePenalty = totalWeight > 0 ? (weights.driveMode / totalWeight) * totalPenalty : 0;
    const loadPenalty = totalWeight > 0 ? (weights.load / totalWeight) * totalPenalty : 0;
    
    const data = [
        { name: 'Ideal', value: idealRange, label: `${Math.round(idealRange)} km` },
        { name: 'A/C', value: -acPenalty, label: `-${Math.round(acPenalty)} km` },
        { name: 'Temp', value: -tempPenalty, label: `-${Math.round(tempPenalty)} km` },
        { name: 'Drive Mode', value: -driveModePenalty, label: `-${Math.round(driveModePenalty)} km` },
        { name: 'Load', value: -loadPenalty, label: `-${Math.round(loadPenalty)} km` },
        { name: 'Predicted', value: predictedRange, label: `${Math.round(predictedRange)} km` },
    ];
    
    const chartData = data.map(item => ({
      ...item,
      fill: item.value >= 0 ? (item.name === 'Predicted' ? 'hsl(var(--primary))' : 'hsl(var(--chart-2))') : 'hsl(var(--chart-5))',
    }));


  const chartConfig = {};

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 10, right: 50 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tickMargin={5}
        />
        <XAxis type="number" hide />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => [`${Math.round(value as number)} km`, name]}
            />
          }
        />
        <Bar dataKey="value" radius={5}>
            <LabelList
                dataKey="label"
                position="right"
                offset={8}
                formatter={(value: string) => value}
                className="fill-foreground font-semibold text-xs"
            />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

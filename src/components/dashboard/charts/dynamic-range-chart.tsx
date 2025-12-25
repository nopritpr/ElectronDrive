
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { VehicleState } from '@/lib/types';
import { EV_CONSTANTS } from '@/lib/constants';

interface DynamicRangeChartProps {
  state: VehicleState;
}

export default function DynamicRangeChart({ state }: DynamicRangeChartProps) {
    const idealRange = state.initialRange * (state.batterySOC / 100);
    const { ac: acPenalty, load: loadPenalty, temp: tempPenalty, driveMode: driveModePenalty } = state.rangePenalties;
    const predictedRange = Math.max(0, idealRange - acPenalty - loadPenalty - tempPenalty - driveModePenalty);
    
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
      value: Math.round(item.value), // Ensure values are integers for clean charting
      label: item.value !== 0 ? item.label : '', // Don't show label for zero-penalty items
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

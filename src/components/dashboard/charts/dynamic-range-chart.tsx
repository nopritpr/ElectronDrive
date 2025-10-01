'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { VehicleState } from '@/lib/types';
import { MODE_SETTINGS } from '@/lib/constants';

interface DynamicRangeChartProps {
  state: VehicleState;
}

export default function DynamicRangeChart({ state }: DynamicRangeChartProps) {
    const idealRange = state.initialRange * (state.batterySOC / 100);
    const predictedRange = state.predictedDynamicRange;
    const totalPenalty = idealRange > predictedRange ? idealRange - predictedRange : 0;

    // Apportion the total penalty based on which factors are active
    const activePenalties: (keyof typeof rangePenalties)[] = [];
    if (state.acOn) activePenalties.push('ac');
    if (Math.abs(22 - state.outsideTemp) > 2) activePenalties.push('temp');
    if (state.driveMode !== 'Eco') activePenalties.push('driveMode');
    if (state.passengers > 1 || state.goodsInBoot) activePenalties.push('load');

    const penaltyShare = activePenalties.length > 0 ? totalPenalty / activePenalties.length : 0;

    const rangePenalties = {
        ac: activePenalties.includes('ac') ? penaltyShare : 0,
        temp: activePenalties.includes('temp') ? penaltyShare : 0,
        driveMode: activePenalties.includes('driveMode') ? penaltyShare : 0,
        load: activePenalties.includes('load') ? penaltyShare : 0,
    };

    const data = [
        { name: 'Ideal', value: idealRange, fill: 'hsl(var(--chart-2))' },
        { name: 'A/C', value: -rangePenalties.ac, fill: 'hsl(var(--chart-5))' },
        { name: 'Temp', value: -rangePenalties.temp, fill: 'hsl(var(--chart-5))' },
        { name: 'Drive Mode', value: -rangePenalties.driveMode, fill: 'hsl(var(--chart-5))' },
        { name: 'Load', value: -rangePenalties.load, fill: 'hsl(var(--chart-5))' },
        { name: 'Predicted', value: predictedRange, fill: 'hsl(var(--primary))' },
    ];


  const chartConfig = {};

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 50 }}
        stackOffset="sign"
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
                dataKey="value"
                position="right"
                offset={8}
                formatter={(value: number) => value !== 0 ? `${Math.round(value)} km` : ''}
                className="fill-foreground font-semibold text-xs"
            />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

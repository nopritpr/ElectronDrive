'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface SohForecastChartProps {
  data: { odometer: number; soh: number }[];
}

export default function SohForecastChart({ data }: SohForecastChartProps) {
  const chartConfig = {
    soh: {
      label: 'SOH (%)',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="odometer"
          tickFormatter={(value) => `${value / 1000}k`}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          unit=" km"
        />
        <YAxis
          domain={[70, 100]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          unit="%"
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value, payload) => `${payload[0]?.payload.odometer.toLocaleString()} km`}
              formatter={(value) => [`${(value as number).toFixed(1)}%`, 'SOH']}
            />
          }
        />
        <defs>
            <linearGradient id="fillSoh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-soh)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-soh)" stopOpacity={0.1} />
            </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="soh"
          stroke="var(--color-soh)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#fillSoh)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

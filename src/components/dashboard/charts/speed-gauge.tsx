'use client';

import * as React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Pie, PieChart } from 'recharts';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed: number;
}

export default function SpeedGauge({ speed, maxSpeed }: SpeedGaugeProps) {
  const chartConfig = {
    speed: {
      label: 'Speed',
    },
    empty: {
        label: 'Empty',
    }
  };
  const data = [
    { name: 'speed', value: speed, fill: 'hsl(var(--primary))' },
    { name: 'empty', value: Math.max(0, maxSpeed - speed), fill: 'hsl(var(--muted))' },
  ];

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full aspect-square"
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="65%"
            outerRadius="85%"
            startAngle={225}
            endAngle={-45}
            strokeWidth={0}
          />
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="text-3xl sm:text-4xl font-bold font-headline">{Math.round(speed)}</p>
        <p className="text-xs sm:text-sm text-muted-foreground">km/h</p>
      </div>
    </div>
  );
}

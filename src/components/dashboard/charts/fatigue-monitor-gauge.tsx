'use client';

import * as React from 'react';
import { Pie, PieChart } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface FatigueMonitorGaugeProps {
  fatigueLevel: number; // 0 to 1
}

export default function FatigueMonitorGauge({ fatigueLevel }: FatigueMonitorGaugeProps) {
  const score = (1 - fatigueLevel) * 100;

  const getFatigueColor = () => {
    if (score > 80) return 'hsl(var(--chart-2))'; // Green
    if (score > 40) return 'hsl(var(--chart-4))'; // Yellow
    return 'hsl(var(--destructive))'; // Red
  };

  const chartConfig = {
    score: { label: 'Alertness' },
    empty: { label: 'Fatigue' },
  };

  const data = [
    { name: 'score', value: score, fill: getFatigueColor() },
    { name: 'empty', value: 100 - score, fill: 'hsl(var(--muted))' },
  ];

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <ChartContainer config={chartConfig} className="w-full h-full aspect-square max-h-[120px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={180}
            endAngle={-180}
            strokeWidth={0}
          />
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="text-2xl font-bold font-headline">{Math.round(score)}%</p>
        <p className="text-xs text-muted-foreground">Alertness</p>
      </div>
    </div>
  );
}

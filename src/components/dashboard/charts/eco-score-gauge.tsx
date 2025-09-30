'use client';

import * as React from 'react';
import {
  ChartContainer
} from '@/components/ui/chart';
import { Pie, PieChart } from 'recharts';

interface EcoScoreGaugeProps {
  score: number;
}

export default function EcoScoreGauge({ score }: EcoScoreGaugeProps) {
  const chartConfig = {
    score: {
      label: 'Score',
    },
    empty: {
        label: 'Empty',
    }
  };
  const data = [
    { name: 'score', value: score, fill: 'hsl(var(--chart-2))' },
    { name: 'empty', value: Math.max(0, 100 - score), fill: 'hsl(var(--muted))' },
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
            innerRadius="70%"
            outerRadius="90%"
            startAngle={180}
            endAngle={-180}
            strokeWidth={0}
          />
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="text-4xl font-bold font-headline">{Math.round(score)}</p>
        <p className="text-sm text-muted-foreground">/ 100</p>
      </div>
    </div>
  );
}

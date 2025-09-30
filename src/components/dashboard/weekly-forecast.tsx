'use client';

import React from 'react';
import type { FiveDayForecast, WeatherListItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react';

const getWeatherIcon = (iconCode: string) => {
  if (iconCode.includes('01')) return <Sun className="w-6 h-6 text-yellow-400" />;
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="w-6 h-6 text-gray-400" />;
  if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="w-6 h-6 text-blue-400" />;
  if (iconCode.includes('13')) return <CloudSnow className="w-6 h-6 text-blue-200" />;
  return <Cloud className="w-6 h-6 text-gray-400" />;
};

const getDailyForecasts = (forecast: FiveDayForecast | null): WeatherListItem[] => {
  if (!forecast) return [];

  const dailyData: { [key: string]: WeatherListItem } = {};

  forecast.list.forEach(item => {
    const day = format(parseISO(item.dt_txt), 'yyyy-MM-dd');
    if (!dailyData[day]) {
      dailyData[day] = item;
    }
  });

  return Object.values(dailyData).slice(0, 5);
};


export default function WeeklyForecast({ forecast }: { forecast: FiveDayForecast | null }) {
  const dailyForecasts = getDailyForecasts(forecast);

  return (
    <Card className="w-full h-full flex flex-col p-2 bg-background/60">
      <CardHeader className="p-2 pt-0">
        <CardTitle className="text-xs font-headline text-center">5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-around items-center p-0">
        {dailyForecasts.length > 0 ? (
          dailyForecasts.map((day, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center w-full py-2">
              <p className="text-xs font-semibold">{format(parseISO(day.dt_txt), 'eee')}</p>
              <div className="my-1">
                {getWeatherIcon(day.weather[0].icon)}
              </div>
              <p className="text-sm font-bold">{Math.round(day.main.temp)}°</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center">Loading forecast...</p>
        )}
      </CardContent>
    </Card>
  );
}

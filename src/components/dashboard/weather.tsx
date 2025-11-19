'use client';

import React from 'react';
import type { FiveDayForecast, WeatherData, WeatherListItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { Wind, Droplets } from 'lucide-react';

const getWeatherIcon = (iconCode: string, size: number = 24) => {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return <Image src={iconUrl} alt="weather icon" width={size} height={size} unoptimized />;
};


const getDailyForecasts = (forecast: FiveDayForecast | null): WeatherListItem[] => {
  if (!forecast) return [];
  const dailyData: { [key: string]: WeatherListItem } = {};

  forecast.list.forEach(item => {
    const day = format(parseISO(item.dt_txt), 'yyyy-MM-dd');
    if (!dailyData[day] || new Date(item.dt_txt).getHours() === 12) {
      dailyData[day] = item;
    }
  });

  return Object.values(dailyData).slice(0, 5);
};


export default function Weather({ weather, forecast }: { weather: WeatherData | null, forecast: FiveDayForecast | null }) {
  const dailyForecasts = getDailyForecasts(forecast);

  return (
    <Card className="w-full h-full flex flex-col p-4 bg-background/60">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-sm font-headline">Weather</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 space-y-4 min-h-0">
        {weather && weather.weather && weather.weather.length > 0 ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12">
                {getWeatherIcon(weather.weather[0].icon, 48)}
              </div>
              <div className='flex-1'>
                <p className="font-semibold text-base leading-tight">{weather.name}</p>
                <p className="text-3xl font-bold font-headline leading-none">{Math.round(weather.main.temp)}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                <span>{weather.main.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16.5V20"/><path d="M12 4.5V8"/><path d="M17.1 6.9 19 5"/><path d="M5 19 6.9 17.1"/><path d="M12 12 a4.5 4.5 0 0 0-4.5 4.5h9a4.5 4.5 0 0 0-4.5-4.5Z"/></svg>
                <span>{forecast?.list[0].pop ? Math.round(forecast.list[0].pop * 100) : 0}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" />
                <span>{weather.wind.speed.toFixed(1)} km/h</span>
              </div>
            </div>
            <div className="flex-grow space-y-2.5 overflow-y-auto pt-2">
                 {dailyForecasts.map((day, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-semibold w-12">{format(parseISO(day.dt_txt), 'eee')}</span>
                        <div className="w-8 h-8 flex items-center justify-center">
                            {getWeatherIcon(day.weather[0].icon, 32)}
                        </div>
                        <span className="font-bold font-mono w-10 text-right">{Math.round(day.main.temp_max)}°C</span>
                    </div>
                ))}
            </div>
          </>
        ) : <div className="flex-grow flex items-center justify-center"><p className="text-xs text-muted-foreground">Loading weather...</p></div>}
      </CardContent>
    </Card>
  );
}

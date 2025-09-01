// app/_lib/StationWeather.tsx
'use client';

import { useState, useEffect } from 'react';
import WeatherCard from './WeatherCard';
import { Cast, WeatherData } from './types';
import ErrorComponent from './Error';

interface StationWeatherProps {
  sid: string;
}

// 添加延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getWeatherData(sid: string): Promise<WeatherData> {
  // 添加1秒延迟以避免请求过于频繁
  await delay(1000);
  const res = await fetch(`/api/weather?city=${sid}`);
  if (!res.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return res.json();
}

export default function StationWeather({ sid }: StationWeatherProps) {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [city, setCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const weatherData = await getWeatherData(sid);
        if (weatherData.status === '1' && weatherData.forecasts?.[0]?.casts?.length) {
          setCasts(weatherData.forecasts[0].casts);
          setCity(weatherData.forecasts[0].city);
        } else {
          throw new Error('No forecast data available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [sid]);

  if (isLoading) {
    return <p>Loading weather for station {sid}...</p>;
  }

  if (error) {
    return <ErrorComponent message={`Could not load weather for station ${sid}: ${error}`} />;
  }

  return <WeatherCard casts={casts} city={city} />;
}
// app/_lib/StationWeather.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import WeatherCard from './WeatherCard';
import { Cast, WeatherData } from './types';
import ErrorComponent from './Error';
import rateLimiter from './rateLimiter';

interface StationWeatherProps {
  sid: string;
}

export default function StationWeather({ sid }: StationWeatherProps) {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [city, setCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    async function fetchData() {
      try {
        // Use the rate limiter to control API requests
        const data: WeatherData = await rateLimiter.schedule(async () => {
          // Directly call AMap API instead of our own API route
          const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?&city=${sid}&key=${process.env.NEXT_PUBLIC_AMAP_KEY}&extensions=all`);
          
          if (!res.ok) {
            throw new Error(`Failed to fetch weather data: ${res.status} ${res.statusText}`);
          }
          
          const jsonData = await res.json();
          
          // Check if AMap API returned an error
          if (jsonData.status !== '1') {
            throw new Error(`AMap API error: ${jsonData.info || 'Unknown error'}`);
          }
          
          return jsonData;
        });
        
        if (data.status === '1' && data.forecasts?.[0]?.casts?.length) {
          setCasts(data.forecasts[0].casts);
          setCity(data.forecasts[0].city);
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
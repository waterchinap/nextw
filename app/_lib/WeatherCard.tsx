// app/_lib/WeatherCard.tsx
import { Cast } from './types';

interface WeatherCardProps {
  casts: Cast[];
  city: string;
}

export default function WeatherCard({ casts, city }: WeatherCardProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{city}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {casts.map((cast, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-medium mb-2">
              {cast.date} ({cast.week})
            </h3>
            <p>天气: {cast.dayweather} ~ {cast.nightweather}</p>
            <p>温度: {cast.nighttemp}°C ~ {cast.daytemp}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// app/page.tsx
'use client';

import { useState } from 'react';
import StationWeather from './_lib/StationWeather';
import ErrorComponent from './_lib/Error';
import Loading from './_lib/Loading';

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Since we're using StationWeather component, we don't need to fetch data manually
  // We'll just simulate the loading state for consistency
  setTimeout(() => {
    setLoading(false);
  }, 500);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">成都天气预报</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Loading />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">成都天气预报</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ErrorComponent message={error || "获取天气数据失败，请稍后再试。"} />
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">成都天气预报</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Using StationWeather component with fixed city code 510101 */}
        <StationWeather sid="510100" />
      </div>
    </main>
  );
}

// app/page.tsx
import { revalidatePath } from 'next/cache';
import WeatherCard from './_lib/WeatherCard';
import ErrorComponent from './_lib/Error';
import { WeatherData } from './_lib/types';

// 获取天气数据的函数
async function getWeatherData(): Promise<WeatherData> {
  // 禁用缓存，确保每次请求都获取最新数据
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather`,
    { next: { revalidate: 7200 } } // 每2小时重新验证一次缓存
  );
  
  if (!res.ok) {
    throw new Error('获取天气数据失败');
  }
  
  return (await res.json()) as WeatherData;
}

export default async function Home() {
  // 获取天气数据
  const weatherData = await getWeatherData();
  
  // 如果数据无效，抛出错误
  if (weatherData.status !== '1' || !weatherData.forecasts?.[0]?.casts?.length) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">成都天气预报</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ErrorComponent message="获取天气数据失败，请稍后再试。" />
        </div>
      </main>
    );
  }
  
  const forecast = weatherData.forecasts[0];
  
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">成都天气预报</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">
          {forecast.province} {forecast.city} 天气预报
        </h2>
        <p className="text-gray-600 mb-4">
          数据发布时间: {forecast.reporttime}
        </p>
        
        <WeatherCard casts={forecast.casts} />
        
        {/* 刷新按钮 - 使用表单POST请求触发重新验证 */}
        <form 
          action={async () => {
            'use server';
            revalidatePath('/');
          }}
          className="mt-4"
        >
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            刷新数据
          </button>
        </form>
      </div>
    </main>
  );
}

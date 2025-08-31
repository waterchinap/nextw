
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || '510100'; // Default to Chengdu
  const API_KEY = process.env.AMAP_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
  }

  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${API_KEY}&city=${city}&extensions=all`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

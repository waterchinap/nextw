// app/api/locations/cities/route.ts
import { supabase } from '@/app/_lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get('province');

  if (!province) {
    return NextResponse.json({ error: 'Province parameter is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('adcode')
      .select('city')
      .eq('province', province);

    if (error) {
      console.error('Supabase error fetching cities for province:', error);
      throw new Error(error.message);
    }

    // Get unique city names
    const cities = [...new Set(data.map(item => item.city))];

    return NextResponse.json(cities);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

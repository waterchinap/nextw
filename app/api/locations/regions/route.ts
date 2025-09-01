// app/api/locations/regions/route.ts
import { supabase } from '@/app/_lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get('province');
  const city = searchParams.get('city');

  if (!province || !city) {
    return NextResponse.json({ error: 'Province and city parameters are required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('adcode')
      .select('region, adcode')
      .eq('province', province)
      .eq('city', city);

    if (error) {
      console.error('Supabase error fetching regions:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// app/api/locations/provinces/route.ts
import { supabase } from '@/app/_lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using an RPC call is the most efficient way to get distinct values in Supabase
    const { data, error } = await supabase.rpc('get_distinct_provinces');

    if (error) {
      console.error('Supabase error fetching distinct provinces:', error);
      throw new Error(error.message);
    }
    
    // The RPC function returns an array of objects, e.g., [{province: 'Sichuan'}, ...]
    // We map it to a simple array of strings.
    const provinces = data.map((p: { province: string }) => p.province);
    
    return NextResponse.json(provinces);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SavedWay, RouteDetail } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SBASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SBASE_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required.');
}

// 可选：添加类型注解以增强代码可读性和类型安全
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type Station = {
    sid: number;
    region: string;
    city: string;
    province: string;
}

export const getStations = async () => {
    const { data, error } = await supabase
        .from('all_stations')
        .select('sid, region, city, province')
        .order('sid', { ascending: true })
        .limit(10);
    if (error) {
        console.error('Error fetching stations:', error);
        return [];
    }
    return data as Station[];
};

export const getSavedWays = async (): Promise<SavedWay[]> => {
  const { data, error } = await supabase
    .from('saved_ways')
    .select('sid, name');
    
  if (error) {
    console.error('Error fetching saved ways:', error);
    throw new Error('Could not fetch saved ways');
  }
  
  return data || [];
};

export const getRouteDetailByName = async (name: string): Promise<RouteDetail | null> => {
  const { data, error } = await supabase
    .from('saved_ways')
    .select('name, sid, way')
    .eq('name', name)
    .single();
    
  if (error) {
    console.error('Error fetching route detail:', error);
    throw new Error('Could not fetch route detail');
  }
  
  return data;
};
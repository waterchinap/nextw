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

export type Adcode = {
  province: string;
  city: string;
  region: string;
  adcode: string;
};

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

// 新增：获取指定省份的所有城市
export const getCitiesByProvince = async (province: string) => {
  const { data, error } = await supabase
    .from('adcode')
    .select('city')
    .eq('province', province)
    .neq('city', '')
    .order('city');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  // 去重并返回城市列表
  const uniqueCities = Array.from(new Set(data.map(item => item.city)));
  return uniqueCities;
};

// 新增：获取指定省份和城市的所有区域
export const getRegionsByProvinceAndCity = async (province: string, city: string) => {
  const { data, error } = await supabase
    .from('adcode')
    .select('region, adcode')
    .eq('province', province)
    .eq('city', city)
    .neq('region', '')
    .order('region');

  if (error) {
    console.error('Error fetching regions:', error);
    return [];
  }

  return data as { region: string; adcode: string }[];
};
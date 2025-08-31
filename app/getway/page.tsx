// app/save-way/page.tsx (完整代码)
'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '../_lib/supabaseClient';

export default function SaveWayPage() {
  const [routeName, setRouteName] = useState<string>('');
  const [regions, setRegions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveWay = async (e: FormEvent) => {
    e.preventDefault();
    
    // 防止重复提交
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const regionsArray = regions.split(',').map(region => region.trim()).filter(region => region !== '');

    if (!routeName || regionsArray.length === 0) {
      setError('路线名称和地区都不能为空。');
      setIsLoading(false);
      return;
    }

    // Fetch station IDs for the given regions
    const { data: stationData, error: stationError } = await supabase
      .from('amap_adcode')
      .select('adcode, name')
      .in('name', regionsArray);

    if (stationError) {
      console.error('获取站点信息时出错:', stationError);
      setError('获取站点信息失败。请重试。');
      setIsLoading(false);
      return;
    }

    // Extract station IDs from the fetched data
    const stationIds = stationData.map(station => station.adcode);

    // Save to saved_ways table with name, regions, and station IDs
    const { error } = await supabase
      .from('saved_ways')
      .insert([
        { 
          name: routeName, 
          way: regionsArray,
          sid: stationIds
        },
      ]);
      
    setIsLoading(false);

    if (error) {
      console.error('保存路线时出错:', error);
      setError('保存路线失败。请重试。');
    } else {
      setSuccess('路线已成功保存！');
      setRouteName('');
      setRegions('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">保存新路线</h1>
      <form onSubmit={handleSaveWay} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="routeName" className="block text-sm font-medium text-gray-700">路线名称</label>
          <input
            id="routeName"
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={isLoading}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="regions" className="block text-sm font-medium text-gray-700">地区 (用逗号分隔，例如: 双流区, 武侯区)</label>
          <input
            id="regions"
            type="text"
            value={regions}
            onChange={(e) => setRegions(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? '正在保存...' : '保存路线'}
        </button>
      </form>

      {/* 状态和消息反馈 */}
      {error && <p className="mt-4 text-red-500">错误: {error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
}
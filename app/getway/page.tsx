'use client';

import { useState, FormEvent, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../_lib/supabaseClient';

// Define types for our data
interface AmapAdcode {
  id: number;
  city: string;
  region: string;
  adcode: string;
}

export default function SaveWayPage() {
  const [routeName, setRouteName] = useState<string>('');
  const [selectedRegions, setSelectedRegions] = useState<AmapAdcode[]>([]);
  const [availableRegions, setAvailableRegions] = useState<AmapAdcode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // 新增搜索状态
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch regions based on search term
  const fetchRegions = useCallback(async (term: string) => {
    // 只有在输入两个或更多中文字符时才查询数据库
    if (!term || term.length < 2) {
      setAvailableRegions([]);
      return;
    }

    // 检查是否包含至少两个中文字符
    const chineseCharCount = (term.match(/[\u4e00-\u9fa5]/g) || []).length;
    if (chineseCharCount < 2) {
      setAvailableRegions([]);
      return;
    }

    setIsFetching(true);
    const { data, error } = await supabase
      .from('adcode')
      .select('id, city, region, adcode')
      .or(`city.ilike.%${term}%,region.ilike.%${term}%`)
      .limit(20); // Limit results for performance

    if (error) {
      console.error('Error fetching regions:', error);
      setError('获取地区数据失败');
      setAvailableRegions([]);
    } else {
      setAvailableRegions(data || []);
    }
    setIsFetching(false);
  }, []);

  // Debounce search to avoid excessive database requests
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRegions(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchRegions]);

  const handleRegionToggle = (region: AmapAdcode) => {
    setSelectedRegions(prev => {
      const isSelected = prev.some(r => r.id === region.id);
      if (isSelected) {
        return prev.filter(r => r.id !== region.id);
      } else {
        return [...prev, region];
      }
    });
  };

  const handleSaveWay = async (e: FormEvent) => {
    e.preventDefault();
    
    // 防止重复提交
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!routeName || selectedRegions.length === 0) {
      setError('路线名称和地区都不能为空。');
      setIsLoading(false);
      return;
    }

    // Extract data for saving
    const regionNames = selectedRegions.map(region => region.region);
    const stationIds = selectedRegions.map(region => region.adcode);

    // Save to saved_ways table
    const { error } = await supabase
      .from('saved_ways')
      .insert([
        { 
          name: routeName, 
          way: regionNames,
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
      setSelectedRegions([]);
      // 清空搜索词
      setSearchTerm('');
      setAvailableRegions([]);
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
          <label className="block text-sm font-medium text-gray-700 mb-2">选择地区</label>
          
          {/* 添加搜索输入框 */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="搜索城市或地区... (至少输入两个中文字符)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={isLoading}
            />
          </div>
          
          {isFetching ? (
            <p>正在搜索地区...</p>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
              {availableRegions.map(region => {
                const isSelected = selectedRegions.some(r => r.id === region.id);
                return (
                  <div 
                    key={region.id} 
                    className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${isSelected ? 'bg-blue-100' : ''}`}
                    onClick={() => handleRegionToggle(region)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRegionToggle(region)}
                      className="mr-2"
                    />
                    <span>{region.city}/{region.region}</span>
                  </div>
                );
              })}
              {availableRegions.length === 0 && searchTerm && !isFetching && (
                <p className="text-gray-500 text-center py-2">未找到匹配的地区</p>
              )}
              {!searchTerm && (
                <p className="text-gray-500 text-center py-2">请输入关键词搜索地区</p>
              )}
            </div>
          )}
          
          {selectedRegions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">已选择 {selectedRegions.length} 个地区:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedRegions.map(region => (
                  <span key={region.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {region.city}/{region.region}
                  </span>
                ))}
              </div>
            </div>
          )}
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
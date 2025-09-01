'use client';

import { useState, useEffect } from 'react';
import { getRouteDetailByName } from '../../_lib/supabaseClient';
import { useParams } from 'next/navigation';
import StationWeather from '../../_lib/StationWeather';
import { RouteDetail } from '../../_lib/types';
import Loading from '../../_lib/Loading';
import Error from '../../_lib/Error';

export default function RouteWeatherDetailPage() {
  const { id } = useParams(); // This is actually the name parameter
  const [routeDetail, setRouteDetail] = useState<RouteDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchRouteDetail() {
        try {
          setIsLoading(true);
          setError(null);
          // Decode the URL parameter to handle Chinese characters properly
          const decodedName = decodeURIComponent(id as string);
          const data = await getRouteDetailByName(decodedName);
          setRouteDetail(data);
        } catch (err) {
          setError('获取路线详情失败。请重试。');
        } finally {
          setIsLoading(false);
        }
      }
      fetchRouteDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center min-h-screen py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">天气预报</h1>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center min-h-screen py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">天气预报</h1>
        <Error message={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">天气预报 - {routeDetail?.name}</h1>
      
      {/* 显示路线名称和站点ID列表 */}
      <div className="w-full max-w-4xl mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">路线信息</h2>
        <p><span className="font-medium">路线名称:</span> {routeDetail?.name}</p>
      </div>
      
      {routeDetail?.sid && routeDetail.sid.length > 0 ? (
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 gap-6">
            {routeDetail.sid.map((sid) => (
              <StationWeather key={sid} sid={sid} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-lg">暂无天气数据</p>
      )}
    </div>
  );
}
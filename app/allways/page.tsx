'use client';

import { useState, useEffect } from 'react';
import { getSavedWays } from '../_lib/supabaseClient';
import Link from 'next/link';
import { SavedWay } from '../_lib/types';
import Loading from '../_lib/Loading';
import Error from '../_lib/Error';

export default function SavedWaysListPage() {
  const [savedWays, setSavedWays] = useState<SavedWay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSavedWays() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSavedWays();
        setSavedWays(data);
      } catch (err) {
        setError('获取路线列表失败。请重试。');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSavedWays();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">已保存的路线</h1>
      
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Error message={error} />
      ) : savedWays.length === 0 ? (
        <p className="text-lg">暂无保存的路线</p>
      ) : (
        <div className="w-full max-w-2xl">
          <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
            {savedWays.map((way) => (
              <li key={way.sid} className="px-6 py-4">
                <Link href={`/detail/${way.name}`} className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                  {way.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
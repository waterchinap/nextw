'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: '首页', path: '/' },
    { name: '所有路线', path: '/allways' },
    { name: '保存路线', path: '/routeplan' },
    { name: '关于', path: '/about' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              天气预报系统
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${
                  pathname === item.path
                    ? 'text-indigo-600 font-medium border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-500'
                } transition-colors duration-200 py-2`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
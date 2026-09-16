'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProjectTabsClient({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  
  const tabs = [
    { href: `/dashboard/${projectId}`,            label: 'Tổng quan' },
    { href: `/dashboard/${projectId}/work-items`, label: 'Quản lý Công việc' },
    { href: `/dashboard/${projectId}/sprints`,    label: 'Bảng Sprints' },
    { href: `/dashboard/${projectId}/check-ins`,  label: 'Báo cáo Tiến độ' },
    { href: `/dashboard/${projectId}/settings`,   label: 'Cấu hình Dự án' },
  ];

  return (
    <div className="flex gap-2 -mb-[1px] overflow-x-auto">
      {tabs.map(tab => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
              isActive 
                ? 'bg-white dark:bg-[#111] border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

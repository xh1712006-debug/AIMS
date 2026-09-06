'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProjectTabs({ projectId, userRole }: { projectId: string, userRole: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Tổng quan Dự án', href: `/dashboard/${projectId}` },
    { name: 'Work Items (Backlog)', href: `/dashboard/${projectId}/work-items` },
    { name: 'Sprint Planning', href: `/dashboard/${projectId}/sprints` },
    { name: 'Báo cáo hằng ngày', href: `/dashboard/${projectId}/check-ins` },
  ];

  return (
    <div className="border-b border-gray-200 mb-6 mt-2">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${isActive 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

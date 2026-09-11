'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InboxTabs({ 
  pendingActions, 
  resolvedActions 
}: { 
  pendingActions: any[], 
  resolvedActions: any[] 
}) {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'all'>('pending');

  let displayList: any[] = [];
  if (activeTab === 'pending') {
    displayList = pendingActions;
  } else if (activeTab === 'resolved') {
    displayList = resolvedActions;
  } else {
    // Combine and sort by date
    displayList = [...pendingActions, ...resolvedActions].sort((a, b) => {
      const dateA = a.createdAt || a.resolvedAt;
      const dateB = b.createdAt || b.resolvedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }

  const renderBadge = (item: any) => {
    if (item.type === 'MISSING_CHECKIN') {
      return <span className="bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Thiếu Check-in</span>;
    }
    if (item.type === 'BLOCKED_TASK') {
      return <span className="bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Task Kẹt</span>;
    }
    if (item.type === 'PENDING_REVIEW') {
      return <span className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Chờ Review</span>;
    }
    if (item.type === 'RESOLVED_CHECKIN') {
      return <span className="bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Đã Check-in</span>;
    }
    if (item.type === 'RESOLVED_TASK') {
      return <span className="bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Task Hoàn thành</span>;
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#171717] rounded-3xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden min-h-[600px] flex flex-col">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-100 dark:border-[#262626]">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'pending' ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-[#EDEDED] dark:hover:bg-[#262626]'}`}
        >
          🔥 Cần xử lý ngay 
          {pendingActions.length > 0 && <span className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 py-0.5 px-2 rounded-full text-xs">{pendingActions.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('resolved')}
          className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'resolved' ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-[#EDEDED] dark:hover:bg-[#262626]'}`}
        >
          ✅ Đã giải quyết 
          {resolvedActions.length > 0 && <span className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 py-0.5 px-2 rounded-full text-xs">{resolvedActions.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'all' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-[#EDEDED] dark:hover:bg-[#262626]'}`}
        >
          📑 Tất cả
        </button>
      </div>

      {/* List */}
      <div className="flex-1 p-6">
        {displayList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="text-6xl mb-4 opacity-50">🎉</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Hộp thư trống</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">Không có thông báo nào trong mục này. Chúc bạn một ngày làm việc hiệu quả!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {displayList.map(item => {
              const isResolved = item.type.startsWith('RESOLVED');
              const date = item.createdAt || item.resolvedAt;
              
              return (
                <li key={item.id}>
                  <Link href={item.link} className={`block rounded-2xl border transition-all hover:shadow-md ${
                    isResolved 
                      ? 'bg-white dark:bg-[#171717] border-gray-100 dark:border-[#262626] hover:border-green-300 dark:hover:border-green-700/50 opacity-70 hover:opacity-100' 
                      : 'bg-white dark:bg-[#171717] border-gray-200 dark:border-[#383838] hover:border-purple-300 dark:hover:border-purple-700/50'
                  }`}>
                    <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {renderBadge(item)}
                        </div>
                        <div>
                          <h4 className={`text-base font-bold mb-1 ${isResolved ? 'text-gray-600 dark:text-[#A3A3A3] line-through' : 'text-gray-900 dark:text-[#EDEDED]'}`}>
                            {item.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 dark:text-[#737373]">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              {item.internName}
                            </span>
                            <span className="text-gray-300 dark:text-[#383838]">|</span>
                            <span>{new Date(date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="sm:pl-4 sm:border-l border-gray-100 dark:border-[#262626]">
                        <div className="inline-flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-[#262626] dark:hover:bg-[#383838] rounded-xl text-sm font-bold text-gray-700 dark:text-[#EDEDED] transition-colors">
                          {isResolved ? 'Xem lại' : 'Xử lý ngay'} →
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

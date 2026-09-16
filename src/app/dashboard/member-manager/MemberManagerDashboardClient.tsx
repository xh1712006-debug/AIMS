'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { calculateProjectRisk } from '@/lib/risk';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Icons = {
  project: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  blocker: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  event: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  chevronRight: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
};

const RISK_COLORS = {
  RED: '#ef4444',
  YELLOW: '#f59e0b',
  GREEN: '#10b981',
};

export default function MemberManagerDashboardClient({ projects, user }: { projects: any[], user: any }) {
  
  const stats = useMemo(() => {
    let activeBlockers = 0;
    const riskCounts = { RED: 0, YELLOW: 0, GREEN: 0 };
    const blockersData: any[] = [];
    
    projects.forEach((p: any) => {
      // Calculate Risk
      const risk = calculateProjectRisk(p) as keyof typeof riskCounts;
      if (riskCounts[risk] !== undefined) {
        riskCounts[risk]++;
      } else {
        riskCounts.GREEN++; // Default fallback
      }

      // Calculate Blockers
      let projectBlockers = 0;
      p.workItems?.forEach((wi: any) => {
        if (wi.status === 'BLOCKED') {
          activeBlockers++;
          projectBlockers++;
        }
      });

      if (projectBlockers > 0) {
        blockersData.push({
          name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
          blockers: projectBlockers,
          fullTitle: p.title
        });
      }
    });

    // Sort blockersData by blockers count descending
    blockersData.sort((a, b) => b.blockers - a.blockers);

    const riskData = [
      { name: 'An toàn (Green)', value: riskCounts.GREEN, color: RISK_COLORS.GREEN },
      { name: 'Cảnh báo (Yellow)', value: riskCounts.YELLOW, color: RISK_COLORS.YELLOW },
      { name: 'Nguy hiểm (Red)', value: riskCounts.RED, color: RISK_COLORS.RED },
    ].filter(d => d.value > 0);

    return {
      activeProjects: projects.length,
      activeBlockers,
      events: 0,
      riskData,
      blockersData: blockersData.slice(0, 5), // Top 5
      topProjects: [...projects].sort((a, b) => {
        const riskA = calculateProjectRisk(a);
        const riskB = calculateProjectRisk(b);
        const weight: any = { RED: 3, YELLOW: 2, GREEN: 1 };
        return (weight[riskB] || 0) - (weight[riskA] || 0);
      }).slice(0, 4)
    };
  }, [projects]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10">
      

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-white dark:bg-[#171717] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#262626] hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12">
            <Icons.project className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Icons.project className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dự án đang hỗ trợ</h3>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.activeProjects}</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-[#171717] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#262626] hover:shadow-md hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12">
            <Icons.blocker className="w-24 h-24 text-red-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <Icons.blocker className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Blockers cần xử lý</h3>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.activeBlockers}</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-[#171717] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#262626] hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12">
            <Icons.event className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                <Icons.event className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sự kiện tuần này</h3>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.events}</p>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Distribution */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#EDEDED] uppercase tracking-wider mb-6">Phân bổ rủi ro dự án</h3>
          <div className="flex-1 min-h-[260px] flex items-center justify-center relative">
            {stats.riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400 italic">Chưa có dữ liệu rủi ro.</div>
            )}
            
            {/* Custom Legend */}
            {stats.riskData.length > 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-black text-gray-900 dark:text-white">{stats.activeProjects}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Dự án</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-2">
            {stats.riskData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blockers Overview */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#EDEDED] uppercase tracking-wider mb-6">Top Dự án có Blockers</h3>
          <div className="flex-1 min-h-[260px]">
            {stats.blockersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.blockersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                    itemStyle={{ fontWeight: 'bold', color: '#ef4444' }}
                  />
                  <Bar dataKey="blockers" name="Blockers" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-3">
                  <Icons.event className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Không có Blockers nào!</p>
                <p className="text-xs text-gray-400 mt-1">Các dự án đang hoạt động trơn tru.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PROJECT LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Dự án cần chú ý</h3>
          <Link href="/dashboard/member-manager/projects" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Xem tất cả
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.topProjects.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-[#262626]">
              <p className="text-sm font-bold text-gray-500">Chưa có dự án nào được phân công.</p>
            </div>
          ) : (
            stats.topProjects.map((project: any) => {
              const risk = calculateProjectRisk(project);
              const totalItems = project.workItems?.length || 0;
              const doneItems = project.workItems?.filter((wi: any) => wi.status === 'DONE').length || 0;
              const progress = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
              
              const borderColors = {
                RED: 'border-red-200 dark:border-red-900/50 hover:border-red-400',
                YELLOW: 'border-yellow-200 dark:border-yellow-900/50 hover:border-yellow-400',
                GREEN: 'border-green-200 dark:border-green-900/50 hover:border-green-400'
              };

              const bgColors = {
                RED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                YELLOW: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
                GREEN: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              };

              return (
                <Link key={project.id} href={`/dashboard/${project.id}`} className={`block bg-white dark:bg-[#171717] rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:shadow-md ${borderColors[risk as keyof typeof borderColors]}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded-md ${bgColors[risk as keyof typeof bgColors]}`}>
                      {risk}
                    </span>
                    <div className="text-xs font-semibold text-gray-500">{progress}%</div>
                  </div>
                  
                  <h4 className="font-bold text-gray-900 dark:text-[#EDEDED] truncate mb-1">{project.title}</h4>
                  <p className="text-[11px] font-medium text-gray-500 truncate mb-4">{project.intern?.name || 'Chưa gán'}</p>
                  
                  <div className="w-full bg-gray-100 dark:bg-[#262626] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

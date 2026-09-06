'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const STATUS_COLORS = {
  'TODO': '#94a3b8',
  'IN_PROGRESS': '#3b82f6',
  'REVIEW': '#eab308',
  'DONE': '#22c55e',
  'BLOCKED': '#ef4444'
};

const PRIORITY_COLORS = {
  'MUST': '#ef4444',
  'SHOULD': '#f59e0b',
  'COULD': '#3b82f6'
};

export default function InternCharts({ projects }: { projects: any[] }) {
  // Aggregate data
  let allWorkItems: any[] = [];
  projects.forEach(p => {
    allWorkItems = allWorkItems.concat(p.workItems || []);
  });

  const hasData = allWorkItems.length > 0;

  // Status Distribution
  const statusCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, BLOCKED: 0 };
  allWorkItems.forEach(wi => {
    if (statusCounts[wi.status as keyof typeof statusCounts] !== undefined) {
      statusCounts[wi.status as keyof typeof statusCounts]++;
    }
  });

  const statusData = [
    { name: 'Cần làm', value: statusCounts.TODO, color: STATUS_COLORS.TODO },
    { name: 'Đang làm', value: statusCounts.IN_PROGRESS, color: STATUS_COLORS.IN_PROGRESS },
    { name: 'Đang Review', value: statusCounts.REVIEW, color: STATUS_COLORS.REVIEW },
    { name: 'Hoàn thành', value: statusCounts.DONE, color: STATUS_COLORS.DONE },
    { name: 'Bị chặn', value: statusCounts.BLOCKED, color: STATUS_COLORS.BLOCKED },
  ].filter(d => d.value > 0);

  // Priority Distribution
  const priorityCounts: Record<string, { count: number, name: string, color: string }> = {};
  
  allWorkItems.forEach(wi => {
    if (wi.priority) {
      if (!priorityCounts[wi.priority.id]) {
        priorityCounts[wi.priority.id] = { count: 0, name: wi.priority.name, color: wi.priority.color || '#9ca3af' };
      }
      priorityCounts[wi.priority.id].count++;
    } else {
      // Unclassified
      if (!priorityCounts['unclassified']) {
        priorityCounts['unclassified'] = { count: 0, name: 'Chưa phân loại', color: '#e5e7eb' };
      }
      priorityCounts['unclassified'].count++;
    }
  });

  const priorityData = Object.values(priorityCounts).map(p => ({
    name: p.name,
    value: p.count,
    fill: p.color
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Biểu đồ trạng thái công việc */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          Phân bổ Trạng thái
        </h3>
        <div className="h-64 flex items-center justify-center">
          {!hasData ? (
            <div className="text-center">
              <div className="bg-gray-50 rounded-full p-4 inline-block mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Chưa có công việc nào</p>
              <p className="text-xs text-gray-400 mt-1">Biểu đồ sẽ hiển thị khi bạn tạo công việc</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} công việc`, 'Số lượng']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Biểu đồ mức độ ưu tiên */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Mức độ Ưu tiên
        </h3>
        <div className="h-64 flex items-center justify-center">
          {!hasData ? (
            <div className="text-center">
              <div className="bg-gray-50 rounded-full p-4 inline-block mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Chưa có công việc nào</p>
              <p className="text-xs text-gray-400 mt-1">Biểu đồ sẽ hiển thị khi bạn tạo công việc</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(value: number) => [`${value} công việc`, 'Số lượng']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

const TASK_COLORS = {
  'DONE': '#22c55e',       // Green
  'IN_PROGRESS': '#3b82f6',// Blue
  'TODO': '#9ca3af',       // Gray
  'BLOCKED': '#ef4444'     // Red
};

export default function MentorCharts({ interns }: { interns: any[] }) {
  // 1. DATA FOR TREND CHART (Last 7 days check-ins)
  const now = new Date();
  const last7DaysMap = new Map();
  const trendData = [];
  
  // Initialize the last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    last7DaysMap.set(dateStr, { name: label, 'Báo cáo (Check-in)': 0 });
  }

  // Count check-ins per day across ALL interns
  interns.forEach(intern => {
    intern.projects.forEach((p: any) => {
      p.checkIns?.forEach((chk: any) => {
        const chkDateStr = new Date(chk.createdAt).toISOString().split('T')[0];
        if (last7DaysMap.has(chkDateStr)) {
          const dayData = last7DaysMap.get(chkDateStr);
          dayData['Báo cáo (Check-in)'] += 1;
        }
      });
    });
  });
  
  last7DaysMap.forEach(value => trendData.push(value));

  // 2. DATA FOR OVERALL WORKLOAD (Donut Chart)
  let totalDone = 0, totalInProgress = 0, totalTodo = 0, totalBlocked = 0;
  
  interns.forEach(intern => {
    intern.projects.forEach((p: any) => {
      p.workItems?.forEach((wi: any) => {
        if (wi.status === 'DONE') totalDone++;
        else if (wi.status === 'IN_PROGRESS' || wi.status === 'REVIEW') totalInProgress++;
        else if (wi.status === 'BLOCKED') totalBlocked++;
        else totalTodo++;
      });
    });
  });

  const workloadData = [
    { name: 'Hoàn thành (Done)', value: totalDone, color: TASK_COLORS.DONE },
    { name: 'Đang làm (In Progress)', value: totalInProgress, color: TASK_COLORS.IN_PROGRESS },
    { name: 'Bị chặn (Blocked)', value: totalBlocked, color: TASK_COLORS.BLOCKED },
    { name: 'Cần làm (Todo)', value: totalTodo, color: TASK_COLORS.TODO }
  ].filter(d => d.value > 0);

  // Custom tooltips
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#171717] p-3 rounded-xl border border-gray-100 dark:border-[#262626] shadow-lg">
          <p className="font-bold text-gray-900 dark:text-[#EDEDED] mb-2">{label}</p>
          <div className="flex items-center gap-2 text-sm text-purple-600 font-bold">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            {payload[0].value} báo cáo
          </div>
        </div>
      );
    }
    return null;
  };

  const WorkloadTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#171717] p-3 rounded-xl border border-gray-100 dark:border-[#262626] shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-[#EDEDED]">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></span>
            {data.name}: {data.value} tasks
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Team Pulse (Activity Trend) */}
      <div className="bg-white dark:bg-[#171717] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#EDEDED] uppercase tracking-wider mb-6 flex items-center gap-2">
          <span>📈</span> Nhịp độ Hoạt động (7 Ngày qua)
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCheckin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#d8b4fe', strokeWidth: 2, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="Báo cáo (Check-in)" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorCheckin)" activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Overall Workload (Macro Level) */}
      <div className="bg-white dark:bg-[#171717] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#EDEDED] uppercase tracking-wider mb-6 flex items-center gap-2">
          <span>🍩</span> Phân bổ Khối lượng (Toàn Khóa)
        </h3>
        <div className="h-[280px]">
          {workloadData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-3xl mb-2">📁</span>
              <p className="text-sm">Chưa có công việc nào trong hệ thống</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {workloadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<WorkloadTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

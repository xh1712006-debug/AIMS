import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateProjectRisk } from "@/lib/risk";
import Link from "next/link";

const riskConfig = {
  RED: { label: 'Rủi ro cao', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
  YELLOW: { label: 'Cần chú ý', dot: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' },
  GREEN: { label: 'Ổn định', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' },
};

export default async function ProjectDetailPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) redirect('/login');

  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } :
          session.user.role === 'MEMBER_MANAGER' ? { memberManagerId: session.user.id } :
          session.user.role === 'PARTNER' ? { partnerId: session.user.id } :
          session.user.role === 'PROJECT_MANAGER' ? { projectManagerId: session.user.id } : {})
    },
    include: {
      sprints: {
        orderBy: { startDate: 'asc' }
      },
      workItems: {
        include: { priority: true },
        orderBy: { order: 'asc' }
      },
      checkIns: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!project) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center">
        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Không có quyền truy cập</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Dự án không tồn tại hoặc bạn chưa được phân quyền.</p>
      </div>
    </div>
  );

  // Stats
  const totalWorkItems = project.workItems.length;
  const doneWorkItems = project.workItems.filter(wi => wi.status === 'DONE').length;
  const inProgressItems = project.workItems.filter(wi => wi.status === 'IN_PROGRESS').length;
  const blockedItems = project.workItems.filter(wi => wi.status === 'BLOCKED').length;
  const totalCheckIns = project.checkIns.length;
  const progress = totalWorkItems > 0 ? Math.round((doneWorkItems / totalWorkItems) * 100) : 0;
  const risk = calculateProjectRisk(project as any);
  const rc = riskConfig[risk as keyof typeof riskConfig] ?? riskConfig.GREEN;

  // Active sprint
  const now = new Date();
  const activeSprint = project.sprints.find(s => new Date(s.startDate) <= now && new Date(s.endDate) >= now);
  const nextSprint = project.sprints.find(s => new Date(s.startDate) > now);

  // Priority tasks
  const priorityTasks = project.workItems
    .filter(wi => wi.status !== 'DONE' && !['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'].includes(wi.type))
    .slice(0, 5);

  // Project duration
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const timeProgress = totalDays > 0 ? Math.min(100, Math.round((elapsedDays / totalDays) * 100)) : 0;
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const statusMeta = {
    TODO: { label: 'Cần làm', color: 'bg-slate-400' },
    IN_PROGRESS: { label: 'Đang làm', color: 'bg-blue-500' },
    REVIEW: { label: 'Đang review', color: 'bg-amber-500' },
    DONE: { label: 'Hoàn thành', color: 'bg-emerald-500' },
    BLOCKED: { label: 'Bị chặn', color: 'bg-red-500' },
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto pb-12 space-y-8">

      {/* ── Sleek Typography Header ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white to-gray-50 dark:from-[#111] dark:to-[#0a0a0a] border border-gray-100 dark:border-gray-800/50 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="badge badge-accent text-[10px] uppercase tracking-wider font-bold shadow-sm">
                {project.track.replace(/_/g, ' ')}
              </span>
              <span className={`badge text-[10px] uppercase tracking-wider font-bold shadow-sm ${rc.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${rc.dot}`} />
                {rc.label}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {project.title}
            </h1>
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startDate.toLocaleDateString('vi-VN')} — {endDate.toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Progress & Time Highlight */}
          <div className="flex flex-wrap items-center gap-8 bg-white/50 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/30">
            <div className="flex flex-col items-end">
              <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                {progress}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Tiến độ</span>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="flex flex-col items-start">
              <span className={`text-4xl font-black tracking-tighter ${remainingDays < 14 ? 'text-red-500' : 'text-emerald-500'}`}>
                {remainingDays}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Ngày còn lại</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Premium Metric Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Tasks */}
        <div className="aims-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Công việc</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>{totalWorkItems}</span>
            <span className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>task</span>
          </div>
          <div className="progress-bar h-1.5 bg-gray-100 dark:bg-gray-800">
            <div className="progress-bar-fill bg-indigo-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] mt-2 font-semibold" style={{ color: 'var(--text-muted)' }}>{doneWorkItems} hoàn thành</p>
        </div>

        {/* In Progress */}
        <div className="aims-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Đang thực hiện</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black leading-none text-blue-600 dark:text-blue-400">{inProgressItems}</span>
            <span className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>task</span>
          </div>
          <p className="text-[10px] mt-3.5 font-bold text-amber-500">{blockedItems} bị chặn</p>
        </div>

        {/* Check-ins */}
        <div className="aims-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Báo cáo</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black leading-none text-purple-600 dark:text-purple-400">{totalCheckIns}</span>
            <span className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>bản</span>
          </div>
          <p className="text-[10px] mt-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
            {project.checkIns[0] ? `Gần nhất: ${new Date(project.checkIns[0].createdAt).toLocaleDateString('vi-VN')}` : 'Chưa có dữ liệu'}
          </p>
        </div>

        {/* Time Progress */}
        <div className="aims-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Thời gian</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${timeProgress > 80 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
              <svg className={`w-4 h-4 ${timeProgress > 80 ? 'text-red-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>{timeProgress}%</span>
            <span className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>đã qua</span>
          </div>
          <div className="progress-bar h-1.5 bg-gray-100 dark:bg-gray-800">
            <div className={`progress-bar-fill ${timeProgress > 80 ? 'bg-red-500' : timeProgress > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${timeProgress}%` }} />
          </div>
        </div>
      </div>

      {/* ── Layout: 2 Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column - Scrollable Task List */}
        <div className="lg:col-span-2 aims-card overflow-hidden flex flex-col h-[450px]">
          
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-[#111]/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Công việc chờ xử lý</h3>
            </div>
            <Link href={`/dashboard/${project.id}/work-items`} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              Xem tất cả →
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex flex-col gap-2">
              {project.workItems.filter(wi => wi.status !== 'DONE' && !['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'].includes(wi.type)).length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full pt-10">
                  <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Không có việc tồn đọng</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tuyệt vời! Bạn đã xử lý xong mọi công việc.</p>
                </div>
              ) : (
                project.workItems
                  .filter(wi => wi.status !== 'DONE' && !['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'].includes(wi.type))
                  .map(item => {
                    const sm = statusMeta[item.status as keyof typeof statusMeta];
                    return (
                      <Link href={`/dashboard/${project.id}/work-items?itemId=${item.id}`} key={item.id}>
                        <div className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all cursor-pointer">
                          <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${sm?.color ?? 'bg-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.type}</span>
                              {item.priority && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: item.priority.color ?? '#ea580c' }}>{item.priority.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="badge badge-muted text-[10px] py-1 px-2 whitespace-nowrap">{sm?.label ?? item.status}</span>
                        </div>
                      </Link>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Sprint Minimal Card */}
          <div className="aims-card p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-indigo-500/20 shadow-lg">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-white/80">Sprint Hiện Tại</h3>
            {activeSprint ? (
              <div>
                <h4 className="text-xl font-black mb-1">{activeSprint.name}</h4>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-bold text-emerald-100">Đang hoạt động</span>
                </div>
                <div className="space-y-3 text-xs font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Bắt đầu</span>
                    <span>{new Date(activeSprint.startDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Kết thúc</span>
                    <span>{new Date(activeSprint.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Không có Sprint đang chạy</p>
                {nextSprint && (
                  <p className="text-xs font-medium mt-2 text-white/70">Sắp tới: {nextSprint.name}</p>
                )}
              </div>
            )}
            <Link href={`/dashboard/${project.id}/sprints`} className="mt-5 block w-full text-center text-xs font-bold py-2.5 rounded-lg bg-white text-indigo-600 hover:bg-gray-50 transition-colors shadow-sm">
              Quản lý Sprints →
            </Link>
          </div>

          {/* Recent Check-ins */}
          <div className="aims-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Check-in gần đây</h3>
              <Link href={`/dashboard/${project.id}/check-ins`} className="text-xs font-bold text-indigo-500 hover:text-indigo-600">
                Lịch sử →
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {project.checkIns.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-gray-50 dark:bg-gray-800/30">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Chưa có báo cáo check-in nào.</p>
                </div>
              ) : (
                project.checkIns.slice(0, 3).map(ci => (
                  <div key={ci.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-default">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {new Date(ci.createdAt).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ci.riskStatus === 'RED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : ci.riskStatus === 'YELLOW' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'}`}>
                        {ci.riskStatus}
                      </span>
                    </div>
                    <p className="text-xs font-medium line-clamp-2 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{ci.doneTasks}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

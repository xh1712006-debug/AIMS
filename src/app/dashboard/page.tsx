import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateProjectForm from "./CreateProjectForm";
import ProjectManagerCharts from "./ProjectManagerCharts";
import InternCharts from "./InternCharts";
import { calculateProjectRisk } from "@/lib/risk";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  if (user.role === 'MEMBER_MANAGER') {
    redirect('/dashboard/member-manager');
  }

  if (user.role === 'PARTNER') {
    redirect('/dashboard/partner');
  }

  if (user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') {
    const interns = await prisma.user.findMany({
      where: { role: 'INTERN' },
      include: {
        projectsAsIntern: {
          where: { 
            status: 'ACTIVE',
            ...(user.role === 'PROJECT_MANAGER' ? { projectManagerId: user.id } : {})
          },
          include: {
            checkIns: { orderBy: { createdAt: 'desc' } },
            workItems: true,
            sprints: { include: { sprintReview: true } }
          }
        }
      }
    });

    const memberManagers = await prisma.user.findMany({ where: { role: 'MEMBER_MANAGER' } });
    const partners = await prisma.user.findMany({ where: { role: 'PARTNER' } });

    // 1. Calculate Metrics & Insights
    let activeProjects = 0;
    let atRiskProjects = 0;
    
    type ActionItem = { id: string, type: 'MISSING_CHECKIN' | 'BLOCKED_TASK' | 'PENDING_REVIEW', title: string, internName: string, link: string, urgency: 'high' | 'medium' };
    const pendingActions: ActionItem[] = [];

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    interns.forEach(intern => {
      intern.projectsAsIntern.forEach(p => {
        activeProjects++;
        
        const risk = calculateProjectRisk(p as any);
        if (risk === 'RED' || risk === 'YELLOW') atRiskProjects++;

        // Insight 1: Missing Check-in
        const lastCheckIn = p.checkIns[0];
        if (!lastCheckIn || lastCheckIn.createdAt < twoDaysAgo) {
          pendingActions.push({
            id: `chk-${p.id}`,
            type: 'MISSING_CHECKIN',
            title: 'Chưa Check-in (>2 ngày)',
            internName: intern.name,
            link: `/dashboard/${p.id}`,
            urgency: 'medium'
          });
        }

        // Insight 2: Blocked Tasks
        const blockedTasks = p.workItems.filter(wi => wi.status === 'BLOCKED');
        blockedTasks.forEach(task => {
          pendingActions.push({
            id: `blk-${task.id}`,
            type: 'BLOCKED_TASK',
            title: `Task kẹt: ${task.title.substring(0, 20)}...`,
            internName: intern.name,
            link: `/dashboard/${p.id}/sprints`,
            urgency: 'high'
          });
        });

        // Insight 3: Pending Sprint Review
        p.sprints.forEach(sprint => {
          if (sprint.endDate < now && !sprint.sprintReview) {
            pendingActions.push({
              id: `rvw-${sprint.id}`,
              type: 'PENDING_REVIEW',
              title: `Thiếu Đánh giá: ${sprint.name}`,
              internName: intern.name,
              link: `/dashboard/${p.id}/sprints`,
              urgency: 'high'
            });
          }
        });
      });
    });

    // Sort actions by urgency
    pendingActions.sort((a, b) => (a.urgency === 'high' ? -1 : 1));

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-end mb-6">
          {user.role === 'PROJECT_MANAGER' && (
            <CreateProjectForm interns={interns} memberManagers={memberManagers} partners={partners} />
          )}
        </div>
        
        {/* TOP METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#262626] flex flex-col justify-center">
            <span className="text-gray-500 dark:text-[#737373] text-[10px] font-bold uppercase tracking-wider mb-1">Tổng Interns</span>
            <span className="text-3xl font-black text-gray-900 dark:text-[#EDEDED]">{interns.length}</span>
          </div>
          <div className="bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#262626] flex flex-col justify-center">
            <span className="text-gray-500 dark:text-[#737373] text-[10px] font-bold uppercase tracking-wider mb-1">Dự án đang chạy</span>
            <span className="text-3xl font-black text-blue-600">{activeProjects}</span>
          </div>
          <div className="bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#262626] flex flex-col justify-center">
            <span className="text-gray-500 dark:text-[#737373] text-[10px] font-bold uppercase tracking-wider mb-1">Cảnh báo rủi ro</span>
            <span className="text-3xl font-black text-red-500">{atRiskProjects}</span>
          </div>
          <div className="bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#262626] flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-gray-500 dark:text-[#737373] text-[10px] font-bold uppercase tracking-wider mb-1">Cần ProjectManager xử lý</span>
              <span className="text-3xl font-black text-purple-600">{pendingActions.length}</span>
            </div>
            {pendingActions.length > 0 && (
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* BIỂU ĐỒ TỔNG HỢP PROJECT_MANAGER */}
        {interns.length > 0 && (
          <ProjectManagerCharts interns={interns} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN TABLE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden min-h-[400px] flex flex-col">
              <div className="p-5 border-b border-gray-100 dark:border-[#262626] flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Danh sách Interns theo dõi</h3>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50/50 dark:bg-[#0A0A0A]/50 border-b border-gray-100 dark:border-[#262626]">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">Thực tập sinh</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">Dự án & Tiến độ</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider text-center">Trạng thái (Risk)</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider text-right">Báo cáo gần nhất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                    {[...interns]
                      .sort((a, b) => {
                        const riskA = a.projectsAsIntern[0] ? calculateProjectRisk(a.projectsAsIntern[0] as any) : 'N/A';
                        const riskB = b.projectsAsIntern[0] ? calculateProjectRisk(b.projectsAsIntern[0] as any) : 'N/A';
                        const weight: Record<string, number> = { 'RED': 3, 'YELLOW': 2, 'GREEN': 1, 'N/A': 0 };
                        return weight[riskB] - weight[riskA];
                      })
                      .slice(0, 4)
                      .map(intern => {
                      const project = intern.projectsAsIntern[0];
                      const risk = project ? calculateProjectRisk(project as any) : 'N/A';
                      
                      let progress = 0;
                      if (project && project.workItems.length > 0) {
                        const done = project.workItems.filter(w => w.status === 'DONE').length;
                        progress = Math.round((done / project.workItems.length) * 100);
                      }

                      return (
                      <tr key={intern.id} className="hover:bg-gray-50/50 dark:hover:bg-[#262626]/50 transition-colors group">
                        <td className="px-5 py-4">
                          <Link href={project ? `/dashboard/${project.id}` : '#'} className="block">
                            <div className="font-bold text-sm text-gray-900 dark:text-[#EDEDED] group-hover:text-blue-600 transition-colors">{intern.name}</div>
                            <div className="text-xs mt-0.5 text-gray-500 dark:text-[#737373]">{intern.email}</div>
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-gray-800 dark:text-[#D4D4D4] mb-1.5 truncate max-w-[200px]">
                            {project?.title || 'Chưa phân bổ'}
                          </div>
                          {project && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#383838] rounded-full overflow-hidden w-24">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-gray-500">{progress}%</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {risk !== 'N/A' ? (
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md ${
                              risk === 'RED' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' :
                              risk === 'YELLOW' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400' :
                              'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                            }`}>
                              {risk}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="text-xs font-medium text-gray-600 dark:text-[#A3A3A3]">
                            {project?.checkIns[0]?.createdAt 
                              ? new Date(project.checkIns[0].createdAt).toLocaleDateString('vi-VN') 
                              : 'Chưa có'}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                    {interns.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">
                          Chưa có thực tập sinh nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {interns.length > 4 && (
                <div className="p-4 border-t border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#0A0A0A]/50 text-center mt-auto">
                  <Link href="/dashboard/members" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5">
                    Xem toàn bộ {interns.length} Thực tập sinh
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONABLE INSIGHTS & UTILITIES */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Insights Panel */}
            <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-100 dark:border-[#262626] bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/10 dark:to-[#171717]">
                <h3 className="font-bold text-gray-900 dark:text-[#EDEDED] flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">⚡</span> Hoạt động Cần xử lý
                </h3>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto">
                {pendingActions.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-sm text-gray-500 font-medium">Tuyệt vời! Không có việc gì tồn đọng.</p>
                    <p className="text-xs text-gray-400 mt-1">Đội ngũ của bạn đang hoạt động rất trơn tru.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <ul className="space-y-3 flex-1">
                      {pendingActions.slice(0, 4).map(action => (
                        <li key={action.id}>
                          <Link href={action.link} className={`block p-3 rounded-xl border transition-colors hover:shadow-sm ${
                            action.urgency === 'high' 
                              ? 'bg-red-50/50 border-red-100 hover:bg-red-50 dark:bg-red-900/10 dark:border-red-900/30' 
                              : 'bg-orange-50/50 border-orange-100 hover:bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/30'
                          }`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                action.urgency === 'high' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                              }`}>
                                {action.type === 'MISSING_CHECKIN' ? 'Bỏ lỡ Check-in' : action.type === 'BLOCKED_TASK' ? 'Task bị kẹt' : 'Chưa Review'}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500">{action.internName}</span>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-[#EDEDED] leading-relaxed">{action.title}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    
                    {pendingActions.length > 4 && (
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#262626] text-center">
                        <Link href="/dashboard/project-manager/inbox" className="text-[12px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center justify-center gap-1.5 transition-colors">
                          + {pendingActions.length - 4} hoạt động khác chưa xử lý
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // INTERN VIEW
  const projects = await prisma.project.findMany({
    where: { internId: user.id },
    orderBy: { startDate: 'desc' },
    include: {
      workItems: true,
      checkIns: {
        orderBy: { createdAt: 'desc' }
      },
      sprints: true
    }
  });

  if (projects.length > 0) {
    redirect(`/dashboard/${projects[0].id}`);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Xin chào, {user.name} 👋</h2>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-6 rounded-2xl text-yellow-800 dark:text-yellow-200 shadow-sm dark:shadow-none">
        <p className="font-semibold text-lg">Bạn chưa có dự án nào!</p>
        <p className="mt-1 text-sm opacity-90">Hãy liên hệ ProjectManager để bắt đầu một dự án mới.</p>
      </div>
    </div>
  );
}

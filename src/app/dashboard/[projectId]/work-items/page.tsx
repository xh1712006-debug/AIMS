import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateWorkItemForm from "./CreateWorkItemForm";
import KanbanBoard from "./KanbanBoard";
import WorkItemActionsMenu from "./WorkItemActionsMenu";
import WorkItemComments from "./WorkItemComments";

export default async function SprintsPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const project = await prisma.project.findFirst({
    where: { 
      id: projectId, 
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } :
          session.user.role === 'MEMBER_MANAGER' ? { memberManagerId: session.user.id } :
          session.user.role === 'PARTNER' ? { partnerId: session.user.id } :
          session.user.role === 'PROJECT_MANAGER' ? { projectManagerId: session.user.id } : {})
    },
    include: {
      workItems: { 
        orderBy: { createdAt: 'desc' },
        include: {
          priority: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: 'asc' }
          }
        }
      },
      priorityLevels: {
        orderBy: { level: 'asc' }
      }
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;
  const workItems = project.workItems;
  // Top-level items (Feature/Research/Experiment/Analysis) → shown in Roadmap section
  const TOP_LEVEL_TYPES = ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'];
  const topLevelItems = workItems.filter(item => TOP_LEVEL_TYPES.includes(item.type));
  // Child/granular items (Bug/Spike/Test/Documentation) → shown in Kanban board
  const kanbanItems = workItems.filter(item => !TOP_LEVEL_TYPES.includes(item.type));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto pb-12">
      
      {/* ── Page Header ── */}
      <div className="flex justify-end mb-6 pt-2">
        {(session.user.role === 'INTERN' || session.user.role === 'PROJECT_MANAGER' || session.user.role === 'MEMBER_MANAGER') && (
          <CreateWorkItemForm projectId={projectId} parentItems={topLevelItems} priorityLevels={project.priorityLevels} userRole={session.user.role} />
        )}
      </div>
      
      {/* ── Roadmap (Epics) Section ── */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Roadmap (Feature / Research / Experiment / Analysis)
          </h3>
          <span className="badge badge-accent text-[10px] uppercase font-bold shadow-sm">
            {topLevelItems.length} mục tiêu
          </span>
        </div>
        
        {topLevelItems.length === 0 ? (
          <div className="py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center max-w-4xl mx-auto" style={{ borderColor: 'var(--border-muted)' }}>
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Chưa có mục tiêu nào</p>
            <p className="text-sm font-medium mt-1.5" style={{ color: 'var(--text-muted)' }}>PM hãy tạo Feature/Research/Experiment để định hướng lộ trình dự án.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-[#262626]">
              {topLevelItems.map(goal => {
                const childItems = workItems.filter(i => i.parentId === goal.id);
                const totalChildren = childItems.length;
                const doneChildren = childItems.filter(i => i.status === 'DONE').length;
                const progressPercent = totalChildren > 0 ? Math.round((doneChildren / totalChildren) * 100) : 0;
                const isBlocked = childItems.some(i => i.status === 'BLOCKED');
                let riskLevel = null;
                if (goal.dueDate && progressPercent < 100) {
                  const dueTime = new Date(goal.dueDate).getTime();
                  const nowTime = new Date().getTime();
                  const daysDiff = (dueTime - nowTime) / (1000 * 3600 * 24);
                  if (daysDiff < 0) riskLevel = 'OVERDUE';
                  else if (daysDiff <= 3) riskLevel = 'RISK';
                }
                
                return (
                  <details key={goal.id} className="group">
                    <summary className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#1f1f1f] cursor-pointer transition-colors list-none relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isBlocked ? 'bg-red-500' : riskLevel ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                      
                      {/* Chevron */}
                      <svg className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>

                      {/* Info */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-5 flex items-center gap-2">
                          <span className="badge badge-muted text-[10px] uppercase font-bold shrink-0">{goal.type}</span>
                          <span className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{goal.title}</span>
                        </div>
                        
                        <div className="md:col-span-3 flex flex-wrap items-center gap-2">
                          {isBlocked && <span className="badge badge-danger text-[9px] uppercase">⛔ Bị chặn</span>}
                          {riskLevel === 'OVERDUE' && <span className="badge badge-danger text-[9px] uppercase">⚠️ Trễ hạn</span>}
                          {riskLevel === 'RISK' && <span className="badge badge-warning text-[9px] uppercase">🚩 Nguy cơ</span>}
                          {goal.dueDate && (
                            <span className="badge badge-muted text-[9px] uppercase">
                              📅 {new Date(goal.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>

                        <div className="md:col-span-3 flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-500 shrink-0 w-6 text-right">{progressPercent}%</span>
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>
                          <span className={`badge text-[9px] uppercase shrink-0 ${
                            goal.status === 'DONE' ? 'badge-success' :
                            goal.status === 'IN_PROGRESS' ? 'badge-info' :
                            'badge-muted'
                          }`}>
                            {goal.status}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 ml-4 flex items-center gap-2">
                        {(session.user.role === 'INTERN' || session.user.role === 'PROJECT_MANAGER' || session.user.role === 'MEMBER_MANAGER') && (
                          <WorkItemActionsMenu item={goal} epics={topLevelItems} projectId={projectId} priorityLevels={project.priorityLevels} />
                        )}
                      </div>
                    </summary>
                    
                    {/* Expanded Content */}
                    <div className="p-5 pl-10 border-t border-gray-100 dark:border-[#262626] bg-gray-50/30 dark:bg-[#111]">
                      {goal.description && (
                        <div className="mb-6">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Mô tả mục tiêu</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{goal.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Thống kê Task con</h4>
                          <div className="bg-white dark:bg-[#171717] rounded-xl p-4 border border-gray-100 dark:border-[#262626]">
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span className="text-gray-500">Tổng số task:</span>
                              <span className="font-bold">{totalChildren}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span className="text-gray-500">Đã hoàn thành:</span>
                              <span className="font-bold text-emerald-500">{doneChildren}</span>
                            </div>
                            {goal.priority && (
                              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 dark:border-[#262626]">
                                <span className="text-gray-500">Mức ưu tiên:</span>
                                <span 
                                  className="badge text-[9px] uppercase"
                                  style={{ 
                                    backgroundColor: goal.priority.color ? `${goal.priority.color}15` : 'var(--bg-muted)', 
                                    color: goal.priority.color || 'var(--text-secondary)',
                                  }}
                                >
                                  {goal.priority.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="lg:col-span-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Trao đổi & Cập nhật</h4>
                          <WorkItemComments workItemId={goal.id} comments={goal.comments || []} />
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* ── Kanban Board Section ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Bảng công việc chi tiết
          </h3>
        </div>
        <KanbanBoard 
          workItems={kanbanItems} 
          epics={topLevelItems} 
          projectId={projectId} 
          priorityLevels={project.priorityLevels}
          userRole={session.user.role} 
        />
      </div>
    </div>
  );
}

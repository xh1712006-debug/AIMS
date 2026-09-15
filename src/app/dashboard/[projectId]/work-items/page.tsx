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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 pt-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Roadmap & Backlog</h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Quản lý tầm nhìn dự án (Epic) và các công việc chưa được gán vào Sprint.</p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {topLevelItems.map(epic => {
              const childItems = workItems.filter(i => i.parentId === epic.id);
              const totalChildren = childItems.length;
              const doneChildren = childItems.filter(i => i.status === 'DONE').length;
              const progressPercent = totalChildren > 0 ? Math.round((doneChildren / totalChildren) * 100) : 0;
              const isBlocked = childItems.some(i => i.status === 'BLOCKED');
              let riskLevel = null;
              if (epic.dueDate && progressPercent < 100) {
                const dueTime = new Date(epic.dueDate).getTime();
                const nowTime = new Date().getTime();
                const daysDiff = (dueTime - nowTime) / (1000 * 3600 * 24);
                
                if (daysDiff < 0) riskLevel = 'OVERDUE';
                else if (daysDiff <= 3) riskLevel = 'RISK';
              }
              
              return (
              <div key={epic.id} className="aims-card p-5 group hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col h-full relative overflow-hidden">
                {/* Status Indicator Line */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${isBlocked ? 'bg-red-500' : riskLevel ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                
                <div className="flex justify-between items-start mb-3 pl-2">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-base leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{epic.title}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {isBlocked && (
                        <span className="badge badge-danger text-[9px] uppercase">⛔ Bị chặn</span>
                      )}
                      {riskLevel === 'OVERDUE' && (
                        <span className="badge badge-danger text-[9px] uppercase">⚠️ Trễ hạn</span>
                      )}
                      {riskLevel === 'RISK' && (
                        <span className="badge badge-warning text-[9px] uppercase">🚩 Nguy cơ trễ</span>
                      )}
                      {epic.dueDate && (
                        <span className="badge badge-muted text-[9px] uppercase">
                          📅 {new Date(epic.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-start gap-2">
                    <span className={`badge text-[9px] uppercase ${
                      epic.status === 'DONE' ? 'badge-success' :
                      epic.status === 'IN_PROGRESS' ? 'badge-info' :
                      'badge-muted'
                    }`}>
                      {epic.status}
                    </span>
                    {(session.user.role === 'INTERN' || session.user.role === 'PROJECT_MANAGER' || session.user.role === 'MEMBER_MANAGER') && (
                      <div className="mt-[-4px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <WorkItemActionsMenu item={epic} epics={topLevelItems} projectId={projectId} priorityLevels={project.priorityLevels} />
                      </div>
                    )}
                  </div>
                </div>
                
                {epic.description && <p className="text-sm line-clamp-2 mb-4 pl-2" style={{ color: 'var(--text-secondary)' }}>{epic.description}</p>}
                
                <div className="flex-1" /> {/* Spacer */}
                
                {/* Progress Bar */}
                {totalChildren > 0 && (
                  <div className="mb-4 pl-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      <span>Tiến độ</span>
                      <span className={progressPercent === 100 ? 'text-emerald-500' : ''}>{progressPercent}%</span>
                    </div>
                    <div className="progress-bar h-1.5 bg-gray-100 dark:bg-gray-800">
                      <div 
                        className={`progress-bar-fill ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-3 border-t pl-2 flex justify-between items-center" style={{ borderColor: 'var(--border-muted)' }}>
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{totalChildren} task</span>
                  </div>
                  {epic.priority && (
                    <span 
                      className="badge text-[9px] uppercase"
                      style={{ 
                        backgroundColor: epic.priority.color ? `${epic.priority.color}15` : 'var(--bg-muted)', 
                        color: epic.priority.color || 'var(--text-secondary)',
                        borderColor: epic.priority.color ? `${epic.priority.color}40` : 'var(--border-color)'
                      }}
                    >
                      {epic.priority.name}
                    </span>
                  )}
                </div>
                
                <div className="pl-2 mt-3">
                  <WorkItemComments workItemId={epic.id} comments={epic.comments || []} />
                </div>
              </div>
              );
            })}
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

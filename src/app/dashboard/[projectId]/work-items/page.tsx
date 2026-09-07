import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateWorkItemForm from "./CreateWorkItemForm";
import KanbanBoard from "./KanbanBoard";
import WorkItemActionsMenu from "./WorkItemActionsMenu";

export default async function SprintsPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId, 
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } : {}) 
    },
    include: {
      workItems: { 
        orderBy: { createdAt: 'desc' },
        include: { priority: true }
      },
      priorityLevels: {
        orderBy: { level: 'asc' }
      }
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;
  const workItems = project.workItems;
  const epics = workItems.filter(item => item.type === 'EPIC');
  const kanbanItems = workItems.filter(item => item.type !== 'EPIC');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Roadmap & Backlog</h2>
        {session.user.role === 'INTERN' && (
          <CreateWorkItemForm projectId={projectId} epics={epics} priorityLevels={project.priorityLevels} />
        )}
      </div>
      
      {/* Roadmap (Epics) Section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🗺️ Roadmap (Epics)
          <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            {epics.length} tính năng lớn
          </span>
        </h3>
        
        {epics.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Chưa có Epic nào. Hãy tạo Epic để nhóm các công việc lớn.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {epics.map(epic => {
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
              <div key={epic.id} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 border-l-4 hover:shadow-md transition-shadow ${isBlocked ? 'border-l-red-500' : riskLevel ? 'border-l-orange-500' : 'border-l-purple-500'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-gray-900 leading-tight mb-1">{epic.title}</h4>
                    <div className="flex flex-wrap gap-1">
                      {isBlocked && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[10px] rounded font-bold flex items-center gap-0.5">
                          ⛔ Bị chặn
                        </span>
                      )}
                      {riskLevel === 'OVERDUE' && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 text-[10px] rounded font-bold flex items-center gap-0.5">
                          ⚠️ Đã trễ hạn
                        </span>
                      )}
                      {riskLevel === 'RISK' && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] rounded font-bold flex items-center gap-0.5">
                          🚩 Nguy cơ trễ hạn
                        </span>
                      )}
                      {epic.dueDate && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] rounded font-medium flex items-center gap-0.5">
                          📅 {new Date(epic.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 flex items-start gap-2">
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold border ${
                      epic.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                      epic.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {epic.status}
                    </span>
                    {session.user.role === 'INTERN' && (
                      <div className="mt-[-4px]">
                        <WorkItemActionsMenu item={epic} epics={epics} projectId={projectId} priorityLevels={project.priorityLevels} />
                      </div>
                    )}
                  </div>
                </div>
                {epic.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{epic.description}</p>}
                
                {/* Progress Bar */}
                {totalChildren > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-[10px] mb-1 font-medium text-gray-500">
                      <span>Tiến độ</span>
                      <span className={progressPercent === 100 ? 'text-green-600 font-bold' : ''}>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{totalChildren} công việc con</span>
                  </div>
                  {epic.priority && (
                    <span 
                      className="px-1.5 py-0.5 text-[10px] rounded font-medium border"
                      style={{ 
                        backgroundColor: epic.priority.color ? `${epic.priority.color}15` : '#f3f4f6', 
                        color: epic.priority.color || '#374151',
                        borderColor: epic.priority.color ? `${epic.priority.color}30` : '#e5e7eb'
                      }}
                    >
                      {epic.priority.name}
                    </span>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Kanban Board (Stories, Tasks, Bugs) */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          📋 Bảng công việc chi tiết
        </h3>
        <KanbanBoard 
          workItems={kanbanItems} 
          epics={epics} 
          projectId={projectId} 
          priorityLevels={project.priorityLevels}
          userRole={session.user.role} 
        />
      </div>
    </div>
  );
}

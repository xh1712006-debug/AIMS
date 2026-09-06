import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateWorkItemForm from "./CreateWorkItemForm";
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Work Items - {project.title}</h2>
        {session.user.role === 'INTERN' && (
          <CreateWorkItemForm projectId={projectId} epics={epics} priorityLevels={project.priorityLevels} />
        )}
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Product Backlog</h3>
        <div className="space-y-4">
          {workItems.length === 0 ?
            <p className="text-gray-500 text-sm italic">Chưa có công việc nào.</p>
          :
            workItems.map((item) => (
              <div key={item.id} className={`p-4 transition-colors rounded-xl border ${item.requiresFix ? 'bg-red-50/30 border-red-200' : 'bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded font-medium">{item.type}</span>
                      {item.priority ? (
                        <span 
                          className="px-2 py-0.5 text-[11px] rounded font-bold border opacity-90"
                          style={{ 
                            backgroundColor: item.priority.color ? `${item.priority.color}20` : '#f3f4f6', 
                            color: item.priority.color || '#374151',
                            borderColor: item.priority.color ? `${item.priority.color}40` : '#e5e7eb'
                          }}
                        >
                          {item.priority.name}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] rounded font-bold border bg-gray-100 text-gray-500 border-gray-200 opacity-90">
                          Chưa phân loại
                        </span>
                      )}
                      {item.requiresFix && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-bold ml-2">CẦN KHẮC PHỤC</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg whitespace-nowrap">
                      {item.status}
                    </span>
                    {session.user.role === 'INTERN' && (
                      <WorkItemActionsMenu item={item} epics={epics} projectId={projectId} priorityLevels={project.priorityLevels} />
                    )}
                  </div>
                </div>

                {/* Feedback Section */}
                {item.requiresFix && item.mentorFeedback && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-red-100 text-sm shadow-sm">
                    <p className="font-bold text-red-800 mb-1">Feedback từ Mentor:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.mentorFeedback}</p>
                    {session.user.role === 'INTERN' && (
                      <form action={import('@/app/actions').then(m => m.resolveFeedback)} className="mt-3">
                        <input type="hidden" name="workItemId" value={item.id} />
                        <input type="hidden" name="projectId" value={projectId} />
                        <button type="submit" className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded hover:bg-green-200 transition-colors">
                          Đã sửa xong
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Mentor Add Feedback */}
                {session.user.role === 'MENTOR' && !item.requiresFix && item.status !== 'DONE' && (
                  <form action={import('@/app/actions').then(m => m.addFeedback)} className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <input type="hidden" name="workItemId" value={item.id} />
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="text" name="feedback" required placeholder="Ghi chú yêu cầu sửa..." className="flex-1 rounded border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-1.5 text-xs" />
                    <button type="submit" className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors whitespace-nowrap">
                      Yêu cầu sửa
                    </button>
                  </form>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

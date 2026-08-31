import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createSprint } from "@/app/actions";

export default async function SprintsPlanningPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } : {}) 
    },
    include: {
      sprints: {
        include: { workItems: true },
        orderBy: { startDate: 'desc' }
      }
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;
  const sprints = project.sprints;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sprints - {project.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={session.user.role === 'INTERN' ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="space-y-6">
            {sprints.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                Chưa có Sprint nào. Hãy tạo Sprint đầu tiên!
              </div>
            ) : (
              sprints.map((sprint) => (
                <div key={sprint.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">{sprint.name}</h3>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sprint.startDate.toLocaleDateString('vi-VN')} - {sprint.endDate.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {sprint.workItems.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">Sprint này chưa có công việc nào.</p>
                    ) : (
                      sprint.workItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-transparent hover:border-gray-200">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded font-medium">{item.type}</span>
                              <span className={`px-2 py-0.5 text-xs rounded font-bold ${
                                item.priority === 'MUST' ? 'bg-red-100 text-red-700' :
                                item.priority === 'SHOULD' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>{item.priority}</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg whitespace-nowrap ml-4">
                            {item.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {session.user.role === 'INTERN' && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Tạo Sprint Mới</h3>
              <form action={createSprint} className="space-y-4">
                <input type="hidden" name="projectId" value={projectId} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Sprint</label>
                  <input name="name" required type="text" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="VD: Sprint 1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input name="startDate" required type="date" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày kết thúc</label>
                  <input name="endDate" required type="date" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold rounded-lg py-2.5 hover:bg-blue-500 transition-colors mt-2">
                  Tạo Sprint
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProjectDetailPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) redirect('/login');

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } : {}) 
    },
    include: {
      sprints: {
        where: { startDate: { lte: new Date() }, endDate: { gte: new Date() } }
      },
      workItems: {
        where: { status: { not: 'DONE' } },
        take: 5
      }
    }
  });

  if (!project) return <div>Dự án không tồn tại hoặc bạn không có quyền truy cập.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{project.title}</h3>
            <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Track: {project.track}
            </span>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sprint hiện hành</h4>
            {project.sprints.length > 0 ? (
              <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">{project.sprints[0].name}</span>
                  <span className="text-sm text-gray-500 block mt-1">
                    Từ {new Date(project.sprints[0].startDate).toLocaleDateString('vi-VN')} đến {new Date(project.sprints[0].endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-gray-500 text-sm">
                Hiện tại không có Sprint nào đang diễn ra.
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Thông tin Thời gian</h4>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700 mb-2"><strong>Bắt đầu:</strong> {project.startDate.toLocaleDateString('vi-VN')}</p>
              <p className="text-sm text-gray-700"><strong>Kết thúc:</strong> {project.endDate.toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Công việc Ưu tiên (To-Do / In Progress)</h4>
        {project.workItems.length > 0 ? (
          <ul className="space-y-3">
            {project.workItems.map(item => (
              <li key={item.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-transparent hover:border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Type: {item.type} &bull; Priority: {item.priority}</p>
                </div>
                <span className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <p className="text-gray-500 text-sm font-medium">Tuyệt vời! Bạn không còn việc nào đang tồn đọng.</p>
          </div>
        )}
      </div>
    </div>
  );
}

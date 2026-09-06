import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import InternCharts from "../InternCharts";
import { calculateProjectRisk } from "@/lib/risk";

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
        include: { priority: true }
      },
      checkIns: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) return <div>Dự án không tồn tại hoặc bạn không có quyền truy cập.</div>;

  // Calculate project stats
  const totalWorkItems = project.workItems.length;
  const doneWorkItems = project.workItems.filter(wi => wi.status === 'DONE').length;
  const totalCheckIns = project.checkIns.length;
  const latestRisk = calculateProjectRisk(project as any);

  // Get top priority tasks
  const priorityTasks = project.workItems.filter(wi => wi.status !== 'DONE').slice(0, 5);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Chi tiết dự án: {project.title}</h2>
      </div>

      {/* TỔNG QUAN THỐNG KÊ (NEW) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Công việc hiện tại</span>
          <span className="text-3xl font-black text-gray-900">{totalWorkItems}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Hoàn thành</span>
          <span className="text-3xl font-black text-blue-600">{doneWorkItems} <span className="text-lg text-gray-400">/ {totalWorkItems}</span></span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Số lần Check-in</span>
          <span className="text-3xl font-black text-purple-600">{totalCheckIns}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Trạng thái rủi ro</span>
          <span className={`text-xl mt-1 font-bold inline-flex items-center gap-1 ${
            latestRisk === 'RED' ? 'text-red-600' : latestRisk === 'YELLOW' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            <span className={`w-3 h-3 rounded-full ${
              latestRisk === 'RED' ? 'bg-red-500' : latestRisk === 'YELLOW' ? 'bg-yellow-500' : 'bg-green-500'
            }`}></span>
            {latestRisk}
          </span>
        </div>
      </div>

      {/* BIỂU ĐỒ THỐNG KÊ DỰ ÁN NÀY */}
      {/* We pass projects={[project]} because InternCharts expects an array of projects */}
      <InternCharts projects={[project]} />

      {/* THÔNG TIN SPRINT VÀ ƯU TIÊN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Thông tin Thời gian</h4>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-700 mb-2"><strong>Bắt đầu:</strong> {project.startDate.toLocaleDateString('vi-VN')}</p>
            <p className="text-sm text-gray-700"><strong>Kết thúc:</strong> {project.endDate.toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Công việc Ưu tiên (To-Do / In Progress)</h4>
        {priorityTasks.length > 0 ? (
          <ul className="space-y-3">
            {priorityTasks.map(item => (
              <li key={item.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-transparent hover:border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Type: {item.type} &bull; Priority: {item.priority?.name || 'Chưa phân loại'}</p>
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

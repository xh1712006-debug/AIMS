import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CreateProjectForm from "./CreateProjectForm";
import InternCharts from "./InternCharts";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  if (user.role === 'MENTOR') {
    const interns = await prisma.user.findMany({
      where: { role: 'INTERN' },
      include: {
        projects: {
          include: {
            checkIns: { orderBy: { createdAt: 'desc' }, take: 1 }
          }
        }
      }
    });

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Tổng quan Hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Tổng số Interns</h3>
              <p className="text-4xl font-black mt-2 text-gray-900">{interns.length}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Cảnh báo rủi ro</h3>
              <p className="text-4xl font-black mt-2 text-red-600">
                {interns.filter(i => i.projects.some(p => p.checkIns[0]?.riskStatus === 'RED' || p.checkIns[0]?.riskStatus === 'YELLOW')).length}
              </p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Danh sách Interns theo dõi</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thực tập sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dự án</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái (Risk)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Báo cáo gần nhất</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {interns.map(intern => (
                  <tr key={intern.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{intern.name}</div>
                      <div className="text-sm text-gray-500">{intern.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                      {intern.projects[0]?.title || 'Chưa phân bổ'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                        intern.projects[0]?.checkIns[0]?.riskStatus === 'RED' ? 'bg-red-100 text-red-700' :
                        intern.projects[0]?.checkIns[0]?.riskStatus === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          intern.projects[0]?.checkIns[0]?.riskStatus === 'RED' ? 'bg-red-500' :
                          intern.projects[0]?.checkIns[0]?.riskStatus === 'YELLOW' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></span>
                        {intern.projects[0]?.checkIns[0]?.riskStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {intern.projects[0]?.checkIns[0]?.createdAt 
                        ? new Date(intern.projects[0].checkIns[0].createdAt).toLocaleDateString('vi-VN') 
                        : 'Chưa có dữ liệu'}
                    </td>
                  </tr>
                ))}
                {interns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      Chưa có thực tập sinh nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Phân công Dự án Mới</h3>
              <CreateProjectForm interns={interns} />
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

  // Calculate overall stats
  const totalProjects = projects.length;
  const totalWorkItems = projects.reduce((acc, p) => acc + p.workItems.length, 0);
  const doneWorkItems = projects.reduce((acc, p) => acc + p.workItems.filter(wi => wi.status === 'DONE').length, 0);
  const totalCheckIns = projects.reduce((acc, p) => acc + p.checkIns.length, 0);
  const totalSprints = projects.reduce((acc, p) => acc + p.sprints.length, 0);
  const latestRisk = projects[0]?.checkIns[0]?.riskStatus || 'GREEN';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Xin chào, {user.name} 👋</h2>
      </div>

      {/* TỔNG QUAN THỐNG KÊ (NEW) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Dự án tham gia</span>
          <span className="text-3xl font-black text-gray-900">{totalProjects}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Công việc hoàn thành</span>
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

      {/* BIỂU ĐỒ THỐNG KÊ */}
      <InternCharts projects={projects} />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Các dự án của bạn</h3>
          {projects.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl text-yellow-800 shadow-sm">
              <p className="font-semibold text-lg">Bạn chưa có dự án nào!</p>
              <p className="mt-1 text-sm opacity-90">Hãy liên hệ Mentor để bắt đầu một dự án mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map(project => {
                const projectDoneItems = project.workItems.filter(wi => wi.status === 'DONE').length;
                const progress = project.workItems.length > 0 ? Math.round((projectDoneItems / project.workItems.length) * 100) : 0;
                
                return (
                  <a href={`/dashboard/${project.id}`} key={project.id} className="block group">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group-hover:border-blue-500 group-hover:shadow-md transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{project.title}</h3>
                          <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                            Track: {project.track.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-right text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          {project.startDate.toLocaleDateString('vi-VN')} - {project.endDate.toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Tiến độ công việc</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Check-ins</p>
                          <p className="text-sm font-bold text-gray-700">{project.checkIns.length} lần</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Sprints</p>
                          <p className="text-sm font-bold text-gray-700">{project.sprints.length} Sprints</p>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Thông báo</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Quyền tạo dự án thuộc về Mentor. Vui lòng liên hệ Mentor của bạn nếu cần phân bổ thêm dự án mới.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Lời khuyên (Agile)</h4>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4 marker:text-gray-300">
                <li>Luôn cập nhật Daily Check-in đầy đủ.</li>
                <li>Không sử dụng % complete làm chỉ số duy nhất để đánh giá dự án.</li>
                <li>Gắn Evidence Link minh chứng cho các công việc Done.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

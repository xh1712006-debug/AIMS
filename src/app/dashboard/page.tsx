import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Danh sách Interns theo dõi</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thực tập sinh</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dự án</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái (Risk)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in gần nhất</th>
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
      </div>
    );
  }

  // INTERN VIEW
  const projects = await prisma.project.findMany({
    where: { internId: user.id },
    include: {
      sprints: {
        where: { startDate: { lte: new Date() }, endDate: { gte: new Date() } }
      },
      backlogs: {
        where: { status: { not: 'DONE' } },
        take: 5
      }
    }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Xin chào, {user.name} 👋</h2>
      {projects.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl text-yellow-800 shadow-sm">
          <p className="font-semibold text-lg">Bạn chưa được phân công dự án nào!</p>
          <p className="mt-1 text-sm opacity-90">Vui lòng liên hệ với Mentor để được tạo dự án và bắt đầu Sprint.</p>
        </div>
      ) : (
        projects.map(project => (
          <div key={project.id} className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{project.title}</h3>
                  <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Track: {project.track}
                  </span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sprint hiện hành</h4>
                {project.sprints.length > 0 ? (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
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
                    Hiện tại không có Sprint nào đang diễn ra. Hãy lập kế hoạch cho Sprint mới.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Công việc Ưu tiên (To-Do / In Progress)</h4>
              {project.backlogs.length > 0 ? (
                <ul className="space-y-3">
                  {project.backlogs.map(backlog => (
                    <li key={backlog.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-transparent hover:border-gray-200">
                      <div>
                        <p className="font-bold text-gray-900">{backlog.title}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Type: {backlog.type} &bull; Priority: {backlog.priority}</p>
                      </div>
                      <span className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">
                        {backlog.status}
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
        ))
      )}
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateProjectRisk } from "@/lib/risk";

export const metadata = {
  title: 'Trang chủ Scrum Master | AIMS',
};

export default async function MemberManagerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'MEMBER_MANAGER') {
    redirect('/dashboard');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projectsAsMM: {
        include: {
          intern: true,
          workItems: true,
          checkIns: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      }
    }
  });

  if (!user) return null;

  const projects = user.projectsAsMM || [];
  
  let activeBlockers = 0;
  projects.forEach((p: any) => {
    p.workItems.forEach((wi: any) => {
      if (wi.status === 'BLOCKED') activeBlockers++;
    });
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Trang chủ Scrum Master</h2>
        <p className="text-gray-500 dark:text-[#A3A3A3] mt-2">Quản lý sự kiện Agile, tháo gỡ khó khăn và theo dõi tiến độ của team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#171717] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626]">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Dự án đang hỗ trợ</h3>
          <p className="text-3xl font-black text-blue-600">{projects.length}</p>
        </div>
        <div className="bg-white dark:bg-[#171717] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626]">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Blockers cần xử lý</h3>
          <p className="text-3xl font-black text-red-500">{activeBlockers}</p>
        </div>
        <div className="bg-white dark:bg-[#171717] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626]">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Sự kiện tuần này</h3>
          <p className="text-3xl font-black text-purple-600">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-[#262626]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Danh sách Dự án</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 dark:text-[#737373] uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Tên Dự án</th>
                <th className="px-6 py-4">Thực tập sinh</th>
                <th className="px-6 py-4 text-center">Trạng thái (Risk)</th>
                <th className="px-6 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">Chưa có dự án nào được phân công.</td>
                </tr>
              ) : (
                projects.map((project: any) => {
                  const risk = calculateProjectRisk(project);
                  return (
                    <tr key={project.id} className="hover:bg-gray-50/50 dark:hover:bg-[#262626]/50">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-[#EDEDED]">{project.title}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{project.intern.name}</div>
                        <div className="text-xs text-gray-500">{project.intern.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md ${
                          risk === 'RED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          risk === 'YELLOW' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/${project.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Xem chi tiết</Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

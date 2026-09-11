import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateProjectRisk } from "@/lib/risk";

export const metadata = {
  title: 'Theo dõi Dự án | AIMS',
};

export default async function MMProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'MEMBER_MANAGER') redirect('/dashboard');

  const projects = await prisma.project.findMany({
    where: { memberManagerId: session.user.id },
    include: {
      intern: true,
      workItems: true,
      sprints: true,
    },
    orderBy: { startDate: 'desc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Theo dõi Dự án</h2>
        <p className="text-gray-500 mt-2">Tổng quan chi tiết các dự án bạn đang đảm nhiệm vai trò Scrum Master.</p>
      </div>
      
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 dark:text-[#737373] font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Tên Dự Án</th>
                <th className="px-6 py-4">Thực tập sinh</th>
                <th className="px-6 py-4">Tiến độ (Công việc)</th>
                <th className="px-6 py-4 text-center">Sprints</th>
                <th className="px-6 py-4 text-center">Rủi ro</th>
                <th className="px-6 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:border-[#262626]">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chưa có dự án nào được phân bổ cho bạn.</td>
                </tr>
              ) : (
                projects.map(project => {
                  const doneCount = project.workItems.filter(wi => wi.status === 'DONE').length;
                  const totalCount = project.workItems.length;
                  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
                  const risk = calculateProjectRisk(project);

                  return (
                    <tr key={project.id} className="hover:bg-gray-50/50 dark:hover:bg-[#262626]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-[#EDEDED]">{project.title}</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{project.track.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 dark:text-[#D4D4D4]">{project.intern.name}</div>
                        <div className="text-xs text-gray-500">{project.intern.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-[#383838] rounded-full overflow-hidden w-24">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-[#D4D4D4]">{percent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-700 dark:text-[#D4D4D4]">{project.sprints.length}</span>
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
                        <Link href={`/dashboard/${project.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                          Mở Dashboard
                        </Link>
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

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";

export default async function MentorProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'MENTOR') {
    redirect('/dashboard');
  }

  const projects = await prisma.project.findMany({
    include: {
      intern: true,
      workItems: true,
    },
    orderBy: { startDate: 'desc' }
  });

  const interns = await prisma.user.findMany({
    where: { role: 'INTERN' },
    select: { id: true, name: true, email: true }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#F1F5F9] tracking-tight">Quản lý Dự án Toàn cục</h2>
          <p className="text-gray-500 dark:text-[#64748B] mt-2">Tổng hợp tất cả dự án của các sinh viên đang thực tập.</p>
        </div>
        <CreateProjectModal interns={interns} />
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-[#0F172A] text-gray-500 dark:text-[#64748B] font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Tên Dự Án</th>
                <th className="px-6 py-4">Thực tập sinh</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Tiến độ (Work Items)</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-[#64748B] italic">Chưa có dự án nào.</td>
                </tr>
              ) : (
                projects.map((project) => {
                  const totalItems = project.workItems.length;
                  const doneItems = project.workItems.filter(item => item.status === 'DONE').length;
                  const progress = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-50/50 dark:bg-[#0F172A]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-[#F1F5F9]">
                        {project.title}
                        <div className="text-xs text-gray-500 dark:text-[#64748B] font-medium mt-1">{project.track}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 dark:text-[#F1F5F9]">{project.intern.name}</div>
                        <div className="text-xs text-gray-500 dark:text-[#64748B]">{project.intern.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-[#94A3B8]">
                        {new Date(project.startDate).toLocaleDateString('vi-VN')} - {new Date(project.endDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-[#CBD5E1]">{progress}%</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#64748B] mt-1">{doneItems}/{totalItems} tasks DONE</div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Link href={`/dashboard/${project.id}`} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 rounded-lg transition-colors">
                          Chi tiết
                        </Link>
                        <EditProjectModal project={project} interns={interns} />
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

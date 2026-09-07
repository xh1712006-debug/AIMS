import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateProjectRisk } from "@/lib/risk";

export default async function InternDetailPage(props: { params: Promise<{ internId: string }> }) {
  const { internId } = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== 'MENTOR') {
    redirect('/dashboard');
  }

  const intern = await prisma.user.findUnique({
    where: { id: internId, role: 'INTERN' },
    include: {
      projects: {
        orderBy: { startDate: 'desc' },
        include: {
          sprints: {
            where: { startDate: { lte: new Date() }, endDate: { gte: new Date() } }
          },
          workItems: {
            select: { status: true }
          },
          checkIns: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      }
    }
  });

  if (!intern) return <div>Không tìm thấy thực tập sinh.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link href="/dashboard/interns" className="text-sm font-semibold text-gray-500 dark:text-[#64748B] hover:text-gray-900 dark:text-[#F1F5F9] flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Quay lại danh sách Interns
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#F1F5F9] tracking-tight">Hồ sơ: {intern.name}</h2>
        <p className="text-gray-500 dark:text-[#64748B]">{intern.email}</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-[#F1F5F9]">Các Dự án đang tham gia</h3>
        {intern.projects.length === 0 ? (
          <div className="p-8 bg-gray-50 dark:bg-[#0F172A] rounded-2xl border border-gray-100 dark:border-[#334155] text-center text-gray-500 dark:text-[#64748B]">
            Thực tập sinh này chưa được phân công dự án nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {intern.projects.map(project => {
              const pendingItemsCount = project.workItems.filter(wi => wi.status !== 'DONE').length;
              const risk = calculateProjectRisk(project as any);
              return (
              <div key={project.id} className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#334155]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-[#F1F5F9]">{project.title}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 mt-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                      Track: {project.track}
                    </span>
                  </div>
                  <Link href={`/dashboard/${project.id}`} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors">
                    Vào không gian làm việc
                  </Link>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-[#64748B]">Sprint hiện hành:</span>
                    <span className="font-semibold text-gray-900 dark:text-[#F1F5F9]">{project.sprints[0]?.name || 'Không có'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-[#64748B]">Work Items tồn đọng:</span>
                    <span className="font-semibold text-red-600">{pendingItemsCount} tasks</span>
                  </div>
                  
                  {project.checkIns.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#334155]">
                      <p className="text-xs font-bold text-gray-400 dark:text-[#475569] uppercase mb-2">Check-in gần nhất ({new Date(project.checkIns[0].createdAt).toLocaleDateString('vi-VN')})</p>
                      <p className="text-sm text-gray-700 dark:text-[#CBD5E1] line-clamp-2">{project.checkIns[0].doneTasks}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs font-semibold text-gray-500 dark:text-[#64748B] mr-2">Trạng thái rủi ro:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full ${
                          risk === 'RED' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                          risk === 'YELLOW' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                          'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        }`}>
                          {risk}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}

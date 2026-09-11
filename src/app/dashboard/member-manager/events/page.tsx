import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: 'Quản lý Sự kiện | AIMS',
};

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'MEMBER_MANAGER') redirect('/dashboard');

  const projects = await prisma.project.findMany({
    where: { memberManagerId: session.user.id },
    include: {
      intern: true,
      sprints: {
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        include: { sprintReview: true }
      }
    }
  });

  const now = new Date();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Quản lý Sự kiện Scrum</h2>
        <p className="text-gray-500 mt-2">Theo dõi Sprints hiện tại và các buổi lễ Scrum Planning, Review của nhóm.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(project => {
          const currentSprints = project.sprints.filter(s => new Date(s.startDate) <= now && new Date(s.endDate) >= now);
          const upcomingSprints = project.sprints.filter(s => new Date(s.startDate) > now);

          return (
            <div key={project.id} className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-[#262626] flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]/50">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-[#EDEDED]">{project.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Phụ trách: {project.intern.name}</p>
                </div>
                <Link href={`/dashboard/${project.id}/sprints`} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                  Đến bảng Sprint
                </Link>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sprint Đang diễn ra</h4>
                  {currentSprints.length > 0 ? currentSprints.map(sprint => (
                    <div key={sprint.id} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-blue-800 dark:text-blue-300">{sprint.name}</span>
                        <span className="text-[10px] bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full font-semibold">Active</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                        {new Date(sprint.startDate).toLocaleDateString('vi-VN')} - {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#D4D4D4]">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span>Daily Standup (Tự động hóa qua Check-ins)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#D4D4D4]">
                          <span className={`w-2 h-2 rounded-full ${sprint.sprintReview ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                          <span>Sprint Review / Retrospective {sprint.sprintReview ? '(Đã có)' : '(Đang chờ)'}</span>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gray-500 italic">Không có Sprint nào đang diễn ra.</p>}
                </div>

                {upcomingSprints.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-4">Sprint Sắp tới</h4>
                    <div className="space-y-2">
                      {upcomingSprints.slice(0, 2).map(sprint => (
                        <div key={sprint.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-[#262626]">
                          <span className="text-sm font-semibold text-gray-700 dark:text-[#D4D4D4]">{sprint.name}</span>
                          <span className="text-xs text-gray-500">{new Date(sprint.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-[#262626]">
            <p className="text-gray-500">Bạn chưa được phân công quản lý dự án nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}

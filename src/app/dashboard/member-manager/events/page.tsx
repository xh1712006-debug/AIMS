import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: 'Quản lý Sự kiện | AIMS',
};

const Icons = {
  calendar: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  chevronDown: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  checkCircle: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  clock: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
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

      
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
        {projects.length === 0 ? (
          <div className="py-16 text-center">
             <div className="w-16 h-16 bg-gray-50 dark:bg-[#262626] rounded-full flex items-center justify-center mx-auto mb-4">
               <Icons.calendar className="w-8 h-8 text-gray-400" />
             </div>
             <p className="text-gray-500 font-medium">Bạn chưa được phân công quản lý dự án nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 dark:text-[#737373] uppercase text-[10px] tracking-wider font-extrabold border-b border-gray-100 dark:border-[#262626]">
                <tr>
                  <th className="px-6 py-4">Dự án & Phụ trách</th>
                  <th className="px-6 py-4">Sprint Đang diễn ra</th>
                  <th className="px-6 py-4">Sự kiện Scrum (Review/Standup)</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                {projects.map(project => {
                  const currentSprints = project.sprints.filter(s => new Date(s.startDate) <= now && new Date(s.endDate) >= now);
                  const upcomingSprints = project.sprints.filter(s => new Date(s.startDate) > now);
                  
                  const activeSprint = currentSprints.length > 0 ? currentSprints[0] : null;

                  return (
                    <tr key={project.id} className="hover:bg-gray-50/50 dark:hover:bg-[#262626]/30 transition-colors">
                      {/* Cột 1: Dự án */}
                      <td className="px-6 py-3.5 align-top">
                        <div className="font-bold text-gray-900 dark:text-[#EDEDED] text-sm mb-1">{project.title}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[8px]">
                            {project.intern.name.charAt(0)}
                          </div>
                          {project.intern.name}
                        </div>
                      </td>
                      
                      {/* Cột 2: Sprint Hiện tại & Sắp tới */}
                      <td className="px-6 py-3.5 align-top">
                        {activeSprint ? (
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-blue-700 dark:text-blue-400">{activeSprint.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[8px] font-black uppercase tracking-wider">
                                Active
                              </span>
                            </div>
                            <div className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                              <Icons.calendar className="w-3 h-3" />
                              {new Date(activeSprint.startDate).toLocaleDateString('vi-VN')} - {new Date(activeSprint.endDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] italic text-gray-400 mb-2">Không có Sprint đang chạy</div>
                        )}
                        
                        {upcomingSprints.length > 0 && (
                          <details className="group">
                            <summary className="text-[10px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer list-none flex items-center gap-1 select-none">
                              Xem {upcomingSprints.length} Sprint sắp tới
                              <Icons.chevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-gray-100 dark:border-[#262626]">
                              {upcomingSprints.map(sprint => (
                                <div key={sprint.id} className="flex justify-between items-center text-[10px]">
                                  <span className="font-semibold text-gray-600 dark:text-[#A3A3A3]">{sprint.name}</span>
                                  <span className="text-gray-400">{new Date(sprint.startDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </td>

                      {/* Cột 3: Trạng thái Sự kiện */}
                      <td className="px-6 py-3.5 align-top">
                        {activeSprint ? (
                          <div className="space-y-2">
                            <div className="flex items-start gap-1.5">
                              <Icons.checkCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="text-[11px] font-bold text-gray-700 dark:text-[#D4D4D4]">Daily Standup</div>
                                <div className="text-[9px] text-gray-500">Tự động hóa qua Check-ins</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-1.5">
                              {activeSprint.sprintReview ? (
                                <Icons.checkCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                              ) : (
                                <Icons.clock className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                              )}
                              <div>
                                <div className="text-[11px] font-bold text-gray-700 dark:text-[#D4D4D4]">Sprint Review / Retrospective</div>
                                <div className={`text-[9px] font-semibold ${activeSprint.sprintReview ? 'text-green-600' : 'text-orange-500'}`}>
                                  {activeSprint.sprintReview ? 'Đã hoàn thành' : 'Đang lên lịch'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Cột 4: Thao tác */}
                      <td className="px-6 py-3.5 align-top text-right">
                        <Link 
                          href={`/dashboard/${project.id}/sprints`} 
                          className="inline-flex items-center justify-center text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          Bảng Sprint
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

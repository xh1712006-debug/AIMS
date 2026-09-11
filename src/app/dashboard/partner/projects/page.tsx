import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateProjectRisk } from "@/lib/risk";

export const metadata = {
  title: 'Tổng quan Dự án Đối tác | AIMS',
};

export default async function PartnerProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'PARTNER') redirect('/dashboard');

  const projects = await prisma.project.findMany({
    where: { partnerId: session.user.id },
    include: {
      intern: true,
      workItems: true,
    },
    orderBy: { startDate: 'desc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Trạng thái Dự án Chi tiết</h2>
        <p className="text-gray-500 mt-2">Tổng quan theo dõi cấp bậc cao nhất dành cho Đối tác.</p>
      </div>

      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-[#262626]">
            <p className="text-gray-500">Chưa có dự án nào thuộc tài khoản của bạn.</p>
          </div>
        ) : (
          projects.map(project => {
            const epics = project.workItems.filter(wi => wi.type === 'EPIC');
            const projectRisk = calculateProjectRisk(project);

            return (
              <div key={project.id} className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#262626] flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-[#EDEDED]">{project.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Lĩnh vực: {project.track.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-lg ${
                    projectRisk === 'RED' ? 'bg-red-50 text-red-700 border border-red-200' :
                    projectRisk === 'YELLOW' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    Rủi ro: {projectRisk}
                  </span>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Các tính năng lớn (Epics)</h4>
                  {epics.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Dự án này chưa được Project Manager lên kế hoạch Epic.</p>
                  ) : (
                    <div className="space-y-4">
                      {epics.map(epic => {
                        // Tính toán tiến độ dựa trên số task con của Epic này
                        const children = project.workItems.filter(wi => wi.parentId === epic.id);
                        const doneChildren = children.filter(wi => wi.status === 'DONE').length;
                        const totalChildren = children.length;
                        let progress = 0;
                        if (totalChildren > 0) progress = Math.round((doneChildren / totalChildren) * 100);
                        else if (epic.status === 'DONE') progress = 100;

                        return (
                          <div key={epic.id} className="border border-gray-100 dark:border-[#262626] rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-semibold text-gray-800 dark:text-[#D4D4D4]">{epic.title}</h5>
                              <span className="text-xs font-bold text-gray-500">{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-[#383838] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-[#525252]'
                              }`} style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateSprintModal from "./CreateSprintModal";
import SprintAccordion from "./SprintAccordion";

export default async function SprintsPlanningPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } :
          session.user.role === 'MEMBER_MANAGER' ? { memberManagerId: session.user.id } :
          session.user.role === 'PARTNER' ? { partnerId: session.user.id } : {})
    },
    include: {
      sprints: {
        include: { 
          workItems: {
            include: { priority: true },
            orderBy: { order: 'asc' }
          },
          sprintReview: true
        },
        orderBy: { startDate: 'desc' }
      },
      workItems: {
        where: { sprintId: null, type: { not: 'EPIC' } },
        include: { priority: true },
        orderBy: { order: 'asc' }
      },
      priorityLevels: {
        orderBy: { level: 'asc' }
      }
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;
  const sprints = project.sprints;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-gray-50/50 dark:bg-[#0A0A0A] min-h-[calc(100vh-6rem)] -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDED] flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Kế hoạch Sprint
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#737373] mt-1 ml-8">Theo dõi mục tiêu và tiến độ công việc theo từng giai đoạn.</p>
        </div>
        {session.user.role === 'INTERN' && (
          <CreateSprintModal projectId={projectId} />
        )}
      </div>

      <div className="space-y-6">
        {sprints.length === 0 ? (
          <div className="bg-white dark:bg-[#171717] p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] text-center text-gray-500 dark:text-[#737373] flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-200 dark:text-[#383838] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <h3 className="text-lg font-bold text-gray-700 dark:text-[#D4D4D4] mb-1">Chưa có Sprint nào</h3>
            <p className="text-sm">Hãy tạo Sprint đầu tiên để bắt đầu quá trình thực tập!</p>
          </div>
        ) : (
          sprints.map((sprint, index) => (
            <SprintAccordion
              key={sprint.id}
              sprint={sprint}
              sprintIndex={sprints.length - index}
              projectId={projectId}
              projectTrack={project.track}
              isIntern={session.user.role === 'INTERN'}
              unassignedWorkItems={project.workItems}
              priorityLevels={project.priorityLevels}
            />
          ))
        )}
      </div>
    </div>
  );
}

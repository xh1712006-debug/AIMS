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
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } : {}) 
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Kế hoạch Sprint</h2>
          <p className="text-sm text-gray-500 dark:text-[#64748B] mt-1">Theo dõi mục tiêu và tiến độ công việc theo từng giai đoạn.</p>
        </div>
        {session.user.role === 'INTERN' && (
          <CreateSprintModal projectId={projectId} />
        )}
      </div>

      <div className="space-y-4">
        {sprints.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#334155] text-center text-gray-500 dark:text-[#64748B]">
            Chưa có Sprint nào. Hãy tạo Sprint đầu tiên!
          </div>
        ) : (
          sprints.map((sprint) => (
            <SprintAccordion
              key={sprint.id}
              sprint={sprint}
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

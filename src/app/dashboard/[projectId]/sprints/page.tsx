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
            include: { priority: true }
          }
        },
        orderBy: { startDate: 'desc' }
      },
      workItems: {
        where: { sprintId: null },
        include: { priority: true }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sprints - {project.title}</h2>
        {session.user.role === 'INTERN' && (
          <CreateSprintModal projectId={projectId} />
        )}
      </div>

      <div className="space-y-6">
        {sprints.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            Chưa có Sprint nào. Hãy tạo Sprint đầu tiên!
          </div>
        ) : (
          sprints.map((sprint) => (
            <SprintAccordion
              key={sprint.id}
              sprint={sprint}
              projectId={projectId}
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

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

  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } :
          session.user.role === 'MEMBER_MANAGER' ? { memberManagerId: session.user.id } :
          session.user.role === 'PARTNER' ? { partnerId: session.user.id } :
          session.user.role === 'PROJECT_MANAGER' ? { projectManagerId: session.user.id } : {})
    },
    include: {
      sprints: {
        include: { 
          workItems: {
            include: { priority: true },
            orderBy: { order: 'asc' }
          },
          sprintReview: true
        }
      },
      workItems: {
        where: { sprintId: null, type: { notIn: ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'] } },
        include: { priority: true },
        orderBy: { order: 'asc' }
      },
      priorityLevels: {
        orderBy: { level: 'asc' }
      }
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = today.getTime();

  const getStatus = (startStr: string | Date, endStr: string | Date) => {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    if (now > end) return 'PAST';
    if (now >= start && now <= end) return 'ACTIVE';
    return 'FUTURE';
  };

  const statusOrder: Record<string, number> = { 'ACTIVE': 0, 'FUTURE': 1, 'PAST': 2 };

  const sortedSprints = [...project.sprints].sort((a, b) => {
    const statusA = getStatus(a.startDate, a.endDate);
    const statusB = getStatus(b.startDate, b.endDate);
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    const aStart = new Date(a.startDate).getTime();
    const bStart = new Date(b.startDate).getTime();
    if (statusA === 'PAST') return bStart - aStart;
    return aStart - bStart;
  });

  const activeSprints = sortedSprints.filter(s => getStatus(s.startDate, s.endDate) === 'ACTIVE');
  const futureSprints = sortedSprints.filter(s => getStatus(s.startDate, s.endDate) === 'FUTURE');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 pt-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Kế hoạch Sprint
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {sortedSprints.length} sprint tổng cộng
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              {activeSprints.length} Đang chạy
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
              {futureSprints.length} Sắp tới
            </span>
          </div>
        </div>
        {session.user.role === 'INTERN' && (
          <CreateSprintModal projectId={projectId} />
        )}
      </div>

      {sortedSprints.length === 0 ? (
        <div className="aims-card p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'var(--bg-muted)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Chưa có Sprint nào</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Hãy tạo Sprint đầu tiên để bắt đầu quá trình thực tập!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSprints.map((sprint, index) => (
            <SprintAccordion
              key={sprint.id}
              sprint={sprint}
              sprintIndex={index + 1}
              sprintStatus={getStatus(sprint.startDate, sprint.endDate)}
              projectId={projectId}
              isIntern={session.user.role === 'INTERN'}
              unassignedWorkItems={project.workItems}
              priorityLevels={project.priorityLevels}
            />
          ))}
        </div>
      )}
    </div>
  );
}

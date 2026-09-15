import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateCheckInModal from "./CreateCheckInModal";
import CheckInListClient from "./CheckInListClient";

export default async function CheckInsPage(props: { params: Promise<{ projectId: string }> }) {
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
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;

  const checkIns = await prisma.checkIn.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch tasks for suggestions
  let doneItems: any[] = [];
  let activeItems: any[] = [];
  let blockedItems: any[] = [];

  if (session.user.role === 'INTERN') {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    doneItems = await prisma.workItem.findMany({ where: { projectId, type: { notIn: ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'] }, status: 'DONE', updatedAt: { gte: twoDaysAgo } } });
    activeItems = await prisma.workItem.findMany({ where: { projectId, type: { notIn: ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'] }, status: { in: ['IN_PROGRESS', 'REVIEW'] } } });
    blockedItems = await prisma.workItem.findMany({ where: { projectId, type: { notIn: ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'] }, status: 'BLOCKED' } });
  }

  const riskStyle = (r: string) => r === 'RED'
    ? 'badge-danger'
    : r === 'YELLOW'
    ? 'badge-warning'
    : 'badge-success';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 pt-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Báo cáo Tiến độ
          </h2>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>
              Theo dõi và cập nhật tiến độ công việc hàng ngày, giải quyết các khó khăn gặp phải.
            </span>
          </div>
        </div>
        
        {session.user.role === 'INTERN' && (
          <CreateCheckInModal 
            projectId={projectId}
            suggestedDone={doneItems}
            suggestedNext={activeItems}
            suggestedBlockers={blockedItems}
          />
        )}
      </div>

      {/* ── History Timeline ── */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Lịch sử báo cáo</h3>
          <span className="badge badge-muted text-[10px] uppercase font-bold shadow-sm">
            {checkIns.length} báo cáo
          </span>
        </div>

        <div className="relative">
          <CheckInListClient 
            checkIns={checkIns} 
            userRole={session.user.role} 
            projectId={projectId} 
          />
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProjectTabsClient from "./ProjectTabsClient";

export default async function ProjectLayout(props: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) redirect('/login');

  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } :
          session.user.role === 'MEMBER_MANAGER' ? { memberManagerId: session.user.id } :
          session.user.role === 'PARTNER' ? { partnerId: session.user.id } :
          session.user.role === 'PROJECT_MANAGER' ? { projectManagerId: session.user.id } : {})
    }
  });

  if (!project) return <div>Dự án không tồn tại hoặc bạn không có quyền truy cập.</div>;

  const isInternView = session.user.role === 'INTERN';

  return (
    <div>
      {/* PM project header with tabs */}
      {session.user.role === 'PROJECT_MANAGER' && (
        <div className="sticky top-0 z-40 -mx-5 -mt-5 pt-5 px-5 md:-mx-7 md:-mt-7 md:pt-7 md:px-7 mb-6 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <Link
                  href="/dashboard/project-manager/projects"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest mb-3 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại Danh mục
                </Link>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {project.title}
                </h2>
                <div className="flex items-center gap-2 mt-3">
                  <span className="badge badge-accent shadow-sm">{project.track.replace(/_/g, ' ')}</span>
                  <span className={`badge shadow-sm ${project.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                    {project.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : project.status === 'COMPLETED' ? 'ĐÃ HOÀN THÀNH' : project.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Tab nav */}
            <ProjectTabsClient projectId={projectId} />
          </div>
        </div>
      )}

      {props.children}
    </div>
  );
}

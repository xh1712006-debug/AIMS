import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectTabs from "./ProjectTabs";
import Link from "next/link";

export default async function ProjectLayout(props: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) redirect('/login');

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } : {}) 
    }
  });

  if (!project) return <div>Dự án không tồn tại hoặc bạn không có quyền truy cập.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href={session.user.role === 'MENTOR' ? '/dashboard/mentor/projects' : '/dashboard'} className="hover:text-blue-600 transition-colors">
          &larr; Quay lại danh sách
        </Link>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{project.title}</h3>
            <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Track: {project.track}
            </span>
          </div>
        </div>
        
        {session.user.role === 'MENTOR' && (
          <ProjectTabs projectId={projectId} userRole={session.user.role} />
        )}
      </div>

      {props.children}
    </div>
  );
}

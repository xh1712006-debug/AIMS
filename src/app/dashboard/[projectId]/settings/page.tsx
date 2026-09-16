import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { saveSettings } from "@/app/actions";
import GithubSettingsForm from "./GithubSettingsForm";
import GithubActivityWidget from "./GithubActivityWidget";

export default async function SettingsPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'INTERN' && session.user.role !== 'PROJECT_MANAGER')) {
    redirect('/dashboard');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  
  const projectWhereClause = session.user.role === 'PROJECT_MANAGER' 
    ? { id: projectId, projectManagerId: session.user.id }
    : { id: projectId, internId: session.user.id };

  const project = await prisma.project.findFirst({
    where: projectWhereClause,
    include: {
      priorityLevels: { orderBy: { level: 'asc' } }
    }
  });

  if (!project) redirect('/dashboard');

  const githubToken = user?.githubToken || "";
  const githubRepo = project?.githubRepo || "";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto pb-12">
      <div className="pt-4"></div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ── GitHub Integration ── */}
        <div className="xl:col-span-5 aims-card p-6 border-t-4 border-t-[#24292e]">
          <h3 className="text-base font-black mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            Tích hợp GitHub
          </h3>
          <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>Kết nối để tự động đồng bộ báo cáo Check-ins của bạn lên GitHub.</p>
          
          <GithubSettingsForm 
            projectId={projectId} 
            initialToken={githubToken} 
            initialRepo={githubRepo} 
          />
        </div>

        {/* ── GitHub Tracking Dashboard ── */}
        <div className="xl:col-span-7">
          <GithubActivityWidget 
            projectId={projectId} 
            githubRepo={githubRepo} 
            githubToken={githubToken} 
          />
        </div>
      </div>
    </div>
  );
}

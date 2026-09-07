import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { saveSettings } from "@/app/actions";
import PrioritySettings from "./PrioritySettings";

export default async function SettingsPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'INTERN') redirect('/dashboard');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  
  const project = await prisma.project.findUnique({
    where: { id: projectId, internId: session.user.id },
    include: {
      priorityLevels: { orderBy: { level: 'asc' } }
    }
  });

  const githubToken = user?.githubToken || "";
  const githubRepo = project?.githubRepo || "";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold mb-8 tracking-tight" style={{ color: 'var(--text-primary)' }}>Cài đặt (Settings)</h2>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <h3 className="text-xl font-bold mb-2 text-gray-900">Tích hợp GitHub</h3>
        <p className="text-sm text-gray-500 mb-6">Kết nối để tự động đồng bộ báo cáo Check-ins của bạn lên kho lưu trữ GitHub dưới dạng Markdown.</p>
        
        <form action={saveSettings} className="space-y-6">
          <input type="hidden" name="projectId" value={projectId} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">GitHub Personal Access Token (PAT)</label>
            <input 
              name="githubToken" 
              type="password" 
              defaultValue={githubToken}
              className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2.5 text-sm font-mono" 
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx" 
            />
            <p className="text-xs text-gray-400 mt-1">Lưu ý: Token cần có quyền `repo` để đẩy code.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">GitHub Repository</label>
            <input 
              name="githubRepo" 
              type="text" 
              defaultValue={githubRepo}
              className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2.5 text-sm font-mono" 
              placeholder="username/repository-name" 
            />
            <p className="text-xs text-gray-400 mt-1">Định dạng: tên-tài-khoản/tên-kho-chứa.</p>
          </div>
          <button type="submit" className="bg-gray-900 text-white font-bold rounded-lg px-6 py-2.5 hover:bg-gray-800 transition-colors">
            Lưu cài đặt
          </button>
        </form>
      </div>

      <PrioritySettings projectId={projectId} initialPriorities={project?.priorityLevels || []} />
    </div>
  );
}

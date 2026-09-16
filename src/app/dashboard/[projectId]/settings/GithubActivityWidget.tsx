import prisma from "@/lib/prisma";
import Link from "next/link";

async function getRecentCheckIns(projectId: string) {
  return await prisma.checkIn.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
}

async function getGithubCommits(repo: string, token: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch Github commits", error);
    return null;
  }
}

export default async function GithubActivityWidget({ 
  projectId, 
  githubRepo, 
  githubToken 
}: { 
  projectId: string, 
  githubRepo: string, 
  githubToken: string 
}) {
  
  if (!githubRepo || !githubToken) {
    return (
      <div className="aims-card p-10 flex flex-col items-center justify-center text-center border-t-4 border-t-gray-300 dark:border-t-gray-700 min-h-[400px]">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Chưa kết nối GitHub</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Hãy hoàn thành cấu hình Tích hợp GitHub ở cột bên trái để theo dõi các hoạt động commit và lịch sử báo cáo tiến độ (Check-in) ngay tại đây.
        </p>
      </div>
    );
  }

  const [commits, checkIns] = await Promise.all([
    getGithubCommits(githubRepo, githubToken),
    getRecentCheckIns(projectId)
  ]);

  return (
    <div className="space-y-6">
      {/* GitHub Repo Header */}
      <div className="aims-card p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Đang kết nối</span>
          </div>
          <h3 className="text-xl font-black">{githubRepo}</h3>
          <a href={`https://github.com/${githubRepo}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-300 hover:text-white mt-1 inline-flex items-center gap-1 transition-colors">
            Mở trên GitHub <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Commits Timeline */}
        <div className="aims-card p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            Recent Commits
          </h4>
          
          {!commits ? (
            <div className="text-sm text-red-500 font-medium p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">Không thể tải dữ liệu commit. Vui lòng kiểm tra lại Token hoặc Repo.</div>
          ) : commits.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4 text-center">Chưa có commit nào.</div>
          ) : (
            <div className="space-y-4">
              {commits.map((commitData: any) => (
                <div key={commitData.sha} className="flex gap-3 items-start group">
                  <img 
                    src={commitData.author?.avatar_url || `https://ui-avatars.com/api/?name=${commitData.commit.author.name}&background=random`} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" 
                  />
                  <div className="flex-1 min-w-0">
                    <a 
                      href={commitData.html_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block text-sm font-semibold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer hover:underline" 
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {commitData.commit.message.split('\n')[0]}
                    </a>
                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{commitData.commit.author.name}</span>
                      <span>•</span>
                      <span>{new Date(commitData.commit.author.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}</span>
                      <span>•</span>
                      <a href={commitData.html_url} target="_blank" rel="noreferrer" className="font-mono text-indigo-500 hover:underline">
                        {commitData.sha.substring(0, 7)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check-ins Sync History */}
        <div className="aims-card p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            AIMS Sync History
          </h4>
          
          {checkIns.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4 text-center">Chưa có Check-in nào được đẩy lên.</div>
          ) : (
            <div className="space-y-4">
              {checkIns.map((ci) => (
                <div key={ci.id} className="flex gap-3 items-start relative before:absolute before:left-[11px] before:top-6 before:w-[2px] before:h-full before:bg-gray-100 dark:before:bg-gray-800 last:before:hidden">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center z-10 shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="pb-3">
                    <Link href={`/dashboard/${projectId}/check-ins`} className="text-sm font-semibold hover:text-indigo-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      Weekly Check-in: {new Date(ci.createdAt).toISOString().split('T')[0]}
                    </Link>
                    <p className="text-[10px] font-medium uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
                      Đã đồng bộ • {new Date(ci.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

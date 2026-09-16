import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorProgressPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'PROJECT_MANAGER') {
    redirect('/dashboard');
  }

  const projects = await prisma.project.findMany({
    where: { projectManagerId: session.user.id },
    include: {
      intern: true,
      workItems: {
        orderBy: { updatedAt: 'desc' },
        include: { priority: true }
      }
    },
    orderBy: { startDate: 'desc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">


      <div className="space-y-4">
        {projects.map(project => {
          const doneItems = project.workItems.filter(i => i.status === 'DONE');
          const notDoneItems = project.workItems.filter(i => i.status !== 'DONE');
          const totalItems = project.workItems.length;
          
          if (totalItems === 0) return null;
          
          const progressPercent = Math.round((doneItems.length / totalItems) * 100);

          return (
            <details key={project.id} className="group aims-card overflow-hidden bg-white dark:bg-[#111]">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  {/* Caret Icon */}
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-open:bg-indigo-100 dark:group-open:bg-indigo-900/30 transition-colors">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-open:text-indigo-600 dark:group-open:text-indigo-400 transform group-open:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {project.title}
                    </h3>
                    <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Thực tập sinh: <span className="font-bold text-gray-900 dark:text-gray-200">{project.intern.name}</span>
                    </p>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="hidden md:flex items-center gap-8 min-w-[300px]">
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      <span>Tiến độ</span>
                      <span className={progressPercent === 100 ? 'text-emerald-500' : ''}>{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tasks</span>
                      <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{doneItems.length}/{totalItems}</span>
                    </div>
                  </div>
                </div>
              </summary>

              {/* Accordion Content */}
              <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-[#0a0a0a]">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
                  
                  {/* Chưa hoàn thành */}
                  <div className="p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Chưa hoàn thành ({notDoneItems.length})
                    </h4>
                    <div className="space-y-2">
                      {notDoneItems.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Không có công việc nào tồn đọng.</p>
                        </div>
                      ) : (
                        notDoneItems.map(item => (
                          <div key={item.id} className="group/item flex items-start gap-3 p-3 bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors shadow-sm">
                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 group-hover/item:border-indigo-500 transition-colors" />
                            <div className="flex-1">
                              <p className="font-bold text-sm leading-snug mb-1.5" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="badge badge-muted text-[9px] uppercase font-black">{item.type}</span>
                                <span className={`badge text-[9px] uppercase font-black ${
                                  item.status === 'BLOCKED' ? 'badge-danger' : 
                                  item.status === 'REVIEW' ? 'badge-warning' : 
                                  item.status === 'IN_PROGRESS' ? 'badge-info' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {item.status}
                                </span>
                                {item.priority && (
                                  <span 
                                    className="badge text-[9px] uppercase font-black"
                                    style={{ 
                                      backgroundColor: item.priority.color ? `${item.priority.color}15` : 'var(--bg-muted)', 
                                      color: item.priority.color || 'var(--text-secondary)'
                                    }}
                                  >
                                    {item.priority.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Đã hoàn thành */}
                  <div className="p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Đã hoàn thành ({doneItems.length})
                    </h4>
                    <div className="space-y-2">
                      {doneItems.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Chưa hoàn thành công việc nào.</p>
                        </div>
                      ) : (
                        doneItems.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                              <p className="font-bold text-sm leading-snug line-through" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
                                Hoàn thành lúc {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  );
}

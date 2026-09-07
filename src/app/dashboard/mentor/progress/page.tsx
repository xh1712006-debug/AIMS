import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorProgressPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'MENTOR') {
    redirect('/dashboard');
  }

  const projects = await prisma.project.findMany({
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
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#F1F5F9] tracking-tight">Quản lý Tiến độ</h2>
        <p className="text-gray-500 dark:text-[#64748B] mt-2">Theo dõi các công việc Đã làm (DONE) và Chưa làm của tất cả sinh viên.</p>
      </div>

      <div className="space-y-12">
        {projects.map(project => {
          const doneItems = project.workItems.filter(i => i.status === 'DONE');
          const notDoneItems = project.workItems.filter(i => i.status !== 'DONE');
          
          if (project.workItems.length === 0) return null;

          return (
            <div key={project.id} className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-[#475569] overflow-hidden">
              <div className="bg-gray-50 dark:bg-[#0F172A] border-b border-gray-200 dark:border-[#475569] p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-[#F1F5F9]">{project.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-[#64748B] font-medium">Thực tập sinh: <span className="text-gray-800 dark:text-[#F1F5F9]">{project.intern.name}</span></p>
                </div>
                <div className="text-sm font-bold text-gray-700 dark:text-[#CBD5E1] bg-white dark:bg-[#1E293B] px-3 py-1 rounded-full border border-gray-200 dark:border-[#475569] shadow-sm dark:shadow-none">
                  Tổng: {project.workItems.length} Tasks
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {/* Chưa làm */}
                <div className="p-6">
                  <h4 className="text-md font-extrabold text-gray-900 dark:text-[#F1F5F9] mb-4 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                    Chưa hoàn thành ({notDoneItems.length})
                  </h4>
                  <div className="space-y-3">
                    {notDoneItems.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-[#475569] italic">Không có công việc nào tồn đọng.</p>
                    ) : (
                      notDoneItems.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-100 dark:border-[#334155]">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-sm text-gray-900 dark:text-[#F1F5F9]">{item.title}</p>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gray-200 text-gray-700 dark:text-[#CBD5E1]">{item.status}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-[#64748B] font-semibold">{item.type}</span>
                            {item.priority && (
                              <span 
                                className="px-1.5 py-0.5 text-[10px] rounded font-bold border opacity-90"
                                style={{ 
                                  backgroundColor: item.priority.color ? `${item.priority.color}20` : '#f3f4f6', 
                                  color: item.priority.color || '#374151',
                                  borderColor: item.priority.color ? `${item.priority.color}40` : '#e5e7eb'
                                }}
                              >
                                {item.priority.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Đã làm */}
                <div className="p-6">
                  <h4 className="text-md font-extrabold text-gray-900 dark:text-[#F1F5F9] mb-4 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Đã hoàn thành ({doneItems.length})
                  </h4>
                  <div className="space-y-3">
                    {doneItems.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-[#475569] italic">Chưa hoàn thành công việc nào.</p>
                    ) : (
                      doneItems.map(item => (
                        <div key={item.id} className="p-3 bg-green-50/50 rounded-xl border border-green-100 opacity-80 hover:opacity-100 transition-opacity">
                          <p className="font-bold text-sm text-gray-900 dark:text-[#F1F5F9] line-through decoration-gray-400">{item.title}</p>
                          <div className="mt-2 text-xs text-green-700 dark:text-green-300 font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            Hoàn thành lúc {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

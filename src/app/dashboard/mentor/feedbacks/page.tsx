import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MentorFeedbacksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'MENTOR') {
    redirect('/dashboard');
  }

  // Lấy các WorkItems đang bị gắn cờ cần khắc phục
  const itemsRequiringFix = await prisma.workItem.findMany({
    where: { requiresFix: true },
    include: {
      project: {
        include: { intern: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Phản hồi & Khắc phục</h2>
        <p className="text-gray-500 mt-2">Danh sách các công việc Mentor đã phản hồi và đang chờ sinh viên khắc phục.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {itemsRequiringFix.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Không có công việc nào cần khắc phục!</h3>
            <p className="text-gray-500 mt-1">Mọi thứ đang hoạt động trơn tru.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {itemsRequiringFix.map(item => (
              <div key={item.id} className="p-6 hover:bg-red-50/30 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Cột thông tin */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                        CẦN KHẮC PHỤC
                      </span>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">
                      Dự án: <span className="font-semibold text-gray-700">{item.project.title}</span> 
                      &nbsp;&bull;&nbsp; Intern: <span className="font-semibold text-gray-700">{item.project.intern.name}</span>
                    </p>

                    <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <p className="text-xs font-bold text-yellow-800 uppercase mb-1">Mentor Phản hồi:</p>
                      <p className="text-sm text-yellow-900 font-medium whitespace-pre-wrap">{item.mentorFeedback}</p>
                    </div>
                  </div>

                  {/* Cột thao tác */}
                  <div className="flex flex-col gap-3 justify-center md:items-end md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <Link href={`/dashboard/${item.projectId}/work-items`} className="w-full text-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                      Đến Backlog
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

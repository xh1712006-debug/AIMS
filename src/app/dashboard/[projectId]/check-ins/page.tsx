import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createCheckIn } from "@/app/actions";

export default async function CheckInsPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } :
          session.user.role === 'MEMBER_MANAGER' ? { memberManagerId: session.user.id } :
          session.user.role === 'PARTNER' ? { partnerId: session.user.id } : {})
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;

  const checkIns = await prisma.checkIn.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  // Auto-fill logic
  let defaultDone = "";
  let defaultNext = "";
  let defaultBlockers = "";

  if (session.user.role === 'INTERN') {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const doneItems = await prisma.workItem.findMany({
      where: { projectId, type: { not: 'EPIC' }, status: 'DONE', updatedAt: { gte: twoDaysAgo } }
    });
    const activeItems = await prisma.workItem.findMany({
      where: { projectId, type: { not: 'EPIC' }, status: { in: ['IN_PROGRESS', 'REVIEW'] } }
    });
    const blockedItems = await prisma.workItem.findMany({
      where: { projectId, type: { not: 'EPIC' }, status: 'BLOCKED' }
    });

    defaultDone = doneItems.map(i => `- [Hoàn thành] ${i.title}`).join('\n');
    defaultNext = activeItems.map(i => `- [Tiếp tục] ${i.title}`).join('\n');
    defaultBlockers = blockedItems.map(i => `- [Bị chặn] ${i.title}`).join('\n');
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Daily Check-ins</h2>
        <p className="text-sm text-gray-500 dark:text-[#737373] mt-1">Báo cáo tiến độ hàng ngày và cập nhật các khó khăn.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={session.user.role === 'INTERN' ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#262626]">
            <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-[#EDEDED]">Lịch sử báo cáo</h3>
            <div className="space-y-3">
              {checkIns.length === 0 ? (
                <p className="text-gray-500 dark:text-[#737373] text-sm italic">Chưa có báo cáo nào.</p>
              ) : (
                checkIns.map((ci) => (
                  <div key={ci.id} className="p-4 rounded-xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#0A0A0A]/50 hover:bg-gray-50 dark:bg-[#0A0A0A] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-500 dark:text-[#737373]">
                        {new Date(ci.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        ci.riskStatus === 'RED' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                        ci.riskStatus === 'YELLOW' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      }`}>
                        {ci.riskStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-gray-700 dark:text-[#D4D4D4]">DONE:</strong> {ci.doneTasks}</p>
                      <p><strong className="text-gray-700 dark:text-[#D4D4D4]">NEXT:</strong> {ci.nextTasks}</p>
                      {ci.blockers && <p className="text-red-600"><strong>BLOCKER:</strong> {ci.blockers}</p>}
                      {ci.evidenceLink && (
                        <p><a href={ci.evidenceLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Xem minh chứng &rarr;</a></p>
                      )}
                      
                      {session.user.role === 'PROJECT_MANAGER' ? (
                        <form action={async (formData) => {
                          "use server";
                          const { updateCheckInMentorAction } = await import('@/app/actions');
                          await updateCheckInMentorAction(ci.id, formData.get('managerAction') as string, projectId);
                        }} className="mt-3 pt-3 border-t border-gray-200 dark:border-[#383838]">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Manager Action (Ghi chú / Hỗ trợ)</label>
                          <textarea name="managerAction" defaultValue={ci.managerAction || ''} rows={2} className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm bg-white dark:bg-[#171717]" placeholder="Ghi chú phương án giải quyết blocker..."></textarea>
                          <div className="flex justify-end mt-2">
                            <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-500 font-medium">Lưu ghi chú</button>
                          </div>
                        </form>
                      ) : (
                        ci.managerAction && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#383838]">
                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Manager Action</p>
                            <p className="text-sm bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-900 whitespace-pre-wrap">{ci.managerAction}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {session.user.role === 'INTERN' && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#262626] sticky top-6">
              <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-[#EDEDED]">Báo cáo hôm nay</h3>
              <form action={createCheckIn} className="space-y-4">
                <input type="hidden" name="projectId" value={projectId} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Đã làm gì (DONE)</label>
                  <textarea name="doneTasks" required rows={3} defaultValue={defaultDone} className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="Mô tả công việc đã hoàn thành..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Sẽ làm gì (NEXT)</label>
                  <textarea name="nextTasks" required rows={3} defaultValue={defaultNext} className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="Kế hoạch công việc tiếp theo..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Khó khăn (BLOCKERS)</label>
                  <textarea name="blockers" rows={2} defaultValue={defaultBlockers} className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="Có gặp khó khăn gì không? (Ghi vào đây sẽ bị đánh dấu Vàng)"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Link minh chứng (GitHub/Docs)</label>
                  <input name="evidenceLink" type="url" className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="https://github.com/..." />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold rounded-lg py-2.5 hover:bg-blue-500 transition-colors">
                  Gửi Check-in
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

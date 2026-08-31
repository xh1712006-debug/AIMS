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
      ...(session.user.role === 'INTERN' ? { internId: session.user.id } : {}) 
    }
  });

  if (!project) return <div>Không tìm thấy dự án.</div>;

  const checkIns = await prisma.checkIn.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Daily Check-ins</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={session.user.role === 'INTERN' ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Lịch sử báo cáo</h3>
            <div className="space-y-4">
              {checkIns.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Chưa có báo cáo nào.</p>
              ) : (
                checkIns.map((ci) => (
                  <div key={ci.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-500">
                        {new Date(ci.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        ci.riskStatus === 'RED' ? 'bg-red-100 text-red-700' :
                        ci.riskStatus === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ci.riskStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-gray-700">DONE:</strong> {ci.doneTasks}</p>
                      <p><strong className="text-gray-700">NEXT:</strong> {ci.nextTasks}</p>
                      {ci.blockers && <p className="text-red-600"><strong>BLOCKER:</strong> {ci.blockers}</p>}
                      {ci.evidenceLink && (
                        <p><a href={ci.evidenceLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Xem minh chứng &rarr;</a></p>
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Báo cáo hôm nay</h3>
              <form action={createCheckIn} className="space-y-4">
                <input type="hidden" name="projectId" value={projectId} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Đã làm gì (DONE)</label>
                  <textarea name="doneTasks" required rows={3} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="Mô tả công việc đã hoàn thành..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sẽ làm gì (NEXT)</label>
                  <textarea name="nextTasks" required rows={3} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="Kế hoạch công việc tiếp theo..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Khó khăn (BLOCKERS)</label>
                  <textarea name="blockers" rows={2} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="Có gặp khó khăn gì không? (Ghi vào đây sẽ bị đánh dấu Vàng)"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Link minh chứng (GitHub/Docs)</label>
                  <input name="evidenceLink" type="url" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="https://github.com/..." />
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

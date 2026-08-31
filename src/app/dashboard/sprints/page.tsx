import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createBacklog } from "@/app/actions";

export default async function SprintsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'INTERN') redirect('/dashboard');

  const backlogs = await prisma.backlog.findMany({
    where: { project: { internId: session.user.id } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sprints & Backlogs</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Thêm Task Mới</h3>
            <form action={createBacklog} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên công việc</label>
                <input name="title" required type="text" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="VD: Thiết kế Database" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Loại (Type)</label>
                <select name="type" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                  <option value="RESEARCH">Research</option>
                  <option value="DOCUMENTATION">Documentation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Độ ưu tiên</label>
                <select name="priority" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                  <option value="MUST">Must Have</option>
                  <option value="SHOULD">Should Have</option>
                  <option value="COULD">Could Have</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold rounded-lg py-2.5 hover:bg-blue-500 transition-colors mt-2">
                Thêm vào Backlog
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Product Backlog</h3>
            <div className="space-y-3">
              {backlogs.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Chưa có công việc nào.</p>
              ) : (
                backlogs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-transparent hover:border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded font-medium">{item.type}</span>
                        <span className={`px-2 py-0.5 text-xs rounded font-bold ${
                          item.priority === 'MUST' ? 'bg-red-100 text-red-700' :
                          item.priority === 'SHOULD' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{item.priority}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg whitespace-nowrap ml-4">
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

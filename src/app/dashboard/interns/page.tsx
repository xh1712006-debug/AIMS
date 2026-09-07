import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InternsManagePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== 'MENTOR') {
    redirect('/dashboard');
  }

  const interns = await prisma.user.findMany({
    where: { role: 'INTERN' },
    include: {
      projects: {
        include: {
          checkIns: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      }
    }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#F1F5F9] mb-8 tracking-tight">Quản lý Tài khoản Thực tập sinh</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#334155] overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-[#334155] bg-gray-50/50 dark:bg-[#0F172A]/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#F1F5F9]">Tất cả Interns</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 dark:bg-[#0F172A]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[#64748B] uppercase tracking-wider">Thực tập sinh</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[#64748B] uppercase tracking-wider">Dự án</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-[#64748B] uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1E293B] divide-y divide-gray-100">
              {interns.map(intern => (
                <tr key={intern.id} className="hover:bg-gray-50/50 dark:bg-[#0F172A]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900 dark:text-[#F1F5F9]">{intern.name}</div>
                    <div className="text-sm text-gray-500 dark:text-[#64748B]">{intern.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-[#94A3B8]">
                    {intern.projects.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {intern.projects.map(p => <li key={p.id}>{p.title}</li>)}
                      </ul>
                    ) : 'Chưa phân bổ'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/interns/${intern.id}`} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-sm rounded-lg hover:bg-blue-200 transition-colors">
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
              {interns.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-[#64748B]">
                    Chưa có thực tập sinh nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#334155] sticky top-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-[#F1F5F9]">Tạo Tài khoản Intern</h3>
            <form action={async (formData) => {
              'use server';
              const { createInternAccount } = await import('@/app/actions');
              await createInternAccount(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Họ và Tên</label>
                <input name="name" required type="text" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Email đăng nhập</label>
                <input name="email" required type="email" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="VD: intern@aims.local" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Mật khẩu</label>
                <input name="password" required type="text" defaultValue="123456" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                <p className="text-xs text-gray-400 dark:text-[#475569] mt-1">Mặc định là 123456, mã hóa an toàn.</p>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 text-white font-bold rounded-lg py-2.5 hover:bg-blue-500 transition-colors mt-2">
                Tạo Tài khoản
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Cài đặt Hệ thống | AIMS',
};

export default async function SystemSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.project.count(),
    prisma.workItem.count(),
    prisma.checkIn.count(),
    prisma.sprint.count(),
    prisma.comment.count(),
  ]);

  const [userCount, projectCount, workItemCount, checkInCount, sprintCount, commentCount] = stats;

  const roleStats = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
  });

  const statusStats = await prisma.project.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Cài đặt & Thống kê Hệ thống</h2>
        <p className="text-gray-500 mt-2">Tổng quan về trạng thái hoạt động và các thông số kỹ thuật của hệ thống AIMS.</p>
      </div>

      {/* Thống kê tổng */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Tổng Tài khoản', value: userCount, color: 'text-blue-600' },
          { label: 'Tổng Dự án', value: projectCount, color: 'text-purple-600' },
          { label: 'Work Items', value: workItemCount, color: 'text-indigo-600' },
          { label: 'Check-ins', value: checkInCount, color: 'text-green-600' },
          { label: 'Sprints', value: sprintCount, color: 'text-orange-600' },
          { label: 'Comments', value: commentCount, color: 'text-pink-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#171717] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thống kê theo role */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[#262626]">
            <h3 className="font-bold text-gray-900 dark:text-[#EDEDED]">Phân bố Người dùng theo Role</h3>
          </div>
          <div className="p-5 space-y-3">
            {roleStats.map((stat) => {
              const percentage = userCount > 0 ? Math.round((stat._count.id / userCount) * 100) : 0;
              const roleLabels: Record<string, { label: string; color: string }> = {
                ADMIN: { label: 'Quản trị viên', color: 'bg-red-500' },
                PROJECT_MANAGER: { label: 'Người quản lý dự án', color: 'bg-blue-500' },
                MEMBER_MANAGER: { label: 'Scrum Master', color: 'bg-purple-500' },
                INTERN: { label: 'Thực tập sinh', color: 'bg-green-500' },
                PARTNER: { label: 'Đối tác', color: 'bg-orange-500' },
              };
              const info = roleLabels[stat.role] || { label: stat.role, color: 'bg-gray-500' };
              return (
                <div key={stat.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-[#D4D4D4]">{info.label}</span>
                    <span className="text-gray-500 dark:text-[#737373]">{stat._count.id} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-[#383838] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${info.color}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thống kê dự án theo trạng thái */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[#262626]">
            <h3 className="font-bold text-gray-900 dark:text-[#EDEDED]">Phân bố Dự án theo Trạng thái</h3>
          </div>
          <div className="p-5 space-y-4">
            {statusStats.map((stat) => {
              const statusLabels: Record<string, { label: string; icon: string; color: string }> = {
                ACTIVE: { label: 'Đang hoạt động', icon: '🟢', color: 'text-green-600' },
                COMPLETED: { label: 'Đã hoàn thành', icon: '✅', color: 'text-blue-600' },
                ON_HOLD: { label: 'Tạm dừng', icon: '🟡', color: 'text-yellow-600' },
                WITHDRAWN: { label: 'Đã rút', icon: '🔴', color: 'text-red-600' },
              };
              const info = statusLabels[stat.status] || { label: stat.status, icon: '❓', color: 'text-gray-600' };
              return (
                <div key={stat.status} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-[#262626]">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{info.icon}</span>
                    <span className="font-semibold text-gray-800 dark:text-[#D4D4D4]">{info.label}</span>
                  </div>
                  <span className={`font-black text-xl ${info.color}`}>{stat._count.id}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden md:col-span-2">
          <div className="p-5 border-b border-gray-100 dark:border-[#262626]">
            <h3 className="font-bold text-gray-900 dark:text-[#EDEDED]">Thông tin Kỹ thuật Hệ thống</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'Framework', value: 'Next.js 16 (Turbopack)' },
              { key: 'Database', value: 'PostgreSQL via Prisma ORM' },
              { key: 'Auth', value: 'NextAuth.js (Session)' },
              { key: 'Quy trình', value: 'Agile / Scrum (5 Roles)' },
              { key: 'Roles', value: 'Admin, PM, Scrum Master, Intern, Partner' },
              { key: 'Phiên bản', value: 'AIMS v1.0.0' },
            ].map(({ key, value }) => (
              <div key={key} className="p-3 bg-gray-50 dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-[#262626]">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{key}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-[#D4D4D4]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

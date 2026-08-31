import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white shadow-md flex flex-col z-10 border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">AIMS</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">
            {session.user.role === 'MENTOR' ? 'Mentor Portal' : 'Intern Portal'}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
            Tổng quan (Dashboard)
          </Link>
          {session.user.role === 'INTERN' && (
            <>
              <Link href="/dashboard/sprints" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                Sprints & Backlogs
              </Link>
              <Link href="/dashboard/check-ins" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                Daily Check-ins
              </Link>
              <Link href="/dashboard/settings" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                Cài đặt GitHub
              </Link>
            </>
          )}
          {session.user.role === 'MENTOR' && (
            <Link href="/dashboard/interns" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
              Quản lý Interns
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="mb-3 px-2">
            <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

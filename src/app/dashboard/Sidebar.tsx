'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Sidebar({ user, projects = [] }: { user: { name: string, email: string, role: string }, projects?: { id: string, title: string }[] }) {
  const pathname = usePathname();
  
  // Extract projectId from /dashboard/clx.../something
  const parts = pathname.split('/');
  // parts[0] = "", parts[1] = "dashboard", parts[2] = projectId
  const isDashboardRoot = pathname === '/dashboard';
  const projectId = (!isDashboardRoot && parts[2] && parts[2] !== 'interns' && parts[2] !== 'mentor') ? parts[2] : null;

  return (
    <aside className="w-full md:w-64 md:h-screen flex-shrink-0 bg-white shadow-md flex flex-col z-10 border-r border-gray-200">
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">AIMS</h1>
        <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">
          {user.role === 'MENTOR' ? 'Mentor Portal' : 'Intern Portal'}
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {user.role === 'INTERN' ? (
          <>
            <Link href="/dashboard" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
              Tổng quan (Trang chủ)
            </Link>
            
            {projects.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dự án của tôi</p>
                {projects.map((project) => (
                  <div key={project.id} className="mb-2">
                    <div className="px-4 py-2 text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-gray-400">📁</span>
                      <span className="truncate">{project.title}</span>
                    </div>
                    <div className="ml-4 pl-3 border-l border-gray-100 space-y-0.5 mt-1">
                      <Link 
                        href={`/dashboard/${project.id}`} 
                        className={`block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname === `/dashboard/${project.id}` ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        Chi tiết Dự án
                      </Link>
                      <Link 
                        href={`/dashboard/${project.id}/work-items`} 
                        className={`block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname.includes(`/dashboard/${project.id}/work-items`) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        Work Items (Backlog)
                      </Link>
                      <Link 
                        href={`/dashboard/${project.id}/sprints`} 
                        className={`block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname.includes(`/dashboard/${project.id}/sprints`) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        Sprint Planning
                      </Link>
                      <Link 
                        href={`/dashboard/${project.id}/check-ins`} 
                        className={`block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname.includes(`/dashboard/${project.id}/check-ins`) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        Báo cáo hằng ngày
                      </Link>
                      <Link 
                        href={`/dashboard/${project.id}/settings`} 
                        className={`block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname.includes(`/dashboard/${project.id}/settings`) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        Cài đặt GitHub
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <Link href="/dashboard" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
              Bảng điều khiển Mentor
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Công cụ Mentor</p>
              <Link href="/dashboard/mentor/projects" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/mentor/projects') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
                Quản lý Dự án
              </Link>
              <Link href="/dashboard/mentor/progress" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/mentor/progress') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
                Quản lý Tiến độ
              </Link>
              <Link href="/dashboard/mentor/feedbacks" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/mentor/feedbacks') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
                Phản hồi & Khắc phục
              </Link>
              <Link href="/dashboard/interns" className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/dashboard/interns' || pathname.match(/\/dashboard\/interns\/.+/) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
                Quản lý Interns
              </Link>
            </div>

          </>
        )}
      </nav>
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="mb-3 px-2">
          <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}

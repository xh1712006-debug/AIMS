'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar({ user, projects = [], pendingActionCount = 0 }: { user: { name: string, email: string, role: string }, projects?: { id: string, title: string }[], pendingActionCount?: number }) {
  const pathname = usePathname();
  
  const parts = pathname.split('/');
  const isDashboardRoot = pathname === '/dashboard';
  const projectId = (!isDashboardRoot && parts[2] && parts[2] !== 'interns' && parts[2] !== 'mentor') ? parts[2] : null;

  const navLink = (href: string, label: string, exact = false, badge?: number) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href) && href !== '/dashboard';
    const isRootActive = href === '/dashboard' && pathname === '/dashboard';
    const active = isActive || isRootActive;
    return (
      <Link
        href={href}
        className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex justify-between items-center"
        style={{
          backgroundColor: active ? 'var(--sidebar-active-bg)' : 'transparent',
          color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
          fontWeight: active ? '600' : '500',
        }}
      >
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  const subNavLink = (href: string, label: string) => {
    const isActive = pathname === href || pathname.startsWith(href + '/') || pathname.includes(href);
    return (
      <Link
        href={href}
        className="block px-3 py-1.5 text-sm rounded-lg transition-colors duration-150"
        style={{
          backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
          color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
          fontWeight: isActive ? '600' : '400',
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside
      className="w-full md:w-64 md:h-screen flex-shrink-0 flex flex-col z-10"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>AIMS</h1>
        <p className="text-xs font-semibold mt-0.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {user.role === 'MENTOR' ? 'Mentor Portal' : 'Intern Portal'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {user.role === 'INTERN' ? (
          <>
            {navLink('/dashboard', 'Bảng Điều Khiển (Dashboard)', true)}

            {projects.length > 0 && (
              <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Không gian làm việc
                </p>
                {projects.map((project) => {
                  const isActive = projectId === project.id;
                  return (
                    <div key={project.id} className="mb-1">
                      <Link
                        href={`/dashboard/${project.id}`}
                        className="px-3 py-2 text-sm font-semibold flex items-center gap-2 rounded-lg transition-colors duration-150"
                        style={{
                          backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                          color: isActive ? 'var(--sidebar-active-text)' : 'var(--text-primary)',
                        }}
                      >
                        <span>{isActive ? '📂' : '📁'}</span>
                        <span className="truncate">{project.title}</span>
                      </Link>

                      {isActive && (
                        <div className="ml-4 pl-3 mt-0.5 space-y-0.5" style={{ borderLeft: '2px solid var(--border-color)' }}>
                          {subNavLink(`/dashboard/${project.id}`, 'Tổng quan Dự án')}
                          {subNavLink(`/dashboard/${project.id}/work-items`, 'Roadmap & Backlog')}
                          {subNavLink(`/dashboard/${project.id}/sprints`, 'Kế hoạch Sprint')}
                          {subNavLink(`/dashboard/${project.id}/check-ins`, 'Báo cáo Tiến độ (Standup)')}
                          {subNavLink(`/dashboard/${project.id}/settings`, 'Tích hợp GitHub')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {navLink('/dashboard', 'Trung tâm Quản lý (Command Center)', true)}

            <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Công cụ Quản lý
              </p>
              {navLink('/dashboard/mentor/inbox', 'Hộp thư Xử lý (Inbox)', false, pendingActionCount)}
              {navLink('/dashboard/mentor/projects', 'Danh mục Dự án (Portfolios)')}
              {navLink('/dashboard/mentor/progress', 'Kiểm soát Tiến độ (Progress Tracker)')}
              {navLink('/dashboard/mentor/feedbacks', 'Chất lượng & Phản hồi (QA)')}
              {navLink('/dashboard/interns', 'Quản lý Thực tập sinh (Members)')}
            </div>
          </>
        )}
      </nav>

      {/* Footer — User info + ThemeToggle + Logout */}
      <div className="p-3 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
        <ThemeToggle />
        <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar({ user, projects = [] }: { user: { name: string, email: string, role: string }, projects?: { id: string, title: string }[] }) {
  const pathname = usePathname();
  
  const parts = pathname.split('/');
  const isDashboardRoot = pathname === '/dashboard';
  const projectId = (!isDashboardRoot && parts[2] && parts[2] !== 'interns' && parts[2] !== 'mentor') ? parts[2] : null;

  const navLink = (href: string, label: string, exact = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href) && href !== '/dashboard';
    const isRootActive = href === '/dashboard' && pathname === '/dashboard';
    const active = isActive || isRootActive;
    return (
      <Link
        href={href}
        className="block px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
        style={{
          backgroundColor: active ? 'var(--sidebar-active-bg)' : 'transparent',
          color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
          fontWeight: active ? '600' : '500',
        }}
      >
        {label}
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
            {navLink('/dashboard', 'Báº£ng Äiá»u Khiá»ƒn (Dashboard)', true)}

            {projects.length > 0 && (
              <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  KhÃ´ng gian lÃ m viá»‡c
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
                        <span>{isActive ? 'ðŸ“‚' : 'ðŸ“'}</span>
                        <span className="truncate">{project.title}</span>
                      </Link>

                      {isActive && (
                        <div className="ml-4 pl-3 mt-0.5 space-y-0.5" style={{ borderLeft: '2px solid var(--border-color)' }}>
                          {subNavLink(`/dashboard/${project.id}`, 'Tá»•ng quan Dá»± Ã¡n')}
                          {subNavLink(`/dashboard/${project.id}/work-items`, 'Roadmap & Backlog')}
                          {subNavLink(`/dashboard/${project.id}/sprints`, 'Káº¿ hoáº¡ch Sprint')}
                          {subNavLink(`/dashboard/${project.id}/check-ins`, 'BÃ¡o cÃ¡o Tiáº¿n Ä‘á»™ (Standup)')}
                          {subNavLink(`/dashboard/${project.id}/settings`, 'TÃ­ch há»£p GitHub')}
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
            {navLink('/dashboard', 'Trung tÃ¢m Quáº£n lÃ½ (Command Center)', true)}

            <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                CÃ´ng cá»¥ Quáº£n lÃ½
              </p>
              {navLink('/dashboard/mentor/projects', 'Danh má»¥c Dá»± Ã¡n (Portfolios)')}
              {navLink('/dashboard/mentor/progress', 'Kiá»ƒm soÃ¡t Tiáº¿n Ä‘á»™ (Progress Tracker)')}
              {navLink('/dashboard/mentor/feedbacks', 'Cháº¥t lÆ°á»£ng & Pháº£n há»“i (QA)')}
              {navLink('/dashboard/interns', 'Quáº£n lÃ½ Thá»±c táº­p sinh (Members)')}
            </div>
          </>
        )}
      </nav>

      {/* Footer â€” User info + ThemeToggle + Logout */}
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

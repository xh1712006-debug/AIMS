'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

// --- Icon Components ---
const Icon = ({ d, className = "nav-icon" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  roadmap: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  sprint: "M13 10V3L4 14h7v7l9-11h-7z",
  checkin: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  github: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
  users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  inbox: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  qa: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  folder: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  events: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  blocker: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  progress: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  command: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  report: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
};

function NavLink({ href, label, icon, exact = false, badge, activeOverride }: { href: string; label: string; icon: string; exact?: boolean; badge?: number; activeOverride?: boolean }) {
  const pathname = usePathname();
  const isActive = exact 
    ? pathname === href 
    : (pathname === href || pathname.startsWith(href + '/')) && href !== '/dashboard';
  const isRootActive = href === '/dashboard' && pathname === '/dashboard';
  const active = activeOverride ?? (isActive || isRootActive);
  return (
    <Link href={href} className={`sidebar-nav-item ${active ? 'active' : ''}`}>
      <Icon d={icon} />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

// Separate client component to use usePathname
function NavLinkWrapper({ href, label, icon, exact = false, badge, activeOverride }: { href: string; label: string; icon: string; exact?: boolean; badge?: number; activeOverride?: boolean }) {
  return <NavLink href={href} label={label} icon={icon} exact={exact} badge={badge} activeOverride={activeOverride} />;
}

export default function Sidebar({ user, projects = [], pendingActionCount = 0 }: {
  user: { name: string; email: string; role: string };
  projects?: { id: string; title: string }[];
  pendingActionCount?: number;
}) {
  const pathname = usePathname();
  const parts = pathname.split('/');
  const projectId = (parts[2] && parts[2] !== 'interns' && parts[2] !== 'projectManager' && parts[2] !== 'project-manager' && parts[2] !== 'member-manager' && parts[2] !== 'partner' && parts[2] !== 'users' && parts[2] !== 'permissions' && parts[2] !== 'system') ? parts[2] : null;

  const roleLabel = {
    PROJECT_MANAGER: 'Project Manager',
    ADMIN: 'Administrator',
    MEMBER_MANAGER: 'Scrum Master',
    PARTNER: 'Partner',
    INTERN: 'Intern',
  }[user.role] ?? user.role;

  const roleColor = {
    PROJECT_MANAGER: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
    ADMIN: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    MEMBER_MANAGER: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    PARTNER: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    INTERN: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  }[user.role] ?? 'text-gray-600 bg-gray-50';

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const avatarBg = {
    PROJECT_MANAGER: 'from-violet-500 to-purple-600',
    ADMIN: 'from-red-500 to-rose-600',
    MEMBER_MANAGER: 'from-blue-500 to-indigo-600',
    PARTNER: 'from-amber-500 to-orange-600',
    INTERN: 'from-emerald-500 to-teal-600',
  }[user.role] ?? 'from-gray-500 to-gray-600';

  return (
    <aside
      className="w-full md:w-[220px] lg:w-[240px] md:h-screen flex-shrink-0 flex flex-col z-20"
      style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm tracking-tight">A</span>
          </div>
          <span className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>AIMS</span>
        </div>
      </div>

      <div className="mx-4 h-px" style={{ backgroundColor: 'var(--sidebar-border)' }} />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">

        {/* ─── INTERN ─── */}
        {user.role === 'INTERN' && (
          <>
            {projects.length === 0 && (
              <NavLinkWrapper href="/dashboard" icon={ICONS.dashboard} label="Dashboard" exact />
            )}

            {projects.length > 0 && projects.slice(0, 1).map((project) => (
              <div key={project.id} className="pt-2">

                <NavLinkWrapper href={`/dashboard/${project.id}`}            icon={ICONS.dashboard} label="Tổng quan" exact />
                <NavLinkWrapper href={`/dashboard/${project.id}/work-items`} icon={ICONS.roadmap}   label="Roadmap & Backlog" />
                <NavLinkWrapper href={`/dashboard/${project.id}/sprints`}    icon={ICONS.sprint}    label="Kế hoạch Sprint" />
                <NavLinkWrapper href={`/dashboard/${project.id}/check-ins`}  icon={ICONS.checkin}   label="Báo cáo Tiến độ" />
                <NavLinkWrapper href={`/dashboard/${project.id}/settings`}   icon={ICONS.github}    label="Tích hợp GitHub" />
              </div>
            ))}
          </>
        )}

        {/* ─── PROJECT MANAGER ─── */}
        {user.role === 'PROJECT_MANAGER' && (
          <>
            <NavLinkWrapper href="/dashboard" icon={ICONS.command} label="Command Center" exact />

            <p className="px-2 text-[9px] font-bold uppercase tracking-widest mb-1 mt-4"
               style={{ color: 'var(--text-muted)' }}>
              Quản lý
            </p>
            <NavLinkWrapper href="/dashboard/project-manager/inbox"    icon={ICONS.inbox}    label="Hộp thư xử lý"      badge={pendingActionCount} />
            <NavLinkWrapper href="/dashboard/project-manager/projects"  icon={ICONS.folder}   label="Danh mục Dự án" activeOverride={!!projectId} />
            <NavLinkWrapper href="/dashboard/project-manager/progress"  icon={ICONS.progress} label="Theo dõi Tiến độ" />
            <NavLinkWrapper href="/dashboard/project-manager/feedbacks" icon={ICONS.qa}       label="Chất lượng & QA" />
          </>
        )}

        {/* ─── ADMIN ─── */}
        {user.role === 'ADMIN' && (
          <>
            <NavLinkWrapper href="/dashboard" icon={ICONS.home} label="Trang chủ" exact />

            <p className="px-2 text-[9px] font-bold uppercase tracking-widest mb-1 mt-4"
               style={{ color: 'var(--text-muted)' }}>
              Quản trị
            </p>
            <NavLinkWrapper href="/dashboard/users"       icon={ICONS.users}    label="Quản lý Tài khoản" />
            <NavLinkWrapper href="/dashboard/permissions" icon={ICONS.shield}   label="Phân quyền & Roles" />
            <NavLinkWrapper href="/dashboard/system"      icon={ICONS.settings} label="Cài đặt hệ thống" />
          </>
        )}

        {/* ─── MEMBER MANAGER / SCRUM MASTER ─── */}
        {user.role === 'MEMBER_MANAGER' && (
          <>
            <NavLinkWrapper href="/dashboard" icon={ICONS.home} label="Trang chủ" exact />

            <p className="px-2 text-[9px] font-bold uppercase tracking-widest mb-1 mt-4"
               style={{ color: 'var(--text-muted)' }}>
              Scrum Tools
            </p>
            <NavLinkWrapper href="/dashboard/member-manager/events"   icon={ICONS.events}  label="Quản lý Sự kiện" />
            <NavLinkWrapper href="/dashboard/member-manager/blockers" icon={ICONS.blocker} label="Giải quyết Blockers" />
            <NavLinkWrapper href="/dashboard/member-manager/projects" icon={ICONS.eye}     label="Theo dõi Dự án" activeOverride={!!projectId} />
          </>
        )}

        {/* ─── PARTNER ─── */}
        {user.role === 'PARTNER' && (
          <>
            <NavLinkWrapper href="/dashboard" icon={ICONS.home} label="Trang chủ" exact />

            <p className="px-2 text-[9px] font-bold uppercase tracking-widest mb-1 mt-4"
               style={{ color: 'var(--text-muted)' }}>
              Giám sát
            </p>
            <NavLinkWrapper href="/dashboard/partner/projects" icon={ICONS.eye}    label="Tổng quan Dự án" activeOverride={!!projectId} />
            <NavLinkWrapper href="/dashboard/partner/reports"  icon={ICONS.report} label="Báo cáo Định kỳ" />
          </>
        )}
      </nav>

      {/* ── Footer: Theme + User ── */}
      <div className="flex-shrink-0 p-3 border-t flex items-center justify-between gap-1" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5 min-w-0 pl-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0 ring-2 ring-white dark:ring-[#171717]`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
            <p className="text-[10px] font-medium truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <ThemeToggle iconOnly />
          <LogoutButton iconOnly />
        </div>
      </div>
    </aside>
  );
}

'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      title="Đăng xuất"
      className={
        iconOnly 
          ? "flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          : "w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150"
      }
      style={!iconOnly ? { color: 'var(--text-muted)' } : { color: 'var(--text-muted)' }}
      onMouseEnter={!iconOnly ? ((e) => {
        e.currentTarget.style.backgroundColor = 'var(--danger-light)';
        e.currentTarget.style.color = 'var(--danger)';
      }) : undefined}
      onMouseLeave={!iconOnly ? ((e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-muted)';
      }) : undefined}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {!iconOnly && <span>Đăng xuất</span>}
    </button>
  );
}

'use client';

import { useEffect, useState, useTransition } from 'react';
import WorkItemComments from './WorkItemComments';
import { markTaskAcknowledged } from '@/app/actions';

const STATUS_META: Record<string, { label: string; cls: string; barColor: string }> = {
  TODO:        { label: 'To Do',       cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',               barColor: '#9ca3af' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',             barColor: '#3b82f6' },
  REVIEW:      { label: 'Review',      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',         barColor: '#f59e0b' },
  DONE:        { label: 'Done',        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', barColor: '#10b981' },
  BLOCKED:     { label: 'Blocked',     cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',                 barColor: '#ef4444' },
};

const TYPE_EMOJI: Record<string, string> = {
  FEATURE: '🚀', RESEARCH: '🔬', EXPERIMENT: '🧪', ANALYSIS: '📊',
  BUG: '🐛', SPIKE: '⚡', TEST: '✅', DOCUMENTATION: '📝',
};

const DOT_COLOR: Record<string, string> = {
  TODO: '#9ca3af', IN_PROGRESS: '#3b82f6', REVIEW: '#f59e0b', DONE: '#10b981', BLOCKED: '#ef4444',
};

export default function TaskDetailModal({
  task,
  projectId,
  userRole,
  onClose,
}: {
  task: any;
  projectId: string;
  userRole: string;
  onClose: () => void;
}) {
  const isAcknowledged = task.managerFeedback?.startsWith('[PM_ACK]') ?? false;
  const [acknowledged, setAcknowledged] = useState(isAcknowledged);
  const [isPending, startTransition] = useTransition();

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!task) return null;

  const status = STATUS_META[task.status] ?? STATUS_META.TODO;
  const typeEmoji = TYPE_EMOJI[task.type] ?? '📌';
  const barColor = DOT_COLOR[task.status] ?? '#9ca3af';
  const dotColor = DOT_COLOR[task.status] ?? '#9ca3af';
  const canAcknowledge = (userRole === 'PROJECT_MANAGER' || userRole === 'ADMIN')
    && (task.status === 'BLOCKED' || task.status === 'REVIEW');

  const handleToggleAck = () => {
    const next = !acknowledged;
    setAcknowledged(next);
    startTransition(async () => {
      await markTaskAcknowledged(task.id, projectId, next);
    });
  };

  return (
    /* ── Backdrop: overflow-y-auto so modal never gets cut at top ── */
    <div
      className="fixed inset-0 z-[200] overflow-y-auto bg-gray-950/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="flex min-h-full items-center justify-center p-4 py-8"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="bg-white dark:bg-[#161616] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col ring-1 ring-gray-200 dark:ring-[#2a2a2a] animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Status color bar ── */}
          <div className="h-1.5 w-full flex-shrink-0" style={{ backgroundColor: barColor }} />

          {/* ── Header ── */}
          <div className="px-6 pt-5 pb-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-300">
                    <span>{typeEmoji}</span>
                    {task.type}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${status.cls}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                    {status.label}
                  </span>

                  {task.priority && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border"
                      style={{
                        borderColor: task.priority.color ? `${task.priority.color}50` : '#e5e7eb',
                        color: task.priority.color || '#6b7280',
                        backgroundColor: task.priority.color ? `${task.priority.color}15` : 'transparent',
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.priority.color }} />
                      {task.priority.name}
                    </span>
                  )}

                  {task.requiresFix && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-red-50 text-red-600 dark:bg-red-900/25 dark:text-red-400 border border-red-200 dark:border-red-800">
                      ⚠️ Cần sửa
                    </span>
                  )}

                  {acknowledged && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 dark:bg-emerald-900/25 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      ✓ Đã xử lý
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-black leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {task.title}
                </h2>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all"
                title="Đóng (Esc)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mx-6 h-px bg-gray-100 dark:bg-[#2a2a2a]" />

          {/* ── Body ── */}
          <div className="p-6 max-h-[55vh] overflow-y-auto custom-scrollbar space-y-5">

            {/* Description */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Mô tả</p>
              {task.description ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-[#1f1f1f] rounded-xl p-4">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-[#1f1f1f] rounded-xl p-4">Chưa có mô tả chi tiết.</p>
              )}
            </div>

            {/* Meta */}
            {(task.estimate || task.dueDate || task.evidenceLink) && (
              <div className="grid grid-cols-2 gap-3">
                {task.estimate && (
                  <div className="bg-gray-50 dark:bg-[#1f1f1f] rounded-xl p-3 border border-gray-100 dark:border-[#2a2a2a]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">⏱ Ước tính</p>
                    <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{task.estimate}h</p>
                  </div>
                )}
                {task.dueDate && (
                  <div className="bg-gray-50 dark:bg-[#1f1f1f] rounded-xl p-3 border border-gray-100 dark:border-[#2a2a2a]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">📅 Deadline</p>
                    <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                      {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
                {task.evidenceLink && (
                  <div className="bg-gray-50 dark:bg-[#1f1f1f] rounded-xl p-3 border border-gray-100 dark:border-[#2a2a2a] col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">🔗 Minh chứng</p>
                    <a href={task.evidenceLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
                      {task.evidenceLink}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Manager Feedback (non-ACK only) */}
            {task.managerFeedback && !task.managerFeedback.startsWith('[PM_ACK]') && (
              <div className="rounded-2xl overflow-hidden border border-violet-200 dark:border-violet-800/50">
                <div className="bg-violet-50 dark:bg-violet-900/20 px-4 py-2.5 flex items-center gap-2 border-b border-violet-100 dark:border-violet-800/30">
                  <span>💬</span>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Nhận xét từ PM</h4>
                </div>
                <div className="px-4 py-3 bg-white dark:bg-[#1f1f1f]">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{task.managerFeedback}</p>
                </div>
              </div>
            )}

            {/* Comments — key=task.id forces remount when task changes → no bleeding */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Trao đổi & Cập nhật</p>
              <WorkItemComments key={task.id} workItemId={task.id} comments={task.comments || []} />
            </div>
          </div>

          <div className="mx-6 h-px bg-gray-100 dark:bg-[#2a2a2a]" />

          {/* ── Footer ── */}
          <div className="px-6 py-3 flex-shrink-0 flex items-center justify-between gap-3">
            <p className="text-[10px] font-medium text-gray-400">
              {new Date(task.createdAt).toLocaleString('vi-VN')}
            </p>

            {/* PM Acknowledge Toggle */}
            {canAcknowledge && (
              <button
                onClick={handleToggleAck}
                disabled={isPending}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                  acknowledged
                    ? 'bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 dark:bg-[#2a2a2a] dark:hover:bg-orange-900/30 dark:text-gray-400 dark:hover:text-orange-400 border border-gray-200 dark:border-[#383838]'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                }`}
              >
                {isPending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : acknowledged ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Đang xử lý
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Đã xử lý xong
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

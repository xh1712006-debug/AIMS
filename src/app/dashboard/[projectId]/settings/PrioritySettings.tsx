'use client';

import { useState } from 'react';
import { createPriorityLevel, updatePriorityLevel, deletePriorityLevel } from '@/app/actions';

export default function PrioritySettings({ projectId, initialPriorities }: { projectId: string, initialPriorities: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true);
    await createPriorityLevel(formData);
    setIsSubmitting(false);
    (document.getElementById('create-priority-form') as HTMLFormElement)?.reset();
  };

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true);
    await updatePriorityLevel(formData);
    setIsSubmitting(false);
    setEditingId(null);
  };

  const handleDelete = async (formData: FormData) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấp độ ưu tiên này? Các công việc đang dùng cấp độ này sẽ bị mất thông tin ưu tiên.')) return;
    setIsSubmitting(true);
    await deletePriorityLevel(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="aims-card p-6 border-t-4 border-t-indigo-500">
      <h3 className="text-base font-black mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Quản lý Mức độ Ưu tiên
      </h3>
      <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
        Thêm, sửa, xóa các cấp độ ưu tiên cho các công việc trong dự án (VD: Must Have, Should Have).
      </p>
      
      <div className="space-y-3 mb-8">
        {initialPriorities.map(p => (
          <div key={p.id} className="group flex items-center p-4 bg-gray-50/50 dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
            {editingId === p.id ? (
              <form action={handleUpdate} className="flex flex-col sm:flex-row gap-3 w-full">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="projectId" value={projectId} />
                
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Tên cấp độ</label>
                  <input name="name" defaultValue={p.name} required className="w-full rounded-lg bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 text-sm" />
                </div>
                <div className="w-full sm:w-20">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Trọng số</label>
                  <input name="level" type="number" defaultValue={p.level} required className="w-full rounded-lg bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 text-sm" />
                </div>
                <div className="w-full sm:w-28">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Màu sắc (HEX)</label>
                  <input name="color" defaultValue={p.color || ''} placeholder="#ff0000" className="w-full rounded-lg bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 text-sm font-mono uppercase" />
                </div>
                
                <div className="flex gap-2 items-end">
                  <button type="submit" disabled={isSubmitting} className="h-[38px] px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 font-bold text-sm rounded-lg transition-colors">
                    Lưu
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="h-[38px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 font-bold text-sm rounded-lg transition-colors">
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200/50 dark:bg-gray-800 text-xs font-black text-gray-600 dark:text-gray-400">
                    {p.level}
                  </span>
                  <span className="font-black text-base" style={{ color: p.color || 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingId(p.id)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="projectId" value={projectId} />
                    <button type="submit" disabled={isSubmitting} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}

        {initialPriorities.length === 0 && (
          <div className="py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center">
            <p className="text-gray-500 font-medium text-sm">Chưa có cấp độ ưu tiên nào.</p>
          </div>
        )}
      </div>

      {/* ── Create Priority Form ── */}
      <div className="p-5 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-100 dark:border-gray-800">
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Thêm cấp độ ưu tiên mới
        </h4>
        <form id="create-priority-form" action={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="flex-1 w-full">
            <input name="name" required placeholder="Tên cấp độ (VD: Khẩn cấp)" className="w-full rounded-lg bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 text-sm font-medium" />
          </div>
          <div className="w-full sm:w-28">
            <input name="level" type="number" required placeholder="Trọng số (Số)" className="w-full rounded-lg bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 text-sm" />
          </div>
          <div className="w-full sm:w-32">
            <input name="color" placeholder="Màu (#hex)" className="w-full rounded-lg bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 text-sm font-mono uppercase" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-[42px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm focus:ring-4 focus:ring-indigo-500/30">
            Thêm Mới
          </button>
        </form>
      </div>
    </div>
  );
}

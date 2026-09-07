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
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#334155] max-w-2xl mt-6">
      <h3 className="text-base font-bold mb-1 text-gray-900 dark:text-[#F1F5F9]">Quản lý Mức độ Ưu tiên</h3>
      <p className="text-sm text-gray-500 dark:text-[#64748B] mb-5">Thêm, sửa, xóa các cấp độ ưu tiên (Ví dụ: Cấp 1, Khẩn cấp, Must Have...).</p>
      
      <div className="space-y-3 mb-6">
        {initialPriorities.map(p => (
          <div key={p.id} className="p-3.5 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-[#475569]">
            {editingId === p.id ? (
              <form action={handleUpdate} className="flex gap-2 items-end">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="projectId" value={projectId} />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Tên cấp độ</label>
                  <input name="name" defaultValue={p.name} required className="w-full rounded border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 p-1.5 text-sm" />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Trọng số</label>
                  <input name="level" type="number" defaultValue={p.level} required className="w-full rounded border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 p-1.5 text-sm" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Màu (Mã HEX)</label>
                  <input name="color" defaultValue={p.color || ''} placeholder="#ff0000" className="w-full rounded border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 p-1.5 text-sm font-mono" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={isSubmitting} className="p-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded hover:bg-green-200">Lưu</button>
                  <button type="button" onClick={() => setEditingId(null)} className="p-1.5 bg-gray-200 text-gray-700 dark:text-[#CBD5E1] rounded hover:bg-gray-300">Hủy</button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 text-xs font-bold text-gray-600 dark:text-[#94A3B8]">{p.level}</span>
                  <span className="font-bold text-gray-900 dark:text-[#F1F5F9]" style={{ color: p.color || 'inherit' }}>{p.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(p.id)} className="text-blue-600 hover:underline text-sm font-semibold">Sửa</button>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="projectId" value={projectId} />
                    <button type="submit" disabled={isSubmitting} className="text-red-600 hover:underline text-sm font-semibold">Xóa</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
        {initialPriorities.length === 0 && (
          <p className="text-gray-500 dark:text-[#64748B] italic text-sm text-center py-4">Chưa có cấp độ ưu tiên nào. Bạn hãy tạo mới ở bên dưới.</p>
        )}
      </div>

      <div className="pt-5 border-t border-gray-100 dark:border-[#334155]">
        <h4 className="text-xs font-bold text-gray-900 dark:text-[#F1F5F9] mb-2.5 uppercase tracking-wider">Tạo cấp độ mới</h4>
        <form id="create-priority-form" action={handleCreate} className="flex gap-2 items-end">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Tên cấp độ</label>
            <input name="name" required placeholder="VD: Khẩn cấp, Cấp 1..." className="w-full rounded border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm" />
          </div>
          <div className="w-24">
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Trọng số (Số)</label>
            <input name="level" type="number" required placeholder="1, 2, 3" className="w-full rounded border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm" />
          </div>
          <div className="w-28">
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Màu (Tùy chọn)</label>
            <input name="color" placeholder="#ef4444" className="w-full rounded border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm font-mono" />
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold rounded px-4 py-2 hover:bg-blue-700 transition-colors">
            Thêm
          </button>
        </form>
      </div>
    </div>
  );
}

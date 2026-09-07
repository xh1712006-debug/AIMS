'use client';

import { useState } from 'react';
import { updateWorkItem } from '@/app/actions';

export default function EditWorkItemModal({ 
  item, 
  projectId,
  priorityLevels = [],
  onClose
}: { 
  item: any;
  projectId: string;
  priorityLevels?: any[];
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await updateWorkItem(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#334155] flex justify-between items-center bg-gray-50/50 dark:bg-[#0F172A]/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#F1F5F9]">Sửa công việc</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-[#475569] hover:text-gray-600 dark:text-[#94A3B8] transition-colors p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="sprintId" value={item.sprintId || ''} />
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Tên công việc</label>
              <input name="title" required type="text" defaultValue={item.title} className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Loại</label>
                <select name="type" defaultValue={item.type} className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                  <option value="TASK">Task</option>
                  <option value="STORY">Story</option>
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Mức độ ưu tiên</label>
                <select name="priorityId" defaultValue={item.priorityId || ''} className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                  <option value="">-- Chọn mức độ --</option>
                  {priorityLevels.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Trạng thái</label>
              <select name="status" defaultValue={item.status} className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="DONE">DONE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-[#334155] flex gap-3 justify-end mt-6">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 font-bold text-gray-700 dark:text-[#CBD5E1] bg-gray-100 dark:bg-[#334155] rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm dark:shadow-none disabled:opacity-50"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

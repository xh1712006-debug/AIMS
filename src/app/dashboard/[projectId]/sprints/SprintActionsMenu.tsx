'use client';

import { useState } from 'react';
import { updateSprint, deleteSprint } from '@/app/actions';

export default function SprintActionsMenu({ 
  sprint, 
  projectId 
}: { 
  sprint: any, 
  projectId: string 
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    await updateSprint(formData);
    setIsEditOpen(false);
  };

  const handleDelete = async (formData: FormData) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${sprint.name}"?\nCẢNH BÁO: Hành động này không thể hoàn tác!`)) {
      await deleteSprint(formData);
    }
  };

  // Format dates for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateObj: Date) => {
    return new Date(dateObj).toISOString().split('T')[0];
  };

  return (
    <div className="flex gap-2 ml-4">
      <button 
        onClick={() => setIsEditOpen(true)}
        className="text-gray-400 dark:text-[#475569] hover:text-blue-600 transition-colors p-1"
        title="Chỉnh sửa Sprint"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>

      <form action={handleDelete}>
        <input type="hidden" name="id" value={sprint.id} />
        <input type="hidden" name="projectId" value={projectId} />
        <button 
          type="submit"
          className="text-gray-400 dark:text-[#475569] hover:text-red-600 transition-colors p-1"
          title="Xóa Sprint"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </form>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#334155] flex justify-between items-center bg-gray-50/50 dark:bg-[#0F172A]/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#F1F5F9]">Chỉnh sửa Sprint</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 dark:text-[#475569] hover:text-gray-600 dark:text-[#94A3B8] transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-left font-normal">
              <form action={handleUpdate} className="space-y-4">
                <input type="hidden" name="id" value={sprint.id} />
                <input type="hidden" name="projectId" value={projectId} />
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Tên Sprint</label>
                  <input name="name" defaultValue={sprint.name} required type="text" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Ngày bắt đầu</label>
                  <input name="startDate" defaultValue={formatDateForInput(sprint.startDate)} required type="date" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Ngày kết thúc</label>
                  <input name="endDate" defaultValue={formatDateForInput(sprint.endDate)} required type="date" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#334155] flex gap-3 justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 font-bold text-gray-700 dark:text-[#CBD5E1] bg-gray-100 dark:bg-[#334155] rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm dark:shadow-none"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { updateWorkItem, deleteWorkItem } from '@/app/actions';

export default function WorkItemActionsMenu({ 
  item, 
  epics, 
  projectId,
  priorityLevels
}: { 
  item: any, 
  epics: any[], 
  projectId: string,
  priorityLevels?: any[]
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [type, setType] = useState(item.type);

  const handleUpdate = async (formData: FormData) => {
    await updateWorkItem(formData);
    setIsEditOpen(false);
  };

  const handleDelete = async (formData: FormData) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${item.title}"?${item.type === 'EPIC' ? '\\nCẢNH BÁO: Xóa Epic sẽ xóa cả các công việc con của nó!' : ''}`)) {
      await deleteWorkItem(formData);
    }
  };

  return (
    <div className="flex gap-2 ml-4">
      <button 
        onClick={() => setIsEditOpen(true)}
        className="text-gray-400 dark:text-[#383838] hover:text-blue-600 transition-colors p-1"
        title="Chỉnh sửa"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>

      <form action={handleDelete}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="projectId" value={projectId} />
        <button 
          type="submit"
          className="text-gray-400 dark:text-[#383838] hover:text-red-600 transition-colors p-1"
          title="Xóa công việc"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </form>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#262626] flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Chỉnh sửa công việc</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 dark:text-[#383838] hover:text-gray-600 dark:text-[#A3A3A3] transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-left">
              <form action={handleUpdate} className="space-y-4">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="projectId" value={projectId} />
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Tên công việc</label>
                  <input name="title" defaultValue={item.title} required type="text" className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Loại (Type)</label>
                  <select 
                    name="type" 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm"
                  >
                    <option value="EPIC">Epic (Tính năng lớn)</option>
                    <option value="STORY">Story (Câu chuyện ND)</option>
                    <option value="FEATURE">Feature (Tính năng)</option>
                    <option value="TASK">Task (Công việc)</option>
                    <option value="BUG">Bug (Lỗi)</option>
                  </select>
                </div>

                {type !== 'EPIC' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Thuộc Epic (Parent) <span className="text-red-500">*</span></label>
                    <select 
                      name="parentId" 
                      required
                      defaultValue={item.parentId || ""}
                      className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm bg-gray-50 dark:bg-[#0A0A0A]"
                    >
                      <option value="">-- Chọn Epic --</option>
                      {epics.filter(e => e.id !== item.id).map(epic => (
                        <option key={epic.id} value={epic.id}>{epic.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Độ ưu tiên</label>
                  <select name="priorityId" defaultValue={item.priorityId || ''} className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                    <option value="">-- Chọn mức độ --</option>
                    {priorityLevels?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#262626] flex gap-3 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 font-bold text-gray-700 dark:text-[#D4D4D4] bg-gray-100 dark:bg-[#262626] rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={type !== 'EPIC' && epics.filter(e => e.id !== item.id).length === 0}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm dark:shadow-none disabled:opacity-50"
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

'use client';

import { useState } from 'react';
import { createSprint } from '@/app/actions';

export default function CreateSprintModal({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    await createSprint(formData);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm dark:shadow-none flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Tạo Sprint Mới
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#334155] flex justify-between items-center bg-gray-50/50 dark:bg-[#0F172A]/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#F1F5F9]">Tạo Sprint Mới</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 dark:text-[#475569] hover:text-gray-600 dark:text-[#94A3B8] transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="projectId" value={projectId} />
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Tên Sprint</label>
                  <input name="name" required type="text" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="VD: Sprint 1" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Ngày bắt đầu</label>
                  <input name="startDate" required type="date" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Ngày kết thúc</label>
                  <input name="endDate" required type="date" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#334155] flex gap-3 justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 font-bold text-gray-700 dark:text-[#CBD5E1] bg-gray-100 dark:bg-[#334155] rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm dark:shadow-none"
                  >
                    Tạo Sprint
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

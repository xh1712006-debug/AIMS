'use client';

import { useState } from 'react';
import { updateProject } from '@/app/actions';

type ProjectData = {
  id: string;
  title: string;
  track: string;
  internId: string;
  startDate: Date;
  endDate: Date;
  manualRisk?: 'GREEN' | 'YELLOW' | 'RED' | null;
  status?: string;
};

export default function EditProjectModal({ project, interns }: { project: ProjectData, interns: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors ml-2"
      >
        Chỉnh sửa
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl w-full max-w-md overflow-hidden relative text-left">
            <div className="p-4 border-b border-gray-100 dark:border-[#334155] flex justify-between items-center bg-gray-50/50 dark:bg-[#0F172A]/50">
              <h3 className="font-bold text-gray-900 dark:text-[#F1F5F9] text-lg">Sửa thông tin Dự án</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 dark:text-[#475569] hover:text-gray-600 dark:text-[#94A3B8] p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form 
              action={updateProject} 
              onSubmit={() => setTimeout(() => setIsOpen(false), 300)}
              className="p-6 space-y-4"
            >
              <input type="hidden" name="id" value={project.id} />
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Tên Dự án</label>
                <input name="title" defaultValue={project.title} required type="text" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Thực tập sinh</label>
                <select name="internId" defaultValue={project.internId} required className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                  {interns.map(i => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Track</label>
                <select name="track" defaultValue={project.track} className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                  <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
                  <option value="AI_ML_RESEARCH">AI/ML Research</option>
                  <option value="DATA_ANALYTICS">Data Analytics</option>
                  <option value="SOFTWARE_TESTING">Software Testing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Ngày bắt đầu</label>
                  <input name="startDate" defaultValue={new Date(project.startDate).toISOString().split('T')[0]} required type="date" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Ngày kết thúc</label>
                  <input name="endDate" defaultValue={new Date(project.endDate).toISOString().split('T')[0]} required type="date" className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-[#334155]">
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Cảnh báo Rủi ro (Manual Risk)</label>
                <select name="manualRisk" defaultValue={project.manualRisk || 'NONE'} className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm bg-gray-50 dark:bg-[#0F172A] font-semibold">
                  <option value="NONE">🤖 Tự động (Auto Risk)</option>
                  <option value="GREEN" className="text-green-600 font-bold">🟢 GREEN (On Track)</option>
                  <option value="YELLOW" className="text-yellow-600 font-bold">🟡 YELLOW (Cần chú ý)</option>
                  <option value="RED" className="text-red-600 font-bold">🔴 RED (Chậm / Blocked)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-[#64748B] mt-1">Ghi đè cảnh báo tự động. Để "Tự động" để hệ thống tự tính.</p>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-[#334155]">
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#CBD5E1] mb-1">Trạng thái Dự án (Project Status)</label>
                <select name="status" defaultValue={project.status || 'ACTIVE'} className="w-full rounded-lg border-gray-300 dark:border-[#475569] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                  <option value="ACTIVE">🟢 Đang hoạt động (Active)</option>
                  <option value="COMPLETED">✅ Đã hoàn thành (Completed)</option>
                  <option value="ON_HOLD">⏸️ Tạm dừng (On Hold)</option>
                  <option value="WITHDRAWN">⛔ Đã rút lui (Withdrawn)</option>
                </select>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full bg-amber-600 text-white font-bold rounded-lg py-2.5 hover:bg-amber-500 transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

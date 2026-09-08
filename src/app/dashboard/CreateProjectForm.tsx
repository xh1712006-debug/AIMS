'use client';

import { createProject } from '@/app/actions';
import { useState } from 'react';

export default function CreateProjectForm({ interns }: { interns: { id: string, name: string | null, email: string | null }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = new Date(e.target.value);
    if (!isNaN(startDate.getTime())) {
      // Add 10 weeks (10 * 7 = 70 days)
      const end = new Date(startDate);
      end.setDate(startDate.getDate() + 70);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Phân công Dự án
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Modal content */}
          <div className="relative bg-white dark:bg-[#171717] rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#262626] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#262626] flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]/50">
              <h3 className="text-xl font-black text-gray-900 dark:text-[#EDEDED] tracking-tight">Thêm Dự án Mới</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form action={createProject} className="space-y-5" onSubmit={() => setTimeout(() => setIsOpen(false), 100)}>
                <div>
                  <label className="block text-[13px] uppercase tracking-wider font-bold text-gray-500 dark:text-[#737373] mb-1.5">Thực tập sinh</label>
                  <select name="internId" required className="w-full rounded-xl border-gray-200 dark:border-[#383838] bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#EDEDED] focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 text-sm transition-shadow">
                    <option value="">-- Chọn một Intern --</option>
                    {interns.map(i => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] uppercase tracking-wider font-bold text-gray-500 dark:text-[#737373] mb-1.5">Tên Dự án</label>
                  <input name="title" required type="text" className="w-full rounded-xl border-gray-200 dark:border-[#383838] bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#EDEDED] focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 text-sm transition-shadow" placeholder="VD: Ứng dụng E-commerce" />
                </div>
                <div>
                  <label className="block text-[13px] uppercase tracking-wider font-bold text-gray-500 dark:text-[#737373] mb-1.5">Track / Ngành</label>
                  <select name="track" className="w-full rounded-xl border-gray-200 dark:border-[#383838] bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#EDEDED] focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 text-sm transition-shadow">
                    <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
                    <option value="AI_ML_RESEARCH">AI/ML Research</option>
                    <option value="DATA_ANALYTICS">Data Analytics</option>
                    <option value="SOFTWARE_TESTING">Software Testing</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] uppercase tracking-wider font-bold text-gray-500 dark:text-[#737373] mb-1.5">Bắt đầu</label>
                    <input name="startDate" required type="date" onChange={handleStartDateChange} className="w-full rounded-xl border-gray-200 dark:border-[#383838] bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#EDEDED] focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 text-sm transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-[13px] uppercase tracking-wider font-bold text-gray-500 dark:text-[#737373] mb-1.5">Kết thúc (10 tuần)</label>
                    <input name="endDate" required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-[#383838] bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#EDEDED] focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 text-sm transition-shadow" />
                  </div>
                </div>
                <div className="flex items-start space-x-3 pt-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <div className="flex h-5 items-center">
                    <input type="checkbox" id="generateTimeline" name="generateTimeline" value="true" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                  </div>
                  <label htmlFor="generateTimeline" className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    Tự động tạo lộ trình chuẩn (10 tuần) cho Thực tập sinh
                  </label>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-[#262626] flex gap-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-[#383838] text-gray-700 dark:text-[#A3A3A3] font-bold hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors">
                    Hủy bỏ
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all active:scale-95">
                    Xác nhận Tạo
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

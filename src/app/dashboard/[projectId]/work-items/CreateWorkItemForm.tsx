'use client';

import { useState } from 'react';
import { createWorkItem } from '@/app/actions';

// ItemType options per role (theo chuẩn Excel Agile)
const PM_TYPE_OPTIONS = [
  { value: 'FEATURE',       label: 'Feature',      subLabel: 'Tính năng',         color: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-800' },
  { value: 'RESEARCH',      label: 'Research',     subLabel: 'Nghiên cứu',        color: 'bg-indigo-500', border: 'border-indigo-200 dark:border-indigo-800' },
  { value: 'EXPERIMENT',    label: 'Experiment',   subLabel: 'Thử nghiệm',      color: 'bg-teal-500',   border: 'border-teal-200 dark:border-teal-800' },
  { value: 'ANALYSIS',      label: 'Analysis',     subLabel: 'Phân tích',         color: 'bg-blue-500',   border: 'border-blue-200 dark:border-blue-800' },
];

const INTERN_TYPE_OPTIONS = [
  { value: 'BUG',           label: 'Bug',          subLabel: 'Lỗi',               color: 'bg-red-500',      border: 'border-red-200 dark:border-red-800' },
  { value: 'SPIKE',         label: 'Spike',        subLabel: 'Khám phá',          color: 'bg-amber-500',    border: 'border-amber-200 dark:border-amber-800' },
  { value: 'TEST',          label: 'Test',         subLabel: 'Kiểm thử',          color: 'bg-emerald-500',  border: 'border-emerald-200 dark:border-emerald-800' },
  { value: 'DOCUMENTATION', label: 'Docs',         subLabel: 'Tài liệu',          color: 'bg-gray-500',     border: 'border-gray-200 dark:border-gray-800' },
];

const ALL_TYPE_OPTIONS = [...PM_TYPE_OPTIONS, ...INTERN_TYPE_OPTIONS];

export default function CreateWorkItemForm({ 
  projectId, 
  parentItems, 
  priorityLevels = [], 
  userRole 
}: { 
  projectId: string, 
  parentItems: any[], 
  priorityLevels?: any[], 
  userRole?: string 
}) {
  const typeOptions =
    userRole === 'PROJECT_MANAGER' ? PM_TYPE_OPTIONS :
    userRole === 'INTERN'          ? INTERN_TYPE_OPTIONS :
    ALL_TYPE_OPTIONS;

  const [type, setType] = useState(typeOptions[0]?.value ?? 'FEATURE');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    await createWorkItem(formData);
    setIsOpen(false);
    setType(typeOptions[0]?.value ?? 'FEATURE');
  };

  // Items that can be a parent (Feature/Research/Experiment/Analysis)
  const topLevelItems = parentItems.filter(i =>
    ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'].includes(i.type)
  );

  // Child types need a parent item
  const isChildType = ['BUG', 'SPIKE', 'TEST', 'DOCUMENTATION'].includes(type);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm dark:shadow-none flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Thêm công việc
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#111]/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Thêm Công Việc Mới</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form action={handleSubmit} className="space-y-5">
                <input type="hidden" name="projectId" value={projectId} />
                
                {/* Type Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Loại công việc
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map(opt => {
                      const isSelected = type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                            isSelected
                              ? `border-transparent bg-gray-900 text-white dark:bg-white dark:text-black shadow-md ring-2 ring-gray-900/20 dark:ring-white/20`
                              : `border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800`
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${opt.color} ${isSelected ? 'opacity-100' : 'opacity-70'}`} />
                          <span>{opt.label}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'} font-normal`}>
                            ({opt.subLabel})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" name="type" value={type} />
                </div>

                {/* Parent item picker (for child types) */}
                {isChildType && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Thuộc Mục Tiêu Lớn (Roadmap) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        name="parentId" 
                        required
                        className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2.5 pl-3 pr-10 text-sm bg-white dark:bg-[#111] text-gray-900 dark:text-[#EDEDED] transition-colors"
                      >
                        <option value="">-- Chọn mục tiêu mà công việc này phục vụ --</option>
                        {topLevelItems.map(item => (
                          <option key={item.id} value={item.id}>{item.title}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    {topLevelItems.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Bạn cần tạo ít nhất 1 Mục tiêu lớn (Roadmap) trước khi tạo các công việc chi tiết.
                      </p>
                    )}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="title" 
                    required 
                    type="text" 
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 text-sm bg-white dark:bg-[#111] text-gray-900 dark:text-[#EDEDED] placeholder-gray-400 transition-colors"
                    placeholder={
                      type === 'FEATURE'       ? 'VD: Tính năng đăng nhập OAuth' :
                      type === 'RESEARCH'      ? 'VD: Nghiên cứu kiến trúc Transformer' :
                      type === 'EXPERIMENT'    ? 'VD: Thử nghiệm XGBoost vs Random Forest' :
                      type === 'ANALYSIS'      ? 'VD: Phân tích EDA bộ dữ liệu điện' :
                      type === 'BUG'           ? 'VD: Lỗi login khi email có ký tự đặc biệt' :
                      type === 'SPIKE'         ? 'VD: Tìm hiểu giới hạn của GitHub API' :
                      type === 'TEST'          ? 'VD: Test case luồng thanh toán' :
                      'VD: Viết hướng dẫn cài đặt môi trường'
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  {priorityLevels.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Độ ưu tiên</label>
                      <div className="relative">
                        <select name="priorityId" className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2.5 pl-3 pr-10 text-sm bg-white dark:bg-[#111] text-gray-900 dark:text-[#EDEDED] transition-colors">
                          <option value="">-- Chọn mức độ --</option>
                          {priorityLevels.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Due date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Hạn chót</label>
                    <input name="dueDate" type="date" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 text-sm bg-white dark:bg-[#111] text-gray-900 dark:text-[#EDEDED] transition-colors" />
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#222] rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] transition-colors text-sm"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={isChildType && topLevelItems.length === 0}
                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-md disabled:opacity-50 text-sm"
                  >
                    Tạo công việc
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

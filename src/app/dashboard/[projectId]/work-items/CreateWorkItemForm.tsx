'use client';

import { useState } from 'react';
import { createWorkItem } from '@/app/actions';

// ItemType options per role (theo chuẩn Excel Agile)
const PM_TYPE_OPTIONS = [
  { value: 'FEATURE',       label: 'Feature (Tính năng)',         emoji: '🚀' },
  { value: 'RESEARCH',      label: 'Research (Nghiên cứu)',        emoji: '🔬' },
  { value: 'EXPERIMENT',    label: 'Experiment (Thử nghiệm)',      emoji: '🧪' },
  { value: 'ANALYSIS',      label: 'Analysis (Phân tích dữ liệu)', emoji: '📊' },
];

const INTERN_TYPE_OPTIONS = [
  { value: 'BUG',           label: 'Bug (Lỗi cần sửa)',           emoji: '🐛' },
  { value: 'SPIKE',         label: 'Spike (Khám phá/Đánh giá)',    emoji: '⚡' },
  { value: 'TEST',          label: 'Test (Kiểm thử)',              emoji: '✅' },
  { value: 'DOCUMENTATION', label: 'Documentation (Tài liệu)',     emoji: '📝' },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#262626] flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Thêm Công Việc Mới</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#A3A3A3] transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="projectId" value={projectId} />
                
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-2">
                    Loại công việc (Type)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {typeOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left text-sm font-semibold transition-all ${
                          type === opt.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-[#383838] text-gray-600 dark:text-[#A3A3A3] hover:border-gray-300'
                        }`}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span className="text-xs leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="type" value={type} />
                </div>

                {/* Parent item picker (for child types) */}
                {isChildType && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">
                      Thuộc công việc cha <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="parentId" 
                      required
                      className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm bg-gray-50 dark:bg-[#0A0A0A]"
                    >
                      <option value="">-- Chọn Feature/Research/... --</option>
                      {topLevelItems.map(item => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                      ))}
                    </select>
                    {topLevelItems.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                        ⚠️ Cần tạo ít nhất 1 Feature/Research trước khi thêm Bug/Spike...
                      </p>
                    )}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="title" 
                    required 
                    type="text" 
                    className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm"
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

                {/* Priority */}
                {priorityLevels.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Độ ưu tiên (MoSCoW)</label>
                    <select name="priorityId" className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                      <option value="">-- Chọn mức độ --</option>
                      {priorityLevels.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Due date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Hạn chót (Tùy chọn)</label>
                  <input name="dueDate" type="date" className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#262626] flex gap-3 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 font-bold text-gray-700 dark:text-[#D4D4D4] bg-gray-100 dark:bg-[#262626] rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={isChildType && topLevelItems.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm dark:shadow-none disabled:opacity-50"
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

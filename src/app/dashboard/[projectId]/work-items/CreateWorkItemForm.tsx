'use client';

import { useState } from 'react';
import { createWorkItem } from '@/app/actions';

export default function CreateWorkItemForm({ projectId, epics, priorityLevels = [] }: { projectId: string, epics: any[], priorityLevels?: any[] }) {
  const [type, setType] = useState('EPIC');

  // Story fields
  const [role, setRole] = useState('');
  const [action, setAction] = useState('');
  const [benefit, setBenefit] = useState('');

  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    await createWorkItem(formData);
    setIsOpen(false);
    setRole('');
    setAction('');
    setBenefit('');
    setType('EPIC');
  };

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
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED]">Thêm Task Mới</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 dark:text-[#383838] hover:text-gray-600 dark:text-[#A3A3A3] transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="projectId" value={projectId} />
                
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
                      className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm bg-gray-50 dark:bg-[#0A0A0A]"
                    >
                      <option value="">-- Chọn Epic --</option>
                      {epics.map(epic => (
                        <option key={epic.id} value={epic.id}>{epic.title}</option>
                      ))}
                    </select>
                    {epics.length === 0 && <p className="text-xs text-red-500 mt-1.5 font-medium">⚠️ Bạn cần tạo ít nhất 1 Epic trước khi tạo các công việc khác.</p>}
                  </div>
                )}

                {type === 'STORY' ? (
                  <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in zoom-in-95 duration-300">
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Cấu trúc User Story
                    </p>
                    <input type="hidden" name="title" value={`Là một ${role}, tôi muốn ${action} để ${benefit}`} />
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Là một (Đối tượng)...</label>
                      <input required value={role} onChange={e => setRole(e.target.value)} type="text" className="w-full rounded border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm bg-white dark:bg-[#171717]" placeholder="VD: Người dùng, Quản trị viên" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Tôi muốn (Hoạt động)...</label>
                      <input required value={action} onChange={e => setAction(e.target.value)} type="text" className="w-full rounded border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm bg-white dark:bg-[#171717]" placeholder="VD: Đăng nhập bằng Google" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Để (Kết quả)...</label>
                      <input required value={benefit} onChange={e => setBenefit(e.target.value)} type="text" className="w-full rounded border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 p-2 text-sm bg-white dark:bg-[#171717]" placeholder="VD: Tiết kiệm thời gian tạo tài khoản" />
                    </div>
                    
                    <div className="mt-4 p-3 bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-[#383838] shadow-sm dark:shadow-none text-sm text-gray-600 dark:text-[#A3A3A3] leading-relaxed">
                      <span className="font-bold text-gray-900 dark:text-[#EDEDED] block mb-1">✨ Xem trước kết quả: </span>
                      {role || action || benefit ? (
                        <span className="italic">Là một <span className="font-bold text-blue-600">{role || '[đối tượng]'}</span>, tôi muốn <span className="font-bold text-blue-600">{action || '[hoạt động]'}</span> để <span className="font-bold text-blue-600">{benefit || '[kết quả]'}</span>.</span>
                      ) : <span className="italic text-gray-400 dark:text-[#383838]">Vui lòng điền thông tin ở trên...</span>}
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Tên công việc</label>
                    <input name="title" required type="text" className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder={type === 'EPIC' ? "VD: Module Quản lý Người dùng" : "VD: Thiết kế Database cho User"} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Độ ưu tiên</label>
                  <select name="priorityId" className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
                    {priorityLevels.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {type === 'EPIC' && (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Hạn chót (Due Date)</label>
                    <input 
                      name="dueDate" 
                      type="date" 
                      className="w-full rounded-lg border-gray-300 dark:border-[#383838] ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" 
                    />
                  </div>
                )}

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
                    disabled={type !== 'EPIC' && epics.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 dark:text-[#737373] disabled:cursor-not-allowed shadow-sm dark:shadow-none"
                  >
                    Lưu công việc
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

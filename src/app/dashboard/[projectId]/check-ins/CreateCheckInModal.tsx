'use client';

import { useState } from 'react';
import { createCheckIn } from "@/app/actions";

export default function CreateCheckInModal({ 
  projectId, 
  suggestedDone = [], 
  suggestedNext = [], 
  suggestedBlockers = [] 
}: { 
  projectId: string, 
  suggestedDone?: any[], 
  suggestedNext?: any[], 
  suggestedBlockers?: any[] 
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Controlled inputs to allow appending suggestions
  const [doneText, setDoneText] = useState('');
  const [nextText, setNextText] = useState('');
  const [blockersText, setBlockersText] = useState('');

  const appendSuggestion = (taskTitle: string, currentText: string, setter: (val: string) => void, prefix = '') => {
    const textToAdd = `${prefix}${taskTitle}`;
    if (!currentText.includes(taskTitle)) {
      setter(currentText ? `${currentText}\n- ${textToAdd}` : `- ${textToAdd}`);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-indigo-500/30 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Tạo Báo Cáo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Báo cáo tuần này (Weekly Check-in)</h3>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
              <form action={createCheckIn} className="space-y-8" id="checkin-form">
                <input type="hidden" name="projectId" value={projectId} />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đã làm gì (DONE)
                    </label>
                  </div>
                  
                  {/* Suggestions block */}
                  <div className="mb-3 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center mr-1">
                      💡 Gợi ý:
                    </span>
                    {suggestedDone.length > 0 ? (
                      suggestedDone.map(task => (
                        <button 
                          key={task.id} type="button"
                          onClick={() => appendSuggestion(task.title, doneText, setDoneText, '[Hoàn thành] ')}
                          className="text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/50 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                        >
                          + {task.title}
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] font-medium italic text-gray-400 dark:text-gray-600">
                        Chưa có task nào hoàn thành gần đây
                      </span>
                    )}
                  </div>

                  <textarea name="doneTasks" required rows={3} 
                    value={doneText} onChange={(e) => setDoneText(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 dark:bg-[#111] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0a0a0a] focus:ring-2 focus:ring-indigo-500/20 text-sm p-3 transition-all placeholder:text-gray-400" 
                    placeholder="Liệt kê các công việc đã hoàn thành..." />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Sẽ làm gì (NEXT)
                    </label>
                  </div>

                  {/* Suggestions block */}
                  <div className="mb-3 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center mr-1">
                      💡 Gợi ý:
                    </span>
                    {suggestedNext.length > 0 ? (
                      suggestedNext.map(task => (
                        <button 
                          key={task.id} type="button"
                          onClick={() => appendSuggestion(task.title, nextText, setNextText, '[Tiếp tục] ')}
                          className="text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                        >
                          + {task.title}
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] font-medium italic text-gray-400 dark:text-gray-600">
                        Chưa có task nào đang thực hiện
                      </span>
                    )}
                  </div>

                  <textarea name="nextTasks" required rows={3} 
                    value={nextText} onChange={(e) => setNextText(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 dark:bg-[#111] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0a0a0a] focus:ring-2 focus:ring-indigo-500/20 text-sm p-3 transition-all placeholder:text-gray-400" 
                    placeholder="Dự định công việc tiếp theo..." />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Khó khăn (BLOCKERS)
                    </label>
                  </div>

                  {/* Suggestions block */}
                  <div className="mb-3 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center mr-1">
                      💡 Gợi ý:
                    </span>
                    {suggestedBlockers.length > 0 ? (
                      suggestedBlockers.map(task => (
                        <button 
                          key={task.id} type="button"
                          onClick={() => appendSuggestion(task.title, blockersText, setBlockersText, '[Bị chặn] ')}
                          className="text-[10px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-300 dark:border-red-800/50 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                        >
                          + {task.title}
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] font-medium italic text-gray-400 dark:text-gray-600">
                        Tuyệt vời, không có task nào bị chặn!
                      </span>
                    )}
                  </div>

                  <textarea name="blockers" rows={2} 
                    value={blockersText} onChange={(e) => setBlockersText(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 dark:bg-[#111] border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-[#0a0a0a] focus:ring-2 focus:ring-red-500/20 text-sm p-3 transition-all placeholder:text-gray-400" 
                    placeholder="Ghi chú nếu có bất kỳ cản trở nào..." />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                    Link minh chứng (Tùy chọn)
                  </label>
                  <input name="evidenceLink" type="url"
                    className="w-full rounded-xl bg-gray-50 dark:bg-[#111] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0a0a0a] focus:ring-2 focus:ring-indigo-500/20 text-sm p-3 transition-all placeholder:text-gray-400" 
                    placeholder="https://github.com/... hoặc link Google Docs" />
                </div>

                {/* Risk Self-Assessment */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Tự đánh giá rủi ro (Risk Self-Assessment)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'GREEN',  label: '🟢 Đang đúng tiến độ',  cls: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
                      { value: 'YELLOW', label: '🟡 Cần chú ý',           cls: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
                      { value: 'RED',    label: '🔴 Khó hoàn thành',      cls: 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
                    ].map(opt => (
                      <label key={opt.value} className="cursor-pointer">
                        <input type="radio" name="riskSelfAssessment" value={opt.value} className="sr-only peer" />
                        <div className={`text-center text-xs font-bold py-2.5 px-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:${opt.cls} transition-all`}>
                          {opt.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/50 shrink-0 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                form="checkin-form"
                onClick={() => {
                  setTimeout(() => setIsOpen(false), 500); 
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-indigo-500/30 flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Gửi Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

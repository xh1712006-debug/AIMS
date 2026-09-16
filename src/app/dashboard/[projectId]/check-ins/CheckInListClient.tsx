'use client';

import { updateCheckInMentorAction } from '@/app/actions';

type CheckIn = {
  id: string;
  createdAt: Date;
  doneTasks: string | null;
  nextTasks: string | null;
  blockers: string | null;
  evidenceLink: string | null;
  riskStatus: string;
  managerAction: string | null;
}

export default function CheckInListClient({
  checkIns,
  userRole,
  projectId
}: {
  checkIns: CheckIn[];
  userRole: string;
  projectId: string;
}) {

  const riskStyle = (r: string) => r === 'RED' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' 
                               : r === 'YELLOW' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' 
                               : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30';

  if (checkIns.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] bg-gray-50/50 dark:bg-[#0a0a0a]/50" style={{ borderColor: 'var(--border-muted)' }}>
        <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Chưa có báo cáo nào</p>
        <p className="text-base font-medium mt-2" style={{ color: 'var(--text-muted)' }}>Tạo check-in đầu tiên của bạn hôm nay!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {checkIns.map((ci) => {
          const date = new Date(ci.createdAt);
          
          return (
            <details key={ci.id} className="group aims-accordion">
              <summary className="flex items-center gap-4 p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer transition-colors list-none relative">
                {/* Status Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ci.riskStatus === 'RED' ? 'bg-red-500' : ci.riskStatus === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                {/* Chevron */}
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>

                {/* Date Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="text-lg font-black leading-none tracking-tighter">{date.getDate()}</span>
                  <span className="text-[9px] font-bold uppercase leading-none mt-1 opacity-90 tracking-widest">Thg {date.getMonth() + 1}</span>
                </div>
                
                {/* Summary info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-black tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                      {date.toLocaleDateString('vi-VN', { weekday: 'long' })}
                    </h3>
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md border shadow-sm shrink-0 ${riskStyle(ci.riskStatus)}`}>
                      {ci.riskStatus}
                    </span>
                  </div>
                  
                  <div className="text-xs font-medium flex items-center gap-2 truncate" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-[8px] shrink-0 font-bold">✓</span>
                    <span className="truncate">{ci.doneTasks ? ci.doneTasks.split('\n')[0] : 'Không có hoạt động mới'}</span>
                  </div>
                </div>

                {/* Time */}
                <div className="shrink-0 text-right pr-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Thời gian</p>
                  <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </summary>
              
              {/* Expanded Content */}
              <div className="p-6 md:p-8 pl-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0a0a0a]/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Work Items */}
                  <div className="space-y-6">
                    {/* Done Tasks */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h4 className="text-base font-black tracking-tight text-emerald-900 dark:text-emerald-100">Những việc Đã làm</h4>
                      </div>
                      <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-emerald-800 dark:text-emerald-200 pl-1">
                        {ci.doneTasks || <span className="italic opacity-50">Không có dữ liệu</span>}
                      </div>
                    </div>

                    {/* Next Tasks */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h4 className="text-base font-black tracking-tight text-blue-900 dark:text-blue-100">Kế hoạch Sắp làm</h4>
                      </div>
                      <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-blue-800 dark:text-blue-200 pl-1">
                        {ci.nextTasks || <span className="italic opacity-50">Không có dữ liệu</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Blockers & Feedback */}
                  <div className="space-y-6">
                    {/* Blockers */}
                    <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-100 dark:border-red-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </div>
                          <h4 className="text-base font-black tracking-tight text-red-900 dark:text-red-100">Khó khăn / Trở ngại</h4>
                        </div>
                      </div>
                      <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-red-800 dark:text-red-200 pl-1">
                        {ci.blockers || <span className="italic opacity-50 text-emerald-600 dark:text-emerald-400">Mọi thứ diễn ra thuận lợi, không có khó khăn.</span>}
                      </div>
                    </div>

                    {/* Evidence Link */}
                    {ci.evidenceLink && (
                      <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-5 border border-gray-200 dark:border-[#333]">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          Minh chứng đính kèm
                        </h4>
                        <a href={ci.evidenceLink} target="_blank" rel="noreferrer"
                           className="inline-flex w-full items-center justify-between p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-indigo-500 transition-colors group">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate pr-3">{ci.evidenceLink}</span>
                          <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </div>
                        </a>
                      </div>
                    )}

                    {/* Manager Feedback */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <h4 className="text-base font-black tracking-tight text-indigo-900 dark:text-indigo-100">Phản hồi của Manager</h4>
                      </div>

                      {userRole === 'PROJECT_MANAGER' || userRole === 'PARTNER' || userRole === 'MEMBER_MANAGER' ? (
                        <form action={async (formData) => {
                          await updateCheckInMentorAction(ci.id, formData.get('managerAction') as string, projectId);
                        }}>
                          <textarea name="managerAction" defaultValue={ci.managerAction || ''} rows={3}
                            className="w-full bg-white dark:bg-[#0a0a0a] border border-indigo-200 dark:border-indigo-900/50 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2 text-sm font-medium transition-colors resize-none placeholder:text-gray-400 shadow-inner" 
                            placeholder="Nhập ghi chú, đánh giá hoặc hướng dẫn giải quyết..." />
                          <div className="flex justify-end mt-3">
                            <button type="submit" className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-colors shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center gap-2">
                              Lưu phản hồi
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-indigo-900 dark:text-indigo-200 pl-1">
                          {ci.managerAction || <span className="italic opacity-50">Chưa có phản hồi từ Manager.</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

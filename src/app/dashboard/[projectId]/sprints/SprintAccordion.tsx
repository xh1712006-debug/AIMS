'use client';

import { useState, useTransition } from 'react';
import { updateWorkItemOrder } from '@/app/actions';
import SprintActionsMenu from "./SprintActionsMenu";
import QuickAddWorkItem from "./QuickAddWorkItem";
import WorkItemRow from "./WorkItemRow";
import SprintReviewSection from "./SprintReviewSection";

export default function SprintAccordion({
  sprint,
  sprintIndex,
  projectId,
  sprintStatus = 'FUTURE',
  isIntern,
  unassignedWorkItems,
  priorityLevels
}: {
  sprint: any;
  sprintIndex: number;
  projectId: string;
  sprintStatus?: 'ACTIVE' | 'FUTURE' | 'PAST';
  isIntern: boolean;
  unassignedWorkItems: any[];
  priorityLevels: any[];
}) {
  const [isOpen, setIsOpen] = useState(sprintStatus === 'ACTIVE');
  const [isPending, startTransition] = useTransition();

  const handleDropToSprint = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/10');
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const { id } = JSON.parse(data);
      const newOrder = sprint.workItems.length;
      startTransition(() => {
        updateWorkItemOrder(id, newOrder, sprint.id, projectId);
      });
    }
  };

  const statusBadge = {
    ACTIVE:  { label: 'Đang chạy',  cls: 'badge-success' },
    FUTURE:  { label: 'Sắp tới',   cls: 'badge-info' },
    PAST:    { label: 'Đã kết thúc', cls: 'badge-muted' },
  }[sprintStatus];

  const totalTasks = sprint.workItems.length;
  const doneTasks = sprint.workItems.filter((i: any) => i.status === 'DONE').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className={`aims-card relative overflow-hidden transition-all duration-300 ${sprintStatus === 'PAST' ? 'opacity-80' : ''}`}>
      {/* Accent Indicator */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${sprintStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-transparent'}`} />

      <div 
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 cursor-pointer transition-colors ${isPending ? 'opacity-50' : ''} hover:bg-gray-50/50 dark:hover:bg-gray-800/30`}
        style={isOpen ? { borderBottom: '1px solid var(--border-color)' } : {}}
        onClick={() => setIsOpen(!isOpen)}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/10'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/10'); }}
        onDrop={handleDropToSprint}
      >
        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto flex-1 min-w-0 pl-2">
          <button 
            className={`mt-0.5 sm:mt-0 p-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-transform ${isOpen ? 'rotate-90' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-3 w-full flex-wrap mb-2">
              <h3 className="text-lg font-black truncate max-w-[200px] sm:max-w-[400px]" style={{ color: 'var(--text-primary)' }}>
                {sprint.name}
              </h3>
              <span className={`badge text-[9px] uppercase shadow-sm ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
              <span className="badge badge-muted text-[9px] uppercase shadow-sm">
                {sprint.workItems.length} công việc
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(sprint.startDate).toLocaleDateString('vi-VN')} — {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
              </span>
              
              <div className="flex items-center gap-3 w-48">
                <div className="progress-bar flex-1 h-1.5 bg-gray-100 dark:bg-gray-800">
                  <div className={`progress-bar-fill ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <span className={`font-black ${progressPercent === 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pr-2" onClick={(e) => e.stopPropagation()}>
          {isIntern && (
            <SprintActionsMenu sprint={sprint} projectId={projectId} />
          )}
        </div>
      </div>
      
      {/* Accordion Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-4 space-y-4 bg-gray-50/30 dark:bg-[#111]/30">
            {/* E-Learning Banner for Sprint 1 */}
            {sprintIndex === 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-white dark:bg-[#171717] shadow-sm" style={{ borderColor: 'var(--border-muted)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <span className="text-lg leading-none block">📚</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">Đào tạo Kiến thức (Onboarding)</h5>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">Yêu cầu hoàn thành khóa học trước khi nhận việc.</p>
                  </div>
                </div>
                <a 
                  href="http://192.168.1.2/auth/login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-widest py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  Truy cập E-Learning
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-2">
            {sprint.workItems.length === 0 ? (
              <div className="py-8 text-center bg-white dark:bg-[#171717] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Sprint chưa có công việc</p>
              </div>
            ) : (
              sprint.workItems.map((item: any) => (
                <WorkItemRow 
                  key={item.id} 
                  item={item} 
                  projectId={projectId} 
                  isIntern={isIntern} 
                  priorityLevels={priorityLevels}
                />
              ))
            )}
            </div>
            
            {isIntern && (
              <div className="mt-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#171717] transition-colors focus-within:border-indigo-300 dark:focus-within:border-indigo-700">
                <QuickAddWorkItem 
                  sprintId={sprint.id} 
                  projectId={projectId} 
                  unassignedWorkItems={unassignedWorkItems} 
                  priorityLevels={priorityLevels}
                />
              </div>
            )}
            
            <SprintReviewSection 
              sprintId={sprint.id}
              projectId={projectId}
              isProjectManager={!isIntern}
              review={sprint.sprintReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

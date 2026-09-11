'use client';

import { useState, useTransition } from 'react';
import { updateWorkItemOrder } from '@/app/actions';
import SprintActionsMenu from "./SprintActionsMenu";
import QuickAddWorkItem from "./QuickAddWorkItem";
import WorkItemRow from "./WorkItemRow";
import SprintReviewSection from "./SprintReviewSection";
import { TRACK_GUIDES } from "@/lib/trackGuides";

export default function SprintAccordion({
  sprint,
  sprintIndex,
  projectId,
  projectTrack,
  isIntern,
  unassignedWorkItems,
  priorityLevels
}: {
  sprint: any;
  sprintIndex: number;
  projectId: string;
  projectTrack: string;
  isIntern: boolean;
  unassignedWorkItems: any[];
  priorityLevels: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDropToSprint = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50 dark:bg-blue-900/30');
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const { id } = JSON.parse(data);
      // Nếu thả vào sprint này, cho order là lớn nhất (nằm cuối)
      const newOrder = sprint.workItems.length;
      startTransition(() => {
        updateWorkItemOrder(id, newOrder, sprint.id, projectId);
      });
    }
  };

  const totalTasks = sprint.workItems.length;
  const doneTasks = sprint.workItems.filter((i: any) => i.status === 'DONE').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // Lấy guideline (Definition of Done) cho Sprint hiện tại dựa trên số thứ tự Sprint (sprintIndex)
  const trackInfo = TRACK_GUIDES[projectTrack];
  let currentGuide = trackInfo?.sprints[0];
  if (trackInfo && sprintIndex <= trackInfo.sprints.length) {
    currentGuide = trackInfo.sprints[sprintIndex - 1];
  }

  return (
    <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200/60 dark:border-[#262626] overflow-hidden transition-all duration-200">
      <div 
        className={`relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/80 dark:bg-[#0A0A0A] transition-colors ${isOpen ? 'border-b border-gray-100 dark:border-[#262626]' : ''} ${isPending ? 'opacity-50' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-50 dark:bg-blue-900/30'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('bg-blue-50 dark:bg-blue-900/30'); }}
        onDrop={handleDropToSprint}
      >
        <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
          <button 
            className={`mt-1 sm:mt-0 p-1 rounded-md text-gray-400 dark:text-[#383838] hover:text-gray-700 dark:text-[#D4D4D4] hover:bg-gray-200 dark:hover:bg-[#262626] transition-transform ${isOpen ? 'rotate-90' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#EDEDED] truncate max-w-[200px] sm:max-w-[300px]">
                {sprint.name}
              </h3>
              <span className="shrink-0 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border border-indigo-100/50 px-2 py-0.5 rounded-full">
                {sprint.workItems.length} công việc
              </span>
              {currentGuide && (
                 <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200 dark:border-[#383838] text-sm min-w-0 flex-1" title={`${currentGuide.name}: ${currentGuide.dod}`}>
                   <span className="shrink-0 text-amber-500">💡</span>
                   <span className="truncate text-gray-500 dark:text-[#737373] text-xs"><strong className="text-gray-700 dark:text-[#D4D4D4] font-semibold">{currentGuide.name}:</strong> {currentGuide.dod}</span>
                 </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 dark:text-[#737373]">
              <span className="flex items-center gap-1.5 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(sprint.startDate).toLocaleDateString('vi-VN')} - {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
              </span>
              
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-[#383838] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="font-bold text-gray-700 dark:text-[#D4D4D4]">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isIntern && (
            <SprintActionsMenu sprint={sprint} projectId={projectId} />
          )}
        </div>
      </div>
      
      {/* Accordion Content */}
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pt-2 space-y-3 bg-gray-50/50 dark:bg-[#0A0A0A]/50">
            {/* E-Learning Banner for Sprint 1 */}
            {sprintIndex === 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/80 dark:bg-blue-900/20 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-900/50 mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-[#171717] p-2 rounded-lg shadow-sm shrink-0">
                    <span className="text-xl leading-none block">📚</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-blue-900 dark:text-blue-300">Đào tạo Kiến thức (Onboarding)</h5>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Thực tập sinh cần hoàn thành khóa học trước khi bắt đầu công việc.</p>
                  </div>
                </div>
                <a 
                  href="http://192.168.1.2/auth/login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  Tới Hệ thống Học tập
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            )}

            {/* Content list with gaps to look like modern cards */}
            <div className="space-y-2">
            {sprint.workItems.length === 0 ? (
              <p className="text-gray-500 dark:text-[#737373] text-sm italic py-2 text-center">Sprint này chưa có công việc nào.</p>
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
              <div className="mt-1 border-t border-gray-100 dark:border-[#262626] pt-1">
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

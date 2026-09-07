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
  projectId,
  projectTrack,
  isIntern,
  unassignedWorkItems,
  priorityLevels
}: {
  sprint: any;
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

  // Lấy guideline (Definition of Done) cho Sprint hiện tại dựa trên số thứ tự Sprint hoặc tên
  // Tạm thời lấy bằng cách tìm kiếm "Sprint 1", "Sprint 2" trong tên. Mặc định là Sprint 1 nếu không thấy.
  const trackInfo = TRACK_GUIDES[projectTrack];
  let currentGuide = trackInfo?.sprints[0];
  if (trackInfo) {
    const match = sprint.name.match(/Sprint\s*(\d+)/i);
    if (match && parseInt(match[1]) <= trackInfo.sprints.length) {
      currentGuide = trackInfo.sprints[parseInt(match[1]) - 1];
    }
  }

  return (
    <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#262626] overflow-hidden transition-all duration-200">
      <div 
        className={`relative flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-gray-50 dark:bg-[#0A0A0A] transition-colors ${isOpen ? 'border-b border-gray-100 dark:border-[#262626] pb-3' : ''} ${isPending ? 'opacity-50' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-50 dark:bg-blue-900/30'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('bg-blue-50 dark:bg-blue-900/30'); }}
        onDrop={handleDropToSprint}
      >
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-500" 
          style={{ width: `${progressPercent}%` }}
        />
        <div className="flex items-center gap-2">
          <button 
            className={`p-0.5 rounded-md text-gray-400 dark:text-[#383838] hover:text-gray-700 dark:text-[#D4D4D4] hover:bg-gray-200 transition-all ${isOpen ? 'rotate-90' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-[#EDEDED] flex items-center gap-2">
              {sprint.name}
              <span className="text-[11px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md">
                {sprint.workItems.length} công việc
              </span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs font-medium text-gray-500 dark:text-[#737373] bg-gray-50 dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#262626] px-2.5 py-0.5 rounded-md">
            {new Date(sprint.startDate).toLocaleDateString('vi-VN')} - {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
          </span>
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
            {/* Definition of Done Banner */}
            {currentGuide && (
              <div className="flex items-start gap-2 mb-3 px-2">
                <span className="text-amber-500 text-xs mt-0.5">💡</span>
                <div className="text-xs">
                  <span className="font-bold text-gray-700 dark:text-[#D4D4D4]">Chuẩn đầu ra ({currentGuide.name}): </span>
                  <span className="text-gray-600 dark:text-[#A3A3A3]">{currentGuide.dod}</span>
                </div>
              </div>
            )}
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
              isMentor={!isIntern}
              review={sprint.sprintReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

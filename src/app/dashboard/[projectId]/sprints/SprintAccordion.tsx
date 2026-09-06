'use client';

import { useState } from 'react';
import SprintActionsMenu from "./SprintActionsMenu";
import QuickAddWorkItem from "./QuickAddWorkItem";
import WorkItemRow from "./WorkItemRow";

export default function SprintAccordion({
  sprint,
  projectId,
  isIntern,
  unassignedWorkItems,
  priorityLevels
}: {
  sprint: any;
  projectId: string;
  isIntern: boolean;
  unassignedWorkItems: any[];
  priorityLevels: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
      <div 
        className={`flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors ${isOpen ? 'border-b border-gray-100 pb-4' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <button 
            className={`p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all ${isOpen ? 'rotate-90' : ''}`}
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
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {sprint.name}
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {sprint.workItems.length} công việc
              </span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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
          <div className="p-6 pt-2 space-y-2 bg-gray-50/50">
            {sprint.workItems.length === 0 ? (
              <p className="text-gray-500 text-sm italic py-2 text-center">Sprint này chưa có công việc nào.</p>
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
              <div className="mt-4">
                <QuickAddWorkItem 
                  sprintId={sprint.id} 
                  projectId={projectId} 
                  unassignedWorkItems={unassignedWorkItems} 
                  priorityLevels={priorityLevels}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

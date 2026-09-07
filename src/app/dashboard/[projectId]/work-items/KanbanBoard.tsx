'use client';

import { useState, useEffect } from 'react';
import WorkItemActionsMenu from "./WorkItemActionsMenu";
import { updateWorkItemStatus } from "@/app/actions";
import { useRouter } from 'next/navigation';

export default function KanbanBoard({ workItems, epics, projectId, priorityLevels, userRole }: any) {
  const router = useRouter();
  const [items, setItems] = useState(workItems);

  // Sync state when props change
  useEffect(() => {
    setItems(workItems);
  }, [workItems]);
  
  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-100 dark:bg-[#334155]' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'REVIEW', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-900/30' },
    { id: 'DONE', title: 'Done', color: 'bg-green-50 dark:bg-green-900/30' },
    { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-50 dark:bg-red-900/30' }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    // Optimistic UI
    setItems((prevItems: any) => prevItems.map((item: any) => 
      item.id === id ? { ...item, status } : item
    ));

    try {
      await updateWorkItemStatus(id, status, projectId);
      router.refresh();
    } catch (err) {
      console.error(err);
      setItems(workItems);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {columns.map(col => (
        <div 
          key={col.id} 
          className={`flex-1 min-w-[280px] rounded-xl p-4 ${col.color} border border-gray-200 dark:border-[#475569] shadow-sm dark:shadow-none flex flex-col`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-gray-700 dark:text-[#CBD5E1]">{col.title}</h3>
             <span className="bg-white dark:bg-[#1E293B] text-gray-600 dark:text-[#94A3B8] text-xs font-bold px-2 py-0.5 rounded-full shadow-sm dark:shadow-none">
               {items.filter((i: any) => i.status === col.id).length}
             </span>
          </div>
          
          <div className="flex flex-col gap-3 flex-1 min-h-[150px]">
            {items.filter((i: any) => i.status === col.id).map((item: any) => {
              const parentEpic = item.parentId ? epics.find((e: any) => e.id === item.parentId) : null;
              
              return (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className={`p-3 bg-white dark:bg-[#1E293B] rounded-lg shadow-sm dark:shadow-none cursor-grab active:cursor-grabbing border hover:border-blue-400 transition-colors ${item.requiresFix ? 'border-red-300 dark:border-red-700 bg-red-50/50' : 'border-gray-200 dark:border-[#475569]'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-[#F1F5F9] leading-tight">{item.title}</p>
                  {userRole === 'INTERN' && (
                     <div className="ml-2 shrink-0">
                       <WorkItemActionsMenu item={item} epics={epics} projectId={projectId} priorityLevels={priorityLevels} />
                     </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#334155] text-gray-600 dark:text-[#94A3B8] text-[10px] rounded font-medium">{item.type}</span>
                  {parentEpic && (
                    <span 
                      className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] rounded font-bold truncate max-w-[120px]"
                      title={parentEpic.title}
                    >
                      {parentEpic.title}
                    </span>
                  )}
                  {item.priority && (
                    <span 
                      className="px-1.5 py-0.5 text-[10px] rounded font-bold border"
                      style={{ 
                        backgroundColor: item.priority.color ? `${item.priority.color}20` : '#f3f4f6', 
                        color: item.priority.color || '#374151',
                        borderColor: item.priority.color ? `${item.priority.color}40` : '#e5e7eb'
                      }}
                    >
                      {item.priority.name}
                    </span>
                  )}
                  {item.requiresFix && (
                    <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-[10px] rounded font-bold">CẦN SỬA</span>
                  )}
                </div>
                
                {/* Time tracking display */}
                {(item.startedAt || item.completedAt) && (
                   <div className="mt-2 text-[10px] text-gray-500 dark:text-[#64748B] border-t pt-1 flex flex-col gap-0.5">
                     {item.startedAt && <div><span className="font-medium">Bắt đầu:</span> {new Date(item.startedAt).toLocaleDateString('vi-VN')}</div>}
                     {item.completedAt && <div><span className="font-medium">Hoàn thành:</span> {new Date(item.completedAt).toLocaleDateString('vi-VN')}</div>}
                   </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

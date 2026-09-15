'use client';

import { useState, useEffect } from 'react';
import WorkItemActionsMenu from "./WorkItemActionsMenu";
import { updateWorkItemStatus } from "@/app/actions";
import { useRouter } from 'next/navigation';

export default function KanbanBoard({ workItems, epics, projectId, priorityLevels, userRole }: any) {
  const router = useRouter();
  const [items, setItems] = useState(workItems);

  useEffect(() => {
    setItems(workItems);
  }, [workItems]);
  
  const columns = [
    { id: 'TODO', title: 'To Do', dot: 'bg-gray-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', dot: 'bg-blue-500' },
    { id: 'REVIEW', title: 'Review', dot: 'bg-amber-500' },
    { id: 'DONE', title: 'Done', dot: 'bg-emerald-500' },
    { id: 'BLOCKED', title: 'Blocked', dot: 'bg-red-500' }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (userRole !== 'INTERN') {
      alert("Chỉ Thực tập sinh (Assignee) mới có quyền kéo thả để cập nhật tiến độ công việc.");
      return;
    }
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

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
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] snap-x">
      {columns.map(col => {
        const columnItems = items.filter((i: any) => i.status === col.id);
        return (
          <div 
            key={col.id} 
            className="flex-1 min-w-[280px] md:min-w-[320px] rounded-2xl bg-gray-50/80 dark:bg-[#111] p-3 flex flex-col snap-start"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex justify-between items-center mb-4 px-2 pt-1">
               <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                 <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                 {col.title} <span className="text-gray-400 dark:text-gray-600 font-medium">({columnItems.length})</span>
               </h3>
            </div>
            
            <div className="flex flex-col gap-3 flex-1">
              {columnItems.map((item: any) => {
                const parentEpic = item.parentId ? epics.find((e: any) => e.id === item.parentId) : null;
                
                const isDraggable = userRole === 'INTERN';
                
                return (
                <div 
                  key={item.id}
                  draggable={isDraggable}
                  onDragStart={(e) => isDraggable && handleDragStart(e, item.id)}
                  className={`aims-card p-4 transition-all group ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5' : ''} ${item.requiresFix ? 'ring-1 ring-red-500 bg-red-50/10' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                    {userRole === 'INTERN' && (
                       <div className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                         <WorkItemActionsMenu item={item} epics={epics} projectId={projectId} priorityLevels={priorityLevels} />
                       </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="badge badge-muted text-[9px] uppercase">{item.type}</span>
                    {parentEpic && (
                      <span className="badge badge-accent text-[9px] uppercase max-w-[120px] truncate" title={parentEpic.title}>
                        {parentEpic.title}
                      </span>
                    )}
                    {item.priority && (
                      <span className="badge text-[9px] uppercase" style={{ backgroundColor: item.priority.color ? `${item.priority.color}15` : 'var(--bg-muted)', color: item.priority.color || 'var(--text-secondary)' }}>
                        {item.priority.name}
                      </span>
                    )}
                    {item.requiresFix && (
                      <span className="badge badge-danger text-[9px] uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Cần sửa
                      </span>
                    )}
                  </div>
                  
                </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

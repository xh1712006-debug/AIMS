'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import WorkItemActionsMenu from "./WorkItemActionsMenu";
import TaskDetailModal from "./TaskDetailModal";
import { updateWorkItemStatus } from "@/app/actions";

export default function KanbanBoard({ workItems, epics, projectId, priorityLevels, userRole }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(workItems);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    setItems(workItems);
  }, [workItems]);

  // Auto-open modal if ?taskId= is in URL
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      const found = workItems.find((wi: any) => wi.id === taskId);
      if (found) setSelectedTask(found);
    }
  }, [searchParams, workItems]);

  const handleCloseModal = () => {
    setSelectedTask(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('taskId');
    router.replace(url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''), { scroll: false });
  };

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
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {columns.map(col => {
          const columnItems = items.filter((i: any) => i.status === col.id);
          return (
            <div
              key={col.id}
              className="flex-1 min-w-[280px] md:min-w-[320px] h-[65vh] min-h-[400px] rounded-2xl bg-gray-50/80 dark:bg-[#111] p-3 flex flex-col snap-start"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex justify-between items-center mb-4 px-2 pt-1 shrink-0">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  {col.title} <span className="text-gray-400 dark:text-gray-600 font-medium">({columnItems.length})</span>
                </h3>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2">
                {columnItems.map((item: any) => {
                  const parentEpic = item.parentId ? epics.find((e: any) => e.id === item.parentId) : null;
                  const isDraggable = userRole === 'INTERN';
                  const isSelected = selectedTask?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      draggable={isDraggable}
                      onDragStart={(e) => isDraggable && handleDragStart(e, item.id)}
                      onClick={() => setSelectedTask(item)}
                      className={`shrink-0 bg-white dark:bg-[#1A1A1A] rounded-xl border shadow-sm p-3 transition-all group relative overflow-hidden flex flex-col cursor-pointer hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700/50 ${isDraggable ? 'active:cursor-grabbing' : ''} ${item.requiresFix ? 'border-red-300 dark:border-red-900/50 bg-red-50/10' : 'border-gray-100 dark:border-gray-800'} ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : ''}`}
                    >
                      {/* Priority color accent */}
                      {item.priority?.color && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: item.priority.color }} />
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          {parentEpic && (
                            <div className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 truncate flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                              {parentEpic.title}
                            </div>
                          )}
                          <p className="font-bold text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words text-gray-900 dark:text-[#EDEDED]">
                            {item.title}
                          </p>
                        </div>

                        {userRole === 'INTERN' ? (
                          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1" onClick={e => e.stopPropagation()}>
                            <WorkItemActionsMenu item={item} epics={epics} projectId={projectId} priorityLevels={priorityLevels} />
                          </div>
                        ) : (
                          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            <span className="text-indigo-400 p-1 block" title="Xem chi tiết">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2 border-t border-gray-50 dark:border-gray-800/50">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400 bg-gray-50 dark:bg-[#111]">
                          {item.type}
                        </span>
                        {item.priority && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border flex items-center gap-1" style={{ borderColor: item.priority.color ? `${item.priority.color}30` : 'var(--border-muted)', color: item.priority.color || 'var(--text-secondary)', backgroundColor: item.priority.color ? `${item.priority.color}10` : 'transparent' }}>
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: item.priority.color }} />
                            {item.priority.name}
                          </span>
                        )}
                        {item.requiresFix && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 bg-red-50 dark:bg-red-900/10 flex items-center gap-1">
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          userRole={userRole}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

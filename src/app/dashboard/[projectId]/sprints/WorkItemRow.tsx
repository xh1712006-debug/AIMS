'use client';

import { useState, useTransition } from 'react';
import EditWorkItemModal from './EditWorkItemModal';
import { removeWorkItemFromSprint, updateWorkItemOrder } from '@/app/actions';

export default function WorkItemRow({ 
  item, 
  projectId,
  isIntern,
  priorityLevels
}: { 
  item: any; 
  projectId: string;
  isIntern: boolean;
  priorityLevels?: any[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, sprintId: item.sprintId, order: item.order }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50 dark:bg-blue-900/30');
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const draggedItem = JSON.parse(data);
      if (draggedItem.id !== item.id) {
        startTransition(() => {
          updateWorkItemOrder(draggedItem.id, item.order, item.sprintId, projectId);
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn đưa công việc này ra khỏi Sprint hiện tại (trở lại Backlog)?')) return;
    setIsDeleting(true);
    const formData = new FormData();
    formData.append('id', item.id);
    formData.append('projectId', projectId);
    try {
      await removeWorkItemFromSprint(formData);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi xóa.');
      setIsDeleting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUG': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'FEATURE': return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'STORY': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'TASK': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#D4D4D4] border-gray-200 dark:border-[#383838]';
    }
  };

  return (
    <>
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400', 'bg-blue-50 dark:bg-blue-900/30'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50 dark:bg-blue-900/30'); }}
        onDrop={handleDrop}
        className={`group flex items-center justify-between p-3 bg-white dark:bg-[#171717] hover:bg-gray-50/80 dark:hover:bg-[#262626]/50 transition-all rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-[#383838] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm dark:shadow-none cursor-grab active:cursor-grabbing ${isDeleting || isPending ? 'opacity-50 pointer-events-none' : 'border-gray-100 dark:border-[#262626]'}`}
      >
        <div className="flex-1 min-w-0 pr-4 flex items-center gap-3">
          <div className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 dark:text-[#737373]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-[#EDEDED] text-sm truncate mr-1">{item.title}</p>
          </div>
        </div>
        
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-3">
          {/* Priority Column */}
          <div className="w-[90px] flex justify-end">
            {item.priority ? (
              <span 
                className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-bold border opacity-90 truncate max-w-full"
                style={{ 
                  backgroundColor: item.priority.color ? `${item.priority.color}15` : '#f3f4f6', 
                  color: item.priority.color || '#374151',
                  borderColor: item.priority.color ? `${item.priority.color}30` : '#e5e7eb'
                }}
                title={item.priority.name}
              >
                {item.priority.name}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-bold border bg-gray-50 dark:bg-[#262626] text-gray-400 dark:text-[#737373] border-gray-100 dark:border-[#383838] opacity-90 truncate max-w-full" title="Chưa phân loại">
                Chưa PL
              </span>
            )}
          </div>
          
          {/* Type Column */}
          <div className="w-[70px] flex justify-end">
            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-bold border truncate max-w-full ${getTypeColor(item.type)}`} title={item.type}>
              {item.type}
            </span>
          </div>
        </div>

        {/* Status Column */}
        <div className="w-[100px] flex justify-end">
          <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-md whitespace-nowrap border w-full text-center ${
            item.status === 'DONE' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-800' :
            item.status === 'IN_PROGRESS' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800' :
            item.status === 'REVIEW' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800' :
            item.status === 'BLOCKED' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800' :
            'bg-gray-50 dark:bg-[#262626] text-gray-500 dark:text-[#A3A3A3] border-gray-200/50 dark:border-[#383838]'
          }`}>
            {item.status.replace('_', ' ')}
          </span>
        </div>

          {isIntern && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 text-gray-400 dark:text-[#383838] hover:text-blue-600 hover:bg-blue-50 dark:bg-blue-900/30 rounded-md transition-colors"
                title="Sửa công việc"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button 
                onClick={handleDelete}
                className="p-1.5 text-gray-400 dark:text-[#383838] hover:text-red-600 hover:bg-red-50 dark:bg-red-900/30 rounded-md transition-colors"
                title="Xóa công việc"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditOpen && (
        <EditWorkItemModal 
          item={item} 
          projectId={projectId} 
          priorityLevels={priorityLevels}
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </>
  );
}

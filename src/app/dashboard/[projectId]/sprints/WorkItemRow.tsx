'use client';

import { useState } from 'react';
import EditWorkItemModal from './EditWorkItemModal';
import { removeWorkItemFromSprint } from '@/app/actions';

export default function WorkItemRow({ 
  item, 
  projectId,
  isIntern
}: { 
  item: any; 
  projectId: string;
  isIntern: boolean;
  priorityLevels?: any[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      case 'BUG': return 'bg-red-100 text-red-700 border-red-200';
      case 'FEATURE': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'STORY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TASK': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <div className={`group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-all rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex-1 min-w-0 pr-4">
          <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`px-2 py-0.5 text-[11px] rounded-md font-bold border ${getTypeColor(item.type)}`}>
              {item.type}
            </span>
            {item.priority ? (
              <span 
                className="px-2 py-0.5 text-[11px] rounded-md font-bold border opacity-90"
                style={{ 
                  backgroundColor: item.priority.color ? `${item.priority.color}20` : '#f3f4f6', 
                  color: item.priority.color || '#374151',
                  borderColor: item.priority.color ? `${item.priority.color}40` : '#e5e7eb'
                }}
              >
                {item.priority.name}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] rounded-md font-bold border bg-gray-100 text-gray-500 border-gray-200 opacity-90">
                Chưa phân loại
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap border ${
            item.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
            item.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            item.status === 'REVIEW' ? 'bg-purple-50 text-purple-700 border-purple-200' :
            item.status === 'BLOCKED' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {item.status.replace('_', ' ')}
          </span>

          {isIntern && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Sửa công việc"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button 
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

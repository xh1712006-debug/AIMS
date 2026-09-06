'use client';

import { useState, useRef, useEffect } from 'react';
import { createWorkItem, assignWorkItemToSprint } from '@/app/actions';

export default function QuickAddWorkItem({ 
  sprintId, 
  projectId,
  unassignedWorkItems = [],
  priorityLevels = []
}: { 
  sprintId: string; 
  projectId: string;
  unassignedWorkItems?: any[];
  priorityLevels?: any[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter items that aren't epics, aren't assigned to a sprint, and match the input
  const filteredSuggestions = unassignedWorkItems.filter(item => 
    item.type !== 'EPIC' && 
    !item.sprintId &&
    item.title.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateNew = async (formData: FormData) => {
    if (!inputValue.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createWorkItem(formData);
      setInputValue('');
      formRef.current?.reset();
      setShowSuggestions(false);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tạo công việc.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExisting = async (workItemId: string) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id', workItemId);
      formData.append('sprintId', sprintId);
      formData.append('projectId', projectId);
      
      await assignWorkItemToSprint(formData);
      setInputValue('');
      setShowSuggestions(false);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi thêm công việc vào Sprint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mt-3 group" ref={wrapperRef}>
      <form 
        ref={formRef} 
        action={handleCreateNew} 
        className="flex items-center gap-2 p-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:border-blue-400 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm transition-all"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="sprintId" value={sprintId} />
        
        <div className="flex-1 flex items-center relative">
          <svg className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <input 
            type="text" 
            name="title" 
            required 
            autoComplete="off"
            placeholder="Thêm công việc mới vào Sprint (nhấn Enter để lưu)..."
            className="w-full bg-transparent border-none text-sm focus:ring-0 text-gray-900 placeholder:text-gray-400 p-1"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex items-center gap-2 opacity-70 group-focus-within:opacity-100 transition-opacity">
          <select name="type" className="text-xs font-medium bg-white border border-gray-200 rounded p-1 text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-1 focus:ring-blue-500" disabled={isSubmitting}>
            <option value="TASK">Task</option>
            <option value="STORY">Story</option>
            <option value="FEATURE">Feature</option>
            <option value="BUG">Bug</option>
          </select>
          
          <select name="priorityId" className="text-xs font-medium bg-white border border-gray-200 rounded p-1 text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-1 focus:ring-blue-500" disabled={isSubmitting}>
            {priorityLevels?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button type="submit" disabled={isSubmitting || !inputValue.trim()} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">Công việc trong Backlog</div>
            {filteredSuggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectExisting(item.id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between group transition-colors"
              >
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-0.5 text-[10px] rounded font-bold border ${
                    item.type === 'BUG' ? 'bg-red-50 text-red-700 border-red-200' :
                    item.type === 'FEATURE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    item.type === 'STORY' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-2 py-1 rounded">
                    Thêm +
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

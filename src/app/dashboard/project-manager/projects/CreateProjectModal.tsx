'use client';

import { useState } from 'react';
import CreateProjectForm from '@/app/dashboard/CreateProjectForm';

export default function CreateProjectModal({ interns, memberManagers, partners }: { interns: any[], memberManagers?: any[], partners?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm dark:shadow-none transition-colors text-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Tạo Dự án Mới
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-4 border-b border-gray-100 dark:border-[#262626] flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]/50">
              <h3 className="font-bold text-gray-900 dark:text-[#EDEDED] text-lg">Tạo Dự án Mới</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 dark:text-[#383838] hover:text-gray-600 dark:text-[#A3A3A3] p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
               <div onSubmit={() => setTimeout(() => setIsOpen(false), 300)}>
                 <CreateProjectForm interns={interns} memberManagers={memberManagers} partners={partners} />
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

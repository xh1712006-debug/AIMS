"use client";

import { useState } from "react";
import { deleteProject } from "@/app/actions";

type ProjectType = {
  id: string;
  title: string;
  status: string;
  track: string;
  startDate: Date;
  endDate: Date;
  intern: { id: string; name: string };
};

export default function AdminProjectsClient({ projects }: { projects: ProjectType[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteProj, setDeleteProj] = useState<ProjectType | null>(null);

  const displayedProjects = projects.filter(p => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.intern.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-[#171717] rounded-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] border border-slate-100 dark:border-[#262626] overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-100 dark:border-[#262626] flex justify-end">
          <input 
            type="text" 
            placeholder="Tìm kiếm dự án, tên sinh viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-[#383838] bg-transparent px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none w-full sm:w-64 shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-[#262626]">
            <thead className="bg-slate-50/50 dark:bg-[#0A0A0A]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Dự án</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Thực tập sinh</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-[#737373] uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#171717] divide-y divide-slate-100 dark:divide-[#262626]">
              {displayedProjects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0A0A0A]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-[#EDEDED]">{proj.title}</div>
                    <div className="text-sm text-slate-500 dark:text-[#737373] mt-1">
                      {new Date(proj.startDate).toLocaleDateString('vi-VN')} - {new Date(proj.endDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{proj.track.replace('_', ' ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800 dark:text-gray-300">{proj.intern.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ring-1 ring-inset ${
                      proj.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                      proj.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                      'bg-slate-50 text-slate-700 ring-slate-600/20'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end items-center gap-2">
                    <button className="px-3 py-1.5 text-slate-600 dark:text-slate-300 font-medium text-sm rounded-md hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors">
                      Chỉnh sửa
                    </button>
                    <button onClick={() => setDeleteProj(proj)} className="px-3 py-1.5 text-red-500 font-medium text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {displayedProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-[#737373]">
                    Không có dự án nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Project Confirm Modal */}
      {deleteProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-[#262626]">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Xóa Dự Án</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa dự án <strong>{deleteProj.title}</strong> của <strong>{deleteProj.intern.name}</strong> không? Hành động này sẽ xóa vĩnh viễn toàn bộ công việc, sprint, check-in liên quan đến dự án này!
            </p>

            <form action={async (formData) => {
              await deleteProject(formData);
              setDeleteProj(null);
            }} className="flex gap-3">
              <input type="hidden" name="id" value={deleteProj.id} />
              <button type="button" onClick={() => setDeleteProj(null)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#262626] text-gray-800 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                Hủy
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors shadow-sm">
                Xóa Vĩnh Viễn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

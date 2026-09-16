"use client";

import { useState } from "react";
import { updateWorkItemStatus, addWorkItemComment } from "@/app/actions";
import Link from "next/link";

const Icons = {
  alert: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  message: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  check: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  close: (props: any) => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
};

export default function BlockerBoard({ blockedItems, currentUserId }: { blockedItems: any[], currentUserId: string }) {
  const [selectedBlocker, setSelectedBlocker] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async (id: string, projectId: string) => {
    setIsSubmitting(true);
    try {
      await updateWorkItemStatus(id, "IN_PROGRESS", projectId);
      setSelectedBlocker(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (id: string) => {
    if (!commentText || commentText.trim() === "") return;
    setIsSubmitting(true);
    try {
      await addWorkItemComment(id, commentText);
      setCommentText("");
      // Optimistic refresh not strictly needed if we just close or wait for server revalidate
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* COMPACT LIST VIEW */}
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
        {blockedItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[#EDEDED]">Tuyệt vời! Không có Blocker nào.</h3>
            <p className="text-gray-500 mt-1">Tất cả các dự án bạn phụ trách đều đang hoạt động trơn tru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 dark:text-[#737373] uppercase text-[10px] tracking-wider font-extrabold border-b border-gray-100 dark:border-[#262626]">
                <tr>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Tên Công việc</th>
                  <th className="px-6 py-4">Dự án & Người phụ trách</th>
                  <th className="px-6 py-4 text-center">Bình luận</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                {blockedItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-red-50/30 dark:hover:bg-red-900/10 cursor-pointer transition-colors"
                    onClick={() => setSelectedBlocker(item)}
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-100 dark:border-red-900/30">
                        <Icons.alert className="w-3.5 h-3.5" />
                        Blocked
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-[#EDEDED]">{item.title}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">{item.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {item.project.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[8px] font-bold">
                          {item.project.intern.name.charAt(0)}
                        </div>
                        {item.project.intern.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Icons.message className="w-4 h-4" />
                        <span className="font-bold">{item.comments?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBlocker(item); }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Xử lý
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SIDE PANEL / DRAWER */}
      {selectedBlocker && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setSelectedBlocker(null)}></div>
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#171717] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between bg-gray-50/50 dark:bg-[#0A0A0A]/50">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-100 dark:border-red-900/30">
                  <Icons.alert className="w-3.5 h-3.5" />
                  Blocked
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400">{selectedBlocker.type}</span>
              </div>
              <button 
                onClick={() => setSelectedBlocker(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors"
              >
                <Icons.close className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#EDEDED] mb-2">{selectedBlocker.title}</h2>
                <div className="text-sm text-gray-500 flex flex-col gap-1">
                  <p><strong>Dự án:</strong> {selectedBlocker.project.title}</p>
                  <p><strong>Phụ trách:</strong> {selectedBlocker.project.intern.name}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mô tả chi tiết</h3>
                <div className="bg-gray-50 dark:bg-[#0A0A0A] p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedBlocker.description || "Không có mô tả."}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thảo luận ({selectedBlocker.comments?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedBlocker.comments?.map((comment: any) => (
                    <div key={comment.id} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-3.5 rounded-xl text-sm">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-xs text-blue-900 dark:text-blue-300">{comment.author.name}</span>
                        <span className="text-[10px] font-semibold text-blue-400">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 text-xs leading-relaxed">{comment.text}</p>
                    </div>
                  ))}
                  {(!selectedBlocker.comments || selectedBlocker.comments.length === 0) && (
                    <p className="text-xs text-gray-400 italic">Chưa có bình luận nào.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer (Actions) */}
            <div className="p-6 border-t border-gray-100 dark:border-[#262626] bg-white dark:bg-[#171717] space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Nhập hướng dẫn / giải pháp..." 
                  className="flex-1 text-sm bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#383838] rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                  disabled={isSubmitting}
                />
                <button 
                  onClick={() => handleAddComment(selectedBlocker.id)}
                  disabled={isSubmitting || !commentText}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[80px]"
                >
                  {isSubmitting ? '...' : 'Gửi'}
                </button>
              </div>

              <button 
                onClick={() => handleResolve(selectedBlocker.id, selectedBlocker.projectId)}
                disabled={isSubmitting}
                className="w-full py-3 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Icons.check className="w-5 h-5" />
                Đánh dấu đã giải quyết (Unblock)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateWorkItemStatus, addWorkItemComment } from "@/app/actions";
import Link from "next/link";

export default function BlockerBoard({ blockedItems, currentUserId }: { blockedItems: any[], currentUserId: string }) {
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async (id: string, projectId: string) => {
    setIsSubmitting(true);
    try {
      await updateWorkItemStatus(id, "IN_PROGRESS", projectId);
      // Let the page re-fetch
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (id: string) => {
    if (!commentText[id] || commentText[id].trim() === "") return;
    setIsSubmitting(true);
    try {
      await addWorkItemComment(id, commentText[id]);
      setCommentText({ ...commentText, [id]: "" });
      // Let the page re-fetch
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blockedItems.map((item) => (
        <div key={item.id} className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                Blocked
              </span>
              <h4 className="font-bold text-gray-900 dark:text-[#EDEDED]">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1">Dự án: <Link href={`/dashboard/${item.projectId}`} className="text-blue-600 hover:underline">{item.project.title}</Link></p>
              <p className="text-xs text-gray-500">Phụ trách: {item.project.intern.name}</p>
            </div>
          </div>
          
          <div className="p-4 flex-1">
            <p className="text-sm text-gray-600 dark:text-[#A3A3A3] mb-4 line-clamp-3">
              {item.description || "Không có mô tả chi tiết."}
            </p>

            <div className="space-y-3 mb-4">
              <h5 className="text-xs font-bold text-gray-500 uppercase">Thảo luận ({item.comments?.length || 0})</h5>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {item.comments?.map((comment: any) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-[#0A0A0A] p-3 rounded-xl text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-xs text-gray-900 dark:text-[#EDEDED]">{comment.author.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-gray-600 dark:text-[#A3A3A3] text-xs">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={commentText[item.id] || ""}
                onChange={(e) => setCommentText({ ...commentText, [item.id]: e.target.value })}
                placeholder="Nhập hỗ trợ / bình luận..." 
                className="flex-1 text-sm bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#383838] rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              />
              <button 
                onClick={() => handleAddComment(item.id)}
                disabled={isSubmitting || !commentText[item.id]}
                className="px-3 py-2 bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#D4D4D4] rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#0A0A0A]/50">
            <button 
              onClick={() => handleResolve(item.id, item.projectId)}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40 rounded-xl text-sm font-bold transition-colors"
            >
              Đánh dấu đã giải quyết (Unblock)
            </button>
          </div>
        </div>
      ))}

      {blockedItems.length === 0 && (
        <div className="col-span-full py-16 text-center bg-white dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-[#262626]">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#EDEDED]">Tuyệt vời! Không có Blocker nào.</h3>
          <p className="text-gray-500 mt-1">Tất cả các dự án bạn phụ trách đều đang hoạt động bình thường.</p>
        </div>
      )}
    </div>
  );
}

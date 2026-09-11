"use client";

import { useState, useTransition } from "react";
import { addWorkItemComment } from "@/app/actions";

type Comment = {
  id: string;
  text: string;
  createdAt: Date;
  author: { name: string };
};

export default function WorkItemComments({ workItemId, comments }: { workItemId: string; comments: Comment[] }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      await addWorkItemComment(workItemId, text);
      setText("");
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#262626]">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        Bình luận ({comments.length})
      </h4>

      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Chưa có bình luận nào.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-gray-50 dark:bg-[#0A0A0A] rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-[#EDEDED]">{c.author.name}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-[#A3A3A3] leading-relaxed">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thêm bình luận..."
          disabled={isPending}
          className="flex-1 text-sm bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#383838] rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "..." : "Gửi"}
        </button>
      </form>
    </div>
  );
}

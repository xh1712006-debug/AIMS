'use client';

import { useState } from 'react';
import { saveSprintReview } from '@/app/actions';

export default function SprintReviewSection({
  sprintId,
  projectId,
  isProjectManager,
  review
}: {
  sprintId: string;
  projectId: string;
  isProjectManager: boolean;
  review?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isProjectManager && !review) {
    return (
      <div className="mt-3 border-t border-gray-100 dark:border-[#262626] pt-3 flex justify-center">
        <span className="text-xs font-medium text-gray-400 dark:text-[#383838] bg-gray-50 dark:bg-[#0A0A0A] px-3 py-1 rounded-full italic flex items-center gap-1.5 border border-gray-100 dark:border-[#262626]">
          <span className="animate-pulse">⏳</span> Đang chờ ProjectManager nghiệm thu Sprint này...
        </span>
      </div>
    );
  }

  if (isProjectManager) {
    return (
      <div className="mt-4 border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#171717] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div 
          className="bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2.5 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-sm">
            <span>🎯</span> Báo cáo Nghiệm thu (Sprint Review)
            {!review && <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Chưa đánh giá</span>}
          </h4>
          <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-white dark:bg-[#171717] px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1">
            {isOpen ? 'Thu gọn' : (review ? 'Sửa đánh giá' : 'Viết đánh giá')}
            <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
        
        {isOpen && (
          <form action={saveSprintReview} className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <input type="hidden" name="sprintId" value={sprintId} />
            <input type="hidden" name="projectId" value={projectId} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Kết quả đạt được <span className="text-red-500">*</span></label>
                <textarea name="goalResult" required defaultValue={review?.goalResult || ''} rows={2} className="w-full rounded-lg border-gray-200 dark:border-[#383838] ring-1 ring-inset ring-transparent focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-2.5 text-sm bg-gray-50/50 dark:bg-[#0A0A0A] hover:bg-white dark:hover:bg-[#171717] transition-colors" placeholder="Mục tiêu Sprint có hoàn thành không?"></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Sản phẩm bàn giao</label>
                <textarea name="increment" defaultValue={review?.increment || ''} rows={2} className="w-full rounded-lg border-gray-200 dark:border-[#383838] ring-1 ring-inset ring-transparent focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-2.5 text-sm bg-gray-50/50 dark:bg-[#0A0A0A] hover:bg-white dark:hover:bg-[#171717] transition-colors" placeholder="Link demo, tài liệu, mã nguồn..."></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-green-50/50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                <label className="block text-xs font-bold text-green-800 dark:text-green-400 mb-1.5 flex items-center gap-1.5"><span className="text-[10px] bg-green-200 dark:bg-green-800 rounded-full w-4 h-4 flex items-center justify-center">✅</span> KEEP</label>
                <textarea name="keep" defaultValue={review?.keep || ''} rows={2} className="w-full rounded-md border-green-200/50 dark:border-green-800/50 focus:ring-1 focus:ring-green-500 p-2 text-xs bg-white dark:bg-[#171717] shadow-sm" placeholder="Điểm tốt cần duy trì..."></textarea>
              </div>
              <div className="bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                <label className="block text-xs font-bold text-red-800 dark:text-red-400 mb-1.5 flex items-center gap-1.5"><span className="text-[10px] bg-red-200 dark:bg-red-800 rounded-full w-4 h-4 flex items-center justify-center">❌</span> PROBLEM</label>
                <textarea name="problem" defaultValue={review?.problem || ''} rows={2} className="w-full rounded-md border-red-200/50 dark:border-red-800/50 focus:ring-1 focus:ring-red-500 p-2 text-xs bg-white dark:bg-[#171717] shadow-sm" placeholder="Khó khăn, sai sót..."></textarea>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <label className="block text-xs font-bold text-blue-800 dark:text-blue-400 mb-1.5 flex items-center gap-1.5"><span className="text-[10px] bg-blue-200 dark:bg-blue-800 rounded-full w-4 h-4 flex items-center justify-center">💡</span> TRY</label>
                <textarea name="tryItem" defaultValue={review?.tryItem || ''} rows={2} className="w-full rounded-md border-blue-200/50 dark:border-blue-800/50 focus:ring-1 focus:ring-blue-500 p-2 text-xs bg-white dark:bg-[#171717] shadow-sm" placeholder="Kế hoạch khắc phục..."></textarea>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#D4D4D4] mb-1">Đánh giá chung của Quản lý</label>
              <textarea name="managerFeedback" defaultValue={review?.managerFeedback || ''} rows={2} className="w-full rounded-lg border-gray-200 dark:border-[#383838] ring-1 ring-inset ring-transparent focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-2.5 text-sm bg-gray-50/50 dark:bg-[#0A0A0A] hover:bg-white dark:hover:bg-[#171717] transition-colors" placeholder="Nhận xét tổng quan..."></textarea>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-[#262626]">
              <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-500 transition-colors shadow-sm text-sm">
                {review ? 'Cập nhật Đánh giá' : 'Lưu Đánh giá Sprint'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#171717] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div 
        className="bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2.5 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-sm">
          <span>🎯</span> Nhật ký Nghiệm thu Sprint (ProjectManager Review)
        </h4>
        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-white dark:bg-[#171717] px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1">
          {isOpen ? 'Đóng' : 'Xem chi tiết'}
          <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider mb-1">Kết quả đạt được</h5>
              <p className="text-sm text-gray-900 dark:text-[#EDEDED] bg-gray-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-gray-100 dark:border-[#262626] whitespace-pre-wrap">{review.goalResult}</p>
            </div>
            {review.increment && (
              <div>
                <h5 className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider mb-1">Sản phẩm bàn giao</h5>
                <p className="text-sm text-gray-900 dark:text-[#EDEDED] bg-gray-50 dark:bg-[#0A0A0A] p-2.5 rounded-lg border border-gray-100 dark:border-[#262626] whitespace-pre-wrap">{review.increment}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {review.keep && (
              <div className="bg-green-50/50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                <h5 className="text-[10px] font-bold text-green-800 dark:text-green-400 mb-1.5 flex items-center gap-1.5"><span className="bg-green-200 dark:bg-green-800 rounded-full w-4 h-4 flex items-center justify-center">✅</span> KEEP</h5>
                <p className="text-xs text-green-900 dark:text-green-300 whitespace-pre-wrap">{review.keep}</p>
              </div>
            )}
            {review.problem && (
              <div className="bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                <h5 className="text-[10px] font-bold text-red-800 dark:text-red-400 mb-1.5 flex items-center gap-1.5"><span className="bg-red-200 dark:bg-red-800 rounded-full w-4 h-4 flex items-center justify-center">❌</span> PROBLEM</h5>
                <p className="text-xs text-red-900 dark:text-red-300 whitespace-pre-wrap">{review.problem}</p>
              </div>
            )}
            {review.tryItem && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <h5 className="text-[10px] font-bold text-blue-800 dark:text-blue-400 mb-1.5 flex items-center gap-1.5"><span className="bg-blue-200 dark:bg-blue-800 rounded-full w-4 h-4 flex items-center justify-center">💡</span> TRY</h5>
                <p className="text-xs text-blue-900 dark:text-blue-300 whitespace-pre-wrap">{review.tryItem}</p>
              </div>
            )}
          </div>

          {review.managerFeedback && (
            <div className="pt-2">
              <h5 className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider mb-1">Đánh giá chung của Quản lý</h5>
              <div className="text-sm text-gray-900 dark:text-[#EDEDED] bg-gray-50 dark:bg-[#0A0A0A] p-3 rounded-lg border border-gray-100 dark:border-[#262626] whitespace-pre-wrap font-medium">
                "{review.managerFeedback}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

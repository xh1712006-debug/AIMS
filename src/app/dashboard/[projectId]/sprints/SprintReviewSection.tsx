'use client';

import { saveSprintReview } from '@/app/actions';

export default function SprintReviewSection({
  sprintId,
  projectId,
  isMentor,
  review
}: {
  sprintId: string;
  projectId: string;
  isMentor: boolean;
  review?: any;
}) {
  if (!isMentor && !review) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
        <p className="text-sm font-medium text-gray-500 italic">⏳ Đang chờ Mentor nghiệm thu Sprint này...</p>
      </div>
    );
  }

  if (isMentor) {
    return (
      <div className="mt-6 border border-indigo-100 bg-indigo-50/30 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
          <h4 className="font-bold text-indigo-900 flex items-center gap-2">
            <span>🎯</span> Báo cáo Nghiệm thu (Sprint Review)
          </h4>
        </div>
        <form action={saveSprintReview} className="p-4 space-y-4">
          <input type="hidden" name="sprintId" value={sprintId} />
          <input type="hidden" name="projectId" value={projectId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Kết quả đạt được (Goal Result) <span className="text-red-500">*</span></label>
              <textarea name="goalResult" required defaultValue={review?.goalResult || ''} rows={2} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-2 text-sm" placeholder="Mục tiêu Sprint có hoàn thành không?"></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Sản phẩm bàn giao (Increment)</label>
              <textarea name="increment" defaultValue={review?.increment || ''} rows={2} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-2 text-sm" placeholder="Link demo, tài liệu, mã nguồn..."></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <label className="block text-xs font-bold text-green-800 mb-1 flex items-center gap-1"><span>✅</span> KEEP (Làm tốt)</label>
              <textarea name="keep" defaultValue={review?.keep || ''} rows={3} className="w-full rounded-lg border-green-200 ring-1 ring-inset ring-green-200 focus:ring-2 focus:ring-inset focus:ring-green-600 p-2 text-sm bg-white" placeholder="Những điểm tích cực cần duy trì..."></textarea>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <label className="block text-xs font-bold text-red-800 mb-1 flex items-center gap-1"><span>❌</span> PROBLEM (Vấn đề)</label>
              <textarea name="problem" defaultValue={review?.problem || ''} rows={3} className="w-full rounded-lg border-red-200 ring-1 ring-inset ring-red-200 focus:ring-2 focus:ring-inset focus:ring-red-600 p-2 text-sm bg-white" placeholder="Những khó khăn, sai sót..."></textarea>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <label className="block text-xs font-bold text-blue-800 mb-1 flex items-center gap-1"><span>💡</span> TRY (Khắc phục)</label>
              <textarea name="tryItem" defaultValue={review?.tryItem || ''} rows={3} className="w-full rounded-lg border-blue-200 ring-1 ring-inset ring-blue-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm bg-white" placeholder="Kế hoạch cải thiện cho Sprint sau..."></textarea>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Đánh giá chung của Mentor (Mentor Feedback)</label>
            <textarea name="mentorFeedback" defaultValue={review?.mentorFeedback || ''} rows={2} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-2 text-sm" placeholder="Nhận xét tổng quan..."></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-500 transition-colors shadow-sm">
              {review ? 'Cập nhật Đánh giá' : 'Lưu Đánh giá Sprint'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-indigo-100 bg-indigo-50/30 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
        <h4 className="font-bold text-indigo-900 flex items-center gap-2">
          <span>🎯</span> Nhật ký Nghiệm thu Sprint (Mentor Review)
        </h4>
      </div>
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kết quả đạt được</h5>
            <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{review.goalResult}</p>
          </div>
          {review.increment && (
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sản phẩm bàn giao</h5>
              <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{review.increment}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {review.keep && (
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
              <h5 className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1"><span>✅</span> KEEP</h5>
              <p className="text-sm text-green-900 whitespace-pre-wrap">{review.keep}</p>
            </div>
          )}
          {review.problem && (
            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
              <h5 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1"><span>❌</span> PROBLEM</h5>
              <p className="text-sm text-red-900 whitespace-pre-wrap">{review.problem}</p>
            </div>
          )}
          {review.tryItem && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h5 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1"><span>💡</span> TRY</h5>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{review.tryItem}</p>
            </div>
          )}
        </div>

        {review.mentorFeedback && (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Đánh giá của Mentor</h5>
            <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap font-medium">
              "{review.mentorFeedback}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartnerReportsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!isClient) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Báo cáo Định kỳ</h2>
          <p className="text-gray-500 mt-2">Cập nhật tiến độ dự án dưới dạng báo cáo tổng kết.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Xuất file PDF
        </button>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-gray-100 dark:border-[#262626] p-10 print:shadow-none print:border-0 print:p-0">
        <div className="text-center mb-10 pb-10 border-b border-gray-100 dark:border-[#262626] print:border-gray-800">
          <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900 dark:text-[#EDEDED]">Báo cáo Tiến độ Tổng quan</h1>
          <p className="text-gray-500 mt-2">Tháng {new Date().getMonth() + 1} Năm {new Date().getFullYear()}</p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-[#D4D4D4] mb-4">1. Tóm tắt Hệ thống</h3>
            <p className="text-sm text-gray-600 dark:text-[#A3A3A3] leading-relaxed">
              Các dự án hiện tại đang tuân thủ đúng quy trình quản lý Agile với các vòng lặp Sprints. 
              Mức độ tương tác của Thực tập sinh với Project Manager và Scrum Master đều ở mức Tốt. 
              Tiến độ hoàn thành các Epic chính đang bám sát biểu đồ kế hoạch đề ra.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-[#D4D4D4] mb-4">2. Bảng Đánh giá Rủi ro</h3>
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-[#0A0A0A]">
                <tr>
                  <th className="px-4 py-3 border border-gray-200 dark:border-[#383838]">Mô tả Rủi ro</th>
                  <th className="px-4 py-3 border border-gray-200 dark:border-[#383838]">Trạng thái</th>
                  <th className="px-4 py-3 border border-gray-200 dark:border-[#383838]">Hướng xử lý</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 border border-gray-200 dark:border-[#383838]">Trễ tiến độ do Blockers kỹ thuật</td>
                  <td className="px-4 py-3 border border-gray-200 dark:border-[#383838] text-green-600 font-bold">Thấp</td>
                  <td className="px-4 py-3 border border-gray-200 dark:border-[#383838]">Scrum Master hỗ trợ xử lý ngay lập tức.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-gray-200 dark:border-[#383838]">Thay đổi yêu cầu từ phía thị trường</td>
                  <td className="px-4 py-3 border border-gray-200 dark:border-[#383838] text-yellow-600 font-bold">Trung bình</td>
                  <td className="px-4 py-3 border border-gray-200 dark:border-[#383838]">Product Owner (PM) sẽ cập nhật Product Backlog và lập lại mức độ ưu tiên.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-8 text-center text-sm text-gray-400">
            <p>Báo cáo này được kết xuất tự động từ hệ thống AIMS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { createProject } from '@/app/actions';
import { useState } from 'react';

export default function CreateProjectForm({ interns }: { interns: { id: string, name: string | null, email: string | null }[] }) {
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = new Date(e.target.value);
    if (!isNaN(startDate.getTime())) {
      // Add 10 weeks (10 * 7 = 70 days)
      const end = new Date(startDate);
      end.setDate(startDate.getDate() + 70);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  return (
    <form action={createProject} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Thực tập sinh</label>
        <select name="internId" required className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
          <option value="">Chọn một Intern...</option>
          {interns.map(i => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Dự án</label>
        <input name="title" required type="text" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" placeholder="VD: Ứng dụng E-commerce" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Track</label>
        <select name="track" className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm">
          <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
          <option value="AI_ML_RESEARCH">AI/ML Research</option>
          <option value="DATA_ANALYTICS">Data Analytics</option>
          <option value="SOFTWARE_TESTING">Software Testing</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày bắt đầu</label>
        <input name="startDate" required type="date" onChange={handleStartDateChange} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày kết thúc (10 tuần)</label>
        <input name="endDate" required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border-gray-300 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 p-2 text-sm" />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <input type="checkbox" id="generateTimeline" name="generateTimeline" value="true" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
        <label htmlFor="generateTimeline" className="text-sm font-medium text-gray-700">
          Tự động tạo lộ trình chuẩn (10 tuần) cho Intern
        </label>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white font-bold rounded-lg py-2.5 hover:bg-blue-500 transition-colors mt-2">
        Tạo Dự án
      </button>
    </form>
  );
}

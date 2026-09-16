'use client';

import { useState } from 'react';
import { saveSettings } from '@/app/actions';

export default function GithubSettingsForm({ 
  projectId, 
  initialToken, 
  initialRepo 
}: { 
  projectId: string, 
  initialToken: string, 
  initialRepo: string 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await saveSettings(formData);
      if (res && res.success === false) {
        setStatusMsg({ type: 'error', text: res.message });
      } else {
        setStatusMsg({ type: 'success', text: res?.message || 'Đã lưu thành công!' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Có lỗi hệ thống xảy ra!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          GitHub Personal Access Token (PAT)
        </label>
        <input 
          name="githubToken" 
          type="password" 
          defaultValue={initialToken}
          className="w-full rounded-xl bg-gray-50 dark:bg-[#111] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0a0a0a] focus:ring-2 focus:ring-indigo-500/20 text-sm p-3 transition-all placeholder:text-gray-400 font-mono" 
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx" 
        />
        <p className="text-[10px] font-semibold text-orange-500 mt-2">
          * Lưu ý: Token cần có quyền `repo` để đẩy code.
        </p>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          GitHub Repository
        </label>
        <input 
          name="githubRepo" 
          type="text" 
          defaultValue={initialRepo}
          className="w-full rounded-xl bg-gray-50 dark:bg-[#111] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0a0a0a] focus:ring-2 focus:ring-indigo-500/20 text-sm p-3 transition-all placeholder:text-gray-400 font-mono" 
          placeholder="username/repository-name" 
        />
        <p className="text-[10px] font-semibold mt-2" style={{ color: 'var(--text-muted)' }}>
          Định dạng: tên-tài-khoản/tên-kho-chứa.
        </p>
      </div>
      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full font-bold py-3 px-4 rounded-xl shadow-md transition-all focus:ring-4 focus:ring-gray-500/30 ${
            statusMsg?.type === 'success' 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
              : statusMsg?.type === 'error'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-[#24292e] hover:bg-[#1b1f23] dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white'
          }`}
        >
          {isSubmitting ? 'Đang kiểm tra và lưu...' : statusMsg ? statusMsg.text : 'Lưu cài đặt GitHub'}
        </button>
      </div>
    </form>
  );
}

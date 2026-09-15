"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email hoặc mật khẩu không chính xác.");
    } else {
      router.push("/dashboard"); 
      router.refresh();
    }
  };

  const fillTestAccount = (emailValue: string) => {
    setEmail(emailValue);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0A0A0A] selection:bg-blue-500/30">
      {/* Cột trái: Background & Branding (Ẩn trên mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden items-center justify-center">
        {/* Lớp phủ Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-800/90 to-purple-900/90 z-10" />
        
        {/* Hình nền mờ (Tùy chọn: Dùng abstract pattern hoặc ảnh office) */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Nội dung branding */}
        <div className="relative z-20 p-16 text-white max-w-2xl">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">
            Agile Internship <br/>Management System
          </h1>
          <p className="text-lg text-blue-100 font-medium leading-relaxed opacity-90 max-w-xl">
            Nền tảng quản trị vòng đời thực tập sinh toàn diện. 
            Kết nối chặt chẽ giữa Quản lý dự án, Scrum Master, Đối tác và Thực tập sinh trên cùng một hệ sinh thái đồng nhất.
          </p>
          
          <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-blue-200">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Quản lý Sprint
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Đánh giá Rủi ro
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Báo cáo tự động
            </span>
          </div>
        </div>
      </div>

      {/* Cột phải: Form Đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="lg:hidden text-center mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">AIMS</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 dark:text-[#EDEDED] tracking-tight">Đăng nhập</h2>
            <p className="text-gray-500 dark:text-[#A3A3A3] mt-2 text-sm font-medium">Chào mừng bạn quay lại hệ thống AIMS.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 dark:text-[#D4D4D4] mb-2">
                  Địa chỉ Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-[#D4D4D4]">
                    Mật khẩu
                  </label>
                  <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Quên mật khẩu?</a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
            >
              Đăng nhập vào Hệ thống →
            </button>
          </form>

          {/* Khu vực Test Accounts (Giữ nguyên tính năng, chỉ thiết kế lại UI) */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-[#262626]" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-gray-50 dark:bg-[#0A0A0A] px-4 text-gray-400 dark:text-[#737373] tracking-wider uppercase text-[10px] font-black">
                Truy cập nhanh (Dev Mode)
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { label: 'Admin', email: 'admin@test.com', icon: '👑' },
              { label: 'PM', email: 'projectManager@test.com', icon: '💼' },
              { label: 'Scrum Master', email: 'memberManager@test.com', icon: '🔄' },
              { label: 'Intern', email: 'intern@test.com', icon: '👨‍💻' },
              { label: 'Partner', email: 'partner@test.com', icon: '🤝' },
            ].map((role) => (
              <button
                key={role.email}
                type="button"
                onClick={() => fillTestAccount(role.email)}
                className="flex items-center justify-center gap-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] text-gray-700 dark:text-[#A3A3A3] hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm hover:shadow-md"
              >
                <span>{role.icon}</span>
                {role.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

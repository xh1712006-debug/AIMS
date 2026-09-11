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

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-1" style={{ color: 'var(--accent)' }}>AIMS</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Agile Internship Management System</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Đăng nhập</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Hệ thống Quản lý Thực tập Agile/Scrum</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div
                className="rounded-lg p-3 text-sm font-medium"
                style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Địa chỉ Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="aims-input"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="aims-input"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="aims-btn-primary w-full mt-2">
              Đăng nhập →
            </button>
          </form>

          {/* Quick Login for Testing */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs font-semibold mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
              Đăng nhập nhanh để test (Dev Mode)
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@test.com');
                  setPassword('password123');
                }}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Tự điền tk Quản trị (Admin)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('projectManager@test.com');
                  setPassword('password123');
                }}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Tự điền tk ProjectManager
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('intern@test.com');
                  setPassword('password123');
                }}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Tự điền tk Intern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


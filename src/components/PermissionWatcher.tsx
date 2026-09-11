"use client";

import { useEffect, useState, useRef } from "react";
import { getPermissionUpdateTimestamp } from "@/app/actions/permissions";
import { signOut } from "next-auth/react";

export default function PermissionWatcher({ userRole }: { userRole: string }) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const initialTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkPermissions = async () => {
      try {
        const latestTimestamp = await getPermissionUpdateTimestamp(userRole);
        
        if (!latestTimestamp) return;

        // Lưu mốc thời gian lần đầu gọi
        if (!initialTimestampRef.current) {
          initialTimestampRef.current = latestTimestamp;
          return;
        }

        // So sánh: Nếu có thay đổi mới hơn
        if (latestTimestamp !== initialTimestampRef.current) {
          // Kích hoạt countdown
          setCountdown(5);
        }
      } catch (error) {
        console.error("Failed to check permissions:", error);
      }
    };

    // Kiểm tra lần đầu
    checkPermissions();

    // Lặp lại mỗi 10 giây
    interval = setInterval(checkPermissions, 10000);

    return () => clearInterval(interval);
  }, [userRole]);

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      // Đăng xuất và đẩy về trang đăng nhập
      signOut({ callbackUrl: '/login' });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  if (countdown === null) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-red-600 text-white p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-4 fade-in max-w-sm">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h4 className="font-bold text-lg mb-1">Cảnh báo Phân quyền</h4>
          <p className="text-sm opacity-90 leading-relaxed">
            Quản trị viên vừa thay đổi quyền hạn của bạn. Hệ thống sẽ tự động tải lại phiên làm việc sau <strong>{countdown} giây</strong>...
          </p>
        </div>
      </div>
    </div>
  );
}

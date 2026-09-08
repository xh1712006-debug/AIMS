# 05. Đề xuất Kiến trúc & Nâng cấp (Proposals & Improvements)

## Bối cảnh (Context)
Dù hệ thống AIMS đã áp dụng khá tốt các thực hành Agile và theo dõi hiệu suất, để dự án thực sự đạt mức **Enterprise/Professional**, kiến trúc và dữ liệu cần được mở rộng. Dưới đây là thiết kế nâng cấp dự kiến cho các Phase tiếp theo.

## 1. Nâng cấp Hệ thống Phân quyền (RBAC Expansion)
**Vấn đề:** Hiện tại chỉ có `INTERN` và `MENTOR`, khiến việc phân bổ dự án bị "cứng", Mentor tự phải tạo dự án cho mình.
**Giải pháp:** Bổ sung Enum `ADMIN` vào Role.
- `ADMIN` sẽ có không gian làm việc riêng (`/dashboard/admin`).
- Chức năng: Thêm mới tài khoản, phân bổ (Assign) Intern vào các Track, cấu hình danh mục Track (không cứng hóa bằng Enum).

## 2. Xây dựng Hệ thống Thông báo (Notification System)
**Vấn đề:** Có thư mục UI `/inbox` nhưng thực chất chưa có Notification model, Mentor và Intern phải tự "kéo" (pull/F5) trang để biết có cập nhật mới.
**Giải pháp:** Thêm bảng `Notification` vào Prisma.
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String   // Người nhận
  user      User     @relation(fields: [userId], references: [id])
  type      String   // VD: "FEEDBACK", "RISK_ALERT", "SPRINT_END"
  content   String
  isRead    Boolean  @default(false)
  linkUrl   String?  // Click để điều hướng
  createdAt DateTime @default(now())
}
```
**Ứng dụng:**
- Khi Check-in có Risk = RED -> Push notification cho Mentor.
- Khi WorkItem bị đánh cờ `requiresFix` -> Push notification cho Intern.

## 3. Tự động hoá qua Git Webhooks (CI/CD Integration)
**Vấn đề:** Trạng thái WorkItem phải kéo thả thủ công (Kaban drag-drop).
**Giải pháp:** Viết API Endpoint (`/api/webhooks/github`) nhận sự kiện từ kho `githubRepo` đã lưu trong Project.
- Nếu Intern tạo Pull Request và đánh tag `AIMS-TaskID`, hệ thống tự động đổi trạng thái Task thành `REVIEW`.
- Nếu PR được Merge, tự động đổi trạng thái Task thành `DONE`.

## 4. Bổ sung Agile Metrics (Velocity & Burndown)
**Vấn đề:** Thiếu dữ liệu định lượng (Quantitative data) để đánh giá năng suất.
**Giải pháp:** Bắt buộc áp dụng `estimate` (Story Points) trên các Epic/Story. 
- Tính toán Velocity: Tổng `estimate` của các task `DONE` mỗi cuối Sprint.
- Thiết kế Recharts Burndown: Biểu đồ đường (Line Chart) theo dõi `estimate` còn lại qua từng ngày của Sprint.

<div align="center">
  <h1 align="center">AIMS - Agile Intern Management System</h1>
  <p align="center">
    <strong>Hệ thống Quản trị & Điều hành Thực tập sinh chuẩn Doanh nghiệp (Agile/Scrum)</strong>
  </p>
</div>

<hr />

## 🌟 Giới thiệu (Overview)
AIMS (Agile Intern Management System) là một giải pháp quản lý toàn diện dành cho các chương trình đào tạo và thực tập kéo dài. Hệ thống áp dụng triệt để khung làm việc **Agile/Scrum**, giúp thu hẹp khoảng cách giao tiếp giữa Người hướng dẫn (Mentor) và Thực tập sinh (Intern). 

AIMS giải quyết bài toán: Làm sao để Mentor quản lý đồng thời nhiều Intern ở nhiều dự án khác nhau mà vẫn đảm bảo sát sao tiến độ, phát hiện rủi ro sớm và duy trì chất lượng code thông qua luồng Feedback khép kín.

## ✨ Tính năng Nổi bật (Key Features)

### 👨‍💻 Dành cho Thực tập sinh (Intern)
- **Quản lý Vòng lặp (Sprint Management):** Tạo, chạy và đánh giá các Sprint (Sprint Retrospective) với các bài học KPT (Keep - Problem - Try).
- **Cấu trúc Backlog Chuyên nghiệp:** Phân cấp công việc rõ ràng (Epic -> Story -> Task -> Bug). Quản lý mức độ ưu tiên, trạng thái (TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED).
- **Báo cáo Không đồng bộ (Daily Check-in):** Khai báo tiến độ hằng ngày (Done, Next, Blocker). Tự đánh giá rủi ro dự án (Risk Matrix).
- **Trực quan hóa Dữ liệu:** Dashboard với các biểu đồ thống kê tiến độ, sức khỏe dự án.

### 👩‍🏫 Dành cho Người hướng dẫn (Mentor)
- **Giám sát Đa dự án (Multi-project Monitoring):** View toàn cảnh tất cả dự án đang chạy, trạng thái rủi ro Xanh/Vàng/Đỏ.
- **Trung tâm Phản hồi (Feedback Hub):** Quy tụ toàn bộ các WorkItem đang bị "bắt lỗi" (requiresFix = true) ở mọi dự án về một màn hình duy nhất để dễ dàng theo dõi Intern khắc phục.
- **Hỗ trợ tháo gỡ (Blocker Resolution):** Phản hồi trực tiếp vào báo cáo Check-in của Intern để đưa ra giải pháp giải quyết khó khăn ngay lập tức.
- **Đánh giá Hiệu suất (Performance Evaluation):** Chấm điểm và đưa ra nhận xét tổng quan (`mentorFeedback`) cho từng Sprint Review.

## 🚀 Công nghệ Cốt lõi (Tech Stack)
Dự án được xây dựng theo kiến trúc hiện đại, tập trung vào hiệu suất và trải nghiệm người dùng (SSR & Server Actions).

- **Frontend:** Next.js 14+ (App Router), React, Tailwind CSS v4, Recharts.
- **Backend:** Next.js Server Components & Server Actions (Zero API routes for internal mutations).
- **Database:** PostgreSQL điều khiển qua Prisma ORM.
- **Authentication:** NextAuth.js (v4) với Role-Based Access Control (RBAC).

## 📚 Tài liệu Kỹ thuật Hệ thống (Documentation)
Dự án đi kèm bộ tài liệu phân tích kỹ thuật và nghiệp vụ cực kỳ chi tiết, được đặt trong thư mục `.agents/docs`. Các Kỹ sư hoặc AI Agents tham gia dự án vui lòng đọc kỹ:

### Luồng Nghiệp vụ (Features & Business Logic)
- 📖 [01. Phân quyền & Xác thực (RBAC)](.agents/docs/features/01-authentication-rbac.md)
- 📖 [02. Quản lý Dự án Agile](.agents/docs/features/02-agile-project-management.md)
- 📖 [03. Hệ thống Báo cáo Hằng ngày](.agents/docs/features/03-daily-checkin-system.md)
- 📖 [04. Vòng lặp Đánh giá & Phản hồi](.agents/docs/features/04-mentor-evaluation-feedback.md)
- 📖 [05. Đề xuất Kiến trúc Nâng cấp](.agents/docs/features/05-proposals-and-improvements.md)

### Thiết kế Kỹ thuật (System Design)
- ⚙️ [01. Kiến trúc Hệ thống (Client-Server)](.agents/docs/design/01-system-architecture.md)
- ⚙️ [02. Sơ đồ Cơ sở Dữ liệu (ERD)](.agents/docs/design/02-database-schema.md)
- ⚙️ [03. Luồng dữ liệu (Server Actions)](.agents/docs/design/03-api-and-data-flow.md)
- ⚙️ [04. Giao diện UI/UX & Design System](.agents/docs/design/04-ui-ux-design-system.md)

## 🛠 Hướng dẫn Cài đặt & Chạy dự án (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
- Node.js (v18.x trở lên)
- Cơ sở dữ liệu PostgreSQL đã chạy.

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Thiết lập Biến môi trường
Tạo file `.env` ở thư mục gốc và cấu hình:
```env
# Connection string của PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/aims_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_string" # Chạy `openssl rand -base64 32` để tạo
```

### Bước 3: Khởi tạo Cơ sở Dữ liệu
Sử dụng Prisma để đồng bộ Schema:
```bash
npx prisma generate
npx prisma db push
```
*(Tùy chọn: Chạy `npx prisma db seed` nếu có file dữ liệu mẫu)*

### Bước 4: Khởi động Server Development
```bash
npm run dev
```
Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

## 🎨 Giao diện (Screenshots)
*(Thêm hình ảnh Dashboard, Kanban Board, Form Check-in tại đây)*

---
*Dự án được xây dựng và tài liệu hóa bằng sự trợ giúp của AI Assistants.*

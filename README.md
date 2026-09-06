# Agile Internship Management System (AIMS)

AIMS là hệ thống quản lý sinh viên thực tập (Interns) theo mô hình Agile/Scrum. Hệ thống được thiết kế cho chương trình thực tập kéo dài 10 tuần, giúp Mentors theo dõi tiến độ hiệu quả, đồng thời hỗ trợ Interns dễ dàng ghi nhận (log) quá trình làm việc, đánh giá rủi ro (Risk), và đồng bộ báo cáo (evidence) lên GitHub.

## 🌟 Tính năng cốt lõi (Core Features)

- **Quản lý dự án & Sinh viên (Dashboard):** Quản lý danh sách Interns đang hoạt động, hệ thống cảnh báo rủi ro (Risk status: `GREEN` - Ổn định, `YELLOW` - Cần chú ý, `RED` - Nguy cơ cao) giúp Mentor có cái nhìn tổng quan.
- **Cấu trúc Agile & Quản lý Công việc (WorkItems):** Tổ chức công việc theo chuẩn Agile: Project → Product Backlog → Epic → Sprint. Hỗ trợ đa dạng loại công việc (`EPIC`, `STORY`, `FEATURE`, `TASK`, `BUG`).
- **Check-ins (Daily/Weekly):** Giao diện báo cáo tiến độ định kỳ nhanh chóng với các mục trọng tâm: **DONE** (Đã làm), **NEXT** (Sắp làm), **BLOCKER** (Khó khăn) và **EVIDENCE** (Minh chứng).
- **Sprint Review:** Hỗ trợ quy trình đánh giá cuối mỗi Sprint. Intern tổng kết kết quả (Goal Result, Increment, Technical Findings), Mentor thực hiện chấm điểm và để lại phản hồi (Feedback).
- **Tích hợp GitHub:** Tự động đồng bộ báo cáo, check-in lên kho lưu trữ (repository) GitHub của Intern thông qua Personal Access Token.

## 👥 Vai trò (Roles)

- **INTERN (Sinh viên):** Quản lý công việc cá nhân, thực hiện log daily check-ins, tạo sprint review.
- **MENTOR (Người hướng dẫn):** Theo dõi tiến độ của tất cả Interns, xem các cảnh báo hệ thống, đánh giá chất lượng và đưa ra feedback kịp thời.

## 💻 Công nghệ sử dụng (Tech Stack)

Dự án AIMS được xây dựng trên nền tảng công nghệ hiện đại, full-stack với TypeScript:
- **Frontend:** [Next.js](https://nextjs.org/) (React 19), [Tailwind CSS v4](https://tailwindcss.com/), TypeScript.
- **Backend:** Node.js, [Prisma ORM](https://www.prisma.io/).
- **Database:** PostgreSQL.
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) / Prisma Adapter.

## 🚀 Hướng dẫn cài đặt (Getting Started)

**Bước 1:** Cài đặt các thư viện (dependencies)

```bash
npm install
```

**Bước 2:** Cấu hình biến môi trường
Tạo file `.env` từ file `.env.example` (nếu có) và điền các thông tin:
- Kết nối CSDL (Database URL)
- Cấu hình NextAuth (Secret)
- Các cấu hình tích hợp (GitHub API Token, v.v.)

**Bước 3:** Cài đặt cơ sở dữ liệu với Prisma

```bash
npx prisma generate
npx prisma db push
```

**Bước 4:** Khởi chạy dự án ở chế độ phát triển (development)

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để bắt đầu sử dụng hệ thống.

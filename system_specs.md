# Agile Internship Management System (AIMS) - System Specifications

## 1. Overview
Hệ thống quản lý sinh viên thực tập (Interns) theo mô hình Agile/Scrum.
- **Thời lượng**: 10 tuần (Week 1 đến Week 10).
- **Mục tiêu**: Giúp Mentor theo dõi tiến độ, Intern dễ dàng log quá trình làm việc, đánh giá rủi ro (Risk), và đồng bộ báo cáo (evidence) lên GitHub.

## 2. Các nhóm người dùng (Roles)
- **INTERN (Sinh viên)**: Quản lý công việc cá nhân, log daily check-ins, tạo sprint review.
- **MENTOR (Người hướng dẫn)**: Theo dõi tiến độ của tất cả Interns, xem cảnh báo (Risk status), đánh giá, và cho feedback.

## 3. Các hướng chuyên môn (Tracks)
- **Software Development**: Đẩy mạnh code, build hệ thống, test tự động.
- **Data Analytics**: Làm sạch dữ liệu, EDA, phân tích insight.
- **AI/ML Research**: Tìm hiểu literature, chạy baseline, train mô hình.
- **Software Testing**: Lên test strategy, test case, automation.

## 4. Timeline 10 Tuần
- **Week 1**: Onboarding, tìm hiểu bài toán, lập kế hoạch.
- **Week 2-3**: Sprint 1
- **Week 4-5**: Sprint 2
- **Week 6-7**: Sprint 3
- **Week 8-9**: Sprint 4
- **Week 10**: Final Review & Báo cáo kết quả.

## 5. Core Features
### 5.1. Quản lý dự án & Sinh viên (Dashboard)
- Quản lý danh sách Interns đang Active.
- Cảnh báo rủi ro (Risk): 
  - **GREEN**: Đi đúng hướng.
  - **YELLOW**: Chậm trễ vài ngày hoặc có blocker (Inactive > 4 days).
  - **RED**: Nguy cơ cao, không hoàn thành tiến độ (Inactive > 7 days).

### 5.2. Cấu trúc Agile & Quản lý Công việc (WorkItems)
- **Mô hình Phân cấp (Hierarchy)**:
  - **Project** (Dự án) -> 1 **Product Backlog** (Danh sách tổng).
  - **Epic** (Tính năng lớn) -> Chứa nhiều công việc con (Task, Story, Feature, Bug).
  - **Sprint** (Chu kỳ lặp) -> Chứa các công việc rút ra từ Backlog để làm trong khoảng thời gian nhất định (Thể hiện độ ưu tiên).
- **Loại Công việc (Type)**: `EPIC`, `STORY` (User Story), `FEATURE`, `TASK`, `BUG`.
- **Trạng thái (Status)**: Todo, In Progress, Review, Done, Blocked.
- **Triết lý theo dõi Agile**:
  - Không dùng `% complete` làm chỉ số chính.
  - Ưu tiên: **Sprint Goal** → **Increment/Evidence** → **Blocker** → **Risk** → **Next Milestone**.

### 5.3. Check-ins (Daily/Weekly)
- Intern báo cáo trạng thái định kỳ.
- Fields: **DONE** (Đã làm gì), **NEXT** (Sẽ làm gì), **BLOCKER** (Khó khăn hiện tại), **EVIDENCE** (Link tài liệu/github).

### 5.4. Sprint Review
- Intern tự review vào cuối mỗi Sprint.
- Fields: **Goal Result**, **Increment**, **Technical Findings**, **KEEP** (Phát huy), **PROBLEM** (Vấn đề), **TRY** (Thử nghiệm mới).
- Mentor chấm điểm (Score: 0-10) và để lại Feedback.

### 5.5. Tích hợp GitHub
- Tự động call GitHub API để đẩy (commit) nội dung Check-in hoặc Sprint Review lên Repository tương ứng của Intern (thông qua Personal Access Token).

## 6. Architecture & Tech Stack
- **Frontend**: Next.js (React), TailwindCSS, TypeScript.
- **Backend**: Node.js (Express), Prisma ORM, TypeScript.
- **Database**: PostgreSQL.
- **Authentication**: JWT (JSON Web Token) hoặc NextAuth.js.

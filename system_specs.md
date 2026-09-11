# Agile Internship Management System (AIMS) - System Specifications

## 1. Overview
Hệ thống quản lý dự án và sinh viên thực tập (Interns) theo mô hình chuẩn Agile/Scrum.
- **Thời lượng**: 10 tuần (Week 1 đến Week 10).
- **Mục tiêu**: Giúp quản lý tiến độ dự án, áp dụng chuẩn Scrum vào quy trình làm việc, đánh giá rủi ro (Risk) và đồng bộ báo cáo lên GitHub.

## 2. Các nhóm người dùng (Roles)
Hệ thống áp dụng 5 vai trò (Roles) chính, mô phỏng lại các vai trò trong môi trường dự án thực tế theo chuẩn Agile/Scrum:

- **Quản trị viên (ADMIN)**: 
  - Đóng vai trò System Admin. 
  - Quản lý toàn bộ hệ thống, tạo các tài khoản, cấp và phân quyền động. Xem tất cả tài khoản trong hệ thống.
- **Quản lý dự án (PROJECT_MANAGER)**: 
  - Đóng vai trò **Product Owner (PO)**.
  - Định hướng và gán dự án cho Intern và Quản lý thành viên.
  - Làm việc với Khách hàng/Đối tác để nắm bắt yêu cầu dự án.
  - Là người tạo ra các `EPIC` và `STORY` trong hệ thống. Theo dõi tiến độ, hoạt động và kiểm tra tính hoàn thiện của các chức năng do Intern làm.
- **Quản lý thành viên (MEMBER_MANAGER)**: 
  - Đóng vai trò **Scrum Master / Agile Coach**.
  - Tổ chức và điều hành các sự kiện Scrum: Sprint Planning (Họp kế hoạch), Daily Scrum (Họp hàng ngày), Sprint Review (Họp kiểm tra) và Sprint Retrospective (Họp phân tích/rút kinh nghiệm).
  - Giúp Intern hiểu rõ về dự án, gỡ rối (blocker) khi Intern gặp khó khăn trong quá trình làm việc. Theo dõi sát sao tình trạng dự án liên tục.
- **Thực tập sinh (INTERN)**: 
  - Đóng vai trò **Development Team**.
  - Dựa trên `STORY` do Quản lý dự án tạo, Intern sẽ phân chia nhỏ thành các `TASK` hoặc báo cáo `BUG`.
  - Cập nhật trạng thái vấn đề (`TODO`, `IN_PROGRESS`, `DONE`). Thường xuyên trao đổi với Quản lý dự án (để nắm business) và Quản lý thành viên (để gỡ khó khăn/quy trình).
- **Đối tác (PARTNER)**: 
  - Đóng vai trò **Stakeholder / Client**.
  - Không thao tác sửa chữa dự án.
  - Theo dõi tiến độ tổng quan (Burn-down chart, phần trăm hoàn thành Epic/Story) và tham gia vào quá trình nghiệm thu (Sprint Review).

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
### 5.1. Quản lý dự án (Dashboard)
- Quản lý danh sách các dự án đang Active.
- Cảnh báo rủi ro (Risk): 
  - **GREEN**: Đi đúng hướng.
  - **YELLOW**: Chậm trễ vài ngày hoặc có blocker (Inactive > 4 days).
  - **RED**: Nguy cơ cao, không hoàn thành tiến độ (Inactive > 7 days).

### 5.2. Cấu trúc Agile & Quản lý Công việc (WorkItems)
- **Mô hình Phân cấp (Hierarchy)**:
  - **Project** (Dự án) -> 1 **Product Backlog** (Danh sách tổng).
  - **Epic** (Tính năng lớn) -> Chứa nhiều công việc con (`STORY`).
  - **Story** -> Do Quản lý dự án (PO) tạo, Intern nhận lấy và bẻ nhỏ thành `TASK` & `BUG`.
  - **Sprint** (Chu kỳ lặp) -> Chứa các công việc rút ra từ Backlog để làm trong khoảng thời gian nhất định thông qua buổi họp Sprint Planning do Quản lý thành viên điều phối.
- **Loại Công việc (Type)**: `EPIC`, `STORY` (User Story), `TASK`, `BUG`.
- **Trạng thái (Status)**: Todo, In Progress, Review, Done, Blocked.
- **Triết lý theo dõi Agile**:
  - Không dùng `% complete` làm chỉ số chính.
  - Ưu tiên: **Sprint Goal** → **Increment/Evidence** → **Blocker** → **Risk** → **Next Milestone**.

### 5.3. Check-ins (Daily/Weekly)
- Intern báo cáo trạng thái định kỳ thông qua buổi Daily Scrum.
- Fields: **DONE** (Đã làm gì), **NEXT** (Sẽ làm gì), **BLOCKER** (Khó khăn hiện tại), **EVIDENCE** (Link tài liệu/github).

### 5.4. Sprint Review & Retrospective
- Thực hiện vào cuối mỗi Sprint.
- Fields: **Goal Result**, **Increment**, **Technical Findings**, **KEEP** (Phát huy), **PROBLEM** (Vấn đề), **TRY** (Thử nghiệm mới).
- Quản lý dự án và Đối tác tham gia đánh giá. Quản lý thành viên sẽ để lại Manager Feedback để điều chỉnh tốc độ làm việc.

### 5.5. Tích hợp GitHub
- Tự động call GitHub API để đẩy (commit) nội dung Check-in hoặc Sprint Review lên Repository tương ứng (thông qua Personal Access Token).

## 6. Architecture & Tech Stack
- **Frontend**: Next.js (React), TailwindCSS, TypeScript.
- **Backend**: Node.js (Express), Prisma ORM, TypeScript.
- **Database**: PostgreSQL.
- **Authentication**: JWT (JSON Web Token) hoặc NextAuth.js.

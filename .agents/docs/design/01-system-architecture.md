# 01. Kiến trúc Hệ thống (System Architecture)

## Tổng quan
AIMS (Agile Intern Management System) được xây dựng trên một kiến trúc hiện đại, tận dụng tối đa khả năng Server-Side Rendering (SSR) và Server Actions của Next.js để tối ưu hóa hiệu suất (Performance) và tối giản hóa lớp giao tiếp API truyền thống.

## Tech Stack Cốt lõi
- **Framework:** Next.js 14+ (App Router).
- **Ngôn ngữ:** TypeScript.
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Authentication:** NextAuth.js (v4).
- **Styling:** TailwindCSS v4.
- **Biểu đồ:** Recharts.

## Kiến trúc High-Level (Client - Server)
Hệ thống loại bỏ hoàn toàn việc viết các RESTful API endpoints rườm rà (tại `/api`) cho các tác vụ nội bộ (trừ webhook hoặc auth). Thay vào đó, kiến trúc vận hành như sau:

```mermaid
graph TD
    Client[Trình duyệt / Client Component]
    Server[Node.js / Next.js Server Component]
    DB[(PostgreSQL)]

    Client -->|User Interactions (Forms, Buttons)| ServerActions(Next.js Server Actions)
    ServerActions -->|Prisma Client| DB
    Server -->|Direct Prisma Query| DB
    DB -->|Data| Server
    Server -->|React Server Components (RSC)| Client
```

### 1. Lớp Trình bày (Presentation Layer)
- Sử dụng **React Server Components (RSC)** làm mặc định (ví dụ: các file `page.tsx`, `layout.tsx`). Việc query DB bằng `prisma.findMany()` diễn ra trực tiếp tại đây mà không cần fetch HTTP. Điều này giúp loại bỏ độ trễ mạng (Network Waterfall) và đảm bảo dữ liệu hiển thị an toàn, thân thiện SEO.
- Sử dụng **Client Components** (`"use client"`) cho những phần cần tính tương tác: Modal, biểu đồ (`Recharts`), form nhập liệu, Dark Mode toggle.

### 2. Lớp Dữ liệu và Nghiệp vụ (Data & Business Logic Layer)
- Các logic thay đổi trạng thái (Mutations) như: *Tạo Sprint, Cập nhật trạng thái Task, Viết Check-in* đều được xử lý qua **Server Actions** (`src/app/actions.ts`). 
- **Bảo mật tại Server Action:** Mọi Action đều gọi `getServerSession` để xác minh quyền hạn trước khi chọc vào Database.

### 3. Middleware & Authentication
- Xác thực được nhúng chặt vào lõi ứng dụng thông qua `NextAuth` bọc ngoài `AuthProvider` ở file `layout.tsx`.
- Giao tiếp giữa ứng dụng và Auth Provider hoàn toàn sử dụng Session Cookie bảo mật.

## Cấu trúc Thư mục Kỹ thuật
```text
src/
├── app/
│   ├── actions.ts           # Toàn bộ Server Actions thay thế API REST
│   ├── layout.tsx           # Global Layout, Provider injection
│   ├── login/               # Luồng đăng nhập
│   └── dashboard/           # Không gian làm việc chính
│       ├── mentor/          # Route dành riêng Mentor
│       └── [projectId]/     # Route động cho từng Project (Intern)
├── components/              # Các UI Components tái sử dụng (Client/Server)
├── lib/
│   ├── auth.ts              # NextAuth Options
│   └── prisma.ts            # Prisma Client Singleton (tránh connection leaks)
```

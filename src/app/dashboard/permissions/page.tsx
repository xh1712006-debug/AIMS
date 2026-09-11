import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import PermissionsClient from "./PermissionsClient";

const DEFAULT_FEATURES = [
  { feature: "Đăng nhập hệ thống", intern: true, projectManager: true, admin: true, memberManager: true, partner: true },
  { feature: "Xem bảng điều khiển cá nhân", intern: true, projectManager: true, admin: true, memberManager: true, partner: true },
  { feature: "Xem không gian làm việc dự án", intern: true, projectManager: false, admin: false, memberManager: false, partner: false },
  { feature: "Báo cáo tiến độ (Check-in)", intern: true, projectManager: false, admin: false, memberManager: false, partner: false },
  { feature: "Tạo dự án mới", intern: false, projectManager: true, admin: false, memberManager: false, partner: false },
  { feature: "Đánh giá & chấm điểm Sprint", intern: false, projectManager: true, admin: false, memberManager: true, partner: false },
  { feature: "Xem tiến độ các dự án quản lý", intern: false, projectManager: true, admin: false, memberManager: true, partner: true },
  { feature: "Tạo tài khoản (Intern/ProjectManager/Admin)", intern: false, projectManager: false, admin: true, memberManager: false, partner: false },
  { feature: "Phân bổ Role cho Dự án", intern: false, projectManager: true, admin: true, memberManager: false, partner: false },
  { feature: "Xóa tài khoản người dùng", intern: false, projectManager: false, admin: true, memberManager: false, partner: false },
  { feature: "Xóa dự án khỏi hệ thống", intern: false, projectManager: false, admin: true, memberManager: false, partner: false },
];

export default async function PermissionsMatrixPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Lấy dữ liệu phân quyền từ DB
  let dbPermissions = await prisma.rolePermission.findMany();

  // Nếu DB trống, tạo sẵn các quyền mặc định
  if (dbPermissions.length === 0) {
    const seedData = [];
    for (const f of DEFAULT_FEATURES) {
      seedData.push({ role: 'INTERN' as const, feature: f.feature, isEnabled: f.intern });
      seedData.push({ role: 'PROJECT_MANAGER' as const, feature: f.feature, isEnabled: f.projectManager });
      seedData.push({ role: 'ADMIN' as const, feature: f.feature, isEnabled: f.admin });
      seedData.push({ role: 'MEMBER_MANAGER' as const, feature: f.feature, isEnabled: f.memberManager });
      seedData.push({ role: 'PARTNER' as const, feature: f.feature, isEnabled: f.partner });
    }
    
    await prisma.rolePermission.createMany({
      data: seedData,
      skipDuplicates: true
    });
    
    dbPermissions = await prisma.rolePermission.findMany();
  }

  // Chuyển đổi dữ liệu DB thành dạng Matrix
  const formattedPermissions = DEFAULT_FEATURES.map(f => {
    return {
      feature: f.feature,
      intern: dbPermissions.find(p => p.feature === f.feature && p.role === 'INTERN')?.isEnabled ?? f.intern,
      projectManager: dbPermissions.find(p => p.feature === f.feature && p.role === 'PROJECT_MANAGER')?.isEnabled ?? f.projectManager,
      memberManager: dbPermissions.find(p => p.feature === f.feature && p.role === 'MEMBER_MANAGER')?.isEnabled ?? f.memberManager,
      partner: dbPermissions.find(p => p.feature === f.feature && p.role === 'PARTNER')?.isEnabled ?? f.partner,
      admin: dbPermissions.find(p => p.feature === f.feature && p.role === 'ADMIN')?.isEnabled ?? f.admin,
    };
  });

  return <PermissionsClient initialPermissions={formattedPermissions} />;
}

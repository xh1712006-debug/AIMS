import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MemberManagerDashboardClient from "./MemberManagerDashboardClient";

export const metadata = {
  title: 'Trang chủ Scrum Master | AIMS',
};

export default async function MemberManagerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'MEMBER_MANAGER') {
    redirect('/dashboard');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projectsAsMM: {
        include: {
          intern: true,
          workItems: true,
          checkIns: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      }
    }
  });

  if (!user) return null;

  const projects = user.projectsAsMM || [];

  return <MemberManagerDashboardClient projects={projects} user={{ name: user.name, role: user.role }} />;
}

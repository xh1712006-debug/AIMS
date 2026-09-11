import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserManagementClient from "./UserManagementClient";

export default async function InternsManagePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all users to display in the management UI
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
    include: {
      projectsAsIntern: {
        select: { id: true, title: true }
      },
      projectManager: {
        select: { id: true, name: true }
      },
      interns: {
        select: { id: true, name: true }
      }
    }
  });

  const formattedUsers = users.map(u => ({
    ...u,
    projects: u.projectsAsIntern
  }));

  return <UserManagementClient users={formattedUsers as any} />;
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminProjectsClient from "./AdminProjectsClient";

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const projects = await prisma.project.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      intern: {
        select: { id: true, name: true }
      }
    }
  });

  return <AdminProjectsClient projects={projects as any} />;
}

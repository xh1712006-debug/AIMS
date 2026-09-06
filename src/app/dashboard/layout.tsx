import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  let projects: any[] = [];
  if (session.user.role === 'INTERN') {
    projects = await prisma.project.findMany({
      where: { internId: session.user.id },
      orderBy: { startDate: 'desc' },
      select: { id: true, title: true }
    });
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      <Sidebar user={session.user as any} projects={projects} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}

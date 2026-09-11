import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import prisma from "@/lib/prisma";
import { getPendingActions } from "@/lib/actionsHub";
import PermissionWatcher from "@/components/PermissionWatcher";

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
  let pendingActionCount = 0;

  if (session.user.role === 'INTERN') {
    projects = await prisma.project.findMany({
      where: { internId: session.user.id },
      orderBy: { startDate: 'desc' },
      select: { id: true, title: true }
    });
  } else if (session.user.role === 'PROJECT_MANAGER') {
    const interns = await prisma.user.findMany({
      where: { role: 'INTERN' },
      include: {
        projectsAsIntern: {
          include: {
            workItems: true,
            checkIns: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });
    const pendingActions = getPendingActions(interns);
    pendingActionCount = pendingActions.length;
  }

  return (
    <div
      className="h-screen flex flex-col md:flex-row overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <PermissionWatcher userRole={session.user.role} />
      <Sidebar user={session.user as any} projects={projects} pendingActionCount={pendingActionCount} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-[1600px] w-full mx-auto pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}

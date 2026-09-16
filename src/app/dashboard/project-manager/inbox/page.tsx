import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPendingActions, getResolvedActions } from "@/lib/actionsHub";
import InboxTabs from "./InboxTabs";

export const metadata = {
  title: 'Hộp thư Xử lý | AIMS Người quản lý dự án Portal'
};

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'PROJECT_MANAGER') {
    redirect("/dashboard");
  }

  // Fetch all interns and their recent data
  const interns = await prisma.user.findMany({
    where: { role: 'INTERN' },
    include: {
      projectsAsIntern: {
        where: { projectManagerId: session.user.id },
        include: {
          workItems: true,
          checkIns: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  const pendingActions = getPendingActions(interns);
  const resolvedActions = getResolvedActions(interns);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">


      <InboxTabs pendingActions={pendingActions} resolvedActions={resolvedActions} />
    </div>
  );
}

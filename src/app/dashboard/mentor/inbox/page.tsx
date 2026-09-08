import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPendingActions, getResolvedActions } from "@/lib/actionsHub";
import InboxTabs from "./InboxTabs";

export const metadata = {
  title: 'Hộp thư Xử lý | AIMS Mentor Portal'
};

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'MENTOR') {
    redirect("/dashboard");
  }

  // Fetch all interns and their recent data
  const interns = await prisma.user.findMany({
    where: { role: 'INTERN' },
    include: {
      projects: {
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
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight flex items-center gap-3">
            Hộp thư Xử lý
            {pendingActions.length > 0 && (
              <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">{pendingActions.length}</span>
            )}
          </h2>
          <p className="text-gray-500 dark:text-[#A3A3A3] mt-2">Nơi tập trung toàn bộ các vấn đề cần sự hỗ trợ của Mentor.</p>
        </div>
      </div>

      <InboxTabs pendingActions={pendingActions} resolvedActions={resolvedActions} />
    </div>
  );
}

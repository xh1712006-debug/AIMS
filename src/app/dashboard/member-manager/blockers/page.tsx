import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import BlockerBoard from "./BlockerBoard";

export const metadata = {
  title: 'Giải quyết Blockers | AIMS',
};

export default async function BlockersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'MEMBER_MANAGER') redirect('/dashboard');

  const blockedItems = await prisma.workItem.findMany({
    where: {
      status: 'BLOCKED',
      project: {
        memberManagerId: session.user.id
      }
    },
    include: {
      project: {
        include: {
          intern: true
        }
      },
      comments: {
        include: {
          author: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#EDEDED] tracking-tight">Giải quyết Blockers</h2>
        <p className="text-gray-500 mt-2">Theo dõi và hỗ trợ thực tập sinh tháo gỡ các khó khăn trong dự án.</p>
      </div>
      
      <BlockerBoard blockedItems={blockedItems} currentUserId={session.user.id} />
    </div>
  );
}

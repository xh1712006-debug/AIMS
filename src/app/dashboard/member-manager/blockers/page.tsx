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

      
      <BlockerBoard blockedItems={blockedItems} currentUserId={session.user.id} />
    </div>
  );
}

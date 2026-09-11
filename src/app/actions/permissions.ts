"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePermissions(changes: { role: string, feature: string, isEnabled: boolean }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  if (!changes || changes.length === 0) return { success: true };

  const rolesChanged = new Set<string>();

  // Use a transaction for bulk update
  await prisma.$transaction(
    changes.map(change => {
      rolesChanged.add(change.role);
      return prisma.rolePermission.upsert({
        where: {
          role_feature: {
            role: change.role as any,
            feature: change.feature,
          }
        },
        update: {
          isEnabled: change.isEnabled
        },
        create: {
          role: change.role as any,
          feature: change.feature,
          isEnabled: change.isEnabled
        }
      });
    })
  );

  // Update SystemState to invalidate sessions for affected roles
  const timestamp = new Date().toISOString();
  await prisma.$transaction(
    Array.from(rolesChanged).map(role => 
      prisma.systemState.upsert({
        where: { key: `lastPermissionUpdate_${role}` },
        update: { value: timestamp },
        create: { key: `lastPermissionUpdate_${role}`, value: timestamp }
      })
    )
  );

  revalidatePath('/dashboard/permissions');
  
  return { success: true, timestamp };
}

export async function togglePermission(role: string, feature: string, isEnabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  // Update or create the permission
  await prisma.rolePermission.upsert({
    where: {
      role_feature: {
        role: role as any,
        feature: feature,
      }
    },
    update: {
      isEnabled
    },
    create: {
      role: role as any,
      feature,
      isEnabled
    }
  });

  // Update SystemState to invalidate sessions for this role
  const timestamp = new Date().toISOString();
  await prisma.systemState.upsert({
    where: { key: `lastPermissionUpdate_${role}` },
    update: { value: timestamp },
    create: { key: `lastPermissionUpdate_${role}`, value: timestamp }
  });

  revalidatePath('/dashboard/permissions');
  
  return { success: true, timestamp };
}

export async function getPermissionUpdateTimestamp(role: string) {
  const state = await prisma.systemState.findUnique({
    where: { key: `lastPermissionUpdate_${role}` }
  });
  
  return state?.value || null;
}

'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function syncToGithub(token: string, repo: string, content: string, path: string) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  let sha = undefined;

  try {
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }
  } catch (error) {
    console.error("Error checking github file:", error);
  }

  const message = `Sync AIMS Check-in: ${path}`;
  const base64Content = Buffer.from(content).toString('base64');
  
  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: base64Content,
      sha
    })
  });

  if (!putRes.ok) {
    console.error("Failed to sync to github:", await putRes.text());
  }
}

export async function createCheckIn(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const doneTasks = formData.get('doneTasks') as string;
  const nextTasks = formData.get('nextTasks') as string;
  const blockers = formData.get('blockers') as string;
  const evidenceLink = formData.get('evidenceLink') as string;

  const project = await prisma.project.findFirst({
    where: { internId: session.user.id },
  });
  if (!project) throw new Error("No active project found");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  let riskStatus = 'GREEN';
  if (blockers && blockers.trim().length > 0) riskStatus = 'YELLOW';

  await prisma.checkIn.create({
    data: {
      projectId: project.id,
      doneTasks,
      nextTasks,
      blockers,
      evidenceLink,
      riskStatus: riskStatus as any,
    }
  });

  // Sync to GitHub if configured
  if (user?.githubToken && project.githubRepo) {
    const dateStr = new Date().toISOString().split('T')[0];
    const path = `check-ins/${dateStr}.md`;
    const content = `# Daily Check-in: ${dateStr}\n\n## DONE\n${doneTasks}\n\n## NEXT\n${nextTasks}\n\n## BLOCKERS\n${blockers || 'None'}\n\n## EVIDENCE\n${evidenceLink || 'None'}`;
    
    await syncToGithub(user.githubToken, project.githubRepo, content, path);
  }

  revalidatePath('/dashboard/check-ins');
  revalidatePath('/dashboard');
}

export async function createBacklog(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const priority = formData.get('priority') as string;

  const project = await prisma.project.findFirst({
    where: { internId: session.user.id },
  });

  if (!project) throw new Error("No active project found");

  await prisma.backlog.create({
    data: {
      projectId: project.id,
      title,
      type: type as any,
      priority: priority as any,
      status: 'TODO',
    }
  });

  revalidatePath('/dashboard/sprints');
  revalidatePath('/dashboard');
}

export async function saveSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const githubToken = formData.get('githubToken') as string;
  const githubRepo = formData.get('githubRepo') as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { githubToken }
  });

  const project = await prisma.project.findFirst({
    where: { internId: session.user.id }
  });

  if (project) {
    await prisma.project.update({
      where: { id: project.id },
      data: { githubRepo }
    });
  }

  revalidatePath('/dashboard/settings');
}

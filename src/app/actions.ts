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

  const projectId = formData.get('projectId') as string;
  if (!projectId) throw new Error("Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.internId !== session.user.id) throw new Error("No active project found or unauthorized");

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

export async function createWorkItem(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const priorityId = formData.get('priorityId') as string;
  const parentId = formData.get('parentId') as string || null;
  const sprintId = formData.get('sprintId') as string || null;

  const projectId = formData.get('projectId') as string;
  if (!projectId) throw new Error("Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.internId !== session.user.id) throw new Error("No active project found or unauthorized");

  await prisma.workItem.create({
    data: {
      projectId: project.id,
      title,
      type: type as any,
      priorityId: priorityId && priorityId !== "" ? priorityId : null,
      status: 'TODO',
      parentId: parentId && parentId !== "" ? parentId : null,
      sprintId: sprintId && sprintId !== "" ? sprintId : null,
    }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath('/dashboard');
}

export async function updateWorkItem(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const priorityId = formData.get('priorityId') as string;
  const status = formData.get('status') as string;
  const sprintId = formData.get('sprintId') as string || null;
  const parentId = formData.get('parentId') as string || null;
  const projectId = formData.get('projectId') as string;

  if (!id || !projectId) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  await prisma.workItem.update({
    where: { id },
    data: {
      title,
      type: type ? (type as any) : undefined,
      priorityId: priorityId ? priorityId : undefined,
      status: status ? (status as any) : undefined,
      sprintId: sprintId && sprintId !== "" ? sprintId : null,
      parentId: parentId && parentId !== "" ? parentId : null,
    }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath('/dashboard');
}

export async function assignWorkItemToSprint(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const sprintId = formData.get('sprintId') as string;
  const projectId = formData.get('projectId') as string;

  if (!id || !sprintId || !projectId) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  await prisma.workItem.update({
    where: { id },
    data: { sprintId }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath('/dashboard');
}

export async function removeWorkItemFromSprint(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const projectId = formData.get('projectId') as string;

  if (!id || !projectId) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  await prisma.workItem.update({
    where: { id },
    data: { sprintId: null }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath('/dashboard');
}

export async function deleteWorkItem(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const projectId = formData.get('projectId') as string;

  if (!id || !projectId) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  // First delete children if it's an epic (to prevent foreign key constraint fails)
  await prisma.workItem.deleteMany({
    where: { parentId: id }
  });

  // Delete the item
  await prisma.workItem.delete({
    where: { id }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath('/dashboard');
}

export async function createSprint(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);

  const projectId = formData.get('projectId') as string;
  if (!projectId) throw new Error("Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.internId !== session.user.id) throw new Error("No active project found or unauthorized");

  await prisma.sprint.create({
    data: {
      projectId: project.id,
      name,
      startDate,
      endDate,
    }
  });

  revalidatePath('/dashboard/sprints');
}

export async function updateSprint(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const projectId = formData.get('projectId') as string;

  if (!id || !projectId) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  await prisma.sprint.update({
    where: { id },
    data: {
      name,
      startDate,
      endDate,
    }
  });

  revalidatePath(`/dashboard/${projectId}/sprints`);
}

export async function deleteSprint(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const projectId = formData.get('projectId') as string;

  if (!id || !projectId) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  await prisma.sprint.delete({
    where: { id }
  });

  revalidatePath(`/dashboard/${projectId}/sprints`);
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

  const projectId = formData.get('projectId') as string;
  if (!projectId) throw new Error("Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (project && project.internId === session.user.id) {
    await prisma.project.update({
      where: { id: project.id },
      data: { githubRepo }
    });
  }

  revalidatePath(`/dashboard/${projectId}/settings`);
}

import bcrypt from 'bcryptjs';

export async function createInternAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'MENTOR') {
    throw new Error("Unauthorized: Only Mentors can create accounts");
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const passwordRaw = formData.get('password') as string;

  if (!name || !email || !passwordRaw) throw new Error("All fields are required");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email is already registered");

  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'INTERN'
    }
  });

  revalidatePath('/dashboard/interns');
}

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'MENTOR') {
    throw new Error("Unauthorized: Only Mentors can create projects");
  }

  const title = formData.get('title') as string;
  const track = formData.get('track') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const internId = formData.get('internId') as string;

  if (!internId) throw new Error("Intern ID is required");

  const project = await prisma.project.create({
    data: {
      internId,
      title,
      track: track as any,
      startDate,
      endDate,
    }
  });

  // Create default priority levels
  await prisma.priorityLevel.createMany({
    data: [
      { projectId: project.id, name: 'Cấp 0', level: 0, color: '#991b1b' },
      { projectId: project.id, name: 'Cấp 1', level: 1, color: '#ef4444' },
      { projectId: project.id, name: 'Cấp 2', level: 2, color: '#f59e0b' },
      { projectId: project.id, name: 'Cấp 3', level: 3, color: '#3b82f6' },
    ]
  });

  revalidatePath('/dashboard');
}

export async function addFeedback(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'MENTOR') {
    throw new Error("Unauthorized: Only Mentors can leave feedback");
  }

  const workItemId = formData.get('workItemId') as string;
  const feedback = formData.get('feedback') as string;
  const projectId = formData.get('projectId') as string;

  if (!workItemId || !feedback) throw new Error("Missing required fields");

  await prisma.workItem.update({
    where: { id: workItemId },
    data: {
      mentorFeedback: feedback,
      requiresFix: true,
      status: 'TODO', // Push back to TODO or leave it?
    }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath('/dashboard/mentor/feedbacks');
}

export async function resolveFeedback(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workItemId = formData.get('workItemId') as string;
  const projectId = formData.get('projectId') as string;

  if (!workItemId) throw new Error("Missing WorkItem ID");

  await prisma.workItem.update({
    where: { id: workItemId },
    data: {
      requiresFix: false,
      // Optional: don't erase the feedback so history is kept, or erase it. We will keep it but remove requiresFix flag.
    }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath('/dashboard/mentor/feedbacks');
}

export async function createPriorityLevel(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const projectId = formData.get('projectId') as string;
  const name = formData.get('name') as string;
  const level = parseInt(formData.get('level') as string, 10);
  const color = formData.get('color') as string;

  if (!projectId || !name || isNaN(level)) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  await prisma.priorityLevel.create({
    data: { projectId, name, level, color }
  });

  revalidatePath(`/dashboard/${projectId}/settings`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath(`/dashboard/${projectId}/work-items`);
}

export async function updatePriorityLevel(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const projectId = formData.get('projectId') as string;
  const name = formData.get('name') as string;
  const level = parseInt(formData.get('level') as string, 10);
  const color = formData.get('color') as string;

  if (!id || !projectId || !name || isNaN(level)) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  await prisma.priorityLevel.update({
    where: { id },
    data: { name, level, color }
  });

  revalidatePath(`/dashboard/${projectId}/settings`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath(`/dashboard/${projectId}/work-items`);
}

export async function deletePriorityLevel(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const projectId = formData.get('projectId') as string;

  if (!id || !projectId) throw new Error("Missing required fields");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.internId !== session.user.id) throw new Error("Unauthorized");

  // Cannot delete if in use, or set them to null.
  // We'll set to null first.
  await prisma.workItem.updateMany({
    where: { priorityId: id },
    data: { priorityId: null }
  });

  await prisma.priorityLevel.delete({
    where: { id }
  });

  revalidatePath(`/dashboard/${projectId}/settings`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath(`/dashboard/${projectId}/work-items`);
}

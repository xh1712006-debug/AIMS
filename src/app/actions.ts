'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SYSTEM_CONFIG } from "@/lib/config";

function isUserInProject(project: any, session: any) {
  if (!session?.user?.id) return false;
  if (session.user.role === 'ADMIN') return true;
  if (project.internId === session.user.id) return true;
  if (project.projectManagerId === session.user.id) return true;
  if (project.memberManagerId === session.user.id) return true;
  if (project.partnerId === session.user.id) return true;
  return false;
}


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
  const riskSelfAssessment = formData.get('riskSelfAssessment') as string | null;

  const projectId = formData.get('projectId') as string;
  if (!projectId) throw new Error("Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || !isUserInProject(project, session)) throw new Error("No active project found or unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // --- 1. Auto-Risk Calculation ---
  let riskStatus = 'GREEN';
  
  // Rule 1: Has blockers -> YELLOW
  if (blockers && blockers.trim().length > 0) {
    riskStatus = 'YELLOW';
  }

  // Rule 2: Near Deadline + Blockers -> RED
  // Find current active sprint to check deadline
  const currentSprint = await prisma.sprint.findFirst({
    where: {
      projectId: project.id,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() }
    }
  });

  if (currentSprint && blockers && blockers.trim().length > 0) {
    const daysUntilEnd = (currentSprint.endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    if (daysUntilEnd <= 2) {
      riskStatus = 'RED';
    }
  }

  // (Note: The "no activity > 4 or 7 days" is a separate cron/dashboard logic, 
  // but we enforce the blocker/deadline rules here upon check-in).

  await prisma.checkIn.create({
    data: {
      projectId: project.id,
      doneTasks,
      nextTasks,
      blockers,
      evidenceLink,
      riskStatus: riskStatus as any,
      riskSelfAssessment: (riskSelfAssessment && ['GREEN','YELLOW','RED'].includes(riskSelfAssessment))
        ? riskSelfAssessment as any
        : null,
    }
  });

  // --- 2. Mock GitHub Sync ---
  if (user?.githubToken && project.githubRepo) {
    const dateStr = new Date().toISOString().split('T')[0];
    const path = `check-ins/weekly-${dateStr}.md`;
    const content = [
      `# Weekly Check-in: ${dateStr}`,
      ``,
      `## DONE (Đã làm)`,
      doneTasks,
      ``,
      `## NEXT (Sẽ làm)`,
      nextTasks,
      ``,
      `## BLOCKERS (Khó khăn)`,
      blockers || 'None',
      ``,
      `## EVIDENCE (Minh chứng)`,
      evidenceLink || 'None',
      ``,
      `## RISK SELF-ASSESSMENT`,
      riskSelfAssessment || 'Not specified',
    ].join('\n');
    
    await syncToGithub(user.githubToken, project.githubRepo, content, path);
  }

  revalidatePath(`/dashboard/${projectId}/check-ins`);
  revalidatePath('/dashboard');
}

// ItemType permission matrix (theo chuẩn Excel Agile)
// PM/PO: Tạo Feature, Research, Experiment, Analysis (top-level work)
// Intern (Dev Team): Tạo Bug, Spike, Test, Documentation (granular tasks)
// MEMBER_MANAGER: Được tạo tất cả
const PM_TYPES = ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'];
const INTERN_TYPES = ['BUG', 'SPIKE', 'TEST', 'DOCUMENTATION'];

export async function createWorkItem(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  
  if (session.user.role === 'PROJECT_MANAGER' && !PM_TYPES.includes(type)) {
    throw new Error(`Project Manager chỉ có thể tạo: ${PM_TYPES.join(', ')}`);
  }

  if (session.user.role === 'INTERN' && !INTERN_TYPES.includes(type)) {
    throw new Error(`Intern chỉ có thể tạo: ${INTERN_TYPES.join(', ')}`);
  }
  const priorityId = formData.get('priorityId') as string;
  const parentId = formData.get('parentId') as string || null;
  const sprintId = formData.get('sprintId') as string || null;
  const dueDate = formData.get('dueDate') as string || null;

  const projectId = formData.get('projectId') as string;
  if (!projectId) throw new Error("Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || !isUserInProject(project, session)) throw new Error("No active project found or unauthorized");

  await prisma.workItem.create({
    data: {
      projectId: project.id,
      title,
      type: type as any,
      priorityId: priorityId && priorityId !== "" ? priorityId : null,
      status: 'TODO',
      parentId: parentId && parentId !== "" ? parentId : null,
      sprintId: sprintId && sprintId !== "" ? sprintId : null,
      dueDate: dueDate ? new Date(dueDate) : null,
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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

  const dueDate = formData.get('dueDate') as string || null;

  await prisma.workItem.update({
    where: { id },
    data: {
      title,
      type: type ? (type as any) : undefined,
      priorityId: priorityId ? priorityId : undefined,
      status: status ? (status as any) : undefined,
      sprintId: sprintId && sprintId !== "" ? sprintId : null,
      parentId: parentId && parentId !== "" ? parentId : null,
      dueDate: dueDate ? new Date(dueDate) : null,
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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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

  if (!project || !isUserInProject(project, session)) throw new Error("No active project found or unauthorized");

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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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

  // Verify GitHub connection if both are provided
  if (githubToken && githubRepo) {
    try {
      const res = await fetch(`https://api.github.com/repos/${githubRepo}`, {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });
      if (!res.ok) {
        return { success: false, message: "Lỗi kết nối: Token không hợp lệ hoặc không tìm thấy repo." };
      }
    } catch (error) {
      return { success: false, message: "Không thể kết nối tới GitHub. Vui lòng thử lại." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { githubToken }
  });

  const projectId = formData.get('projectId') as string;
  if (!projectId) throw new Error("Project ID is required");

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (project && (project.internId === session.user.id || project.projectManagerId === session.user.id)) {
    await prisma.project.update({
      where: { id: project.id },
      data: { githubRepo }
    });
  }

  revalidatePath(`/dashboard/${projectId}/settings`);
  return { 
    success: true, 
    message: githubToken ? "Đã xác thực và kết nối GitHub thành công!" : "Đã lưu cài đặt trống!" 
  };
}

import bcrypt from 'bcryptjs';

export async function createUserAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized: Only Admin can create accounts");
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const passwordRaw = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!name || !email || !passwordRaw || !role) throw new Error("All fields are required");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email is already registered");

  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role as any
    }
  });

  revalidatePath('/dashboard/users');
}

export async function assignMentorToIntern(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized: Only Admin can assign mentors");
  }

  const internId = formData.get('internId') as string;
  const projectManagerId = formData.get('projectManagerId') as string;

  if (!internId) throw new Error("Intern ID is required");

  await prisma.user.update({
    where: { id: internId },
    data: {
      projectManagerId: projectManagerId === 'none' || !projectManagerId ? null : projectManagerId
    }
  });

  revalidatePath('/dashboard/users');
}

export async function deleteUserAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized: Only Admin can delete accounts");
  }

  const id = formData.get('id') as string;
  if (!id) throw new Error("User ID is required");

  // Prevent admin from deleting themselves
  if (id === session.user.id) throw new Error("Cannot delete your own account");

  await prisma.user.delete({
    where: { id }
  });

  revalidatePath('/dashboard/users');
}

export async function deleteProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized: Only Admin can delete projects");
  }

  const id = formData.get('id') as string;
  if (!id) throw new Error("Project ID is required");

  await prisma.project.delete({
    where: { id }
  });

  revalidatePath('/dashboard/projects');
  revalidatePath('/dashboard');
}

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'PROJECT_MANAGER') {
    throw new Error("Unauthorized: Only Mentors can create projects");
  }

  const title = formData.get('title') as string;
  const track = formData.get('track') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const internId = formData.get('internId') as string;
  const memberManagerId = formData.get('memberManagerId') as string;
  const partnerId = formData.get('partnerId') as string;
  const generateTimeline = formData.get('generateTimeline') === 'true';

  if (!internId) throw new Error("Intern ID is required");

  const project = await prisma.project.create({
    data: {
      internId,
      projectManagerId: session.user.id,
      memberManagerId: memberManagerId ? memberManagerId : null,
      partnerId: partnerId ? partnerId : null,
      title,
      track: track as any,
      startDate,
      endDate,
    }
  });

  // Create default priority levels (MoSCoW)
  await prisma.priorityLevel.createMany({
    data: [
      { projectId: project.id, name: 'Must Have', level: 0, color: '#dc2626' }, // Red-600
      { projectId: project.id, name: 'Should Have', level: 1, color: '#ea580c' }, // Orange-600
      { projectId: project.id, name: 'Could Have', level: 2, color: '#eab308' }, // Yellow-500
      { projectId: project.id, name: 'Won\'t Have', level: 3, color: '#9ca3af' }, // Gray-400
    ]
  });

  if (generateTimeline) {
    // Rolling 10-week model (chuẩn Excel):
    // Week 1: Onboarding → Charter Approved
    // Week 2-3: Sprint 1, Week 4-5: Sprint 2, Week 6-7: Sprint 3, Week 8-9: Sprint 4
    // Week 10: Final Review
    const addWeeks = (date: Date, weeks: number): Date => {
      const d = new Date(date);
      d.setDate(d.getDate() + weeks * 7);
      return d;
    };

    const onboardingStart = new Date(startDate);
    const onboardingEnd  = addWeeks(onboardingStart, 1); // Week 1

    const s1Start = new Date(onboardingEnd);
    const s1End   = addWeeks(s1Start, SYSTEM_CONFIG.TIMELINE.STANDARD_SPRINT_WEEKS); // Week 2-3

    const s2Start = new Date(s1End);
    const s2End   = addWeeks(s2Start, SYSTEM_CONFIG.TIMELINE.STANDARD_SPRINT_WEEKS); // Week 4-5

    const s3Start = new Date(s2End);
    const s3End   = addWeeks(s3Start, SYSTEM_CONFIG.TIMELINE.STANDARD_SPRINT_WEEKS); // Week 6-7

    const s4Start = new Date(s3End);
    const s4End   = addWeeks(s4Start, SYSTEM_CONFIG.TIMELINE.STANDARD_SPRINT_WEEKS); // Week 8-9

    const finalStart = new Date(s4End);
    const finalEnd   = addWeeks(finalStart, SYSTEM_CONFIG.TIMELINE.FINAL_SPRINT_WEEKS); // Week 10

    await prisma.sprint.createMany({
      data: [
        { projectId: project.id, name: 'Onboarding',    startDate: onboardingStart, endDate: onboardingEnd },
        { projectId: project.id, name: 'Sprint 1',      startDate: s1Start,         endDate: s1End },
        { projectId: project.id, name: 'Sprint 2',      startDate: s2Start,         endDate: s2End },
        { projectId: project.id, name: 'Sprint 3',      startDate: s3Start,         endDate: s3End },
        { projectId: project.id, name: 'Sprint 4',      startDate: s4Start,         endDate: s4End },
        { projectId: project.id, name: 'Final Review',  startDate: finalStart,      endDate: finalEnd },
      ]
    });
  }

  revalidatePath('/dashboard');
}

export async function addFeedback(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'PROJECT_MANAGER') {
    throw new Error("Unauthorized: Only Mentors can leave feedback");
  }

  const workItemId = formData.get('workItemId') as string;
  const feedback = formData.get('feedback') as string;
  const projectId = formData.get('projectId') as string;

  if (!workItemId || !feedback) throw new Error("Missing required fields");

  await prisma.workItem.update({
    where: { id: workItemId },
    data: {
      managerFeedback: feedback,
      requiresFix: true,
      status: 'TODO', // Push back to TODO or leave it?
    }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath('/dashboard/project-manager/feedbacks');
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
  revalidatePath('/dashboard/project-manager/feedbacks');
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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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
  if (!project || !isUserInProject(project, session)) throw new Error("Unauthorized");

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

export async function updateProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'PROJECT_MANAGER') {
    throw new Error("Unauthorized: Only Mentors can update projects");
  }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const track = formData.get('track') as string;
  const internId = formData.get('internId') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const manualRisk = formData.get('manualRisk') as string;
  const status = formData.get('status') as string;

  if (!id || !title || !internId) throw new Error("Missing required fields");

  await prisma.project.update({
    where: { id },
    data: {
      title,
      track: track ? (track as any) : undefined,
      internId,
      ...(startDateStr ? { startDate: new Date(startDateStr) } : {}),
      ...(endDateStr ? { endDate: new Date(endDateStr) } : {}),
      manualRisk: manualRisk === 'NONE' || !manualRisk ? null : (manualRisk as any),
      ...(status ? { status: status as any } : {}),
    }
  });

  revalidatePath('/dashboard/project-manager/projects');
  revalidatePath('/dashboard/project-manager/projects');
  revalidatePath('/dashboard');
}

export async function updateCheckInMentorAction(id: string, managerAction: string, projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PROJECT_MANAGER') throw new Error("Unauthorized");
  await prisma.checkIn.update({
    where: { id },
    data: { managerAction }
  });
  revalidatePath(`/dashboard/${projectId}/check-ins`);
}

export async function saveSprintReview(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PROJECT_MANAGER') throw new Error("Unauthorized");

  const sprintId = formData.get('sprintId') as string;
  const projectId = formData.get('projectId') as string;
  const goalResult = formData.get('goalResult') as string;
  
  if (!sprintId || !projectId || !goalResult) throw new Error("Missing required fields");

  const data = {
    sprintId,
    goalResult,
    increment: formData.get('increment') as string,
    technicalFinds: formData.get('technicalFinds') as string,
    keep: formData.get('keep') as string,
    problem: formData.get('problem') as string,
    tryItem: formData.get('tryItem') as string,
    managerFeedback: formData.get('managerFeedback') as string,
  };

  await prisma.sprintReview.upsert({
    where: { sprintId },
    create: data,
    update: data,
  });

  revalidatePath(`/dashboard/${projectId}/sprints`);
}

export async function addWorkItemComment(workItemId: string, text: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.comment.create({
    data: {
      text,
      authorId: session.user.id,
      workItemId,
    }
  });

  revalidatePath('/dashboard/[projectId]/work-items', 'layout');
}

export async function updateWorkItemStatus(id: string, newStatus: string, projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Unauthorized");

  const workItem = await prisma.workItem.findUnique({ where: { id } });
  if (!workItem) throw new Error("WorkItem not found");

  const updateData: any = { status: newStatus };

  if (newStatus === 'IN_PROGRESS' && !workItem.startedAt) {
    updateData.startedAt = new Date();
  }

  if (newStatus === 'DONE') {
    updateData.completedAt = new Date();
  } else if (workItem.status === 'DONE' && newStatus !== 'DONE') {
    updateData.completedAt = null;
  }

  await prisma.workItem.update({
    where: { id },
    data: updateData
  });

  // Auto-update Epic status if this is a child item
  if (workItem.parentId) {
    const parentId = workItem.parentId;
    const allSiblings = await prisma.workItem.findMany({
      where: { parentId }
    });
    const parentEpic = await prisma.workItem.findUnique({ where: { id: parentId } });
    
    if (parentEpic && ['FEATURE', 'RESEARCH', 'EXPERIMENT', 'ANALYSIS'].includes(parentEpic.type) && allSiblings.length > 0) {
      const allDone = allSiblings.every(s => s.status === 'DONE');
      const allTodo = allSiblings.every(s => s.status === 'TODO');
      
      let newParentStatus = parentEpic.status;
      if (allDone) {
        newParentStatus = 'DONE';
      } else if (allTodo) {
        newParentStatus = 'TODO';
      } else {
        newParentStatus = 'IN_PROGRESS';
      }

      if (newParentStatus !== parentEpic.status) {
        const updateEpicData: any = { status: newParentStatus };
        if (newParentStatus === 'IN_PROGRESS' && !parentEpic.startedAt) updateEpicData.startedAt = new Date();
        if (newParentStatus === 'DONE') updateEpicData.completedAt = new Date();
        else if (parentEpic.status === 'DONE') updateEpicData.completedAt = null;

        await prisma.workItem.update({
          where: { id: parentId },
          data: updateEpicData
        });
      }
    }
  }

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath(`/dashboard/${projectId}/sprints`);
}

export async function updateWorkItemOrder(id: string, newOrder: number, sprintId: string | null, projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.workItem.update({
    where: { id },
    data: { 
      order: newOrder,
      sprintId: sprintId // Cho phép kéo thả chuyển sprint hoặc đưa về backlog
    }
  });

  revalidatePath(`/dashboard/${projectId}/sprints`);
  revalidatePath(`/dashboard/${projectId}/work-items`);
}

// Mark a task as acknowledged by PM (toggle on/off)
export async function markTaskAcknowledged(workItemId: string, projectId: string, acknowledged: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (session.user.role !== 'PROJECT_MANAGER' && session.user.role !== 'ADMIN') throw new Error('Unauthorized role');

  await prisma.workItem.update({
    where: { id: workItemId },
    data: {
      managerFeedback: acknowledged
        ? `[PM_ACK] \u0110\u00e3 xem x\u00e9t v\u00e0 x\u1eed l\u00fd b\u1edfi ${session.user.name || session.user.email}`
        : null,
    }
  });

  revalidatePath(`/dashboard/${projectId}/work-items`);
  revalidatePath(`/dashboard/project-manager/inbox`);
  revalidatePath(`/dashboard`);
}

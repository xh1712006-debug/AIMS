import { Risk } from '@prisma/client';
import { SYSTEM_CONFIG } from './config';

export type ProjectForRisk = {
  manualRisk?: Risk | null;
  startDate: Date;
  endDate: Date;
  workItems?: { status: string }[];
  checkIns?: { createdAt: Date; blockers?: string | null }[];
};

export function calculateProjectRisk(project: ProjectForRisk): Risk {
  // 1. Manual Risk Overrides everything
  if (project.manualRisk) {
    return project.manualRisk;
  }

  const now = new Date();
  const checkIns = project.checkIns || [];
  const workItems = project.workItems || [];

  // 2. Inactive check: No check-ins yet
  if (checkIns.length === 0) {
    const daysSinceStart = (now.getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart >= SYSTEM_CONFIG.RISK_ALERTS.INACTIVE_CRITICAL_DAYS) {
      return Risk.RED;
    }
    if (daysSinceStart >= SYSTEM_CONFIG.RISK_ALERTS.INACTIVE_WARNING_DAYS) {
      return Risk.YELLOW;
    }
    return Risk.GREEN;
  }

  // 3. Inactive check: Too long since last check-in
  const latestCheckIn = checkIns[0]; // Assuming they are ordered by desc
  const daysSinceLastCheckIn = (now.getTime() - new Date(latestCheckIn.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastCheckIn >= SYSTEM_CONFIG.RISK_ALERTS.INACTIVE_CRITICAL_DAYS) {
    return Risk.RED;
  }
  if (daysSinceLastCheckIn >= SYSTEM_CONFIG.RISK_ALERTS.INACTIVE_WARNING_DAYS) {
    return Risk.YELLOW;
  }

  // 4. Milestone Check (Progress vs Time) & Blocker Milestone Warning
  const totalDays = (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed = (now.getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24);
  const daysToDeadline = totalDays - daysPassed;
  const hasBlocker = latestCheckIn.blockers && latestCheckIn.blockers.trim().length > 0;

  // New Rule: Milestone Warning (<= 2 days to deadline + has Blocker)
  if (daysToDeadline >= 0 && daysToDeadline <= SYSTEM_CONFIG.RISK_ALERTS.MILESTONE_WARNING_DAYS && hasBlocker) {
    return Risk.RED; // Critical alert if almost at deadline and still blocked
  }

  // 5. Blockers in latest check-in
  if (hasBlocker) {
    return Risk.YELLOW;
  }
  
  // Prevent division by zero or negative days
  const percentTimePassed = totalDays > 0 ? Math.max(0, Math.min(1, daysPassed / totalDays)) : 0;

  const totalItems = workItems.length;
  const doneItems = workItems.filter(wi => wi.status === 'DONE').length;
  const percentDone = totalItems > 0 ? doneItems / totalItems : 0;

  if (percentTimePassed > percentDone + 0.4) {
    return Risk.RED;
  }
  if (percentTimePassed > percentDone + 0.2) {
    return Risk.YELLOW;
  }

  return Risk.GREEN;
}

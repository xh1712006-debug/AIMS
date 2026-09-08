export type PendingAction = {
  id: string;
  type: 'MISSING_CHECKIN' | 'BLOCKED_TASK' | 'PENDING_REVIEW';
  title: string;
  internName: string;
  projectId: string;
  urgency: 'high' | 'medium';
  link: string;
  createdAt: Date;
};

export type ResolvedAction = {
  id: string;
  type: 'RESOLVED_CHECKIN' | 'RESOLVED_TASK';
  title: string;
  internName: string;
  projectId: string;
  link: string;
  resolvedAt: Date;
};

export function getPendingActions(interns: any[]): PendingAction[] {
  const pendingActions: PendingAction[] = [];
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  interns.forEach(intern => {
    intern.projects.forEach((p: any) => {
      // 1. Missing check-ins
      if (p.checkIns.length > 0) {
        const lastCheckInDate = new Date(p.checkIns[0].createdAt);
        if (lastCheckInDate < twoDaysAgo) {
          pendingActions.push({
            id: `chk-${p.id}`,
            type: 'MISSING_CHECKIN',
            title: `Chưa Check-in (>2 ngày)`,
            internName: intern.name || intern.email,
            projectId: p.id,
            urgency: 'medium',
            link: `/dashboard/${p.id}/check-ins`,
            createdAt: lastCheckInDate
          });
        }
      } else {
        // No checkins at all
        const startDate = new Date(p.startDate);
        if (startDate < twoDaysAgo) {
          pendingActions.push({
            id: `chk-none-${p.id}`,
            type: 'MISSING_CHECKIN',
            title: `Chưa có Check-in nào`,
            internName: intern.name || intern.email,
            projectId: p.id,
            urgency: 'high',
            link: `/dashboard/${p.id}/check-ins`,
            createdAt: startDate
          });
        }
      }

      // 2. Blocked or Pending Review Tasks
      p.workItems?.forEach((wi: any) => {
        if (wi.status === 'BLOCKED') {
          pendingActions.push({
            id: `wi-${wi.id}`,
            type: 'BLOCKED_TASK',
            title: `Task kẹt: ${wi.title}`,
            internName: intern.name || intern.email,
            projectId: p.id,
            urgency: 'high',
            link: `/dashboard/${p.id}/work-items`,
            createdAt: new Date(wi.updatedAt || wi.createdAt)
          });
        } else if (wi.status === 'REVIEW') {
          pendingActions.push({
            id: `wi-${wi.id}`,
            type: 'PENDING_REVIEW',
            title: `Chờ Review: ${wi.title}`,
            internName: intern.name || intern.email,
            projectId: p.id,
            urgency: 'medium',
            link: `/dashboard/${p.id}/work-items`,
            createdAt: new Date(wi.updatedAt || wi.createdAt)
          });
        }
      });
    });
  });

  return pendingActions.sort((a, b) => {
    if (a.urgency !== b.urgency) return a.urgency === 'high' ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function getResolvedActions(interns: any[]): ResolvedAction[] {
  const resolvedActions: ResolvedAction[] = [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  interns.forEach(intern => {
    intern.projects.forEach((p: any) => {
      // Recent Check-ins (within 7 days)
      p.checkIns?.forEach((chk: any) => {
        const chkDate = new Date(chk.createdAt);
        if (chkDate > sevenDaysAgo) {
          resolvedActions.push({
            id: `chk-res-${chk.id}`,
            type: 'RESOLVED_CHECKIN',
            title: `Đã nộp báo cáo Check-in`,
            internName: intern.name || intern.email,
            projectId: p.id,
            link: `/dashboard/${p.id}/check-ins`,
            resolvedAt: chkDate
          });
        }
      });

      // Recently Done Tasks (within 7 days)
      p.workItems?.forEach((wi: any) => {
        if (wi.status === 'DONE') {
          const updatedAt = new Date(wi.updatedAt || wi.createdAt);
          if (updatedAt > sevenDaysAgo) {
            resolvedActions.push({
              id: `wi-res-${wi.id}`,
              type: 'RESOLVED_TASK',
              title: `Đã hoàn thành: ${wi.title}`,
              internName: intern.name || intern.email,
              projectId: p.id,
              link: `/dashboard/${p.id}/work-items`,
              resolvedAt: updatedAt
            });
          }
        }
      });
    });
  });

  return resolvedActions.sort((a, b) => b.resolvedAt.getTime() - a.resolvedAt.getTime());
}

export const SYSTEM_CONFIG = {
  TIMELINE: {
    TOTAL_DURATION_WEEKS: 10,
    STANDARD_SPRINT_WEEKS: 2,
    FINAL_SPRINT_WEEKS: 1
  },
  RISK_ALERTS: {
    INACTIVE_WARNING_DAYS: 4, // 4 ngày không check-in -> YELLOW
    INACTIVE_CRITICAL_DAYS: 7, // 7 ngày không check-in -> RED
    MILESTONE_WARNING_DAYS: 2 // Cách hạn chót <= 2 ngày mà vẫn vướng Blocker -> Cảnh báo
  }
};

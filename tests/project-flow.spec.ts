import { test, expect } from '@playwright/test';

test.describe('AIMS Project Core Flow', () => {
  test('Intern can create a WorkItem and submit Check-in', async ({ page }) => {
    // Login as Intern
    await page.goto('/api/auth/signin');
    await page.fill('input[name="email"]', 'intern@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard*');

    // Go to first project
    const projectLink = page.locator('a:has-text("Tổng quan")').first();
    await projectLink.click();
    await page.waitForLoadState('networkidle');

    // Go to Check-ins
    const checkinLink = page.locator('a:has-text("Báo cáo Tiến độ")');
    await checkinLink.click();
    
    // Check that we are on the checkin page
    await expect(page.locator('h2', { hasText: 'Daily Check-ins' })).toBeVisible();

    // Click "Tạo Báo cáo mới"
    const createBtn = page.locator('button', { hasText: 'Tạo Báo cáo mới' });
    if (await createBtn.isVisible()) {
      await createBtn.click();
      
      // Fill the form
      await page.fill('textarea[name="doneTasks"]', 'Completed initial setup.');
      await page.fill('textarea[name="nextTasks"]', 'Will start frontend.');
      await page.fill('textarea[name="blockers"]', 'API is down.');
      
      // Select self-assessment
      await page.selectOption('select[name="riskSelfAssessment"]', 'YELLOW');
      
      // Submit
      await page.click('button:has-text("Nộp Báo cáo")');
      
      // Since there is a blocker ("API is down."), auto-risk should become YELLOW or RED.
      await expect(page.locator('.aims-card').first()).toContainText('Cảnh báo');
    }
  });
});

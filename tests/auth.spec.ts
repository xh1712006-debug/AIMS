import { test, expect } from '@playwright/test';

test.describe('Authentication and Role Access', () => {
  test('Admin can login and see Admin Dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/api/auth/signin');
    
    // Fill credentials (using the seeded admin)
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    
    // Check if the dashboard shows "Administrator"
    await expect(page.locator('text=Administrator')).toBeVisible();
    
    // Admin should see User Management link
    await expect(page.locator('text=Quản lý Tài khoản')).toBeVisible();
  });

  test('Intern can login and see Intern Dashboard', async ({ page }) => {
    // We will use the seeded intern (intern1@aims.com)
    await page.goto('/api/auth/signin');
    await page.fill('input[name="email"]', 'intern@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    await expect(page.getByText('Test Intern').first()).toBeVisible();
  });
});

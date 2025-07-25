import { expect, test } from '@playwright/test';

test.describe('User Management', () => {
  // Mock admin user login
  test.beforeEach(async ({ page }) => {
    // Mock the API responses for admin user
    await page.route('**/api/v1/users/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          nickname: 'Administrator',
          role: 'admin',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-01T00:00:00Z',
        }),
      });
    });

    // Mock user list API
    await page.route('**/api/v1/users**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                nickname: 'Administrator',
                role: 'admin',
                status: 'active',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                last_login: '2024-01-01T00:00:00Z',
              },
              {
                id: 2,
                username: 'testuser',
                email: 'test@example.com',
                nickname: 'Test User',
                role: 'user',
                status: 'active',
                created_at: '2024-01-02T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
                last_login: '2024-01-02T00:00:00Z',
              },
            ],
            page: 1,
            size: 10,
            total: 2,
          }),
        });
      }
    });

    // Set up mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-admin-token');
    });

    // Set initial state for admin user
    await page.addInitScript(() => {
      window.__INITIAL_STATE__ = {
        currentUser: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          nickname: 'Administrator',
          role: 'admin',
          status: 'active',
        },
      };
    });
  });

  test('should display user management page for admin', async ({ page }) => {
    await page.goto('/admin/users');

    // Check if user management page is visible
    await expect(page.locator('text=用户管理')).toBeVisible();

    // Check if table headers are visible
    await expect(page.locator('text=用户名')).toBeVisible();
    await expect(page.locator('text=邮箱')).toBeVisible();
    await expect(page.locator('text=角色')).toBeVisible();
    await expect(page.locator('text=状态')).toBeVisible();
    await expect(page.locator('text=操作')).toBeVisible();
  });

  test('should display user list in table', async ({ page }) => {
    await page.goto('/admin/users');

    // Wait for table to load
    await page.waitForSelector('table');

    // Check if users are displayed
    await expect(page.locator('text=admin')).toBeVisible();
    await expect(page.locator('text=testuser')).toBeVisible();
    await expect(page.locator('text=admin@example.com')).toBeVisible();
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  test('should display role tags correctly', async ({ page }) => {
    await page.goto('/admin/users');

    // Wait for table to load
    await page.waitForSelector('table');

    // Check role tags
    await expect(
      page.locator('.ant-tag').filter({ hasText: '管理员' }),
    ).toBeVisible();
    await expect(
      page.locator('.ant-tag').filter({ hasText: '用户' }),
    ).toBeVisible();
  });

  test('should display status tags correctly', async ({ page }) => {
    await page.goto('/admin/users');

    // Wait for table to load
    await page.waitForSelector('table');

    // Check status tags
    await expect(
      page.locator('.ant-tag').filter({ hasText: '正常' }),
    ).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/admin/users');

    // Check if search input is visible
    await expect(page.locator('input[placeholder*="用户名"]')).toBeVisible();

    // Check if search button is visible
    await expect(
      page.locator('button').filter({ hasText: '搜索' }),
    ).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    await page.goto('/admin/users');

    // Check if refresh button is visible
    await expect(
      page.locator('button').filter({ hasText: '刷新' }),
    ).toBeVisible();
  });

  test('should show delete button for regular users', async ({ page }) => {
    await page.goto('/admin/users');

    // Wait for table to load
    await page.waitForSelector('table');

    // Check if delete buttons are present
    const deleteButtons = page.locator('button').filter({ hasText: '删除' });
    await expect(deleteButtons).toHaveCount(1); // Only one delete button (for testuser, not admin)
  });

  test('should show pagination', async ({ page }) => {
    await page.goto('/admin/users');

    // Wait for table to load
    await page.waitForSelector('table');

    // Check if pagination is visible
    await expect(page.locator('.ant-pagination')).toBeVisible();
    await expect(page.locator('text=第 1-2 条/总共 2 条')).toBeVisible();
  });

  test('should handle delete user confirmation', async ({ page }) => {
    // Mock delete API
    await page.route('**/api/v1/users/2', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: '删除用户成功' }),
        });
      }
    });

    await page.goto('/admin/users');

    // Wait for table to load
    await page.waitForSelector('table');

    // Click delete button for testuser
    await page.click('button:has-text("删除")');

    // Check if confirmation dialog appears
    await expect(page.locator('text=确定要删除这个用户吗？')).toBeVisible();
    await expect(
      page.locator('text=删除后无法恢复，请谨慎操作。'),
    ).toBeVisible();

    // Check if confirm and cancel buttons are visible
    await expect(page.locator('button:has-text("确定")')).toBeVisible();
    await expect(page.locator('button:has-text("取消")')).toBeVisible();
  });
});

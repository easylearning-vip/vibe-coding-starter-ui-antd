import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/user/login');

    // Check if login form is visible
    await expect(page.locator('text=Vibe Coding Admin')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display registration page', async ({ page }) => {
    await page.goto('/user/register');

    // Check if registration form is visible
    await expect(page.locator('text=用户注册')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[name="nickname"]')).toBeVisible();
  });

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/user/login');

    // Click register link
    await page.click('text=注册账户');

    // Should be on register page
    await expect(page).toHaveURL('/user/register');
    await expect(page.locator('text=用户注册')).toBeVisible();
  });

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/user/register');

    // Click login link
    await page.click('text=已有账户？立即登录');

    // Should be on login page
    await expect(page).toHaveURL('/user/login');
    await expect(page.locator('text=Vibe Coding Admin')).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({
    page,
  }) => {
    await page.goto('/user/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=邮箱是必填项！')).toBeVisible();
    await expect(page.locator('text=密码是必填项！')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/user/login');

    // Fill invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should show email validation error
    await expect(page.locator('text=请输入有效的邮箱地址！')).toBeVisible();
  });

  test('should show validation errors for empty registration form', async ({
    page,
  }) => {
    await page.goto('/user/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=用户名是必填项！')).toBeVisible();
    await expect(page.locator('text=邮箱是必填项！')).toBeVisible();
    await expect(page.locator('text=密码是必填项！')).toBeVisible();
  });

  test('should show password confirmation error', async ({ page }) => {
    await page.goto('/user/register');

    // Fill form with mismatched passwords
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different123');
    await page.click('button[type="submit"]');

    // Should show password mismatch error
    await expect(page.locator('text=两次输入的密码不一致！')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({
    page,
  }) => {
    await page.goto('/admin/users');

    // Should be redirected to login
    await expect(page).toHaveURL('/user/login');
  });
});

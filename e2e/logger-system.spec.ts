import { expect, type Page, test } from '@playwright/test';

/**
 * 日志系统测试
 * 验证前端Console日志和后台API日志是否符合预期
 */

// 辅助函数：收集控制台日志
async function collectConsoleLogs(page: Page) {
  const logs: Array<{ type: string; text: string; timestamp: number }> = [];

  page.on('console', (msg) => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now(),
    });
  });

  return logs;
}

// 辅助函数：等待并检查日志
async function waitForLogMessage(
  logs: Array<{ type: string; text: string; timestamp: number }>,
  pattern: string | RegExp,
  timeout = 5000,
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const found = logs.find((log) => {
      if (typeof pattern === 'string') {
        return log.text.includes(pattern);
      } else {
        return pattern.test(log.text);
      }
    });

    if (found) {
      return found;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Log message not found: ${pattern}`);
}

test.describe('Logger System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置开发环境，启用debug日志
    await page.addInitScript(() => {
      localStorage.setItem('vibe_log_level', 'debug');
      localStorage.setItem('vibe_log_console', 'true');
    });
  });

  test('应用启动时的日志记录', async ({ page }) => {
    const logs = await collectConsoleLogs(page);

    // 访问首页
    await page.goto('/');

    // 等待应用初始化
    await page.waitForTimeout(2000);

    // 检查应用启动日志
    await waitForLogMessage(logs, 'Application starting...');

    // 检查日志格式是否正确（包含时间戳、级别等）
    const startupLog = logs.find((log) =>
      log.text.includes('Application starting...'),
    );
    expect(startupLog).toBeTruthy();
    expect(startupLog?.text).toMatch(/\[Vibe-Dev\]/); // 包含前缀
    expect(startupLog?.text).toMatch(/\[INFO\]/); // 包含级别
  });

  test('用户注册流程的日志记录', async ({ page }) => {
    const logs = await collectConsoleLogs(page);

    // 访问注册页面
    await page.goto('/user/register');

    // 填写注册表单
    await page.fill('input[name="username"]', 'testuser123');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirm"]', 'password123');
    await page.fill('input[name="nickname"]', 'Test User');

    // 提交注册表单
    await page.click('button[type="submit"]');

    // 等待注册请求完成
    await page.waitForTimeout(3000);

    // 检查注册相关的日志
    await waitForLogMessage(logs, /User registration attempt/);

    const registrationLog = logs.find((log) =>
      log.text.includes('User registration attempt'),
    );
    expect(registrationLog).toBeTruthy();
    expect(registrationLog?.text).toMatch(/\[DEBUG\]/);
    expect(registrationLog?.text).toContain('testuser123');
  });

  test('用户登录流程的日志记录', async ({ page }) => {
    const logs = await collectConsoleLogs(page);

    // 访问登录页面
    await page.goto('/user/login');

    // 填写登录表单（使用用户名登录）
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');

    // 提交登录表单
    await page.click('button[type="submit"]');

    // 等待登录请求完成
    await page.waitForTimeout(3000);

    // 检查登录相关的日志
    await waitForLogMessage(logs, /User login attempt/);

    const loginAttemptLog = logs.find((log) =>
      log.text.includes('User login attempt'),
    );
    expect(loginAttemptLog).toBeTruthy();
    expect(loginAttemptLog?.text).toMatch(/\[DEBUG\]/);
    expect(loginAttemptLog?.text).toContain('admin');

    // 检查是否有登录成功或失败的日志
    const hasSuccessLog = logs.some((log) =>
      log.text.includes('Login successful'),
    );
    const hasErrorLog = logs.some((log) => log.text.includes('Login failed'));

    expect(hasSuccessLog || hasErrorLog).toBeTruthy();
  });

  test('网络请求错误的日志记录', async ({ page }) => {
    const logs = await collectConsoleLogs(page);

    // 访问登录页面
    await page.goto('/user/login');

    // 使用错误的凭据登录
    await page.fill('input[name="username"]', 'nonexistent');
    await page.fill('input[name="password"]', 'wrongpassword');

    // 提交登录表单
    await page.click('button[type="submit"]');

    // 等待请求完成
    await page.waitForTimeout(3000);

    // 检查错误日志
    await waitForLogMessage(logs, /Login failed/);

    const errorLog = logs.find((log) => log.text.includes('Login failed'));
    expect(errorLog).toBeTruthy();
    expect(errorLog?.text).toMatch(/\[ERROR\]/);
  });

  test('日志级别控制功能', async ({ page }) => {
    const logs = await collectConsoleLogs(page);

    // 访问首页
    await page.goto('/');

    // 等待应用加载
    await page.waitForTimeout(2000);

    // 在开发环境下应该能看到日志控制组件
    const loggerControl = page.locator('text=Logger');
    await expect(loggerControl).toBeVisible();

    // 点击日志控制组件
    await loggerControl.click();

    // 检查日志控制面板是否显示
    const controlPanel = page.locator('text=Logger Control');
    await expect(controlPanel).toBeVisible();

    // 测试日志级别切换
    const levelSelect = page.locator('select').first();
    await levelSelect.selectOption('WARN');

    // 点击测试日志按钮
    await page.click('text=Test Logs');

    // 等待日志生成
    await page.waitForTimeout(1000);

    // 检查只有WARN和ERROR级别的日志被输出
    const debugLogs = logs.filter(
      (log) =>
        log.text.includes('[DEBUG]') && log.timestamp > Date.now() - 2000,
    );
    const warnLogs = logs.filter(
      (log) => log.text.includes('[WARN]') && log.timestamp > Date.now() - 2000,
    );

    expect(debugLogs.length).toBe(0); // DEBUG日志应该被过滤
    expect(warnLogs.length).toBeGreaterThan(0); // WARN日志应该存在
  });

  test('日志格式验证', async ({ page }) => {
    const logs = await collectConsoleLogs(page);

    // 访问首页
    await page.goto('/');

    // 等待应用初始化
    await page.waitForTimeout(2000);

    // 检查日志格式
    const appLogs = logs.filter((log) => log.text.includes('[Vibe-Dev]'));

    expect(appLogs.length).toBeGreaterThan(0);

    // 验证日志格式：[前缀] 时间戳 [级别] 消息
    appLogs.forEach((log) => {
      expect(log.text).toMatch(/\[Vibe-Dev\]/); // 前缀
      expect(log.text).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // 时间戳
      expect(log.text).toMatch(/\[(DEBUG|INFO|WARN|ERROR)\]/); // 级别
    });
  });

  test('生产环境日志禁用', async ({ page }) => {
    // 模拟生产环境
    await page.addInitScript(() => {
      // 覆盖环境变量
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'production' },
        writable: false,
      });
    });

    const logs = await collectConsoleLogs(page);

    // 访问首页
    await page.goto('/');

    // 等待应用初始化
    await page.waitForTimeout(2000);

    // 在生产环境下，应用日志应该被禁用
    const appLogs = logs.filter((log) => log.text.includes('[Vibe-Prod]'));

    // 生产环境下日志应该被禁用或数量很少
    expect(appLogs.length).toBeLessThanOrEqual(1);
  });
});

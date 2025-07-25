import { expect, test } from '@playwright/test';

/**
 * API日志系统测试
 * 验证后端API日志输出是否符合预期
 */

test.describe('API Logger System Tests', () => {
  let apiLogs: string[] = [];

  test.beforeAll(async () => {
    // 这里可以启动后端服务并收集日志
    // 实际项目中可能需要通过docker或其他方式启动后端服务
    console.log('Setting up API server for logging tests...');
  });

  test.beforeEach(async ({ page }) => {
    // 监听网络请求
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();

      console.log(`API Request: ${method} ${url} - Status: ${status}`);

      // 记录API响应信息
      if (url.includes('/api/v1/')) {
        apiLogs.push(`${method} ${url} - ${status}`);
      }
    });

    // 设置开发环境
    await page.addInitScript(() => {
      localStorage.setItem('vibe_log_level', 'debug');
      localStorage.setItem('vibe_log_console', 'true');
    });
  });

  test('用户注册API日志验证', async ({ page }) => {
    // 访问注册页面
    await page.goto('/user/register');

    // 填写注册表单
    await page.fill('input[name="username"]', `testuser_${Date.now()}`);
    await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirm"]', 'password123');
    await page.fill('input[name="nickname"]', 'Test User');

    // 提交注册表单
    await page.click('button[type="submit"]');

    // 等待API请求完成
    await page.waitForTimeout(3000);

    // 验证注册API被调用
    const registerApiCall = apiLogs.find(
      (log) => log.includes('POST') && log.includes('/api/v1/users/register'),
    );

    expect(registerApiCall).toBeTruthy();
    console.log('Registration API call logged:', registerApiCall);
  });

  test('用户登录API日志验证', async ({ page }) => {
    // 访问登录页面
    await page.goto('/user/login');

    // 填写登录表单（使用用户名）
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');

    // 提交登录表单
    await page.click('button[type="submit"]');

    // 等待API请求完成
    await page.waitForTimeout(3000);

    // 验证登录API被调用
    const loginApiCall = apiLogs.find(
      (log) => log.includes('POST') && log.includes('/api/v1/users/login'),
    );

    expect(loginApiCall).toBeTruthy();
    console.log('Login API call logged:', loginApiCall);
  });

  test('用户资料获取API日志验证', async ({ page }) => {
    // 先登录
    await page.goto('/user/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 等待登录完成并跳转
    await page.waitForTimeout(3000);

    // 访问需要认证的页面，触发用户资料获取
    await page.goto('/');

    // 等待用户资料API调用
    await page.waitForTimeout(2000);

    // 验证用户资料API被调用
    const profileApiCall = apiLogs.find(
      (log) => log.includes('GET') && log.includes('/api/v1/users/profile'),
    );

    expect(profileApiCall).toBeTruthy();
    console.log('Profile API call logged:', profileApiCall);
  });

  test('API错误响应日志验证', async ({ page }) => {
    // 访问登录页面
    await page.goto('/user/login');

    // 使用错误的凭据
    await page.fill('input[name="username"]', 'nonexistent');
    await page.fill('input[name="password"]', 'wrongpassword');

    // 提交登录表单
    await page.click('button[type="submit"]');

    // 等待API请求完成
    await page.waitForTimeout(3000);

    // 验证登录API返回错误状态码
    const errorApiCall = apiLogs.find(
      (log) =>
        log.includes('POST') &&
        log.includes('/api/v1/users/login') &&
        (log.includes('401') || log.includes('400')),
    );

    expect(errorApiCall).toBeTruthy();
    console.log('Error API call logged:', errorApiCall);
  });

  test('API请求头验证', async ({ page }) => {
    let authHeaderFound = false;

    // 监听请求头
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/v1/users/profile')) {
        const authHeader = request.headers().authorization;
        if (authHeader?.startsWith('Bearer ')) {
          authHeaderFound = true;
          console.log(
            'Authorization header found:',
            `${authHeader.substring(0, 20)}...`,
          );
        }
      }
    });

    // 先登录获取token
    await page.goto('/user/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 等待登录完成
    await page.waitForTimeout(3000);

    // 访问需要认证的页面
    await page.goto('/');

    // 等待认证请求
    await page.waitForTimeout(2000);

    // 验证Authorization头是否正确设置
    expect(authHeaderFound).toBeTruthy();
  });

  test('API响应时间监控', async ({ page }) => {
    const responseTimes: { url: string; time: number }[] = [];

    // 监听响应时间
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/v1/')) {
        const timing = response.request().timing();
        if (timing) {
          responseTimes.push({
            url,
            time: timing.responseEnd - timing.requestStart,
          });
        }
      }
    });

    // 执行一系列API调用
    await page.goto('/user/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 等待所有请求完成
    await page.waitForTimeout(5000);

    // 验证响应时间记录
    expect(responseTimes.length).toBeGreaterThan(0);

    // 检查是否有异常慢的请求（超过5秒）
    const slowRequests = responseTimes.filter((rt) => rt.time > 5000);

    if (slowRequests.length > 0) {
      console.warn('Slow API requests detected:', slowRequests);
    }

    // 记录平均响应时间
    const avgResponseTime =
      responseTimes.reduce((sum, rt) => sum + rt.time, 0) /
      responseTimes.length;
    console.log(`Average API response time: ${avgResponseTime.toFixed(2)}ms`);

    // 响应时间应该在合理范围内（小于3秒）
    expect(avgResponseTime).toBeLessThan(3000);
  });

  test.afterEach(() => {
    // 清理日志
    apiLogs = [];
  });
});

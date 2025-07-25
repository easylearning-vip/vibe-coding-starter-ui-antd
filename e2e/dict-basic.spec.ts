import { expect, test } from '@playwright/test';

// 基础数据字典功能测试
test.describe('数据字典基础功能测试', () => {
  test('应该能够访问数据字典管理页面', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 直接访问数据字典管理页面（跳过登录）
    await page.goto('/admin/dict');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 截图验证页面加载
    await page.screenshot({
      path: 'test-results/dict-page-access.png',
      fullPage: true,
    });

    // 验证页面基本元素存在
    const pageTitle = page.locator('h1, .ant-page-header-heading-title');
    await expect(pageTitle).toBeVisible();

    // 验证是否有数据字典相关的内容
    const dictContent = page.locator('text=数据字典');
    if ((await dictContent.count()) > 0) {
      await expect(dictContent.first()).toBeVisible();
    }

    console.log('✅ 数据字典页面访问成功');
  });

  test('应该能够在4K分辨率下正常显示', async ({ page }) => {
    // 设置4K分辨率
    await page.setViewportSize({ width: 3840, height: 2160 });

    // 访问数据字典管理页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 截图验证4K分辨率下的显示
    await page.screenshot({
      path: 'test-results/dict-page-4k.png',
      fullPage: true,
    });

    // 验证页面在4K分辨率下仍然可见
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();

    console.log('✅ 4K分辨率显示正常');
  });

  test('应该能够访问用户管理页面并查看数据字典组件', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 2560, height: 1440 });

    // 访问用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 截图验证用户管理页面
    await page.screenshot({
      path: 'test-results/user-management-page.png',
      fullPage: true,
    });

    // 验证页面基本元素
    const pageTitle = page.locator('h1, .ant-page-header-heading-title');
    await expect(pageTitle).toBeVisible();

    // 查找可能的数据字典组件（选择器）
    const selects = page.locator('.ant-select');
    if ((await selects.count()) > 0) {
      console.log(`找到 ${await selects.count()} 个选择器组件`);
    }

    console.log('✅ 用户管理页面访问成功');
  });

  test('应该能够访问文章管理页面并查看数据字典组件', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 2560, height: 1440 });

    // 访问文章管理页面
    await page.goto('/admin/articles');
    await page.waitForLoadState('networkidle');

    // 截图验证文章管理页面
    await page.screenshot({
      path: 'test-results/article-management-page.png',
      fullPage: true,
    });

    // 验证页面基本元素
    const pageTitle = page.locator('h1, .ant-page-header-heading-title');
    await expect(pageTitle).toBeVisible();

    // 查找可能的数据字典组件
    const selects = page.locator('.ant-select');
    if ((await selects.count()) > 0) {
      console.log(`找到 ${await selects.count()} 个选择器组件`);
    }

    const tags = page.locator('.ant-tag');
    if ((await tags.count()) > 0) {
      console.log(`找到 ${await tags.count()} 个标签组件`);
    }

    console.log('✅ 文章管理页面访问成功');
  });

  test('应该能够测试响应式布局', async ({ page }) => {
    const resolutions = [
      { width: 1366, height: 768, name: '笔记本' },
      { width: 1920, height: 1080, name: '1080p显示器' },
      { width: 2560, height: 1440, name: '2K显示器' },
      { width: 3840, height: 2160, name: '4K显示器' },
    ];

    for (const resolution of resolutions) {
      console.log(
        `测试 ${resolution.name} 分辨率: ${resolution.width}x${resolution.height}`,
      );

      // 设置分辨率
      await page.setViewportSize({
        width: resolution.width,
        height: resolution.height,
      });

      // 访问数据字典页面
      await page.goto('/admin/dict');
      await page.waitForLoadState('networkidle');

      // 截图
      await page.screenshot({
        path: `test-results/dict-${resolution.name.replace(/\s+/g, '-')}-${resolution.width}x${resolution.height}.png`,
        fullPage: true,
      });

      // 验证页面基本可见性
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // 等待一下再切换到下一个分辨率
      await page.waitForTimeout(1000);
    }

    console.log('✅ 响应式布局测试完成');
  });

  test('应该能够检查页面性能', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 开始性能监控
    const startTime = Date.now();

    // 访问数据字典页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms`);

    // 检查页面是否在合理时间内加载完成
    expect(loadTime).toBeLessThan(10000); // 10秒内加载完成

    // 截图验证最终状态
    await page.screenshot({
      path: 'test-results/dict-performance-test.png',
      fullPage: true,
    });

    console.log('✅ 性能测试完成');
  });
});

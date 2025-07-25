import { expect, test } from '@playwright/test';

// 数据字典可视化测试 - 专注于大分辨率下的UI展示
test.describe('数据字典可视化测试', () => {
  // 登录辅助函数
  async function login(
    page: any,
    username: string = 'admin',
    password: string = 'vibecoding',
  ) {
    await page.goto('/user/login');
    await page.waitForLoadState('networkidle');

    // 填写登录信息
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待登录成功
    await page.waitForURL('/welcome', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  }

  test('1920x1080分辨率 - 数据字典管理页面展示', async ({ page }) => {
    // 设置1920x1080分辨率
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 登录
    await login(page);

    // 访问数据字典管理页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 等待页面内容加载
    await page.waitForTimeout(2000);

    // 截图验证页面布局
    await page.screenshot({
      path: 'test-results/dict-management-1920x1080.png',
      fullPage: true,
    });

    // 验证页面基本元素
    const pageTitle = page.locator(
      'h1, .ant-page-header-heading-title, [class*="title"]',
    );
    await expect(pageTitle.first()).toBeVisible();

    console.log('✅ 1920x1080分辨率测试完成');
  });

  test('2560x1440分辨率 - 数据字典管理页面展示', async ({ page }) => {
    // 设置2560x1440分辨率
    await page.setViewportSize({ width: 2560, height: 1440 });

    // 登录
    await login(page);

    // 访问数据字典管理页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 等待页面内容加载
    await page.waitForTimeout(2000);

    // 截图验证页面布局
    await page.screenshot({
      path: 'test-results/dict-management-2560x1440.png',
      fullPage: true,
    });

    console.log('✅ 2560x1440分辨率测试完成');
  });

  test('3840x2160分辨率(4K) - 数据字典管理页面展示', async ({ page }) => {
    // 设置4K分辨率
    await page.setViewportSize({ width: 3840, height: 2160 });

    // 登录
    await login(page);

    // 访问数据字典管理页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 等待页面内容加载
    await page.waitForTimeout(2000);

    // 截图验证页面布局
    await page.screenshot({
      path: 'test-results/dict-management-4k.png',
      fullPage: true,
    });

    console.log('✅ 4K分辨率测试完成');
  });

  test('用户管理页面 - 数据字典组件展示', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 登录
    await login(page);

    // 访问用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 等待页面内容加载
    await page.waitForTimeout(2000);

    // 截图验证用户管理页面
    await page.screenshot({
      path: 'test-results/user-management-with-dict.png',
      fullPage: true,
    });

    // 尝试点击添加用户按钮查看表单
    const addButton = page.locator('button:has-text("添加用户")');
    if ((await addButton.count()) > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // 截图验证添加用户表单
      await page.screenshot({
        path: 'test-results/add-user-form-with-dict.png',
        fullPage: true,
      });

      // 关闭模态框
      const cancelButton = page.locator(
        '.ant-modal-footer button:has-text("取消")',
      );
      if ((await cancelButton.count()) > 0) {
        await cancelButton.click();
      }
    }

    console.log('✅ 用户管理页面测试完成');
  });

  test('文章管理页面 - 数据字典组件展示', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 登录
    await login(page);

    // 访问文章管理页面
    await page.goto('/admin/articles');
    await page.waitForLoadState('networkidle');

    // 等待页面内容加载
    await page.waitForTimeout(2000);

    // 截图验证文章管理页面
    await page.screenshot({
      path: 'test-results/article-management-with-dict.png',
      fullPage: true,
    });

    // 尝试点击添加文章按钮查看表单
    const addButton = page.locator('button:has-text("添加文章")');
    if ((await addButton.count()) > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // 截图验证添加文章表单
      await page.screenshot({
        path: 'test-results/add-article-form-with-dict.png',
        fullPage: true,
      });

      // 关闭模态框
      const cancelButton = page.locator(
        '.ant-modal-footer button:has-text("取消")',
      );
      if ((await cancelButton.count()) > 0) {
        await cancelButton.click();
      }
    }

    console.log('✅ 文章管理页面测试完成');
  });

  test('响应式布局测试 - 多分辨率对比', async ({ page }) => {
    const resolutions = [
      { width: 1366, height: 768, name: 'laptop' },
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 2560, height: 1440, name: '2k' },
      { width: 3840, height: 2160, name: '4k' },
    ];

    // 登录一次
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);

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
      await page.waitForTimeout(1000);

      // 截图
      await page.screenshot({
        path: `test-results/dict-responsive-${resolution.name}-${resolution.width}x${resolution.height}.png`,
        fullPage: true,
      });
    }

    console.log('✅ 响应式布局测试完成');
  });

  test('数据字典功能交互测试', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 登录
    await login(page);

    // 访问数据字典管理页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 截图初始状态
    await page.screenshot({
      path: 'test-results/dict-initial-state.png',
      fullPage: true,
    });

    // 尝试点击初始化按钮
    const initButton = page.locator('button:has-text("初始化默认数据")');
    if ((await initButton.count()) > 0) {
      await initButton.click();
      await page.waitForTimeout(3000);

      // 截图初始化后状态
      await page.screenshot({
        path: 'test-results/dict-after-init.png',
        fullPage: true,
      });
    }

    // 尝试点击添加分类按钮
    const addCategoryButton = page.locator('button:has-text("添加分类")');
    if ((await addCategoryButton.count()) > 0) {
      await addCategoryButton.click();
      await page.waitForTimeout(1000);

      // 截图添加分类表单
      await page.screenshot({
        path: 'test-results/dict-add-category-form.png',
        fullPage: true,
      });

      // 关闭模态框
      const cancelButton = page.locator(
        '.ant-modal-footer button:has-text("取消")',
      );
      if ((await cancelButton.count()) > 0) {
        await cancelButton.click();
      }
    }

    console.log('✅ 数据字典功能交互测试完成');
  });
});

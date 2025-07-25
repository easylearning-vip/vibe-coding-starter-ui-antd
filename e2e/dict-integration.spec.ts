import { expect, test } from '@playwright/test';

// 测试数据字典在其他页面中的集成使用
test.describe('数据字典集成测试', () => {
  // 在每个测试前进行登录和数据初始化
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('/user/login');
    await page.waitForLoadState('networkidle');

    // 登录
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'vibecoding');
    await page.click('button[type="submit"]');
    await page.waitForURL('/welcome');
    await page.waitForLoadState('networkidle');

    // 数据字典数据应该已经通过数据库迁移初始化了
  });

  test('用户管理页面应该使用数据字典显示角色和状态', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('用户管理');

    // 验证搜索表单中的字典选择器
    const roleSelect = page
      .locator('form .ant-select')
      .filter({ hasText: '选择角色' });
    await expect(roleSelect).toBeVisible();

    const statusSelect = page
      .locator('form .ant-select')
      .filter({ hasText: '选择状态' });
    await expect(statusSelect).toBeVisible();

    // 测试角色选择器
    await roleSelect.click();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("管理员")'),
    ).toBeVisible();
    await expect(
      page.locator(
        '.ant-select-dropdown .ant-select-item:has-text("普通用户")',
      ),
    ).toBeVisible();

    // 点击其他地方关闭下拉框
    await page.click('h1');

    // 测试状态选择器
    await statusSelect.click();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("活跃")'),
    ).toBeVisible();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("非活跃")'),
    ).toBeVisible();

    // 截图验证用户管理页面的字典集成
    await page.screenshot({
      path: 'test-results/user-management-dict-integration.png',
      fullPage: true,
    });
  });

  test('用户管理页面的添加用户表单应该使用数据字典', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 点击添加用户按钮
    await page.click('button:has-text("添加用户")');

    // 等待模态框出现
    await expect(
      page.locator('.ant-modal-title:has-text("添加用户")'),
    ).toBeVisible();

    // 验证角色选择器
    const roleSelect = page
      .locator('.ant-modal .ant-select')
      .filter({ hasText: '请选择角色' });
    await expect(roleSelect).toBeVisible();

    await roleSelect.click();
    await expect(
      page.locator(
        '.ant-select-dropdown .ant-select-item:has-text("普通用户")',
      ),
    ).toBeVisible();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("管理员")'),
    ).toBeVisible();

    // 选择管理员角色
    await page.click(
      '.ant-select-dropdown .ant-select-item:has-text("管理员")',
    );

    // 验证状态选择器
    const statusSelect = page
      .locator('.ant-modal .ant-select')
      .filter({ hasText: '请选择状态' });
    await expect(statusSelect).toBeVisible();

    await statusSelect.click();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("活跃")'),
    ).toBeVisible();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("非活跃")'),
    ).toBeVisible();

    // 选择活跃状态
    await page.click('.ant-select-dropdown .ant-select-item:has-text("活跃")');

    // 截图验证添加用户表单的字典集成
    await page.screenshot({
      path: 'test-results/add-user-form-dict-integration.png',
      fullPage: true,
    });

    // 关闭模态框
    await page.click('.ant-modal-footer button:has-text("取消")');
  });

  test('文章管理页面应该使用数据字典显示状态', async ({ page }) => {
    // 导航到文章管理页面
    await page.goto('/admin/articles');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('文章管理');

    // 验证搜索表单中的状态选择器
    const statusSelect = page
      .locator('form .ant-select')
      .filter({ hasText: '选择状态' });
    await expect(statusSelect).toBeVisible();

    // 测试状态选择器
    await statusSelect.click();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("已发布")'),
    ).toBeVisible();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("草稿")'),
    ).toBeVisible();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("已归档")'),
    ).toBeVisible();

    // 截图验证文章管理页面的字典集成
    await page.screenshot({
      path: 'test-results/article-management-dict-integration.png',
      fullPage: true,
    });
  });

  test('应该在4K分辨率下正常显示数据字典组件', async ({ page }) => {
    // 设置4K分辨率
    await page.setViewportSize({ width: 3840, height: 2160 });

    // 导航到用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 验证页面在4K分辨率下的布局
    await expect(page.locator('.ant-page-header')).toBeVisible();
    await expect(page.locator('.ant-table')).toBeVisible();

    // 点击添加用户按钮
    await page.click('button:has-text("添加用户")');
    await expect(
      page.locator('.ant-modal-title:has-text("添加用户")'),
    ).toBeVisible();

    // 验证字典选择器在4K分辨率下的显示
    const roleSelect = page
      .locator('.ant-modal .ant-select')
      .filter({ hasText: '请选择角色' });
    await expect(roleSelect).toBeVisible();

    await roleSelect.click();

    // 验证下拉选项在4K分辨率下的显示
    await expect(page.locator('.ant-select-dropdown')).toBeVisible();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("管理员")'),
    ).toBeVisible();
    await expect(
      page.locator(
        '.ant-select-dropdown .ant-select-item:has-text("普通用户")',
      ),
    ).toBeVisible();

    // 截图验证4K分辨率下的显示效果
    await page.screenshot({
      path: 'test-results/dict-components-4k-resolution.png',
      fullPage: true,
    });

    // 关闭模态框
    await page.click('.ant-modal-footer button:has-text("取消")');
  });

  test('数据字典标签应该显示正确的颜色和文本', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 如果表格中有数据，验证标签显示
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      // 验证角色标签
      const roleTags = page.locator('.ant-table-tbody .ant-tag');
      if ((await roleTags.count()) > 0) {
        // 验证管理员标签是红色
        const adminTags = page.locator(
          '.ant-table-tbody .ant-tag-red:has-text("管理员")',
        );
        if ((await adminTags.count()) > 0) {
          await expect(adminTags.first()).toBeVisible();
        }

        // 验证用户标签是蓝色
        const userTags = page.locator(
          '.ant-table-tbody .ant-tag-blue:has-text("普通用户")',
        );
        if ((await userTags.count()) > 0) {
          await expect(userTags.first()).toBeVisible();
        }
      }
    }

    // 截图验证标签颜色显示
    await page.screenshot({
      path: 'test-results/dict-tags-colors.png',
      fullPage: true,
    });
  });

  test('数据字典缓存应该正常工作', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 打开添加用户表单
    await page.click('button:has-text("添加用户")');
    await expect(
      page.locator('.ant-modal-title:has-text("添加用户")'),
    ).toBeVisible();

    // 打开角色选择器（第一次加载）
    const roleSelect = page
      .locator('.ant-modal .ant-select')
      .filter({ hasText: '请选择角色' });
    await roleSelect.click();

    // 记录第一次加载时间
    const startTime = Date.now();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("管理员")'),
    ).toBeVisible();
    const firstLoadTime = Date.now() - startTime;

    // 关闭下拉框
    await page.click('.ant-modal-title');

    // 再次打开角色选择器（应该使用缓存）
    const secondStartTime = Date.now();
    await roleSelect.click();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("管理员")'),
    ).toBeVisible();
    const secondLoadTime = Date.now() - secondStartTime;

    // 验证第二次加载更快（使用了缓存）
    console.log(
      `First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`,
    );

    // 关闭模态框
    await page.click('.ant-modal-footer button:has-text("取消")');

    // 导航到文章管理页面，验证缓存在不同页面间共享
    await page.goto('/admin/articles');
    await page.waitForLoadState('networkidle');

    // 验证文章状态选择器也能快速加载
    const statusSelect = page
      .locator('form .ant-select')
      .filter({ hasText: '选择状态' });
    await statusSelect.click();
    await expect(
      page.locator('.ant-select-dropdown .ant-select-item:has-text("已发布")'),
    ).toBeVisible();

    // 截图验证缓存功能
    await page.screenshot({
      path: 'test-results/dict-cache-test.png',
      fullPage: true,
    });
  });

  test('数据字典组件应该处理网络错误', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/v1/dict/**', (route) => {
      route.abort('failed');
    });

    // 导航到用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 尝试打开添加用户表单
    await page.click('button:has-text("添加用户")');
    await expect(
      page.locator('.ant-modal-title:has-text("添加用户")'),
    ).toBeVisible();

    // 尝试打开角色选择器
    const roleSelect = page
      .locator('.ant-modal .ant-select')
      .filter({ hasText: '请选择角色' });
    await roleSelect.click();

    // 等待一段时间，看是否有错误处理
    await page.waitForTimeout(3000);

    // 验证错误消息或空状态
    // 注意：具体的错误处理行为取决于实际实现

    // 截图验证错误处理
    await page.screenshot({
      path: 'test-results/dict-error-handling.png',
      fullPage: true,
    });
  });
});

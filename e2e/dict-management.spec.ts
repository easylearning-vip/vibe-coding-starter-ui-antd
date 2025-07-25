import { expect, test } from '@playwright/test';

// 测试数据字典管理功能
test.describe('数据字典管理', () => {
  // 在每个测试前进行登录
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('/user/login');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 填写登录信息（管理员账户）
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'vibecoding');

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待登录成功，跳转到首页
    await page.waitForURL('/welcome');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
  });

  test('应该能够访问数据字典管理页面', async ({ page }) => {
    // 导航到数据字典管理页面
    await page.goto('/admin/dict');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('数据字典管理');

    // 验证页面描述
    await expect(page.locator('.ant-page-header-content')).toContainText(
      '管理系统中的数据字典分类和字典项',
    );

    // 验证初始化按钮存在
    await expect(
      page.locator('button:has-text("初始化默认数据")'),
    ).toBeVisible();

    // 验证添加分类按钮存在
    await expect(page.locator('button:has-text("添加分类")')).toBeVisible();

    // 截图验证页面布局
    await page.screenshot({
      path: 'test-results/dict-management-page.png',
      fullPage: true,
    });
  });

  test('应该能够查看字典项', async ({ page }) => {
    // 导航到数据字典管理页面并初始化数据
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 初始化数据
    await page.click('button:has-text("初始化默认数据")');
    await page.waitForTimeout(2000);

    // 点击文章状态分类标签
    await page.click('.ant-tabs-tab:has-text("文章状态")');
    await page.waitForTimeout(1000);

    // 验证字典项表格显示
    await expect(page.locator('.ant-table-tbody tr')).toHaveCount(3); // 文章状态应该有3个项

    // 验证字典项内容
    await expect(page.locator('td:has-text("draft")')).toBeVisible();
    await expect(page.locator('td:has-text("草稿")')).toBeVisible();
    await expect(page.locator('td:has-text("published")')).toBeVisible();
    await expect(page.locator('td:has-text("已发布")')).toBeVisible();
    await expect(page.locator('td:has-text("archived")')).toBeVisible();
    await expect(page.locator('td:has-text("已归档")')).toBeVisible();

    // 验证状态标签
    await expect(page.locator('.ant-tag-green:has-text("启用")')).toHaveCount(
      3,
    );

    // 截图验证字典项显示
    await page.screenshot({
      path: 'test-results/dict-items-view.png',
      fullPage: true,
    });
  });

  test('应该能够创建新的字典分类', async ({ page }) => {
    // 导航到数据字典管理页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 点击添加分类按钮
    await page.click('button:has-text("添加分类")');

    // 等待模态框出现
    await expect(
      page.locator('.ant-modal-title:has-text("添加字典分类")'),
    ).toBeVisible();

    // 填写分类信息
    await page.fill('input[name="code"]', 'test_category');
    await page.fill('input[name="name"]', '测试分类');
    await page.fill('textarea[name="description"]', '这是一个测试分类');
    await page.fill('input[name="sort_order"]', '10');

    // 截图验证表单填写
    await page.screenshot({
      path: 'test-results/dict-category-form.png',
      fullPage: true,
    });

    // 点击确定按钮
    await page.click('.ant-modal-footer button.ant-btn-primary');

    // 等待请求完成
    await page.waitForTimeout(2000);

    // 验证成功消息
    await expect(page.locator('.ant-message')).toContainText('分类创建成功');

    // 验证新分类出现在表格中
    await expect(page.locator('td:has-text("test_category")')).toBeVisible();
    await expect(page.locator('td:has-text("测试分类")')).toBeVisible();

    // 验证新分类标签出现
    await expect(
      page.locator('.ant-tabs-tab:has-text("测试分类")'),
    ).toBeVisible();
  });

  test('应该能够创建新的字典项', async ({ page }) => {
    // 导航到数据字典管理页面并初始化数据
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 初始化数据
    await page.click('button:has-text("初始化默认数据")');
    await page.waitForTimeout(2000);

    // 切换到文章状态标签
    await page.click('.ant-tabs-tab:has-text("文章状态")');
    await page.waitForTimeout(1000);

    // 点击添加字典项按钮
    await page.click('button:has-text("添加字典项")');

    // 等待模态框出现
    await expect(
      page.locator('.ant-modal-title:has-text("添加字典项")'),
    ).toBeVisible();

    // 填写字典项信息
    await page.fill('input[name="item_key"]', 'reviewing');
    await page.fill('input[name="item_value"]', '审核中');
    await page.fill('textarea[name="description"]', '文章正在审核中');
    await page.fill('input[name="sort_order"]', '4');

    // 截图验证表单填写
    await page.screenshot({
      path: 'test-results/dict-item-form.png',
      fullPage: true,
    });

    // 点击确定按钮
    await page.click('.ant-modal-footer button.ant-btn-primary');

    // 等待请求完成
    await page.waitForTimeout(2000);

    // 验证成功消息
    await expect(page.locator('.ant-message')).toContainText('字典项创建成功');

    // 验证新字典项出现在表格中
    await expect(page.locator('td:has-text("reviewing")')).toBeVisible();
    await expect(page.locator('td:has-text("审核中")')).toBeVisible();
  });

  test('应该能够编辑字典项', async ({ page }) => {
    // 导航到数据字典管理页面并初始化数据
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 初始化数据
    await page.click('button:has-text("初始化默认数据")');
    await page.waitForTimeout(2000);

    // 切换到文章状态标签
    await page.click('.ant-tabs-tab:has-text("文章状态")');
    await page.waitForTimeout(1000);

    // 点击第一个字典项的编辑按钮
    await page.click('.ant-table-tbody tr:first-child button:has-text("编辑")');

    // 等待编辑模态框出现
    await expect(
      page.locator('.ant-modal-title:has-text("编辑字典项")'),
    ).toBeVisible();

    // 修改字典项值
    await page.fill('input[name="item_value"]', '草稿状态');
    await page.fill('textarea[name="description"]', '文章草稿状态，尚未发布');

    // 截图验证编辑表单
    await page.screenshot({
      path: 'test-results/dict-item-edit-form.png',
      fullPage: true,
    });

    // 点击确定按钮
    await page.click('.ant-modal-footer button.ant-btn-primary');

    // 等待请求完成
    await page.waitForTimeout(2000);

    // 验证成功消息
    await expect(page.locator('.ant-message')).toContainText('字典项更新成功');

    // 验证修改后的内容
    await expect(page.locator('td:has-text("草稿状态")')).toBeVisible();
  });

  test('应该能够在大分辨率下正常显示和操作', async ({ page }) => {
    // 设置大分辨率
    await page.setViewportSize({ width: 2560, height: 1440 });

    // 导航到数据字典管理页面
    await page.goto('/admin/dict');
    await page.waitForLoadState('networkidle');

    // 初始化数据
    await page.click('button:has-text("初始化默认数据")');
    await page.waitForTimeout(2000);

    // 验证页面在大分辨率下的布局
    await expect(page.locator('.ant-page-header')).toBeVisible();
    await expect(page.locator('.ant-tabs')).toBeVisible();
    await expect(page.locator('.ant-table')).toBeVisible();

    // 验证所有标签页都可见
    await expect(
      page.locator('.ant-tabs-tab:has-text("分类管理")'),
    ).toBeVisible();
    await expect(
      page.locator('.ant-tabs-tab:has-text("文章状态")'),
    ).toBeVisible();
    await expect(
      page.locator('.ant-tabs-tab:has-text("用户角色")'),
    ).toBeVisible();
    await expect(
      page.locator('.ant-tabs-tab:has-text("用户状态")'),
    ).toBeVisible();

    // 截图验证大分辨率下的显示效果
    await page.screenshot({
      path: 'test-results/dict-management-large-resolution.png',
      fullPage: true,
    });

    // 测试表格的响应式行为
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    // 验证表格列都正常显示
    await expect(page.locator('th:has-text("ID")')).toBeVisible();
    await expect(page.locator('th:has-text("分类代码")')).toBeVisible();
    await expect(page.locator('th:has-text("分类名称")')).toBeVisible();
    await expect(page.locator('th:has-text("描述")')).toBeVisible();
    await expect(page.locator('th:has-text("排序")')).toBeVisible();
    await expect(page.locator('th:has-text("创建时间")')).toBeVisible();
    await expect(page.locator('th:has-text("操作")')).toBeVisible();
  });
});

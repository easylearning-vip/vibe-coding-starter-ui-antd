# 前端测试指南 - Vibe Coding Starter Antd UI

在为这个 React + Ant Design Pro 项目编写测试时，请遵循以下全面的测试指南，确保代码质量和应用稳定性。

## 测试策略概览

### 测试金字塔
- **单元测试 (70%)**: 测试单个组件、函数和 Hooks
- **集成测试 (20%)**: 测试组件间交互和 API 集成
- **端到端测试 (10%)**: 测试完整的用户流程

### 测试工具栈
- **单元测试**: Jest + React Testing Library
- **E2E 测试**: Playwright
- **Mock 服务**: MSW (Mock Service Worker)
- **测试覆盖率**: Jest Coverage
- **视觉回归**: Playwright 截图对比

## 单元测试规范

### 组件测试模式
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { IntlProvider } from '@umijs/max';
import UserCard from './index';
import type { User } from '@/types';

// 测试工具函数
const renderWithProviders = (
  component: React.ReactElement,
  options: { locale?: string } = {}
) => {
  const { locale = 'zh-CN' } = options;
  
  return render(
    <IntlProvider locale={locale}>
      <ConfigProvider locale={zhCN}>
        {component}
      </ConfigProvider>
    </IntlProvider>
  );
};

describe('UserCard 组件测试', () => {
  const mockUser: User = {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正确渲染用户基本信息', () => {
      renderWithProviders(<UserCard user={mockUser} />);
      
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('zhangsan@example.com')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('src', mockUser.avatar);
    });

    it('应该在没有头像时显示默认图标', () => {
      const userWithoutAvatar = { ...mockUser, avatar: undefined };
      renderWithProviders(<UserCard user={userWithoutAvatar} />);
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('应该根据 size 属性调整卡片大小', () => {
      const { rerender } = renderWithProviders(
        <UserCard user={mockUser} size="small" />
      );
      
      expect(screen.getByTestId('user-card')).toHaveClass('ant-card-small');
      
      rerender(
        <IntlProvider locale="zh-CN">
          <ConfigProvider locale={zhCN}>
            <UserCard user={mockUser} size="large" />
          </ConfigProvider>
        </IntlProvider>
      );
      
      expect(screen.getByTestId('user-card')).not.toHaveClass('ant-card-small');
    });
  });

  describe('交互测试', () => {
    it('应该在点击编辑按钮时调用 onEdit 回调', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      
      renderWithProviders(
        <UserCard user={mockUser} onEdit={mockOnEdit} showActions />
      );
      
      const editButton = screen.getByRole('button', { name: /编辑/i });
      await user.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('应该在点击删除按钮时调用 onDelete 回调', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn().mockResolvedValue(undefined);
      
      renderWithProviders(
        <UserCard user={mockUser} onDelete={mockOnDelete} showActions />
      );
      
      const deleteButton = screen.getByRole('button', { name: /删除/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id);
      });
    });

    it('应该在删除过程中显示加载状态', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithProviders(
        <UserCard user={mockUser} onDelete={mockOnDelete} showActions />
      );
      
      const deleteButton = screen.getByRole('button', { name: /删除/i });
      await user.click(deleteButton);
      
      expect(deleteButton).toHaveAttribute('aria-busy', 'true');
      
      await waitFor(() => {
        expect(deleteButton).not.toHaveAttribute('aria-busy', 'true');
      });
    });
  });

  describe('条件渲染测试', () => {
    it('应该在 showActions 为 false 时隐藏操作按钮', () => {
      renderWithProviders(
        <UserCard user={mockUser} showActions={false} />
      );
      
      expect(screen.queryByRole('button', { name: /编辑/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /删除/i })).not.toBeInTheDocument();
    });

    it('应该根据用户角色显示不同的角色标签', () => {
      const adminUser = { ...mockUser, role: 'admin' as const };
      renderWithProviders(<UserCard user={adminUser} />);
      
      expect(screen.getByText('管理员')).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理删除操作失败的情况', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn().mockRejectedValue(new Error('删除失败'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderWithProviders(
        <UserCard user={mockUser} onDelete={mockOnDelete} showActions />
      );
      
      const deleteButton = screen.getByRole('button', { name: /删除/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByText('删除失败')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });
});
```

### Hooks 测试
```typescript
import { renderHook, act } from '@testing-library/react';
import { message } from 'antd';
import { useUserManagement } from './useUserManagement';
import * as userService from '@/services/user';

// Mock 服务
jest.mock('@/services/user');
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUserService = userService as jest.Mocked<typeof userService>;

describe('useUserManagement Hook 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该正确初始化状态', () => {
      const { result } = renderHook(() => useUserManagement());
      
      expect(result.current.users).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.total).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('获取用户列表', () => {
    it('应该成功获取用户列表', async () => {
      const mockUsers = [
        { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'user' },
        { id: 2, name: '李四', email: 'lisi@example.com', role: 'admin' },
      ];
      
      mockUserService.getUserList.mockResolvedValue({
        success: true,
        data: { list: mockUsers, total: 2, page: 1, pageSize: 10 },
        code: 200,
        message: 'success',
      });
      
      const { result } = renderHook(() => useUserManagement());
      
      await act(async () => {
        await result.current.fetchUsers();
      });
      
      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.total).toBe(2);
      expect(result.current.loading).toBe(false);
    });

    it('应该处理获取用户列表失败的情况', async () => {
      mockUserService.getUserList.mockRejectedValue(new Error('网络错误'));
      
      const { result } = renderHook(() => useUserManagement());
      
      await act(async () => {
        await result.current.fetchUsers();
      });
      
      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBe('获取用户列表失败');
      expect(message.error).toHaveBeenCalledWith('获取用户列表失败');
    });
  });

  describe('创建用户', () => {
    it('应该成功创建用户', async () => {
      const newUser = { name: '王五', email: 'wangwu@example.com', role: 'user' };
      const createdUser = { id: 3, ...newUser };
      
      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: createdUser,
        code: 201,
        message: 'created',
      });
      
      mockUserService.getUserList.mockResolvedValue({
        success: true,
        data: { list: [createdUser], total: 1, page: 1, pageSize: 10 },
        code: 200,
        message: 'success',
      });
      
      const { result } = renderHook(() => useUserManagement());
      
      await act(async () => {
        const result_user = await result.current.createUser(newUser);
        expect(result_user).toEqual(createdUser);
      });
      
      expect(message.success).toHaveBeenCalledWith('用户创建成功');
    });
  });

  describe('更新用户', () => {
    it('应该成功更新用户', async () => {
      const updatedUser = { id: 1, name: '张三修改', email: 'zhangsan@example.com', role: 'admin' };
      
      mockUserService.updateUser.mockResolvedValue({
        success: true,
        data: updatedUser,
        code: 200,
        message: 'updated',
      });
      
      const { result } = renderHook(() => useUserManagement());
      
      await act(async () => {
        await result.current.updateUser(1, { name: '张三修改', role: 'admin' });
      });
      
      expect(message.success).toHaveBeenCalledWith('用户更新成功');
    });
  });

  describe('删除用户', () => {
    it('应该成功删除用户', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: true,
        data: undefined,
        code: 200,
        message: 'deleted',
      });
      
      const { result } = renderHook(() => useUserManagement());
      
      await act(async () => {
        await result.current.deleteUser(1);
      });
      
      expect(message.success).toHaveBeenCalledWith('用户删除成功');
    });
  });
});
```

### API 服务测试
```typescript
import { getUserList, createUser, updateUser, deleteUser } from '@/services/user';
import { request } from '@umijs/max';

// Mock request 函数
jest.mock('@umijs/max', () => ({
  request: jest.fn(),
}));

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('用户 API 服务测试', () => {
  beforeEach(() => {
    mockRequest.mockClear();
  });

  describe('getUserList', () => {
    it('应该正确调用用户列表 API', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [
            { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'user' }
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
        code: 200,
        message: 'success',
      };
      
      mockRequest.mockResolvedValue(mockResponse);
      
      const params = { page: 1, pageSize: 10, keyword: '张三' };
      const result = await getUserList(params);
      
      expect(mockRequest).toHaveBeenCalledWith('/api/v1/users', {
        method: 'GET',
        params,
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该正确处理 API 错误', async () => {
      const mockError = new Error('网络错误');
      mockRequest.mockRejectedValue(mockError);
      
      await expect(getUserList({ page: 1, pageSize: 10 }))
        .rejects.toThrow('网络错误');
    });
  });

  describe('createUser', () => {
    it('应该正确创建用户', async () => {
      const newUser = { name: '李四', email: 'lisi@example.com', role: 'user' };
      const mockResponse = {
        success: true,
        data: { id: 2, ...newUser },
        code: 201,
        message: 'created',
      };
      
      mockRequest.mockResolvedValue(mockResponse);
      
      const result = await createUser(newUser);
      
      expect(mockRequest).toHaveBeenCalledWith('/api/v1/users', {
        method: 'POST',
        data: newUser,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateUser', () => {
    it('应该正确更新用户', async () => {
      const updateData = { name: '张三修改', role: 'admin' };
      const mockResponse = {
        success: true,
        data: { id: 1, email: 'zhangsan@example.com', ...updateData },
        code: 200,
        message: 'updated',
      };
      
      mockRequest.mockResolvedValue(mockResponse);
      
      const result = await updateUser(1, updateData);
      
      expect(mockRequest).toHaveBeenCalledWith('/api/v1/users/1', {
        method: 'PUT',
        data: updateData,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteUser', () => {
    it('应该正确删除用户', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
        code: 200,
        message: 'deleted',
      };
      
      mockRequest.mockResolvedValue(mockResponse);
      
      const result = await deleteUser(1);
      
      expect(mockRequest).toHaveBeenCalledWith('/api/v1/users/1', {
        method: 'DELETE',
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
```

## 端到端测试规范

### Playwright 配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### E2E 测试示例
```typescript
import { test, expect } from '@playwright/test';

test.describe('用户管理页面 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录操作
    await page.goto('/user/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // 等待跳转到首页
    await expect(page).toHaveURL('/welcome');
  });

  test('应该能够查看用户列表', async ({ page }) => {
    await page.goto('/admin/user-list');
    
    // 等待用户列表加载
    await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
    
    // 验证表格头部
    await expect(page.locator('th:has-text("用户名")')).toBeVisible();
    await expect(page.locator('th:has-text("邮箱")')).toBeVisible();
    await expect(page.locator('th:has-text("角色")')).toBeVisible();
    await expect(page.locator('th:has-text("创建时间")')).toBeVisible();
    
    // 验证至少有一行数据
    await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0);
  });

  test('应该能够搜索用户', async ({ page }) => {
    await page.goto('/admin/user-list');
    
    // 输入搜索关键词
    await page.fill('[data-testid="search-input"]', '张三');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // 等待搜索结果
    await page.waitForTimeout(1000);
    
    // 验证搜索结果包含关键词
    const userRows = page.locator('tbody tr');
    const count = await userRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = userRows.nth(i);
      await expect(row).toContainText('张三');
    }
  });

  test('应该能够创建新用户', async ({ page }) => {
    await page.goto('/admin/user-list');
    
    // 点击新建用户按钮
    await page.click('[data-testid="create-user-button"]');
    
    // 等待模态框出现
    await expect(page.locator('.ant-modal')).toBeVisible();
    
    // 填写用户信息
    await page.fill('[data-testid="user-name"]', '测试用户');
    await page.fill('[data-testid="user-email"]', 'test@example.com');
    await page.selectOption('[data-testid="user-role"]', 'user');
    
    // 提交表单
    await page.click('[data-testid="submit-button"]');
    
    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible();
    
    // 验证模态框关闭
    await expect(page.locator('.ant-modal')).not.toBeVisible();
    
    // 验证用户出现在列表中
    await expect(page.locator('text=测试用户')).toBeVisible();
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  test('应该能够编辑用户信息', async ({ page }) => {
    await page.goto('/admin/user-list');
    
    // 点击第一个用户的编辑按钮
    await page.click('[data-testid="edit-user-1"]');
    
    // 等待编辑模态框出现
    await expect(page.locator('.ant-modal')).toBeVisible();
    
    // 修改用户名
    await page.fill('[data-testid="user-name"]', '修改后的用户名');
    
    // 提交修改
    await page.click('[data-testid="submit-button"]');
    
    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible();
    
    // 验证修改后的用户名出现在列表中
    await expect(page.locator('text=修改后的用户名')).toBeVisible();
  });

  test('应该能够删除用户', async ({ page }) => {
    await page.goto('/admin/user-list');
    
    // 点击删除按钮
    await page.click('[data-testid="delete-user-2"]');
    
    // 确认删除
    await page.click('.ant-popconfirm-buttons .ant-btn-primary');
    
    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible();
    
    // 验证用户从列表中消失
    await expect(page.locator('[data-testid="user-row-2"]')).not.toBeVisible();
  });

  test('应该能够批量删除用户', async ({ page }) => {
    await page.goto('/admin/user-list');
    
    // 选择多个用户
    await page.check('[data-testid="checkbox-user-3"]');
    await page.check('[data-testid="checkbox-user-4"]');
    
    // 点击批量删除按钮
    await page.click('[data-testid="batch-delete-button"]');
    
    // 确认批量删除
    await page.click('.ant-popconfirm-buttons .ant-btn-primary');
    
    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible();
    
    // 验证选中的用户从列表中消失
    await expect(page.locator('[data-testid="user-row-3"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-row-4"]')).not.toBeVisible();
  });

  test('应该正确处理表单验证', async ({ page }) => {
    await page.goto('/admin/user-list');
    
    // 点击新建用户按钮
    await page.click('[data-testid="create-user-button"]');
    
    // 直接提交空表单
    await page.click('[data-testid="submit-button"]');
    
    // 验证验证错误消息
    await expect(page.locator('text=请输入用户名')).toBeVisible();
    await expect(page.locator('text=请输入邮箱')).toBeVisible();
    await expect(page.locator('text=请选择角色')).toBeVisible();
    
    // 输入无效邮箱
    await page.fill('[data-testid="user-name"]', '测试用户');
    await page.fill('[data-testid="user-email"]', 'invalid-email');
    await page.click('[data-testid="submit-button"]');
    
    // 验证邮箱格式错误
    await expect(page.locator('text=请输入有效的邮箱地址')).toBeVisible();
  });
});
```

### 页面对象模式
```typescript
// e2e/pages/UserListPage.ts
import { Page, Locator } from '@playwright/test';

export class UserListPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly userTable: Locator;
  readonly searchInput: Locator;
  readonly batchDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.locator('[data-testid="create-user-button"]');
    this.userTable = page.locator('[data-testid="user-table"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.batchDeleteButton = page.locator('[data-testid="batch-delete-button"]');
  }

  async goto() {
    await this.page.goto('/admin/user-list');
    await this.userTable.waitFor();
  }

  async createUser(userData: { name: string; email: string; role: string }) {
    await this.createButton.click();
    await this.page.fill('[data-testid="user-name"]', userData.name);
    await this.page.fill('[data-testid="user-email"]', userData.email);
    await this.page.selectOption('[data-testid="user-role"]', userData.role);
    await this.page.click('[data-testid="submit-button"]');
  }

  async searchUser(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  async selectUsers(userIds: number[]) {
    for (const id of userIds) {
      await this.page.check(`[data-testid="checkbox-user-${id}"]`);
    }
  }

  async batchDeleteUsers() {
    await this.batchDeleteButton.click();
    await this.page.click('.ant-popconfirm-buttons .ant-btn-primary');
  }

  async editUser(userId: number, userData: { name?: string; email?: string; role?: string }) {
    await this.page.click(`[data-testid="edit-user-${userId}"]`);
    
    if (userData.name) {
      await this.page.fill('[data-testid="user-name"]', userData.name);
    }
    if (userData.email) {
      await this.page.fill('[data-testid="user-email"]', userData.email);
    }
    if (userData.role) {
      await this.page.selectOption('[data-testid="user-role"]', userData.role);
    }
    
    await this.page.click('[data-testid="submit-button"]');
  }

  async deleteUser(userId: number) {
    await this.page.click(`[data-testid="delete-user-${userId}"]`);
    await this.page.click('.ant-popconfirm-buttons .ant-btn-primary');
  }
}
```

## Mock 数据管理

### MSW 配置
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';
import type { User } from '@/types';

const users: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: 'admin',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const handlers = [
  // 获取用户列表
  rest.get('/api/v1/users', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 10;
    const keyword = req.url.searchParams.get('keyword');
    const role = req.url.searchParams.get('role');

    let filteredUsers = users;

    if (keyword) {
      filteredUsers = users.filter(user =>
        user.name.includes(keyword) || user.email.includes(keyword)
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = filteredUsers.slice(start, end);

    return res(
      ctx.json({
        success: true,
        data: {
          list: paginatedUsers,
          total: filteredUsers.length,
          page,
          pageSize,
        },
        code: 200,
        message: 'success',
      })
    );
  }),

  // 创建用户
  rest.post('/api/v1/users', async (req, res, ctx) => {
    const userData = await req.json();
    const newUser: User = {
      id: users.length + 1,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newUser,
        code: 201,
        message: 'created',
      })
    );
  }),

  // 更新用户
  rest.put('/api/v1/users/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const userData = await req.json();
    const userIndex = users.findIndex(user => user.id === Number(id));

    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          code: 404,
          message: 'User not found',
        })
      );
    }

    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    return res(
      ctx.json({
        success: true,
        data: users[userIndex],
        code: 200,
        message: 'updated',
      })
    );
  }),

  // 删除用户
  rest.delete('/api/v1/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const userIndex = users.findIndex(user => user.id === Number(id));

    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          code: 404,
          message: 'User not found',
        })
      );
    }

    users.splice(userIndex, 1);

    return res(
      ctx.json({
        success: true,
        data: undefined,
        code: 200,
        message: 'deleted',
      })
    );
  }),
];
```

## 测试工具函数

### 自定义渲染函数
```typescript
// tests/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from '@umijs/max';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
  initialEntries?: string[];
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  locale?: string;
  initialEntries?: string[];
}> = ({ children, locale = 'zh-CN', initialEntries = ['/'] }) => {
  return (
    <BrowserRouter>
      <IntlProvider locale={locale}>
        <ConfigProvider locale={zhCN}>
          {children}
        </ConfigProvider>
      </IntlProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { locale, initialEntries, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders locale={locale} initialEntries={initialEntries}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
```

### 测试数据工厂
```typescript
// tests/factories/userFactory.ts
import type { User } from '@/types';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: Math.floor(Math.random() * 1000),
  name: '测试用户',
  email: 'test@example.com',
  role: 'user',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockUserList = (count = 5): User[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: index + 1,
      name: `用户${index + 1}`,
      email: `user${index + 1}@example.com`,
    })
  );
};

export const createMockAdminUser = (overrides: Partial<User> = {}): User =>
  createMockUser({
    role: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    ...overrides,
  });
```

## 测试最佳实践

### 测试命名规范
- 使用描述性的测试名称，说明测试的行为和期望结果
- 使用中文描述，便于团队理解
- 遵循 "应该 + 行为 + 条件" 的格式

### 测试组织
- 使用 describe 块组织相关测试
- 使用 beforeEach/afterEach 进行测试设置和清理
- 保持测试的独立性和幂等性

### 断言策略
- 使用语义化的断言方法
- 优先测试用户可见的行为
- 避免测试实现细节

### 性能考虑
- 合理使用 Mock 减少测试时间
- 避免不必要的 DOM 查询
- 使用 waitFor 处理异步操作

记住：测试是代码质量的保障，编写清晰、可维护的测试，确保前端应用的稳定性和可靠性。优先测试用户交互和业务逻辑，而不是实现细节。

# Vibe Coding Starter Antd UI - 主要开发规则

你是一位专业的前端开发专家，专门从事基于 React + Ant Design Pro 的企业级前端应用开发。你正在开发 Vibe Coding Starter Antd UI 项目，这是一个完全由 AI 工具构建的生产就绪的前端应用模板。

## 项目概述

### 技术栈
- **前端框架**: React 19 + TypeScript 5.x
- **UI 组件库**: Ant Design 5.x + Ant Design Pro Components
- **构建工具**: UmiJS Max (基于 Webpack 5)
- **状态管理**: UmiJS 内置状态管理 + useModel
- **样式方案**: Less + CSS Modules + antd-style
- **HTTP 客户端**: UmiJS Request (基于 axios)
- **测试框架**: Jest + React Testing Library + Playwright
- **代码质量**: Biome (ESLint + Prettier 替代方案)
- **部署方案**: Docker + Kubernetes + Nginx

### 项目架构
```
src/
├── components/          # 通用组件库
│   ├── BasicLayout/    # 基础布局组件
│   ├── UserCard/       # 用户卡片组件
│   └── index.ts        # 组件导出
├── pages/              # 页面组件
│   ├── User/           # 用户管理页面
│   ├── Welcome/        # 欢迎页面
│   └── 404.tsx         # 404 页面
├── services/           # API 服务层
│   ├── user.ts         # 用户相关 API
│   └── typings.d.ts    # API 类型定义
├── utils/              # 工具函数库
│   ├── request.ts      # 请求工具
│   └── format.ts       # 格式化工具
├── config/             # 配置文件
│   └── routes.ts       # 路由配置
├── locales/            # 国际化文件
│   ├── zh-CN.ts        # 中文语言包
│   └── en-US.ts        # 英文语言包
└── typings.d.ts        # 全局类型定义
```

## 开发标准

### React 开发规范
- 使用函数组件和 React Hooks，避免类组件
- 遵循组件单一职责原则，保持组件功能聚焦
- 使用 TypeScript 进行严格类型检查，避免使用 any
- 合理使用 useMemo 和 useCallback 进行性能优化
- 使用自定义 Hooks 封装复用逻辑
- 遵循 React 18+ 的并发特性和最佳实践

### TypeScript 类型规范
```typescript
// 接口定义规范
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 组件 Props 接口
interface UserListProps {
  users: User[];
  loading?: boolean;
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: number) => Promise<void>;
}

// API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页数据类型
interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 组件开发模式
```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { Card, Button, Avatar, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import type { User } from '@/types';
import styles from './index.less';

interface UserCardProps {
  user: User;
  size?: 'small' | 'default' | 'large';
  showActions?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: number) => Promise<void>;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  size = 'default',
  showActions = true,
  onEdit,
  onDelete,
  className,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  // 事件处理函数使用 useCallback 优化
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [onEdit, user]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    
    setLoading(true);
    try {
      await onDelete(user.id);
      message.success(intl.formatMessage({ id: 'pages.user.delete.success' }));
    } catch (error) {
      message.error(intl.formatMessage({ id: 'pages.user.delete.error' }));
    } finally {
      setLoading(false);
    }
  }, [onDelete, user.id, intl]);

  // 计算属性使用 useMemo 优化
  const avatarSize = useMemo(() => {
    const sizeMap = { small: 32, default: 40, large: 48 };
    return sizeMap[size];
  }, [size]);

  return (
    <Card
      size={size === 'small' ? 'small' : 'default'}
      className={className}
      actions={showActions ? [
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={handleEdit}
        >
          {intl.formatMessage({ id: 'common.edit' })}
        </Button>,
        <Button
          key="delete"
          type="text"
          danger
          icon={<DeleteOutlined />}
          loading={loading}
          onClick={handleDelete}
        >
          {intl.formatMessage({ id: 'common.delete' })}
        </Button>
      ] : undefined}
    >
      <Card.Meta
        avatar={
          <Avatar
            size={avatarSize}
            src={user.avatar}
            icon={<UserOutlined />}
          />
        }
        title={user.name}
        description={
          <div className={styles.description}>
            <div>{user.email}</div>
            <div className={styles.role}>
              {intl.formatMessage({ id: `pages.user.role.${user.role}` })}
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default UserCard;
```

### API 服务层规范
```typescript
import { request } from '@umijs/max';
import type { User, CreateUserRequest, UpdateUserRequest } from './typings';

// API 基础路径
const API_PREFIX = '/api/v1';

// 获取用户列表
export async function getUserList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
}): Promise<API.Response<API.PaginatedData<User>>> {
  return request(`${API_PREFIX}/users`, {
    method: 'GET',
    params,
  });
}

// 创建用户
export async function createUser(data: CreateUserRequest): Promise<API.Response<User>> {
  return request(`${API_PREFIX}/users`, {
    method: 'POST',
    data,
  });
}

// 更新用户
export async function updateUser(
  id: number,
  data: UpdateUserRequest
): Promise<API.Response<User>> {
  return request(`${API_PREFIX}/users/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除用户
export async function deleteUser(id: number): Promise<API.Response<void>> {
  return request(`${API_PREFIX}/users/${id}`, {
    method: 'DELETE',
  });
}

// 批量删除用户
export async function batchDeleteUsers(ids: number[]): Promise<API.Response<void>> {
  return request(`${API_PREFIX}/users/batch`, {
    method: 'DELETE',
    data: { ids },
  });
}
```

### 状态管理规范
```typescript
// models/userModel.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getUserList, createUser, updateUser, deleteUser } from '@/services/user';
import type { User } from '@/types';

export default function useUserModel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 获取用户列表
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getUserList(params);
      if (response.success) {
        setUsers(response.data.list);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建用户
  const handleCreateUser = useCallback(async (userData: any) => {
    try {
      const response = await createUser(userData);
      if (response.success) {
        message.success('用户创建成功');
        fetchUsers(); // 刷新列表
        return response.data;
      }
    } catch (error) {
      message.error('用户创建失败');
      throw error;
    }
  }, [fetchUsers]);

  // 更新用户
  const handleUpdateUser = useCallback(async (id: number, userData: any) => {
    try {
      const response = await updateUser(id, userData);
      if (response.success) {
        message.success('用户更新成功');
        fetchUsers(); // 刷新列表
        return response.data;
      }
    } catch (error) {
      message.error('用户更新失败');
      throw error;
    }
  }, [fetchUsers]);

  // 删除用户
  const handleDeleteUser = useCallback(async (id: number) => {
    try {
      const response = await deleteUser(id);
      if (response.success) {
        message.success('用户删除成功');
        fetchUsers(); // 刷新列表
      }
    } catch (error) {
      message.error('用户删除失败');
      throw error;
    }
  }, [fetchUsers]);

  return {
    users,
    loading,
    total,
    fetchUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
  };
}
```

### 错误处理规范
```typescript
// utils/errorHandler.ts
import { message, notification } from 'antd';
import type { RequestError } from '@umijs/max';

// 统一错误处理
export const handleError = (error: RequestError, showMessage = true) => {
  const { response, message: errorMessage } = error;
  
  if (response) {
    const { status, data } = response;
    
    switch (status) {
      case 400:
        showMessage && message.error(data?.message || '请求参数错误');
        break;
      case 401:
        showMessage && message.error('未授权，请重新登录');
        // 跳转到登录页
        window.location.href = '/user/login';
        break;
      case 403:
        showMessage && message.error('权限不足');
        break;
      case 404:
        showMessage && message.error('请求的资源不存在');
        break;
      case 500:
        showMessage && notification.error({
          message: '服务器错误',
          description: '服务器内部错误，请稍后重试',
        });
        break;
      default:
        showMessage && message.error(data?.message || '请求失败');
    }
  } else {
    showMessage && message.error(errorMessage || '网络错误，请检查网络连接');
  }
  
  return Promise.reject(error);
};

// 请求拦截器配置
export const requestConfig = {
  errorHandler: handleError,
  requestInterceptors: [
    (config: any) => {
      // 添加认证头
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      const { data } = response;
      if (data && !data.success) {
        throw new Error(data.message || '请求失败');
      }
      return response;
    },
  ],
};
```

### 性能优化策略
```typescript
// 1. 组件懒加载
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const UserManagement = lazy(() => import('@/pages/User'));

const App = () => (
  <Suspense fallback={<Spin size="large" />}>
    <UserManagement />
  </Suspense>
);

// 2. 虚拟滚动优化
import { FixedSizeList as List } from 'react-window';

const VirtualUserList = ({ users }: { users: User[] }) => {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <UserCard user={users[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={users.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};

// 3. 防抖搜索
import { useDebounceFn } from 'ahooks';

const SearchInput = ({ onSearch }: { onSearch: (keyword: string) => void }) => {
  const { run: debouncedSearch } = useDebounceFn(onSearch, { wait: 300 });
  
  return (
    <Input.Search
      placeholder="搜索用户"
      onChange={(e) => debouncedSearch(e.target.value)}
      allowClear
    />
  );
};
```

## 样式开发规范

### Less 样式组织
```less
// components/UserCard/index.less
@import '~antd/es/style/themes/default.less';

.userCard {
  margin-bottom: @margin-md;
  transition: all @animation-duration-slow ease;
  border-radius: @border-radius-base;

  &:hover {
    box-shadow: @box-shadow-base;
    transform: translateY(-2px);
  }

  .description {
    .role {
      color: @text-color-secondary;
      font-size: @font-size-sm;
      margin-top: @margin-xs;

      &-admin {
        color: @error-color;
        font-weight: @font-weight-strong;
      }

      &-user {
        color: @success-color;
      }
    }
  }
}

// 响应式设计
@media (max-width: @screen-md) {
  .userCard {
    margin-bottom: @margin-sm;
  }
}
```

### CSS-in-JS 使用 (antd-style)
```typescript
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding: ${token.padding}px;
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
  `,
  
  userCard: css`
    margin-bottom: ${token.margin}px;
    transition: all ${token.motionDurationSlow};
    
    &:hover {
      box-shadow: ${token.boxShadow};
      transform: translateY(-2px);
    }
  `,
}));

const UserCard = () => {
  const { styles } = useStyles();
  
  return (
    <div className={styles.container}>
      <Card className={styles.userCard}>
        {/* 卡片内容 */}
      </Card>
    </div>
  );
};
```

## 国际化规范

### 语言包组织
```typescript
// locales/zh-CN.ts
export default {
  'pages.user.title': '用户管理',
  'pages.user.description': '管理系统用户信息',
  'pages.user.create': '新建用户',
  'pages.user.edit': '编辑用户',
  'pages.user.delete': '删除用户',
  'pages.user.delete.confirm': '确定要删除这个用户吗？',
  'pages.user.form.name': '用户名',
  'pages.user.form.email': '邮箱',
  'pages.user.form.role': '角色',
  'pages.user.role.admin': '管理员',
  'pages.user.role.user': '普通用户',
  'common.edit': '编辑',
  'common.delete': '删除',
  'common.cancel': '取消',
  'common.confirm': '确定',
};

// 组件中使用
import { useIntl } from '@umijs/max';

const UserPage = () => {
  const intl = useIntl();
  
  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.user.title' })}
      content={intl.formatMessage({ id: 'pages.user.description' })}
    >
      {/* 页面内容 */}
    </PageContainer>
  );
};
```

## 测试规范

### 组件测试
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import UserCard from './index';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ConfigProvider locale={zhCN}>
      {component}
    </ConfigProvider>
  );
};

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('应该正确渲染用户信息', () => {
    renderWithProvider(<UserCard user={mockUser} />);
    
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('zhangsan@example.com')).toBeInTheDocument();
  });

  it('应该在点击编辑按钮时调用 onEdit', () => {
    const mockOnEdit = jest.fn();
    renderWithProvider(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('编辑'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

## 构建和部署

### 环境配置
```typescript
// config/config.ts
import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Vibe Coding Starter',
  },
  routes: [
    { path: '/', redirect: '/welcome' },
    { path: '/welcome', component: './Welcome' },
    {
      path: '/admin',
      access: 'canAdmin',
      routes: [
        { path: '/admin/user', component: './User' },
      ],
    },
  ],
  npmClient: 'pnpm',
  tailwindcss: {},
});
```

### Docker 部署
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

记住：这个项目展示了 AI 驱动的前端开发最佳实践。始终编写清洁、可测试和可维护的代码，遵循 React、TypeScript 和 Ant Design 的最佳实践以及既定的项目模式。优先考虑用户体验、性能优化和代码质量。

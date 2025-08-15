# Vibe Coding Starter Antd UI

Vibe Coding Starter Antd UI 是一个基于 Ant Design Pro 的企业级前端应用模板，集成了 UmiJS、TypeScript 等常用工具，完全由AI工具开发，人工零代码编写，旨在提供一个Vibe Coding快速开发的起点示范工程。即可作为Vibe Coding的学习项目，也可以用来进行二次开发，迭代出生产级业务系统。

## 🚀 项目特性

- **🎨 现代化UI框架**: 基于 Ant Design Pro 5.x + React 19
- **⚡ 高性能构建**: UmiJS 4.x + TypeScript 5.x
- **🔐 完整权限系统**: 基于角色的访问控制 (RBAC)
- **📊 数据字典管理**: 可配置的数据字典系统
- **🐳 容器化部署**: Docker + Kubernetes 支持
- **🌐 国际化支持**: 多语言切换
- **📱 响应式设计**: 支持多种屏幕尺寸
- **🔍 API文档集成**: Swagger UI 集成
- **📝 日志系统**: 完整的前端日志记录

## 📁 项目结构

```
vibe-coding-starter-antd-ui/
├── config/                 # 配置文件
│   ├── config.ts           # UmiJS 配置
│   ├── defaultSettings.ts  # 默认设置
│   ├── proxy.ts            # 代理配置
│   └── routes.ts           # 路由配置
├── deploy/                 # 部署配置
│   ├── k8s/               # Kubernetes 配置
│   └── nginx.conf         # Nginx 配置
├── mock/                  # Mock 数据
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── components/        # 公共组件
│   ├── hooks/            # 自定义 Hooks
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务
│   └── utils/            # 工具函数
├── Dockerfile            # Docker 配置
└── package.json          # 项目依赖
```

## 🎯 核心功能模块

### 1. 用户认证模块 (`/user`)

**功能描述**: 完整的用户认证系统，支持登录、注册功能

**技术实现**:
- 基于 JWT Token 的身份验证
- 表单验证和错误处理
- 自动跳转和状态管理
- 密码强度验证

**页面组件**:
- `src/pages/user/login/index.tsx` - 用户登录页面
- `src/pages/user/register/index.tsx` - 用户注册页面

**主要特性**:
- 响应式登录/注册表单
- 记住登录状态
- 错误信息提示
- 自动重定向

### 2. 管理后台模块 (`/admin`)

#### 2.1 用户管理 (`/admin/users`)

**功能描述**: 系统用户的增删改查管理

**技术实现**:
- 基于 ProTable 的数据表格
- 数据字典集成 (用户角色、状态)
- 分页、搜索、排序功能
- 模态框表单编辑

**核心功能**:
- ✅ 用户列表展示
- ✅ 新增用户
- ✅ 编辑用户信息
- ✅ 删除用户
- ✅ 用户状态管理
- ✅ 角色权限分配
- ✅ 高级搜索过滤

**组件文件**: `src/pages/admin/users/index.tsx`

#### 2.2 文章管理 (`/admin/articles`)

**功能描述**: 内容管理系统，支持文章的全生命周期管理

**技术实现**:
- 富文本编辑器集成
- 文章状态流转管理
- 作者关联和权限控制
- 批量操作支持

**核心功能**:
- ✅ 文章列表管理
- ✅ 文章创建和编辑
- ✅ 文章状态管理 (草稿/发布/下线)
- ✅ 文章预览功能
- ✅ 作者信息关联
- ✅ 发布时间管理
- ✅ 批量删除操作

**组件文件**: `src/pages/admin/articles/index.tsx`

#### 2.3 数据字典管理 (`/admin/dict`)

**功能描述**: 系统配置数据的统一管理平台

**技术实现**:
- 分类管理 + 字典项管理
- 缓存机制优化
- 动态表单生成
- 实时数据同步

**核心功能**:
- ✅ 字典分类管理
- ✅ 字典项增删改查
- ✅ 字典项排序
- ✅ 启用/禁用状态控制
- ✅ 缓存管理
- ✅ 批量操作
- ✅ 数据导入导出

**组件文件**: `src/pages/admin/dict/index.tsx`

### 3. 文章展示模块 (`/articles`)

**功能描述**: 面向普通用户的文章浏览和管理界面

**技术实现**:
- 用户权限过滤
- 文章状态展示
- 个人文章管理
- 响应式卡片布局

**核心功能**:
- ✅ 个人文章列表
- ✅ 文章创建和编辑
- ✅ 文章预览
- ✅ 文章删除
- ✅ 状态筛选
- ✅ 搜索功能

**组件文件**: `src/pages/articles/index.tsx`

### 4. 欢迎页面 (`/welcome`)

**功能描述**: 系统首页和导航中心

**组件文件**: `src/pages/Welcome.tsx`

## 🧩 核心组件库

### 1. 数据字典组件

#### DictSelect - 字典选择器
**文件**: `src/components/DictSelect/index.tsx`
**功能**: 自动从数据字典获取选项的下拉选择器
**特性**:
- 自动数据加载
- 支持颜色标识
- 缓存优化
- 类型安全

#### DictTag - 字典标签
**文件**: `src/components/DictTag/index.tsx`
**功能**: 显示字典值的标签组件
**特性**:
- 自动颜色映射
- 状态指示
- 样式定制

#### DictProvider - 字典数据提供者
**文件**: `src/components/DictProvider/index.tsx`
**功能**: 全局数据字典状态管理
**特性**:
- 全局状态管理
- 缓存机制
- 自动刷新

### 2. 布局组件

#### Footer - 页脚组件
**文件**: `src/components/Footer/index.tsx`

#### HeaderDropdown - 头部下拉菜单
**文件**: `src/components/HeaderDropdown/index.tsx`

#### RightContent - 右侧内容区
**文件**: `src/components/RightContent/index.tsx`
**包含**: 用户头像下拉菜单、通知等

### 3. 功能组件

#### LoggerControl - 日志控制器
**文件**: `src/components/LoggerControl/index.tsx`
**功能**: 前端日志级别控制和管理

## 🔧 自定义 Hooks

### useDict Hook
**文件**: `src/hooks/useDict.ts`
**功能**: 数据字典相关的状态管理和操作
**提供的功能**:
- `useDict()` - 获取所有字典分类
- `useDictItems(categoryCode)` - 获取指定分类的字典项
- `useUserRole()` - 用户角色字典
- `useUserStatus()` - 用户状态字典
- `useArticleStatus()` - 文章状态字典
- `createDictSelectProps()` - 创建字典选择器属性
- `getStatusColor()` - 获取状态颜色

## 🌐 API 服务层

### 1. 用户服务 (`src/services/user/`)
- 用户认证 (登录/注册/登出)
- 用户信息管理
- 用户列表查询
- 权限验证

### 2. 文章服务 (`src/services/article/`)
- 文章 CRUD 操作
- 文章列表查询 (管理员/用户)
- 文章状态管理
- 文章搜索和过滤

### 3. 数据字典服务 (`src/services/dict/`)
- 字典分类管理
- 字典项管理
- 缓存控制
- 批量操作

### 4. Swagger 集成 (`src/services/swagger/`)
- API 文档自动生成
- 类型定义自动同步
- 接口测试工具


## 🐳 部署方案

### 1. Docker 部署
**配置文件**: `Dockerfile`
**特性**:
- 多阶段构建优化
- 非 root 用户运行
- Nginx 静态文件服务
- 生产环境优化

**构建命令**:
```bash
docker build -t vibe-coding-ui .
docker run -p 3000:3000 vibe-coding-ui
```

### 2. Kubernetes 部署
**配置目录**: `deploy/k8s/`
**包含文件**:
- `deployment.yaml` - 应用部署配置
- `service.yaml` - 服务配置
- `ingress.yaml` - 入口配置
- `configmap.yaml` - 配置映射
- `deploy.sh` - 自动部署脚本

**部署命令**:
```bash
cd deploy/k8s
./deploy.sh
```

### 3. 传统部署
**Nginx 配置**: `deploy/nginx.conf`
**构建产物**: `dist/` 目录

## 🛠️ 开发工具链

### 1. 代码质量
- **Biome**: 代码格式化和 Lint 检查
- **TypeScript**: 类型安全
- **Husky**: Git Hooks 管理
- **lint-staged**: 暂存文件检查

### 2. 构建工具
- **UmiJS 4.x**: 企业级前端框架
- **Webpack**: 模块打包
- **Babel**: JavaScript 编译

### 3. 开发体验
- **热重载**: 开发时实时更新
- **Mock 数据**: 本地开发数据模拟
- **代理配置**: API 请求代理
- **环境变量**: 多环境配置

## 📊 性能优化

### 1. 构建优化
- 代码分割 (Code Splitting)
- 懒加载 (Lazy Loading)
- 资源压缩
- 缓存策略

### 2. 运行时优化
- 数据字典缓存
- 组件懒加载
- 图片懒加载
- 请求防抖

### 3. 用户体验
- 加载状态指示
- 错误边界处理
- 响应式设计
- 无障碍访问

## 🔒 安全特性

### 1. 认证授权
- JWT Token 认证
- 角色权限控制
- 路由权限守卫
- API 权限验证

### 2. 数据安全
- XSS 防护
- CSRF 防护
- 输入验证
- 敏感信息脱敏

### 3. 部署安全
- 非 root 用户运行
- 安全头配置
- HTTPS 支持
- 容器安全扫描

## 🚀 快速开始

### 环境要求
- Node.js >= 20.0.0
- pnpm >= 8.0.0

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm start
```

### 构建生产版本
```bash
pnpm build
```


## 📝 开发规范

### 1. 代码规范
- 使用 TypeScript 严格模式
- 遵循 Biome 代码规范
- 组件使用 React.FC 类型
- 使用 Hooks 进行状态管理

### 2. 提交规范
- 使用 Conventional Commits 规范
- 提交前自动运行 lint 检查

### 3. 文档规范
- 组件必须包含 JSDoc 注释
- API 接口使用 OpenAPI 规范
- README 文档及时更新

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Ant Design Pro](https://pro.ant.design/) - 企业级 UI 设计语言
- [UmiJS](https://umijs.org/) - 可插拔的企业级前端应用框架
- [React](https://reactjs.org/) - 用于构建用户界面的 JavaScript 库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

---

**注意**: 本项目完全由 AI 工具开发，人工零代码编写，展示了 Vibe Coding 开发模式的强大能力。适合作为学习 AI 辅助开发的示例项目，也可以作为实际项目的起始模板。

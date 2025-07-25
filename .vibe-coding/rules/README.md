# Vibe Coding Starter Antd UI - AI 规则配置

本目录包含为 Vibe Coding Starter Antd UI 前端项目增强开发体验的 AI 配置文件。这些规则为基于 React + Ant Design Pro 的 AI 驱动开发提供上下文感知的辅助。

## 📁 规则结构

### `.cursor/` 目录
包含 Cursor IDE 规则格式 (`.mdc` 文件) 和元数据及作用域应用:

- **`main-rules.mdc`** - 应用于所有 React/TypeScript 文件的核心前端开发规则
- **`testing-rules.mdc`** - 针对测试文件和 Mock 的前端测试专用规则
- **`component-development.mdc`** - 针对 React 组件开发的专用规则

### `.augment/` 目录
包含 Augment Code AI 的上下文感知前端开发辅助规则:

- **`main-development-rules.md`** - 核心 React + TypeScript 开发标准和 Ant Design Pro 模式
- **`testing-guidelines.md`** - 综合前端测试策略和质量标准
- **`README.md`** - Augment 规则文档和使用指南

### 根级别
- **`.cursorrules`** - 向后兼容的传统格式规则文件

## 🤖 AI 平台支持

本前端项目为多个 AI 编程平台提供全面的规则:

### Cursor IDE 规则
- **格式**: 带有元数据和 glob 模式的 `.mdc` 文件
- **特性**: 上下文感知激活、作用域应用
- **最适合**: 使用 Cursor IDE 的 React 交互式开发

### Augment Code AI 规则
- **格式**: 包含综合前端指南的 Markdown 文件
- **特性**: 上下文感知辅助、React 组件生成模式
- **最适合**: 使用 Augment Code 平台的前端 AI 驱动开发

## 🎯 规则类型和作用域

### 主规则 (`main-rules.mdc`)
- **作用域**: 所有 React/TypeScript 文件、Less/CSS 样式文件
- **始终应用**: 是
- **目的**: 核心 React 开发标准、Ant Design Pro 组件模式、TypeScript 类型规范

### 测试规则 (`testing-rules.mdc`)
- **作用域**: 测试文件 (`*.test.ts`, `*.test.tsx`)、E2E 测试
- **始终应用**: 否 (上下文感知)
- **目的**: 前端测试策略、React Testing Library 模式、Playwright E2E 测试

### 组件开发规则 (`component-development.mdc`)
- **作用域**: React 组件文件、页面组件
- **始终应用**: 否 (上下文感知)
- **目的**: React 组件设计模式、Hooks 使用、性能优化

### Augment 规则作用域

#### 主开发规则 (`main-development-rules.md`)
- **作用域**: 所有 React/TypeScript 源文件、配置文件、项目结构
- **目的**: React 18+ 最佳实践、TypeScript 严格类型、Ant Design Pro 集成

#### 测试指南 (`testing-guidelines.md`)
- **作用域**: 前端测试文件、Mock 实现、E2E 测试工具
- **目的**: 前端测试金字塔、Jest + Playwright 测试、MSW Mock 服务

## 🚀 使用方法

### Cursor IDE 用户
1. 在 Cursor IDE 中打开前端项目
2. 规则将被自动检测和应用
3. 规则基于 React/TypeScript 文件模式和上下文进行作用域限定
4. 检查 Agent 侧边栏查看哪些前端规则处于活动状态

### Augment Code AI 用户
1. 在你喜欢的 IDE 中使用 Augment Code 扩展打开前端项目
2. 规则会从 `.augment/` 目录自动加载
3. AI 辅助将遵循 React + Ant Design Pro 既定的模式和标准
4. 使用引用你想要实现的前端组件模式的具体提示词

### 规则激活
- **主规则**: 在处理 React/TypeScript 文件时始终活跃
- **测试规则**: 在处理前端测试文件时激活
- **组件规则**: 在处理 React 组件开发时激活

### 手动规则调用

#### Cursor IDE
你可以在提示词中手动引用特定前端规则:
```
@main-rules 遵循 React 项目模式创建用户管理组件
@testing-rules 为用户组件编写综合前端测试
@component-development 创建可复用的 Ant Design 表格组件
```

#### Augment Code AI
在提示词中引用前端模式和指南:
```
"遵循主开发规则，为产品管理创建 React 页面组件"
"使用测试指南，为用户组件编写 Jest 和 Playwright 测试"
"遵循组件开发标准，创建可复用的 Ant Design Pro 表单组件"
```

## 📖 规则内容概览

### 主开发规则
- React 18+ 函数组件和 Hooks 最佳实践
- TypeScript 严格类型检查和接口设计
- Ant Design Pro 组件库使用规范
- UmiJS Max 框架集成模式
- 状态管理和 API 服务层设计
- 性能优化和用户体验提升
- Less/CSS 样式组织和响应式设计

### 测试指南
- 前端测试金字塔策略 (单元测试 70%, 集成测试 20%, E2E 测试 10%)
- React Testing Library 组件测试模式
- Jest Hooks 和 API 服务测试
- Playwright 端到端测试最佳实践
- MSW Mock 服务配置和数据管理
- 测试覆盖率要求和质量标准

### 组件开发标准
- React 组件设计原则和单一职责
- 函数组件标准结构和 Hooks 使用
- 自定义 Hooks 封装和复用
- Ant Design 组件集成和定制
- 表单处理和验证模式
- 列表组件和分页实现
- 性能优化 (React.memo, useMemo, useCallback)

## 🤖 AI 提示词最佳实践

### 上下文设置
与 AI 协作时，提供以下前端上下文:
- 你正在处理哪种组件类型 (页面组件/通用组件/业务组件)
- 相关的数据模型和 API 接口
- 前端代码库中的现有组件模式
- 所需的 Ant Design 组件和交互功能

### 示例提示词
```
"为 'UserManagement' 创建完整的前端页面，遵循现有的项目模式:
- 使用 TypeScript 和 React Hooks 的页面组件
- 集成 Ant Design Pro Table 和 Form 组件
- 实现用户 CRUD 操作的完整功能
- 使用 UmiJS useModel 进行状态管理
- 包含搜索、筛选和分页功能
- 支持国际化和响应式设计
- 完整的 Jest 单元测试和 Playwright E2E 测试"
```

### 代码生成请求
按以下结构组织前端请求:
1. "我需要为 [功能模块] 实现 [React 组件类型]"
2. "遵循项目中的现有 React 组件模式"
3. "包含适当的 TypeScript 类型定义和错误处理"
4. "生成对应的前端测试"
5. "添加 JSDoc 注释和国际化支持"

## 🔧 自定义配置

### 添加新规则
1. 在 `.cursor/` 目录中创建新的 `.mdc` 文件
2. 定义元数据 (description, globs, alwaysApply)
3. 以 markdown 格式添加前端规则内容
4. 使用相关 React/TypeScript 文件模式进行测试

### 修改现有规则
1. 编辑相应的 `.mdc` 文件
2. 如需要，更新 glob 模式以匹配前端文件
3. 使用目标 React 组件文件测试更改

### 规则元数据格式
```yaml
---
description: 前端规则目的的简要描述
globs: ["**/*.tsx", "**/*.ts", "**/*.less"]  # 要匹配的前端文件模式
alwaysApply: true  # 或 false 用于上下文感知应用
---
```

## 📚 与项目文档的集成

这些前端 AI 规则旨在与项目的开发文档无缝协作:

- **前端开发指南** (`docs/frontend-guide.md`) - 综合前端开发说明
- **组件设计规范** (`docs/component-design.md`) - UI 组件库设计和使用标准
- **API 集成指南** (`docs/api-integration.md`) - 前后端接口对接规范
- **测试策略文档** (`docs/testing-strategy.md`) - 前端测试方法论和工具链

## 🎯 效益

### 对前端开发者
- 遵循 React 项目模式的一致组件代码生成
- 减少前端框架文档和代码之间的上下文切换
- 自动遵循 TypeScript 和 Ant Design 项目标准
- 新前端团队成员更快上手

### 对 AI 辅助前端开发
- 上下文感知的 React 组件代码建议
- 模式一致的 Ant Design Pro 实现
- 综合前端测试生成
- 与前端文档对齐的开发

### 对项目维护
- 强制执行前端编码标准
- 一致的 React 组件架构实现
- 减少前端代码审查开销
- 提高前端代码质量和可维护性

## 🔄 版本控制

所有前端 AI 规则都进行版本控制，应该:
- 提交到代码仓库
- 在前端开发团队间共享
- 随着 React 生态系统和项目模式演进而更新
- 在重大前端架构更改时记录文档

## 📞 支持

关于前端 AI 规则使用的问题:
1. 查看 `docs/` 中的前端项目文档
2. 审查代码库中的现有 React 组件模式
3. 咨询前端开发团队
4. 基于团队反馈和演进的前端模式更新规则

---

这些前端 AI 规则体现了 Vibe Coding 的 AI 驱动前端开发理念，确保 AI 辅助与 React、TypeScript、Ant Design Pro 项目标准和架构决策完美对齐。

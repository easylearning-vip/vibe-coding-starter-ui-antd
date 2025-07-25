# Vibe Coding Starter - 前端部署指南

本指南将帮助您一步一步地将 Vibe Coding Starter 前端应用部署到 k3d 开发环境。

## 📋 前置条件检查

在开始部署之前，请确保您已经准备好以下环境：

### 1. 检查必需工具

```bash
# 检查 kubectl 是否安装
kubectl version --client

# 检查 docker 是否安装
docker --version

# 检查 Node.js 版本（需要 >= 20.0.0）
node --version

# 检查 pnpm 是否安装，如果没有请安装
pnpm --version
# 如果没有安装 pnpm，运行：
npm install -g pnpm
```

### 2. 检查 k3d 集群状态

```bash
# 检查集群是否运行
kubectl cluster-info

# 检查 vibe-dev 命名空间是否存在
kubectl get namespace vibe-dev
# 如果不存在，请先部署基础设施或创建命名空间：
# kubectl create namespace vibe-dev
```

### 3. 检查后端服务（推荐先部署）

```bash
# 检查后端 API 是否已部署
kubectl get pods -n vibe-dev -l app=vibe-api

# 如果后端未部署，请先部署后端服务：
# cd ../../../vibe-coding-starter-go-api/deploy/k8s
# ./deploy.sh
```

### 4. 一键检查所有前置条件（可选）

我们提供了一个便捷的检查脚本：

```bash
# 进入前端部署目录
cd vibe-coding-starter-antd-ui/deploy/k8s

# 运行前置条件检查
./check-prerequisites.sh
```

这个脚本会自动检查所有必需的工具和环境配置。

## 🚀 手动部署步骤（推荐新手使用）

### 步骤 1: 配置本地域名解析

```bash
# 添加域名到 hosts 文件
echo '127.0.0.1 www.vibe-dev.com' | sudo tee -a /etc/hosts
echo '127.0.0.1 api.vibe-dev.com' | sudo tee -a /etc/hosts

# 验证配置
grep vibe-dev.com /etc/hosts
```

### 步骤 2: 构建前端应用镜像

```bash
# 进入前端项目根目录
cd vibe-coding-starter-antd-ui

# 构建 Docker 镜像
docker build -t vibe-coding-starter-ui:latest .

# 标记镜像用于 k3d 镜像仓库
docker tag vibe-coding-starter-ui:latest localhost:5555/vibe-coding-starter-ui:latest

# 推送镜像到 k3d 镜像仓库
docker push localhost:5555/vibe-coding-starter-ui:latest

# 验证镜像是否推送成功
curl http://localhost:5555/v2/vibe-coding-starter-ui/tags/list
```

### 步骤 3: 部署 Kubernetes 资源

```bash
# 进入部署配置目录
cd deploy/k8s

# 按顺序部署各个资源
# 1. 部署配置文件 (ConfigMap)
kubectl apply -f configmap.yaml

# 2. 部署服务定义 (Service)
kubectl apply -f service.yaml

# 3. 部署应用 (Deployment)
kubectl apply -f deployment.yaml

# 4. 部署入口路由 (Ingress)
kubectl apply -f ingress.yaml
```

### 步骤 4: 验证部署状态

```bash
# 检查 Pod 状态
kubectl get pods -n vibe-dev -l app=vibe-ui

# 等待 Pod 就绪（可能需要几分钟）
kubectl wait --for=condition=ready pod -l app=vibe-ui -n vibe-dev --timeout=300s

# 检查所有资源状态
kubectl get all -n vibe-dev -l app=vibe-ui

# 检查 Ingress 状态
kubectl get ingress -n vibe-dev
```

### 步骤 5: 测试应用功能

```bash
# 1. 测试前端健康检查
curl http://www.vibe-dev.com:8000/health
# 应该返回: healthy

# 2. 测试前端页面访问
curl -I http://www.vibe-dev.com:8000/
# 应该返回: HTTP/1.1 200 OK

# 3. 测试 API 代理功能
curl http://www.vibe-dev.com:8000/api/v1/articles
# 应该返回 JSON 响应（可能是错误，但说明代理工作）

# 4. 在浏览器中访问
# 打开浏览器访问: http://www.vibe-dev.com:8000
```

## 🎯 访问地址

部署成功后，您可以通过以下地址访问应用：

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端应用** | http://www.vibe-dev.com:8000 | 主要的前端界面 |
| **前端健康检查** | http://www.vibe-dev.com:8000/health | 检查前端服务状态 |
| **API 代理** | http://www.vibe-dev.com:8000/api/* | 通过前端访问后端 API |
| **后端 API** | http://api.vibe-dev.com:8000 | 直接访问后端 API |

## ⚡ 快速部署（有经验用户）

如果您熟悉 Docker 和 Kubernetes，可以使用自动化脚本：

```bash
# 进入前端部署目录
cd vibe-coding-starter-antd-ui/deploy/k8s

# 一键部署
./deploy.sh

# 测试部署
./test-ui.sh

# 清理部署
./deploy.sh clean
```

## 🔧 故障排除

### 问题 1: 无法访问前端应用

**症状**: 浏览器无法打开 http://www.vibe-dev.com:8000

**解决步骤**:
```bash
# 1. 检查 hosts 文件配置
grep www.vibe-dev.com /etc/hosts
# 应该看到: 127.0.0.1 www.vibe-dev.com

# 2. 检查 k3d 集群状态
kubectl cluster-info
# 应该显示集群正在运行

# 3. 检查前端 Pod 状态
kubectl get pods -n vibe-dev -l app=vibe-ui
# 应该显示 2/2 Running

# 4. 检查 Ingress 状态
kubectl get ingress -n vibe-dev vibe-ui-ingress
# 应该显示 ADDRESS 字段有 IP 地址

# 5. 如果 Pod 不是 Running 状态，查看详情
kubectl describe pod -l app=vibe-ui -n vibe-dev
kubectl logs -l app=vibe-ui -n vibe-dev
```

### 问题 2: API 代理不工作

**症状**: 前端可以访问，但 API 调用失败

**解决步骤**:
```bash
# 1. 检查后端服务是否运行
kubectl get pods -n vibe-dev -l app=vibe-api
# 应该显示后端 Pod 正在运行

# 2. 测试后端服务直接访问
curl http://api.vibe-dev.com:8000/health
# 应该返回 JSON 健康状态

# 3. 测试 API 代理
curl http://www.vibe-dev.com:8000/api/v1/articles
# 应该返回响应（可能是错误，但说明代理工作）

# 4. 检查服务端点
kubectl get endpoints -n vibe-dev vibe-api-service
# 应该显示后端 Pod 的 IP 地址
```

### 问题 3: Docker 镜像构建失败

**症状**: `docker build` 命令失败

**解决步骤**:
```bash
# 1. 检查 Node.js 版本
node --version
# 需要 >= 20.0.0

# 2. 检查 pnpm 是否安装
pnpm --version
# 如果没有: npm install -g pnpm

# 3. 清理并重新安装依赖
cd vibe-coding-starter-antd-ui
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 4. 重新构建镜像
docker build -t vibe-coding-starter-ui:latest .
```

### 问题 4: 镜像推送失败

**症状**: 无法推送镜像到 k3d 镜像仓库

**解决步骤**:
```bash
# 1. 检查 k3d 镜像仓库是否可访问
curl http://localhost:5555/v2/_catalog

# 2. 如果无法访问，检查 k3d 集群状态
kubectl get nodes

# 3. 重新标记和推送镜像
docker tag vibe-coding-starter-ui:latest localhost:5555/vibe-coding-starter-ui:latest
docker push localhost:5555/vibe-coding-starter-ui:latest

# 4. 如果仍然失败，可能需要重启 k3d 集群
# k3d cluster stop vibe-dev
# k3d cluster start vibe-dev
```

### 问题 5: Pod 一直处于 Pending 状态

**症状**: Pod 无法调度到节点

**解决步骤**:
```bash
# 1. 查看 Pod 详情
kubectl describe pod -l app=vibe-ui -n vibe-dev

# 2. 检查节点资源
kubectl top nodes

# 3. 检查镜像是否存在
kubectl get events -n vibe-dev --sort-by='.lastTimestamp'
```

## 🧹 清理部署

### 手动清理步骤

```bash
# 1. 删除 Kubernetes 资源
cd vibe-coding-starter-antd-ui/deploy/k8s
kubectl delete -f ingress.yaml
kubectl delete -f deployment.yaml
kubectl delete -f service.yaml
kubectl delete -f configmap.yaml

# 2. 清理 Docker 镜像（可选）
docker rmi vibe-coding-starter-ui:latest
docker rmi localhost:5555/vibe-coding-starter-ui:latest
```

### 使用脚本清理（有经验用户）

```bash
cd vibe-coding-starter-antd-ui/deploy/k8s
./deploy.sh clean
```

## 📊 架构说明

### 网络架构图

```
用户浏览器
    ↓ (访问 www.vibe-dev.com:8000)
k3d LoadBalancer (NodePort 8000)
    ↓
Traefik Ingress Controller
    ↓
┌─────────────────────────────────────────────────────────┐
│                    Ingress 路由                          │
├─────────────────────┬───────────────────────────────────┤
│  www.vibe-dev.com   │  www.vibe-dev.com/api            │
│  (前端静态文件)        │  (API 代理到后端)                 │
│  ↓                  │  ↓                                │
│  vibe-ui-service    │  vibe-api-service                 │
│  (nginx:3000)       │  (go-api:8080)                    │
└─────────────────────┴───────────────────────────────────┘
```

### 服务组件

| 组件 | 作用 | 端口 | 副本数 |
|------|------|------|--------|
| **前端服务** | 提供静态文件和 SPA 路由 | 3000 | 2 |
| **后端服务** | 提供 REST API | 8080 | 2 |
| **Ingress** | 路由和负载均衡 | 80 | - |

### 数据流向

1. **用户访问** → `www.vibe-dev.com:8000`
2. **Ingress 路由** → 根据路径分发请求
   - `/` → 前端服务 (静态文件)
   - `/api/*` → 后端服务 (API)
3. **前端服务** → 返回 React 应用
4. **API 请求** → 通过 Ingress 代理到后端

## 🛠️ 开发和调试

### 本地开发模式

```bash
# 1. 安装依赖
cd vibe-coding-starter-antd-ui
pnpm install

# 2. 启动开发服务器
pnpm start:dev
# 访问: http://localhost:8000

# 3. 构建生产版本
pnpm build

# 4. 预览构建结果
pnpm preview
```

### Docker 本地测试

```bash
# 1. 构建测试镜像
docker build -t vibe-ui-test .

# 2. 运行容器
docker run -p 3000:3000 vibe-ui-test

# 3. 测试访问
curl http://localhost:3000/health
```

### 查看应用日志

```bash
# 实时查看前端日志
kubectl logs -f deployment/vibe-ui-deployment -n vibe-dev

# 查看最近的日志
kubectl logs --tail=100 deployment/vibe-ui-deployment -n vibe-dev

# 查看所有 Pod 的日志
kubectl logs -l app=vibe-ui -n vibe-dev --all-containers=true
```

### 监控和调试

```bash
# 查看资源使用情况
kubectl top pods -n vibe-dev -l app=vibe-ui

# 查看最近的事件
kubectl get events -n vibe-dev --sort-by='.lastTimestamp' | grep vibe-ui

# 进入容器调试
kubectl exec -it deployment/vibe-ui-deployment -n vibe-dev -- /bin/sh
```

## 📚 相关文档

- **详细技术文档**: [k8s/README.md](k8s/README.md)
- **项目主文档**: [../README.md](../README.md)
- **后端部署文档**: [../../vibe-coding-starter-go-api/deploy/k8s/README.md](../../vibe-coding-starter-go-api/deploy/k8s/README.md)

## 💡 小贴士

1. **首次部署**: 建议先部署后端服务，再部署前端
2. **开发调试**: 使用 `kubectl logs -f` 实时查看日志
3. **网络问题**: 检查 hosts 文件和 Ingress 配置
4. **资源不足**: 使用 `kubectl top` 检查资源使用情况
5. **镜像问题**: 确保本地镜像仓库正常运行

---

**需要帮助？** 如果遇到问题，请按照故障排除部分的步骤进行诊断，或查看相关日志获取更多信息。

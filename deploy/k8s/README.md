# Vibe Coding Starter UI - K8s 部署资源

本目录包含将 Vibe Coding Starter UI 前端应用部署到 k3d 开发环境的所有 Kubernetes 资源清单。

## 文件说明

- `configmap.yaml` - Nginx 配置文件
- `service.yaml` - 服务定义
- `deployment.yaml` - 部署配置
- `ingress.yaml` - 入口路由配置
- `deploy.sh` - 自动化部署脚本
- `README.md` - 本文档

## 快速部署

### 方式一：使用自动化脚本（推荐）

```bash
# 进入部署目录
cd vibe-coding-starter-antd-ui/deploy/k8s

# 执行部署脚本
./deploy.sh

# 清理部署
./deploy.sh clean
```

### 方式二：手动部署

```bash
# 1. 设置本地镜像仓库
docker run -d --name local-registry --restart=always -p 5555:5000 registry:2
docker network connect k3d-vibe-dev local-registry

# 2. 构建和推送镜像
cd vibe-coding-starter-antd-ui
docker build -t localhost:5555/vibe-coding-starter-ui:latest .
docker push localhost:5555/vibe-coding-starter-ui:latest

# 3. 部署 Kubernetes 资源
cd deploy/k8s
kubectl apply -f configmap.yaml
kubectl apply -f service.yaml
kubectl apply -f deployment.yaml
kubectl apply -f ingress.yaml

# 4. 等待部署就绪
kubectl wait --for=condition=ready pod -l app=vibe-ui -n vibe-dev --timeout=300s

# 5. 配置本地访问
echo '127.0.0.1 www.vibe-dev.com' | sudo tee -a /etc/hosts
```

## 验证部署

```bash
# 查看部署状态
kubectl get all -n vibe-dev -l app=vibe-ui

# 测试前端访问
curl http://www.vibe-dev.com:8000/health

# 测试 API 代理
curl http://www.vibe-dev.com:8000/api/health

# 查看应用日志
kubectl logs -f deployment/vibe-ui-deployment -n vibe-dev
```

## 访问地址

- **前端应用**: http://www.vibe-dev.com:8000
- **健康检查**: http://www.vibe-dev.com:8000/health
- **API 代理**: http://www.vibe-dev.com:8000/api/*

## 架构说明

### 应用架构

前端应用采用以下架构：

1. **构建阶段**: 使用 Node.js 20 Alpine 镜像构建 React 应用
2. **运行阶段**: 使用 Nginx Alpine 镜像提供静态文件服务
3. **API 代理**: Nginx 配置代理 `/api/*` 请求到后端服务
4. **健康检查**: 提供 `/health` 端点用于 K8s 健康检查

### 网络配置

- **容器端口**: 3000 (Nginx)
- **服务端口**: 3000
- **Ingress**: 通过 www.vibe-dev.com:8000 访问
- **API 代理**: `/api/*` -> `vibe-api-service.vibe-dev.svc.cluster.local:8080`

## 故障排除

### 常见问题

1. **镜像拉取失败**
   ```bash
   # 检查本地仓库
   curl http://localhost:5555/v2/_catalog
   
   # 重新推送镜像
   docker push localhost:5555/vibe-coding-starter-ui:latest
   ```

2. **Pod 启动失败**
   ```bash
   # 查看 Pod 详情
   kubectl describe pod -l app=vibe-ui -n vibe-dev
   
   # 查看日志
   kubectl logs -l app=vibe-ui -n vibe-dev
   ```

3. **前端访问失败**
   ```bash
   # 检查 hosts 文件
   grep www.vibe-dev.com /etc/hosts
   
   # 检查 Ingress
   kubectl get ingress -n vibe-dev vibe-ui-ingress
   
   # 检查服务端点
   kubectl get endpoints -n vibe-dev vibe-ui-service
   ```

4. **API 代理失败**
   ```bash
   # 检查后端服务
   kubectl get svc vibe-api-service -n vibe-dev
   
   # 测试后端连接
   kubectl exec -it deployment/vibe-ui-deployment -n vibe-dev -- nc -zv vibe-api-service.vibe-dev.svc.cluster.local 8080
   ```

5. **构建失败**
   ```bash
   # 检查 Node.js 版本
   node --version  # 需要 >= 20.0.0
   
   # 检查 pnpm
   pnpm --version
   
   # 清理依赖重新安装
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### 清理部署

```bash
# 使用脚本清理
./deploy.sh clean

# 或手动清理
kubectl delete -f .
```

## 配置说明

### 应用配置

前端应用使用以下配置：

- **构建工具**: pnpm + UmiJS
- **Web 服务器**: Nginx
- **端口**: 容器内监听 3000 端口
- **健康检查**: `/health` 端点
- **API 代理**: `/api/*` 代理到后端服务

### 资源限制

- **CPU**: 请求 50m，限制 200m
- **内存**: 请求 64Mi，限制 256Mi
- **副本数**: 2 个实例

### 安全配置

- 使用非 root 用户运行 (nginx-user:1001)
- 删除所有 Linux capabilities
- 启用安全头部 (X-Frame-Options, CSP 等)

### Nginx 配置特性

- **Gzip 压缩**: 启用静态资源压缩
- **缓存策略**: 静态资源缓存 1 年
- **SPA 支持**: 支持客户端路由
- **API 代理**: 代理 API 请求到后端
- **安全头部**: 添加安全相关 HTTP 头部

## 开发说明

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm start

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### Docker 本地测试

```bash
# 构建镜像
docker build -t vibe-ui-test .

# 运行容器
docker run -p 3000:3000 vibe-ui-test

# 测试访问
curl http://localhost:3000/health
```

## 更多信息

- 前端项目基于 Ant Design Pro
- 使用 UmiJS 作为构建工具
- 支持 TypeScript 和现代 React 特性
- 集成了完整的开发工具链

如需更多帮助，请查看项目根目录的 README.md 文件。

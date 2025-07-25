#!/bin/bash

# Vibe Coding Starter UI - K8s 开发环境部署脚本
# 用于快速部署前端应用到 k3d 开发环境

set -e

# 获取脚本所在目录的绝对路径（在脚本开始时保存）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查前置条件
check_prerequisites() {
    log_info "检查前置条件..."
    
    # 检查 kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl 未安装或不在 PATH 中"
        exit 1
    fi
    
    # 检查 docker
    if ! command -v docker &> /dev/null; then
        log_error "docker 未安装或不在 PATH 中"
        exit 1
    fi
    
    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装或不在 PATH 中，请运行: npm install -g pnpm"
        exit 1
    fi
    
    # 检查 k3d 集群
    if ! kubectl cluster-info &> /dev/null; then
        log_error "无法连接到 Kubernetes 集群，请确保 k3d 集群正在运行"
        exit 1
    fi
    
    # 检查命名空间
    if ! kubectl get namespace vibe-dev &> /dev/null; then
        log_error "命名空间 vibe-dev 不存在，请先部署基础设施"
        exit 1
    fi
    
    log_success "前置条件检查通过"
}

# 验证 k3d 镜像仓库
verify_k3d_registry() {
    log_info "验证 k3d 镜像仓库..."

    # 验证仓库连接（从外部访问使用 localhost:5555）
    if curl -s http://localhost:5555/v2/_catalog > /dev/null; then
        log_success "k3d 镜像仓库连接正常"
    else
        log_error "无法连接到 k3d 镜像仓库"
        log_error "请确保 k3d 集群正在运行且镜像仓库已启动"
        exit 1
    fi
}

# 构建和推送镜像
build_and_push_image() {
    log_info "构建和推送前端应用镜像..."
    
    # 进入项目根目录
    cd "$(dirname "$0")/../.."
    
    # 构建镜像
    log_info "构建 Docker 镜像..."
    docker build -t vibe-coding-starter-ui:latest .
    
    # 标记镜像
    docker tag vibe-coding-starter-ui:latest localhost:5555/vibe-coding-starter-ui:latest

    # 推送镜像
    log_info "推送镜像到 k3d 镜像仓库..."
    docker push localhost:5555/vibe-coding-starter-ui:latest

    # 验证镜像
    if curl -s http://localhost:5555/v2/vibe-coding-starter-ui/tags/list | grep -q "latest"; then
        log_success "镜像构建和推送完成"
    else
        log_error "镜像推送失败"
        exit 1
    fi
}

# 部署 Kubernetes 资源
deploy_k8s_resources() {
    log_info "部署 Kubernetes 资源..."

    # 进入部署目录
    cd "$SCRIPT_DIR"

    # 验证我们在正确的目录
    if [[ ! -f "configmap.yaml" ]]; then
        log_error "找不到 configmap.yaml 文件，当前目录: $(pwd)"
        log_error "脚本目录: $SCRIPT_DIR"
        exit 1
    fi
    
    # 部署 ConfigMap
    log_info "部署 ConfigMap..."
    kubectl apply -f configmap.yaml
    
    # 部署 Service
    log_info "部署 Service..."
    kubectl apply -f service.yaml
    
    # 部署 Deployment
    log_info "部署 Deployment..."
    kubectl apply -f deployment.yaml
    
    # 部署 Ingress
    log_info "部署 Ingress..."
    kubectl apply -f ingress.yaml
    
    log_success "Kubernetes 资源部署完成"
}

# 等待部署就绪
wait_for_deployment() {
    log_info "等待部署就绪..."
    
    # 等待 Pod 就绪
    if kubectl wait --for=condition=ready pod -l app=vibe-ui -n vibe-dev --timeout=300s; then
        log_success "部署就绪"
    else
        log_error "部署超时，请检查 Pod 状态"
        kubectl get pods -n vibe-dev -l app=vibe-ui
        kubectl describe pods -n vibe-dev -l app=vibe-ui
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 显示资源状态
    echo
    log_info "部署状态："
    kubectl get all -n vibe-dev -l app=vibe-ui
    
    echo
    log_info "Pod 详情："
    kubectl get pods -n vibe-dev -l app=vibe-ui -o wide
    
    echo
    log_info "服务端点："
    kubectl get endpoints -n vibe-dev vibe-ui-service
    
    echo
    log_info "Ingress 状态："
    kubectl get ingress -n vibe-dev vibe-ui-ingress
}

# 配置本地访问
setup_local_access() {
    log_info "配置本地访问..."
    
    # 检查 hosts 文件
    if grep -q "www.vibe-dev.com" /etc/hosts; then
        log_info "hosts 文件已配置"
    else
        log_warning "请手动添加以下行到 /etc/hosts 文件："
        echo "127.0.0.1 www.vibe-dev.com"
        echo
        log_warning "运行以下命令："
        echo "echo '127.0.0.1 www.vibe-dev.com' | sudo tee -a /etc/hosts"
    fi
}

# 测试前端访问
test_ui_access() {
    log_info "测试前端访问..."
    
    # 等待一段时间让服务完全启动
    sleep 10
    
    # 测试健康检查
    if curl -s -f http://www.vibe-dev.com:8000/health > /dev/null; then
        log_success "前端健康检查通过"
        echo "前端访问地址: http://www.vibe-dev.com:8000"
    else
        log_warning "前端健康检查失败，可能需要等待更长时间或检查配置"
        log_info "您可以手动测试："
        echo "curl http://www.vibe-dev.com:8000/health"
    fi
}

# 显示后续步骤
show_next_steps() {
    echo
    log_success "前端部署完成！"
    echo
    echo "后续步骤："
    echo "1. 测试前端访问:"
    echo "   curl http://www.vibe-dev.com:8000/health"
    echo "   浏览器访问: http://www.vibe-dev.com:8000"
    echo
    echo "2. 查看应用日志:"
    echo "   kubectl logs -f deployment/vibe-ui-deployment -n vibe-dev"
    echo
    echo "3. 查看应用状态:"
    echo "   kubectl get all -n vibe-dev -l app=vibe-ui"
    echo
    echo "4. 测试 API 代理:"
    echo "   curl http://www.vibe-dev.com:8000/api/health"
    echo
    echo "5. 清理部署:"
    echo "   ./deploy.sh clean"
}

# 清理部署
clean_deployment() {
    log_info "清理前端部署..."
    
    cd "$(dirname "$0")"
    
    kubectl delete -f ingress.yaml --ignore-not-found=true
    kubectl delete -f deployment.yaml --ignore-not-found=true
    kubectl delete -f service.yaml --ignore-not-found=true
    kubectl delete -f configmap.yaml --ignore-not-found=true
    
    log_success "前端部署清理完成"
}

# 主函数
main() {
    case "${1:-deploy}" in
        "deploy")
            log_info "开始部署 Vibe Coding Starter UI 到 k3d 开发环境..."
            check_prerequisites
            verify_k3d_registry
            build_and_push_image
            deploy_k8s_resources
            wait_for_deployment
            verify_deployment
            setup_local_access
            test_ui_access
            show_next_steps
            ;;
        "clean")
            clean_deployment
            ;;
        "help"|"-h"|"--help")
            echo "用法: $0 [deploy|clean|help]"
            echo "  deploy: 部署前端应用 (默认)"
            echo "  clean:  清理部署"
            echo "  help:   显示帮助信息"
            ;;
        *)
            log_error "未知命令: $1"
            echo "运行 '$0 help' 查看帮助信息"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"

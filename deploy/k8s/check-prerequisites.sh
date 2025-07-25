#!/bin/bash

# Vibe Coding Starter UI - 前置条件检查脚本
# 帮助新手验证部署环境是否就绪

# set -e  # 注释掉，因为我们希望即使某些检查失败也要继续运行

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
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 检查工具是否安装
check_tool() {
    local tool=$1
    local version_cmd=$2
    local install_hint=$3
    
    if command -v $tool &> /dev/null; then
        local version=$($version_cmd 2>&1 | head -n1)
        log_success "$tool 已安装: $version"
        return 0
    else
        log_error "$tool 未安装"
        if [ -n "$install_hint" ]; then
            echo "   安装提示: $install_hint"
        fi
        return 1
    fi
}

# 检查 Node.js 版本
check_node_version() {
    if command -v node &> /dev/null; then
        local version=$(node --version | sed 's/v//')
        local major_version=$(echo $version | cut -d. -f1)
        
        if [ "$major_version" -ge 20 ]; then
            log_success "Node.js 版本符合要求: v$version (>= 20.0.0)"
            return 0
        else
            log_error "Node.js 版本过低: v$version (需要 >= 20.0.0)"
            echo "   请升级 Node.js 到 20.0.0 或更高版本"
            return 1
        fi
    else
        log_error "Node.js 未安装"
        echo "   请安装 Node.js 20.0.0 或更高版本"
        return 1
    fi
}

# 检查 k3d 集群
check_k3d_cluster() {
    log_info "检查 k3d 集群状态..."
    
    if kubectl cluster-info &> /dev/null; then
        log_success "k3d 集群正在运行"
        
        # 检查 vibe-dev 命名空间
        if kubectl get namespace vibe-dev &> /dev/null; then
            log_success "vibe-dev 命名空间存在"
        else
            log_warning "vibe-dev 命名空间不存在"
            echo "   请创建命名空间: kubectl create namespace vibe-dev"
        fi
        return 0
    else
        log_error "无法连接到 k3d 集群"
        echo "   请确保 k3d 集群正在运行"
        return 1
    fi
}

# 检查后端服务
check_backend_service() {
    log_info "检查后端服务状态..."
    
    if kubectl get pods -n vibe-dev -l app=vibe-api &> /dev/null; then
        local running_pods=$(kubectl get pods -n vibe-dev -l app=vibe-api --no-headers | grep Running | wc -l)
        if [ "$running_pods" -gt 0 ]; then
            log_success "后端服务正在运行 ($running_pods 个 Pod)"
        else
            log_warning "后端服务 Pod 未就绪"
            echo "   请检查后端服务状态或先部署后端服务"
        fi
    else
        log_warning "后端服务未部署"
        echo "   建议先部署后端服务: cd ../../vibe-coding-starter-go-api/deploy/k8s && ./deploy.sh"
    fi
}

# 检查 hosts 文件
check_hosts_file() {
    log_info "检查 hosts 文件配置..."
    
    if grep -q "www.vibe-dev.com" /etc/hosts; then
        log_success "www.vibe-dev.com 已配置"
    else
        log_warning "www.vibe-dev.com 未配置"
        echo "   请添加: echo '127.0.0.1 www.vibe-dev.com' | sudo tee -a /etc/hosts"
    fi
    
    if grep -q "api.vibe-dev.com" /etc/hosts; then
        log_success "api.vibe-dev.com 已配置"
    else
        log_warning "api.vibe-dev.com 未配置"
        echo "   请添加: echo '127.0.0.1 api.vibe-dev.com' | sudo tee -a /etc/hosts"
    fi
}

# 检查 k3d 镜像仓库
check_k3d_registry() {
    log_info "检查 k3d 镜像仓库..."

    # 测试仓库连接
    if curl -s http://localhost:5555/v2/_catalog > /dev/null; then
        log_success "k3d 镜像仓库连接正常"
    else
        log_warning "k3d 镜像仓库连接失败"
        echo "   请确保 k3d 集群正在运行且镜像仓库已启动"
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "  Vibe Coding Starter UI - 前置条件检查"
    echo "=========================================="
    echo
    
    local checks_passed=0
    local total_checks=0
    
    # 检查必需工具
    log_info "检查必需工具..."
    check_tool "kubectl" "kubectl version --client" && ((checks_passed++)) || true
    ((total_checks++))
    
    check_tool "docker" "docker --version" && ((checks_passed++)) || true
    ((total_checks++))
    
    check_node_version && ((checks_passed++)) || true
    ((total_checks++))
    
    check_tool "pnpm" "pnpm --version" "npm install -g pnpm" && ((checks_passed++)) || true
    ((total_checks++))
    
    echo
    
    # 检查环境配置
    check_k3d_cluster && ((checks_passed++)) || true
    ((total_checks++))
    
    check_backend_service
    check_hosts_file
    check_k3d_registry
    
    echo
    echo "=========================================="
    echo "检查结果: $checks_passed/$total_checks 项通过"
    
    if [ $checks_passed -eq $total_checks ]; then
        log_success "所有检查通过！您可以开始部署前端应用了。"
        echo
        echo "下一步："
        echo "1. cd vibe-coding-starter-antd-ui"
        echo "2. 按照 deploy/README.md 中的手动部署步骤操作"
    else
        log_warning "部分检查未通过，请根据上述提示解决问题后再开始部署。"
    fi
    echo "=========================================="
}

# 执行主函数
main "$@"

#!/bin/bash

# Vibe Coding Starter UI - 测试脚本
# 用于测试前端应用的各项功能

set -e

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

# 测试前端健康检查
test_health_check() {
    log_info "测试前端健康检查..."
    
    if curl -s -f http://www.vibe-dev.com:8000/health > /dev/null; then
        log_success "前端健康检查通过"
        return 0
    else
        log_error "前端健康检查失败"
        return 1
    fi
}

# 测试前端页面访问
test_frontend_access() {
    log_info "测试前端页面访问..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://www.vibe-dev.com:8000/)
    
    if [ "$response" = "200" ]; then
        log_success "前端页面访问正常 (HTTP $response)"
        return 0
    else
        log_error "前端页面访问失败 (HTTP $response)"
        return 1
    fi
}

# 测试 API 代理
test_api_proxy() {
    log_info "测试 API 代理..."

    # 测试 API 代理是否能连接到后端（即使返回错误也说明代理工作）
    response=$(curl -s -o /dev/null -w "%{http_code}" http://www.vibe-dev.com:8000/api/v1/articles)

    if [ "$response" = "200" ] || [ "$response" = "500" ] || [ "$response" = "400" ]; then
        log_success "API 代理工作正常 (HTTP $response)"
        return 0
    else
        log_warning "API 代理测试失败 (HTTP $response)，可能后端服务未启动"
        return 1
    fi
}

# 测试静态资源
test_static_resources() {
    log_info "测试静态资源..."
    
    # 测试 favicon
    response=$(curl -s -o /dev/null -w "%{http_code}" http://www.vibe-dev.com:8000/favicon.ico)
    
    if [ "$response" = "200" ]; then
        log_success "静态资源访问正常"
        return 0
    else
        log_warning "静态资源访问异常 (HTTP $response)"
        return 1
    fi
}

# 检查 K8s 资源状态
check_k8s_resources() {
    log_info "检查 Kubernetes 资源状态..."
    
    echo
    log_info "Pod 状态："
    kubectl get pods -n vibe-dev -l app=vibe-ui
    
    echo
    log_info "Service 状态："
    kubectl get svc -n vibe-dev -l app=vibe-ui
    
    echo
    log_info "Ingress 状态："
    kubectl get ingress -n vibe-dev -l app=vibe-ui
    
    echo
    log_info "Pod 详细信息："
    kubectl describe pods -n vibe-dev -l app=vibe-ui | grep -E "(Status|Ready|Restart)"
}

# 显示访问信息
show_access_info() {
    echo
    log_info "访问信息："
    echo "前端应用: http://www.vibe-dev.com:8000"
    echo "健康检查: http://www.vibe-dev.com:8000/health"
    echo "API 代理: http://www.vibe-dev.com:8000/api/*"
    echo
    log_info "如果无法访问，请检查："
    echo "1. hosts 文件是否配置: grep www.vibe-dev.com /etc/hosts"
    echo "2. k3d 集群是否运行: kubectl cluster-info"
    echo "3. Pod 是否就绪: kubectl get pods -n vibe-dev -l app=vibe-ui"
}

# 主函数
main() {
    case "${1:-test}" in
        "test")
            log_info "开始测试 Vibe Coding Starter UI..."
            
            # 运行所有测试
            tests_passed=0
            total_tests=4
            
            test_health_check && ((tests_passed++)) || true
            test_frontend_access && ((tests_passed++)) || true
            test_api_proxy && ((tests_passed++)) || true
            test_static_resources && ((tests_passed++)) || true
            
            echo
            log_info "测试结果: $tests_passed/$total_tests 通过"
            
            if [ $tests_passed -eq $total_tests ]; then
                log_success "所有测试通过！"
            elif [ $tests_passed -gt 0 ]; then
                log_warning "部分测试通过，请检查失败的项目"
            else
                log_error "所有测试失败，请检查部署状态"
            fi
            
            show_access_info
            ;;
        "status")
            check_k8s_resources
            ;;
        "help"|"-h"|"--help")
            echo "用法: $0 [test|status|help]"
            echo "  test:   运行所有测试 (默认)"
            echo "  status: 显示 K8s 资源状态"
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

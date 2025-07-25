#!/bin/bash

# 数据字典功能测试脚本
# 使用大分辨率测试新增的数据字典功能

set -e

echo "🚀 开始数据字典功能测试..."

# 检查依赖
echo "📦 检查测试依赖..."
if ! command -v npx &> /dev/null; then
    echo "❌ npx 未安装，请先安装 Node.js"
    exit 1
fi

# 安装 Playwright 浏览器（如果需要）
echo "🌐 确保 Playwright 浏览器已安装..."
npx playwright install chromium

# 检查后端API是否运行
echo "🔍 检查后端API服务..."
if ! curl -s http://localhost:8081/health > /dev/null; then
    echo "⚠️  后端API服务未运行，请先启动 Go API 服务"
    echo "   在 vibe-coding-starter-go-api 目录中运行："
    echo "   go run cmd/server/main.go -c configs/config-k3d.yaml"
    exit 1
fi

echo "✅ 后端API服务正常运行"

# 运行数据字典管理功能测试
echo "🧪 运行数据字典管理功能测试..."
npx playwright test e2e/dict-management.spec.ts --project=chromium --reporter=html

# 运行数据字典集成测试
echo "🔗 运行数据字典集成测试..."
npx playwright test e2e/dict-integration.spec.ts --project=chromium --reporter=html

# 运行4K分辨率测试
echo "🖥️  运行4K分辨率测试..."
npx playwright test e2e/dict-management.spec.ts --project=chromium-4k --reporter=html

echo "📊 生成测试报告..."
npx playwright show-report

echo "✅ 数据字典功能测试完成！"
echo "📁 测试结果和截图保存在 test-results/ 目录中"
echo "📋 详细测试报告可通过 npx playwright show-report 查看"

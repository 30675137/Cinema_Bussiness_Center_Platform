#!/bin/bash

# 商品工作台 Playwright 测试脚本
echo "🧪 开始运行 Playwright 测试..."
echo "========================================"

# 确保依赖已安装
if ! command -v npx &> /dev/null; then
    echo "❌ 错误: npx 未找到，请先安装 Node.js"
    exit 1
fi

# 检查 Playwright 是否已安装
if ! npx playwright --version &> /dev/null; then
    echo "📦 安装 Playwright 浏览器..."
    npx playwright install
fi

# 运行测试
echo "🚀 运行商品工作台测试..."
npx playwright test products-workspace.spec.ts --reporter=list

# 检查测试结果
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "✅ 所有测试通过！"
    echo "========================================"
else
    echo ""
    echo "❌ 测试失败！"
    echo "========================================"
    echo "📊 生成详细报告..."
    npx playwright show-report
fi

exit $TEST_RESULT

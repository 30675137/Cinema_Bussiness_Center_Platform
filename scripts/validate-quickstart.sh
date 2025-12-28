#!/bin/bash
# @spec O003-beverage-order
# quickstart.md 验证脚本
# 验证 O003-beverage-order 开发环境和 API 是否正常工作

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查结果计数
PASSED=0
FAILED=0
SKIPPED=0

check_result() {
    local name=$1
    local result=$2
    if [ "$result" -eq 0 ]; then
        log_info "✓ $name"
        PASSED=$((PASSED+1))
    else
        log_error "✗ $name"
        FAILED=$((FAILED+1))
    fi
}

skip_check() {
    local name=$1
    log_warn "⊘ $name (跳过)"
    SKIPPED=$((SKIPPED+1))
}

# =====================
# 1. 目录结构检查
# =====================
echo ""
echo "========================================="
echo "1. 目录结构检查"
echo "========================================="

# 后端目录
if [ -d "backend/src/main/java/com/cinema/beverage" ]; then
    check_result "后端 beverage 模块目录存在" 0
else
    check_result "后端 beverage 模块目录存在" 1
fi

# 前端目录
if [ -d "frontend/src/features/beverage-order-management" ]; then
    check_result "B端 beverage-order-management 模块目录存在" 0
else
    check_result "B端 beverage-order-management 模块目录存在" 1
fi

# C端目录
if [ -d "hall-reserve-taro/src/pages/beverage" ]; then
    check_result "C端 beverage 页面目录存在" 0
else
    check_result "C端 beverage 页面目录存在" 1
fi

# =====================
# 2. 关键文件检查
# =====================
echo ""
echo "========================================="
echo "2. 关键文件检查"
echo "========================================="

# 后端 Entity 文件
for entity in Beverage BeverageSpec BeverageOrder BeverageOrderItem QueueNumber; do
    if [ -f "backend/src/main/java/com/cinema/beverage/entity/${entity}.java" ]; then
        check_result "Entity: ${entity}.java 存在" 0
    else
        check_result "Entity: ${entity}.java 存在" 1
    fi
done

# 后端 Controller 文件
for controller in BeverageController BeverageOrderController QueueNumberController; do
    if [ -f "backend/src/main/java/com/cinema/beverage/controller/${controller}.java" ]; then
        check_result "Controller: ${controller}.java 存在" 0
    else
        check_result "Controller: ${controller}.java 存在" 1
    fi
done

# 种子数据
if [ -f "backend/src/main/resources/db/seed/beverages.sql" ]; then
    check_result "种子数据文件 beverages.sql 存在" 0
else
    check_result "种子数据文件 beverages.sql 存在" 1
fi

# API 契约
if [ -f "specs/O003-beverage-order/contracts/api.yaml" ]; then
    check_result "API 契约 api.yaml 存在" 0
else
    check_result "API 契约 api.yaml 存在" 1
fi

# Postman 集合
if [ -f "specs/O003-beverage-order/postman/O003-beverage-order.postman_collection.json" ]; then
    check_result "Postman 集合存在" 0
else
    check_result "Postman 集合存在" 1
fi

# =====================
# 3. 依赖检查
# =====================
echo ""
echo "========================================="
echo "3. 依赖检查"
echo "========================================="

# 检查 Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    check_result "Java 已安装: $JAVA_VERSION" 0
else
    check_result "Java 已安装" 1
fi

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_result "Node.js 已安装: $NODE_VERSION" 0
else
    check_result "Node.js 已安装" 1
fi

# 检查 npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_result "npm 已安装: $NPM_VERSION" 0
else
    check_result "npm 已安装" 1
fi

# =====================
# 4. 配置检查
# =====================
echo ""
echo "========================================="
echo "4. 配置检查"
echo "========================================="

# 检查后端配置
if [ -f "backend/src/main/resources/application.yml" ]; then
    check_result "后端 application.yml 存在" 0
else
    check_result "后端 application.yml 存在" 1
fi

# 检查 C端 配置
if [ -f "hall-reserve-taro/src/config/index.ts" ]; then
    check_result "C端 config/index.ts 存在" 0
else
    check_result "C端 config/index.ts 存在" 1
fi

# =====================
# 5. API 连通性检查 (可选)
# =====================
echo ""
echo "========================================="
echo "5. API 连通性检查"
echo "========================================="

# 检查后端是否运行
if curl -s --connect-timeout 5 http://localhost:8080/actuator/health > /dev/null 2>&1; then
    check_result "后端服务运行中 (localhost:8080)" 0
    
    # 测试饮品菜单 API
    BEVERAGE_RESP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/client/beverages 2>/dev/null || echo "000")
    if [ "$BEVERAGE_RESP" = "200" ]; then
        check_result "GET /api/client/beverages 返回 200" 0
    else
        check_result "GET /api/client/beverages 返回 200 (实际: $BEVERAGE_RESP)" 1
    fi
else
    skip_check "后端服务连通性检查 (服务未运行)"
    skip_check "饮品菜单 API 检查"
fi

# 检查前端是否运行
if curl -s --connect-timeout 5 http://localhost:3002 > /dev/null 2>&1; then
    check_result "B端前端服务运行中 (localhost:3002)" 0
else
    skip_check "B端前端服务连通性检查 (服务未运行)"
fi

# =====================
# 结果汇总
# =====================
echo ""
echo "========================================="
echo "验证结果汇总"
echo "========================================="
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo -e "${YELLOW}跳过: $SKIPPED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    log_info "🎉 所有检查通过！O003-beverage-order 开发环境就绪。"
    exit 0
else
    log_error "⚠️ 有 $FAILED 项检查失败，请根据上述信息修复问题。"
    exit 1
fi

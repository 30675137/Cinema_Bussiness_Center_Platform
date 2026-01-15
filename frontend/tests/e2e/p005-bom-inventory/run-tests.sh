#!/bin/bash
###
# @spec P005-bom-inventory-deduction
# P005 Playwright E2E 测试执行脚本
#
# 用途：一键运行所有P005相关的Playwright测试
###

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}P005 BOM库存预占与扣减 - E2E测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查环境变量
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo -e "${YELLOW}⚠️  警告: SUPABASE_DB_PASSWORD 环境变量未设置${NC}"
  echo -e "${YELLOW}   部分数据库验证功能可能无法使用${NC}"
  echo ""
fi

# 检查后端服务
echo -e "${BLUE}[1/5] 检查后端服务...${NC}"
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 后端服务运行中 (http://localhost:8080)${NC}"
else
  echo -e "${RED}❌ 后端服务未运行${NC}"
  echo -e "${YELLOW}请先启动后端: cd backend && mvn spring-boot:run${NC}"
  exit 1
fi
echo ""

# 检查前端服务
echo -e "${BLUE}[2/5] 检查前端服务...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 前端服务运行中 (http://localhost:3000)${NC}"
else
  echo -e "${YELLOW}⚠️  前端服务未运行，部分UI测试可能失败${NC}"
  echo -e "${YELLOW}   启动前端: cd frontend && npm run dev${NC}"
fi
echo ""

# 安装依赖
echo -e "${BLUE}[3/5] 检查 Playwright 安装...${NC}"
cd "$(dirname "$0")/../../.."  # 切换到 frontend 目录

if ! command -v playwright &> /dev/null; then
  echo -e "${YELLOW}正在安装 Playwright...${NC}"
  npm install --save-dev @playwright/test
  npx playwright install
else
  echo -e "${GREEN}✅ Playwright 已安装${NC}"
fi
echo ""

# 运行测试
echo -e "${BLUE}[4/5] 运行 Playwright E2E 测试...${NC}"
echo -e "${YELLOW}测试文件位置: frontend/tests/e2e/p005-bom-inventory/${NC}"
echo ""

# 设置测试超时时间（每个测试60秒）
export PLAYWRIGHT_TEST_TIMEOUT=60000

# 运行测试并生成报告
npx playwright test tests/e2e/p005-bom-inventory \
  --reporter=list,html \
  --output=test-results/p005-bom-inventory

TEST_RESULT=$?

echo ""

# 生成测试报告
echo -e "${BLUE}[5/5] 生成测试报告...${NC}"

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✅ 所有测试通过！${NC}"
  echo -e "${GREEN}========================================${NC}"
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}❌ 部分测试失败${NC}"
  echo -e "${RED}========================================${NC}"
fi

echo ""
echo -e "${BLUE}测试报告已生成，查看详情:${NC}"
echo -e "${YELLOW}npx playwright show-report${NC}"
echo ""

# 返回测试结果
exit $TEST_RESULT

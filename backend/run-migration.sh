#!/bin/bash

# 数据库迁移脚本
# 用于执行 Supabase 数据库表创建

echo "开始执行数据库迁移..."
echo "数据库: Supabase PostgreSQL"
echo "迁移文件: src/main/resources/db/migration/V1__create_scenario_packages.sql"
echo ""

# 数据库连接信息
DB_URL="postgresql://postgres.fxhgyxceqrmnpezluaht:ppkZ8sGUEHB0qjFs@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

# 检查 psql 是否安装
if ! command -v psql &> /dev/null; then
    echo "错误: psql 未安装"
    echo ""
    echo "请使用以下任一方式执行迁移："
    echo ""
    echo "方式1: 通过 Supabase 控制台 (推荐)"
    echo "  1. 访问 https://supabase.com/dashboard"
    echo "  2. 选择项目"
    echo "  3. 进入 SQL Editor"
    echo "  4. 复制并执行 src/main/resources/db/migration/V1__create_scenario_packages.sql"
    echo ""
    echo "方式2: 安装 psql"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo ""
    exit 1
fi

# 执行迁移
echo "正在连接数据库..."
psql "$DB_URL" -f src/main/resources/db/migration/V1__create_scenario_packages.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据库迁移成功!"
    echo ""
    echo "现在可以重启后端服务:"
    echo "  cd backend"
    echo "  mvn spring-boot:run"
else
    echo ""
    echo "❌ 数据库迁移失败"
    echo "请检查错误信息并重试"
    exit 1
fi

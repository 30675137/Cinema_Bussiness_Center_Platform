#!/bin/bash
# =====================================================
# 数据库初始化脚本
# 用法: ./init-db.sh [host] [port] [password]
# 示例: ./init-db.sh localhost 15432 postgres
# =====================================================

HOST=${1:-localhost}
PORT=${2:-15432}
PASSWORD=${3:-postgres}
USER=postgres
DB=postgres

SCRIPT_DIR=$(dirname "$0")

echo "=== 初始化数据库 ==="
echo "目标: $HOST:$PORT"
echo ""

# 1. 创建表结构
echo "[1/3] 创建表结构..."
PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USER -d $DB -f "$SCRIPT_DIR/schema.sql" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ 表结构创建完成"
else
    echo "  ✗ 表结构创建失败"
    exit 1
fi

# 2. 导入 Flyway 版本记录
echo "[2/3] 同步 Flyway 版本记录..."
PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USER -d $DB -c "TRUNCATE TABLE flyway_schema_history CASCADE;" > /dev/null 2>&1
PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USER -d $DB -f "$SCRIPT_DIR/flyway_schema_history.sql" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ Flyway 版本记录同步完成"
else
    echo "  ✗ Flyway 版本记录同步失败"
    exit 1
fi

# 3. 导入种子数据
echo "[3/3] 导入种子数据..."
PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USER -d $DB -f "$SCRIPT_DIR/seed-data.sql" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ 种子数据导入完成"
else
    echo "  ✗ 种子数据导入失败"
    exit 1
fi

echo ""
echo "=== 初始化完成 ==="
echo "可执行以下命令验证:"
echo "  flyway info -url=jdbc:postgresql://$HOST:$PORT/$DB -user=$USER -password=$PASSWORD"

#!/bin/bash
# =====================================================
# 备份数据库
# 用法: ./backup-db.sh [host] [port] [password]
# 示例: ./backup-db.sh localhost 15432 postgres
# =====================================================

HOST=${1:-localhost}
PORT=${2:-15432}
PASSWORD=${3:-postgres}
USER=postgres
DB=postgres

SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
BACKUP_DIR="$PROJECT_ROOT/db_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/postgres_full_$TIMESTAMP.sql"

echo "=== 数据库备份 ==="
echo "源: $HOST:$PORT"
echo "目标: $BACKUP_FILE"
echo ""

# 检查 pg_dump 是否可用
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump 命令未找到，请先安装 PostgreSQL"
    exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 执行备份
PGPASSWORD=$PASSWORD pg_dump -h $HOST -p $PORT -U $USER -d $DB \
    --no-owner --no-acl \
    > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✓ 备份完成: $BACKUP_FILE ($SIZE)"
else
    echo "✗ 备份失败"
    rm -f "$BACKUP_FILE"
    exit 1
fi

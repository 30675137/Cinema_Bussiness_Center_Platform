#!/bin/bash
# =====================================================
# 执行 Flyway 迁移
# 用法: ./migrate.sh [host] [port] [password]
# 示例: ./migrate.sh localhost 15432 postgres
# =====================================================

HOST=${1:-localhost}
PORT=${2:-15432}
PASSWORD=${3:-postgres}
USER=postgres
DB=postgres

SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
MIGRATION_DIR="$PROJECT_ROOT/backend/src/main/resources/db/migration"

echo "=== Flyway 迁移 ==="
echo "目标: $HOST:$PORT"
echo "迁移目录: $MIGRATION_DIR"
echo ""

# 检查 flyway 命令
if ! command -v flyway &> /dev/null; then
    echo "❌ flyway 命令未找到，请先安装: brew install flyway"
    exit 1
fi

# 执行迁移
flyway \
    -url="jdbc:postgresql://$HOST:$PORT/$DB" \
    -user=$USER \
    -password=$PASSWORD \
    -locations="filesystem:$MIGRATION_DIR" \
    -baselineOnMigrate=true \
    -outOfOrder=true \
    -table=flyway_schema_history \
    migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 迁移完成"
else
    echo ""
    echo "✗ 迁移失败"
    exit 1
fi

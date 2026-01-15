#!/bin/bash
# =====================================================
# 导出数据库 Schema 和种子数据
# 用法: ./export-schema.sh [host] [port] [password]
# 示例: ./export-schema.sh localhost 15432 postgres
# =====================================================

HOST=${1:-localhost}
PORT=${2:-15432}
PASSWORD=${3:-postgres}
USER=postgres
DB=postgres

SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
BACKUP_DIR="$PROJECT_ROOT/db_backup"

echo "=== 导出 Schema 和种子数据 ==="
echo "源: $HOST:$PORT"
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 1. 导出表结构
echo "[1/3] 导出表结构..."
PGPASSWORD=$PASSWORD pg_dump -h $HOST -p $PORT -U $USER -d $DB \
    --schema-only --no-owner --no-acl \
    > "$BACKUP_DIR/schema.sql.new"

if [ $? -eq 0 ]; then
    mv "$BACKUP_DIR/schema.sql.new" "$BACKUP_DIR/schema.sql"
    echo "  ✓ schema.sql"
else
    echo "  ✗ 导出失败"
    rm -f "$BACKUP_DIR/schema.sql.new"
    exit 1
fi

# 2. 导出 flyway_schema_history
echo "[2/3] 导出 Flyway 版本记录..."
PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USER -d $DB \
    -c "COPY (SELECT * FROM flyway_schema_history ORDER BY installed_rank) TO STDOUT WITH CSV HEADER" \
    > "$BACKUP_DIR/flyway_schema_history.csv"

if [ $? -eq 0 ]; then
    echo "  ✓ flyway_schema_history.csv"
else
    echo "  ⚠ 导出失败（表可能不存在）"
fi

# 3. 导出种子数据
echo "[3/3] 导出种子数据..."
TABLES="stores brands categories units unit_conversions suppliers materials adjustment_reasons menu_category spus skus users"

echo "-- 种子数据导出 - $(date)" > "$BACKUP_DIR/seed-data.sql.new"
echo "" >> "$BACKUP_DIR/seed-data.sql.new"

for TABLE in $TABLES; do
    COUNT=$(PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USER -d $DB -t -c "SELECT COUNT(*) FROM $TABLE" 2>/dev/null | tr -d ' ')
    if [ "$COUNT" -gt 0 ] 2>/dev/null; then
        echo "-- $TABLE ($COUNT rows)" >> "$BACKUP_DIR/seed-data.sql.new"
        PGPASSWORD=$PASSWORD pg_dump -h $HOST -p $PORT -U $USER -d $DB \
            --data-only --no-owner --table=$TABLE \
            >> "$BACKUP_DIR/seed-data.sql.new" 2>/dev/null
        echo "" >> "$BACKUP_DIR/seed-data.sql.new"
    fi
done

mv "$BACKUP_DIR/seed-data.sql.new" "$BACKUP_DIR/seed-data.sql"
echo "  ✓ seed-data.sql"

echo ""
echo "=== 导出完成 ==="
echo "文件位置: $BACKUP_DIR/"
ls -la "$BACKUP_DIR"/*.sql 2>/dev/null | awk '{print "  " $NF " (" $5 ")"}'

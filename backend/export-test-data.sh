#!/bin/bash
# ============================================================
# 数据库数据导出脚本
# 基于测试环境配置，将所有表数据导出为 INSERT 语句
# ============================================================

# 测试环境数据库配置
DB_HOST="${TEST_DB_HOST:-aws-1-us-east-2.pooler.supabase.com}"
DB_PORT="${TEST_DB_PORT:-6543}"
DB_NAME="${TEST_DB_NAME:-postgres}"
DB_USER="${TEST_DB_USER:-postgres.fxhgyxceqrmnpezluaht}"
DB_PASSWORD="${TEST_DB_PASSWORD:-ppkZ8sGUEHB0qjFs}"

# 输出文件
OUTPUT_DIR="$(dirname "$0")/exported-data"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="${OUTPUT_DIR}/data_export_${TIMESTAMP}.sql"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "============================================================"
echo "数据库数据导出工具"
echo "============================================================"
echo "数据库主机: $DB_HOST:$DB_PORT"
echo "数据库名称: $DB_NAME"
echo "用户名: $DB_USER"
echo "输出文件: $OUTPUT_FILE"
echo "============================================================"

# 设置 PGPASSWORD 环境变量
export PGPASSWORD="$DB_PASSWORD"

# 检查 pg_dump 是否可用
if ! command -v pg_dump &> /dev/null; then
    echo "错误: pg_dump 命令未找到"
    echo "请安装 PostgreSQL 客户端工具:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# 首先获取所有表名
echo ""
echo "正在获取表列表..."

TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'flyway_%'
    AND tablename NOT LIKE 'pg_%'
    ORDER BY tablename;
" 2>/dev/null)

if [ -z "$TABLES" ]; then
    echo "警告: 未找到任何表或连接失败"
    echo "尝试使用 pg_dump 直接导出..."
fi

# 写入文件头
cat > "$OUTPUT_FILE" << 'EOF'
-- ============================================================
-- 数据库数据导出
-- 导出时间: $(date)
-- 源数据库: 测试环境 (Supabase)
-- ============================================================

-- 禁用外键检查以便导入
SET session_replication_role = replica;

EOF

# 使用 pg_dump 导出数据（仅数据，INSERT 格式）
echo "正在导出数据..."

pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --data-only \
    --column-inserts \
    --no-owner \
    --no-privileges \
    --no-comments \
    --exclude-table='flyway_schema_history' \
    --exclude-table='schema_migrations' \
    >> "$OUTPUT_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    # 追加文件尾
    cat >> "$OUTPUT_FILE" << 'EOF'

-- 恢复外键检查
SET session_replication_role = DEFAULT;

-- ============================================================
-- 导出完成
-- ============================================================
EOF

    # 统计导出的行数
    INSERT_COUNT=$(grep -c "^INSERT INTO" "$OUTPUT_FILE" 2>/dev/null || echo "0")
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')

    echo ""
    echo "============================================================"
    echo "导出成功!"
    echo "============================================================"
    echo "输出文件: $OUTPUT_FILE"
    echo "文件大小: $FILE_SIZE"
    echo "INSERT 语句数: $INSERT_COUNT"
    echo "============================================================"
else
    echo ""
    echo "============================================================"
    echo "导出失败!"
    echo "============================================================"
    echo "请检查:"
    echo "  1. 数据库连接配置是否正确"
    echo "  2. 网络是否可达"
    echo "  3. 用户权限是否足够"
    echo ""
    echo "尝试手动连接测试:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    exit 1
fi

# 清理
unset PGPASSWORD

echo ""
echo "完成!"

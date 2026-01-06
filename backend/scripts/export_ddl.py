#!/usr/bin/env python3
"""
@spec T001-database-export
导出 Supabase PostgreSQL public schema 的所有表结构到 SQL 文件
"""

import psycopg2
from psycopg2 import sql
import sys
from datetime import datetime

# Supabase 连接配置 (from application.yml)
DB_CONFIG = {
    'host': 'aws-1-us-east-2.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.fxhgyxceqrmnpezluaht',
    'password': 'ppkZ8sGUEHB0qjFs',
    'sslmode': 'require'
}

OUTPUT_FILE = 'create_tables.sql'


def get_connection():
    """建立数据库连接"""
    return psycopg2.connect(**DB_CONFIG)


def get_all_tables(cursor):
    """获取 public schema 中的所有表"""
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    return [row[0] for row in cursor.fetchall()]


def get_columns(cursor, table_name):
    """获取表的列定义"""
    cursor.execute("""
        SELECT
            column_name,
            data_type,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            is_nullable,
            column_default,
            udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position
    """, (table_name,))
    return cursor.fetchall()


def get_primary_key(cursor, table_name):
    """获取主键约束"""
    cursor.execute("""
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = %s
        ORDER BY kcu.ordinal_position
    """, (table_name,))
    return [row[0] for row in cursor.fetchall()]


def get_foreign_keys(cursor, table_name):
    """获取外键约束"""
    cursor.execute("""
        SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = %s
    """, (table_name,))
    return cursor.fetchall()


def get_unique_constraints(cursor, table_name):
    """获取唯一约束"""
    cursor.execute("""
        SELECT tc.constraint_name, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'UNIQUE'
          AND tc.table_schema = 'public'
          AND tc.table_name = %s
        ORDER BY tc.constraint_name, kcu.ordinal_position
    """, (table_name,))

    # 按约束名分组
    constraints = {}
    for row in cursor.fetchall():
        name, col = row
        if name not in constraints:
            constraints[name] = []
        constraints[name].append(col)
    return constraints


def get_check_constraints(cursor, table_name):
    """获取检查约束"""
    cursor.execute("""
        SELECT cc.constraint_name, cc.check_clause
        FROM information_schema.check_constraints cc
        JOIN information_schema.table_constraints tc
            ON cc.constraint_name = tc.constraint_name
            AND cc.constraint_schema = tc.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = %s
          AND cc.constraint_name NOT LIKE '%%_not_null'
    """, (table_name,))
    return cursor.fetchall()


def get_indexes(cursor, table_name):
    """获取索引定义"""
    cursor.execute("""
        SELECT indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = %s
          AND indexname NOT LIKE '%%_pkey'
    """, (table_name,))
    return [row[0] for row in cursor.fetchall()]


def format_column_type(col):
    """格式化列类型"""
    column_name, data_type, char_max_len, num_prec, num_scale, is_nullable, default, udt_name = col

    # 处理特殊类型
    if data_type == 'ARRAY':
        type_str = f"{udt_name.lstrip('_')}[]"
    elif data_type == 'USER-DEFINED':
        type_str = udt_name
    elif data_type == 'character varying':
        type_str = f"VARCHAR({char_max_len})" if char_max_len else "VARCHAR"
    elif data_type == 'character':
        type_str = f"CHAR({char_max_len})" if char_max_len else "CHAR"
    elif data_type == 'numeric':
        if num_prec and num_scale:
            type_str = f"NUMERIC({num_prec},{num_scale})"
        elif num_prec:
            type_str = f"NUMERIC({num_prec})"
        else:
            type_str = "NUMERIC"
    else:
        type_str = data_type.upper()

    return type_str


def generate_create_table(cursor, table_name):
    """生成单个表的 CREATE TABLE 语句"""
    columns = get_columns(cursor, table_name)
    pk_columns = get_primary_key(cursor, table_name)
    fks = get_foreign_keys(cursor, table_name)
    unique_constraints = get_unique_constraints(cursor, table_name)
    check_constraints = get_check_constraints(cursor, table_name)
    indexes = get_indexes(cursor, table_name)

    lines = [f'CREATE TABLE IF NOT EXISTS "{table_name}" (']
    col_defs = []

    for col in columns:
        column_name, data_type, char_max_len, num_prec, num_scale, is_nullable, default, udt_name = col

        type_str = format_column_type(col)
        col_def = f'    "{column_name}" {type_str}'

        if is_nullable == 'NO':
            col_def += ' NOT NULL'

        if default:
            # 清理默认值
            default_clean = default.replace("::regclass", "").replace("::text", "")
            col_def += f' DEFAULT {default_clean}'

        col_defs.append(col_def)

    # 添加主键约束
    if pk_columns:
        pk_cols = ', '.join(f'"{c}"' for c in pk_columns)
        col_defs.append(f'    PRIMARY KEY ({pk_cols})')

    # 添加唯一约束
    for constraint_name, cols in unique_constraints.items():
        cols_str = ', '.join(f'"{c}"' for c in cols)
        col_defs.append(f'    CONSTRAINT "{constraint_name}" UNIQUE ({cols_str})')

    lines.append(',\n'.join(col_defs))
    lines.append(');')

    result = '\n'.join(lines)

    # 添加外键约束（单独语句）
    for fk in fks:
        constraint_name, col, ref_table, ref_col = fk
        result += f'\n\nALTER TABLE "{table_name}" ADD CONSTRAINT "{constraint_name}" '
        result += f'FOREIGN KEY ("{col}") REFERENCES "{ref_table}" ("{ref_col}");'

    # 添加检查约束
    for check in check_constraints:
        constraint_name, check_clause = check
        result += f'\n\nALTER TABLE "{table_name}" ADD CONSTRAINT "{constraint_name}" CHECK ({check_clause});'

    # 添加索引
    for idx in indexes:
        result += f'\n\n{idx};'

    return result


def main():
    """主函数"""
    print(f"连接到 Supabase PostgreSQL...")

    try:
        conn = get_connection()
        cursor = conn.cursor()

        tables = get_all_tables(cursor)
        print(f"找到 {len(tables)} 个表")

        output_lines = [
            f"-- ==============================================",
            f"-- Supabase Public Schema DDL Export",
            f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"-- Tables: {len(tables)}",
            f"-- ==============================================",
            "",
        ]

        for i, table in enumerate(tables, 1):
            print(f"  [{i}/{len(tables)}] 导出表: {table}")
            output_lines.append(f"\n-- ----------------------------------------------")
            output_lines.append(f"-- Table: {table}")
            output_lines.append(f"-- ----------------------------------------------")
            output_lines.append(generate_create_table(cursor, table))
            output_lines.append("")

        # 写入文件
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write('\n'.join(output_lines))

        print(f"\n✅ 导出完成: {OUTPUT_FILE}")
        print(f"   共导出 {len(tables)} 个表")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ 错误: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

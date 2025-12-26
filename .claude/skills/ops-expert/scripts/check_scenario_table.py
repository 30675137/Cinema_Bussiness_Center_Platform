#!/usr/bin/env python3
"""
检查 scenario_packages 表是否存在
"""
import psycopg2

conn_params = {
    'host': 'aws-1-us-east-2.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.fxhgyxceqrmnpezluaht',
    'password': 'ppkZ8sGUEHB0qjFs',
    'options': '-c search_path=public'
}

try:
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor()

    # 检查表是否存在
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'scenario_packages'
        )
    """)

    exists = cursor.fetchone()[0]

    if exists:
        print("✅ scenario_packages 表存在\n")

        # 查询表结构
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'scenario_packages'
            ORDER BY ordinal_position
        """)

        print("表结构：")
        print("| 字段名 | 数据类型 | 可空 |")
        print("|--------|----------|------|")
        for col_name, data_type, is_nullable in cursor.fetchall():
            print(f"| {col_name} | {data_type} | {is_nullable} |")

        # 统计数据
        cursor.execute("SELECT COUNT(*) FROM scenario_packages")
        count = cursor.fetchone()[0]
        print(f"\n当前记录数: {count}")

    else:
        print("❌ scenario_packages 表不存在")
        print("\n系统中可用的表：")
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        for (table_name,) in cursor.fetchall():
            print(f"  - {table_name}")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ 错误: {e}")

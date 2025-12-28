#!/usr/bin/env python3
"""
查询场景包统计信息
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

    # 统计总数（只统计最新版本）
    cursor.execute("""
        SELECT COUNT(*)
        FROM scenario_packages
        WHERE is_latest = true
        AND deleted_at IS NULL
    """)
    total_count = cursor.fetchone()[0]

    # 按状态统计
    cursor.execute("""
        SELECT
            status,
            COUNT(*) as count
        FROM scenario_packages
        WHERE is_latest = true
        AND deleted_at IS NULL
        GROUP BY status
        ORDER BY status
    """)
    status_stats = cursor.fetchall()

    # 获取场景包列表
    cursor.execute("""
        SELECT id, name, status, category, version, created_at
        FROM scenario_packages
        WHERE is_latest = true
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 20
    """)
    packages = cursor.fetchall()

    # 输出结果
    print(f'\n场景包统计：总共 {total_count} 个（仅最新版本）\n')

    if status_stats:
        print('按状态分布：')
        print('| 状态 | 数量 |')
        print('|------|------|')
        for status, count in status_stats:
            status_cn = {
                'DRAFT': '草稿',
                'PUBLISHED': '已发布',
                'ARCHIVED': '已归档'
            }.get(status, status)
            print(f'| {status_cn} ({status}) | {count} |')

    print('\n场景包列表：\n')
    if packages:
        print('| 名称 | 状态 | 分类 | 版本 |')
        print('|------|------|------|------|')
        for pkg_id, name, status, category, version, created_at in packages:
            name = name or '-'
            status_cn = {
                'DRAFT': '草稿',
                'PUBLISHED': '已发布',
                'ARCHIVED': '已归档'
            }.get(status, status)
            category = category or '-'
            print(f'| {name} | {status_cn} | {category} | v{version} |')
    else:
        print('暂无场景包数据')

    if total_count > 20:
        print(f'\n... 还有 {total_count - 20} 个场景包未显示')

    print(f'\n提示：可以说 "查看场景包 [名称] 详情" 获取更多信息')

    cursor.close()
    conn.close()

except Exception as e:
    print(f'❌ 查询失败: {e}')

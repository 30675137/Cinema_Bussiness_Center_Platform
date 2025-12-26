#!/usr/bin/env python3
"""
查询场景包数量和统计
"""
import sys
import psycopg2

def main():
    # 数据库连接信息
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

        # 统计场景包总数
        cursor.execute("SELECT COUNT(*) FROM scenario_packages")
        total_count = cursor.fetchone()[0]

        # 按状态统计
        cursor.execute("""
            SELECT
                status,
                COUNT(*) as count
            FROM scenario_packages
            GROUP BY status
            ORDER BY status
        """)
        status_stats = cursor.fetchall()

        # 获取场景包列表（最新的20个）
        cursor.execute("""
            SELECT id, name, status, price, created_at
            FROM scenario_packages
            ORDER BY created_at DESC
            LIMIT 20
        """)
        packages = cursor.fetchall()

        # 输出结果
        print(f'\n场景包统计：总共 {total_count} 个\n')

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

        print('\n最近创建的场景包（前20个）：\n')
        if packages:
            print('| 名称 | 状态 | 价格 |')
            print('|------|------|------|')
            for pkg_id, name, status, price, created_at in packages:
                name = name or '-'
                status_cn = {
                    'DRAFT': '草稿',
                    'PUBLISHED': '已发布',
                    'ARCHIVED': '已归档'
                }.get(status, status)
                price_str = f'¥{price:.2f}' if price else '-'
                print(f'| {name} | {status_cn} | {price_str} |')

        if total_count > 20:
            print(f'\n... 还有 {total_count - 20} 个场景包未显示')

        print(f'\n提示：可以说 "查看场景包 [名称] 详情" 获取更多信息')

        cursor.close()
        conn.close()

    except psycopg2.Error as e:
        print(f'❌ 数据库查询失败: {e}')
        sys.exit(1)
    except Exception as e:
        print(f'❌ 发生错误: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()

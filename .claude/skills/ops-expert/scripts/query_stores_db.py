#!/usr/bin/env python3
"""
通过数据库连接查询门店数量
"""
import sys

def main():
    try:
        import psycopg2
        from psycopg2 import sql
    except ImportError:
        print("❌ 缺少 psycopg2 库")
        print("请安装: pip install psycopg2-binary")
        sys.exit(1)

    # 数据库连接信息（从 application.yml）
    conn_params = {
        'host': 'aws-1-us-east-2.pooler.supabase.com',
        'port': 6543,
        'database': 'postgres',
        'user': 'postgres.fxhgyxceqrmnpezluaht',
        'password': 'ppkZ8sGUEHB0qjFs',
        'options': '-c search_path=public'
    }

    try:
        # 连接数据库
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()

        # 查询门店数量
        cursor.execute("SELECT COUNT(*) FROM stores")
        count = cursor.fetchone()[0]

        print(f'\n找到 {count} 个门店\n')

        # 查询门店列表
        cursor.execute("""
            SELECT id, name, code, city, status, created_at
            FROM stores
            ORDER BY created_at DESC
            LIMIT 20
        """)

        rows = cursor.fetchall()

        if rows:
            print('| 名称 | 编码 | 城市 | 状态 |')
            print('|------|------|------|------|')
            for row in rows:
                store_id, name, code, city, status, created_at = row
                name = name or '-'
                code = code or '-'
                city = city or '-'
                status = status or '-'
                print(f'| {name} | {code} | {city} | {status} |')

        if count > 20:
            print(f'\n... 还有 {count - 20} 个门店未显示')

        print(f'\n提示：可以说 "查看门店 [名称] 详情" 获取更多信息')

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

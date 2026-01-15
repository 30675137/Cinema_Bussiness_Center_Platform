#!/usr/bin/env python3
"""
查询北京地区的门店
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

        # 查询北京的门店
        cursor.execute("""
            SELECT id, name, code, city, district, address, phone, status
            FROM stores
            WHERE city = '北京市'
            ORDER BY name
        """)

        rows = cursor.fetchall()
        count = len(rows)

        print(f'\n找到 {count} 个北京门店\n')

        if rows:
            print('| 名称 | 编码 | 区县 | 状态 |')
            print('|------|------|------|------|')
            for row in rows:
                store_id, name, code, city, district, address, phone, status = row
                name = name or '-'
                code = code or '-'
                district = district or '-'
                status = status or '-'
                print(f'| {name} | {code} | {district} | {status} |')

            print(f'\n提示：可以说 "查看门店 [名称] 详情" 获取地址和联系方式')
        else:
            print('未找到北京的门店')

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

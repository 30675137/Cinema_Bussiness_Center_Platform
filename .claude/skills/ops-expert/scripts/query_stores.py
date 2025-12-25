#!/usr/bin/env python3
"""
查询门店数量和列表
"""
import sys
import os

# 添加脚本目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api_client import get_client

def main():
    # 设置环境变量
    os.environ['SUPABASE_URL'] = 'https://fxhgyxceqrmnpezluaht.supabase.co'
    os.environ['SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aGd5eGNlcXJtbnBlemx1YWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MjU3OTAsImV4cCI6MjA1MDMwMTc5MH0.X5oJxVHQY2nHfEb9qCkZVW9ZdGMJRJYMYr7Pd6ujDWs'

    # 获取客户端
    client = get_client()

    # 查询门店列表
    result = client.list_stores()

    if result['success']:
        stores = result.get('data', [])
        count = len(stores)

        print(f'\n找到 {count} 个门店\n')

        if stores:
            print('| 名称 | 编码 | 城市 | 状态 |')
            print('|------|------|------|------|')
            for store in stores[:20]:  # 最多显示前20个
                name = store.get('name', '-')
                code = store.get('code', '-')
                city = store.get('city', '-')
                status = store.get('status', '-')
                print(f'| {name} | {code} | {city} | {status} |')

        if count > 20:
            print(f'\n... 还有 {count - 20} 个门店未显示')

        print(f'\n提示：可以说 "查看门店详情" 获取更多信息')
    else:
        print('❌ 查询失败:', result.get('message'))
        print('错误:', result.get('error'))

if __name__ == '__main__':
    main()

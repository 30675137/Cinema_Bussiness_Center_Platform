#!/usr/bin/env python3
"""
创建商品管理表 - 在飞书中创建多维表格

此脚本用于获取系统分类信息，生成创建表格所需的 MCP 参数。
实际的表格创建由 Claude 通过 MCP 工具完成。

使用方法:
    python create_table.py

输出:
    打印创建表格所需的 MCP 调用参数
"""
import json
import sys
import os

# 添加父目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from channel_product.api_client import ChannelProductAPI
from channel_product.feishu_helper import MCPParamsBuilder
from channel_product.config import TABLE_FIELDS


def get_category_options() -> list:
    """从系统获取分类列表"""
    try:
        api = ChannelProductAPI()
        categories = api.list_categories()
        return [
            cat.get("displayName") or cat.get("name")
            for cat in categories
            if cat.get("displayName") or cat.get("name")
        ]
    except Exception as e:
        print(f"⚠️ 获取分类失败: {e}")
        print("将使用默认分类选项")
        return ["全部", "精品咖啡", "特调饮品", "甜点蛋糕", "轻食简餐"]


def generate_table_fields(categories: list) -> list:
    """生成表格字段定义"""
    fields = []
    for field_def in TABLE_FIELDS:
        field = {
            "field_name": field_def["field_name"],
            "type": field_def["type"],
        }

        # 处理分类字段，动态设置选项
        if field_def["field_name"] == "分类名称":
            field["property"] = {
                "options": [
                    {"name": cat, "color": i % 10}
                    for i, cat in enumerate(categories)
                ]
            }
        elif "property" in field_def:
            field["property"] = field_def["property"]

        fields.append(field)

    return fields


def main():
    print("=" * 50)
    print("创建小程序商品管理表")
    print("=" * 50)
    print()

    # 1. 获取系统分类
    print("📋 获取系统分类...")
    categories = get_category_options()
    print(f"   找到 {len(categories)} 个分类: {', '.join(categories)}")
    print()

    # 2. 生成表格字段
    print("📝 生成表格字段定义...")
    fields = generate_table_fields(categories)
    print(f"   共 {len(fields)} 个字段")
    print()

    # 3. 输出 MCP 调用指南
    print("=" * 50)
    print("请按以下步骤创建表格:")
    print("=" * 50)
    print()

    print("步骤 1: 创建 Base App (如果没有)")
    print("-" * 40)
    print("调用: mcp__lark-mcp__bitable_v1_app_create")
    print("参数:")
    create_app_params = {
        "data": {
            "name": "小程序商品管理",
        },
        "useUAT": True,
    }
    print(json.dumps(create_app_params, ensure_ascii=False, indent=2))
    print()

    print("步骤 2: 在 Base App 中创建表格")
    print("-" * 40)
    print("调用: mcp__lark-mcp__bitable_v1_appTable_create")
    print("参数 (将 <APP_TOKEN> 替换为步骤1返回的 app_token):")
    create_table_params = {
        "path": {
            "app_token": "<APP_TOKEN>",
        },
        "data": {
            "table": {
                "name": "小程序商品管理",
                "default_view_name": "全部商品",
                "fields": fields,
            },
        },
    }
    print(json.dumps(create_table_params, ensure_ascii=False, indent=2))
    print()

    print("步骤 3: 保存配置")
    print("-" * 40)
    print("创建成功后，记录以下信息:")
    print("  - App Token: (从步骤1响应获取)")
    print("  - Table ID: (从步骤2响应获取)")
    print()
    print("设置环境变量或更新 config.py:")
    print("  export FEISHU_PRODUCT_APP_TOKEN=<app_token>")
    print("  export FEISHU_PRODUCT_TABLE_ID=<table_id>")
    print()

    print("=" * 50)
    print("表格字段说明:")
    print("=" * 50)
    for field in fields:
        field_name = field["field_name"]
        field_type = field.get("ui_type", field.get("type"))
        print(f"  - {field_name}: {field_type}")


if __name__ == "__main__":
    main()

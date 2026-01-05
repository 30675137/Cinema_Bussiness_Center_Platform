#!/usr/bin/env python3
"""
同步商品 - 从飞书表格同步商品到系统

此脚本处理商品数据转换和 API 调用。
飞书表格的读写由 Claude 通过 MCP 工具完成。

使用方法:
    # 处理单条记录
    python sync_products.py --record '<JSON记录数据>'

    # 测试 API 连接
    python sync_products.py --test

输出:
    同步结果 JSON
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from channel_product.api_client import ChannelProductAPI
from channel_product.feishu_helper import FeishuDataTransformer
from channel_product.config import STATUS_MAPPING


def sync_single_record(record: dict, api: ChannelProductAPI) -> dict:
    """
    同步单条记录

    Args:
        record: 飞书表格记录 (包含 fields 字典)
        api: API 客户端

    Returns:
        {
            "success": bool,
            "product_name": str,
            "system_id": str (如果成功),
            "error": str (如果失败),
            "action": "create" | "update"
        }
    """
    transformer = FeishuDataTransformer()

    product_name = transformer.get_product_name(record)
    sku_name = transformer.get_sku_name(record)
    category_name = transformer.get_category_name(record)
    existing_system_id = transformer.get_system_id(record)

    result = {
        "success": False,
        "product_name": product_name,
        "record_id": record.get("record_id"),
    }

    try:
        # 1. 查询 SKU ID
        if not sku_name:
            raise ValueError("SKU名称不能为空")
        sku = api.find_sku_by_name(sku_name)
        sku_id = sku["id"]

        # 2. 查询分类 ID
        if not category_name:
            raise ValueError("分类名称不能为空")
        category = api.find_category_by_name(category_name)
        category_id = category["id"]

        # 3. 转换数据
        product_data = transformer.record_to_product_data(record, sku_id, category_id)

        # 4. 创建或更新
        if existing_system_id:
            # 更新现有商品
            api.update_product(existing_system_id, product_data)
            result["success"] = True
            result["system_id"] = existing_system_id
            result["action"] = "update"
        else:
            # 检查是否已存在（通过 SKU）
            existing = api.find_product_by_sku(sku_id)
            if existing:
                # SKU 已存在，更新
                system_id = existing["id"]
                api.update_product(system_id, product_data)
                result["success"] = True
                result["system_id"] = system_id
                result["action"] = "update"
            else:
                # 创建新商品
                response = api.create_product(product_data)
                system_id = response.get("data", {}).get("id") or response.get("id")
                result["success"] = True
                result["system_id"] = system_id
                result["action"] = "create"

    except ValueError as e:
        result["error"] = str(e)
    except Exception as e:
        result["error"] = f"API 错误: {str(e)}"

    return result


def process_records(records: list) -> dict:
    """
    批量处理记录

    Args:
        records: 飞书表格记录列表

    Returns:
        {
            "total": int,
            "success": int,
            "failed": int,
            "results": [...]
        }
    """
    api = ChannelProductAPI()
    results = []

    for record in records:
        result = sync_single_record(record, api)
        results.append(result)

    success_count = sum(1 for r in results if r["success"])
    failed_count = len(results) - success_count

    return {
        "total": len(records),
        "success": success_count,
        "failed": failed_count,
        "results": results,
    }


def format_results(process_result: dict) -> str:
    """格式化处理结果"""
    lines = [
        "🔄 同步商品完成",
        "",
        f"总计: {process_result['total']} 条",
        f"成功: {process_result['success']} 条",
        f"失败: {process_result['failed']} 条",
        "",
        "详情:",
    ]

    for r in process_result["results"]:
        if r["success"]:
            action = "更新" if r.get("action") == "update" else "创建"
            lines.append(f"  ✅ {r['product_name']} - {action}成功 (ID: {r.get('system_id', 'N/A')})")
        else:
            lines.append(f"  ❌ {r['product_name']} - {r.get('error', '未知错误')}")

    return "\n".join(lines)


def test_api():
    """测试 API 连接"""
    print("测试 API 连接...")
    api = ChannelProductAPI()

    try:
        # 测试分类接口
        categories = api.list_categories()
        print(f"✅ 分类接口正常，共 {len(categories)} 个分类")

        # 测试商品列表接口
        products = api.list_products(size=1)
        print(f"✅ 商品接口正常")

        print("\n连接测试通过!")
        return True
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="同步商品到系统")
    parser.add_argument(
        "--record",
        type=str,
        help="单条记录 JSON 数据"
    )
    parser.add_argument(
        "--records",
        type=str,
        help="多条记录 JSON 数据"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="测试 API 连接"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="输出 JSON 格式"
    )

    args = parser.parse_args()

    if args.test:
        success = test_api()
        sys.exit(0 if success else 1)

    if args.record:
        # 处理单条记录
        record = json.loads(args.record)
        api = ChannelProductAPI()
        result = sync_single_record(record, api)

        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            if result["success"]:
                action = "更新" if result.get("action") == "update" else "创建"
                print(f"✅ {result['product_name']} - {action}成功 (ID: {result.get('system_id')})")
            else:
                print(f"❌ {result['product_name']} - {result.get('error')}")

    elif args.records:
        # 处理多条记录
        records = json.loads(args.records)
        result = process_records(records)

        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(format_results(result))

    else:
        parser.print_help()
        print("\n" + "=" * 50)
        print("同步工作流说明:")
        print("=" * 50)
        print("""
1. Claude 调用 MCP 读取飞书表格中"同步状态=待同步"的记录
2. 对每条记录，调用此脚本进行同步:
   python sync_products.py --record '<record_json>'
3. 根据返回结果，Claude 调用 MCP 更新飞书表格状态

示例记录格式:
{
    "record_id": "recXXX",
    "fields": {
        "商品名称": "拿铁咖啡",
        "SKU名称": "拿铁咖啡-中杯",
        "分类名称": "精品咖啡",
        "渠道价格": 22,
        "目标状态": "上架",
        ...
    }
}
""")


if __name__ == "__main__":
    main()

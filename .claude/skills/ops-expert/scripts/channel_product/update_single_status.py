#!/usr/bin/env python3
"""
更新单个商品状态 - 上架/下架指定商品

使用方法:
    # 通过系统 ID 上架
    python update_single_status.py --id <system_id> --status ACTIVE

    # 通过商品名称上架（需要先从飞书查询）
    python update_single_status.py --name "拿铁咖啡" --status ACTIVE --record '<JSON记录>'

输出:
    操作结果
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from channel_product.api_client import ChannelProductAPI
from channel_product.feishu_helper import FeishuDataTransformer
from channel_product.config import STATUS_MAPPING, STATUS_MAPPING_REVERSE


def update_by_id(system_id: str, target_status: str) -> dict:
    """通过系统 ID 更新状态"""
    api = ChannelProductAPI()

    try:
        # 先获取商品信息
        product = api.get_product(system_id)
        product_name = product.get("displayName", "未知商品")
        current_status = product.get("status", "未知")

        # 检查是否需要更新
        if current_status == target_status:
            return {
                "success": True,
                "product_name": product_name,
                "message": f"商品已是{STATUS_MAPPING_REVERSE.get(target_status, target_status)}状态",
                "no_change": True,
            }

        # 执行更新
        api.update_status(system_id, target_status)

        return {
            "success": True,
            "product_name": product_name,
            "system_id": system_id,
            "old_status": current_status,
            "new_status": target_status,
        }

    except Exception as e:
        return {
            "success": False,
            "system_id": system_id,
            "error": str(e),
        }


def update_by_record(record: dict, target_status: str) -> dict:
    """通过飞书记录更新状态"""
    transformer = FeishuDataTransformer()
    product_name = transformer.get_product_name(record)
    system_id = transformer.get_system_id(record)

    if not system_id:
        return {
            "success": False,
            "product_name": product_name,
            "error": "商品未同步到系统，请先执行同步",
        }

    result = update_by_id(system_id, target_status)
    result["product_name"] = product_name
    result["record_id"] = record.get("record_id")
    return result


def format_result(result: dict, action: str) -> str:
    """格式化输出结果"""
    if result["success"]:
        if result.get("no_change"):
            return f"ℹ️ {result['product_name']} - {result.get('message')}"
        else:
            return f"✅ {result['product_name']} - {action}成功"
    else:
        return f"❌ {result.get('product_name', '未知商品')} - {result.get('error', '未知错误')}"


def main():
    parser = argparse.ArgumentParser(description="更新单个商品状态")
    parser.add_argument(
        "--id",
        type=str,
        help="系统商品 ID"
    )
    parser.add_argument(
        "--record",
        type=str,
        help="飞书记录 JSON（包含系统商品ID）"
    )
    parser.add_argument(
        "--status",
        type=str,
        required=True,
        choices=["ACTIVE", "INACTIVE", "DRAFT", "上架", "下架", "草稿"],
        help="目标状态"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="输出 JSON 格式"
    )

    args = parser.parse_args()

    # 状态转换
    target_status = args.status
    if target_status in STATUS_MAPPING:
        target_status = STATUS_MAPPING[target_status]

    action = "上架" if target_status == "ACTIVE" else ("下架" if target_status == "INACTIVE" else "设为草稿")

    if args.id:
        result = update_by_id(args.id, target_status)
    elif args.record:
        record = json.loads(args.record)
        result = update_by_record(record, target_status)
    else:
        parser.print_help()
        print("\n" + "=" * 50)
        print("单品操作说明:")
        print("=" * 50)
        print(f"""
方式1: 通过系统商品 ID 直接操作
   python update_single_status.py --id prod-001 --status ACTIVE

方式2: 通过飞书记录操作
   1. Claude 调用 MCP 按商品名称搜索飞书记录
   2. 调用此脚本:
      python update_single_status.py --record '<record_json>' --status ACTIVE
   3. Claude 更新飞书表格同步时间
""")
        return

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(format_result(result, action))


if __name__ == "__main__":
    main()

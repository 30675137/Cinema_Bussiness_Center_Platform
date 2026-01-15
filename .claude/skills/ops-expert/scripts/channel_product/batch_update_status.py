#!/usr/bin/env python3
"""
批量更新商品状态 - 上架/下架

使用方法:
    # 批量上架
    python batch_update_status.py --status ACTIVE --records '<JSON记录列表>'

    # 批量下架
    python batch_update_status.py --status INACTIVE --records '<JSON记录列表>'

输出:
    更新结果 JSON
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from channel_product.api_client import ChannelProductAPI
from channel_product.feishu_helper import FeishuDataTransformer
from channel_product.config import STATUS_MAPPING, STATUS_MAPPING_REVERSE


def update_single_status(system_id: str, target_status: str, api: ChannelProductAPI) -> dict:
    """
    更新单个商品状态

    Args:
        system_id: 系统商品 ID
        target_status: 目标状态 (ACTIVE/INACTIVE/DRAFT)
        api: API 客户端

    Returns:
        {"success": bool, "error": str (如果失败)}
    """
    try:
        api.update_status(system_id, target_status)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


def batch_update(records: list, target_status: str) -> dict:
    """
    批量更新商品状态

    Args:
        records: 飞书记录列表，每条记录需包含系统商品ID
        target_status: 目标状态 (ACTIVE/INACTIVE)

    Returns:
        {
            "total": int,
            "success": int,
            "failed": int,
            "results": [...]
        }
    """
    api = ChannelProductAPI()
    transformer = FeishuDataTransformer()
    results = []

    for record in records:
        product_name = transformer.get_product_name(record)
        system_id = transformer.get_system_id(record)

        if not system_id:
            results.append({
                "success": False,
                "product_name": product_name,
                "record_id": record.get("record_id"),
                "error": "缺少系统商品ID，请先同步商品",
            })
            continue

        result = update_single_status(system_id, target_status, api)
        result["product_name"] = product_name
        result["record_id"] = record.get("record_id")
        result["system_id"] = system_id
        results.append(result)

    success_count = sum(1 for r in results if r["success"])
    failed_count = len(results) - success_count

    return {
        "total": len(records),
        "success": success_count,
        "failed": failed_count,
        "target_status": target_status,
        "results": results,
    }


def format_results(result: dict) -> str:
    """格式化输出结果"""
    status_name = STATUS_MAPPING_REVERSE.get(result["target_status"], result["target_status"])
    action = "上架" if result["target_status"] == "ACTIVE" else "下架"

    lines = [
        f"📦 批量{action}商品完成",
        "",
        f"总计: {result['total']} 条",
        f"成功: {result['success']} 条",
        f"失败: {result['failed']} 条",
        "",
        "详情:",
    ]

    for r in result["results"]:
        if r["success"]:
            lines.append(f"  ✅ {r['product_name']} - {action}成功")
        else:
            lines.append(f"  ❌ {r['product_name']} - {r.get('error', '未知错误')}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="批量更新商品状态")
    parser.add_argument(
        "--status",
        type=str,
        required=True,
        choices=["ACTIVE", "INACTIVE", "DRAFT", "上架", "下架", "草稿"],
        help="目标状态"
    )
    parser.add_argument(
        "--records",
        type=str,
        help="记录列表 JSON"
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

    if args.records:
        records = json.loads(args.records)
        result = batch_update(records, target_status)

        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(format_results(result))
    else:
        parser.print_help()
        print("\n" + "=" * 50)
        print("批量操作工作流说明:")
        print("=" * 50)
        print(f"""
1. Claude 调用 MCP 读取飞书表格中符合条件的记录:
   - 批量上架: 目标状态=上架 且 同步状态=已同步
   - 批量下架: 目标状态=下架 且 同步状态=已同步

2. 调用此脚本执行批量状态变更:
   python batch_update_status.py --status ACTIVE --records '<records_json>'

3. 根据返回结果，Claude 更新飞书表格的同步时间

示例:
   python batch_update_status.py --status ACTIVE --records '[
     {{"record_id": "rec1", "fields": {{"商品名称": "拿铁", "系统商品ID": "prod-001"}}}},
     {{"record_id": "rec2", "fields": {{"商品名称": "美式", "系统商品ID": "prod-002"}}}}
   ]'
""")


if __name__ == "__main__":
    main()

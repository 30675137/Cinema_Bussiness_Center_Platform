#!/usr/bin/env python3
"""
查询商品状态 - 统计飞书表格和系统商品状态

使用方法:
    # 统计飞书表格数据（需要传入记录）
    python query_status.py --feishu-records '<JSON记录列表>'

    # 查询系统商品状态
    python query_status.py --system

    # 综合统计
    python query_status.py --feishu-records '<JSON>' --system

输出:
    状态统计
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from channel_product.api_client import ChannelProductAPI
from channel_product.feishu_helper import format_status_summary
from channel_product.config import FIELD_NAMES, STATUS_MAPPING_REVERSE


def count_feishu_status(records: list) -> dict:
    """统计飞书表格状态"""
    sync_status_count = {"待同步": 0, "已同步": 0, "失败": 0}
    target_status_count = {"草稿": 0, "上架": 0, "下架": 0}

    for record in records:
        fields = record.get("fields", record)
        sync_status = fields.get(FIELD_NAMES["sync_status"], "待同步")
        target_status = fields.get(FIELD_NAMES["target_status"], "草稿")

        if sync_status in sync_status_count:
            sync_status_count[sync_status] += 1
        if target_status in target_status_count:
            target_status_count[target_status] += 1

    return {
        "total": len(records),
        "sync_status": sync_status_count,
        "target_status": target_status_count,
    }


def count_system_status() -> dict:
    """查询系统商品状态"""
    api = ChannelProductAPI()

    try:
        # 获取所有商品
        result = api.list_products(size=1000)
        products = result.get("content", [])

        status_count = {"DRAFT": 0, "ACTIVE": 0, "INACTIVE": 0}
        for product in products:
            status = product.get("status", "DRAFT")
            if status in status_count:
                status_count[status] += 1

        return {
            "success": True,
            "total": len(products),
            "status": status_count,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


def format_feishu_stats(stats: dict) -> str:
    """格式化飞书统计"""
    lines = [
        "飞书表格数据:",
        "┌──────────┬──────┐",
        "│ 同步状态  │ 数量 │",
        "├──────────┼──────┤",
    ]

    for status, count in stats["sync_status"].items():
        lines.append(f"│ {status:<8} │ {count:^4} │")

    lines.extend([
        "├──────────┼──────┤",
        f"│ 总计      │ {stats['total']:^4} │",
        "└──────────┴──────┘",
        "",
        "目标状态分布:",
        "┌──────────┬──────┐",
        "│ 目标状态  │ 数量 │",
        "├──────────┼──────┤",
    ])

    for status, count in stats["target_status"].items():
        lines.append(f"│ {status:<8} │ {count:^4} │")

    lines.append("└──────────┴──────┘")

    return "\n".join(lines)


def format_system_stats(stats: dict) -> str:
    """格式化系统统计"""
    if not stats["success"]:
        return f"❌ 获取系统状态失败: {stats.get('error')}"

    lines = [
        "系统商品状态:",
        "┌──────────┬──────┐",
        "│ 商品状态  │ 数量 │",
        "├──────────┼──────┤",
    ]

    for status, count in stats["status"].items():
        display_name = STATUS_MAPPING_REVERSE.get(status, status)
        lines.append(f"│ {display_name:<8} │ {count:^4} │")

    lines.extend([
        "├──────────┼──────┤",
        f"│ 总计      │ {stats['total']:^4} │",
        "└──────────┴──────┘",
    ])

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="查询商品状态")
    parser.add_argument(
        "--feishu-records",
        type=str,
        help="飞书记录列表 JSON"
    )
    parser.add_argument(
        "--system",
        action="store_true",
        help="查询系统商品状态"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="输出 JSON 格式"
    )

    args = parser.parse_args()

    result = {}
    output_lines = ["📊 商品同步状态统计", ""]

    if args.feishu_records:
        records = json.loads(args.feishu_records)
        feishu_stats = count_feishu_status(records)
        result["feishu"] = feishu_stats
        output_lines.append(format_feishu_stats(feishu_stats))
        output_lines.append("")

    if args.system:
        system_stats = count_system_status()
        result["system"] = system_stats
        output_lines.append(format_system_stats(system_stats))
        output_lines.append("")

    if not args.feishu_records and not args.system:
        parser.print_help()
        print("\n" + "=" * 50)
        print("状态查询工作流说明:")
        print("=" * 50)
        print("""
1. Claude 调用 MCP 获取飞书表格所有记录
2. 调用此脚本进行统计:
   python query_status.py --feishu-records '<records_json>' --system
3. 显示统计结果

单独查询系统状态:
   python query_status.py --system
""")
        return

    # 添加待处理提示
    if args.feishu_records:
        feishu_stats = result.get("feishu", {})
        pending = feishu_stats.get("sync_status", {}).get("待同步", 0)
        failed = feishu_stats.get("sync_status", {}).get("失败", 0)

        if pending or failed:
            output_lines.append("待处理:")
            if pending:
                output_lines.append(f"- {pending} 条记录待同步")
            if failed:
                output_lines.append(f"- {failed} 条同步失败需处理")

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("\n".join(output_lines))


if __name__ == "__main__":
    main()

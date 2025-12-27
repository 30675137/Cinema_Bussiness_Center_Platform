#!/usr/bin/env python3
"""
单位换算规则查询脚本

用法:
    python query_conversions.py [--category CATEGORY] [--search KEYWORD] [--stats]

示例:
    python query_conversions.py                     # 查询所有规则
    python query_conversions.py --category volume   # 查询体积类规则
    python query_conversions.py --search 瓶         # 搜索包含"瓶"的规则
    python query_conversions.py --stats             # 显示统计信息
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api_client import get_client
except ImportError:
    from .api_client import get_client


# 类别中文映射
CATEGORY_NAMES = {
    "volume": "体积",
    "weight": "重量",
    "quantity": "计数"
}


def query_conversions(category: str = None, search: str = None) -> dict:
    """查询换算规则

    Args:
        category: 类别筛选 (volume/weight/quantity)
        search: 单位名称搜索关键词

    Returns:
        查询结果
    """
    client = get_client()
    return client.list_unit_conversions(category=category, search=search)


def get_stats() -> dict:
    """获取换算规则统计

    Returns:
        统计结果
    """
    client = get_client()
    return client.get_unit_conversion_stats()


def format_rule(rule: dict) -> str:
    """格式化单条规则为可读字符串

    Args:
        rule: 规则数据

    Returns:
        格式化字符串
    """
    # 支持 snake_case 和 camelCase 两种字段格式
    from_unit = rule.get("from_unit") or rule.get("fromUnit", "?")
    to_unit = rule.get("to_unit") or rule.get("toUnit", "?")
    rate = rule.get("conversion_rate") or rule.get("conversionRate", 0)
    category = rule.get("category", "unknown").lower()
    category_name = CATEGORY_NAMES.get(category, category)

    return f"1{from_unit} = {rate}{to_unit} ({category_name}类)"


def print_rules(rules: list) -> None:
    """打印规则列表

    Args:
        rules: 规则列表
    """
    if not rules:
        print("📋 未找到换算规则")
        return

    print(f"📋 找到 {len(rules)} 条换算规则:\n")

    # 按类别分组
    by_category = {"volume": [], "weight": [], "quantity": []}
    for rule in rules:
        cat = rule.get("category", "volume")
        if cat in by_category:
            by_category[cat].append(rule)

    for category, cat_rules in by_category.items():
        if cat_rules:
            cat_name = CATEGORY_NAMES.get(category, category)
            print(f"【{cat_name}类】")
            for rule in cat_rules:
                rule_id = rule.get("id", "")[:8]  # 只显示 ID 前 8 位
                print(f"  • {format_rule(rule)}  [ID: {rule_id}...]")
            print()


def print_stats(stats: dict) -> None:
    """打印统计信息

    Args:
        stats: 统计数据
    """
    print("📊 换算规则统计:\n")
    print(f"  • 体积类 (volume):   {stats.get('volume', 0)} 条")
    print(f"  • 重量类 (weight):   {stats.get('weight', 0)} 条")
    print(f"  • 计数类 (quantity): {stats.get('quantity', 0)} 条")
    print(f"  ─────────────────────")
    print(f"  • 总计:              {stats.get('total', 0)} 条")


def main():
    parser = argparse.ArgumentParser(
        description="查询单位换算规则",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s                      查询所有规则
  %(prog)s --category volume    查询体积类规则
  %(prog)s --search 瓶          搜索包含"瓶"的规则
  %(prog)s --stats              显示统计信息
        """
    )
    parser.add_argument(
        "--category", "-c",
        choices=["volume", "weight", "quantity"],
        help="按类别筛选: volume(体积), weight(重量), quantity(计数)"
    )
    parser.add_argument(
        "--search", "-s",
        help="按单位名称搜索"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="显示统计信息"
    )

    args = parser.parse_args()

    try:
        if args.stats:
            result = get_stats()
            if result.get("success"):
                print_stats(result.get("data", {}))
            else:
                print(f"❌ 获取统计失败: {result.get('error', '未知错误')}")
                sys.exit(1)
        else:
            result = query_conversions(category=args.category, search=args.search)
            if result.get("success"):
                print_rules(result.get("data", []))
            else:
                print(f"❌ 查询失败: {result.get('error', '未知错误')}")
                sys.exit(1)

    except ValueError as e:
        print(f"❌ 配置错误: {e}")
        print("   请确保已设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 执行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

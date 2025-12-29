#!/usr/bin/env python3
"""
单位换算计算脚本

用法:
    python calculate_conversion.py <数量> <源单位> <目标单位>

示例:
    python calculate_conversion.py 45 ml 瓶      # 45ml等于多少瓶
    python calculate_conversion.py 1 瓶 L        # 1瓶等于多少升
    python calculate_conversion.py 750 ml L      # 750ml等于多少升

舍入规则:
    - 体积类 (volume): 保留1位小数，四舍五入
    - 重量类 (weight): 保留0位小数，四舍五入
    - 计数类 (quantity): 保留0位小数，向上取整
"""

import argparse
import sys
import os
import math
from collections import deque
from typing import Dict, List, Optional, Tuple

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api_client import get_client
except ImportError:
    from .api_client import get_client


# 舍入精度配置
PRECISION_MAP = {
    "volume": 1,      # 体积类保留1位小数
    "weight": 0,      # 重量类取整
    "quantity": 0     # 计数类取整（向上）
}

# 类别中文名
CATEGORY_NAMES = {
    "volume": "体积",
    "weight": "重量",
    "quantity": "计数"
}


def round_by_category(value: float, category: str) -> float:
    """按类别应用舍入规则

    Args:
        value: 原始值
        category: 单位类别

    Returns:
        舍入后的值
    """
    precision = PRECISION_MAP.get(category, 2)
    if category == "quantity":
        # 计数类向上取整
        return math.ceil(value)
    else:
        # 其他类四舍五入
        return round(value, precision)


def build_conversion_graph(rules: List[dict]) -> Dict[str, Dict[str, Tuple[float, str]]]:
    """构建换算图（支持双向换算）

    Args:
        rules: 换算规则列表

    Returns:
        图结构: {from_unit: {to_unit: (rate, category)}}
    """
    graph = {}

    for rule in rules:
        # 支持 snake_case 和 camelCase 两种字段格式
        from_unit = rule.get("from_unit") or rule.get("fromUnit")
        to_unit = rule.get("to_unit") or rule.get("toUnit")
        rate = rule.get("conversion_rate") or rule.get("conversionRate", 0)
        category = (rule.get("category") or "volume").lower()

        if not from_unit or not to_unit or rate <= 0:
            continue

        # 正向: from_unit -> to_unit
        if from_unit not in graph:
            graph[from_unit] = {}
        graph[from_unit][to_unit] = (rate, category)

        # 反向: to_unit -> from_unit (自动计算反向换算率)
        if to_unit not in graph:
            graph[to_unit] = {}
        graph[to_unit][from_unit] = (1.0 / rate, category)

    return graph


def find_conversion_path(
    graph: Dict[str, Dict[str, Tuple[float, str]]],
    from_unit: str,
    to_unit: str,
    max_steps: int = 5
) -> Optional[Tuple[List[str], float, str]]:
    """使用 BFS 查找最短换算路径

    Args:
        graph: 换算图
        from_unit: 源单位
        to_unit: 目标单位
        max_steps: 最大步数限制

    Returns:
        (路径, 总换算率, 类别) 或 None
    """
    if from_unit == to_unit:
        return ([from_unit], 1.0, "volume")

    if from_unit not in graph:
        return None

    # BFS 搜索
    # 队列元素: (当前单位, 路径, 累积换算率, 类别)
    queue = deque([(from_unit, [from_unit], 1.0, None)])
    visited = {from_unit}

    while queue:
        current, path, rate, category = queue.popleft()

        if len(path) > max_steps + 1:
            continue

        if current not in graph:
            continue

        for next_unit, (step_rate, step_category) in graph[current].items():
            if next_unit in visited:
                continue

            new_path = path + [next_unit]
            new_rate = rate * step_rate
            # 使用第一步的类别作为整个路径的类别
            new_category = category if category else step_category

            if next_unit == to_unit:
                return (new_path, new_rate, new_category)

            visited.add(next_unit)
            queue.append((next_unit, new_path, new_rate, new_category))

    return None


def calculate_conversion(quantity: float, from_unit: str, to_unit: str) -> dict:
    """执行单位换算计算

    Args:
        quantity: 换算数量
        from_unit: 源单位
        to_unit: 目标单位

    Returns:
        计算结果
    """
    if quantity <= 0:
        return {
            "success": False,
            "error": "换算数量必须为正数"
        }

    # 获取所有换算规则
    client = get_client()
    result = client.list_unit_conversions()

    if not result.get("success"):
        return {
            "success": False,
            "error": f"获取换算规则失败: {result.get('error', '未知错误')}"
        }

    rules = result.get("data", [])
    if not rules:
        return {
            "success": False,
            "error": "系统中没有配置换算规则"
        }

    # 构建换算图
    graph = build_conversion_graph(rules)

    # 查找换算路径
    path_result = find_conversion_path(graph, from_unit, to_unit)

    if not path_result:
        return {
            "success": False,
            "error": f"无法找到从 '{from_unit}' 到 '{to_unit}' 的换算路径",
            "suggestion": "请先配置相关换算规则"
        }

    path, total_rate, category = path_result

    # 计算换算结果
    raw_result = quantity * total_rate
    final_result = round_by_category(raw_result, category)

    return {
        "success": True,
        "from_unit": from_unit,
        "to_unit": to_unit,
        "quantity": quantity,
        "result": final_result,
        "raw_result": raw_result,
        "total_rate": total_rate,
        "path": path,
        "category": category,
        "rounded": raw_result != final_result
    }


def print_result(result: dict) -> None:
    """打印换算结果

    Args:
        result: 计算结果
    """
    if not result.get("success"):
        print(f"❌ {result.get('error', '换算失败')}")
        if result.get("suggestion"):
            print(f"   建议: {result['suggestion']}")
        return

    quantity = result["quantity"]
    from_unit = result["from_unit"]
    to_unit = result["to_unit"]
    final_result = result["result"]
    path = result["path"]
    total_rate = result["total_rate"]
    category = result["category"]
    category_name = CATEGORY_NAMES.get(category, category)

    print(f"✅ {quantity}{from_unit} = {final_result}{to_unit}")
    print(f"   换算路径: {' → '.join(path)}")
    print(f"   换算率: 1{from_unit} = {total_rate}{to_unit}")

    if result.get("rounded"):
        raw = result["raw_result"]
        print(f"   舍入: {raw} → {final_result} ({category_name}类)")


def main():
    parser = argparse.ArgumentParser(
        description="单位换算计算",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s 45 ml 瓶      45ml等于多少瓶
  %(prog)s 1 瓶 L        1瓶等于多少升
  %(prog)s 750 ml L      750ml等于多少升

舍入规则:
  - 体积类: 保留1位小数，四舍五入
  - 重量类: 保留0位小数，四舍五入
  - 计数类: 保留0位小数，向上取整
        """
    )
    parser.add_argument("quantity", type=float, help="换算数量")
    parser.add_argument("from_unit", help="源单位")
    parser.add_argument("to_unit", help="目标单位")

    args = parser.parse_args()

    try:
        result = calculate_conversion(args.quantity, args.from_unit, args.to_unit)
        print_result(result)

        if not result.get("success"):
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

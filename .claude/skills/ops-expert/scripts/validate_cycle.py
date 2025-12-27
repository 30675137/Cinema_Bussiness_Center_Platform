#!/usr/bin/env python3
"""
换算规则循环依赖检测脚本

用法:
    python validate_cycle.py <源单位> <目标单位>

示例:
    python validate_cycle.py 瓶 ml       # 检测添加 瓶→ml 是否会产生循环
    python validate_cycle.py A B         # 检测添加 A→B 是否会产生循环

算法说明:
    使用 DFS (深度优先搜索) + 路径追踪检测循环依赖
    如果从 to_unit 出发能够到达 from_unit，则添加 from_unit→to_unit 会产生循环
"""

import argparse
import sys
import os
from typing import Dict, List, Optional, Set

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api_client import get_client
except ImportError:
    from .api_client import get_client


def build_adjacency_list(
    rules: List[dict],
    exclude_rule_id: Optional[str] = None
) -> Dict[str, List[str]]:
    """构建邻接表

    Args:
        rules: 换算规则列表
        exclude_rule_id: 要排除的规则 ID（用于更新场景）

    Returns:
        邻接表: {from_unit: [to_unit1, to_unit2, ...]}
    """
    graph = {}

    for rule in rules:
        rule_id = rule.get("id", "")
        if exclude_rule_id and rule_id == exclude_rule_id:
            continue

        from_unit = rule.get("from_unit")
        to_unit = rule.get("to_unit")

        if not from_unit or not to_unit:
            continue

        # 正向边
        if from_unit not in graph:
            graph[from_unit] = []
        graph[from_unit].append(to_unit)

        # 反向边（因为换算是双向的）
        if to_unit not in graph:
            graph[to_unit] = []
        graph[to_unit].append(from_unit)

    return graph


def dfs_find_path(
    graph: Dict[str, List[str]],
    start: str,
    target: str,
    visited: Set[str],
    path: List[str]
) -> Optional[List[str]]:
    """DFS 查找从 start 到 target 的路径

    Args:
        graph: 邻接表
        start: 起点
        target: 目标
        visited: 已访问节点
        path: 当前路径

    Returns:
        找到的路径或 None
    """
    if start == target:
        return path + [target]

    if start in visited:
        return None

    visited.add(start)
    path.append(start)

    if start in graph:
        for neighbor in graph[start]:
            result = dfs_find_path(graph, neighbor, target, visited, path.copy())
            if result:
                return result

    return None


def check_cycle(
    from_unit: str,
    to_unit: str,
    exclude_rule_id: Optional[str] = None
) -> dict:
    """检测添加规则是否会导致循环依赖

    逻辑：如果在现有图中，从 to_unit 能够到达 from_unit，
          那么添加 from_unit→to_unit 会形成循环

    Args:
        from_unit: 源单位
        to_unit: 目标单位
        exclude_rule_id: 要排除的规则 ID（用于更新场景）

    Returns:
        检测结果
    """
    if not from_unit or not to_unit:
        return {"success": False, "error": "单位不能为空"}

    from_unit = from_unit.strip()
    to_unit = to_unit.strip()

    if from_unit == to_unit:
        return {
            "success": True,
            "has_cycle": True,
            "cycle_path": [from_unit, from_unit],
            "message": "源单位和目标单位相同"
        }

    # 获取所有换算规则
    try:
        client = get_client()
        result = client.list_unit_conversions()

        if not result.get("success"):
            # 获取规则失败时，保守返回无循环
            return {
                "success": True,
                "has_cycle": False,
                "message": "无法获取现有规则，跳过循环检测"
            }

        rules = result.get("data", [])

    except Exception as e:
        return {
            "success": True,
            "has_cycle": False,
            "message": f"循环检测跳过: {e}"
        }

    # 构建邻接表
    graph = build_adjacency_list(rules, exclude_rule_id)

    # 检测：从 to_unit 出发是否能到达 from_unit
    # 如果能，则添加 from_unit→to_unit 会形成循环
    visited = set()
    path = dfs_find_path(graph, to_unit, from_unit, visited, [])

    if path:
        # 构建完整循环路径: path + [to_unit]
        cycle_path = path + [to_unit]
        return {
            "success": True,
            "has_cycle": True,
            "cycle_path": cycle_path,
            "message": f"检测到循环依赖: {' → '.join(cycle_path)}"
        }
    else:
        return {
            "success": True,
            "has_cycle": False,
            "message": f"添加规则 {from_unit}→{to_unit} 不会产生循环依赖"
        }


def main():
    parser = argparse.ArgumentParser(
        description="检测换算规则循环依赖",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s 瓶 ml       检测添加 1瓶=?ml 是否会产生循环
  %(prog)s A B         检测添加 A→B 是否会产生循环

说明:
  如果从 B 出发能够通过现有规则到达 A，
  则添加 A→B 会形成循环依赖。
        """
    )
    parser.add_argument("from_unit", help="源单位")
    parser.add_argument("to_unit", help="目标单位")
    parser.add_argument(
        "--exclude-id",
        help="要排除的规则 ID（用于更新场景）"
    )

    args = parser.parse_args()

    try:
        result = check_cycle(args.from_unit, args.to_unit, args.exclude_id)

        if result.get("has_cycle"):
            print(f"⚠️  检测到循环依赖!")
            cycle_path = result.get("cycle_path", [])
            if cycle_path:
                print(f"   循环路径: {' → '.join(cycle_path)}")
            sys.exit(1)
        else:
            print(f"✅ {result.get('message', '无循环依赖')}")

    except ValueError as e:
        print(f"❌ 配置错误: {e}")
        print("   请确保已设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 执行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

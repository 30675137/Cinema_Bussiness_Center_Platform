#!/usr/bin/env python3
"""
更新单位换算规则脚本

用法:
    python update_conversion.py <规则ID> <源单位> <目标单位> <换算率> <类别>

示例:
    python update_conversion.py abc123 瓶 ml 750 volume    # 更新规则
    python update_conversion.py abc123 瓶 ml 700 volume    # 修改换算率

注意:
    - 修改规则前会检测是否会导致循环依赖
    - 如果规则被 BOM 引用，会显示警告
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api_client import get_client
    from validate_cycle import check_cycle
except ImportError:
    from .api_client import get_client
    from .validate_cycle import check_cycle


# 类别中文映射
CATEGORY_NAMES = {
    "volume": "体积",
    "weight": "重量",
    "quantity": "计数"
}


def get_rule_by_id(rule_id: str) -> dict:
    """根据 ID 获取规则

    Args:
        rule_id: 规则 ID

    Returns:
        规则数据或错误信息
    """
    client = get_client()
    result = client.get_unit_conversion(rule_id)

    if not result.get("success"):
        return {"success": False, "error": result.get("error", "查询失败")}

    data = result.get("data", [])
    if not data:
        return {"success": False, "error": f"未找到 ID 为 '{rule_id}' 的规则"}

    return {"success": True, "data": data[0] if isinstance(data, list) else data}


def update_conversion(
    rule_id: str,
    from_unit: str,
    to_unit: str,
    rate: float,
    category: str,
    skip_cycle_check: bool = False
) -> dict:
    """更新换算规则

    Args:
        rule_id: 规则 ID
        from_unit: 源单位
        to_unit: 目标单位
        rate: 换算率
        category: 类别
        skip_cycle_check: 是否跳过循环检测

    Returns:
        更新结果
    """
    # 参数验证
    if not rule_id or not rule_id.strip():
        return {"success": False, "error": "规则 ID 不能为空"}

    if not from_unit or not from_unit.strip():
        return {"success": False, "error": "源单位不能为空"}

    if not to_unit or not to_unit.strip():
        return {"success": False, "error": "目标单位不能为空"}

    from_unit = from_unit.strip()
    to_unit = to_unit.strip()
    rule_id = rule_id.strip()

    if from_unit == to_unit:
        return {"success": False, "error": "源单位和目标单位不能相同"}

    if rate <= 0:
        return {"success": False, "error": "换算率必须为正数"}

    valid_categories = ["volume", "weight", "quantity"]
    if category not in valid_categories:
        return {
            "success": False,
            "error": f"无效的类别: {category}，必须是 {', '.join(valid_categories)} 之一"
        }

    # 检查规则是否存在
    existing = get_rule_by_id(rule_id)
    if not existing.get("success"):
        return existing

    old_rule = existing.get("data", {})
    old_from = old_rule.get("from_unit")
    old_to = old_rule.get("to_unit")
    old_rate = old_rule.get("conversion_rate")

    # 如果单位发生变化，需要检查循环依赖
    if not skip_cycle_check and (from_unit != old_from or to_unit != old_to):
        cycle_result = check_cycle(from_unit, to_unit, exclude_rule_id=rule_id)
        if cycle_result.get("has_cycle"):
            cycle_path = cycle_result.get("cycle_path", [])
            return {
                "success": False,
                "error": "修改此规则将导致循环依赖",
                "cycle_path": cycle_path,
                "suggestion": f"循环路径: {' → '.join(cycle_path)}"
            }

    # 执行更新
    client = get_client()
    result = client.update_unit_conversion(rule_id, from_unit, to_unit, rate, category)

    if result.get("success"):
        category_name = CATEGORY_NAMES.get(category, category)
        return {
            "success": True,
            "message": f"已更新换算规则: 1{from_unit} = {rate}{to_unit} ({category_name}类)",
            "old_rule": f"1{old_from} = {old_rate}{old_to}",
            "data": result.get("data")
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "更新失败")
        }


def main():
    parser = argparse.ArgumentParser(
        description="更新单位换算规则",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s abc123 瓶 ml 750 volume    更新规则
  %(prog)s abc123 瓶 ml 700 volume    修改换算率为700

注意:
  - 修改单位时会检测是否会导致循环依赖
  - 使用 query_conversions.py 查看规则 ID
        """
    )
    parser.add_argument("rule_id", help="规则 ID")
    parser.add_argument("from_unit", help="源单位")
    parser.add_argument("to_unit", help="目标单位")
    parser.add_argument("rate", type=float, help="换算率")
    parser.add_argument(
        "category",
        choices=["volume", "weight", "quantity"],
        help="类别: volume(体积), weight(重量), quantity(计数)"
    )
    parser.add_argument(
        "--skip-cycle-check",
        action="store_true",
        help="跳过循环依赖检测（不推荐）"
    )

    args = parser.parse_args()

    try:
        result = update_conversion(
            args.rule_id,
            args.from_unit,
            args.to_unit,
            args.rate,
            args.category,
            skip_cycle_check=args.skip_cycle_check
        )

        if result.get("success"):
            print(f"✅ {result.get('message')}")
            if result.get("old_rule"):
                print(f"   原规则: {result['old_rule']}")
        else:
            print(f"❌ {result.get('error')}")
            if result.get("suggestion"):
                print(f"   {result['suggestion']}")
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

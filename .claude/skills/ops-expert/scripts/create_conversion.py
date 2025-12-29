#!/usr/bin/env python3
"""
创建单位换算规则脚本

用法:
    python create_conversion.py <源单位> <目标单位> <换算率> <类别>

示例:
    python create_conversion.py 瓶 ml 750 volume      # 1瓶=750ml
    python create_conversion.py 箱 瓶 12 quantity     # 1箱=12瓶
    python create_conversion.py kg g 1000 weight      # 1kg=1000g

类别说明:
    - volume: 体积类 (ml, L, 杯, 瓶等)
    - weight: 重量类 (g, kg, 份等)
    - quantity: 计数类 (个, 打, 箱等)
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


def create_conversion(
    from_unit: str,
    to_unit: str,
    rate: float,
    category: str,
    skip_cycle_check: bool = False
) -> dict:
    """创建换算规则

    Args:
        from_unit: 源单位
        to_unit: 目标单位
        rate: 换算率 (1 from_unit = rate to_unit)
        category: 类别 (volume/weight/quantity)
        skip_cycle_check: 是否跳过循环检测

    Returns:
        创建结果
    """
    # 参数验证
    if not from_unit or not from_unit.strip():
        return {"success": False, "error": "源单位不能为空"}

    if not to_unit or not to_unit.strip():
        return {"success": False, "error": "目标单位不能为空"}

    from_unit = from_unit.strip()
    to_unit = to_unit.strip()

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

    # 循环依赖检测
    if not skip_cycle_check:
        cycle_result = check_cycle(from_unit, to_unit)
        if cycle_result.get("has_cycle"):
            cycle_path = cycle_result.get("cycle_path", [])
            return {
                "success": False,
                "error": "添加此规则将导致循环依赖",
                "cycle_path": cycle_path,
                "suggestion": f"循环路径: {' → '.join(cycle_path)}"
            }

    # 检查规则是否已存在
    client = get_client()
    existing = client.list_unit_conversions(search=from_unit)

    if existing.get("success"):
        for rule in existing.get("data", []):
            if rule.get("from_unit") == from_unit and rule.get("to_unit") == to_unit:
                return {
                    "success": False,
                    "error": f"规则已存在: 1{from_unit} = {rule.get('conversion_rate')}{to_unit}",
                    "existing_rule": rule,
                    "suggestion": "如需修改，请使用 update_conversion.py"
                }

    # 创建规则
    result = client.create_unit_conversion(from_unit, to_unit, rate, category)

    if result.get("success"):
        category_name = CATEGORY_NAMES.get(category, category)
        return {
            "success": True,
            "message": f"已创建换算规则: 1{from_unit} = {rate}{to_unit} ({category_name}类)",
            "data": result.get("data")
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "创建失败")
        }


def parse_natural_input(text: str) -> dict:
    """解析自然语言输入

    支持格式:
        - "1瓶=750ml"
        - "1箱=12瓶"
        - "瓶 ml 750"

    Args:
        text: 用户输入

    Returns:
        解析结果 {from_unit, to_unit, rate} 或 {error}
    """
    import re

    # 尝试匹配 "1X=YZ" 格式
    pattern1 = r"1?\s*([^\d=]+)\s*=\s*(\d+\.?\d*)\s*([^\d\s]+)"
    match = re.match(pattern1, text.strip())
    if match:
        from_unit = match.group(1).strip()
        rate = float(match.group(2))
        to_unit = match.group(3).strip()
        return {"from_unit": from_unit, "to_unit": to_unit, "rate": rate}

    return {"error": f"无法解析输入: {text}"}


def main():
    parser = argparse.ArgumentParser(
        description="创建单位换算规则",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s 瓶 ml 750 volume      创建: 1瓶=750ml (体积类)
  %(prog)s 箱 瓶 12 quantity     创建: 1箱=12瓶 (计数类)
  %(prog)s kg g 1000 weight      创建: 1kg=1000g (重量类)

类别说明:
  - volume:   体积类 (ml, L, 杯, 瓶等)
  - weight:   重量类 (g, kg, 份等)
  - quantity: 计数类 (个, 打, 箱等)
        """
    )
    parser.add_argument("from_unit", help="源单位")
    parser.add_argument("to_unit", help="目标单位")
    parser.add_argument("rate", type=float, help="换算率 (1 源单位 = ? 目标单位)")
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
        result = create_conversion(
            args.from_unit,
            args.to_unit,
            args.rate,
            args.category,
            skip_cycle_check=args.skip_cycle_check
        )

        if result.get("success"):
            print(f"✅ {result.get('message')}")
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

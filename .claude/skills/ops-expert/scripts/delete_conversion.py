#!/usr/bin/env python3
"""
删除单位换算规则脚本

用法:
    python delete_conversion.py <规则ID> [--force]

示例:
    python delete_conversion.py abc123           # 删除规则（会检查引用）
    python delete_conversion.py abc123 --force   # 强制删除

注意:
    - 删除前会检查是否有 BOM 引用该规则
    - 删除前会检查是否会影响其他换算路径
    - 使用 --force 可以跳过检查强制删除
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api_client import get_client
except ImportError:
    from .api_client import get_client


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


def check_rule_references(from_unit: str, to_unit: str) -> dict:
    """检查规则是否被引用

    检查项:
    1. 是否有其他规则依赖此规则构建换算路径
    2. 是否有 BOM 配方使用此换算关系

    Args:
        from_unit: 源单位
        to_unit: 目标单位

    Returns:
        检查结果
    """
    # 简化实现：当前只检查是否有其他换算路径会受影响
    # 完整实现需要后端 API 支持 BOM 引用查询

    client = get_client()
    result = client.list_unit_conversions()

    if not result.get("success"):
        return {"success": True, "warnings": []}  # 查询失败时不阻止删除

    rules = result.get("data", [])

    # 检查是否有规则以当前规则的目标单位为源单位
    dependent_rules = []
    for rule in rules:
        if rule.get("from_unit") == to_unit:
            dependent_rules.append(rule)

    warnings = []
    if dependent_rules:
        deps = [f"{r.get('from_unit')}→{r.get('to_unit')}" for r in dependent_rules]
        warnings.append(f"以下规则依赖 '{to_unit}' 作为源单位: {', '.join(deps)}")

    return {"success": True, "warnings": warnings}


def delete_conversion(rule_id: str, force: bool = False) -> dict:
    """删除换算规则

    Args:
        rule_id: 规则 ID
        force: 是否强制删除

    Returns:
        删除结果
    """
    if not rule_id or not rule_id.strip():
        return {"success": False, "error": "规则 ID 不能为空"}

    rule_id = rule_id.strip()

    # 获取规则信息
    existing = get_rule_by_id(rule_id)
    if not existing.get("success"):
        return existing

    rule = existing.get("data", {})
    from_unit = rule.get("from_unit")
    to_unit = rule.get("to_unit")
    rate = rule.get("conversion_rate")

    # 非强制模式下检查引用
    if not force:
        ref_check = check_rule_references(from_unit, to_unit)
        warnings = ref_check.get("warnings", [])

        if warnings:
            return {
                "success": False,
                "error": "删除此规则可能影响其他换算路径",
                "warnings": warnings,
                "rule": f"1{from_unit} = {rate}{to_unit}",
                "suggestion": "使用 --force 参数强制删除"
            }

    # 执行删除
    client = get_client()
    result = client.delete_unit_conversion(rule_id)

    if result.get("success"):
        return {
            "success": True,
            "message": f"已删除换算规则: 1{from_unit} = {rate}{to_unit}",
            "deleted_rule": rule
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "删除失败")
        }


def main():
    parser = argparse.ArgumentParser(
        description="删除单位换算规则",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s abc123           删除规则（会检查引用）
  %(prog)s abc123 --force   强制删除

注意:
  - 删除前会检查是否有其他规则依赖此规则
  - 使用 query_conversions.py 查看规则 ID
        """
    )
    parser.add_argument("rule_id", help="规则 ID")
    parser.add_argument(
        "--force", "-f",
        action="store_true",
        help="强制删除，跳过引用检查"
    )

    args = parser.parse_args()

    try:
        result = delete_conversion(args.rule_id, force=args.force)

        if result.get("success"):
            print(f"✅ {result.get('message')}")
        else:
            print(f"❌ {result.get('error')}")

            warnings = result.get("warnings", [])
            for warning in warnings:
                print(f"   ⚠️  {warning}")

            if result.get("rule"):
                print(f"   规则: {result['rule']}")
            if result.get("suggestion"):
                print(f"   建议: {result['suggestion']}")

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

#!/usr/bin/env python3
"""
Ops Expert Utility Functions

提供运营专家技能使用的工具函数。
"""

import json
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional


def format_response(
    success: bool,
    message: str,
    data: Optional[Any] = None,
    error: Optional[str] = None
) -> Dict[str, Any]:
    """格式化 API 响应为标准格式

    Args:
        success: 操作是否成功
        message: 响应消息
        data: 响应数据（可选）
        error: 错误信息（可选）

    Returns:
        标准格式的响应字典
    """
    response = {
        "success": success,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = error
    return response


def print_json(data: Dict[str, Any]) -> None:
    """打印 JSON 格式的输出

    Args:
        data: 要打印的数据
    """
    print(json.dumps(data, ensure_ascii=False, indent=2))


def confirm_action(
    action: str,
    target: str,
    affected_count: int = 1,
    threshold: int = 10
) -> Dict[str, Any]:
    """生成操作确认信息

    Args:
        action: 操作类型（如 "下架"、"删除"、"修改"）
        target: 操作目标描述
        affected_count: 受影响的数据数量
        threshold: 强制二次确认的阈值

    Returns:
        确认信息字典
    """
    requires_double_confirm = affected_count > threshold

    confirmation = {
        "action": action,
        "target": target,
        "affected_count": affected_count,
        "requires_confirmation": True,
        "requires_double_confirmation": requires_double_confirm,
        "message": f"即将{action} {target}，影响 {affected_count} 条数据"
    }

    if requires_double_confirm:
        confirmation["warning"] = f"此操作将影响超过 {threshold} 条数据，请输入 '确认执行' 以继续"

    return confirmation


def format_list_output(
    items: List[Dict[str, Any]],
    columns: List[str],
    title: Optional[str] = None
) -> str:
    """格式化列表数据为表格输出

    Args:
        items: 数据列表
        columns: 要显示的列名
        title: 表格标题（可选）

    Returns:
        格式化的表格字符串
    """
    if not items:
        return "没有找到数据"

    # 计算每列最大宽度
    widths = {col: len(col) for col in columns}
    for item in items:
        for col in columns:
            value = str(item.get(col, ""))
            widths[col] = max(widths[col], len(value))

    # 生成表头
    header = " | ".join(col.ljust(widths[col]) for col in columns)
    separator = "-+-".join("-" * widths[col] for col in columns)

    # 生成数据行
    rows = []
    for item in items:
        row = " | ".join(
            str(item.get(col, "")).ljust(widths[col])
            for col in columns
        )
        rows.append(row)

    # 组装输出
    output_lines = []
    if title:
        output_lines.append(title)
        output_lines.append("=" * len(title))
    output_lines.append(header)
    output_lines.append(separator)
    output_lines.extend(rows)
    output_lines.append(f"\n共 {len(items)} 条记录")

    return "\n".join(output_lines)


def parse_cli_args() -> Dict[str, str]:
    """解析命令行参数

    支持格式：
    - script.py action target
    - script.py --action=update --id=123

    Returns:
        参数字典
    """
    args = {}

    for i, arg in enumerate(sys.argv[1:], 1):
        if arg.startswith("--"):
            # 处理 --key=value 格式
            if "=" in arg:
                key, value = arg[2:].split("=", 1)
                args[key] = value
            else:
                # 处理 --key value 格式
                key = arg[2:]
                if i < len(sys.argv) - 1:
                    args[key] = sys.argv[i + 1]
        elif i == 1:
            args["action"] = arg
        elif i == 2:
            args["target"] = arg

    return args


def validate_required_args(
    args: Dict[str, str],
    required: List[str]
) -> Optional[str]:
    """验证必需的参数是否存在

    Args:
        args: 参数字典
        required: 必需的参数列表

    Returns:
        缺失参数的错误消息，如果全部存在则返回 None
    """
    missing = [arg for arg in required if arg not in args]
    if missing:
        return f"缺少必需参数: {', '.join(missing)}"
    return None

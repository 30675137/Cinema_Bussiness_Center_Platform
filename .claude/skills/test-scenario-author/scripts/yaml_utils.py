"""
@spec T001-e2e-scenario-author
YAML 处理工具模块

提供安全的 YAML 文件解析和生成功能。
"""

import yaml
from pathlib import Path
from typing import Dict, Any, Optional


def safe_load(file_path: Path) -> Optional[Dict[str, Any]]:
    """
    安全加载 YAML 文件

    Args:
        file_path: YAML 文件路径

    Returns:
        解析后的字典，如果文件不存在或解析失败返回 None

    Raises:
        yaml.YAMLError: YAML 格式错误
        FileNotFoundError: 文件不存在
    """
    if not file_path.exists():
        raise FileNotFoundError(f"YAML file not found: {file_path}")

    # 检查文件大小限制 (< 1MB)
    file_size = file_path.stat().st_size
    if file_size > 1024 * 1024:  # 1MB
        raise ValueError(f"YAML file too large: {file_size} bytes (max 1MB)")

    with file_path.open('r', encoding='utf-8') as f:
        # 使用 safe_load 防止代码注入
        return yaml.safe_load(f)


def safe_dump(data: Dict[str, Any], file_path: Path) -> None:
    """
    安全写入 YAML 文件

    Args:
        data: 要写入的数据字典
        file_path: 目标文件路径

    Raises:
        PermissionError: 无写入权限
        yaml.YAMLError: 数据无法序列化
    """
    # 确保父目录存在
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with file_path.open('w', encoding='utf-8') as f:
        yaml.dump(
            data,
            f,
            allow_unicode=True,  # 支持中文
            default_flow_style=False,  # 使用块状格式
            sort_keys=False,  # 保持字段顺序
            indent=2  # 2 空格缩进
        )


def validate_yaml_syntax(file_path: Path) -> tuple[bool, str]:
    """
    验证 YAML 文件语法

    Args:
        file_path: YAML 文件路径

    Returns:
        (是否有效, 错误信息)
    """
    try:
        safe_load(file_path)
        return True, ""
    except yaml.YAMLError as e:
        return False, f"YAML syntax error: {str(e)}"
    except FileNotFoundError as e:
        return False, str(e)
    except ValueError as e:
        return False, str(e)
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"

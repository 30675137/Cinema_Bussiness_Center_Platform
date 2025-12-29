"""
@spec T001-e2e-scenario-author
路径验证工具模块

提供安全的路径验证和目录管理功能。
"""

import re
from pathlib import Path
from typing import Optional


# 项目根目录和场景目录
REPO_ROOT = Path.cwd()
SCENARIOS_DIR = REPO_ROOT / 'scenarios'


def validate_scenario_path(scenario_path: Path) -> tuple[bool, str]:
    """
    验证场景文件路径是否安全且有效

    Args:
        scenario_path: 场景文件路径

    Returns:
        (是否有效, 错误信息)
    """
    try:
        # 规范化路径
        resolved_path = scenario_path.resolve()

        # 检查路径是否在 scenarios/ 目录内 (防止路径遍历攻击)
        if not str(resolved_path).startswith(str(SCENARIOS_DIR.resolve())):
            return False, f"Path must be inside scenarios/ directory: {scenario_path}"

        # 检查文件扩展名
        if resolved_path.suffix != '.yaml':
            return False, f"File must have .yaml extension: {scenario_path}"

        return True, ""

    except Exception as e:
        return False, f"Invalid path: {str(e)}"


def ensure_module_dir(module: str) -> Path:
    """
    确保场景模块目录存在

    Args:
        module: 模块名称 (如 order, inventory, store)

    Returns:
        模块目录路径

    Raises:
        ValueError: 模块名称无效
    """
    # 验证模块名称 (仅允许小写字母、数字、下划线、连字符)
    if not re.match(r'^[a-z0-9_-]+$', module):
        raise ValueError(f"Invalid module name: {module}. Only lowercase letters, numbers, underscores, and hyphens allowed.")

    module_dir = SCENARIOS_DIR / module
    module_dir.mkdir(parents=True, exist_ok=True)
    return module_dir


def get_scenario_path(module: str, scenario_id: str) -> Path:
    """
    获取场景文件路径

    Args:
        module: 模块名称
        scenario_id: 场景 ID (如 E2E-ORDER-001)

    Returns:
        场景文件路径
    """
    module_dir = ensure_module_dir(module)
    return module_dir / f"{scenario_id}.yaml"


def validate_module_name(module: str) -> bool:
    """
    验证模块名称格式

    Args:
        module: 模块名称

    Returns:
        是否有效
    """
    return bool(re.match(r'^[a-z0-9_-]+$', module))


def list_scenario_files(module: Optional[str] = None) -> list[Path]:
    """
    列出场景文件

    Args:
        module: 可选的模块名称，用于筛选

    Returns:
        场景文件路径列表
    """
    if module:
        search_dir = SCENARIOS_DIR / module
        if not search_dir.exists():
            return []
        pattern = '*.yaml'
    else:
        search_dir = SCENARIOS_DIR
        pattern = '**/*.yaml'

    return list(search_dir.glob(pattern))

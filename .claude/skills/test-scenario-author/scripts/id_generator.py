"""
@spec T001-e2e-scenario-author
场景 ID 生成器模块

提供场景 ID 验证、冲突检测和自动生成功能。
"""

import re
from pathlib import Path
from typing import Optional
from path_utils import SCENARIOS_DIR, list_scenario_files


def validate_scenario_id(scenario_id: str) -> tuple[bool, str]:
    """
    验证 scenario_id 格式

    Args:
        scenario_id: 场景 ID

    Returns:
        (是否有效, 错误信息)
    """
    pattern = r'^E2E-[A-Z]+-\d{3}$'
    if not re.match(pattern, scenario_id):
        return False, f"Invalid scenario_id format: {scenario_id}. Expected: E2E-<MODULE>-<NUMBER> (e.g., E2E-ORDER-001)"

    return True, ""


def check_id_conflict(scenario_id: str) -> bool:
    """
    检查 scenario_id 是否冲突

    Args:
        scenario_id: 场景 ID

    Returns:
        True 如果冲突(已存在), False 如果无冲突
    """
    all_scenarios = list_scenario_files()

    for scenario_path in all_scenarios:
        if scenario_path.stem == scenario_id:
            return True  # 冲突

    return False  # 无冲突


def get_next_scenario_id(module: str) -> str:
    """
    生成下一个可用的 scenario_id

    Args:
        module: 模块名称 (如 order, inventory, store)

    Returns:
        下一个可用的 scenario_id (如 E2E-ORDER-001)
    """
    module_upper = module.upper()

    # 查找该模块的所有场景
    all_scenarios = list_scenario_files()
    module_scenarios = [
        path for path in all_scenarios
        if path.stem.startswith(f'E2E-{module_upper}-')
    ]

    if not module_scenarios:
        # 没有现有场景，返回 001
        return f'E2E-{module_upper}-001'

    # 提取编号并找到最大值
    numbers = []
    for path in module_scenarios:
        match = re.search(r'E2E-' + module_upper + r'-(\d{3})', path.stem)
        if match:
            numbers.append(int(match.group(1)))

    if not numbers:
        return f'E2E-{module_upper}-001'

    next_num = max(numbers) + 1
    return f'E2E-{module_upper}-{next_num:03d}'


def extract_module_from_id(scenario_id: str) -> Optional[str]:
    """
    从 scenario_id 提取模块名称

    Args:
        scenario_id: 场景 ID (如 E2E-ORDER-001)

    Returns:
        模块名称 (如 order)，如果格式无效返回 None
    """
    match = re.match(r'^E2E-([A-Z]+)-\d{3}$', scenario_id)
    if match:
        return match.group(1).lower()
    return None

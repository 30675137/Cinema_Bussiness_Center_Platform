"""
@spec T001-e2e-scenario-author
YAML 场景生成器模块

提供从对话数据生成场景 YAML 文件的功能。
"""

from datetime import datetime, timezone
from typing import Dict, Any, List
from pathlib import Path
import yaml_utils
import path_utils
import id_generator


def generate_from_dialogue(
    spec_ref: str,
    title: str,
    module: str,
    tags: Dict[str, Any],
    preconditions: Dict[str, Any],
    steps: List[Dict[str, Any]],
    assertions: List[Dict[str, Any]],
    description: str = "",
    scenario_id: str = None,
    artifacts: Dict[str, str] = None,
    metadata: Dict[str, str] = None
) -> Dict[str, Any]:
    """
    从对话收集的数据生成场景 YAML 结构

    Args:
        spec_ref: 项目规格 ID (如 P005)
        title: 场景标题
        module: 模块名称 (如 order, inventory)
        tags: 标签字典
        preconditions: 前置条件字典
        steps: 步骤列表
        assertions: 断言列表
        description: 场景描述 (可选)
        scenario_id: 场景 ID (可选,如果未提供则自动生成)
        artifacts: 工件配置 (可选)
        metadata: 元数据 (可选)

    Returns:
        场景数据字典

    Raises:
        ValueError: 数据验证失败
    """
    # 生成或验证 scenario_id
    if scenario_id:
        valid, error = id_generator.validate_scenario_id(scenario_id)
        if not valid:
            raise ValueError(error)

        if id_generator.check_id_conflict(scenario_id):
            raise ValueError(f"Scenario ID conflict: {scenario_id} already exists")
    else:
        scenario_id = id_generator.get_next_scenario_id(module)

    # 构建场景数据
    scenario_data = {
        'scenario_id': scenario_id,
        'spec_ref': spec_ref,
        'title': title
    }

    if description:
        scenario_data['description'] = description

    # 确保 tags 包含必需维度
    if 'module' not in tags or not tags['module']:
        tags['module'] = [module]

    required_tag_dims = ['module', 'channel', 'deploy']
    for dim in required_tag_dims:
        if dim not in tags or not tags[dim]:
            raise ValueError(f"Missing required tag dimension: {dim}")

    scenario_data['tags'] = tags

    # 验证 preconditions
    if 'role' not in preconditions:
        raise ValueError("Missing required precondition: role")

    scenario_data['preconditions'] = preconditions

    # 验证 steps 和 assertions
    if not steps or len(steps) == 0:
        raise ValueError("At least one step is required")

    if not assertions or len(assertions) == 0:
        raise ValueError("At least one assertion is required")

    scenario_data['steps'] = steps
    scenario_data['assertions'] = assertions

    # 添加 artifacts (如果提供)
    if artifacts:
        scenario_data['artifacts'] = artifacts
    else:
        # 默认 artifacts
        scenario_data['artifacts'] = {
            'trace': 'on-failure',
            'video': 'on-failure',
            'screenshot': 'only-on-failure'
        }

    # 添加 metadata (如果提供)
    if metadata:
        scenario_data['metadata'] = metadata
    else:
        # 默认 metadata
        scenario_data['metadata'] = {
            'created_at': datetime.now(timezone.utc).isoformat(),
            'created_by': 'test-scenario-author',
            'version': '1.0.0'
        }

    return scenario_data


def save_scenario(scenario_data: Dict[str, Any], output_path: Path = None) -> Path:
    """
    保存场景数据到 YAML 文件

    Args:
        scenario_data: 场景数据字典
        output_path: 输出文件路径 (可选,如果未提供则自动生成)

    Returns:
        保存的文件路径

    Raises:
        ValueError: 数据无效
        PermissionError: 无写入权限
    """
    scenario_id = scenario_data.get('scenario_id')
    if not scenario_id:
        raise ValueError("scenario_data missing scenario_id field")

    # 提取模块名称
    module = id_generator.extract_module_from_id(scenario_id)
    if not module:
        raise ValueError(f"Cannot extract module from scenario_id: {scenario_id}")

    # 确定输出路径
    if output_path is None:
        output_path = path_utils.get_scenario_path(module, scenario_id)

    # 验证路径安全性
    valid, error = path_utils.validate_scenario_path(output_path)
    if not valid:
        raise ValueError(error)

    # 保存 YAML 文件
    yaml_utils.safe_dump(scenario_data, output_path)

    return output_path

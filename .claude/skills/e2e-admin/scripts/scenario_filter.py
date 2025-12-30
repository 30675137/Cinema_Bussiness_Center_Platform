# @spec T001-e2e-orchestrator
"""
场景加载和标签过滤模块。

负责递归加载 scenarios/ 目录下的 YAML 文件，
解析场景定义，并根据标签表达式过滤场景。
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Set
from pathlib import Path
import re

try:
    from .utils import load_yaml
except ImportError:
    from utils import load_yaml


@dataclass
class TestScenario:
    """
    测试场景数据模型。

    表示从 YAML 文件加载的单个 E2E 测试场景。
    """
    scenario_id: str
    spec_ref: str
    title: str
    description: str
    tags: Dict[str, Any]  # module, channel, deploy, priority
    preconditions: Dict[str, Any]
    steps: List[Dict[str, Any]]
    assertions: List[Dict[str, Any]]
    artifacts: Dict[str, str]
    metadata: Dict[str, str]
    file_path: str  # YAML 文件路径


def load_scenarios(directory: str = "scenarios") -> List[TestScenario]:
    """
    递归加载指定目录下的所有场景 YAML 文件。

    Args:
        directory: 场景目录路径（默认为 "scenarios"）

    Returns:
        List[TestScenario]: 加载的场景列表

    Raises:
        FileNotFoundError: 如果目录不存在
    """
    scenarios = []
    scenario_dir = Path(directory)

    if not scenario_dir.exists():
        raise FileNotFoundError(f"场景目录不存在: {directory}")

    # 递归查找所有 .yaml 文件
    yaml_files = scenario_dir.rglob("*.yaml")

    for yaml_file in yaml_files:
        try:
            data = load_yaml(str(yaml_file))

            # 跳过非场景文件（没有 scenario_id 的文件）
            if 'scenario_id' not in data:
                continue

            scenario = TestScenario(
                scenario_id=data.get('scenario_id', ''),
                spec_ref=data.get('spec_ref', ''),
                title=data.get('title', ''),
                description=data.get('description', ''),
                tags=data.get('tags', {}),
                preconditions=data.get('preconditions', {}),
                steps=data.get('steps', []),
                assertions=data.get('assertions', []),
                artifacts=data.get('artifacts', {}),
                metadata=data.get('metadata', {}),
                file_path=str(yaml_file)
            )
            scenarios.append(scenario)

        except Exception as e:
            print(f"⚠️  加载场景文件失败: {yaml_file} - {e}")
            continue

    return scenarios


def detect_required_systems(scenarios: List[TestScenario]) -> Set[str]:
    """
    检测场景需要的系统（c-end/b-end）。

    Args:
        scenarios: 场景列表

    Returns:
        Set[str]: 需要的系统集合 (例如: {'c-end', 'b-end'})
    """
    systems = set()

    for scenario in scenarios:
        for step in scenario.steps:
            system = step.get('system')
            if system in ['c-end', 'b-end']:
                systems.add(system)

    return systems


def parse_tag_expression(expression: str) -> Dict[str, Any]:
    """
    解析标签过滤表达式。

    支持的语法:
    - 单标签: "module:inventory"
    - AND 逻辑: "module:inventory AND priority:p1"
    - OR 逻辑: "module:inventory OR module:order"

    Args:
        expression: 标签表达式字符串

    Returns:
        Dict 包含解析后的过滤规则
    """
    if not expression or not expression.strip():
        return {'type': 'all'}

    # 检测是否包含 AND/OR
    if ' AND ' in expression.upper():
        parts = re.split(r'\s+AND\s+', expression, flags=re.IGNORECASE)
        return {
            'type': 'and',
            'conditions': [_parse_single_tag(p.strip()) for p in parts]
        }
    elif ' OR ' in expression.upper():
        parts = re.split(r'\s+OR\s+', expression, flags=re.IGNORECASE)
        return {
            'type': 'or',
            'conditions': [_parse_single_tag(p.strip()) for p in parts]
        }
    else:
        # 单个标签
        return {
            'type': 'single',
            'condition': _parse_single_tag(expression.strip())
        }


def _parse_single_tag(tag_str: str) -> Dict[str, str]:
    """
    解析单个标签字符串 (例如: "module:inventory")。

    Args:
        tag_str: 标签字符串

    Returns:
        Dict 包含 tag_type 和 tag_value
    """
    if ':' in tag_str:
        tag_type, tag_value = tag_str.split(':', 1)
        return {'tag_type': tag_type.strip(), 'tag_value': tag_value.strip()}
    else:
        # 如果没有冒号，假设是 module 标签
        return {'tag_type': 'module', 'tag_value': tag_str.strip()}


def _matches_single_condition(scenario: TestScenario, condition: Dict[str, str]) -> bool:
    """
    检查场景是否匹配单个标签条件。

    Args:
        scenario: 测试场景
        condition: 标签条件 (tag_type, tag_value)

    Returns:
        bool: 是否匹配
    """
    tag_type = condition['tag_type']
    tag_value = condition['tag_value']

    # 获取场景的对应标签
    scenario_tag = scenario.tags.get(tag_type)

    if scenario_tag is None:
        return False

    # 如果是列表（module, channel, deploy），检查是否包含
    if isinstance(scenario_tag, list):
        return tag_value in scenario_tag

    # 如果是字符串（priority），直接比较
    return scenario_tag == tag_value


def filter_by_tags(scenarios: List[TestScenario], expression: str) -> List[TestScenario]:
    """
    根据标签表达式过滤场景。

    Args:
        scenarios: 场景列表
        expression: 标签过滤表达式

    Returns:
        List[TestScenario]: 过滤后的场景列表
    """
    if not expression or not expression.strip():
        return scenarios

    parsed = parse_tag_expression(expression)
    filtered = []

    for scenario in scenarios:
        if _matches_filter(scenario, parsed):
            filtered.append(scenario)

    return filtered


def _matches_filter(scenario: TestScenario, filter_rule: Dict[str, Any]) -> bool:
    """
    检查场景是否匹配过滤规则。

    Args:
        scenario: 测试场景
        filter_rule: 解析后的过滤规则

    Returns:
        bool: 是否匹配
    """
    filter_type = filter_rule['type']

    if filter_type == 'all':
        return True

    elif filter_type == 'single':
        return _matches_single_condition(scenario, filter_rule['condition'])

    elif filter_type == 'and':
        # 所有条件都必须匹配
        return all(
            _matches_single_condition(scenario, cond)
            for cond in filter_rule['conditions']
        )

    elif filter_type == 'or':
        # 任意一个条件匹配即可
        return any(
            _matches_single_condition(scenario, cond)
            for cond in filter_rule['conditions']
        )

    return False

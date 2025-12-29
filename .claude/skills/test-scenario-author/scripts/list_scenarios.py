"""
@spec T001-e2e-scenario-author
场景列表和筛选工具模块

提供场景列表、按模块/spec_ref/标签筛选功能。
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
import yaml_utils
import path_utils


def list_all() -> List[Dict[str, Any]]:
    """
    列出所有场景

    Returns:
        场景信息列表，每个场景包含: scenario_id, spec_ref, title, tags, file_path
    """
    scenario_files = path_utils.list_scenario_files()
    scenarios = []

    for file_path in scenario_files:
        try:
            scenario_data = yaml_utils.safe_load(file_path)
            scenarios.append({
                'scenario_id': scenario_data.get('scenario_id', ''),
                'spec_ref': scenario_data.get('spec_ref', ''),
                'title': scenario_data.get('title', ''),
                'tags': scenario_data.get('tags', {}),
                'file_path': str(file_path)
            })
        except Exception as e:
            # 跳过无效的 YAML 文件
            print(f"Warning: Failed to load {file_path}: {str(e)}", file=sys.stderr)
            continue

    return scenarios


def filter_by_module(scenarios: List[Dict[str, Any]], module: str) -> List[Dict[str, Any]]:
    """
    按模块筛选场景

    Args:
        scenarios: 场景列表
        module: 模块名称 (如 order, inventory)

    Returns:
        筛选后的场景列表
    """
    # 检查场景文件路径是否在指定模块目录下
    module_dir = path_utils.SCENARIOS_DIR / module
    return [
        s for s in scenarios
        if Path(s['file_path']).parent == module_dir
    ]


def filter_by_spec_ref(scenarios: List[Dict[str, Any]], spec_ref: str) -> List[Dict[str, Any]]:
    """
    按 spec_ref 筛选场景

    Args:
        scenarios: 场景列表
        spec_ref: 项目规格 ID (如 P005, O003)

    Returns:
        筛选后的场景列表
    """
    return [
        s for s in scenarios
        if s['spec_ref'] == spec_ref
    ]


def parse_tag_query(tag_query: str) -> Dict[str, str]:
    """
    解析标签查询字符串

    Args:
        tag_query: 标签查询 (如 "module:order", "channel:miniapp,deploy:saas")

    Returns:
        标签字典 (如 {'module': 'order', 'channel': 'miniapp'})
    """
    tags = {}
    if not tag_query:
        return tags

    # 支持逗号分隔多个标签
    tag_pairs = tag_query.split(',')
    for pair in tag_pairs:
        pair = pair.strip()
        if ':' not in pair:
            continue
        key, value = pair.split(':', 1)
        tags[key.strip()] = value.strip()

    return tags


def match_tags(scenario_tags: Dict[str, Any], query_tags: Dict[str, str]) -> bool:
    """
    检查场景标签是否匹配查询 (AND 逻辑)

    Args:
        scenario_tags: 场景的标签字典
        query_tags: 查询的标签字典

    Returns:
        True 如果所有查询标签都匹配
    """
    for key, value in query_tags.items():
        if key not in scenario_tags:
            return False

        scenario_value = scenario_tags[key]

        # 如果场景标签值是数组，检查是否包含查询值
        if isinstance(scenario_value, list):
            if value not in scenario_value:
                return False
        else:
            # 标量值直接比较
            if str(scenario_value) != value:
                return False

    return True


def filter_by_tags(scenarios: List[Dict[str, Any]], tag_query: str) -> List[Dict[str, Any]]:
    """
    按标签筛选场景

    Args:
        scenarios: 场景列表
        tag_query: 标签查询字符串 (如 "module:order,channel:miniapp")

    Returns:
        筛选后的场景列表
    """
    query_tags = parse_tag_query(tag_query)
    if not query_tags:
        return scenarios

    return [
        s for s in scenarios
        if match_tags(s['tags'], query_tags)
    ]


def format_scenario_table(scenarios: List[Dict[str, Any]]) -> str:
    """
    格式化场景列表为 Markdown 表格

    Args:
        scenarios: 场景列表

    Returns:
        Markdown 表格字符串
    """
    if not scenarios:
        return "No scenarios found."

    # 表头
    table = "| Scenario ID | Spec Ref | Title | Tags | File Path |\n"
    table += "|-------------|----------|-------|------|----------|\n"

    # 表格行
    for s in scenarios:
        scenario_id = s.get('scenario_id', 'N/A')
        spec_ref = s.get('spec_ref', 'N/A')
        title = s.get('title', 'N/A')

        # 格式化标签
        tags = s.get('tags', {})
        tag_str = ', '.join([f"{k}:{v}" for k, v in tags.items()])
        if len(tag_str) > 50:
            tag_str = tag_str[:47] + '...'

        file_path = s.get('file_path', 'N/A')

        table += f"| {scenario_id} | {spec_ref} | {title} | {tag_str} | {file_path} |\n"

    return table


def main():
    """
    命令行入口，输出 JSON 格式结果供 skill.md 解析
    """
    import sys
    import argparse

    parser = argparse.ArgumentParser(description='List and filter E2E scenarios')
    parser.add_argument('--module', help='Filter by module name')
    parser.add_argument('--spec-ref', help='Filter by spec_ref')
    parser.add_argument('--tags', help='Filter by tags (e.g., "module:order,channel:miniapp")')
    parser.add_argument('--format', choices=['json', 'table'], default='table', help='Output format')

    args = parser.parse_args()

    # 获取所有场景
    scenarios = list_all()

    # 应用筛选
    if args.module:
        scenarios = filter_by_module(scenarios, args.module)

    if args.spec_ref:
        scenarios = filter_by_spec_ref(scenarios, args.spec_ref)

    if args.tags:
        scenarios = filter_by_tags(scenarios, args.tags)

    # 输出
    if args.format == 'json':
        print(json.dumps(scenarios, indent=2, ensure_ascii=False))
    else:
        print(format_scenario_table(scenarios))


if __name__ == '__main__':
    main()

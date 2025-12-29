"""
@spec T001-e2e-scenario-author
场景验证工具模块

提供 JSON Schema 验证、环境解耦验证、数据解耦验证功能。
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple
from jsonschema import validate, ValidationError, Draft7Validator
import yaml_utils
import path_utils
import id_generator


# 禁止的环境字段
FORBIDDEN_ENV_FIELDS = ['environment', 'baseURL', 'tenant', 'domain']

# URL 模式
URL_PATTERN = re.compile(r'https?://[^\s]+')


def load_schema() -> Dict[str, Any]:
    """加载 JSON Schema"""
    schema_path = Path('.claude/skills/test-scenario-author/assets/templates/scenario-schema.json')
    with schema_path.open('r', encoding='utf-8') as f:
        return json.load(f)


def validate_schema(scenario_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    使用 JSON Schema 验证场景

    Args:
        scenario_data: 场景数据字典

    Returns:
        (是否有效, 错误列表)
    """
    errors = []

    try:
        schema = load_schema()
        validator = Draft7Validator(schema)

        # 收集所有验证错误
        validation_errors = list(validator.iter_errors(scenario_data))

        if validation_errors:
            for error in validation_errors:
                path = '.'.join(str(p) for p in error.path) if error.path else 'root'
                errors.append(f"Schema validation error at '{path}': {error.message}")

            return False, errors

        return True, []

    except Exception as e:
        errors.append(f"Schema validation failed: {str(e)}")
        return False, errors


def validate_required_fields(scenario_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    验证必需字段

    Args:
        scenario_data: 场景数据字典

    Returns:
        (是否有效, 错误列表)
    """
    errors = []
    required_fields = [
        'scenario_id',
        'spec_ref',
        'title',
        'tags',
        'preconditions',
        'steps',
        'assertions'
    ]

    for field in required_fields:
        if field not in scenario_data:
            errors.append(f"Missing required field: {field}")

    # 验证 tags 必需维度
    if 'tags' in scenario_data:
        tags = scenario_data['tags']
        required_tag_dims = ['module', 'channel', 'deploy']
        for dim in required_tag_dims:
            if dim not in tags or not tags[dim]:
                errors.append(f"Missing required tag dimension: {dim}")

    # 验证 preconditions.role
    if 'preconditions' in scenario_data:
        if 'role' not in scenario_data['preconditions']:
            errors.append("Missing required field: preconditions.role")

    # 验证 steps 和 assertions 非空
    if 'steps' in scenario_data and len(scenario_data['steps']) == 0:
        errors.append("At least one step is required")

    if 'assertions' in scenario_data and len(scenario_data['assertions']) == 0:
        errors.append("At least one assertion is required")

    return len(errors) == 0, errors


def check_no_hardcoded_urls(data: Any, path: str = '') -> List[str]:
    """
    递归检查是否包含硬编码的 URL

    Args:
        data: 数据 (可以是 dict, list, str, etc.)
        path: 当前路径 (用于错误报告)

    Returns:
        错误列表
    """
    errors = []

    if isinstance(data, dict):
        for key, value in data.items():
            current_path = f"{path}.{key}" if path else key
            errors.extend(check_no_hardcoded_urls(value, current_path))

    elif isinstance(data, list):
        for i, item in enumerate(data):
            current_path = f"{path}[{i}]"
            errors.extend(check_no_hardcoded_urls(item, current_path))

    elif isinstance(data, str):
        if URL_PATTERN.search(data):
            errors.append(f"Hardcoded URL found at '{path}': {data}")

    return errors


def check_no_environment_fields(scenario_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    验证不包含禁止的环境字段

    Args:
        scenario_data: 场景数据字典

    Returns:
        (是否有效, 错误列表)
    """
    errors = []

    # 检查顶层字段
    for field in FORBIDDEN_ENV_FIELDS:
        if field in scenario_data:
            errors.append(f"Forbidden environment field found: '{field}' (violates environment decoupling)")

    # 检查嵌套字段中的 URL
    url_errors = check_no_hardcoded_urls(scenario_data)
    errors.extend(url_errors)

    return len(errors) == 0, errors


def check_no_hardcoded_data(scenario_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    验证步骤参数使用 testdata_ref 而非硬编码数据

    Args:
        scenario_data: 场景数据字典

    Returns:
        (是否有效, 警告列表)
    """
    warnings = []

    # 检查 steps 中的 params
    steps = scenario_data.get('steps', [])
    for i, step in enumerate(steps):
        params = step.get('params', {})
        if not params:
            continue

        # 如果 params 不包含 testdata_ref，且包含其他键，发出警告
        if 'testdata_ref' not in params:
            # 检查是否有可能是硬编码数据的键
            suspicious_keys = []
            for key in params.keys():
                if key in ['store_id', 'store_name', 'sku_id', 'product_id', 'user_id', 'price', 'quantity']:
                    # quantity 等数值参数是业务逻辑，不算硬编码
                    if key not in ['quantity', 'wait', 'timeout']:
                        suspicious_keys.append(key)

            if suspicious_keys:
                warnings.append(
                    f"Step[{i}] action '{step.get('action')}' may contain hardcoded data: {suspicious_keys}. "
                    f"Consider using 'testdata_ref' instead."
                )

    # 检查 assertions 中的 params
    assertions = scenario_data.get('assertions', [])
    for i, assertion in enumerate(assertions):
        params = assertion.get('params', {})
        if not params:
            continue

        # 业务逻辑参数 (如 expected, element) 是可接受的
        # 只有当包含 ID 类参数时才警告
        if 'testdata_ref' not in params:
            suspicious_keys = []
            for key in params.keys():
                if key in ['store_id', 'sku_id', 'product_id', 'user_id']:
                    suspicious_keys.append(key)

            if suspicious_keys:
                warnings.append(
                    f"Assertion[{i}] check '{assertion.get('check')}' may contain hardcoded data: {suspicious_keys}. "
                    f"Consider using 'testdata_ref' instead."
                )

    return len(warnings) == 0, warnings


def validate_testdata_refs(scenario_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    验证 testdata_ref 格式

    Args:
        scenario_data: 场景数据字典

    Returns:
        (是否有效, 错误列表)
    """
    errors = []
    testdata_ref_pattern = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$')

    # 检查 preconditions.testdata_ref
    preconditions = scenario_data.get('preconditions', {})
    if 'testdata_ref' in preconditions:
        ref = preconditions['testdata_ref']
        if not testdata_ref_pattern.match(ref):
            errors.append(
                f"Invalid testdata_ref format in preconditions: '{ref}'. "
                f"Expected format: <dataset>.<key> (e.g., 'storeTestData.store_001')"
            )

    # 检查 steps 中的 testdata_ref
    steps = scenario_data.get('steps', [])
    for i, step in enumerate(steps):
        params = step.get('params', {})
        if 'testdata_ref' in params:
            ref = params['testdata_ref']
            if not testdata_ref_pattern.match(ref):
                errors.append(
                    f"Invalid testdata_ref format in step[{i}]: '{ref}'. "
                    f"Expected format: <dataset>.<key>"
                )

    return len(errors) == 0, errors


def validate_scenario_file(file_path: Path) -> Tuple[bool, Dict[str, List[str]]]:
    """
    完整验证场景文件

    Args:
        file_path: 场景文件路径

    Returns:
        (是否通过, 错误/警告字典)
    """
    results = {
        'errors': [],
        'warnings': []
    }

    # 1. 验证文件路径
    valid_path, path_error = path_utils.validate_scenario_path(file_path)
    if not valid_path:
        results['errors'].append(path_error)
        return False, results

    # 2. 验证 YAML 语法
    valid_yaml, yaml_error = yaml_utils.validate_yaml_syntax(file_path)
    if not valid_yaml:
        results['errors'].append(yaml_error)
        return False, results

    # 3. 加载场景数据
    try:
        scenario_data = yaml_utils.safe_load(file_path)
    except Exception as e:
        results['errors'].append(f"Failed to load scenario: {str(e)}")
        return False, results

    # 4. 验证必需字段
    valid_fields, field_errors = validate_required_fields(scenario_data)
    if not valid_fields:
        results['errors'].extend(field_errors)

    # 5. JSON Schema 验证
    valid_schema, schema_errors = validate_schema(scenario_data)
    if not valid_schema:
        results['errors'].extend(schema_errors)

    # 6. 环境解耦验证
    valid_env, env_errors = check_no_environment_fields(scenario_data)
    if not valid_env:
        results['errors'].extend(env_errors)

    # 7. 数据解耦验证 (警告)
    valid_data, data_warnings = check_no_hardcoded_data(scenario_data)
    if not valid_data:
        results['warnings'].extend(data_warnings)

    # 8. testdata_ref 格式验证
    valid_refs, ref_errors = validate_testdata_refs(scenario_data)
    if not valid_refs:
        results['errors'].extend(ref_errors)

    # 9. scenario_id 格式验证
    scenario_id = scenario_data.get('scenario_id', '')
    valid_id, id_error = id_generator.validate_scenario_id(scenario_id)
    if not valid_id:
        results['errors'].append(id_error)

    # 判断整体是否通过
    passed = len(results['errors']) == 0

    return passed, results


def main():
    """命令行入口"""
    import argparse

    parser = argparse.ArgumentParser(description='Validate E2E scenario YAML files')
    parser.add_argument('scenario_id', help='Scenario ID to validate (e.g., E2E-ORDER-001)')
    parser.add_argument('--all', action='store_true', help='Validate all scenarios')
    parser.add_argument('--module', help='Validate all scenarios in a module')

    args = parser.parse_args()

    if args.all:
        # 验证所有场景
        scenarios = path_utils.list_scenario_files()
        total = len(scenarios)
        passed = 0
        failed = 0

        for file_path in scenarios:
            success, results = validate_scenario_file(file_path)
            if success:
                passed += 1
                print(f"✅ {file_path.stem}: PASS")
            else:
                failed += 1
                print(f"❌ {file_path.stem}: FAIL")
                for error in results['errors']:
                    print(f"   ERROR: {error}")

        print(f"\nSummary: {passed}/{total} passed, {failed}/{total} failed")

    elif args.module:
        # 验证指定模块的所有场景
        scenarios = path_utils.list_scenario_files(module=args.module)
        total = len(scenarios)
        passed = 0
        failed = 0

        for file_path in scenarios:
            success, results = validate_scenario_file(file_path)
            if success:
                passed += 1
                print(f"✅ {file_path.stem}: PASS")
            else:
                failed += 1
                print(f"❌ {file_path.stem}: FAIL")
                for error in results['errors']:
                    print(f"   ERROR: {error}")

        print(f"\nSummary: {passed}/{total} passed, {failed}/{total} failed")

    else:
        # 验证单个场景
        module = id_generator.extract_module_from_id(args.scenario_id)
        if not module:
            print(f"❌ Invalid scenario_id format: {args.scenario_id}")
            sys.exit(1)

        file_path = path_utils.get_scenario_path(module, args.scenario_id)

        if not file_path.exists():
            print(f"❌ Scenario file not found: {file_path}")
            sys.exit(1)

        success, results = validate_scenario_file(file_path)

        if success:
            print(f"✅ {args.scenario_id}: PASS")
            if results['warnings']:
                print("\nWarnings:")
                for warning in results['warnings']:
                    print(f"  ⚠️  {warning}")
        else:
            print(f"❌ {args.scenario_id}: FAIL")
            print("\nErrors:")
            for error in results['errors']:
                print(f"  ❌ {error}")

            if results['warnings']:
                print("\nWarnings:")
                for warning in results['warnings']:
                    print(f"  ⚠️  {warning}")

            sys.exit(1)


if __name__ == '__main__':
    main()

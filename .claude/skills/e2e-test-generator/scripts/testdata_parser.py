# @spec T002-e2e-test-generator
"""
Test Data Parser Module

Extracts testdata_ref references from E2E scenario YAML files and generates
TypeScript code for loading test data in Playwright tests.
"""

from typing import Dict, Any, Set, List, Optional
from pathlib import Path


class TestDataParseError(Exception):
    """Custom exception for test data parsing errors"""
    pass


def extract_testdata_refs_from_scenario(scenario_data: Dict[str, Any]) -> Set[str]:
    """
    Extract all unique testdata_ref values from a scenario

    Args:
        scenario_data: Parsed scenario YAML data

    Returns:
        Set of unique testdata_ref strings (e.g., {'inventoryTestData.user_normal', 'inventoryTestData.product_with_bom'})
    """
    refs = set()

    # Extract from preconditions
    preconditions = scenario_data.get('preconditions', {})
    if isinstance(preconditions, dict) and 'testdata_ref' in preconditions:
        refs.add(preconditions['testdata_ref'])

    # Extract from steps
    steps = scenario_data.get('steps', [])
    for step in steps:
        if isinstance(step, dict) and 'params' in step:
            params = step['params']
            if isinstance(params, dict) and 'testdata_ref' in params:
                refs.add(params['testdata_ref'])

    # Extract from assertions
    assertions = scenario_data.get('assertions', [])
    for assertion in assertions:
        if isinstance(assertion, dict) and 'params' in assertion:
            params = assertion['params']
            if isinstance(params, dict) and 'testdata_ref' in params:
                refs.add(params['testdata_ref'])

    return refs


def parse_testdata_ref(ref: str) -> Dict[str, str]:
    """
    Parse a testdata_ref into module and key components

    Args:
        ref: testdata_ref string (e.g., 'inventoryTestData.user_normal')

    Returns:
        Dict with 'module' and 'key' fields
        Example: {'module': 'inventoryTestData', 'key': 'user_normal'}

    Raises:
        TestDataParseError: If ref format is invalid
    """
    if not ref or not isinstance(ref, str):
        raise TestDataParseError(f"Invalid testdata_ref: {ref}")

    parts = ref.split('.')
    if len(parts) < 2:
        raise TestDataParseError(
            f"testdata_ref must be in format 'module.key', got: {ref}"
        )

    module = parts[0]
    key = '.'.join(parts[1:])  # Support nested keys like 'bomTestData.scenario_001.user'

    return {
        'module': module,
        'key': key
    }


def group_refs_by_module(refs: Set[str]) -> Dict[str, List[str]]:
    """
    Group testdata_ref values by module

    Args:
        refs: Set of testdata_ref strings

    Returns:
        Dict mapping module names to lists of keys
        Example: {'inventoryTestData': ['user_normal', 'product_with_bom']}
    """
    grouped = {}

    for ref in refs:
        try:
            parsed = parse_testdata_ref(ref)
            module = parsed['module']
            key = parsed['key']

            if module not in grouped:
                grouped[module] = []

            grouped[module].append(key)
        except TestDataParseError:
            # Skip invalid refs
            continue

    return grouped


def generate_testdata_imports(refs: Set[str]) -> List[str]:
    """
    Generate TypeScript import statements for test data modules

    Args:
        refs: Set of testdata_ref strings

    Returns:
        List of import statement strings
        Example: ["import { inventoryTestData } from '@/testdata/inventory'"]
    """
    imports = []
    modules = set()

    for ref in refs:
        try:
            parsed = parse_testdata_ref(ref)
            module = parsed['module']
            modules.add(module)
        except TestDataParseError:
            continue

    for module in sorted(modules):
        # Convert camelCase to kebab-case for import path
        # inventoryTestData -> inventory-test-data
        import_path = _camel_to_kebab(module.replace('TestData', ''))
        imports.append(f"import {{ {module} }} from '@/testdata/{import_path}'")

    return imports


def generate_beforeeach_code(refs: Set[str]) -> str:
    """
    Generate beforeEach hook code for loading test data

    Args:
        refs: Set of testdata_ref strings

    Returns:
        TypeScript code string for beforeEach hook
    """
    if not refs:
        return ""

    grouped = group_refs_by_module(refs)

    lines = []
    lines.append("test.beforeEach(async ({ page }) => {")
    lines.append("  // Load test data")

    for module, keys in sorted(grouped.items()):
        lines.append(f"  // Load {module}")
        for key in sorted(keys):
            var_name = f"{module}_{key}".replace('.', '_')
            lines.append(f"  const {var_name} = {module}.{key};")

    lines.append("});")
    lines.append("")

    return '\n'.join(lines)


def generate_testdata_todos(refs: Set[str], available_modules: Set[str] = None) -> List[str]:
    """
    Generate TODO comments for missing test data references

    Args:
        refs: Set of testdata_ref strings
        available_modules: Set of available test data module names (optional)

    Returns:
        List of TODO comment strings
    """
    if available_modules is None:
        available_modules = set()

    todos = []
    missing_modules = set()  # Track unique missing modules

    for ref in refs:
        try:
            parsed = parse_testdata_ref(ref)
            module = parsed['module']

            if module not in available_modules and module not in missing_modules:
                missing_modules.add(module)
                todos.append(
                    f"// TODO: Create test data module '{module}' at testdata/{_camel_to_kebab(module.replace('TestData', ''))}.ts"
                )
        except TestDataParseError as e:
            todos.append(f"// TODO: Fix invalid testdata_ref: {str(e)}")

    return todos


def _camel_to_kebab(name: str) -> str:
    """
    Convert camelCase to kebab-case

    Args:
        name: camelCase string

    Returns:
        kebab-case string
    """
    import re
    # Insert hyphen before uppercase letters and convert to lowercase
    kebab = re.sub(r'(?<!^)(?=[A-Z])', '-', name).lower()
    return kebab

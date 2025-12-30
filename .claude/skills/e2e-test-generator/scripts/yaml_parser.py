# @spec T002-e2e-test-generator
"""
YAML Parser Module

Safely parses E2E scenario YAML files using PyYAML's safe_load() to prevent code injection.
"""

import yaml
from pathlib import Path
from typing import Dict, Any, Optional


class YAMLParseError(Exception):
    """Custom exception for YAML parsing errors"""
    pass


def parse_scenario_yaml(filepath: str) -> Dict[str, Any]:
    """
    Parse E2E scenario YAML file

    Args:
        filepath: Path to the scenario YAML file

    Returns:
        Dict containing parsed scenario data

    Raises:
        YAMLParseError: If file not found or invalid YAML format
    """
    path = Path(filepath)

    if not path.exists():
        raise YAMLParseError(f"Scenario file not found: {filepath}")

    if not path.is_file():
        raise YAMLParseError(f"Path is not a file: {filepath}")

    try:
        with open(path, 'r', encoding='utf-8') as f:
            # Use safe_load() to prevent code injection attacks
            data = yaml.safe_load(f)

        if data is None:
            raise YAMLParseError(f"Empty YAML file: {filepath}")

        if not isinstance(data, dict):
            raise YAMLParseError(f"YAML root must be a dictionary, got {type(data).__name__}")

        return data

    except yaml.YAMLError as e:
        raise YAMLParseError(f"Invalid YAML format in {filepath}: {str(e)}")
    except Exception as e:
        raise YAMLParseError(f"Error reading {filepath}: {str(e)}")


def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
    """
    Validate that required fields exist in the parsed data

    Args:
        data: Parsed YAML data
        required_fields: List of required field names

    Raises:
        YAMLParseError: If any required field is missing
    """
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        raise YAMLParseError(
            f"Missing required fields: {', '.join(missing_fields)}"
        )


def parse_scenario_with_validation(filepath: str) -> Dict[str, Any]:
    """
    Parse scenario YAML file with basic validation

    Args:
        filepath: Path to the scenario YAML file

    Returns:
        Dict containing validated scenario data

    Raises:
        YAMLParseError: If parsing fails or validation fails
    """
    data = parse_scenario_yaml(filepath)

    # Validate required top-level fields
    required_fields = ['scenario_id', 'spec_ref', 'title', 'tags', 'steps', 'assertions']
    validate_required_fields(data, required_fields)

    # Validate scenario_id format: E2E-<MODULE>-<NUMBER>
    scenario_id = data['scenario_id']
    if not isinstance(scenario_id, str) or not scenario_id.startswith('E2E-'):
        raise YAMLParseError(
            f"Invalid scenario_id format: {scenario_id}. Expected: E2E-<MODULE>-<NUMBER>"
        )

    # Validate spec_ref format: X###
    spec_ref = data['spec_ref']
    if not isinstance(spec_ref, str) or len(spec_ref) != 4:
        raise YAMLParseError(
            f"Invalid spec_ref format: {spec_ref}. Expected: X### (e.g., P005)"
        )
    # Check format: First char is letter, next 3 are digits
    if not (spec_ref[0].isalpha() and spec_ref[1:].isdigit()):
        raise YAMLParseError(
            f"Invalid spec_ref format: {spec_ref}. Expected: X### (e.g., P005)"
        )

    # Validate steps is a list
    if not isinstance(data['steps'], list) or len(data['steps']) == 0:
        raise YAMLParseError("'steps' must be a non-empty list")

    # Validate assertions is a list
    if not isinstance(data['assertions'], list) or len(data['assertions']) == 0:
        raise YAMLParseError("'assertions' must be a non-empty list")

    return data


def extract_testdata_refs(data: Dict[str, Any]) -> set:
    """
    Extract all testdata_ref references from scenario data

    Args:
        data: Parsed scenario data

    Returns:
        Set of unique testdata_ref strings
    """
    refs = set()

    # Extract from preconditions
    if 'preconditions' in data and 'testdata_ref' in data['preconditions']:
        refs.add(data['preconditions']['testdata_ref'])

    # Extract from steps
    for step in data.get('steps', []):
        if 'params' in step and 'testdata_ref' in step['params']:
            refs.add(step['params']['testdata_ref'])

    return refs


def extract_page_objects(data: Dict[str, Any], action_mappings: Dict[str, Any]) -> set:
    """
    Extract required page objects from scenario steps based on action mappings

    Args:
        data: Parsed scenario data
        action_mappings: Action to code mappings

    Returns:
        Set of unique page object class names
    """
    page_objects = set()

    for step in data.get('steps', []):
        action_name = step.get('action')
        if action_name and action_name in action_mappings:
            action_config = action_mappings[action_name]
            if 'playwright' in action_config and 'imports' in action_config['playwright']:
                page_objects.update(action_config['playwright']['imports'])

    return page_objects

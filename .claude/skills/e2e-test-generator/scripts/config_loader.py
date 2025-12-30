# @spec T002-e2e-test-generator
"""
Configuration Loader Module

Loads and validates action-mappings.yaml and assertion-mappings.yaml configuration files.
"""

import yaml
from pathlib import Path
from typing import Dict, Any
from schema_validator import (
    validate_action_mappings_schema,
    validate_assertion_mappings_schema,
    SchemaValidationError
)


class ConfigLoadError(Exception):
    """Custom exception for configuration loading errors"""
    pass


def get_config_path(config_name: str) -> Path:
    """
    Get the path to a configuration file

    Args:
        config_name: Name of the config file (e.g., 'action-mappings.yaml')

    Returns:
        Path object to the configuration file
    """
    # Get the skill directory (parent of scripts/)
    skill_dir = Path(__file__).parent.parent
    config_path = skill_dir / "assets" / "templates" / config_name

    return config_path


def load_yaml_config(filepath: Path) -> Dict[str, Any]:
    """
    Load YAML configuration file

    Args:
        filepath: Path to the YAML config file

    Returns:
        Dict containing parsed configuration

    Raises:
        ConfigLoadError: If file not found or invalid YAML
    """
    if not filepath.exists():
        raise ConfigLoadError(f"Configuration file not found: {filepath}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        if data is None:
            raise ConfigLoadError(f"Empty configuration file: {filepath}")

        if not isinstance(data, dict):
            raise ConfigLoadError(
                f"Configuration must be a dictionary, got {type(data).__name__}"
            )

        return data

    except yaml.YAMLError as e:
        raise ConfigLoadError(f"Invalid YAML in {filepath}: {str(e)}")
    except Exception as e:
        raise ConfigLoadError(f"Error reading {filepath}: {str(e)}")


def load_action_mappings() -> Dict[str, Any]:
    """
    Load and validate action-mappings.yaml configuration

    Returns:
        Dict containing action mappings

    Raises:
        ConfigLoadError: If loading or validation fails
    """
    config_path = get_config_path('action-mappings.yaml')
    data = load_yaml_config(config_path)

    try:
        validate_action_mappings_schema(data)
    except SchemaValidationError as e:
        raise ConfigLoadError(f"Action mappings validation failed: {str(e)}")

    return data


def load_assertion_mappings() -> Dict[str, Any]:
    """
    Load and validate assertion-mappings.yaml configuration

    Returns:
        Dict containing assertion mappings

    Raises:
        ConfigLoadError: If loading or validation fails
    """
    config_path = get_config_path('assertion-mappings.yaml')
    data = load_yaml_config(config_path)

    try:
        validate_assertion_mappings_schema(data)
    except SchemaValidationError as e:
        raise ConfigLoadError(f"Assertion mappings validation failed: {str(e)}")

    return data


def get_action_mapping(action_name: str, framework: str = 'playwright') -> Dict[str, Any]:
    """
    Get mapping for a specific action and framework

    Args:
        action_name: Name of the action (e.g., 'login', 'navigate')
        framework: Target framework ('playwright', 'postman', 'restclient')

    Returns:
        Dict containing action mapping for the framework

    Raises:
        ConfigLoadError: If action or framework not found
    """
    mappings = load_action_mappings()

    if action_name not in mappings:
        raise ConfigLoadError(f"Unknown action: {action_name}")

    action_config = mappings[action_name]

    if framework not in action_config:
        available = ', '.join(action_config.keys())
        raise ConfigLoadError(
            f"Framework '{framework}' not supported for action '{action_name}'. "
            f"Available: {available}"
        )

    return action_config[framework]


def get_assertion_mapping(check_type: str, framework: str = 'playwright') -> Dict[str, Any]:
    """
    Get mapping for a specific assertion check type and framework

    Args:
        check_type: Type of assertion check (e.g., 'element_visible', 'response_status_is')
        framework: Target framework ('playwright', 'postman', 'restclient')

    Returns:
        Dict containing assertion mapping for the framework

    Raises:
        ConfigLoadError: If check type or framework not found
    """
    mappings = load_assertion_mappings()

    if check_type not in mappings:
        raise ConfigLoadError(f"Unknown assertion check type: {check_type}")

    check_config = mappings[check_type]

    if framework not in check_config:
        available = ', '.join(check_config.keys())
        raise ConfigLoadError(
            f"Framework '{framework}' not supported for assertion '{check_type}'. "
            f"Available: {available}"
        )

    return check_config[framework]


def list_available_actions(framework: str = None) -> list:
    """
    List all available actions, optionally filtered by framework

    Args:
        framework: Optional framework filter ('playwright', 'postman', 'restclient')

    Returns:
        List of action names
    """
    mappings = load_action_mappings()

    if framework:
        return [
            action_name
            for action_name, config in mappings.items()
            if framework in config
        ]
    else:
        return list(mappings.keys())


def list_available_assertions(framework: str = None) -> list:
    """
    List all available assertion types, optionally filtered by framework

    Args:
        framework: Optional framework filter ('playwright', 'postman', 'restclient')

    Returns:
        List of assertion check types
    """
    mappings = load_assertion_mappings()

    if framework:
        return [
            check_type
            for check_type, config in mappings.items()
            if framework in config
        ]
    else:
        return list(mappings.keys())

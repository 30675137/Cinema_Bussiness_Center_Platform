# @spec T002-e2e-test-generator
"""
E2EScenarioSpec Schema Validator

Validates E2E scenario data against the E2EScenarioSpec schema using jsonschema.
"""

import jsonschema
from typing import Dict, Any


# E2EScenarioSpec JSON Schema
E2E_SCENARIO_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["scenario_id", "spec_ref", "title", "tags", "steps", "assertions"],
    "properties": {
        "scenario_id": {
            "type": "string",
            "pattern": "^E2E-[A-Z]+-\\d{3}$",
            "description": "Scenario ID format: E2E-<MODULE>-<NUMBER>"
        },
        "spec_ref": {
            "type": "string",
            "pattern": "^[A-Z]\\d{3}$",
            "description": "Spec reference format: X### (e.g., P005)"
        },
        "title": {
            "type": "string",
            "minLength": 1,
            "description": "Scenario title"
        },
        "description": {
            "type": "string",
            "description": "Optional scenario description"
        },
        "tags": {
            "type": "object",
            "required": ["module", "channel", "deploy", "priority"],
            "properties": {
                "module": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1
                },
                "channel": {
                    "type": "array",
                    "items": {"type": "string", "enum": ["web", "weapp", "h5", "app"]},
                    "minItems": 1
                },
                "deploy": {
                    "type": "array",
                    "items": {"type": "string", "enum": ["saas", "onpremise", "hybrid"]},
                    "minItems": 1
                },
                "priority": {
                    "type": "string",
                    "enum": ["p1", "p2", "p3"]
                },
                "smoke": {
                    "type": "boolean"
                }
            }
        },
        "preconditions": {
            "type": "object",
            "properties": {
                "role": {"type": "string"},
                "testdata_ref": {"type": "string"}
            }
        },
        "steps": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["action"],
                "properties": {
                    "action": {"type": "string"},
                    "params": {"type": "object"},
                    "description": {"type": "string"},
                    "wait": {"type": "number", "minimum": 0}
                }
            }
        },
        "assertions": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["type", "check", "params"],
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["ui", "api"]
                    },
                    "check": {"type": "string"},
                    "params": {"type": "object"},
                    "timeout": {"type": "number", "minimum": 0}
                }
            }
        },
        "artifacts": {
            "type": "object",
            "properties": {
                "trace": {
                    "type": "string",
                    "enum": ["on-failure", "always", "off"]
                },
                "video": {
                    "type": "string",
                    "enum": ["on-failure", "always", "off"]
                },
                "screenshot": {
                    "type": "string",
                    "enum": ["on-failure", "always", "off"]
                }
            }
        },
        "metadata": {
            "type": "object",
            "properties": {
                "created_at": {"type": "string"},
                "created_by": {"type": "string"},
                "version": {"type": "string"}
            }
        }
    }
}


class SchemaValidationError(Exception):
    """Custom exception for schema validation errors"""
    pass


def validate_scenario_schema(data: Dict[str, Any]) -> None:
    """
    Validate scenario data against E2EScenarioSpec schema

    Args:
        data: Parsed scenario data to validate

    Raises:
        SchemaValidationError: If validation fails
    """
    try:
        jsonschema.validate(instance=data, schema=E2E_SCENARIO_SCHEMA)
    except jsonschema.ValidationError as e:
        error_path = " -> ".join(str(p) for p in e.path) if e.path else "root"
        raise SchemaValidationError(
            f"Schema validation failed at {error_path}: {e.message}"
        )
    except jsonschema.SchemaError as e:
        raise SchemaValidationError(f"Invalid schema definition: {e.message}")


def validate_action_mappings_schema(data: Dict[str, Any]) -> None:
    """
    Validate action mappings configuration

    Args:
        data: Action mappings data to validate

    Raises:
        SchemaValidationError: If validation fails
    """
    if not isinstance(data, dict):
        raise SchemaValidationError("Action mappings must be a dictionary")

    for action_name, action_config in data.items():
        if not isinstance(action_config, dict):
            raise SchemaValidationError(
                f"Action '{action_name}' configuration must be a dictionary"
            )

        # Check for at least one framework
        if not any(key in action_config for key in ['playwright', 'postman', 'restclient']):
            raise SchemaValidationError(
                f"Action '{action_name}' must define at least one framework mapping"
            )

        # Validate playwright mapping if present
        if 'playwright' in action_config:
            pw_config = action_config['playwright']
            if 'code' not in pw_config:
                raise SchemaValidationError(
                    f"Action '{action_name}' playwright mapping must have 'code' field"
                )
            if not isinstance(pw_config.get('imports', []), list):
                raise SchemaValidationError(
                    f"Action '{action_name}' playwright 'imports' must be a list"
                )


def validate_assertion_mappings_schema(data: Dict[str, Any]) -> None:
    """
    Validate assertion mappings configuration

    Args:
        data: Assertion mappings data to validate

    Raises:
        SchemaValidationError: If validation fails
    """
    if not isinstance(data, dict):
        raise SchemaValidationError("Assertion mappings must be a dictionary")

    for check_type, check_config in data.items():
        if not isinstance(check_config, dict):
            raise SchemaValidationError(
                f"Assertion '{check_type}' configuration must be a dictionary"
            )

        # Check for at least one framework
        if not any(key in check_config for key in ['playwright', 'postman', 'restclient']):
            raise SchemaValidationError(
                f"Assertion '{check_type}' must define at least one framework mapping"
            )

        # Validate playwright mapping if present
        if 'playwright' in check_config:
            pw_config = check_config['playwright']
            if 'code' not in pw_config:
                raise SchemaValidationError(
                    f"Assertion '{check_type}' playwright mapping must have 'code' field"
                )

# @spec T001-e2e-orchestrator
"""
Utility functions for E2E test orchestrator.

This module provides shared utilities including run_id generation,
directory management, and YAML loading.
"""

import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import yaml


def generate_run_id() -> str:
    """
    Generate a unique run ID for test execution.

    Format: YYYYMMDD-HHMMSS-<uuid>
    Example: 20251230-143052-a3f8b921

    Returns:
        str: Unique run ID combining timestamp and UUID
    """
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    return f'{timestamp}-{unique_id}'


def ensure_directory(path: str) -> None:
    """
    Create directory if it doesn't exist.

    Args:
        path: Directory path to create

    Raises:
        OSError: If directory creation fails
    """
    Path(path).mkdir(parents=True, exist_ok=True)


def load_yaml(file_path: str) -> Dict[str, Any]:
    """
    Load YAML file with error handling.

    Args:
        file_path: Path to YAML file

    Returns:
        Dict containing parsed YAML content

    Raises:
        FileNotFoundError: If file doesn't exist
        yaml.YAMLError: If YAML parsing fails
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"YAML file not found: {file_path}")

    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = yaml.safe_load(f)
            return content if content is not None else {}
    except yaml.YAMLError as e:
        raise yaml.YAMLError(f"Failed to parse YAML file {file_path}: {e}") from e


def validate_run_id_format(run_id: str) -> bool:
    """
    Validate run_id format matches expected pattern.

    Expected format: YYYYMMDD-HHMMSS-<8-char-hex>
    Example: 20251230-143052-a3f8b921

    Args:
        run_id: Run ID string to validate

    Returns:
        bool: True if format is valid, False otherwise
    """
    import re
    pattern = r'^\d{8}-\d{6}-[a-f0-9]{8}$'
    return bool(re.match(pattern, run_id))

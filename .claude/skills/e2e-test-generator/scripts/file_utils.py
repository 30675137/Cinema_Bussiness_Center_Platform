# @spec T002-e2e-test-generator
"""
File Utilities Module

Provides file hashing, metadata storage, and file modification detection utilities.
"""

import hashlib
import json
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime


class FileUtilsError(Exception):
    """Custom exception for file utilities errors"""
    pass


def calculate_file_hash(filepath: str) -> str:
    """
    Calculate SHA256 hash of a file

    Args:
        filepath: Path to the file

    Returns:
        Hex string of the SHA256 hash

    Raises:
        FileUtilsError: If file not found or read error
    """
    path = Path(filepath)

    if not path.exists():
        raise FileUtilsError(f"File not found: {filepath}")

    try:
        with open(path, 'rb') as f:
            file_hash = hashlib.sha256()
            # Read in chunks to handle large files
            for chunk in iter(lambda: f.read(8192), b''):
                file_hash.update(chunk)
        return file_hash.hexdigest()

    except Exception as e:
        raise FileUtilsError(f"Error calculating hash for {filepath}: {str(e)}")


def get_metadata_path(scenario_id: str) -> Path:
    """
    Get the metadata file path for a scenario

    Args:
        scenario_id: Scenario ID (e.g., 'E2E-INVENTORY-001')

    Returns:
        Path to the metadata JSON file
    """
    # Get the skill directory
    skill_dir = Path(__file__).parent.parent
    metadata_dir = skill_dir / "metadata"

    # Ensure metadata directory exists
    metadata_dir.mkdir(parents=True, exist_ok=True)

    return metadata_dir / f"{scenario_id}.json"


def store_file_metadata(
    scenario_id: str,
    file_path: str,
    file_hash: str,
    framework: str = 'playwright'
) -> None:
    """
    Store metadata for a generated file

    Args:
        scenario_id: Scenario ID
        file_path: Path to the generated file
        file_hash: SHA256 hash of the file
        framework: Framework used for generation

    Raises:
        FileUtilsError: If metadata storage fails
    """
    metadata = {
        'scenario_id': scenario_id,
        'file_path': file_path,
        'original_hash': file_hash,
        'generated_at': datetime.now().isoformat(),
        'framework': framework
    }

    metadata_path = get_metadata_path(scenario_id)

    try:
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
    except Exception as e:
        raise FileUtilsError(f"Error storing metadata for {scenario_id}: {str(e)}")


def load_file_metadata(scenario_id: str) -> Optional[Dict[str, Any]]:
    """
    Load metadata for a scenario

    Args:
        scenario_id: Scenario ID

    Returns:
        Dict containing metadata, or None if not found
    """
    metadata_path = get_metadata_path(scenario_id)

    if not metadata_path.exists():
        return None

    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise FileUtilsError(f"Error loading metadata for {scenario_id}: {str(e)}")


def detect_modification_level(
    original_hash: str,
    current_hash: str,
    file_content: str
) -> str:
    """
    Detect the level of file modification

    Args:
        original_hash: Hash of the originally generated file
        current_hash: Hash of the current file
        file_content: Current file content (for marker detection)

    Returns:
        Modification level: 'none', 'low', or 'high'
    """
    if original_hash == current_hash:
        return 'none'

    # Check for CUSTOM CODE markers
    has_custom_code = '// CUSTOM CODE START' in file_content

    if has_custom_code:
        # If has custom code markers, assume low modification (safe to update)
        return 'low'
    else:
        # No markers and hash different - might be high modification
        return 'high'


def has_code_markers(file_content: str) -> bool:
    """
    Check if file contains code markers

    Args:
        file_content: File content string

    Returns:
        True if file has AUTO-GENERATED or CUSTOM CODE markers
    """
    return (
        '// AUTO-GENERATED' in file_content or
        '// CUSTOM CODE START' in file_content
    )


def extract_custom_code(file_content: str) -> Optional[str]:
    """
    Extract custom code section from file

    Args:
        file_content: File content string

    Returns:
        Custom code content, or None if no custom code section
    """
    start_marker = '// CUSTOM CODE START'
    end_marker = '// CUSTOM CODE END'

    start_idx = file_content.find(start_marker)
    end_idx = file_content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        return None

    # Extract content between markers (including markers)
    return file_content[start_idx:end_idx + len(end_marker)]


def merge_custom_code(new_content: str, custom_code: str) -> str:
    """
    Merge custom code into new generated content

    Args:
        new_content: Newly generated file content
        custom_code: Custom code section to preserve

    Returns:
        Merged content with custom code preserved
    """
    # Find the CUSTOM CODE section in new content
    start_marker = '// CUSTOM CODE START'
    end_marker = '// CUSTOM CODE END'

    start_idx = new_content.find(start_marker)
    end_idx = new_content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        # New content doesn't have custom code section, append it
        return new_content + '\n' + custom_code

    # Replace the placeholder custom code with actual custom code
    before = new_content[:start_idx]
    after = new_content[end_idx + len(end_marker):]

    return before + custom_code + after


def ensure_directory_exists(filepath: str) -> None:
    """
    Ensure parent directory of a file exists

    Args:
        filepath: Path to the file

    Raises:
        FileUtilsError: If directory creation fails
    """
    path = Path(filepath)
    parent_dir = path.parent

    try:
        parent_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        raise FileUtilsError(f"Error creating directory {parent_dir}: {str(e)}")


def write_file(filepath: str, content: str) -> None:
    """
    Write content to a file

    Args:
        filepath: Path to the file
        content: Content to write

    Raises:
        FileUtilsError: If write fails
    """
    ensure_directory_exists(filepath)

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        raise FileUtilsError(f"Error writing file {filepath}: {str(e)}")


def read_file(filepath: str) -> str:
    """
    Read file content

    Args:
        filepath: Path to the file

    Returns:
        File content string

    Raises:
        FileUtilsError: If file not found or read fails
    """
    path = Path(filepath)

    if not path.exists():
        raise FileUtilsError(f"File not found: {filepath}")

    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        raise FileUtilsError(f"Error reading file {filepath}: {str(e)}")

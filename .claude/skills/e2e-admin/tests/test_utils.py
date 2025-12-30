# @spec T001-e2e-orchestrator
"""
Unit tests for utils.py module.
"""

import pytest
import re
from pathlib import Path
import yaml

from scripts.utils import (
    generate_run_id,
    validate_run_id_format,
    ensure_directory,
    load_yaml
)


class TestGenerateRunId:
    """Test run_id generation."""

    @pytest.mark.unit
    def test_run_id_format(self):
        """Test run_id matches expected format."""
        run_id = generate_run_id()

        # Format: YYYYMMDD-HHMMSS-<8-char-hex>
        pattern = r'^\d{8}-\d{6}-[a-f0-9]{8}$'
        assert re.match(pattern, run_id), f"run_id format invalid: {run_id}"

    @pytest.mark.unit
    def test_run_id_uniqueness(self):
        """Test multiple run_ids are unique."""
        run_ids = [generate_run_id() for _ in range(10)]

        assert len(set(run_ids)) == 10, "run_ids should be unique"

    @pytest.mark.unit
    def test_run_id_contains_timestamp(self):
        """Test run_id contains valid timestamp."""
        run_id = generate_run_id()

        # Extract date part
        date_part = run_id[:8]
        time_part = run_id[9:15]

        # Validate date format (YYYYMMDD)
        assert date_part.isdigit() and len(date_part) == 8

        # Validate time format (HHMMSS)
        assert time_part.isdigit() and len(time_part) == 6


class TestValidateRunIdFormat:
    """Test run_id format validation."""

    @pytest.mark.unit
    def test_valid_run_id(self):
        """Test validation passes for valid run_id."""
        valid_run_id = "20251230-120000-abcd1234"
        assert validate_run_id_format(valid_run_id) is True

    @pytest.mark.unit
    def test_invalid_date_format(self):
        """Test validation fails for invalid date."""
        invalid_run_id = "2025-12-30-120000-abcd1234"
        assert validate_run_id_format(invalid_run_id) is False

    @pytest.mark.unit
    def test_invalid_time_format(self):
        """Test validation fails for invalid time."""
        invalid_run_id = "20251230-12:00:00-abcd1234"
        assert validate_run_id_format(invalid_run_id) is False

    @pytest.mark.unit
    def test_invalid_uuid_length(self):
        """Test validation fails for wrong uuid length."""
        invalid_run_id = "20251230-120000-abc"
        assert validate_run_id_format(invalid_run_id) is False

    @pytest.mark.unit
    def test_invalid_uuid_chars(self):
        """Test validation fails for invalid uuid characters."""
        invalid_run_id = "20251230-120000-ABCD1234"  # Uppercase not allowed
        assert validate_run_id_format(invalid_run_id) is False


class TestEnsureDirectory:
    """Test directory creation."""

    @pytest.mark.unit
    def test_create_new_directory(self, temp_dir):
        """Test creating a new directory."""
        new_dir = temp_dir / "test" / "nested" / "dir"

        ensure_directory(str(new_dir))

        assert new_dir.exists()
        assert new_dir.is_dir()

    @pytest.mark.unit
    def test_existing_directory(self, temp_dir):
        """Test handling existing directory."""
        existing_dir = temp_dir / "existing"
        existing_dir.mkdir()

        # Should not raise error
        ensure_directory(str(existing_dir))

        assert existing_dir.exists()

    @pytest.mark.unit
    def test_create_nested_directories(self, temp_dir):
        """Test creating deeply nested directories."""
        nested_dir = temp_dir / "a" / "b" / "c" / "d" / "e"

        ensure_directory(str(nested_dir))

        assert nested_dir.exists()
        assert (temp_dir / "a" / "b" / "c").exists()


class TestLoadYaml:
    """Test YAML file loading."""

    @pytest.mark.unit
    def test_load_valid_yaml(self, temp_dir):
        """Test loading valid YAML file."""
        yaml_file = temp_dir / "test.yaml"
        data = {
            'key1': 'value1',
            'key2': {'nested': 'value2'},
            'key3': [1, 2, 3]
        }

        with open(yaml_file, 'w') as f:
            yaml.dump(data, f)

        result = load_yaml(str(yaml_file))

        assert result == data
        assert result['key1'] == 'value1'
        assert result['key2']['nested'] == 'value2'
        assert result['key3'] == [1, 2, 3]

    @pytest.mark.unit
    def test_load_nonexistent_file(self, temp_dir):
        """Test loading non-existent file raises error."""
        yaml_file = temp_dir / "nonexistent.yaml"

        with pytest.raises(FileNotFoundError) as exc_info:
            load_yaml(str(yaml_file))

        assert "YAML file not found" in str(exc_info.value)

    @pytest.mark.unit
    def test_load_invalid_yaml(self, temp_dir):
        """Test loading invalid YAML raises error."""
        yaml_file = temp_dir / "invalid.yaml"
        yaml_file.write_text("invalid: yaml: content: [")

        with pytest.raises(yaml.YAMLError):
            load_yaml(str(yaml_file))

    @pytest.mark.unit
    def test_load_empty_yaml(self, temp_dir):
        """Test loading empty YAML file returns empty dict."""
        yaml_file = temp_dir / "empty.yaml"
        yaml_file.write_text("")

        result = load_yaml(str(yaml_file))

        assert result == {}

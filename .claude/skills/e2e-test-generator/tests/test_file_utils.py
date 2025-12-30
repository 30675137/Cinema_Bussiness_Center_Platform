# @spec T002-e2e-test-generator
"""
Unit tests for file_utils module
"""

import pytest
import sys
import json
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

import file_utils


class TestCalculateFileHash:
    """Test calculate_file_hash function"""

    def test_hash_existing_file(self, tmp_path):
        """Should calculate SHA256 hash for existing file"""
        test_file = tmp_path / "test.txt"
        test_file.write_text("test content")

        hash_value = file_utils.calculate_file_hash(str(test_file))

        assert isinstance(hash_value, str)
        assert len(hash_value) == 64  # SHA256 produces 64-character hex string

    def test_same_content_same_hash(self, tmp_path):
        """Should produce same hash for same content"""
        file1 = tmp_path / "file1.txt"
        file2 = tmp_path / "file2.txt"
        file1.write_text("identical content")
        file2.write_text("identical content")

        hash1 = file_utils.calculate_file_hash(str(file1))
        hash2 = file_utils.calculate_file_hash(str(file2))

        assert hash1 == hash2

    def test_different_content_different_hash(self, tmp_path):
        """Should produce different hash for different content"""
        file1 = tmp_path / "file1.txt"
        file2 = tmp_path / "file2.txt"
        file1.write_text("content A")
        file2.write_text("content B")

        hash1 = file_utils.calculate_file_hash(str(file1))
        hash2 = file_utils.calculate_file_hash(str(file2))

        assert hash1 != hash2

    def test_file_not_found(self):
        """Should raise FileUtilsError if file doesn't exist"""
        with pytest.raises(file_utils.FileUtilsError, match="File not found"):
            file_utils.calculate_file_hash("nonexistent.txt")


class TestStoreAndLoadFileMetadata:
    """Test store_file_metadata and load_file_metadata functions"""

    def test_store_metadata(self):
        """Should store metadata to JSON file"""
        scenario_id = "E2E-TEST-001"
        file_path = "test.spec.ts"
        file_hash = "abc123"

        file_utils.store_file_metadata(scenario_id, file_path, file_hash, "playwright")

        # Verify metadata file was created
        metadata_path = file_utils.get_metadata_path(scenario_id)
        assert metadata_path.exists()

        # Clean up
        metadata_path.unlink()

    def test_load_existing_metadata(self):
        """Should load existing metadata"""
        scenario_id = "E2E-TEST-002"
        file_path = "test.spec.ts"
        file_hash = "def456"

        # Store metadata first
        file_utils.store_file_metadata(scenario_id, file_path, file_hash, "playwright")

        # Load metadata
        metadata = file_utils.load_file_metadata(scenario_id)

        assert metadata is not None
        assert metadata['scenario_id'] == scenario_id
        assert metadata['file_path'] == file_path
        assert metadata['original_hash'] == file_hash
        assert metadata['framework'] == "playwright"

        # Clean up
        file_utils.get_metadata_path(scenario_id).unlink()

    def test_load_nonexistent_metadata(self):
        """Should return None if metadata doesn't exist"""
        metadata = file_utils.load_file_metadata("E2E-NONEXISTENT-999")

        assert metadata is None


class TestDetectModificationLevel:
    """Test detect_modification_level function"""

    def test_no_modification(self):
        """Should return 'none' if hashes match"""
        original_hash = "abc123"
        current_hash = "abc123"
        content = "test content"

        level = file_utils.detect_modification_level(original_hash, current_hash, content)

        assert level == 'none'

    def test_low_modification_with_markers(self):
        """Should return 'low' if has custom code markers"""
        original_hash = "abc123"
        current_hash = "def456"
        content = """
        test code
        // CUSTOM CODE START
        custom logic
        // CUSTOM CODE END
        """

        level = file_utils.detect_modification_level(original_hash, current_hash, content)

        assert level == 'low'

    def test_high_modification_without_markers(self):
        """Should return 'high' if no markers and hash different"""
        original_hash = "abc123"
        current_hash = "def456"
        content = "modified content without markers"

        level = file_utils.detect_modification_level(original_hash, current_hash, content)

        assert level == 'high'


class TestHasCodeMarkers:
    """Test has_code_markers function"""

    def test_has_auto_generated_marker(self):
        """Should detect AUTO-GENERATED marker"""
        content = """
        // AUTO-GENERATED: Do not modify
        test code
        """

        assert file_utils.has_code_markers(content) is True

    def test_has_custom_code_marker(self):
        """Should detect CUSTOM CODE markers"""
        content = """
        test code
        // CUSTOM CODE START
        custom logic
        // CUSTOM CODE END
        """

        assert file_utils.has_code_markers(content) is True

    def test_no_markers(self):
        """Should return False if no markers present"""
        content = "plain code without any markers"

        assert file_utils.has_code_markers(content) is False


class TestExtractCustomCode:
    """Test extract_custom_code function"""

    def test_extract_existing_custom_code(self):
        """Should extract custom code section"""
        content = """
        auto generated code
        // CUSTOM CODE START
        console.log('custom');
        await page.screenshot();
        // CUSTOM CODE END
        more auto generated code
        """

        custom_code = file_utils.extract_custom_code(content)

        assert custom_code is not None
        assert '// CUSTOM CODE START' in custom_code
        assert '// CUSTOM CODE END' in custom_code
        assert 'console.log' in custom_code

    def test_no_custom_code_section(self):
        """Should return None if no custom code section"""
        content = "code without custom section"

        custom_code = file_utils.extract_custom_code(content)

        assert custom_code is None

    def test_incomplete_markers(self):
        """Should return None if markers incomplete"""
        content = """
        // CUSTOM CODE START
        some code but no end marker
        """

        custom_code = file_utils.extract_custom_code(content)

        assert custom_code is None


class TestMergeCustomCode:
    """Test merge_custom_code function"""

    def test_merge_into_new_content(self):
        """Should merge custom code into new generated content"""
        new_content = """
        new auto generated code
        // CUSTOM CODE START
        // placeholder
        // CUSTOM CODE END
        more new code
        """

        custom_code = """// CUSTOM CODE START
        console.log('preserved custom code');
        // CUSTOM CODE END"""

        merged = file_utils.merge_custom_code(new_content, custom_code)

        assert 'preserved custom code' in merged
        assert 'new auto generated code' in merged
        assert '// placeholder' not in merged

    def test_append_if_no_section(self):
        """Should append custom code if new content has no section"""
        new_content = "new code without custom section"
        custom_code = """// CUSTOM CODE START
        custom logic
        // CUSTOM CODE END"""

        merged = file_utils.merge_custom_code(new_content, custom_code)

        assert 'new code without custom section' in merged
        assert 'custom logic' in merged


class TestWriteAndReadFile:
    """Test write_file and read_file functions"""

    def test_write_and_read(self, tmp_path):
        """Should write and read file successfully"""
        filepath = str(tmp_path / "test.txt")
        content = "test content\nline 2"

        file_utils.write_file(filepath, content)

        read_content = file_utils.read_file(filepath)

        assert read_content == content

    def test_write_creates_directories(self, tmp_path):
        """Should create parent directories if they don't exist"""
        filepath = str(tmp_path / "nested" / "dir" / "test.txt")
        content = "test"

        file_utils.write_file(filepath, content)

        assert Path(filepath).exists()
        assert file_utils.read_file(filepath) == content

    def test_read_nonexistent_file(self):
        """Should raise FileUtilsError when reading nonexistent file"""
        with pytest.raises(file_utils.FileUtilsError, match="File not found"):
            file_utils.read_file("nonexistent.txt")


class TestEnsureDirectoryExists:
    """Test ensure_directory_exists function"""

    def test_create_nested_directories(self, tmp_path):
        """Should create nested directories"""
        filepath = str(tmp_path / "a" / "b" / "c" / "file.txt")

        file_utils.ensure_directory_exists(filepath)

        parent_dir = Path(filepath).parent
        assert parent_dir.exists()
        assert parent_dir.is_dir()

    def test_directory_already_exists(self, tmp_path):
        """Should not fail if directory already exists"""
        filepath = str(tmp_path / "existing" / "file.txt")

        # Create directory first
        Path(filepath).parent.mkdir(parents=True)

        # Should not raise error
        file_utils.ensure_directory_exists(filepath)

        assert Path(filepath).parent.exists()

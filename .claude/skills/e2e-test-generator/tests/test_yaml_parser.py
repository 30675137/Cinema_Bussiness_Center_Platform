# @spec T002-e2e-test-generator
"""
Unit tests for yaml_parser module
"""

import pytest
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

import yaml_parser


class TestParseScenarioYAML:
    """Test parse_scenario_yaml function"""

    def test_parse_valid_yaml(self, tmp_path):
        """Should successfully parse valid YAML file"""
        yaml_file = tmp_path / "test.yaml"
        yaml_file.write_text("""
scenario_id: E2E-TEST-001
title: Test Scenario
        """)

        result = yaml_parser.parse_scenario_yaml(str(yaml_file))

        assert result['scenario_id'] == 'E2E-TEST-001'
        assert result['title'] == 'Test Scenario'

    def test_file_not_found(self):
        """Should raise YAMLParseError if file not found"""
        with pytest.raises(yaml_parser.YAMLParseError, match="not found"):
            yaml_parser.parse_scenario_yaml("nonexistent.yaml")

    def test_empty_yaml_file(self, tmp_path):
        """Should raise YAMLParseError if YAML file is empty"""
        yaml_file = tmp_path / "empty.yaml"
        yaml_file.write_text("")

        with pytest.raises(yaml_parser.YAMLParseError, match="Empty YAML file"):
            yaml_parser.parse_scenario_yaml(str(yaml_file))

    def test_invalid_yaml_format(self, tmp_path):
        """Should raise YAMLParseError if YAML format is invalid"""
        yaml_file = tmp_path / "invalid.yaml"
        yaml_file.write_text("invalid: yaml: content:")

        with pytest.raises(yaml_parser.YAMLParseError, match="Invalid YAML format"):
            yaml_parser.parse_scenario_yaml(str(yaml_file))

    def test_yaml_not_dictionary(self, tmp_path):
        """Should raise YAMLParseError if YAML root is not a dictionary"""
        yaml_file = tmp_path / "list.yaml"
        yaml_file.write_text("- item1\n- item2")

        with pytest.raises(yaml_parser.YAMLParseError, match="must be a dictionary"):
            yaml_parser.parse_scenario_yaml(str(yaml_file))


class TestValidateRequiredFields:
    """Test validate_required_fields function"""

    def test_all_fields_present(self):
        """Should not raise error if all required fields present"""
        data = {'field1': 'value1', 'field2': 'value2', 'field3': 'value3'}
        required = ['field1', 'field2', 'field3']

        # Should not raise
        yaml_parser.validate_required_fields(data, required)

    def test_missing_single_field(self):
        """Should raise YAMLParseError if one field is missing"""
        data = {'field1': 'value1', 'field2': 'value2'}
        required = ['field1', 'field2', 'field3']

        with pytest.raises(yaml_parser.YAMLParseError, match="Missing required fields: field3"):
            yaml_parser.validate_required_fields(data, required)

    def test_missing_multiple_fields(self):
        """Should raise YAMLParseError if multiple fields are missing"""
        data = {'field1': 'value1'}
        required = ['field1', 'field2', 'field3']

        with pytest.raises(yaml_parser.YAMLParseError, match="Missing required fields"):
            yaml_parser.validate_required_fields(data, required)


class TestParseScenarioWithValidation:
    """Test parse_scenario_with_validation function"""

    def test_valid_scenario(self, tmp_path):
        """Should successfully parse and validate complete scenario"""
        yaml_file = tmp_path / "scenario.yaml"
        yaml_file.write_text("""
scenario_id: E2E-INVENTORY-001
spec_ref: P005
title: Test Scenario
tags:
  module: [inventory]
  priority: p1
steps:
  - action: login
assertions:
  - type: ui
    check: element_visible
        """)

        result = yaml_parser.parse_scenario_with_validation(str(yaml_file))

        assert result['scenario_id'] == 'E2E-INVENTORY-001'
        assert result['spec_ref'] == 'P005'
        assert len(result['steps']) == 1
        assert len(result['assertions']) == 1

    def test_missing_required_field(self, tmp_path):
        """Should raise error if required field is missing"""
        yaml_file = tmp_path / "incomplete.yaml"
        yaml_file.write_text("""
scenario_id: E2E-TEST-001
title: Test
        """)

        with pytest.raises(yaml_parser.YAMLParseError, match="Missing required fields"):
            yaml_parser.parse_scenario_with_validation(str(yaml_file))

    def test_invalid_scenario_id_format(self, tmp_path):
        """Should raise error if scenario_id format is invalid"""
        yaml_file = tmp_path / "bad_id.yaml"
        yaml_file.write_text("""
scenario_id: INVALID-ID
spec_ref: P005
title: Test
tags: {}
steps: [{}]
assertions: [{}]
        """)

        with pytest.raises(yaml_parser.YAMLParseError, match="Invalid scenario_id format"):
            yaml_parser.parse_scenario_with_validation(str(yaml_file))

    def test_invalid_spec_ref_format(self, tmp_path):
        """Should raise error if spec_ref format is invalid"""
        yaml_file = tmp_path / "bad_ref.yaml"
        yaml_file.write_text("""
scenario_id: E2E-TEST-001
spec_ref: INVALID
title: Test
tags: {}
steps: [{}]
assertions: [{}]
        """)

        with pytest.raises(yaml_parser.YAMLParseError, match="Invalid spec_ref format"):
            yaml_parser.parse_scenario_with_validation(str(yaml_file))

    def test_empty_steps_list(self, tmp_path):
        """Should raise error if steps list is empty"""
        yaml_file = tmp_path / "no_steps.yaml"
        yaml_file.write_text("""
scenario_id: E2E-TEST-001
spec_ref: P005
title: Test
tags: {}
steps: []
assertions: [{}]
        """)

        with pytest.raises(yaml_parser.YAMLParseError, match="must be a non-empty list"):
            yaml_parser.parse_scenario_with_validation(str(yaml_file))

    def test_empty_assertions_list(self, tmp_path):
        """Should raise error if assertions list is empty"""
        yaml_file = tmp_path / "no_assertions.yaml"
        yaml_file.write_text("""
scenario_id: E2E-TEST-001
spec_ref: P005
title: Test
tags: {}
steps: [{}]
assertions: []
        """)

        with pytest.raises(yaml_parser.YAMLParseError, match="must be a non-empty list"):
            yaml_parser.parse_scenario_with_validation(str(yaml_file))


class TestExtractTestdataRefs:
    """Test extract_testdata_refs function"""

    def test_extract_from_preconditions(self):
        """Should extract testdata_ref from preconditions"""
        data = {
            'preconditions': {
                'testdata_ref': 'testData.scenario_001'
            },
            'steps': []
        }

        refs = yaml_parser.extract_testdata_refs(data)

        assert 'testData.scenario_001' in refs

    def test_extract_from_steps(self):
        """Should extract testdata_ref from step params"""
        data = {
            'steps': [
                {
                    'action': 'login',
                    'params': {
                        'testdata_ref': 'testData.login'
                    }
                },
                {
                    'action': 'navigate',
                    'params': {
                        'testdata_ref': 'testData.page'
                    }
                }
            ]
        }

        refs = yaml_parser.extract_testdata_refs(data)

        assert 'testData.login' in refs
        assert 'testData.page' in refs
        assert len(refs) == 2

    def test_extract_multiple_refs(self):
        """Should extract all unique testdata refs"""
        data = {
            'preconditions': {
                'testdata_ref': 'testData.base'
            },
            'steps': [
                {
                    'action': 'step1',
                    'params': {
                        'testdata_ref': 'testData.step1'
                    }
                },
                {
                    'action': 'step2',
                    'params': {
                        'testdata_ref': 'testData.step2'
                    }
                }
            ]
        }

        refs = yaml_parser.extract_testdata_refs(data)

        assert len(refs) == 3
        assert 'testData.base' in refs
        assert 'testData.step1' in refs
        assert 'testData.step2' in refs

    def test_no_testdata_refs(self):
        """Should return empty set if no testdata refs"""
        data = {
            'steps': [
                {
                    'action': 'click',
                    'params': {
                        'selector': '#button'
                    }
                }
            ]
        }

        refs = yaml_parser.extract_testdata_refs(data)

        assert len(refs) == 0


class TestExtractPageObjects:
    """Test extract_page_objects function"""

    def test_extract_from_action_mappings(self):
        """Should extract page objects from action mappings"""
        data = {
            'steps': [
                {'action': 'login'},
                {'action': 'navigate'}
            ]
        }

        action_mappings = {
            'login': {
                'playwright': {
                    'imports': ['LoginPage']
                }
            },
            'navigate': {
                'playwright': {
                    'imports': ['NavigationHelper']
                }
            }
        }

        page_objects = yaml_parser.extract_page_objects(data, action_mappings)

        assert 'LoginPage' in page_objects
        assert 'NavigationHelper' in page_objects
        assert len(page_objects) == 2

    def test_multiple_imports_per_action(self):
        """Should extract multiple imports from single action"""
        data = {
            'steps': [
                {'action': 'complex_action'}
            ]
        }

        action_mappings = {
            'complex_action': {
                'playwright': {
                    'imports': ['Page1', 'Page2', 'Helper']
                }
            }
        }

        page_objects = yaml_parser.extract_page_objects(data, action_mappings)

        assert len(page_objects) == 3
        assert 'Page1' in page_objects
        assert 'Page2' in page_objects
        assert 'Helper' in page_objects

    def test_unknown_action(self):
        """Should skip unknown actions without error"""
        data = {
            'steps': [
                {'action': 'known_action'},
                {'action': 'unknown_action'}
            ]
        }

        action_mappings = {
            'known_action': {
                'playwright': {
                    'imports': ['KnownPage']
                }
            }
        }

        page_objects = yaml_parser.extract_page_objects(data, action_mappings)

        assert 'KnownPage' in page_objects
        assert len(page_objects) == 1

    def test_action_without_imports(self):
        """Should handle actions without imports"""
        data = {
            'steps': [
                {'action': 'wait'}
            ]
        }

        action_mappings = {
            'wait': {
                'playwright': {
                    'code': 'await page.waitForTimeout(1000)'
                }
            }
        }

        page_objects = yaml_parser.extract_page_objects(data, action_mappings)

        assert len(page_objects) == 0

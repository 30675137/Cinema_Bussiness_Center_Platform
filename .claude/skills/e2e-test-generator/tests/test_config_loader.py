# @spec T002-e2e-test-generator
"""
Unit tests for config_loader module
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import patch, mock_open

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

import config_loader


class TestLoadYAMLConfig:
    """Test load_yaml_config function"""

    def test_load_valid_config(self, tmp_path):
        """Should successfully load valid YAML config"""
        config_file = tmp_path / "config.yaml"
        config_file.write_text("""
action1:
  playwright:
    code: test code
        """)

        result = config_loader.load_yaml_config(config_file)

        assert 'action1' in result
        assert result['action1']['playwright']['code'] == 'test code'

    def test_file_not_found(self):
        """Should raise ConfigLoadError if file not found"""
        with pytest.raises(config_loader.ConfigLoadError, match="not found"):
            config_loader.load_yaml_config(Path("nonexistent.yaml"))

    def test_empty_config_file(self, tmp_path):
        """Should raise ConfigLoadError if config is empty"""
        config_file = tmp_path / "empty.yaml"
        config_file.write_text("")

        with pytest.raises(config_loader.ConfigLoadError, match="Empty configuration"):
            config_loader.load_yaml_config(config_file)

    def test_invalid_yaml(self, tmp_path):
        """Should raise ConfigLoadError for invalid YAML"""
        config_file = tmp_path / "invalid.yaml"
        config_file.write_text("invalid: yaml: content:")

        with pytest.raises(config_loader.ConfigLoadError, match="Invalid YAML"):
            config_loader.load_yaml_config(config_file)


class TestLoadActionMappings:
    """Test load_action_mappings function"""

    @patch('config_loader.get_config_path')
    @patch('config_loader.load_yaml_config')
    @patch('config_loader.validate_action_mappings_schema')
    def test_load_valid_mappings(self, mock_validate, mock_load, mock_path):
        """Should load and validate action mappings"""
        mock_path.return_value = Path("action-mappings.yaml")
        mock_load.return_value = {
            'login': {
                'playwright': {
                    'code': 'await loginPage.login()'
                }
            }
        }

        result = config_loader.load_action_mappings()

        assert 'login' in result
        mock_validate.assert_called_once()

    @patch('config_loader.get_config_path')
    @patch('config_loader.load_yaml_config')
    @patch('config_loader.validate_action_mappings_schema')
    def test_validation_failure(self, mock_validate, mock_load, mock_path):
        """Should raise ConfigLoadError on validation failure"""
        from schema_validator import SchemaValidationError

        mock_path.return_value = Path("action-mappings.yaml")
        mock_load.return_value = {}
        mock_validate.side_effect = SchemaValidationError("Validation error")

        with pytest.raises(config_loader.ConfigLoadError, match="validation failed"):
            config_loader.load_action_mappings()


class TestLoadAssertionMappings:
    """Test load_assertion_mappings function"""

    @patch('config_loader.get_config_path')
    @patch('config_loader.load_yaml_config')
    @patch('config_loader.validate_assertion_mappings_schema')
    def test_load_valid_mappings(self, mock_validate, mock_load, mock_path):
        """Should load and validate assertion mappings"""
        mock_path.return_value = Path("assertion-mappings.yaml")
        mock_load.return_value = {
            'element_visible': {
                'playwright': {
                    'code': 'await expect(page).toBeVisible()'
                }
            }
        }

        result = config_loader.load_assertion_mappings()

        assert 'element_visible' in result
        mock_validate.assert_called_once()


class TestGetActionMapping:
    """Test get_action_mapping function"""

    @patch('config_loader.load_action_mappings')
    def test_get_existing_action(self, mock_load):
        """Should return mapping for existing action"""
        mock_load.return_value = {
            'login': {
                'playwright': {
                    'code': 'await loginPage.login()',
                    'imports': ['LoginPage']
                }
            }
        }

        result = config_loader.get_action_mapping('login', 'playwright')

        assert result['code'] == 'await loginPage.login()'
        assert 'LoginPage' in result['imports']

    @patch('config_loader.load_action_mappings')
    def test_unknown_action(self, mock_load):
        """Should raise ConfigLoadError for unknown action"""
        mock_load.return_value = {}

        with pytest.raises(config_loader.ConfigLoadError, match="Unknown action"):
            config_loader.get_action_mapping('unknown_action', 'playwright')

    @patch('config_loader.load_action_mappings')
    def test_unsupported_framework(self, mock_load):
        """Should raise ConfigLoadError for unsupported framework"""
        mock_load.return_value = {
            'login': {
                'playwright': {
                    'code': 'test'
                }
            }
        }

        with pytest.raises(config_loader.ConfigLoadError, match="not supported"):
            config_loader.get_action_mapping('login', 'unsupported_framework')


class TestGetAssertionMapping:
    """Test get_assertion_mapping function"""

    @patch('config_loader.load_assertion_mappings')
    def test_get_existing_assertion(self, mock_load):
        """Should return mapping for existing assertion"""
        mock_load.return_value = {
            'element_visible': {
                'playwright': {
                    'code': 'await expect(page.locator("{{selector}}")).toBeVisible()'
                }
            }
        }

        result = config_loader.get_assertion_mapping('element_visible', 'playwright')

        assert '{{selector}}' in result['code']

    @patch('config_loader.load_assertion_mappings')
    def test_unknown_assertion(self, mock_load):
        """Should raise ConfigLoadError for unknown assertion"""
        mock_load.return_value = {}

        with pytest.raises(config_loader.ConfigLoadError, match="Unknown assertion"):
            config_loader.get_assertion_mapping('unknown', 'playwright')


class TestListAvailableActions:
    """Test list_available_actions function"""

    @patch('config_loader.load_action_mappings')
    def test_list_all_actions(self, mock_load):
        """Should list all actions when no framework filter"""
        mock_load.return_value = {
            'login': {},
            'navigate': {},
            'click': {}
        }

        result = config_loader.list_available_actions()

        assert len(result) == 3
        assert 'login' in result
        assert 'navigate' in result
        assert 'click' in result

    @patch('config_loader.load_action_mappings')
    def test_filter_by_framework(self, mock_load):
        """Should filter actions by framework"""
        mock_load.return_value = {
            'login': {
                'playwright': {},
                'postman': {}
            },
            'navigate': {
                'playwright': {}
            },
            'api_call': {
                'postman': {}
            }
        }

        result = config_loader.list_available_actions('playwright')

        assert len(result) == 2
        assert 'login' in result
        assert 'navigate' in result
        assert 'api_call' not in result


class TestListAvailableAssertions:
    """Test list_available_assertions function"""

    @patch('config_loader.load_assertion_mappings')
    def test_list_all_assertions(self, mock_load):
        """Should list all assertions when no framework filter"""
        mock_load.return_value = {
            'element_visible': {},
            'response_status_is': {},
            'has_text': {}
        }

        result = config_loader.list_available_assertions()

        assert len(result) == 3
        assert 'element_visible' in result
        assert 'response_status_is' in result

    @patch('config_loader.load_assertion_mappings')
    def test_filter_by_framework(self, mock_load):
        """Should filter assertions by framework"""
        mock_load.return_value = {
            'element_visible': {
                'playwright': {}
            },
            'response_status_is': {
                'playwright': {},
                'postman': {}
            },
            'postman_only': {
                'postman': {}
            }
        }

        result = config_loader.list_available_assertions('playwright')

        assert len(result) == 2
        assert 'element_visible' in result
        assert 'response_status_is' in result
        assert 'postman_only' not in result

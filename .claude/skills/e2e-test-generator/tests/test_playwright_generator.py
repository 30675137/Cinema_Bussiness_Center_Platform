# @spec T002-e2e-test-generator
"""
Unit tests for generate_playwright module
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

import generate_playwright


class TestGenerateStepCode:
    """Test generate_step_code function"""

    def test_generate_simple_action(self):
        """Should generate code for simple action"""
        step = {
            'action': 'login',
            'params': {}
        }

        action_mappings = {
            'login': {
                'playwright': {
                    'code': 'await loginPage.login(testData)',
                    'imports': ['LoginPage']
                }
            }
        }

        with patch('config_loader.get_action_mapping') as mock_get:
            mock_get.return_value = action_mappings['login']['playwright']

            result = generate_playwright.generate_step_code(step, action_mappings)

            assert 'await loginPage.login(testData)' in result

    def test_generate_action_with_params(self):
        """Should expand parameters in action code"""
        step = {
            'action': 'click',
            'params': {
                'selector': '#submit-button'
            }
        }

        action_mappings = {
            'click': {
                'playwright': {
                    'code': 'await page.click("{{selector}}")',
                    'imports': []
                }
            }
        }

        with patch('config_loader.get_action_mapping') as mock_get:
            mock_get.return_value = action_mappings['click']['playwright']
            with patch('template_renderer.expand_placeholders') as mock_expand:
                mock_expand.return_value = 'await page.click("#submit-button")'

                result = generate_playwright.generate_step_code(step, action_mappings)

                assert 'await page.click("#submit-button")' in result
                mock_expand.assert_called_once()

    def test_unknown_action(self):
        """Should return TODO comment for unknown action"""
        from config_loader import ConfigLoadError

        step = {
            'action': 'unknown_action',
            'params': {}
        }

        action_mappings = {}

        with patch('generate_playwright.config_loader.get_action_mapping') as mock_get:
            mock_get.side_effect = ConfigLoadError("Unknown action")

            result = generate_playwright.generate_step_code(step, action_mappings)

            assert 'TODO' in result
            assert 'unknown_action' in result

    def test_missing_action_name(self):
        """Should return TODO comment if action name is missing"""
        step = {
            'params': {}
        }

        result = generate_playwright.generate_step_code(step, {})

        assert 'TODO' in result
        assert 'Missing action name' in result


class TestGenerateAssertionCode:
    """Test generate_assertion_code function"""

    def test_generate_simple_assertion(self):
        """Should generate code for simple assertion"""
        assertion = {
            'check': 'element_visible',
            'params': {
                'selector': '.success-message'
            }
        }

        assertion_mappings = {
            'element_visible': {
                'playwright': {
                    'code': 'await expect(page.locator("{{selector}}")).toBeVisible()'
                }
            }
        }

        with patch('config_loader.get_assertion_mapping') as mock_get:
            mock_get.return_value = assertion_mappings['element_visible']['playwright']
            with patch('template_renderer.expand_placeholders') as mock_expand:
                mock_expand.return_value = 'await expect(page.locator(".success-message")).toBeVisible()'

                result = generate_playwright.generate_assertion_code(assertion, assertion_mappings)

                assert 'toBeVisible()' in result

    def test_unknown_assertion(self):
        """Should return TODO comment for unknown assertion"""
        from config_loader import ConfigLoadError

        assertion = {
            'check': 'unknown_check',
            'params': {}
        }

        with patch('generate_playwright.config_loader.get_assertion_mapping') as mock_get:
            mock_get.side_effect = ConfigLoadError("Unknown assertion")

            result = generate_playwright.generate_assertion_code(assertion, {})

            assert 'TODO' in result
            assert 'unknown_check' in result

    def test_missing_check_type(self):
        """Should return TODO comment if check type is missing"""
        assertion = {
            'params': {}
        }

        result = generate_playwright.generate_assertion_code(assertion, {})

        assert 'TODO' in result
        assert 'Missing assertion check type' in result


class TestExtractPageObjectsFromSteps:
    """Test extract_page_objects_from_steps function"""

    def test_extract_single_page_object(self):
        """Should extract single page object"""
        steps = [
            {'action': 'login'}
        ]

        action_mappings = {
            'login': {
                'playwright': {
                    'imports': ['LoginPage']
                }
            }
        }

        result = generate_playwright.extract_page_objects_from_steps(steps, action_mappings)

        assert 'LoginPage' in result
        assert len(result) == 1

    def test_extract_multiple_page_objects(self):
        """Should extract multiple unique page objects"""
        steps = [
            {'action': 'login'},
            {'action': 'navigate'},
            {'action': 'login'}  # Duplicate
        ]

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

        result = generate_playwright.extract_page_objects_from_steps(steps, action_mappings)

        assert 'LoginPage' in result
        assert 'NavigationHelper' in result
        assert len(result) == 2  # Should deduplicate

    def test_action_without_imports(self):
        """Should handle actions without imports"""
        steps = [
            {'action': 'wait'}
        ]

        action_mappings = {
            'wait': {
                'playwright': {
                    'code': 'await page.waitForTimeout(1000)'
                }
            }
        }

        result = generate_playwright.extract_page_objects_from_steps(steps, action_mappings)

        assert len(result) == 0


class TestGeneratePlaywrightTest:
    """Test generate_playwright_test function"""

    @patch('yaml_parser.parse_scenario_with_validation')
    @patch('schema_validator.validate_scenario_schema')
    @patch('config_loader.load_action_mappings')
    @patch('config_loader.load_assertion_mappings')
    @patch('template_renderer.render_template')
    @patch('yaml_parser.extract_testdata_refs')
    def test_successful_generation(
        self,
        mock_testdata,
        mock_render,
        mock_assertions,
        mock_actions,
        mock_validate,
        mock_parse
    ):
        """Should successfully generate Playwright test"""
        # Mock data
        mock_parse.return_value = {
            'scenario_id': 'E2E-TEST-001',
            'title': 'Test Scenario',
            'steps': [
                {'action': 'login', 'params': {}}
            ],
            'assertions': [
                {'type': 'ui', 'check': 'element_visible', 'params': {'selector': '.msg'}}
            ]
        }

        mock_actions.return_value = {
            'login': {
                'playwright': {
                    'code': 'await loginPage.login(testData)',
                    'imports': ['LoginPage']
                }
            }
        }

        mock_assertions.return_value = {
            'element_visible': {
                'playwright': {
                    'code': 'await expect(page.locator("{{selector}}")).toBeVisible()'
                }
            }
        }

        mock_testdata.return_value = {'testData.base'}
        mock_render.return_value = 'generated test code'

        result = generate_playwright.generate_playwright_test('test.yaml')

        assert result == 'generated test code'
        mock_parse.assert_called_once_with('test.yaml')
        mock_validate.assert_called_once()
        mock_render.assert_called_once()

    @patch('yaml_parser.parse_scenario_with_validation')
    def test_yaml_parse_error(self, mock_parse):
        """Should raise PlaywrightGenerationError on YAML parse error"""
        mock_parse.side_effect = Exception("YAML error")

        with pytest.raises(generate_playwright.PlaywrightGenerationError):
            generate_playwright.generate_playwright_test('invalid.yaml')

    @patch('yaml_parser.parse_scenario_with_validation')
    @patch('schema_validator.validate_scenario_schema')
    def test_schema_validation_error(self, mock_validate, mock_parse):
        """Should raise PlaywrightGenerationError on schema validation error"""
        mock_parse.return_value = {}
        mock_validate.side_effect = Exception("Schema error")

        with pytest.raises(generate_playwright.PlaywrightGenerationError):
            generate_playwright.generate_playwright_test('test.yaml')


class TestSavePlaywrightTest:
    """Test save_playwright_test function"""

    @patch('generate_playwright.generate_playwright_test')
    @patch('file_utils.write_file')
    @patch('file_utils.calculate_file_hash')
    @patch('file_utils.store_file_metadata')
    @patch('yaml_parser.parse_scenario_yaml')
    def test_create_new_file(
        self,
        mock_parse_yaml,
        mock_store_metadata,
        mock_calc_hash,
        mock_write,
        mock_generate
    ):
        """Should create new file if it doesn't exist"""
        mock_generate.return_value = 'test code'
        mock_parse_yaml.return_value = {'scenario_id': 'E2E-TEST-001'}
        mock_calc_hash.return_value = 'abc123'

        with patch('pathlib.Path.exists', return_value=False):
            result = generate_playwright.save_playwright_test(
                'test.yaml',
                'output.spec.ts'
            )

        assert result['status'] in ['created', 'updated']
        assert result['filepath'] == 'output.spec.ts'
        mock_write.assert_called_once_with('output.spec.ts', 'test code')
        mock_store_metadata.assert_called_once()

    @patch('generate_playwright.generate_playwright_test')
    @patch('file_utils.write_file')
    def test_force_overwrite(self, mock_write, mock_generate):
        """Should overwrite existing file when force=True"""
        mock_generate.return_value = 'new test code'

        with patch('pathlib.Path.exists', return_value=True):
            with patch('yaml_parser.parse_scenario_yaml') as mock_parse:
                mock_parse.return_value = {'scenario_id': 'E2E-TEST-001'}
                with patch('file_utils.calculate_file_hash'):
                    with patch('file_utils.store_file_metadata'):
                        result = generate_playwright.save_playwright_test(
                            'test.yaml',
                            'output.spec.ts',
                            force=True
                        )

        mock_write.assert_called()
        assert 'output.spec.ts' in result['filepath']


class TestGenerateForScenario:
    """Test generate_for_scenario function"""

    @patch('generate_playwright.save_playwright_test')
    @patch('pathlib.Path.exists')
    def test_generate_with_explicit_module(self, mock_exists, mock_save):
        """Should generate test with explicitly provided module"""
        mock_exists.return_value = True
        mock_save.return_value = {
            'status': 'created',
            'filepath': 'scenarios/inventory/E2E-INVENTORY-001.spec.ts',
            'message': 'Success'
        }

        result = generate_playwright.generate_for_scenario('E2E-INVENTORY-001', 'inventory')

        assert result['status'] == 'created'
        mock_save.assert_called_once()

    @patch('generate_playwright.save_playwright_test')
    @patch('pathlib.Path.exists')
    def test_generate_infer_module_from_id(self, mock_exists, mock_save):
        """Should infer module from scenario ID"""
        mock_exists.return_value = True
        mock_save.return_value = {'status': 'created', 'filepath': 'test.spec.ts', 'message': 'Success'}

        result = generate_playwright.generate_for_scenario('E2E-ORDER-001')

        # Should infer module 'order' from 'E2E-ORDER-001'
        mock_save.assert_called_once()
        call_args = mock_save.call_args[0]
        assert 'order' in call_args[0]  # Should be in scenario filepath

    @patch('pathlib.Path.exists')
    def test_scenario_file_not_found(self, mock_exists):
        """Should raise error if scenario file not found"""
        mock_exists.return_value = False

        with pytest.raises(generate_playwright.PlaywrightGenerationError, match="not found"):
            generate_playwright.generate_for_scenario('E2E-NONEXISTENT-999')

    def test_invalid_scenario_id_format(self):
        """Should raise error if cannot determine module from scenario ID"""
        with pytest.raises(generate_playwright.PlaywrightGenerationError, match="Scenario file not found"):
            generate_playwright.generate_for_scenario('INVALID-ID')

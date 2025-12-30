# @spec T002-e2e-test-generator
"""
Integration tests for testdata generation in Playwright tests

Tests the complete workflow from YAML parsing to testdata code generation.
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

import generate_playwright
import testdata_parser


class TestTestdataIntegration:
    """Test complete testdata integration workflow"""

    @patch('generate_playwright.schema_validator.validate_scenario_schema')
    @patch('generate_playwright.config_loader.load_action_mappings')
    @patch('generate_playwright.config_loader.load_assertion_mappings')
    @patch('generate_playwright.template_renderer.render_template')
    @patch('generate_playwright.yaml_parser.parse_scenario_with_validation')
    def test_generate_with_testdata_refs(
        self,
        mock_parse,
        mock_render,
        mock_assertions,
        mock_actions,
        mock_validate
    ):
        """Should generate test with testdata imports and beforeEach hook"""
        # Mock scenario with testdata refs
        mock_parse.return_value = {
            'scenario_id': 'E2E-TEST-001',
            'title': 'Test Scenario',
            'description': 'Test Description',
            'steps': [
                {
                    'action': 'login',
                    'params': {
                        'testdata_ref': 'inventoryTestData.user_normal'
                    },
                    'description': 'Login'
                }
            ],
            'assertions': [
                {
                    'type': 'ui',
                    'check': 'element_visible',
                    'params': {
                        'testdata_ref': 'inventoryTestData.order_data'
                    }
                }
            ]
        }

        mock_actions.return_value = {
            'login': {
                'playwright': {
                    'code': 'await loginPage.login()',
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

        mock_render.return_value = 'generated test code'

        # Generate test
        result = generate_playwright.generate_playwright_test('test.yaml')

        # Verify template was called with testdata context
        assert mock_render.called
        context = mock_render.call_args[0][1]

        # Verify testdata_imports were generated
        assert 'testdata_imports' in context
        assert len(context['testdata_imports']) == 1
        assert "import { inventoryTestData } from '@/testdata/inventory'" in context['testdata_imports']

        # Verify beforeeach_code was generated
        assert 'beforeeach_code' in context
        assert 'test.beforeEach' in context['beforeeach_code']
        assert 'inventoryTestData_user_normal' in context['beforeeach_code']
        assert 'inventoryTestData_order_data' in context['beforeeach_code']

        # Verify testdata_todos were generated
        assert 'testdata_todos' in context
        assert len(context['testdata_todos']) == 1

    def test_extract_testdata_from_complex_scenario(self):
        """Should extract testdata refs from all parts of scenario"""
        scenario = {
            'preconditions': {
                'testdata_ref': 'bomTestData.base'
            },
            'steps': [
                {
                    'action': 'login',
                    'params': {
                        'testdata_ref': 'inventoryTestData.user_normal'
                    }
                },
                {
                    'action': 'browse',
                    'params': {
                        'testdata_ref': 'inventoryTestData.product_with_bom'
                    }
                }
            ],
            'assertions': [
                {
                    'type': 'api',
                    'check': 'database_equals',
                    'params': {
                        'testdata_ref': 'inventoryTestData.order_data'
                    }
                }
            ]
        }

        refs = testdata_parser.extract_testdata_refs_from_scenario(scenario)

        assert len(refs) == 4
        assert 'bomTestData.base' in refs
        assert 'inventoryTestData.user_normal' in refs
        assert 'inventoryTestData.product_with_bom' in refs
        assert 'inventoryTestData.order_data' in refs

    def test_beforeeach_code_structure(self):
        """Should generate properly structured beforeEach code"""
        refs = {
            'inventoryTestData.user_normal',
            'bomTestData.scenario_001'
        }

        code = testdata_parser.generate_beforeeach_code(refs)

        # Verify structure
        assert 'test.beforeEach(async ({ page }) => {' in code
        assert '// Load test data' in code
        assert '// Load bomTestData' in code
        assert '// Load inventoryTestData' in code
        assert 'const bomTestData_scenario_001 = bomTestData.scenario_001;' in code
        assert 'const inventoryTestData_user_normal = inventoryTestData.user_normal;' in code
        assert '});' in code

    def test_testdata_imports_generation(self):
        """Should generate correct import statements"""
        refs = {
            'inventoryTestData.user_normal',
            'bomTestData.scenario_001',
            'orderTestData.payment'
        }

        imports = testdata_parser.generate_testdata_imports(refs)

        assert len(imports) == 3
        assert "import { bomTestData } from '@/testdata/bom'" in imports
        assert "import { inventoryTestData } from '@/testdata/inventory'" in imports
        assert "import { orderTestData } from '@/testdata/order'" in imports

    def test_testdata_todos_for_missing_modules(self):
        """Should generate TODO comments for missing modules"""
        refs = {
            'inventoryTestData.user_normal',
            'newModuleTestData.data'
        }
        available = {'inventoryTestData'}

        todos = testdata_parser.generate_testdata_todos(refs, available)

        # Should only have TODO for newModuleTestData
        assert len(todos) == 1
        assert 'newModuleTestData' in todos[0]
        assert 'testdata/new-module.ts' in todos[0]


class TestBeforeeachCodeGeneration:
    """Test beforeEach hook code generation"""

    def test_no_testdata_refs(self):
        """Should return empty string when no testdata refs"""
        code = testdata_parser.generate_beforeeach_code(set())
        assert code == ""

    def test_single_testdata_ref(self):
        """Should generate beforeEach with single ref"""
        refs = {'testData.user'}

        code = testdata_parser.generate_beforeeach_code(refs)

        assert 'test.beforeEach' in code
        assert 'testData_user = testData.user' in code

    def test_multiple_testdata_refs_same_module(self):
        """Should group refs from same module"""
        refs = {
            'inventoryTestData.user_normal',
            'inventoryTestData.product_with_bom'
        }

        code = testdata_parser.generate_beforeeach_code(refs)

        assert code.count('// Load inventoryTestData') == 1
        assert 'inventoryTestData_user_normal' in code
        assert 'inventoryTestData_product_with_bom' in code

    def test_multiple_testdata_refs_different_modules(self):
        """Should separate refs by module"""
        refs = {
            'inventoryTestData.user_normal',
            'bomTestData.scenario_001'
        }

        code = testdata_parser.generate_beforeeach_code(refs)

        assert '// Load inventoryTestData' in code
        assert '// Load bomTestData' in code
        assert 'inventoryTestData_user_normal' in code
        assert 'bomTestData_scenario_001' in code

    def test_nested_testdata_keys(self):
        """Should handle nested keys correctly"""
        refs = {'testData.nested.deep.key'}

        code = testdata_parser.generate_beforeeach_code(refs)

        # Variable name should use underscores
        assert 'testData_nested_deep_key' in code
        # Access should use dots
        assert 'testData.nested.deep.key' in code

# @spec T002-e2e-test-generator
"""
Unit tests for testdata_parser module
"""

import pytest
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

import testdata_parser


class TestExtractTestdataRefsFromScenario:
    """Test extract_testdata_refs_from_scenario function"""

    def test_extract_from_preconditions(self):
        """Should extract testdata_ref from preconditions"""
        scenario = {
            'preconditions': {
                'testdata_ref': 'bomTestData.base'
            },
            'steps': [],
            'assertions': []
        }

        result = testdata_parser.extract_testdata_refs_from_scenario(scenario)

        assert 'bomTestData.base' in result
        assert len(result) == 1

    def test_extract_from_steps(self):
        """Should extract testdata_ref from step params"""
        scenario = {
            'preconditions': {},
            'steps': [
                {
                    'action': 'login',
                    'params': {
                        'testdata_ref': 'inventoryTestData.user_normal'
                    }
                },
                {
                    'action': 'browse_product',
                    'params': {
                        'testdata_ref': 'inventoryTestData.product_with_bom'
                    }
                }
            ],
            'assertions': []
        }

        result = testdata_parser.extract_testdata_refs_from_scenario(scenario)

        assert 'inventoryTestData.user_normal' in result
        assert 'inventoryTestData.product_with_bom' in result
        assert len(result) == 2

    def test_extract_from_assertions(self):
        """Should extract testdata_ref from assertion params"""
        scenario = {
            'preconditions': {},
            'steps': [],
            'assertions': [
                {
                    'type': 'api',
                    'check': 'database_field_equals',
                    'params': {
                        'testdata_ref': 'inventoryTestData.order_data'
                    }
                }
            ]
        }

        result = testdata_parser.extract_testdata_refs_from_scenario(scenario)

        assert 'inventoryTestData.order_data' in result
        assert len(result) == 1

    def test_extract_all_refs(self):
        """Should extract all testdata_ref from preconditions, steps, and assertions"""
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
                }
            ],
            'assertions': [
                {
                    'type': 'api',
                    'check': 'database_field_equals',
                    'params': {
                        'testdata_ref': 'inventoryTestData.order_data'
                    }
                }
            ]
        }

        result = testdata_parser.extract_testdata_refs_from_scenario(scenario)

        assert len(result) == 3
        assert 'bomTestData.base' in result
        assert 'inventoryTestData.user_normal' in result
        assert 'inventoryTestData.order_data' in result

    def test_no_testdata_refs(self):
        """Should return empty set if no testdata_ref found"""
        scenario = {
            'preconditions': {},
            'steps': [
                {
                    'action': 'click',
                    'params': {
                        'selector': '#button'
                    }
                }
            ],
            'assertions': []
        }

        result = testdata_parser.extract_testdata_refs_from_scenario(scenario)

        assert len(result) == 0

    def test_duplicate_refs(self):
        """Should deduplicate testdata_ref values"""
        scenario = {
            'steps': [
                {
                    'action': 'login',
                    'params': {
                        'testdata_ref': 'inventoryTestData.user_normal'
                    }
                },
                {
                    'action': 'verify',
                    'params': {
                        'testdata_ref': 'inventoryTestData.user_normal'
                    }
                }
            ],
            'assertions': []
        }

        result = testdata_parser.extract_testdata_refs_from_scenario(scenario)

        assert len(result) == 1
        assert 'inventoryTestData.user_normal' in result


class TestParseTestdataRef:
    """Test parse_testdata_ref function"""

    def test_parse_valid_ref(self):
        """Should parse valid testdata_ref into module and key"""
        result = testdata_parser.parse_testdata_ref('inventoryTestData.user_normal')

        assert result['module'] == 'inventoryTestData'
        assert result['key'] == 'user_normal'

    def test_parse_nested_key(self):
        """Should support nested keys with multiple dots"""
        result = testdata_parser.parse_testdata_ref('bomTestData.scenario_001.user')

        assert result['module'] == 'bomTestData'
        assert result['key'] == 'scenario_001.user'

    def test_parse_invalid_ref_no_dot(self):
        """Should raise error if ref has no dot"""
        with pytest.raises(testdata_parser.TestDataParseError, match="must be in format"):
            testdata_parser.parse_testdata_ref('invalidref')

    def test_parse_empty_ref(self):
        """Should raise error if ref is empty"""
        with pytest.raises(testdata_parser.TestDataParseError, match="Invalid testdata_ref"):
            testdata_parser.parse_testdata_ref('')

    def test_parse_none_ref(self):
        """Should raise error if ref is None"""
        with pytest.raises(testdata_parser.TestDataParseError, match="Invalid testdata_ref"):
            testdata_parser.parse_testdata_ref(None)


class TestGroupRefsByModule:
    """Test group_refs_by_module function"""

    def test_group_single_module(self):
        """Should group refs from single module"""
        refs = {'inventoryTestData.user_normal', 'inventoryTestData.product_with_bom'}

        result = testdata_parser.group_refs_by_module(refs)

        assert 'inventoryTestData' in result
        assert 'user_normal' in result['inventoryTestData']
        assert 'product_with_bom' in result['inventoryTestData']
        assert len(result['inventoryTestData']) == 2

    def test_group_multiple_modules(self):
        """Should group refs from multiple modules"""
        refs = {
            'inventoryTestData.user_normal',
            'bomTestData.scenario_001',
            'inventoryTestData.product_with_bom'
        }

        result = testdata_parser.group_refs_by_module(refs)

        assert len(result) == 2
        assert 'inventoryTestData' in result
        assert 'bomTestData' in result
        assert len(result['inventoryTestData']) == 2
        assert len(result['bomTestData']) == 1

    def test_group_empty_refs(self):
        """Should return empty dict for empty refs"""
        result = testdata_parser.group_refs_by_module(set())

        assert result == {}

    def test_group_skip_invalid_refs(self):
        """Should skip invalid refs without error"""
        refs = {
            'inventoryTestData.user_normal',
            'invalidref',
            'bomTestData.scenario_001'
        }

        result = testdata_parser.group_refs_by_module(refs)

        assert len(result) == 2
        assert 'invalidref' not in result


class TestGenerateTestdataImports:
    """Test generate_testdata_imports function"""

    def test_generate_single_import(self):
        """Should generate import statement for single module"""
        refs = {'inventoryTestData.user_normal'}

        result = testdata_parser.generate_testdata_imports(refs)

        assert len(result) == 1
        assert "import { inventoryTestData } from '@/testdata/inventory'" in result

    def test_generate_multiple_imports(self):
        """Should generate import statements for multiple modules"""
        refs = {
            'inventoryTestData.user_normal',
            'bomTestData.scenario_001'
        }

        result = testdata_parser.generate_testdata_imports(refs)

        assert len(result) == 2
        assert "import { inventoryTestData } from '@/testdata/inventory'" in result
        assert "import { bomTestData } from '@/testdata/bom'" in result

    def test_generate_imports_sorted(self):
        """Should sort imports alphabetically"""
        refs = {
            'zebra TestData.data',
            'alphaTestData.data',
            'bomTestData.data'
        }

        result = testdata_parser.generate_testdata_imports(refs)

        assert result[0].startswith("import { alphaTestData }")
        assert result[1].startswith("import { bomTestData }")

    def test_generate_imports_deduplicate(self):
        """Should deduplicate imports from same module"""
        refs = {
            'inventoryTestData.user_normal',
            'inventoryTestData.product_with_bom'
        }

        result = testdata_parser.generate_testdata_imports(refs)

        assert len(result) == 1


class TestGenerateBeforeeachCode:
    """Test generate_beforeeach_code function"""

    def test_generate_with_single_ref(self):
        """Should generate beforeEach code with single testdata ref"""
        refs = {'inventoryTestData.user_normal'}

        result = testdata_parser.generate_beforeeach_code(refs)

        assert 'test.beforeEach(async ({ page }) => {' in result
        assert 'inventoryTestData_user_normal' in result
        assert 'inventoryTestData.user_normal' in result
        assert '});' in result

    def test_generate_with_multiple_refs(self):
        """Should generate beforeEach code with multiple refs"""
        refs = {
            'inventoryTestData.user_normal',
            'inventoryTestData.product_with_bom'
        }

        result = testdata_parser.generate_beforeeach_code(refs)

        assert 'inventoryTestData_user_normal' in result
        assert 'inventoryTestData_product_with_bom' in result

    def test_generate_with_no_refs(self):
        """Should return empty string if no refs"""
        result = testdata_parser.generate_beforeeach_code(set())

        assert result == ""

    def test_generate_with_nested_keys(self):
        """Should replace dots with underscores in nested keys"""
        refs = {'bomTestData.scenario_001.user'}

        result = testdata_parser.generate_beforeeach_code(refs)

        assert 'bomTestData_scenario_001_user' in result
        assert 'bomTestData.scenario_001.user' in result


class TestGenerateTestdataTodos:
    """Test generate_testdata_todos function"""

    def test_generate_todo_for_missing_module(self):
        """Should generate TODO comment for missing module"""
        refs = {'inventoryTestData.user_normal'}
        available = set()

        result = testdata_parser.generate_testdata_todos(refs, available)

        assert len(result) == 1
        assert "TODO: Create test data module 'inventoryTestData'" in result[0]
        assert 'testdata/inventory.ts' in result[0]

    def test_no_todo_for_available_module(self):
        """Should not generate TODO if module is available"""
        refs = {'inventoryTestData.user_normal'}
        available = {'inventoryTestData'}

        result = testdata_parser.generate_testdata_todos(refs, available)

        assert len(result) == 0

    def test_generate_todo_for_invalid_ref(self):
        """Should generate TODO for invalid ref format"""
        refs = {'invalidref'}

        result = testdata_parser.generate_testdata_todos(refs)

        assert len(result) == 1
        assert 'TODO: Fix invalid testdata_ref' in result[0]


class TestCamelToKebab:
    """Test _camel_to_kebab helper function"""

    def test_convert_camel_to_kebab(self):
        """Should convert camelCase to kebab-case"""
        assert testdata_parser._camel_to_kebab('inventory') == 'inventory'
        assert testdata_parser._camel_to_kebab('inventoryTest') == 'inventory-test'
        assert testdata_parser._camel_to_kebab('bomTestData') == 'bom-test-data'

    def test_convert_single_word(self):
        """Should handle single word"""
        assert testdata_parser._camel_to_kebab('bom') == 'bom'

    def test_convert_already_lowercase(self):
        """Should handle already lowercase"""
        assert testdata_parser._camel_to_kebab('test') == 'test'

# E2E Test Script Generator

**@spec T002-e2e-test-generator**

Automated E2E test script generator that converts scenario YAML files into executable test scripts.

## Implementation Status

### ✅ Completed (MVP - Phase 1 & 2 & US1)

**Phase 1: Initialization**
- ✅ Skill directory structure created
- ✅ skill.md documentation complete
- ✅ Python requirements.txt with all dependencies
- ✅ pytest configuration
- ✅ .gitignore for Python artifacts

**Phase 2: Infrastructure** (Critical blocking phase)
- ✅ YAML parser module (yaml_parser.py)
- ✅ E2EScenarioSpec schema validator (schema_validator.py)
- ✅ Action mappings template (20+ common actions)
- ✅ Assertion mappings template (25+ assertion types)
- ✅ Configuration loader with validation (config_loader.py)
- ✅ Jinja2 template renderer (template_renderer.py)
- ✅ File hash utilities for change detection (file_utils.py)
- ✅ Test fixtures and sample scenarios

**User Story 1: Playwright Test Generation** (MVP Core)
- ✅ Playwright test template (Jinja2)
- ✅ Playwright code generator (generate_playwright.py)
- ✅ Step transformation logic (action → code)
- ✅ Assertion transformation logic (assertion → expect())
- ✅ Import statement generation
- ✅ @spec attribution for all generated code
- ✅ CLI command handler with `generate` command

### ⏳ Pending (P2 & P3 Features)

**User Story 2: Test Data Loading** (P1 - Not implemented in this session)
- Test data reference parser
- beforeEach hook generation
- Import statements for test data loader

**User Story 3: Batch Generation** (P2)
- Directory scanner
- Batch processor
- Progress reporting

**User Story 4: Page Object Generation** (P2)
- Page object detector
- Template generator for missing page objects

**User Story 5: Smart Update** (P3)
- File modification detection
- Custom code preservation
- Intelligent merge logic

**User Story 6: Multi-Framework Support** (P2)
- Postman Collection generator
- REST Client .http generator
- Framework auto-detection

**Validation & Testing** (P2)
- TypeScript syntax validation
- Playwright dry-run validation
- Unit tests (pytest) - Not implemented
- Integration tests - Not implemented

## Usage

### Generate Playwright Test

```bash
# From project root
python .claude/skills/e2e-test-generator/scripts/cli.py generate E2E-INVENTORY-001
```

**Expected Output**:
```
🚀 Generating playwright test for scenario: E2E-INVENTORY-001
✅ Successfully generated scenarios/inventory/E2E-INVENTORY-001.spec.ts
📁 Output: scenarios/inventory/E2E-INVENTORY-001.spec.ts
```

### Test with Sample Scenarios

```bash
# Use the provided test fixtures
python .claude/skills/e2e-test-generator/scripts/cli.py generate E2E-INVENTORY-001 --test-mode
python .claude/skills/e2e-test-generator/scripts/cli.py generate E2E-ORDER-001 --test-mode
```

## Project Structure

```
.claude/skills/e2e-test-generator/
├── README.md                   # This file
├── skill.md                    # Skill documentation
├── requirements.txt            # Python dependencies
├── pytest.ini                  # pytest configuration
├── .gitignore                  # Python artifacts
├── scripts/                    # Python modules
│   ├── cli.py                  # CLI command handler ✅
│   ├── yaml_parser.py          # YAML parsing ✅
│   ├── schema_validator.py     # Schema validation ✅
│   ├── config_loader.py        # Configuration loading ✅
│   ├── template_renderer.py    # Jinja2 rendering ✅
│   ├── file_utils.py           # File utilities ✅
│   └── generate_playwright.py  # Playwright generator ✅
├── assets/templates/           # Templates & configs
│   ├── playwright-test-template.ts.j2    ✅
│   ├── action-mappings.yaml              ✅
│   └── assertion-mappings.yaml           ✅
├── tests/                      # Test files
│   └── fixtures/               # Test fixtures
│       └── sample_scenarios/   # Sample YAML files ✅
│           ├── E2E-INVENTORY-001.yaml
│           └── E2E-ORDER-001.yaml
└── metadata/                   # Generated file metadata
```

## Dependencies

```txt
PyYAML>=6.0.2           # YAML parsing
Jinja2>=3.1.4           # Template engine
jsonschema>=4.23.0      # Schema validation
pytest>=8.3.4           # Testing (for future unit tests)
black>=24.10.0          # Code formatter
pylint>=3.3.2           # Linter
mypy>=1.13.0            # Type checker
```

## Architecture

### Data Flow

```
Scenario YAML
    ↓
YAML Parser → Validate Schema
    ↓
Load Action/Assertion Mappings
    ↓
Generate Code (Jinja2 Templates)
    ↓
Add @spec Attribution
    ↓
Write to File + Store Metadata
```

### Code Generation Process

1. **Parse**: Read and validate scenario YAML
2. **Transform**: Convert actions/assertions to code using mappings
3. **Render**: Apply Jinja2 template with context
4. **Augment**: Add @spec attribution and code markers
5. **Save**: Write to file with metadata tracking

## Action Mappings (20+ Defined)

- Authentication: `login`, `logout`
- Navigation: `navigate`, `click`
- Input: `input`, `select`, `upload_file`
- Product: `browse_product`, `add_to_cart`, `checkout`
- Order: `create_order`, `cancel_order`
- Inventory: `create_adjustment`, `approve_adjustment`, `query_inventory`
- Wait: `wait`, `wait_for_element`
- API: `send_api_request`
- Database: `query_database`, `verify_database` (TODO)

## Assertion Mappings (25+ Defined)

- **UI**: `element_visible`, `element_hidden`, `element_has_text`, `toast_message_shown`, `page_url_contains`
- **API**: `response_status_is`, `response_field_equals`, `response_header_contains`
- **Database**: `database_field_equals`, `database_count_equals` (TODO)
- **State**: `local_storage_contains`, `cookie_exists`
- **File**: `file_downloaded` (TODO)

## Generated Code Format

```typescript
// @spec T002-e2e-test-generator
// AUTO-GENERATED: Do not modify above this line
// Generated from: scenarios/inventory/E2E-INVENTORY-001.yaml

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { loadTestData } from '@/testdata/loader';

test.describe('库存调整审批流程', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    testData = await loadTestData('inventoryTestData.scenario_001');
    await page.goto(testData.baseUrl);
  });

  test('E2E-INVENTORY-001', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Steps
    await loginPage.login(testData);
    await page.goto(testData.inventoryTestData.adjustment_page);
    await inventoryPage.createAdjustment(testData.inventoryTestData.adjustment_data);

    // Assertions
    await expect(page.locator('.success-message')).toBeVisible();
    expect(response.status()).toBe(200);

    // CUSTOM CODE START
    // Add your custom test logic here
    // CUSTOM CODE END
  });
});
```

## Known Limitations (MVP)

1. **No Unit Tests**: pytest tests not implemented (planned for next iteration)
2. **No Test Data Generation**: beforeEach hooks incomplete (US2 pending)
3. **No Batch Processing**: Single scenario only (US3 pending)
4. **No Smart Update**: File modification detection incomplete (US5 pending)
5. **Playwright Only**: Postman/REST Client not implemented (US6 pending)
6. **No Validation**: TypeScript syntax/dry-run checks not implemented
7. **Manual Page Objects**: Page object templates not auto-generated (US4 pending)

## Next Steps

1. **Implement Unit Tests** (TDD requirement - 100% coverage for core logic)
2. **Complete User Story 2**: Test data loading integration
3. **Add Validation Command**: TypeScript syntax and Playwright dry-run checks
4. **Implement Page Object Generation** (US4)
5. **Add Batch Processing** (US3)
6. **Smart Update with Custom Code Preservation** (US5)
7. **Multi-Framework Support**: Postman + REST Client (US6)

## References

- Specification: `/specs/T002-e2e-test-generator/spec.md`
- Tasks: `/specs/T002-e2e-test-generator/tasks.md`
- Data Model: `/specs/T002-e2e-test-generator/data-model.md`
- Quick Start: `/specs/T002-e2e-test-generator/quickstart.md`

---

**Implementation Date**: 2025-12-30
**Status**: MVP Complete (Phase 1, 2, US1)
**Next Priority**: Unit Tests + User Story 2

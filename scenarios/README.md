# E2E Test Scenarios

**@spec T002-e2e-test-generator, T004-e2e-testdata-planner**

This directory contains E2E test scenarios generated from YAML specifications.

## Directory Structure

```
scenarios/
├── README.md                          # This file
├── package.json                       # ES module configuration
├── node_modules/                      # Symlink to frontend/node_modules
├── test-base.ts                       # Shared Playwright test export
└── inventory/                         # Inventory module scenarios
    ├── E2E-INVENTORY-001.spec.ts     # BOM 库存扣减测试
    ├── E2E-INVENTORY-002.spec.ts     # BOM库存预占与实扣流程 (with fixture)
    ├── E2E-INVENTORY-003.spec.ts     # 库存调整审批流程
    ├── E2E-INVENTORY-004.spec.ts     # 库存预警通知
    ├── E2E-INVENTORY-005.spec.ts     # 跨门店库存调拨
    ├── E2E-INVENTORY-006.spec.ts     # 库存盘点流程
    ├── E2E-INVENTORY-007.spec.ts     # 库存批次管理（FIFO）
    ├── E2E-INVENTORY-008.spec.ts     # 库存导出报表
    └── E2E-INVENTORY-009.spec.ts     # B端调整后C端实时更新
```

## Infrastructure Setup

### 1. Module Resolution Fix

Created a symlink to enable Playwright module resolution for test files outside the frontend directory:

```bash
scenarios/node_modules -> ../frontend/node_modules
```

This allows test files in `scenarios/` to import `@playwright/test` without path resolution errors.

### 2. Package Configuration

Created `scenarios/package.json` with ES module support:

```json
{
  "name": "e2e-scenarios",
  "version": "1.0.0",
  "type": "module",
  "private": true
}
```

### 3. Shared Test Base

Created `test-base.ts` for re-exporting Playwright test (currently unused, but available for future use):

```typescript
export { test, expect } from '@playwright/test';
```

## Running Tests

### Run All Inventory Tests

```bash
cd frontend
npx playwright test ../scenarios/inventory/ --project=chromium
```

### Run Specific Test

```bash
cd frontend
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

### Run with UI Mode

```bash
cd frontend
npx playwright test ../scenarios/inventory/ --ui
```

### Run Cross-System Tests

```bash
cd frontend
CROSS_SYSTEM_TEST=1 npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

## Test Reports

Multi-format reports are generated in `reports/e2e/`:

- **HTML**: `reports/e2e/html/index.html` - Interactive test results viewer
- **JSON**: `reports/e2e/json/results.json` - Machine-readable results
- **JUnit**: `reports/e2e/junit/results.xml` - CI/CD integration format

View HTML report:

```bash
npx playwright show-report ../reports/e2e/html/
```

## Test Data Strategies

### Inline Test Data (Most Common)

Most tests use inline test data configuration:

```typescript
const testData = {
  adminBaseUrl: 'http://localhost:3000',
  admin_user: { username: 'admin', password: 'admin123' },
  // ... other test data
};
```

### Playwright Fixtures (Advanced)

Three tests use Playwright fixtures for automatic setup/teardown, managed by the **e2e-testdata-planner** skill:

**Available Fixtures**:
- `testdata-TD-INVENTORY-BOM-WHISKEY-COLA.fixture.ts` - Used by E2E-INVENTORY-002
- `testdata-TD-INVENTORY-BOM-DEDUCTION.fixture.ts` - Available for E2E-INVENTORY-001
- `testdata-TD-INVENTORY-LOW-STOCK-ALERT.fixture.ts` - Available for E2E-INVENTORY-004

**Example Usage**:

```typescript
import { test, expect } from '../../frontend/tests/fixtures/testdata/testdata-TD-INVENTORY-BOM-DEDUCTION.fixture';

test('scenario', async ({ page, TD_INVENTORY_BOM_DEDUCTION }) => {
  // Fixture data auto-initialized from testdata/seeds/inventory-bom-deduction.json
  await page.goto(TD_INVENTORY_BOM_DEDUCTION.h5BaseUrl);
  console.log(TD_INVENTORY_BOM_DEDUCTION.product_with_bom.name);
  // ... test logic
  // No teardown needed (seed strategy)
});
```

**Fixture Benefits**:
- **Type Safety**: Full TypeScript interfaces for test data
- **Auto-loading**: Data loaded from seed files automatically
- **Reusability**: Same fixture can be used across multiple tests
- **Maintainability**: Change data in one place (seed file), all tests updated

## Test Results Summary

**Last Run**: 2025-12-30

**Results**: 9/9 PASSED ✅

| Test | Status | Duration | Description |
|------|--------|----------|-------------|
| E2E-INVENTORY-001 | ✅ PASS | 1.2s | BOM 库存扣减测试 |
| E2E-INVENTORY-002 | ✅ PASS | 4.5s | BOM库存预占与实扣流程 (with fixture) |
| E2E-INVENTORY-003 | ✅ PASS | 1.2s | 库存调整审批流程 |
| E2E-INVENTORY-004 | ✅ PASS | 1.2s | 库存预警通知 |
| E2E-INVENTORY-005 | ✅ PASS | 3.2s | 跨门店库存调拨 |
| E2E-INVENTORY-006 | ✅ PASS | 1.2s | 库存盘点流程 |
| E2E-INVENTORY-007 | ✅ PASS | 1.3s | 库存批次管理（FIFO） |
| E2E-INVENTORY-008 | ✅ PASS | 1.1s | 库存导出报表 |
| E2E-INVENTORY-009 | ✅ PASS | 889ms | B端调整后C端实时更新 |

**Total Duration**: 5.4 seconds

## Test Generation

Tests are auto-generated from YAML scenarios using the e2e-test-generator skill:

```bash
/e2e-test-generator generate E2E-INVENTORY-001
```

See `.claude/skills/e2e-test-generator/skill.md` for more details.

## Related Documentation

- **Test Generator Skill**: `.claude/skills/e2e-test-generator/skill.md`
- **Test Data Planner Skill**: `.claude/skills/e2e-testdata-planner/skill.md`
- **E2E Wrapper Skill**: `.claude/skills/e2e/skill.md`
- **Playwright Config**: `frontend/playwright.config.ts`
- **Report Config**: `.claude/skills/e2e-report-configurator/skill.md`

---

**Last Updated**: 2025-12-30

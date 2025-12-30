# E2E Test Data Management

**@spec T004-e2e-testdata-planner**

This directory contains test data blueprints, seed files, and related artifacts for E2E testing.

## Directory Structure

```
testdata/
├── README.md                                  # This file
├── blueprints/                               # Test data blueprints (YAML)
│   ├── inventory-bom-deduction.blueprint.yaml
│   ├── inventory-low-stock-alert.blueprint.yaml
│   └── inventory-bom-whiskey-cola.blueprint.yaml
└── seeds/                                    # Seed data files (JSON)
    ├── inventory-bom-deduction.json
    ├── inventory-low-stock-alert.json
    └── inventory-bom-whiskey-cola.json
```

## Test Data Blueprints

Blueprints define the contract and loading strategy for test data. They are managed by the **e2e-testdata-planner** skill.

### Available Blueprints

| Blueprint ID | Description | Strategy | Fixture | Used By |
|--------------|-------------|----------|---------|---------|
| TD-INVENTORY-BOM-DEDUCTION | BOM库存扣减测试数据 | seed | ✅ | E2E-INVENTORY-001 |
| TD-INVENTORY-LOW-STOCK-ALERT | 库存预警通知测试数据 | seed | ✅ | E2E-INVENTORY-004 |
| TD-INVENTORY-BOM-WHISKEY-COLA | BOM库存预占与实扣测试数据 | seed | ✅ | E2E-INVENTORY-002 |

### Blueprint Format

```yaml
# testdata/blueprints/example.blueprint.yaml
id: TD-EXAMPLE-001
description: "Example test data blueprint"
version: "1.0.0"

strategy:
  type: seed                    # seed | api | db-script
  seedFilePath: testdata/seeds/example.json
  seedKey: "example-scenario"

outputSchema:
  field1: string
  field2: number

scope: test                     # test | worker | global
teardown: false                 # true if cleanup needed
timeout: 10000
environments: [local, staging, production]
```

## Seed Data Files

Seed files contain static test data in JSON format. They follow a key-based structure for easy lookup.

### Seed File Format

```json
[
  {
    "key": "scenario-key",
    "field1": "value1",
    "field2": 123,
    "nested": {
      "field3": "value3"
    }
  }
]
```

### Available Seed Files

#### 1. inventory-bom-deduction.json

**Purpose**: BOM deduction test data for cocktail order scenario

**Data Structure**:
```json
{
  "h5BaseUrl": "http://localhost:10086",
  "user_normal": { "phone", "verifyCode" },
  "product_with_bom": { "id", "name", "price" },
  "bom_materials": [
    { "skuId", "skuName", "initial_stock", "required_quantity", "unit" }
  ],
  "order_data": { "product_id", "quantity", "total_price" },
  "payment_wechat": { "method", "amount" }
}
```

**Used By**: E2E-INVENTORY-001

#### 2. inventory-low-stock-alert.json

**Purpose**: Low stock alert test data for inventory warning scenario

**Data Structure**:
```json
{
  "adminBaseUrl": "http://localhost:3000",
  "manager_user": { "username", "password", "email" },
  "safety_stock_config": { "sku_id", "safety_stock_threshold", "warning_threshold" },
  "product_sku": { "id", "name", "initial_stock", "current_stock", "unit" },
  "alert_notification": { "type", "severity", "sku_id", "sku_name", "current_stock", "safety_threshold", "recommended_restock" },
  "manager_email": { "to", "subject", "body_contains" }
}
```

**Used By**: E2E-INVENTORY-004

#### 3. inventory-bom-whiskey-cola.json

**Purpose**: BOM inventory reservation and actual deduction test data

**Used By**: E2E-INVENTORY-002

## Playwright Fixtures

Generated fixtures are located in `frontend/tests/fixtures/testdata/`:

- `testdata-TD-INVENTORY-BOM-DEDUCTION.fixture.ts`
- `testdata-TD-INVENTORY-LOW-STOCK-ALERT.fixture.ts`
- `testdata-TD-INVENTORY-BOM-WHISKEY-COLA.fixture.ts`

### Using Fixtures in Tests

```typescript
import { test, expect } from '../../frontend/tests/fixtures/testdata/testdata-TD-INVENTORY-BOM-DEDUCTION.fixture';

test('BOM deduction test', async ({ page, TD_INVENTORY_BOM_DEDUCTION }) => {
  // Data is automatically loaded from seed file
  await page.goto(TD_INVENTORY_BOM_DEDUCTION.h5BaseUrl);

  // Full TypeScript type safety
  const product = TD_INVENTORY_BOM_DEDUCTION.product_with_bom;
  console.log(product.name); // "威士忌可乐鸡尾酒"

  // No manual cleanup needed (seed strategy)
});
```

## Managing Test Data

### Create New Blueprint

Use the e2e-testdata-planner skill:

```bash
/testdata-planner create
```

Follow the interactive prompts to define:
1. Blueprint ID (TD-<ENTITY>-<ID>)
2. Description
3. Strategy (seed / api / db-script)
4. Data schema
5. Fixture scope

### Generate Fixture from Blueprint

```bash
/testdata-planner generate TD-EXAMPLE-001 --output frontend/tests/fixtures/testdata
```

### Validate All Blueprints

```bash
/testdata-planner validate
```

Checks for:
- ✅ YAML syntax errors
- ✅ Missing required fields
- ✅ Circular dependencies
- ✅ Missing seed files
- ✅ Invalid data references

### Diagnose Data Loading Issues

```bash
/testdata-planner diagnose TD-EXAMPLE-001 --verbose
```

## Data Strategy Comparison

| Strategy | When to Use | Pros | Cons |
|----------|-------------|------|------|
| **seed** | Static, fixed test data (users, configs) | Fast, no network required | Can't test dynamic behavior |
| **api** | Real API calls (orders, bookings) | High fidelity, tests API | Requires backend running |
| **db-script** | Large datasets, complex relationships | Efficient, flexible | Needs database access |

## Best Practices

### 1. Blueprint Naming

- **Format**: `TD-<ENTITY>-<DESCRIPTIVE-NAME>`
- **Examples**: `TD-ORDER-COCKTAIL`, `TD-USER-ADMIN`, `TD-INVENTORY-LOW-STOCK`

### 2. Seed Data Organization

- Group related scenarios in same seed file
- Use descriptive `key` values
- Keep data realistic but minimal
- Document non-obvious data relationships

### 3. Fixture Scope Selection

| Scope | Use Case | Example |
|-------|----------|---------|
| **test** | Data needs isolation between tests | Orders, transactions |
| **worker** | Data shared within worker process | Users, stores |
| **global** | Data shared across all tests | System configs |

### 4. Maintenance

- ✅ Keep blueprints in sync with seed data
- ✅ Validate blueprints after changes (`/testdata-planner validate`)
- ✅ Regenerate fixtures when blueprints change
- ✅ Use version control for blueprint/seed files
- ❌ Don't manually edit generated fixtures

## Troubleshooting

### Fixture Not Loading Data

**Problem**: Fixture throws "Seed key not found" error

**Solution**:
1. Check seed file path in blueprint
2. Verify `seedKey` matches `key` in seed file
3. Ensure seed file is valid JSON

### Type Errors in Tests

**Problem**: TypeScript complains about fixture data types

**Solution**:
1. Regenerate fixture: `/testdata-planner generate TD-EXAMPLE-001`
2. Check `outputSchema` in blueprint matches actual seed data
3. Restart TypeScript language server in IDE

### Data Not Updated in Test

**Problem**: Test uses old data even after changing seed file

**Solution**:
- Seed data is loaded fresh each test run
- Clear Playwright cache: `rm -rf frontend/test-results frontend/playwright-report`
- Check you're not using inline data instead of fixture

## Related Documentation

- **e2e-testdata-planner Skill**: `.claude/skills/e2e-testdata-planner/skill.md`
- **Specification**: `specs/T004-e2e-testdata-planner/spec.md`
- **Test Scenarios**: `scenarios/README.md`
- **Playwright Docs**: https://playwright.dev/docs/test-fixtures

---

**Last Updated**: 2025-12-30
**Managed By**: e2e-testdata-planner skill (T004)

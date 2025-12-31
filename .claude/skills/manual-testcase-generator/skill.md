---
name: manual-testcase-generator
description: Generate manual test verification documents from YAML. Converts manual test case YAML (TC-*.yaml) and E2E scenario YAML (E2E-*.yaml) to human-readable Markdown operation guides. Supports single file and batch generation. Trigger keywords manual testcase, generate doc, markdown, 人工测试, 测试文档, 验证文档, 生成文档.
version: 1.0.0
---

# manual-testcase-generator

**@spec T007-e2e-test-management**

Generate manual test verification documents from YAML sources. This skill converts structured test case definitions into human-readable Markdown documents for QA engineers.

## Description

The `manual-testcase-generator` skill produces read-only Markdown operation guides from two types of YAML sources:

1. **Manual Test Case YAML** (`testcases/<module>/TC-*.yaml`)
   - Contains complete human-readable test steps
   - Outputs to `testcases/<module>/docs/TC-*.md`

2. **E2E Scenario YAML** (`scenarios/<module>/E2E-*.yaml`)
   - Extracts metadata and step descriptions ONLY
   - Excludes technical details (CSS selectors, locators)
   - Outputs to `scenarios/<module>/docs/E2E-*.md`

**Key Principle**: YAML is the single source of truth. Markdown is a derived, read-only presentation layer.

## Usage

### Generate from Manual Test Case YAML

```bash
# Single test case
/e2e testcase generate-doc TC-ORDER-001

# Batch generate for module
/e2e testcase generate-doc --module order

# All modules
/e2e testcase generate-doc --all
```

**Input**: `testcases/order/TC-ORDER-001.yaml`
**Output**: `testcases/order/docs/TC-ORDER-001.md`

### Generate from E2E Scenario YAML

```bash
# Single scenario
/e2e scenario generate-doc E2E-ORDER-001

# Batch generate for module
/e2e scenario generate-doc --module order
```

**Input**: `scenarios/order/E2E-ORDER-001.yaml`
**Output**: `scenarios/order/docs/E2E-ORDER-001.md`

## Input Schemas

### Manual Test Case YAML (TC-*.yaml)

```yaml
testcase_id: TC-ORDER-001
title: 验证用户能够成功创建饮品订单并完成支付
module: order
feature: 饮品订单创建
priority: P0  # P0/P1/P2

preconditions:
  account: 已登录的普通用户账号
  permissions: 普通用户权限
  environment: staging
  dependencies:
    - 门店已开业
    - 商品已上架

test_data:
  testdata_ref: orderTestData.beverage_order_001  # Reference to testdata-planner

steps:
  - step_no: 1
    action: 打开门店页面
    input: 点击首页门店入口
    expected: 显示门店列表页

  - step_no: 2
    action: 选择门店
    input: 点击第一个门店
    expected: 进入门店商品页

assertions:
  - 订单状态变为"已支付"
  - 库存扣减正确

metadata:
  created_at: "2025-12-29T09:00:00Z"
  created_by: QA-张三
  version: "1.0.0"
  tags:
    - smoke
    - regression
```

### E2E Scenario YAML (E2E-*.yaml)

```yaml
scenario_id: E2E-ORDER-001
title: 用户完成饮品下单流程
module: order
description: 验证用户可以完成完整的饮品下单流程

tags:
  - module:order
  - priority:p1

preconditions:
  - 用户已登录
  - 门店已开业

steps:
  - description: 打开门店列表页
    locator: ".store-list"  # This will be EXCLUDED from output
    action: click

  - description: 选择第一个门店
    locator: ".store-item:first-child"  # EXCLUDED
    action: click
```

## Output Templates

### Template for TC YAML → Markdown

Location: `.claude/skills/manual-testcase-generator/assets/templates/testcase-doc.md.tpl`

Generated Markdown includes:
- Title and metadata (ID, module, priority)
- Preconditions table
- Test data (resolved from testdata_ref if possible)
- Steps table (step_no, action, input, expected)
- Assertions as checklist
- Footer with generation timestamp and source path

### Template for E2E YAML → Markdown

Location: `.claude/skills/manual-testcase-generator/assets/templates/scenario-doc.md.tpl`

Generated Markdown includes:
- Title and scenario ID
- Tags list
- Preconditions list
- Step descriptions ONLY (no technical details)
- Manual verification record table

**Excluded from output**:
- CSS selectors (`locator`)
- Action types (`click`, `fill`, etc.)
- Assertion code
- Any technical implementation details

## Testdata Resolution

When a test case includes `testdata_ref`, the generator attempts to resolve the reference:

```yaml
test_data:
  testdata_ref: orderTestData.beverage_order_001
```

Resolution process:
1. Parse namespace and key: `orderTestData` → `beverage_order_001`
2. Look up in `testdata/blueprints/order.blueprint.yaml`
3. Extract human-readable values
4. Inject into Markdown output

If resolution fails, the raw reference is displayed with a note.

## Workflow Integration

### Workflow A: New Feature Manual Testing

```
1. /e2e testcase create --module order
   → Creates TC-ORDER-001.yaml

2. /e2e testcase generate-doc TC-ORDER-001
   → Generates TC-ORDER-001.md

3. QA follows Markdown guide to execute test

4. /e2e testcase execute TC-ORDER-001
   → Records result in YAML executions[]
```

### Workflow B: Automated Test Manual Verification

```
1. /e2e scenario generate-doc E2E-ORDER-001
   → Generates E2E-ORDER-001.md (human-readable steps only)

2. QA reviews automated test by following Markdown guide

3. Records acceptance in the generated doc's table
```

## File Structure

```
testcases/
├── order/
│   ├── TC-ORDER-001.yaml       # Source (editable)
│   ├── TC-ORDER-002.yaml
│   └── docs/
│       ├── TC-ORDER-001.md     # Generated (read-only)
│       └── TC-ORDER-002.md
└── inventory/
    ├── TC-INVENTORY-001.yaml
    └── docs/
        └── TC-INVENTORY-001.md

scenarios/
├── order/
│   ├── E2E-ORDER-001.yaml
│   └── docs/
│       └── E2E-ORDER-001.md    # Generated (read-only)
└── inventory/
    └── docs/
```

## Validation

Before generating, the skill validates the input YAML:

```bash
# Validate TC YAML
/e2e testcase validate TC-ORDER-001
```

Validation checks:
- `testcase_id` matches pattern `^TC-[A-Z]+-\d{3}$`
- `priority` is one of P0, P1, P2
- `steps` array is non-empty
- Each step has `step_no`, `action`, `expected`

Schema: `.claude/skills/manual-testcase-generator/assets/schemas/testcase-schema.json`

## Error Handling

### File Not Found

```
❌ Test case not found: TC-ORDER-999
📝 Expected location: testcases/order/TC-ORDER-999.yaml
💡 Create it with: /e2e testcase create --module order
```

### Invalid YAML

```
❌ Validation failed for TC-ORDER-001
📋 Errors:
  - steps[3].expected: Required field missing
  - priority: Must be P0, P1, or P2
```

### Testdata Resolution Failed

```
⚠️  Could not resolve testdata_ref: orderTestData.missing_key
📝 Reference will be displayed as-is in the document
```

## Examples

### Example 1: Generate Single TC Document

```bash
/e2e testcase generate-doc TC-ORDER-001
```

**Output**:
```
✅ Generated: testcases/order/docs/TC-ORDER-001.md

📄 Document Summary:
- Title: 验证用户能够成功创建饮品订单并完成支付
- Steps: 5
- Assertions: 3
- Test Data: orderTestData.beverage_order_001 (resolved)
```

### Example 2: Batch Generate for Module

```bash
/e2e testcase generate-doc --module order
```

**Output**:
```
🔄 Batch generating docs for module: order

✅ TC-ORDER-001.md
✅ TC-ORDER-002.md
❌ TC-ORDER-003.yaml (validation error)

📊 Summary: 2/3 generated successfully
```

### Example 3: Generate Scenario Verification Doc

```bash
/e2e scenario generate-doc E2E-INVENTORY-002
```

**Output**:
```
✅ Generated: scenarios/inventory/docs/E2E-INVENTORY-002.md

📄 Document Summary:
- Title: 库存批量调整跨系统联动验证
- Steps: 8 (descriptions only, technical details excluded)
- Preconditions: 3
```

## Technical Details

**Templates**:
- `testcase-doc.md.tpl` - Handlebars-style template for TC YAML
- `scenario-doc.md.tpl` - Handlebars-style template for E2E YAML

**Schema Validation**:
- Uses JSON Schema (draft-07) for TC YAML validation
- Schema file: `assets/schemas/testcase-schema.json`

**Field Extraction Rules** (E2E YAML):
- ✅ INCLUDE: `scenario_id`, `title`, `description`, `tags`, `preconditions`, `steps[].description`
- ❌ EXCLUDE: `steps[].locator`, `steps[].action`, `steps[].selector`, `assertions`, any technical fields

## Version History

**1.0.0** (2025-12-31):
- Initial release
- Support for TC YAML → Markdown conversion
- Support for E2E YAML → Markdown conversion
- Batch generation by module
- Testdata_ref resolution
- JSON Schema validation

## References

- T007 Specification: `specs/T007-e2e-test-management/spec.md`
- Data Model: `specs/T007-e2e-test-management/data-model.md`
- Quickstart: `specs/T007-e2e-test-management/quickstart.md`
- TC Schema: `.claude/skills/manual-testcase-generator/assets/schemas/testcase-schema.json`
- Templates: `.claude/skills/manual-testcase-generator/assets/templates/`

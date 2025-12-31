---
name: e2e
description: E2E Testing Command Center - User-invocable wrapper for all E2E testing tools. Generate test scripts, run scenarios, manage test data, orchestrate complete E2E workflows, manage manual test cases, and view reports. Trigger keywords e2e, test, playwright, scenario, testcase, report, 测试, E2E测试, 人工测试, 测试用例, 测试报告.
version: 1.1.0
---

# e2e - E2E Testing Command Center

**@spec T007-e2e-test-management**

**User-invocable wrapper skill** that provides a unified interface to all E2E testing tools in the project.

## Description

The `e2e` skill is a **command center** that wraps all project-managed E2E skills into a single, easy-to-use interface. Instead of running Python scripts directly, you can now use simple commands like `/e2e generate E2E-INVENTORY-003` or `/e2e run --tags "module:inventory"`.

**Wrapped Skills**:
- 🛠️ **e2e-test-generator** - Generate Playwright test scripts from YAML scenarios
- 🎯 **test-scenario-author** - Create and validate E2E scenario YAML files
- 📊 **e2e-admin** - Orchestrate complete E2E test workflows
- 🗂️ **e2e-testdata-planner** - Plan and generate test data blueprints
- ▶️ **e2e-runner** - Execute Playwright tests with various options
- 📝 **manual-testcase-generator** - Generate manual test case Markdown documents (NEW)

## Usage

### Generate Test Scripts

Generate Playwright test scripts from scenario YAML files.

```bash
# Generate single scenario
/e2e generate E2E-INVENTORY-003

# Generate all scenarios in a module
/e2e generate --module inventory

# Generate multiple scenarios
/e2e generate E2E-INVENTORY-001 E2E-INVENTORY-002 E2E-INVENTORY-003
```

**What it does**:
- Reads scenario YAML file
- Generates `.spec.ts` Playwright test script
- Creates missing Page Object templates
- Outputs file location and TODO items

### Run Tests

Execute Playwright tests directly.

```bash
# Run single scenario
/e2e run E2E-INVENTORY-003

# Run with UI mode
/e2e run E2E-INVENTORY-003 --ui

# Run in debug mode
/e2e run E2E-INVENTORY-003 --debug

# Run cross-system tests
/e2e run E2E-INVENTORY-002 --cross-system
```

**What it does**:
- Checks prerequisites (Playwright installed, test file exists)
- Starts required services (C-end/B-end if needed)
- Executes Playwright test
- Shows test results and artifacts

### Orchestrate Complete Workflow

Run the full E2E workflow: scenario selection → test generation → execution → reporting.

```bash
# Run all scenarios by tag
/e2e orchestrate --tags "module:inventory AND priority:p1"

# Run specific scenarios
/e2e orchestrate --scenario-ids E2E-INVENTORY-001,E2E-INVENTORY-002

# Skip certain steps
/e2e orchestrate --tags "module:order" --skip-generation

# Dry run (show plan without execution)
/e2e orchestrate --tags "priority:p1" --dry-run
```

**What it does**:
1. Loads and filters scenarios by tags
2. Validates scenario YAML files (optional)
3. Validates test data (optional)
4. **Generates test scripts** for selected scenarios
5. Configures reports and artifacts (optional)
6. Starts required services automatically
7. Executes Playwright tests
8. Generates comprehensive report
9. Cleans up services

### Create Scenarios

Create new E2E scenario YAML files (interactive mode).

```bash
# Create scenario from spec
/e2e create-scenario --spec P005

# Create scenario with wizard
/e2e create-scenario --interactive
```

**What it does**:
- Guides you through scenario creation
- Generates YAML file in correct format
- Validates against schema
- Saves to `scenarios/<module>/<scenario-id>.yaml`

### Manage Test Data

Plan and generate test data blueprints.

```bash
# Generate test data blueprint
/e2e testdata --scenario E2E-INVENTORY-003

# Generate fixtures
/e2e testdata --scenario E2E-INVENTORY-003 --generate-fixtures
```

**What it does**:
- Analyzes scenario data requirements
- Generates test data blueprint
- Creates TypeScript fixtures (optional)

### Manual Test Cases (NEW)

Create, manage, and execute manual test cases for scenarios that cannot be automated.

#### Create Test Case

```bash
# Start interactive creation flow
/e2e testcase create --module order

# Creates: testcases/order/TC-ORDER-001.yaml
```

**What it does**:
1. Prompts for testcase_id (auto-suggests: TC-ORDER-001)
2. Prompts for title, priority (P0/P1/P2)
3. Prompts for preconditions, test data reference
4. Guides through step-by-step input (action, input, expected)
5. Saves YAML file to `testcases/<module>/TC-*.yaml`

#### List Test Cases

```bash
# List all test cases in a module
/e2e testcase list --module order

# Filter by priority
/e2e testcase list --module order --priority P0

# Filter by tags
/e2e testcase list --tags "smoke,regression"
```

**Output**:
```
📋 人工测试用例列表 (order)

| ID | 标题 | 优先级 | 最近执行 | 结果 |
|----|------|--------|----------|------|
| TC-ORDER-001 | 验证用户能够成功创建饮品订单 | P0 | 2025-12-31 | Pass |
| TC-ORDER-002 | 验证订单取消流程 | P1 | - | - |

共 2 个用例
```

#### Execute Test Case

```bash
# Execute a test case (interactive flow)
/e2e testcase execute TC-ORDER-001
```

**What it does**:
1. Loads test case YAML
2. Displays preconditions and test data
3. Shows each step with action, input, and expected result
4. Prompts for actual result (Pass/Fail/Blocked/Skipped)
5. Prompts for defect ID if failed
6. Records execution to YAML `executions[]` array

#### Generate Documentation

```bash
# Generate Markdown from manual test case YAML
/e2e testcase generate-doc TC-ORDER-001

# Batch generate for entire module
/e2e testcase generate-doc --module order
```

**Output**: `testcases/order/docs/TC-ORDER-001.md`

#### Validate Test Case

```bash
# Validate test case YAML format
/e2e testcase validate TC-ORDER-001
```

### Scenario Documentation (NEW)

Generate human-readable verification documents from E2E scenario YAML.

```bash
# Generate manual verification doc from scenario
/e2e scenario generate-doc E2E-ORDER-001

# Batch generate for entire module
/e2e scenario generate-doc --module order
```

**What it does**:
- Reads scenario YAML from `scenarios/<module>/E2E-*.yaml`
- Extracts metadata (title, description, preconditions)
- Extracts step descriptions ONLY (excludes CSS selectors, technical details)
- Generates `scenarios/<module>/docs/E2E-*.md`

### Test Reports (NEW)

View and manage E2E test reports.

#### Serve Report Portal

```bash
# Start local report server
/e2e report serve

# Access at http://localhost:9323
```

**What it does**:
- Starts HTTP server on port 9323
- Serves `reports/e2e/e2e-portal/` directory
- Displays report aggregation page

#### List Reports

```bash
# List recent reports
/e2e report list

# Filter by date range
/e2e report list --from 2025-12-01 --to 2025-12-31

# Filter by status
/e2e report list --status failed
```

#### Compare Reports

```bash
# Compare two test runs
/e2e report compare run-20251230-103052 run-20251231-143052
```

**Output**:
```
📊 报告对比

| 指标 | Run 1 | Run 2 | 变化 |
|------|-------|-------|------|
| 通过 | 13 | 15 | +2 ✅ |
| 失败 | 2 | 0 | -2 ✅ |
| 总数 | 15 | 15 | - |

新增通过:
- E2E-ORDER-003: 之前失败，现已修复

持续失败:
- (无)
```

## Command Reference

| Command | Description | Wrapped Skill |
|---------|-------------|---------------|
| `generate <scenario-id>` | Generate test script | e2e-test-generator |
| `generate --module <name>` | Batch generate module | e2e-test-generator |
| `run <scenario-id> [options]` | Run test | e2e-runner |
| `orchestrate [options]` | Full workflow | e2e-admin |
| `create-scenario [options]` | Create scenario | test-scenario-author |
| `validate-scenario <id>` | Validate scenario | test-scenario-author |
| `testdata [options]` | Manage test data | e2e-testdata-planner |
| `testcase create [options]` | Create manual test case | e2e (internal) |
| `testcase list [options]` | List test cases | e2e (internal) |
| `testcase execute <id>` | Execute test case | e2e (internal) |
| `testcase generate-doc <id>` | Generate TC Markdown | manual-testcase-generator |
| `testcase validate <id>` | Validate TC YAML | e2e (internal) |
| `scenario generate-doc <id>` | Generate scenario doc | manual-testcase-generator |
| `report serve` | Start report server | e2e (internal) |
| `report list [options]` | List reports | e2e (internal) |
| `report compare <id1> <id2>` | Compare reports | e2e (internal) |
| `help` | Show help | - |

## Examples

### Example 1: Quick Test Generation and Run

```bash
# Generate test script
/e2e generate E2E-INVENTORY-003

# Run the test
/e2e run E2E-INVENTORY-003 --ui
```

### Example 2: Complete Workflow

```bash
# Orchestrate full workflow for inventory module
/e2e orchestrate --tags "module:inventory" --workers 4 --retries 2
```

**Output**:
```
🚀 E2E 测试编排器启动
📅 时间: 2025-12-30 20:30:00

🔍 加载场景文件...
✅ 加载了 15 个场景

🏷️  应用标签过滤: module:inventory
✅ 匹配场景数: 8

🛠️  Step 3: 测试脚本生成
   生成 8 个场景的测试脚本...
   ✅ Generated: scenarios/inventory/E2E-INVENTORY-001.spec.ts
   ✅ Generated: scenarios/inventory/E2E-INVENTORY-002.spec.ts
   ...

▶️  开始执行测试...
Running 8 tests using 4 workers
  8 passed (45.2s)

📊 生成测试报告...
✅ Report: test-results/run-20251230-203052-a3f8b921/index.html
```

### Example 3: Cross-System Testing

```bash
# Generate and run cross-system test
/e2e generate E2E-INVENTORY-002
/e2e run E2E-INVENTORY-002 --cross-system

# Or use orchestrate
/e2e orchestrate --scenario-ids E2E-INVENTORY-002
```

### Example 4: Manual Test Case Workflow (NEW)

```bash
# 1. Create a manual test case
/e2e testcase create --module order

# 2. Generate Markdown documentation
/e2e testcase generate-doc TC-ORDER-001

# 3. QA executes test manually following the Markdown guide

# 4. Record execution result
/e2e testcase execute TC-ORDER-001
```

### Example 5: Generate Manual Verification Doc from Scenario (NEW)

```bash
# Generate human-readable doc from automated scenario
/e2e scenario generate-doc E2E-ORDER-001

# QA uses the generated Markdown for manual verification
# after automated tests complete
```

## Implementation

**Location**: `.claude/skills/e2e/`

**Structure**:
```
.claude/skills/e2e/
├── skill.md                 # This file
└── scripts/
    └── wrapper.py           # Python wrapper script
```

**How it works**:
1. User invokes `/e2e <command> [args]`
2. Claude calls this skill through the Skill tool
3. `wrapper.py` parses the command and arguments
4. Executes corresponding project-managed skill Python script
5. Returns formatted output to user

**Wrapped Commands Map**:
```python
COMMAND_MAP = {
    'generate': '.claude/skills/e2e-test-generator/scripts/cli.py',
    'run': '.claude/skills/e2e-runner/scripts/cli.py',
    'orchestrate': '.claude/skills/e2e-admin/scripts/orchestrate.py',
    'create-scenario': '.claude/skills/test-scenario-author/scripts/cli.py',
    'validate-scenario': '.claude/skills/test-scenario-author/scripts/cli.py',
    'testdata': '.claude/skills/e2e-testdata-planner/scripts/cli.py',
    # NEW in v1.1.0
    'testcase': 'internal',  # Handled by skill logic
    'scenario': 'internal',  # Handled by skill logic
    'report': 'internal',    # Handled by skill logic
}
```

## Prerequisites

All wrapped skills must be available in `.claude/skills/`:
- ✅ e2e-test-generator (T002)
- ✅ e2e-admin (T001)
- ✅ test-scenario-author (T005)
- ✅ e2e-testdata-planner (T004)
- ✅ e2e-runner (T003)
- ✅ manual-testcase-generator (T007) - NEW

## Error Handling

If a wrapped skill is not available:
```
⚠️  Skill 'e2e-test-generator' not found
📝 Please ensure the skill is installed at:
   .claude/skills/e2e-test-generator/
```

## Version History

**1.1.0** (2025-12-31):
- **NEW**: `testcase` subcommand for manual test case management
  - `create`: Interactive test case creation
  - `list`: List and filter test cases
  - `execute`: Record execution results
  - `generate-doc`: Generate Markdown from TC YAML
  - `validate`: Validate TC YAML format
- **NEW**: `scenario generate-doc` for generating manual verification docs from E2E scenarios
- **NEW**: `report` subcommand for test report management
  - `serve`: Start local report portal server
  - `list`: List and filter reports
  - `compare`: Compare two test runs
- Updated description with new trigger keywords

**1.0.0** (2025-12-30):
- Initial release as user-invocable wrapper
- Support for generate, run, orchestrate commands
- Unified interface for all E2E tools

## References

- e2e-test-generator: `.claude/skills/e2e-test-generator/skill.md`
- e2e-admin: `.claude/skills/e2e-admin/skill.md`
- test-scenario-author: `.claude/skills/test-scenario-author/skill.md`
- e2e-testdata-planner: `.claude/skills/e2e-testdata-planner/skill.md`
- e2e-runner: `.claude/skills/e2e-runner/skill.md`
- manual-testcase-generator: `.claude/skills/manual-testcase-generator/skill.md` (NEW)
- T007 Specification: `specs/T007-e2e-test-management/spec.md`

# E2E Admin - Developer Documentation

**@spec T001-e2e-orchestrator**

Developer guide for the E2E test orchestrator Claude Code skill.

## Overview

This skill orchestrates E2E test execution by coordinating multiple specialized skills, managing cross-system services, and generating isolated test reports.

## Architecture

### Module Structure

```
.claude/skills/e2e-admin/
├── scripts/               # Python implementation modules
│   ├── orchestrate.py    # Main CLI entry point
│   ├── scenario_filter.py # YAML loading and tag filtering
│   ├── config_assembler.py # RunConfig assembly and validation
│   ├── service_manager.py # Dev server lifecycle management
│   ├── skill_executor.py  # Skill orchestration framework
│   ├── report_generator.py # Report pack generation
│   └── utils.py           # Shared utilities (run_id, etc.)
├── assets/                # Configuration templates
├── tests/                 # Unit and integration tests
└── skill.md               # User-facing documentation
```

### Core Data Models

From `specs/T001-e2e-orchestrator/data-model.md`:

1. **TestScenario**: YAML-defined test scenario
   - Tags: module, channel, deploy, priority
   - Steps: action, system, params
   - Assertions: type, check, params

2. **RunConfig**: Test execution configuration
   - run_id (YYYYMMDD-HHMMSS-uuid)
   - Environment (dev/staging/prod)
   - Workers (1-10), retries (0-3), timeout
   - Selected scenarios
   - Skip flags

3. **ReportPack**: Test execution output bundle
   - HTML report (index.html)
   - Summary JSON
   - Config snapshot
   - Artifacts (trace/video/screenshot)

## Development Workflow

### Prerequisites

- Python 3.8+
- PyYAML 6.0+
- Node.js 18+ (for Playwright)
- Playwright installed in frontend/

### Setup

```bash
# Install Python dependencies
pip3 install pyyaml pytest pytest-cov

# Verify Playwright installation
cd frontend
npx playwright --version
```

### Running Tests

```bash
# Run all unit tests
cd .claude/skills/e2e-admin
pytest tests/

# Run with coverage
pytest tests/ --cov=scripts --cov-report=html

# Run specific test file
pytest tests/test_scenario_filter.py -v
```

### Code Standards

Per constitution check (`.claude/rules/06-code-quality.md`):

1. **@spec attribution**: All Python files must include `# @spec T001-e2e-orchestrator`
2. **Type hints**: Use Python type hints for all function signatures
3. **Docstrings**: Google-style docstrings for all public functions
4. **Formatting**: Run `black` and `pylint` before committing
5. **Test coverage**: ≥80% coverage required

```bash
# Format code
black scripts/

# Lint code
pylint scripts/

# Check coverage
pytest tests/ --cov=scripts --cov-report=term-missing
```

## Module Responsibilities

### orchestrate.py

**Responsibility**: Main CLI entry point and orchestration flow

**Key Functions**:
- `main()`: Parse CLI arguments and execute orchestration pipeline
- `validate_prerequisites()`: Check Python, Node.js, Playwright installation
- `execute_orchestration()`: Run 6-step skill pipeline

**CLI Arguments**:
- `--tags`: Tag filter expression (AND/OR logic)
- `--env`: Environment (dev/staging/prod)
- `--workers`: Parallel workers (1-10)
- `--retries`: Retry count (0-3)
- `--timeout`: Test timeout (milliseconds)
- `--skip-*`: Skip flags for each orchestration step

### scenario_filter.py

**Responsibility**: Load scenario YAML files and apply tag filtering

**Key Functions**:
- `load_scenarios(directory: str) -> List[TestScenario]`: Recursive YAML loading
- `filter_by_tags(scenarios: List[TestScenario], expression: str) -> List[TestScenario]`: AND/OR tag matching
- `parse_tag_expression(expression: str) -> TagFilter`: Parse tag filter syntax

**Tag Filter Syntax**:
- Single tag: `module:inventory`
- AND logic: `module:inventory AND priority:p1`
- OR logic: `module:inventory OR module:order`
- Supported tags: module, channel, deploy, priority

### config_assembler.py

**Responsibility**: Assemble and validate RunConfig from CLI args + defaults

**Key Functions**:
- `assemble_config(args: Namespace, scenarios: List[TestScenario]) -> RunConfig`: Build RunConfig
- `validate_config(config: RunConfig) -> None`: Validate workers, retries, timeout ranges
- `load_default_config() -> Dict`: Load default-config.yaml

**Validation Rules**:
- workers: 1-10
- retries: 0-3
- timeout: ≥1000 (at least 1 second)
- project: fixed to "chromium"

### service_manager.py

**Responsibility**: Manage C-end/B-end dev server lifecycle

**Key Functions**:
- `detect_required_systems(scenarios: List[TestScenario]) -> Set[str]`: Extract system fields
- `start_service(system: str) -> subprocess.Popen`: Launch dev server
- `check_port_ready(port: int, timeout: int) -> bool`: TCP port health check
- `stop_service(process: subprocess.Popen) -> None`: Graceful SIGTERM shutdown

**Service Configuration** (from default-config.yaml):
- C-end: port 10086, `cd hall-reserve-taro && npm run dev:h5`
- B-end: port 3000, `cd frontend && npm run dev`

### skill_executor.py

**Responsibility**: Call other Claude Code skills or use built-in fallbacks

**Key Functions**:
- `execute_skill(skill_name: str, args: List[str]) -> bool`: Attempt skill execution
- `check_skill_available(skill_name: str) -> bool`: Check if skill exists
- `fallback_implementation(skill_name: str) -> None`: Built-in default behavior

**Skill Orchestration Order** (FR-004):
1. test-scenario-author (validation) - fallback: skip
2. e2e-testdata-planner (validation) - fallback: prompt user
3. e2e-test-generator (generation) - fallback: skip
4. e2e-report-configurator (config) - fallback: Playwright default
5. e2e-artifacts-policy (config) - fallback: on-failure strategy
6. e2e-runner (execution) - required, no fallback

### report_generator.py

**Responsibility**: Generate summary.json and organize report pack

**Key Functions**:
- `generate_summary(run_id: str, results: Dict) -> None`: Write summary.json
- `extract_playwright_stats(output: str) -> Dict`: Parse Playwright CLI output
- `create_symlink(run_id: str) -> None`: Create test-results/latest symlink

**Summary JSON Structure**:
```json
{
  "run_id": "...",
  "execution_timestamp": "...",
  "duration_seconds": 125.3,
  "summary": {
    "total": 15,
    "passed": 13,
    "failed": 2,
    "skipped": 0,
    "retries": {
      "total_retry_attempts": 3,
      "scenarios_retried": 2
    }
  }
}
```

### utils.py

**Responsibility**: Shared utility functions

**Key Functions**:
- `generate_run_id() -> str`: Create unique run_id (YYYYMMDD-HHMMSS-uuid)
- `ensure_directory(path: str) -> None`: Create directory if not exists
- `load_yaml(file_path: str) -> Dict`: Safe YAML loading with error handling

## Testing Strategy

### Unit Tests (TDD Required)

Per constitution check: ≥80% coverage

**test_scenario_filter.py**:
- [ ] Test YAML loading (valid/invalid files)
- [ ] Test single tag filtering
- [ ] Test AND/OR logic
- [ ] Test missing tag field handling

**test_config_assembler.py**:
- [ ] Test RunConfig assembly from defaults
- [ ] Test RunConfig assembly from CLI overrides
- [ ] Test validation (workers/retries/timeout ranges)
- [ ] Test environment-specific baseURL

**test_service_manager.py**:
- [ ] Test system detection from scenarios
- [ ] Test port availability check
- [ ] Test service start command construction
- [ ] Mock test for subprocess.Popen

**test_utils.py**:
- [ ] Test run_id format (regex validation)
- [ ] Test run_id uniqueness
- [ ] Test YAML loading error handling

### Integration Tests

**test_orchestrate.py**:
- [ ] End-to-end scenario selection flow
- [ ] Mock Playwright CLI execution
- [ ] Verify report pack structure

### Fixtures

Place mock scenario YAML files in `tests/fixtures/`:

```
tests/fixtures/
├── valid-scenario.yaml
├── invalid-scenario.yaml
└── multi-system-scenario.yaml
```

## Performance Requirements

From spec success criteria:

- **SC-001**: Orchestration overhead <30 seconds (excluding test execution)
- **SC-002**: Support 100+ scenarios with 4 workers in parallel
- **SC-005**: Report generation <5% of total execution time

Benchmark tests in `tests/test_performance.py`.

## Error Handling

Edge cases per spec:

1. **No scenarios matched**: Warn and exit gracefully
2. **Missing test data**: Call e2e-testdata-planner or prompt user
3. **Port conflict**: Detect and provide clear error message
4. **Service startup failure**: Graceful cleanup
5. **Ctrl+C interrupt**: SIGINT handler, stop services, generate partial report
6. **Disk space warning**: Check before execution, allow disabling artifacts

## Debugging

### Enable Verbose Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Dry Run Mode

```bash
# Future enhancement: add --dry-run flag
/e2e-admin --tags "module:inventory" --dry-run
```

### Manual Playwright Execution

```bash
cd frontend
npx playwright test scenarios/inventory/E2E-INVENTORY-001.spec.ts --debug
```

## Contributing

1. Write tests first (TDD)
2. Ensure ≥80% coverage
3. Run `black` and `pylint`
4. Add `# @spec T001-e2e-orchestrator` to new files
5. Update skill.md if adding new parameters
6. Commit with conventional commits format

## References

- Spec: `specs/T001-e2e-orchestrator/spec.md`
- Plan: `specs/T001-e2e-orchestrator/plan.md`
- Data Model: `specs/T001-e2e-orchestrator/data-model.md`
- Tasks: `specs/T001-e2e-orchestrator/tasks.md`
- Quickstart: `specs/T001-e2e-orchestrator/quickstart.md`

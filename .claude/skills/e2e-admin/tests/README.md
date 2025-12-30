# E2E Admin Tests

**@spec T001-e2e-orchestrator**

Comprehensive unit test suite for the E2E Test Orchestrator skill.

## Quick Start

```bash
# Install dependencies
pip install pytest pytest-cov pytest-mock

# Run all tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=scripts --cov-config=.coveragerc --cov-report=term-missing

# Run specific test file
python -m pytest tests/test_utils.py -v

# Run only unit tests (fast)
python -m pytest tests/ -m unit
```

## Test Coverage

**Current: 93.08%** (Target: ≥80%) ✅

| Module | Coverage |
|--------|----------|
| utils.py | 100% |
| __init__.py | 100% |
| config_assembler.py | 95.24% |
| scenario_filter.py | 93.10% |
| report_generator.py | 92.96% |
| service_manager.py | 89.25% |

## Test Files

| File | Tests | Focus |
|------|-------|-------|
| `test_utils.py` | 15 | Run ID, YAML loading, directory utils |
| `test_scenario_filter.py` | 21 | Scenario loading, tag filtering, system detection |
| `test_config_assembler.py` | 19 | Config validation, CLI argument assembly |
| `test_report_generator.py` | 10 | Report generation, Playwright parsing |
| `test_service_manager.py` | 15 | Service lifecycle, port checking, shutdown |

## Fixtures (conftest.py)

- `temp_dir` - Temporary directory for tests
- `sample_scenario_yaml` - Sample scenario YAML content
- `sample_scenarios_dir` - Directory with multiple scenarios
- `mock_playwright_output` - Mocked Playwright CLI output
- `mock_config_dict` - Mocked run configuration
- `mock_execution_times` - Mocked execution timestamps

## Coverage Reports

```bash
# Generate HTML report
python -m pytest tests/ --cov=scripts --cov-config=.coveragerc --cov-report=html:htmlcov

# Open in browser
open htmlcov/index.html
```

## Test Markers

```bash
# Run only unit tests
python -m pytest -m unit

# Run integration tests
python -m pytest -m integration
```

See [TEST_SUMMARY.md](./TEST_SUMMARY.md) for detailed test documentation.

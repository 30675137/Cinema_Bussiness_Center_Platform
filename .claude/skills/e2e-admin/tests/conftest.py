# @spec T001-e2e-orchestrator
"""
Pytest fixtures and configuration for e2e-admin tests.
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime


@pytest.fixture
def temp_dir():
    """创建临时目录用于测试。"""
    tmp = tempfile.mkdtemp()
    yield Path(tmp)
    shutil.rmtree(tmp, ignore_errors=True)


@pytest.fixture
def sample_scenario_yaml():
    """返回示例场景 YAML 内容。"""
    return """
scenario_id: E2E-TEST-001
spec_ref: T001
title: 测试场景
description: 用于单元测试的场景

tags:
  module:
    - test
  channel:
    - web
  deploy:
    - saas
  priority: p1
  smoke: true

preconditions:
  role: admin
  testdata_ref: testData.scenario_001

steps:
  - action: login
    system: b-end
    params:
      testdata_ref: testData.admin_user
    description: 管理员登录

  - action: navigate
    system: b-end
    params:
      path: /test
    description: 导航到测试页面

assertions:
  - type: ui
    check: element_visible
    params:
      selector: .success
    timeout: 5000

  - type: api
    check: response_status_is
    params:
      expected: 200
    timeout: 3000

artifacts:
  trace: on-failure
  video: on-failure
  screenshot: on-failure

metadata:
  created_at: "2025-12-30T00:00:00Z"
  created_by: pytest
  version: "1.0.0"
"""


@pytest.fixture
def sample_scenarios_dir(temp_dir, sample_scenario_yaml):
    """创建包含示例场景的临时目录。"""
    scenarios_dir = temp_dir / "scenarios" / "test"
    scenarios_dir.mkdir(parents=True, exist_ok=True)

    # 创建多个测试场景
    for i in range(1, 4):
        scenario_file = scenarios_dir / f"E2E-TEST-{i:03d}.yaml"
        content = sample_scenario_yaml.replace("E2E-TEST-001", f"E2E-TEST-{i:03d}")
        if i == 2:
            content = content.replace("priority: p1", "priority: p2")
        if i == 3:
            content = content.replace("module:\n    - test", "module:\n    - test\n    - other")
        scenario_file.write_text(content)

    return temp_dir / "scenarios"


@pytest.fixture
def mock_playwright_output():
    """模拟 Playwright CLI 输出。"""
    return """
Running 5 tests using 2 workers

  ✓ scenarios/test/E2E-TEST-001.spec.ts:5:1 › Test 1 (2.5s)
  ✓ scenarios/test/E2E-TEST-002.spec.ts:5:1 › Test 2 (3.1s)
  ✓ scenarios/test/E2E-TEST-003.spec.ts:5:1 › Test 3 (2.8s)
  ✗ scenarios/test/E2E-TEST-004.spec.ts:5:1 › Test 4 (1.2s)
  ✓ scenarios/test/E2E-TEST-005.spec.ts:5:1 › Test 5 (2.9s)

  4 passed
  1 failed
  1 flaky

  Ran 5 tests in 12.5s
"""


@pytest.fixture
def mock_config_dict():
    """模拟运行配置字典。"""
    return {
        'run_id': '20251230-120000-abcd1234',
        'environment': 'dev',
        'base_urls': {
            'c-end': 'http://localhost:10086',
            'b-end': 'http://localhost:3000'
        },
        'workers': 2,
        'retries': 1,
        'timeout': 30000,
        'project': 'chromium',
        'selected_scenarios': [
            {
                'scenario_id': 'E2E-TEST-001',
                'title': 'Test 1',
                'tags': {'module': ['test'], 'priority': 'p1'}
            }
        ],
        'skip_flags': {
            'scenario_validation': False,
            'data_validation': False,
            'generation': False,
            'report_config': False,
            'artifacts_config': False
        },
        'artifacts': {
            'trace': 'on-failure',
            'video': 'on-failure',
            'screenshot': 'on-failure'
        },
        'output_dir': 'test-results/run-20251230-120000-abcd1234'
    }


@pytest.fixture
def mock_execution_times():
    """模拟执行时间。"""
    start = datetime(2025, 12, 30, 12, 0, 0)
    end = datetime(2025, 12, 30, 12, 0, 12)
    return start, end

# Data Model: E2E 测试编排器

**Feature**: T001-e2e-orchestrator
**Date**: 2025-12-30
**Phase**: Phase 1 - Design

## Overview

本文档定义 E2E 测试编排器 skill 处理的核心数据模型，包括场景定义、运行配置、报告包和工件元数据。

---

## Core Entities

### 1. TestScenario (测试场景)

**描述**: 表示来自 YAML 文件的 E2E 测试场景定义

**Schema**:

```yaml
scenario_id: string          # 场景唯一标识符（格式：E2E-<MODULE>-<NUMBER>）
spec_ref: string             # 规格引用（格式：X###）
title: string                # 场景标题
description: string          # 场景描述（可选）

tags:                        # 标签集合
  module: string[]           # 模块标签（如 ['inventory', 'order']）
  channel: string[]          # 渠道标签（如 ['web', 'mini-program']）
  deploy: string[]           # 部署标签（如 ['saas', 'private']）
  priority: string           # 优先级标签（p1/p2/p3）

preconditions:               # 前置条件
  role: string               # 用户角色
  testdata_ref: string       # 测试数据引用（格式：<dataFile>.<scenarioKey>）

steps:                       # 测试步骤
  - action: string           # 操作名称
    system: string           # 系统标识（c-end/b-end/api，可选）
    params: object           # 参数（可包含 testdata_ref）
    description: string      # 步骤描述（可选）
    wait: number             # 等待时间（毫秒，可选）

assertions:                  # 断言列表
  - type: string             # 断言类型（ui/api）
    check: string            # 检查类型
    params: object           # 参数
    timeout: number          # 超时时间（毫秒，可选）

artifacts:                   # 工件配置
  trace: string              # trace 策略（on-failure/always/off）
  video: string              # 视频策略
  screenshot: string         # 截图策略

metadata:                    # 元数据
  created_at: string         # 创建时间（ISO 8601）
  created_by: string         # 创建者
  version: string            # 版本号
```

**TypeScript Interface**:

```typescript
interface TestScenario {
  scenario_id: string
  spec_ref: string
  title: string
  description?: string

  tags: {
    module: string[]
    channel: string[]
    deploy: string[]
    priority: 'p1' | 'p2' | 'p3'
  }

  preconditions: {
    role: string
    testdata_ref?: string
  }

  steps: TestStep[]
  assertions: TestAssertion[]
  artifacts: ArtifactPolicy

  metadata: {
    created_at: string
    created_by: string
    version: string
  }
}

interface TestStep {
  action: string
  system?: 'c-end' | 'b-end' | 'api'
  params?: Record<string, any>
  description?: string
  wait?: number
}

interface TestAssertion {
  type: 'ui' | 'api'
  check: string
  params: Record<string, any>
  timeout?: number
}

interface ArtifactPolicy {
  trace: 'on-failure' | 'always' | 'off'
  video: 'on-failure' | 'always' | 'off'
  screenshot: 'on-failure' | 'always' | 'off'
}
```

**Validation Rules**:
- `scenario_id` 格式: `E2E-[A-Z]+-\d{3}`
- `spec_ref` 格式: `[A-Z]\d{3}`
- `tags.priority` 枚举: `p1`, `p2`, `p3`
- `steps` 至少包含 1 个
- `assertions` 至少包含 1 个

**Example**:

```yaml
scenario_id: E2E-INVENTORY-002
spec_ref: P005
title: BOM库存预占与实扣流程

tags:
  module: [inventory]
  channel: [web]
  deploy: [saas]
  priority: p1

preconditions:
  role: user
  testdata_ref: bomTestData.scenario_001

steps:
  - action: login
    system: c-end
    description: 用户登录 H5
  - action: create_order
    system: c-end
    params:
      testdata_ref: bomTestData.order_params
  - action: click
    system: b-end
    params:
      testdata_ref: bomTestData.confirm_production_btn
    description: 吧台确认出品（触发实扣）

assertions:
  - type: ui
    check: element_visible
    params:
      selector: .success-message
  - type: api
    check: response_status_is
    params:
      expected: 200

artifacts:
  trace: on-failure
  video: on-failure
  screenshot: on-failure

metadata:
  created_at: "2025-12-30T10:00:00Z"
  created_by: test-scenario-author
  version: "1.0.0"
```

---

### 2. RunConfig (运行配置)

**描述**: 单次测试执行的完整配置

**Schema**:

```json
{
  "run_id": "string",              // 唯一运行 ID（格式：YYYYMMDD-HHMMSS-uuid）
  "environment": "string",         // 环境（dev/staging/prod）
  "base_urls": {
    "c-end": "string",             // C端 baseURL
    "b-end": "string"              // B端 baseURL
  },
  "workers": "number",             // 并行 worker 数量（1-10）
  "retries": "number",             // 重试次数（0-3）
  "timeout": "number",             // 超时时间（毫秒）
  "project": "string",             // 浏览器项目（固定为 chromium）
  "selected_scenarios": [          // 选中的场景列表
    {
      "scenario_id": "string",
      "file_path": "string"
    }
  ],
  "skip_flags": {                  // 跳过标志
    "scenario_validation": "boolean",
    "data_validation": "boolean",
    "generation": "boolean",
    "report_config": "boolean",
    "artifacts_config": "boolean"
  },
  "artifacts": {                   // 工件策略
    "trace": "string",
    "video": "string",
    "screenshot": "string"
  },
  "output_dir": "string"           // 输出目录
}
```

**Python Class**:

```python
from dataclasses import dataclass
from typing import List, Dict, Optional
import uuid
from datetime import datetime

@dataclass
class RunConfig:
    """测试运行配置"""

    run_id: str
    environment: str
    base_urls: Dict[str, str]
    workers: int
    retries: int
    timeout: int
    project: str
    selected_scenarios: List[Dict[str, str]]
    skip_flags: Dict[str, bool]
    artifacts: Dict[str, str]
    output_dir: str

    @staticmethod
    def generate_run_id() -> str:
        """生成唯一运行 ID"""
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        return f'{timestamp}-{unique_id}'

    @staticmethod
    def default_config(environment: str = 'dev') -> 'RunConfig':
        """创建默认配置"""
        run_id = RunConfig.generate_run_id()

        return RunConfig(
            run_id=run_id,
            environment=environment,
            base_urls={
                'c-end': 'http://localhost:10086',
                'b-end': 'http://localhost:3000'
            },
            workers=1,
            retries=0,
            timeout=30000,
            project='chromium',
            selected_scenarios=[],
            skip_flags={
                'scenario_validation': False,
                'data_validation': False,
                'generation': False,
                'report_config': False,
                'artifacts_config': False
            },
            artifacts={
                'trace': 'on-failure',
                'video': 'on-failure',
                'screenshot': 'on-failure'
            },
            output_dir=f'test-results/run-{run_id}'
        )

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            'run_id': self.run_id,
            'environment': self.environment,
            'base_urls': self.base_urls,
            'workers': self.workers,
            'retries': self.retries,
            'timeout': self.timeout,
            'project': self.project,
            'selected_scenarios': self.selected_scenarios,
            'skip_flags': self.skip_flags,
            'artifacts': self.artifacts,
            'output_dir': self.output_dir
        }
```

**Validation Rules**:
- `workers`: 1-10
- `retries`: 0-3
- `timeout`: ≥1000 (至少 1 秒)
- `project`: 固定为 `chromium`
- `environment`: `dev`, `staging`, `prod` 之一

**Example**:

```json
{
  "run_id": "20251230-143052-a3f8b921",
  "environment": "dev",
  "base_urls": {
    "c-end": "http://localhost:10086",
    "b-end": "http://localhost:3000"
  },
  "workers": 4,
  "retries": 2,
  "timeout": 30000,
  "project": "chromium",
  "selected_scenarios": [
    {
      "scenario_id": "E2E-INVENTORY-001",
      "file_path": "scenarios/inventory/E2E-INVENTORY-001.yaml"
    },
    {
      "scenario_id": "E2E-INVENTORY-002",
      "file_path": "scenarios/inventory/E2E-INVENTORY-002.yaml"
    }
  ],
  "skip_flags": {
    "scenario_validation": false,
    "data_validation": false,
    "generation": false,
    "report_config": false,
    "artifacts_config": false
  },
  "artifacts": {
    "trace": "on-failure",
    "video": "on-failure",
    "screenshot": "on-failure"
  },
  "output_dir": "test-results/run-20251230-143052-a3f8b921"
}
```

---

### 3. ReportPack (报告包)

**描述**: 测试执行输出的完整报告包，包含 HTML 报告、工件和摘要

**Schema**:

```json
{
  "run_id": "string",                    // 运行 ID
  "execution_timestamp": "string",       // 执行时间戳（ISO 8601）
  "duration_seconds": "number",          // 总执行时长（秒）
  "html_report_path": "string",          // HTML 报告路径
  "artifacts_directory": "string",       // 工件目录路径
  "summary": {
    "total": "number",                   // 总场景数
    "passed": "number",                  // 通过数
    "failed": "number",                  // 失败数
    "skipped": "number",                 // 跳过数
    "retries": {
      "total_retry_attempts": "number",  // 总重试次数
      "scenarios_retried": "number"      // 重试的场景数
    }
  },
  "config_snapshot": {                   // 运行配置快照
    "environment": "string",
    "workers": "number",
    "retries": "number",
    "project": "string"
  },
  "scenarios": [                         // 场景执行结果
    {
      "scenario_id": "string",
      "status": "string",                // passed/failed/skipped
      "duration_ms": "number",
      "retry_count": "number",
      "artifacts": ["string"]            // 工件路径列表
    }
  ]
}
```

**Python Class**:

```python
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class ReportPack:
    """报告包"""

    run_id: str
    execution_timestamp: str
    duration_seconds: float
    html_report_path: str
    artifacts_directory: str
    summary: Dict[str, any]
    config_snapshot: Dict[str, any]
    scenarios: List[Dict[str, any]]

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            'run_id': self.run_id,
            'execution_timestamp': self.execution_timestamp,
            'duration_seconds': self.duration_seconds,
            'html_report_path': self.html_report_path,
            'artifacts_directory': self.artifacts_directory,
            'summary': self.summary,
            'config_snapshot': self.config_snapshot,
            'scenarios': self.scenarios
        }

    def save_summary(self, output_path: str):
        """保存摘要到 JSON 文件"""
        import json
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)
```

**Example**:

```json
{
  "run_id": "20251230-143052-a3f8b921",
  "execution_timestamp": "2025-12-30T14:30:52Z",
  "duration_seconds": 125.3,
  "html_report_path": "test-results/run-20251230-143052-a3f8b921/index.html",
  "artifacts_directory": "test-results/run-20251230-143052-a3f8b921/artifacts",
  "summary": {
    "total": 8,
    "passed": 6,
    "failed": 2,
    "skipped": 0,
    "retries": {
      "total_retry_attempts": 3,
      "scenarios_retried": 2
    }
  },
  "config_snapshot": {
    "environment": "dev",
    "workers": 4,
    "retries": 2,
    "project": "chromium"
  },
  "scenarios": [
    {
      "scenario_id": "E2E-INVENTORY-001",
      "status": "passed",
      "duration_ms": 15200,
      "retry_count": 0,
      "artifacts": []
    },
    {
      "scenario_id": "E2E-INVENTORY-002",
      "status": "failed",
      "duration_ms": 8500,
      "retry_count": 2,
      "artifacts": [
        "test-results/run-20251230-143052-a3f8b921/artifacts/E2E-INVENTORY-002/trace.zip",
        "test-results/run-20251230-143052-a3f8b921/artifacts/E2E-INVENTORY-002/video.webm"
      ]
    }
  ]
}
```

---

### 4. TestArtifact (测试工件)

**描述**: 单个测试证据文件元数据（trace/video/screenshot）

**Schema**:

```json
{
  "artifact_type": "string",       // 工件类型（trace/video/screenshot）
  "scenario_id": "string",         // 所属场景 ID
  "browser": "string",             // 浏览器（chromium）
  "file_path": "string",           // 文件路径
  "file_size_bytes": "number",     // 文件大小（字节）
  "created_at": "string"           // 创建时间（ISO 8601）
}
```

**Python Class**:

```python
from dataclasses import dataclass
from pathlib import Path

@dataclass
class TestArtifact:
    """测试工件元数据"""

    artifact_type: str  # trace/video/screenshot
    scenario_id: str
    browser: str
    file_path: str
    file_size_bytes: int
    created_at: str

    @staticmethod
    def from_file(file_path: str, scenario_id: str, artifact_type: str) -> 'TestArtifact':
        """从文件路径创建工件元数据"""
        path = Path(file_path)
        return TestArtifact(
            artifact_type=artifact_type,
            scenario_id=scenario_id,
            browser='chromium',
            file_path=str(path),
            file_size_bytes=path.stat().st_size if path.exists() else 0,
            created_at=datetime.now().isoformat()
        )
```

**Example**:

```json
{
  "artifact_type": "trace",
  "scenario_id": "E2E-INVENTORY-002",
  "browser": "chromium",
  "file_path": "test-results/run-20251230-143052-a3f8b921/artifacts/E2E-INVENTORY-002/trace.zip",
  "file_size_bytes": 1048576,
  "created_at": "2025-12-30T14:35:12Z"
}
```

---

## Entity Relationships

```
TestScenario (1) ──> (N) RunConfig.selected_scenarios
RunConfig (1) ──> (1) ReportPack
ReportPack (1) ──> (N) TestArtifact
TestScenario (1) ──> (N) TestArtifact
```

**Relationship Diagram**:

```
┌─────────────────┐
│  TestScenario   │
│  (YAML file)    │
└────────┬────────┘
         │ selected_scenarios
         ▼
┌─────────────────┐
│    RunConfig    │
│ (orchestration) │
└────────┬────────┘
         │ executes
         ▼
┌─────────────────┐
│   ReportPack    │
│  (HTML + JSON)  │
└────────┬────────┘
         │ contains
         ▼
┌─────────────────┐
│  TestArtifact   │
│ (trace/video)   │
└─────────────────┘
```

---

## Data Flow

```
1. Load Scenarios (YAML → TestScenario objects)
   ↓
2. Filter by Tags (TestScenario[] → filtered TestScenario[])
   ↓
3. Assemble RunConfig (TestScenario[] + CLI args → RunConfig)
   ↓
4. Execute Playwright (RunConfig → Playwright CLI)
   ↓
5. Generate ReportPack (Playwright output → ReportPack)
   ↓
6. Collect Artifacts (test-results/ → TestArtifact[])
   ↓
7. Save Summary (ReportPack → summary.json)
```

---

## File Storage

### Directory Structure

```
scenarios/
├── inventory/
│   ├── E2E-INVENTORY-001.yaml  # TestScenario
│   └── E2E-INVENTORY-002.yaml
└── order/
    └── E2E-ORDER-001.yaml

test-results/
├── run-{run_id}/
│   ├── index.html              # ReportPack.html_report_path
│   ├── summary.json            # ReportPack (serialized)
│   ├── config.json             # RunConfig (snapshot)
│   └── artifacts/              # TestArtifact files
│       ├── E2E-INVENTORY-002/
│       │   ├── trace.zip
│       │   ├── video.webm
│       │   └── screenshot.png
│       └── ...
└── latest -> run-{latest_id}   # Symlink
```

---

## JSON Schema References

完整的 JSON Schema 定义见 `contracts/` 目录：
- `orchestrator-config.schema.json` - RunConfig 验证
- `report-pack.schema.json` - ReportPack 验证
- `test-artifact.schema.json` - TestArtifact 验证

---

**Generated by**: Phase 1 Design
**Date**: 2025-12-30
**Status**: ✅ Complete

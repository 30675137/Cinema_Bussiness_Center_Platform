# Research Findings: E2E 测试编排器

**Feature**: T001-e2e-orchestrator
**Date**: 2025-12-30
**Phase**: Phase 0 - Research & Technical Decisions

## Overview

本文档记录了 E2E 测试编排器 skill 开发过程中的技术研究结果，解决了 plan.md 中标记的所有 "NEEDS CLARIFICATION" 项。

---

## 1. Playwright CLI 调用最佳实践

### Decision

使用 Python `subprocess.Popen` 调用 `npx playwright test`，通过管道实时捕获输出，使用命令行参数传递配置。

### Rationale

- `subprocess.Popen` 支持实时流式输出（stdout/stderr），适合长时间运行的测试
- Playwright CLI 接受丰富的命令行参数，无需生成临时配置文件
- 通过 `universal_newlines=True` 可以直接获取字符串输出，无需手动解码

### Implementation

```python
import subprocess
import sys

def run_playwright_tests(config):
    """
    执行 Playwright 测试

    Args:
        config: RunConfig 对象，包含 workers, retries, timeout, projects 等

    Returns:
        exit_code: Playwright 进程退出码（0 表示成功）
    """
    cmd = [
        'npx', 'playwright', 'test',
        f'--project={config.project}',  # chromium
        f'--workers={config.workers}',  # 1-10
        f'--retries={config.retries}',  # 0-3
        f'--timeout={config.timeout}',  # 30000ms
        f'--reporter=html',
        f'--grep={config.scenario_pattern}',  # E2E-INVENTORY-.*
    ]

    # 如果指定输出目录
    if config.output_dir:
        cmd.append(f'--output={config.output_dir}')

    # 启动子进程，实时捕获输出
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,  # 合并 stderr 到 stdout
        universal_newlines=True,   # 返回字符串而非字节
        cwd='frontend'              # 在 frontend 目录执行
    )

    # 实时打印输出
    for line in process.stdout:
        print(line, end='')  # 直接输出到控制台

    # 等待进程结束
    exit_code = process.wait()

    return exit_code
```

### Key Playwright CLI Options

| 参数 | 说明 | 示例 |
|------|------|------|
| `--project=chromium` | 指定浏览器项目 | `--project=chromium` |
| `--workers=4` | 并行 worker 数量 | `--workers=4` |
| `--retries=2` | 失败重试次数 | `--retries=2` |
| `--timeout=30000` | 每个测试超时时间（ms） | `--timeout=30000` |
| `--grep=pattern` | 按测试标题过滤 | `--grep=E2E-INVENTORY-.*` |
| `--reporter=html` | 使用 HTML 报告器 | `--reporter=html` |
| `--output=dir` | 输出目录 | `--output=test-results/run-123` |

### Default Report Path

Playwright 默认报告路径：`playwright-report/index.html`（可通过 `playwright.config.ts` 配置）

### Alternatives Considered

1. **使用 `subprocess.run()`**: 不支持实时输出，只能在进程结束后获取所有输出
2. **生成临时 `playwright.config.ts`**: 增加复杂度，命令行参数更简洁
3. **使用 Node.js 脚本调用 Playwright API**: 增加依赖，Python 集成更直接

---

## 2. 跨系统开发服务器管理

### Decision

通过解析场景 YAML 中的 `system` 字段检测所需服务，使用 `subprocess.Popen` 启动 dev servers，通过 TCP 端口检查确认启动成功，使用 `process.terminate()` 优雅停止。

### Rationale

- 场景 YAML 已包含 `system` 字段（c-end/b-end），无需额外配置
- TCP 端口监听检查是可靠的服务就绪检测方法
- Python `signal` 模块支持优雅的进程终止（SIGTERM → SIGKILL）

### Implementation

#### 2.1 检测所需服务

```python
import yaml
from pathlib import Path

def detect_required_services(scenario_files):
    """
    分析场景 YAML，检测需要的开发服务器

    Args:
        scenario_files: 场景 YAML 文件路径列表

    Returns:
        set: 需要的服务集合 {'c-end', 'b-end'}
    """
    required_services = set()

    for file_path in scenario_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            scenario = yaml.safe_load(f)

        # 检查步骤中的 system 字段
        for step in scenario.get('steps', []):
            system = step.get('system')
            if system:
                required_services.add(system)

    return required_services
```

#### 2.2 启动开发服务器

```python
import subprocess
import socket
import time

def start_dev_server(service_name, port, cwd, command):
    """
    启动开发服务器并等待就绪

    Args:
        service_name: 服务名称（c-end/b-end）
        port: 监听端口
        cwd: 工作目录
        command: 启动命令（列表）

    Returns:
        process: subprocess.Popen 对象
    """
    print(f"🚀 Starting {service_name} server on port {port}...")

    # 启动进程
    process = subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True
    )

    # 等待端口监听（最多 30 秒）
    if not wait_for_port(port, timeout=30):
        process.terminate()
        raise RuntimeError(f"Failed to start {service_name} server on port {port}")

    print(f"✅ {service_name} server is ready on port {port}")
    return process

def wait_for_port(port, host='localhost', timeout=30):
    """
    等待端口监听

    Args:
        port: 端口号
        host: 主机地址
        timeout: 超时时间（秒）

    Returns:
        bool: 端口是否可用
    """
    start_time = time.time()

    while time.time() - start_time < timeout:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(1)
                sock.connect((host, port))
                return True
        except (socket.timeout, ConnectionRefusedError):
            time.sleep(1)

    return False
```

#### 2.3 服务配置映射

```python
SERVICE_CONFIG = {
    'c-end': {
        'port': 10086,
        'cwd': 'hall-reserve-taro',
        'command': ['npm', 'run', 'dev:h5']
    },
    'b-end': {
        'port': 3000,
        'cwd': 'frontend',
        'command': ['npm', 'run', 'dev']
    }
}

def start_required_services(required_services):
    """
    启动所需的开发服务器

    Args:
        required_services: 服务集合 {'c-end', 'b-end'}

    Returns:
        dict: 服务名 -> 进程对象的映射
    """
    processes = {}

    for service in required_services:
        if service not in SERVICE_CONFIG:
            print(f"⚠️  Unknown service: {service}, skipping...")
            continue

        config = SERVICE_CONFIG[service]
        process = start_dev_server(
            service_name=service,
            port=config['port'],
            cwd=config['cwd'],
            command=config['command']
        )
        processes[service] = process

    return processes
```

#### 2.4 优雅停止服务

```python
import signal

def stop_services(processes, timeout=5):
    """
    优雅停止所有开发服务器

    Args:
        processes: 服务名 -> 进程对象的映射
        timeout: 等待超时时间（秒）
    """
    for service_name, process in processes.items():
        print(f"🛑 Stopping {service_name} server...")

        # 发送 SIGTERM 信号
        process.terminate()

        try:
            # 等待进程结束
            process.wait(timeout=timeout)
            print(f"✅ {service_name} server stopped gracefully")
        except subprocess.TimeoutExpired:
            # 超时后强制杀死
            print(f"⚠️  {service_name} server did not stop, force killing...")
            process.kill()
            process.wait()
```

### Port Conflict Handling

```python
def check_port_available(port, host='localhost'):
    """
    检查端口是否可用

    Args:
        port: 端口号
        host: 主机地址

    Returns:
        bool: 端口是否空闲
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind((host, port))
            return True
        except OSError:
            return False

# 使用示例
if not check_port_available(10086):
    raise RuntimeError(
        "Port 10086 is already in use. "
        "Please stop the existing C-end dev server or change the port."
    )
```

### Alternatives Considered

1. **使用 health check endpoint**: 需要服务提供 `/health` 接口，增加依赖
2. **解析日志输出判断就绪**: 不同框架日志格式不同，不可靠
3. **固定等待时间（如 10 秒）**: 不灵活，可能过长或过短

---

## 3. 场景 YAML 加载与过滤

### Decision

使用 `pathlib.Path.rglob()` 递归扫描 YAML 文件，使用 `PyYAML` 解析，实现自定义标签过滤器支持 AND/OR 逻辑。

### Rationale

- `pathlib` 是 Python 标准库，无需额外依赖
- `PyYAML` 是成熟的 YAML 解析库
- 自定义过滤器提供灵活的标签匹配逻辑

### Implementation

#### 3.1 递归扫描场景文件

```python
from pathlib import Path
import yaml

def load_all_scenarios(scenarios_dir='scenarios'):
    """
    递归加载所有场景 YAML 文件

    Args:
        scenarios_dir: 场景目录路径

    Returns:
        list: 场景对象列表
    """
    scenarios = []

    # 递归查找所有 .yaml 文件
    for yaml_file in Path(scenarios_dir).rglob('*.yaml'):
        try:
            with open(yaml_file, 'r', encoding='utf-8') as f:
                scenario = yaml.safe_load(f)

            # 添加文件路径到场景对象
            scenario['_file_path'] = str(yaml_file)
            scenarios.append(scenario)

        except Exception as e:
            print(f"⚠️  Failed to load {yaml_file}: {e}")

    return scenarios
```

#### 3.2 标签过滤器

```python
def filter_scenarios_by_tags(scenarios, tag_expr):
    """
    按标签表达式过滤场景

    Args:
        scenarios: 场景列表
        tag_expr: 标签表达式，如 "module:inventory AND priority:p1"

    Returns:
        list: 匹配的场景列表
    """
    if not tag_expr:
        return scenarios

    filtered = []

    for scenario in scenarios:
        if match_tag_expression(scenario.get('tags', {}), tag_expr):
            filtered.append(scenario)

    return filtered

def match_tag_expression(tags, expr):
    """
    匹配标签表达式

    Args:
        tags: 场景标签字典 {'module': ['inventory'], 'priority': 'p1'}
        expr: 标签表达式 "module:inventory AND priority:p1"

    Returns:
        bool: 是否匹配
    """
    # 简化实现：支持 AND/OR 逻辑
    expr = expr.strip()

    # 处理 OR 逻辑
    if ' OR ' in expr:
        parts = expr.split(' OR ')
        return any(match_tag_expression(tags, part.strip()) for part in parts)

    # 处理 AND 逻辑
    if ' AND ' in expr:
        parts = expr.split(' AND ')
        return all(match_tag_expression(tags, part.strip()) for part in parts)

    # 单个标签匹配 "module:inventory"
    if ':' in expr:
        key, value = expr.split(':', 1)
        tag_value = tags.get(key)

        # 支持列表和字符串
        if isinstance(tag_value, list):
            return value in tag_value
        else:
            return tag_value == value

    return False
```

#### 3.3 使用示例

```python
# 加载所有场景
all_scenarios = load_all_scenarios('scenarios')

# 按标签过滤
inventory_scenarios = filter_scenarios_by_tags(
    all_scenarios,
    "module:inventory"
)

# 复杂过滤
priority_scenarios = filter_scenarios_by_tags(
    all_scenarios,
    "module:inventory AND priority:p1"
)

# OR 逻辑
multi_module = filter_scenarios_by_tags(
    all_scenarios,
    "module:inventory OR module:order"
)
```

### Supported Tags

根据 spec.md，支持以下标签类型：
- `module`: 模块标签（inventory, order, product）
- `channel`: 渠道标签（web, mini-program, h5）
- `deploy`: 部署标签（saas, private）
- `priority`: 优先级标签（p1, p2, p3）

### Alternatives Considered

1. **使用正则表达式匹配**: 不支持复杂逻辑，难以维护
2. **使用第三方查询库（如 JMESPath）**: 增加依赖，学习成本高
3. **手动遍历目录**: 不如 `pathlib.rglob()` 简洁

---

## 4. Skill 编排调用机制

### Decision

Claude Code skills 暂不支持编程调用，使用**内置默认实现**策略：在 orchestrator 内部实现基本的场景验证、数据检查、报告配置逻辑。

### Rationale

- Claude Code skills 设计为 CLI 工具，通过 `/skill-name` 命令调用
- 通过 subprocess 调用 `claude` CLI 会增加复杂度和依赖
- 内置默认实现提供 graceful degradation，降低对其他 skills 的硬依赖

### Implementation

#### 4.1 内置场景验证

```python
def validate_scenarios_builtin(scenario_files):
    """
    内置场景验证逻辑（替代 test-scenario-author）

    Args:
        scenario_files: 场景文件路径列表

    Returns:
        bool: 验证是否通过
    """
    print("🔍 Validating scenarios (built-in)...")

    for file_path in scenario_files:
        # 检查文件存在
        if not Path(file_path).exists():
            print(f"❌ Scenario file not found: {file_path}")
            return False

        # 检查 YAML 格式
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                scenario = yaml.safe_load(f)
        except yaml.YAMLError as e:
            print(f"❌ Invalid YAML format in {file_path}: {e}")
            return False

        # 检查必需字段
        required_fields = ['scenario_id', 'title', 'tags', 'steps', 'assertions']
        for field in required_fields:
            if field not in scenario:
                print(f"❌ Missing required field '{field}' in {file_path}")
                return False

    print("✅ All scenarios validated")
    return True
```

#### 4.2 内置测试数据检查

```python
def validate_testdata_builtin(scenarios):
    """
    内置测试数据检查逻辑（替代 e2e-testdata-planner）

    Args:
        scenarios: 场景对象列表

    Returns:
        bool: 验证是否通过
    """
    print("🔍 Validating test data references (built-in)...")

    for scenario in scenarios:
        testdata_ref = scenario.get('preconditions', {}).get('testdata_ref')

        if not testdata_ref:
            continue

        # 解析 testdata_ref: "bomTestData.scenario_001"
        data_file, scenario_key = testdata_ref.split('.', 1)
        data_path = Path('testdata') / f'{data_file}.json'

        # 检查文件存在
        if not data_path.exists():
            print(f"⚠️  Test data file not found: {data_path}")
            print(f"   Referenced in: {scenario['scenario_id']}")
            # 警告但不阻塞执行
            continue

    print("✅ Test data references checked")
    return True
```

#### 4.3 内置报告配置

```python
def configure_report_builtin(run_id):
    """
    内置报告配置逻辑（替代 e2e-report-configurator）

    Args:
        run_id: 运行 ID

    Returns:
        dict: 报告配置
    """
    return {
        'output_dir': f'test-results/run-{run_id}',
        'reporter': 'html',
        'open': False  # 不自动打开浏览器
    }
```

#### 4.4 内置工件策略

```python
def configure_artifacts_builtin():
    """
    内置工件策略（替代 e2e-artifacts-policy）

    Returns:
        dict: 工件配置
    """
    return {
        'trace': 'on-failure',     # 仅失败时记录 trace
        'video': 'on-failure',     # 仅失败时录制视频
        'screenshot': 'on-failure' # 仅失败时截图
    }
```

### Skill Execution Flow with Fallback

```python
def orchestrate_skills(scenarios, config):
    """
    编排 skills 执行，支持回退到内置实现

    Args:
        scenarios: 场景列表
        config: RunConfig 对象

    Returns:
        bool: 编排是否成功
    """
    # 1. 场景验证（内置）
    if not config.skip_scenario_validation:
        if not validate_scenarios_builtin([s['_file_path'] for s in scenarios]):
            return False

    # 2. 测试数据验证（内置）
    if not config.skip_data_validation:
        validate_testdata_builtin(scenarios)

    # 3. 测试生成（如果需要，调用 e2e-test-generator）
    # 注: 这个 skill 必须存在，因为需要生成 .spec.ts 文件
    if not config.skip_generation:
        # TODO: 调用 e2e-test-generator
        pass

    # 4. 报告配置（内置）
    if not config.skip_report_config:
        report_config = configure_report_builtin(config.run_id)
        config.output_dir = report_config['output_dir']

    # 5. 工件策略（内置）
    if not config.skip_artifacts_config:
        artifacts_config = configure_artifacts_builtin()
        config.artifacts = artifacts_config

    # 6. 执行 Playwright（必需，不可跳过）
    exit_code = run_playwright_tests(config)

    return exit_code == 0
```

### Alternatives Considered

1. **通过 subprocess 调用 `claude` CLI**: 增加依赖，需要 Claude Code CLI 可用
2. **要求所有 skills 必须存在**: 降低灵活性，阻塞开发流程
3. **生成临时文件传递数据**: 增加文件 I/O 开销和复杂度

---

## 5. 报告生成与摘要提取

### Decision

使用 Playwright 默认 HTML 报告器（`--reporter=html`），通过解析 `test-results/` 目录提取统计信息，生成独立的 `summary.json` 文件。

### Rationale

- Playwright 内置 HTML 报告器功能完善，无需自定义
- 报告统计信息可以从 Playwright JSON 输出或 HTML 报告元数据中提取
- 独立的 `summary.json` 便于 CI/CD 集成和结果分析

### Implementation

#### 5.1 Playwright 报告配置

```python
def configure_playwright_output(run_id):
    """
    配置 Playwright 输出目录

    Args:
        run_id: 运行 ID

    Returns:
        str: 输出目录路径
    """
    output_dir = f'test-results/run-{run_id}'
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    return output_dir
```

#### 5.2 提取测试统计信息

```python
import json
from pathlib import Path

def extract_test_stats(output_dir):
    """
    从 Playwright 输出提取统计信息

    Args:
        output_dir: Playwright 输出目录

    Returns:
        dict: 统计信息
    """
    # Playwright 生成的 JSON 报告路径（如果配置）
    json_report = Path(output_dir) / 'results.json'

    if json_report.exists():
        with open(json_report, 'r') as f:
            results = json.load(f)

        return {
            'total': results.get('suites', [{}])[0].get('tests', 0),
            'passed': sum(1 for t in results.get('tests', []) if t.get('status') == 'passed'),
            'failed': sum(1 for t in results.get('tests', []) if t.get('status') == 'failed'),
            'skipped': sum(1 for t in results.get('tests', []) if t.get('status') == 'skipped'),
        }

    # 回退：从目录结构推断
    return {
        'total': 0,
        'passed': 0,
        'failed': 0,
        'skipped': 0
    }
```

#### 5.3 生成执行摘要

```python
import datetime

def generate_summary_json(run_id, config, stats, duration):
    """
    生成执行摘要 JSON

    Args:
        run_id: 运行 ID
        config: RunConfig 对象
        stats: 测试统计信息
        duration: 执行时长（秒）

    Returns:
        dict: 摘要对象
    """
    summary = {
        'run_id': run_id,
        'execution_timestamp': datetime.datetime.now().isoformat(),
        'duration_seconds': duration,
        'config': {
            'environment': config.environment,
            'workers': config.workers,
            'retries': config.retries,
            'project': config.project,
        },
        'scenarios': {
            'total': stats['total'],
            'passed': stats['passed'],
            'failed': stats['failed'],
            'skipped': stats['skipped'],
        },
        'artifacts': {
            'html_report': f'test-results/run-{run_id}/index.html',
            'directory': f'test-results/run-{run_id}/artifacts'
        }
    }

    # 写入 summary.json
    summary_path = Path(f'test-results/run-{run_id}') / 'summary.json'
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    return summary
```

#### 5.4 创建符号链接到最新报告

```python
import os

def create_latest_symlink(run_id):
    """
    创建指向最新报告的符号链接

    Args:
        run_id: 运行 ID
    """
    target = Path(f'test-results/run-{run_id}')
    link = Path('test-results/latest')

    # 删除旧的符号链接
    if link.exists() or link.is_symlink():
        link.unlink()

    # 创建新的符号链接
    os.symlink(target, link)
```

### Default Playwright Report Path

根据 Playwright 文档，默认报告路径：
- HTML 报告: `playwright-report/index.html`（可通过 `--output` 自定义）
- JSON 报告: 需要配置 `--reporter=json` 或在 `playwright.config.ts` 中设置

### Report Pack Structure

```
test-results/run-{run_id}/
├── index.html              # Playwright HTML 报告
├── summary.json            # 执行摘要
├── config.json             # 运行配置快照
└── artifacts/              # 测试工件
    ├── E2E-INVENTORY-001/
    │   ├── trace.zip
    │   ├── video.webm
    │   └── screenshot.png
    └── E2E-INVENTORY-002/
        └── trace.zip
```

### Alternatives Considered

1. **自定义 HTML 报告模板**: 增加开发成本，Playwright 默认报告已足够
2. **使用 Allure 报告**: 需要额外依赖和配置，不符合简洁原则
3. **仅生成 JSON 报告**: HTML 报告更便于人类阅读

---

## Summary of Decisions

| 问题 | 决策 | 关键技术 |
|------|------|---------|
| Playwright CLI 调用 | `subprocess.Popen` + 实时输出 | `universal_newlines=True` |
| 开发服务器管理 | TCP 端口检查 + `SIGTERM` 优雅停止 | `socket`, `process.terminate()` |
| 场景 YAML 加载 | `pathlib.rglob()` + PyYAML | `Path.rglob('*.yaml')` |
| 标签过滤 | 自定义 AND/OR 逻辑 | 递归表达式解析 |
| Skill 编排 | 内置默认实现 + 回退策略 | `validate_*_builtin()` |
| 报告生成 | Playwright HTML reporter + `summary.json` | `--reporter=html` |

---

## Dependencies

### Python Libraries

| 库 | 用途 | 是否标准库 |
|----|------|-----------|
| `subprocess` | 进程管理 | ✅ 标准库 |
| `argparse` | CLI 参数解析 | ✅ 标准库 |
| `pathlib` | 文件路径处理 | ✅ 标准库 |
| `json` | JSON 解析 | ✅ 标准库 |
| `yaml` | YAML 解析 | ❌ 需要 `PyYAML` |
| `socket` | 端口检查 | ✅ 标准库 |
| `signal` | 信号处理 | ✅ 标准库 |
| `datetime` | 时间戳生成 | ✅ 标准库 |
| `time` | 延迟等待 | ✅ 标准库 |

### External Tools

- **Node.js**: v18+ (运行 Playwright CLI)
- **Playwright**: 通过 `npx` 调用，需预安装 `@playwright/test`
- **npm**: 启动开发服务器 (`npm run dev`)

---

## Next Steps

1. ✅ Research completed - All "NEEDS CLARIFICATION" items resolved
2. ⏳ Proceed to Phase 1: Design data models and contracts
3. ⏳ Create `data-model.md` defining TestScenario, RunConfig, ReportPack, TestArtifact
4. ⏳ Create `contracts/orchestrator-config.schema.json` (RunConfig schema)
5. ⏳ Create `quickstart.md` with installation and usage guide
6. ⏳ Create `skill.md` with YAML frontmatter and command reference

---

**Generated by**: Phase 0 Research
**Date**: 2025-12-30
**Status**: ✅ Complete

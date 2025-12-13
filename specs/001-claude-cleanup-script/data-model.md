# Data Model: Claude 卸载清理自动化脚本

**Feature**: 001-claude-cleanup-script
**Date**: 2025-12-13
**Reference**: 基于 spec.md 中的 Key Entities（清理步骤、验证检查项）

## Overview

本脚本主要处理系统状态检测、配置管理和操作执行，不涉及持久化数据存储。数据模型主要定义脚本内部使用的数据结构，用于跟踪操作状态和生成报告。

## Core Entities (from Spec)

### 清理步骤 (CleanupStep)

代表一个独立的清理操作（如停止进程、卸载包、清理配置等）。

```python
from dataclasses import dataclass
from enum import Enum
from typing import Optional

class StepStatus(Enum):
    """步骤执行状态"""
    SUCCESS = "success"    # 成功
    FAILED = "failed"      # 失败
    SKIPPED = "skipped"    # 跳过（如组件未安装）

@dataclass
class CleanupStep:
    """清理步骤"""
    name: str                       # 步骤名称
    command: Optional[str]          # 执行的命令
    status: StepStatus              # 执行状态
    message: Optional[str] = None   # 状态消息（错误信息或跳过原因）
    duration: Optional[float] = None  # 执行耗时（秒）
```

**Fields**:
- `name`: 步骤名称，如 "停止 Router 进程"、"卸载 npm 包 @anthropic-ai/claude-code"
- `command`: 执行的命令字符串（用于 dry-run 和日志）
- `status`: 执行状态（SUCCESS/FAILED/SKIPPED）
- `message`: 状态消息，FAILED 时包含错误信息，SKIPPED 时包含跳过原因
- `duration`: 执行耗时（秒），用于性能监控和满足 SC-002（< 5分钟）

**Lifecycle**:
1. 创建步骤：`CleanupStep(name="...", command="...", status=StepStatus.SKIPPED)`
2. 执行步骤：记录开始时间，执行命令，记录结束时间
3. 更新状态：根据执行结果更新 `status` 和 `message`
4. 添加到报告：收集所有步骤，生成最终报告

---

### 验证检查项 (ValidationCheck)

代表一个验证规则（如检查命令是否存在、配置文件是否删除等）。

```python
from dataclasses import dataclass
from enum import Enum
from typing import Optional

class ValidationStatus(Enum):
    """验证状态"""
    PASS = "pass"          # 通过（已清理/正常）
    FAIL = "fail"          # 失败（仍有残留/异常）
    WARNING = "warning"    # 警告（不确定状态）

@dataclass
class ValidationCheck:
    """验证检查项"""
    check_name: str                  # 检查项名称
    command: str                     # 检查命令
    expected: str                    # 期望结果描述
    actual: str                      # 实际结果描述
    status: ValidationStatus         # 验证状态
```

**Fields**:
- `check_name`: 检查项名称，如 "命令 claude 可用性"、"npm 全局包是否已卸载"
- `command`: 执行的检查命令，如 `which claude`、`npm list -g @anthropic-ai/claude-code`
- `expected`: 期望结果，如 "命令不可用"、"包未安装"
- `actual`: 实际结果，如 "command not found"、"包仍然存在"
- `status`: 验证状态（PASS/FAIL/WARNING）

**Validation Categories** (FR-010 to FR-014):
1. 命令验证：`claude`、`ccr` 是否已从 PATH 移除
2. 包验证：npm 全局包是否已卸载
3. 配置验证：用户配置目录是否已清理（`~/.claude`、`~/.claude.json` 等）
4. 环境变量验证：`ANTHROPIC_*`、`SILICONFLOW_*` 是否已清理
5. 进程验证：Router 进程和端口是否已清理

---

## Configuration Data Structures

### 配置文件 (ClaudeSettings)

`~/.claude/settings.json` 的数据结构（FR-027、FR-028）。

```python
from dataclasses import dataclass, field
from typing import Dict, Optional

@dataclass
class ClaudeSettings:
    """Claude 配置文件 (~/.claude/settings.json)"""
    env_vars: Dict[str, str] = field(default_factory=dict)
    permissions: Dict[str, bool] = field(default_factory=dict)
    aliases: Dict[str, str] = field(default_factory=dict)

    @classmethod
    def load(cls, config_path: Path) -> 'ClaudeSettings':
        """从文件加载配置"""
        if not config_path.exists():
            return cls()

        with open(config_path) as f:
            data = json.load(f)

        return cls(
            env_vars=data.get('env_vars', {}),
            permissions=data.get('permissions', {}),
            aliases=data.get('aliases', {})
        )

    def save(self, config_path: Path):
        """保存配置到文件"""
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, 'w') as f:
            json.dump({
                'env_vars': self.env_vars,
                'permissions': self.permissions,
                'aliases': self.aliases
            }, f, indent=2)
```

**Schema Example**:
```json
{
  "env_vars": {
    "ANTHROPIC_API_KEY": "sk-...",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
  },
  "permissions": {
    "dangerously_skip_permissions": false
  },
  "aliases": {
    "cc": "claude --dangerously-skip-permissions",
    "c": "claude"
  }
}
```

**Validation** (启动时检查):
- `env_vars` 必须是 dict
- `permissions` 必须是 dict，值为 bool
- `aliases` 必须是 dict，值为字符串

---

### Shell 配置检测结果 (ShellConfig)

```python
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

@dataclass
class ShellConfig:
    """Shell 配置文件信息"""
    config_file: Path           # 检测到的配置文件路径
    exists: bool                # 文件是否存在
    writable: bool              # 是否可写
    has_claude_vars: bool       # 是否包含 Claude 相关环境变量
    has_claude_aliases: bool    # 是否包含 Claude 相关 alias
```

**Detection Logic** (FR-036):
1. 检测 `$ZDOTDIR/.zshenv`（如果 ZDOTDIR 设置）
2. 回退至 `~/.zshenv`
3. 回退至 `~/.zshrc`
4. 选择第一个存在且可写的文件
5. 如果都不存在，默认使用 `~/.zshenv`（创建新文件）

---

## Installation Detection

### 安装方式检测结果 (InstallationDetection)

```python
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class InstallationDetection:
    """检测到的 Claude 安装信息"""
    npm_global: List[str]       # npm 全局包列表（如 ['@anthropic-ai/claude-code']）
    homebrew: List[str]         # Homebrew 包列表
    native: List[Path]          # Native 安装路径列表
    nvm_versions: Dict[str, List[str]]  # NVM 版本 -> 包列表映射
```

**Example**:
```python
detection = InstallationDetection(
    npm_global=['@anthropic-ai/claude-code', '@musistudio/claude-code-router'],
    homebrew=[],
    native=[Path('~/.local/bin/claude')],
    nvm_versions={
        'v16.20.0': ['@anthropic-ai/claude-code'],
        'v18.17.0': []
    }
)
```

**Detection Methods** (FR-002, FR-003, FR-004, FR-005, FR-035):
- **Npm**: `npm list -g --depth=0` + `which` 命令双重验证
- **Homebrew**: `brew list claude-code` 检查返回码
- **Native**: 检查 `~/.local/bin/claude` 和 `~/.claude-code` 是否存在
- **NVM**: 遍历 `$NVM_DIR/versions/node/*/lib/node_modules/`

---

## Report Data Structures

### 卸载报告 (UninstallReport)

```python
from dataclasses import dataclass
from typing import List
from datetime import datetime

@dataclass
class UninstallReport:
    """卸载操作报告"""
    timestamp: datetime                 # 执行时间
    total_duration: float               # 总耗时（秒）
    steps: List[CleanupStep]            # 所有清理步骤
    backup_location: Optional[Path]     # 备份位置（如果启用）
    validation: List[ValidationCheck]   # 验证结果（如果执行验证）

    @property
    def success_count(self) -> int:
        return sum(1 for s in self.steps if s.status == StepStatus.SUCCESS)

    @property
    def failed_count(self) -> int:
        return sum(1 for s in self.steps if s.status == StepStatus.FAILED)

    @property
    def skipped_count(self) -> int:
        return sum(1 for s in self.steps if s.status == StepStatus.SKIPPED)
```

**Output Format** (FR-019):
```
=== Claude 卸载报告 ===
执行时间：2025-12-13 14:30:00
总耗时：2.5分钟

清理步骤：
  ✓ 停止 Router 进程 (0.2s)
  ✓ 卸载 npm 全局包 @anthropic-ai/claude-code (3.1s)
  - 卸载 Homebrew 包 (跳过：未安装)
  ✓ 清理 ~/.claude 目录 (0.1s)
  ...

统计：
  成功：15 个
  失败：0 个
  跳过：3 个

验证结果：
  ✓ 命令 claude 不可用
  ✓ npm 全局包已卸载
  ✓ 配置文件已清理
  ✓ 环境变量已清理
  ✓ 进程已停止

备份位置：~/claude-backup-20251213-143000/
```

---

## Data Flow Summary

### Install Flow
```
CLI Arguments → InstallationConfig → install_components() → Report
```

### Uninstall Flow
```
CLI Arguments → UninstallConfig → detect_installations() → InstallationDetection
    → [optional] create_backup() → backup_location
    → cleanup_steps() → List[CleanupStep]
    → [optional] validate() → List[ValidationCheck]
    → UninstallReport
```

### Set API Key Flow
```
CLI Arguments → api_key → detect_shell_config() → ShellConfig
    → update_config_file() → success/failure
```

### Verification Flow
```
run_checks() → List[ValidationCheck] → formatted_report
```

---

## State Management

**无持久化状态**：脚本是无状态的，每次执行都是独立操作。

**状态来源**:
- 系统状态：通过子进程命令检测（`subprocess.run()`）
- 配置文件：直接读取文件内容（`Path.read_text()`、`json.load()`）
- 环境变量：通过 `os.environ` 读取

**状态变更**:
- 安装/卸载：通过子进程命令修改系统（`npm install/uninstall`、`brew uninstall`）
- 配置管理：直接读写文件（`Path.write_text()`）
- 进程管理：通过 `pkill` 命令终止进程

---

## Type Safety

使用 Python 3.8+ 类型提示和 dataclasses：

- `@dataclass` 装饰器：自动生成 `__init__`、`__repr__`、`__eq__` 方法
- `Optional[T]`：表示可选字段（可能为 None）
- `List[T]`、`Dict[K, V]`：集合类型注解
- `Enum`：枚举类型，类型安全的常量定义
- `Path`：使用 `pathlib.Path` 代替字符串路径

支持静态类型检查（可选，使用 `mypy`）和 IDE 自动完成。

---

## Error Handling Strategy

所有数据结构都应优雅处理错误（FR-018）：

1. **FileNotFoundError**: 捕获并设置 `status=SKIPPED`，`message="文件不存在"`
2. **PermissionError**: 捕获并设置 `status=FAILED`，`message="权限不足"`
3. **subprocess.CalledProcessError**: 捕获并设置 `status=FAILED`，记录返回码和输出
4. **subprocess.TimeoutExpired**: 捕获并设置 `status=FAILED`，`message="命令超时"`
5. **JSON decode error**: 捕获并使用默认配置或报告错误

错误信息应包含足够上下文用于调试，在 verbose 模式下输出完整堆栈跟踪。

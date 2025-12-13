# Data Model: Claude 卸载清理自动化脚本

**Feature**: 001-claude-cleanup-script  
**Date**: 2025-12-13

## Overview

本脚本主要处理系统状态检测、配置管理和操作执行，不涉及持久化数据存储。数据模型主要定义脚本内部使用的数据结构。

## Core Data Structures

### InstallationConfig

表示安装配置，用于 `install` 子命令。

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class InstallationConfig:
    """安装配置"""
    components: List[str]  # ['cli', 'router'] 或 ['cli'] 或 ['router']
    method: str = 'npm'  # 安装方式，目前仅支持 'npm'
    api_key: Optional[str] = None  # 可选的 API key（如果用户选择同时设置）
```

**Fields**:
- `components`: 要安装的组件列表，可选值 `'cli'`、`'router'`
- `method`: 安装方式，当前仅支持 `'npm'`
- `api_key`: 可选的 API key，如果提供则在安装后自动设置

**Validation**:
- `components` 不能为空
- `components` 中的值必须是 `'cli'` 或 `'router'`
- `method` 必须是 `'npm'`（当前版本）

---

### UninstallConfig

表示卸载配置，用于 `uninstall` 子命令。

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class UninstallConfig:
    """卸载配置"""
    backup: bool = False  # 是否在卸载前备份配置文件
    backup_dir: Optional[str] = None  # 备份目录，默认 ~/.claude-cleanup-backup/
    methods: List[str] = None  # 要清理的安装方式，None 表示自动检测所有方式
```

**Fields**:
- `backup`: 是否在卸载前备份配置文件
- `backup_dir`: 备份目录路径，如果为 `None` 则使用默认路径
- `methods`: 要清理的安装方式列表，可选值 `'npm'`、`'homebrew'`、`'native'`，`None` 表示自动检测所有方式

**Validation**:
- 如果 `backup` 为 `True`，`backup_dir` 必须可写或为 `None`（使用默认路径）

---

### ApiKeyConfig

表示 API key 配置，用于 `set-api-key` 子命令。

```python
from dataclasses import dataclass
from pathlib import Path

@dataclass
class ApiKeyConfig:
    """API key 配置"""
    api_key: str  # API key 值
    config_file: Optional[Path] = None  # 配置文件路径，None 表示自动检测（~/.zshrc 或 ~/.zshenv）
    update_existing: bool = True  # 如果已存在则更新
```

**Fields**:
- `api_key`: API key 值（必须提供）
- `config_file`: 目标配置文件路径，如果为 `None` 则自动检测（优先 `~/.zshrc`，其次 `~/.zshenv`）
- `update_existing`: 如果配置文件中已存在 `ANTHROPIC_API_KEY`，是否更新它

**Validation**:
- `api_key` 不能为空
- `api_key` 应该是有效的字符串（可以添加格式验证）
- `config_file` 如果指定，必须存在且可写

---

### CleanupStep

表示一个清理步骤的执行结果。

```python
from dataclasses import dataclass
from enum import Enum
from typing import Optional

class StepStatus(Enum):
    """步骤状态"""
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class CleanupStep:
    """清理步骤"""
    name: str  # 步骤名称
    status: StepStatus  # 执行状态
    message: Optional[str] = None  # 状态消息（错误信息或跳过原因）
    duration: Optional[float] = None  # 执行耗时（秒）
```

**Fields**:
- `name`: 步骤名称，如 "停止 Router 进程"、"卸载 npm 包" 等
- `status`: 执行状态（成功/失败/跳过）
- `message`: 状态消息，失败时包含错误信息，跳过时包含跳过原因
- `duration`: 执行耗时（秒），用于性能监控

**Usage**:
用于记录和报告每个清理步骤的执行情况。

---

### ValidationResult

表示一个验证检查项的结果。

```python
from dataclasses import dataclass
from enum import Enum

class ValidationStatus(Enum):
    """验证状态"""
    PASS = "pass"  # 通过（已清理）
    FAIL = "fail"  # 失败（仍有残留）
    WARNING = "warning"  # 警告（不确定状态）

@dataclass
class ValidationResult:
    """验证结果"""
    check_name: str  # 检查项名称
    status: ValidationStatus  # 验证状态
    expected: str  # 期望结果
    actual: str  # 实际结果
    command: Optional[str] = None  # 执行的检查命令
```

**Fields**:
- `check_name`: 检查项名称，如 "命令 claude 是否可用"、"配置文件 ~/.claude 是否删除" 等
- `status`: 验证状态（通过/失败/警告）
- `expected`: 期望结果描述
- `actual`: 实际结果描述
- `command`: 执行的检查命令（用于调试）

**Usage**:
用于 `verify` 子命令，生成验证报告。

---

### ProcessInfo

表示进程信息，用于进程检测和管理。

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class ProcessInfo:
    """进程信息"""
    pid: int  # 进程 ID
    name: str  # 进程名称
    cmdline: Optional[str] = None  # 命令行参数
    port: Optional[int] = None  # 监听的端口（如果适用）
```

**Fields**:
- `pid`: 进程 ID
- `name`: 进程名称
- `cmdline`: 完整的命令行参数
- `port`: 监听的端口（用于 Router 进程检测）

**Usage**:
用于 `core/process_manager.py`，检测和管理 Claude Code Router 相关进程。

---

## Data Flow

### Install Flow

```
User Input (components, api_key?)
    ↓
InstallationConfig
    ↓
core/package_manager.install()
    ↓
Success/Failure Report
```

### Uninstall Flow

```
User Input (backup?, methods?)
    ↓
UninstallConfig
    ↓
core/backup_manager.backup() [if backup=True]
    ↓
core/process_manager.stop_processes()
    ↓
core/package_manager.uninstall()
    ↓
core/config_cleaner.cleanup()
    ↓
core/env_manager.cleanup_env_vars()
    ↓
List[CleanupStep] (执行结果列表)
    ↓
verify.verify() [可选]
    ↓
ValidationReport
```

### Set API Key Flow

```
User Input (api_key, config_file?)
    ↓
ApiKeyConfig
    ↓
core/env_manager.set_api_key()
    ↓
Success/Failure Report
```

### Verify Flow

```
User Input (无)
    ↓
core/validators.check_all()
    ↓
List[ValidationResult]
    ↓
Formatted Report (使用 rich)
```

---

## State Management

脚本是无状态的，每次执行都是独立的操作。不维护任何持久化状态（除了备份文件）。

**状态来源**:
- 系统状态：通过命令执行检测（`npm list`、`brew list`、`ps aux` 等）
- 配置文件：直接读取文件内容
- 环境变量：通过 `os.environ` 读取

**状态变更**:
- 安装/卸载：修改系统状态（包、进程、文件）
- 设置 API key：修改配置文件
- 清理：删除文件和配置

---

## Error Handling

所有数据结构都应该能够处理以下错误情况：

1. **文件不存在**：使用 `Path.exists()` 检查
2. **权限不足**：捕获 `PermissionError` 异常
3. **命令执行失败**：捕获 `subprocess.CalledProcessError`
4. **进程不存在**：捕获 `psutil.NoSuchProcess`

错误信息应该包含在 `CleanupStep.message` 或 `ValidationResult.actual` 中。

---

## Type Safety

使用 Python 3.8+ 的类型提示（`typing` 模块）和 `dataclasses` 确保类型安全：

- 所有数据类使用 `@dataclass` 装饰器
- 使用 `Optional[T]` 表示可选字段
- 使用 `List[T]` 表示列表类型
- 使用 `Enum` 表示枚举类型

这样可以提供更好的 IDE 支持和静态类型检查（使用 `mypy`）。

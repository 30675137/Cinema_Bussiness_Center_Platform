# Quick Start Guide: Claude 卸载清理自动化脚本

**Feature**: 001-claude-cleanup-script  
**Date**: 2025-12-13

## 概述

本指南帮助开发者快速开始开发 Claude 卸载清理自动化脚本。

## 前置要求

### 系统要求
- macOS (Darwin)
- Python 3.8+
- zsh shell
- npm（用于安装功能）

### 开发依赖
- `click` - CLI 框架
- `rich` - 终端美化
- `psutil` - 进程管理
- `pytest` - 测试框架（开发依赖）

## 快速开始

### 1. 安装依赖

创建 `requirements.txt`:
```txt
click>=8.1.0
rich>=13.0.0
psutil>=5.9.0
```

创建 `requirements-dev.txt`:
```txt
pytest>=7.0.0
pytest-cov>=4.0.0
mypy>=1.0.0
```

安装依赖:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 2. 创建项目结构

```bash
cd scripts
mkdir -p commands core utils tests/fixtures
touch claude_manager.py
touch commands/__init__.py commands/install.py commands/uninstall.py commands/set_api_key.py commands/verify.py
touch core/__init__.py core/process_manager.py core/package_manager.py core/config_cleaner.py core/env_manager.py core/backup_manager.py
touch utils/__init__.py utils/shell.py utils/file_ops.py utils/validators.py utils/logger.py
touch tests/__init__.py tests/test_install.py tests/test_uninstall.py tests/test_set_api_key.py tests/test_verify.py
```

### 3. 实现主入口

`claude_manager.py`:
```python
#!/usr/bin/env python3
"""Claude Code CLI/Router 管理工具"""

import click
from rich.console import Console

console = Console()

@click.group()
def cli():
    """Claude Code CLI/Router 管理工具"""
    pass

@cli.command()
def install():
    """安装 Claude Code CLI 和/或 Router"""
    console.print("[green]安装功能开发中...[/green]")
    # TODO: 实现安装逻辑

@cli.command()
def uninstall():
    """卸载 Claude Code CLI 和 Router"""
    console.print("[green]卸载功能开发中...[/green]")
    # TODO: 实现卸载逻辑

@cli.command()
def set_api_key():
    """设置或更新 API key"""
    console.print("[green]设置 API key 功能开发中...[/green]")
    # TODO: 实现设置 API key 逻辑

@cli.command()
def verify():
    """验证清理是否彻底完成"""
    console.print("[green]验证功能开发中...[/green]")
    # TODO: 实现验证逻辑

if __name__ == '__main__':
    cli()
```

### 4. 测试基本功能

```bash
# 使脚本可执行
chmod +x claude_manager.py

# 测试帮助信息
python claude_manager.py --help

# 测试子命令
python claude_manager.py install --help
python claude_manager.py uninstall --help
```

## 开发步骤

### Phase 1: 核心工具模块

#### 1.1 实现 `utils/logger.py`

提供统一的日志输出功能，使用 `rich` 格式化：

```python
from rich.console import Console
from rich.progress import Progress

console = Console()

def log_success(message: str):
    console.print(f"[green]✓[/green] {message}")

def log_error(message: str):
    console.print(f"[red]✗[/red] {message}")

def log_info(message: str):
    console.print(f"[blue]ℹ[/blue] {message}")
```

#### 1.2 实现 `utils/shell.py`

提供 Shell 命令执行工具：

```python
import subprocess
from typing import Optional, List

def run_command(cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
    """执行 Shell 命令"""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=check
        )
        return result
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"命令执行失败: {e}")
```

#### 1.3 实现 `core/process_manager.py`

实现进程检测和管理：

```python
import psutil
from typing import List
from dataclasses import dataclass

@dataclass
class ProcessInfo:
    pid: int
    name: str
    cmdline: Optional[str] = None

def find_claude_processes() -> List[ProcessInfo]:
    """查找所有 Claude 相关进程"""
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        name = proc.info['name'].lower()
        if 'claude' in name or 'claude-code-router' in name:
            processes.append(ProcessInfo(
                pid=proc.info['pid'],
                name=proc.info['name'],
                cmdline=' '.join(proc.info['cmdline'] or [])
            ))
    return processes

def stop_processes(processes: List[ProcessInfo]) -> bool:
    """停止进程列表"""
    for proc_info in processes:
        try:
            proc = psutil.Process(proc_info.pid)
            proc.terminate()
            proc.wait(timeout=5)
        except psutil.NoSuchProcess:
            pass
        except psutil.TimeoutExpired:
            proc.kill()
    return True
```

### Phase 2: 子命令实现

#### 2.1 实现 `commands/install.py`

```python
import click
from rich.console import Console
from rich.prompt import Confirm, Prompt
from core.package_manager import install_cli, install_router
from core.env_manager import set_api_key as set_env_api_key

console = Console()

@click.command()
@click.option('--cli', is_flag=True, help='安装 Claude Code CLI')
@click.option('--router', is_flag=True, help='安装 Claude Code Router')
@click.option('--api-key', help='API key（可选）')
@click.option('--no-interactive', is_flag=True, help='非交互模式')
def install(cli: bool, router: bool, api_key: str, no_interactive: bool):
    """安装 Claude Code CLI 和/或 Router"""
    # 检查 npm
    if not check_npm():
        console.print("[red]✗[/red] npm 未安装，请先安装 Node.js 和 npm")
        raise click.Abort()
    
    # 交互式选择组件
    if not no_interactive:
        if not cli and not router:
            choice = Prompt.ask(
                "选择要安装的组件",
                choices=["both", "cli", "router"],
                default="both"
            )
            if choice in ["both", "cli"]:
                cli = True
            if choice in ["both", "router"]:
                router = True
    
    # 安装组件
    if cli:
        install_cli()
    if router:
        install_router()
    
    # 设置 API key
    if api_key or (not no_interactive and Confirm.ask("是否现在设置 API key?")):
        key = api_key or Prompt.ask("请输入 API key", password=True)
        set_env_api_key(key)
```

#### 2.2 实现 `commands/uninstall.py`

参考 `install.py` 的实现模式，调用 `core` 模块的清理功能。

### Phase 3: 测试

#### 3.1 单元测试示例

`tests/test_process_manager.py`:
```python
import pytest
from core.process_manager import find_claude_processes

def test_find_claude_processes():
    """测试进程查找功能"""
    processes = find_claude_processes()
    # 如果没有运行中的进程，应该返回空列表
    assert isinstance(processes, list)
```

#### 3.2 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_process_manager.py

# 运行测试并显示覆盖率
pytest --cov=scripts --cov-report=html
```

## 开发最佳实践

### 1. 错误处理

所有可能失败的操作都应该使用 `try-except` 包装：

```python
def safe_operation():
    try:
        # 可能失败的操作
        result = risky_operation()
        log_success("操作成功")
        return result
    except FileNotFoundError:
        log_error("文件不存在")
        return None
    except PermissionError:
        log_error("权限不足")
        raise
    except Exception as e:
        log_error(f"未知错误: {e}")
        return None
```

### 2. 日志输出

使用 `rich` 提供清晰的日志输出：

```python
from rich.console import Console
from rich.table import Table

console = Console()

# 成功消息
console.print("[green]✓[/green] 安装成功")

# 错误消息
console.print("[red]✗[/red] 安装失败: npm 未安装")

# 表格报告
table = Table(title="清理报告")
table.add_column("步骤")
table.add_column("状态")
table.add_row("停止进程", "[green]✓[/green] 成功")
console.print(table)
```

### 3. 类型提示

使用类型提示提升代码质量：

```python
from typing import List, Optional
from pathlib import Path

def set_api_key(api_key: str, config_file: Optional[Path] = None) -> bool:
    """设置 API key"""
    # 实现...
    return True
```

### 4. 文档字符串

为所有公共函数添加文档字符串：

```python
def install_cli() -> bool:
    """
    安装 Claude Code CLI。
    
    Returns:
        bool: 安装是否成功
        
    Raises:
        RuntimeError: npm 未安装或安装失败
    """
    # 实现...
```

## 调试技巧

### 1. 启用详细输出

使用 `--verbose` 选项查看详细日志：

```bash
python claude_manager.py install --verbose
```

### 2. 使用 Python 调试器

```python
import pdb

def some_function():
    pdb.set_trace()  # 设置断点
    # 代码...
```

### 3. 测试单个模块

```bash
# 直接运行 Python 模块
python -m core.process_manager
```

## 常见问题

### Q: 如何测试安装功能而不实际安装？

A: 使用 mock 或 dry-run 模式：

```python
@click.option('--dry-run', is_flag=True, help='仅显示将要执行的操作，不实际执行')
def install(dry_run: bool):
    if dry_run:
        console.print("[yellow]Dry-run 模式: 将执行以下操作...[/yellow]")
        # 显示操作列表
    else:
        # 实际执行
```

### Q: 如何处理权限不足的情况？

A: 检测权限并给出清晰的错误提示：

```python
import os

def check_permissions(file_path: Path) -> bool:
    if not os.access(file_path, os.W_OK):
        console.print(f"[red]✗[/red] 权限不足: 无法写入 {file_path}")
        console.print("[yellow]提示: 请检查文件权限或使用 sudo[/yellow]")
        return False
    return True
```

## 下一步

1. 完成所有核心模块的实现
2. 实现所有子命令
3. 编写完整的测试套件
4. 更新 README.md 使用文档
5. 进行集成测试

## 参考资源

- [Click 文档](https://click.palletsprojects.com/)
- [Rich 文档](https://rich.readthedocs.io/)
- [psutil 文档](https://psutil.readthedocs.io/)
- [pytest 文档](https://docs.pytest.org/)

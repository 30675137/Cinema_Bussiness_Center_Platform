# Quick Start Guide: Claude 卸载清理自动化脚本

**Feature**: 001-claude-cleanup-script
**Date**: 2025-12-13
**Target Developers**: Python 开发者，熟悉 CLI 工具开发

## 概述

本指南帮助开发者快速开始开发 Claude 卸载清理自动化脚本。脚本使用 Python 标准库实现，无第三方依赖，可直接运行。

## 前置要求

### 系统要求
- **macOS** (Darwin 25.1.0+)
- **Python 3.8+**（支持 dataclasses、类型提示）
- **zsh shell**（脚本仅支持 zsh）
- **npm**（用于安装功能，可选）

### 开发依赖
- **pytest**：测试框架（开发依赖）
- **mypy**：可选的类型检查工具

```bash
# 安装开发依赖
pip install pytest pytest-cov mypy
```

**注意**：运行时无需任何第三方依赖，仅使用 Python 3.8+ 标准库。

---

## 快速开始

### 1. 项目结构

```
scripts/
└── claude_manager.py    # 主脚本（~800 行，单文件实现）

tests/
├── unit/
│   ├── test_installer.py
│   ├── test_uninstaller.py
│   ├── test_config_manager.py
│   ├── test_shell_detector.py
│   └── test_validator.py
├── integration/
│   ├── test_install_flow.py
│   ├── test_uninstall_flow.py
│   └── test_dry_run.py
└── fixtures/
    ├── mock_zshrc
    ├── mock_settings.json
    └── mock_npm_output
```

### 2. 创建主脚本骨架

`scripts/claude_manager.py`:

```python
#!/usr/bin/env python3
"""
Claude Code CLI/Router 管理工具

自动化安装、卸载、配置 Claude Code CLI 和 Claude Code Router
"""

import argparse
import subprocess
import json
import logging
import sys
import os
from pathlib import Path
from typing import List, Optional, Dict
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
import time
import shutil
import re

# ============================================================================
# 数据结构
# ============================================================================

class StepStatus(Enum):
    """步骤执行状态"""
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class CleanupStep:
    """清理步骤"""
    name: str
    command: Optional[str]
    status: StepStatus
    message: Optional[str] = None
    duration: Optional[float] = None

# ============================================================================
# 全局配置
# ============================================================================

DRY_RUN = False  # dry-run 模式标志


# ============================================================================
# 工具函数
# ============================================================================

def setup_logging(verbose: bool = False, quiet: bool = False):
    """设置日志级别"""
    if quiet:
        level = logging.ERROR
    elif verbose:
        level = logging.DEBUG
    else:
        level = logging.INFO

    logging.basicConfig(
        level=level,
        format='%(levelname)s: %(message)s'
    )

def execute_command(cmd: List[str], description: str, timeout: int = 30) -> bool:
    """执行命令（支持 dry-run）"""
    global DRY_RUN

    if DRY_RUN:
        logging.info(f"[DRY-RUN] Would execute: {description}")
        logging.debug(f"[DRY-RUN] Command: {' '.join(cmd)}")
        return True
    else:
        logging.info(f"Executing: {description}")
        try:
            result = subprocess.run(cmd, capture_output=True, timeout=timeout)
            return result.returncode == 0
        except subprocess.TimeoutExpired:
            logging.error(f"Command timeout: {description}")
            return False


# ============================================================================
# 子命令实现
# ============================================================================

def cmd_install(args):
    """安装子命令"""
    logging.info("安装功能开发中...")
    # TODO: 实现安装逻辑
    return 0

def cmd_uninstall(args):
    """卸载子命令"""
    logging.info("卸载功能开发中...")
    # TODO: 实现卸载逻辑
    return 0

def cmd_set_api_key(args):
    """设置 API key 子命令"""
    logging.info("设置 API key 功能开发中...")
    # TODO: 实现 API key 设置逻辑
    return 0

def cmd_set_config(args):
    """设置配置子命令"""
    logging.info("设置配置功能开发中...")
    # TODO: 实现配置设置逻辑
    return 0


# ============================================================================
# 主函数
# ============================================================================

def main():
    """主函数：解析参数并调用子命令"""
    parser = argparse.ArgumentParser(description='Claude Code CLI/Router 管理工具')

    # 全局选项
    parser.add_argument('--dry-run', action='store_true', help='预览模式，不实际执行操作')
    parser.add_argument('--verbose', '-v', action='store_true', help='详细日志模式')
    parser.add_argument('--quiet', '-q', action='store_true', help='安静模式，仅显示错误和结果')

    # 子命令
    subparsers = parser.add_subparsers(dest='command', required=True, help='子命令')

    # install 子命令
    install_parser = subparsers.add_parser('install', help='安装 Claude 组件')
    install_parser.add_argument('--components', choices=['cli', 'router', 'both'], help='要安装的组件')
    install_parser.add_argument('--api-key', help='API key（可选）')
    install_parser.add_argument('--skip-alias', action='store_true', help='跳过 alias 创建')

    # uninstall 子命令
    uninstall_parser = subparsers.add_parser('uninstall', help='卸载 Claude 组件')
    uninstall_parser.add_argument('--backup', action='store_true', help='卸载前备份配置文件')
    uninstall_parser.add_argument('--skip-verification', action='store_true', help='跳过验证步骤')

    # set-api-key 子命令
    api_key_parser = subparsers.add_parser('set-api-key', help='设置 API key')
    api_key_parser.add_argument('api_key', nargs='?', help='API key 值')
    api_key_parser.add_argument('--config-file', type=Path, help='配置文件路径')

    # set-config 子命令
    config_parser = subparsers.add_parser('set-config', help='设置完整配置')
    config_parser.add_argument('--env', action='append', help='环境变量 KEY=VALUE')
    config_parser.add_argument('--permission', action='append', help='权限 KEY=VALUE')
    config_parser.add_argument('--alias', action='append', help='Alias NAME=COMMAND')

    args = parser.parse_args()

    # 设置全局标志
    global DRY_RUN
    DRY_RUN = args.dry_run

    # 设置日志
    setup_logging(args.verbose, args.quiet)

    # 调用子命令
    commands = {
        'install': cmd_install,
        'uninstall': cmd_uninstall,
        'set-api-key': cmd_set_api_key,
        'set-config': cmd_set_config,
    }

    return commands[args.command](args)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        logging.info("\n用户中断")
        sys.exit(130)
    except Exception as e:
        logging.error(f"未知错误: {e}")
        sys.exit(1)
```

### 3. 测试脚本

```bash
# 使脚本可执行
chmod +x scripts/claude_manager.py

# 测试帮助信息
python scripts/claude_manager.py --help

# 测试子命令
python scripts/claude_manager.py install --help
python scripts/claude_manager.py uninstall --help

# 测试 dry-run 模式
python scripts/claude_manager.py install --dry-run --verbose
```

---

## 开发步骤

### Phase 1: 实现核心检测功能

#### 1.1 Shell 配置文件检测

```python
def detect_zsh_config() -> Path:
    """检测用户当前 shell 实际使用的配置文件（FR-036）"""
    zdotdir = os.environ.get('ZDOTDIR', os.path.expanduser('~'))
    candidates = [
        Path(zdotdir) / '.zshenv',
        Path.home() / '.zshenv',
        Path.home() / '.zshrc'
    ]

    for config_file in candidates:
        if config_file.exists() and os.access(config_file, os.W_OK):
            logging.debug(f"Detected shell config: {config_file}")
            return config_file

    # 默认使用 ~/.zshenv（将创建）
    return Path.home() / '.zshenv'
```

#### 1.2 安装方式检测

```python
def detect_npm_package(package_name: str) -> bool:
    """检测 npm 全局包是否已安装（双重验证）"""
    try:
        # npm list 检测
        result = subprocess.run(
            ['npm', 'list', '-g', '--depth=0', package_name],
            capture_output=True, text=True, timeout=10
        )
        npm_installed = package_name in result.stdout

        # which 命令双重验证
        cmd_name = package_name.split('/')[-1]
        which_result = subprocess.run(['which', cmd_name], capture_output=True)
        cmd_available = which_result.returncode == 0

        return npm_installed and cmd_available
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def detect_all_installations() -> Dict[str, List[str]]:
    """检测所有安装方式（FR-035）"""
    installations = {
        'npm_global': [],
        'homebrew': [],
        'native': [],
        'nvm_versions': {}
    }

    # npm 全局包检测
    for pkg in ['@anthropic-ai/claude-code', '@musistudio/claude-code-router']:
        if detect_npm_package(pkg):
            installations['npm_global'].append(pkg)

    # Homebrew 检测
    try:
        result = subprocess.run(['brew', 'list', 'claude-code'], capture_output=True, timeout=5)
        if result.returncode == 0:
            installations['homebrew'].append('claude-code')
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Native 安装检测
    native_paths = [
        Path.home() / '.local' / 'bin' / 'claude',
        Path.home() / '.claude-code'
    ]
    for path in native_paths:
        if path.exists():
            installations['native'].append(str(path))

    # NVM 检测
    nvm_dir = os.environ.get('NVM_DIR', os.path.expanduser('~/.nvm'))
    versions_dir = Path(nvm_dir) / 'versions' / 'node'
    if versions_dir.exists():
        for version_dir in versions_dir.glob('v*/'):
            version_packages = []
            for pkg in ['@anthropic-ai/claude-code', '@musistudio/claude-code-router']:
                pkg_path = version_dir / 'lib' / 'node_modules' / pkg
                if pkg_path.exists():
                    version_packages.append(pkg)
            if version_packages:
                installations['nvm_versions'][version_dir.name] = version_packages

    return installations
```

### Phase 2: 实现清理功能

#### 2.1 进程管理

```python
def kill_processes(process_name: str):
    """停止指定进程（FR-001）"""
    try:
        # 查找进程
        pgrep = subprocess.run(['pgrep', '-f', process_name], capture_output=True)
        if pgrep.returncode != 0:
            logging.info(f"No {process_name} processes running")
            return

        # SIGTERM 优雅终止
        execute_command(['pkill', '-SIGTERM', '-f', process_name], f"Stop {process_name} (SIGTERM)")
        time.sleep(5)

        # 检查是否仍在运行
        still_running = subprocess.run(['pgrep', '-f', process_name], capture_output=True)
        if still_running.returncode == 0:
            # SIGKILL 强制终止
            execute_command(['pkill', '-SIGKILL', '-f', process_name], f"Force stop {process_name} (SIGKILL)")
            logging.warning(f"Force killed {process_name} processes")
    except Exception as e:
        logging.warning(f"Failed to kill {process_name}: {e}")
```

#### 2.2 配置文件备份

```python
def create_backup() -> Path:
    """创建配置文件备份（FR-015）"""
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup_dir = Path.home() / f'claude-backup-{timestamp}'
    backup_dir.mkdir(parents=True, exist_ok=True)

    # 备份 ~/.claude
    claude_dir = Path.home() / '.claude'
    if claude_dir.exists():
        shutil.copytree(claude_dir, backup_dir / '.claude')
        logging.info(f"Backed up ~/.claude to {backup_dir}")

    # 备份 shell 配置
    zsh_config = detect_zsh_config()
    if zsh_config.exists():
        shutil.copy(zsh_config, backup_dir / zsh_config.name)
        logging.info(f"Backed up {zsh_config.name} to {backup_dir}")

    return backup_dir
```

### Phase 3: 实现安装功能

```python
def cmd_install(args):
    """安装子命令实现"""
    # 1. 检查 npm 可用性
    try:
        result = subprocess.run(['which', 'npm'], capture_output=True)
        if result.returncode != 0:
            logging.error("npm not available. Please install Node.js and npm first.")
            return 3
    except FileNotFoundError:
        logging.error("npm not found")
        return 3

    # 2. 组件选择
    if not args.components:
        print("请选择要安装的组件:")
        print("  1. Claude Code CLI")
        print("  2. Claude Code Router")
        print("  3. 两者都安装")
        choice = input("请输入选项 (1/2/3) [默认: 3]: ").strip() or "3"

        if choice == "1":
            components = ['cli']
        elif choice == "2":
            components = ['router']
        else:
            components = ['cli', 'router']
    else:
        if args.components == 'both':
            components = ['cli', 'router']
        else:
            components = [args.components]

    # 3. 安装组件
    packages = {
        'cli': '@anthropic-ai/claude-code',
        'router': '@musistudio/claude-code-router'
    }

    for comp in components:
        pkg = packages[comp]
        if execute_command(['npm', 'install', '-g', pkg], f"Install {pkg}"):
            logging.info(f"✓ Successfully installed {pkg}")
        else:
            logging.error(f"✗ Failed to install {pkg}")
            return 2

    # 4. Alias 创建（可选）
    if 'cli' in components and not args.skip_alias:
        create_alias = input("是否创建 alias? (y/n) [默认: y]: ").strip().lower() or 'y'
        if create_alias == 'y':
            config_file = detect_zsh_config()
            # TODO: 写入 alias 到配置文件
            logging.info(f"✓ Alias created in {config_file}")

    return 0
```

---

## 测试开发

### 单元测试示例

`tests/unit/test_shell_detector.py`:

```python
import pytest
from pathlib import Path
from unittest.mock import patch, Mock
import os

def test_detect_zsh_config_zshenv_exists(tmp_path):
    """测试 .zshenv 存在时的检测"""
    zshenv = tmp_path / '.zshenv'
    zshenv.touch()

    with patch('Path.home', return_value=tmp_path):
        from claude_manager import detect_zsh_config
        result = detect_zsh_config()
        assert result == zshenv

def test_detect_zsh_config_fallback_to_zshrc(tmp_path):
    """测试回退到 .zshrc"""
    zshrc = tmp_path / '.zshrc'
    zshrc.touch()

    with patch('Path.home', return_value=tmp_path):
        from claude_manager import detect_zsh_config
        result = detect_zsh_config()
        assert result == zshrc
```

### 集成测试示例

`tests/integration/test_dry_run.py`:

```python
import pytest
import subprocess

def test_install_dry_run():
    """测试 install --dry-run 不实际安装"""
    result = subprocess.run(
        ['python', 'scripts/claude_manager.py', 'install', '--dry-run', '--components', 'cli'],
        capture_output=True, text=True
    )

    # 验证退出码为 0
    assert result.returncode == 0

    # 验证输出包含 [DRY-RUN] 标识
    assert '[DRY-RUN]' in result.stdout or '[DRY-RUN]' in result.stderr
```

### 运行测试

```bash
# 运行所有测试
pytest

# 运行指定测试文件
pytest tests/unit/test_shell_detector.py

# 运行测试并显示覆盖率
pytest --cov=scripts --cov-report=html

# 运行测试并显示详细输出
pytest -v
```

---

## 开发最佳实践

### 1. 错误处理（FR-018）

```python
def cleanup_step_wrapper(step_name: str, step_func):
    """清理步骤包装器，确保单步失败不中断流程"""
    start_time = time.time()
    try:
        result = step_func()
        duration = time.time() - start_time
        logging.info(f"✓ {step_name} ({duration:.1f}s)")
        return CleanupStep(step_name, None, StepStatus.SUCCESS, None, duration)
    except FileNotFoundError as e:
        duration = time.time() - start_time
        logging.info(f"- {step_name} (skipped: {e})")
        return CleanupStep(step_name, None, StepStatus.SKIPPED, str(e), duration)
    except PermissionError as e:
        duration = time.time() - start_time
        logging.error(f"✗ {step_name} (failed: {e})")
        return CleanupStep(step_name, None, StepStatus.FAILED, str(e), duration)
    except Exception as e:
        duration = time.time() - start_time
        logging.error(f"✗ {step_name} (failed: {e})")
        return CleanupStep(step_name, None, StepStatus.FAILED, str(e), duration)
```

### 2. 类型提示

```python
from typing import List, Optional, Dict
from pathlib import Path

def set_api_key(api_key: str, config_file: Optional[Path] = None) -> bool:
    """
    设置 API key 到环境变量配置文件

    Args:
        api_key: API key 值
        config_file: 目标配置文件路径（None 表示自动检测）

    Returns:
        是否设置成功
    """
    # 实现...
    return True
```

### 3. 日志输出

```python
# 使用标准 logging 模块
logging.info("✓ 操作成功")
logging.error("✗ 操作失败")
logging.warning("⚠ 警告信息")
logging.debug("调试信息（仅在 --verbose 模式显示）")
```

---

## 调试技巧

### 1. 使用 --verbose 查看详细日志

```bash
python scripts/claude_manager.py uninstall --verbose
```

### 2. 使用 --dry-run 预览操作

```bash
python scripts/claude_manager.py uninstall --dry-run --verbose
```

### 3. Python 调试器

```python
import pdb

def some_function():
    pdb.set_trace()  # 设置断点
    # 代码...
```

---

## 常见问题

### Q: 为什么不使用第三方库如 click、rich？

**A**: 为了保持脚本自包含、易于分发。用户可以直接运行 `python claude_manager.py`，无需安装依赖。

### Q: 如何测试不同 shell 配置场景？

**A**: 使用 `tmp_path` fixture 和 `patch` Mock 环境变量：

```python
def test_custom_zdotdir(tmp_path):
    custom_dir = tmp_path / 'custom'
    custom_dir.mkdir()
    custom_config = custom_dir / '.zshenv'
    custom_config.touch()

    with patch.dict(os.environ, {'ZDOTDIR': str(custom_dir)}):
        result = detect_zsh_config()
        assert result == custom_config
```

### Q: 如何确保脚本在 < 5 分钟内完成（SC-002）？

**A**: 所有子进程调用都设置 timeout，记录每个步骤耗时，在最后报告总耗时。

---

## 下一步

1. **完成核心功能实现**：参考 data-model.md 和 contracts/cli-interface.md
2. **编写完整测试套件**：单元测试 + 集成测试，覆盖率 > 80%
3. **执行集成测试**：在真实 macOS 环境测试完整流程
4. **更新文档**：补充 README.md 使用说明
5. **Code Review**：确保代码质量和规范符合

---

## 参考文档

- [Python argparse 文档](https://docs.python.org/3/library/argparse.html)
- [Python logging 文档](https://docs.python.org/3/library/logging.html)
- [Python subprocess 文档](https://docs.python.org/3/library/subprocess.html)
- [Python pathlib 文档](https://docs.python.org/3/library/pathlib.html)
- [pytest 文档](https://docs.pytest.org/)

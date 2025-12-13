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

class ValidationStatus(Enum):
    """验证状态"""
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"

@dataclass
class ValidationCheck:
    """验证检查项"""
    check_name: str
    command: str
    expected: str
    actual: str
    status: ValidationStatus

@dataclass
class ClaudeSettings:
    """Claude 配置文件 (~/.claude/settings.json)"""
    env_vars: Dict[str, str]
    permissions: Dict[str, bool]
    aliases: Dict[str, str]

    @classmethod
    def load(cls, config_path: Path) -> 'ClaudeSettings':
        """从文件加载配置"""
        if not config_path.exists():
            return cls(env_vars={}, permissions={}, aliases={})

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


# ============================================================================
# 检测功能
# ============================================================================

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

def detect_all_installations() -> Dict[str, any]:
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


# ============================================================================
# 进程管理
# ============================================================================

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


# ============================================================================
# 备份功能
# ============================================================================

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


# ============================================================================
# 清理功能
# ============================================================================

def cleanup_user_configs():
    """清理用户配置文件（FR-006, FR-007, FR-008, FR-009）"""
    config_paths = [
        Path.home() / '.claude',
        Path.home() / '.claude.json',
        Path.home() / '.claude-code-router',
        Path.home() / '.claude-code'
    ]

    for config_path in config_paths:
        try:
            if config_path.exists():
                if config_path.is_dir():
                    shutil.rmtree(config_path)
                else:
                    config_path.unlink()
                logging.info(f"✓ Removed {config_path}")
        except Exception as e:
            logging.error(f"✗ Failed to remove {config_path}: {e}")

def cleanup_env_vars():
    """清理环境变量（从 shell 配置文件）"""
    zsh_config = detect_zsh_config()
    if not zsh_config.exists():
        logging.info("Shell config not found, skipping env var cleanup")
        return

    try:
        content = zsh_config.read_text()
        # 移除 ANTHROPIC_* 和 SILICONFLOW_* 环境变量
        pattern = r'^export\s+(ANTHROPIC_|SILICONFLOW_)[A-Z_]+=.*$'
        new_content = re.sub(pattern, '', content, flags=re.MULTILINE)

        if not DRY_RUN:
            zsh_config.write_text(new_content)
        logging.info(f"✓ Cleaned environment variables from {zsh_config}")
    except Exception as e:
        logging.error(f"✗ Failed to clean environment variables: {e}")

def cleanup_aliases():
    """清理 alias（从 shell 配置文件）"""
    zsh_config = detect_zsh_config()
    if not zsh_config.exists():
        logging.info("Shell config not found, skipping alias cleanup")
        return

    try:
        content = zsh_config.read_text()
        # 移除常见的 Claude alias
        aliases_to_remove = ['cc', 'c', 'claude-dev']
        for alias in aliases_to_remove:
            pattern = rf'^alias\s+{alias}=.*$'
            content = re.sub(pattern, '', content, flags=re.MULTILINE)

        if not DRY_RUN:
            zsh_config.write_text(content)
        logging.info(f"✓ Cleaned aliases from {zsh_config}")
    except Exception as e:
        logging.error(f"✗ Failed to clean aliases: {e}")


# ============================================================================
# 验证功能
# ============================================================================

def verify_cleanup() -> List[ValidationCheck]:
    """验证清理是否彻底"""
    checks = []

    # 检查命令是否可用
    for cmd in ['claude', 'ccr']:
        result = subprocess.run(['which', cmd], capture_output=True)
        checks.append(ValidationCheck(
            check_name=f"命令 {cmd} 可用性",
            command=f"which {cmd}",
            expected="命令不可用",
            actual="command not found" if result.returncode != 0 else f"found at {result.stdout.decode().strip()}",
            status=ValidationStatus.PASS if result.returncode != 0 else ValidationStatus.FAIL
        ))

    # 检查 npm 包
    for pkg in ['@anthropic-ai/claude-code', '@musistudio/claude-code-router']:
        installed = detect_npm_package(pkg)
        checks.append(ValidationCheck(
            check_name=f"npm 包 {pkg}",
            command=f"npm list -g {pkg}",
            expected="包未安装",
            actual="未安装" if not installed else "仍然安装",
            status=ValidationStatus.PASS if not installed else ValidationStatus.FAIL
        ))

    # 检查配置目录
    claude_dir = Path.home() / '.claude'
    checks.append(ValidationCheck(
        check_name="配置目录 ~/.claude",
        command=f"test -d {claude_dir}",
        expected="目录不存在",
        actual="不存在" if not claude_dir.exists() else "仍然存在",
        status=ValidationStatus.PASS if not claude_dir.exists() else ValidationStatus.FAIL
    ))

    return checks


# ============================================================================
# 子命令实现
# ============================================================================

def cmd_install(args):
    """安装子命令"""
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

    # 4. 验证安装
    for comp in components:
        cmd = 'claude' if comp == 'cli' else 'ccr'
        result = subprocess.run([cmd, '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            logging.info(f"✓ {cmd} 命令可用 (版本 {result.stdout.strip()})")
        else:
            logging.warning(f"⚠ {cmd} 命令验证失败")

    # 5. Alias 创建（可选）
    if 'cli' in components and not args.skip_alias:
        create_alias = input("是否创建 alias? (y/n) [默认: y]: ").strip().lower() or 'y'
        if create_alias == 'y':
            config_file = detect_zsh_config()
            aliases = [
                "alias cc='claude --dangerously-skip-permissions'",
                "alias c='claude'"
            ]

            try:
                content = config_file.read_text() if config_file.exists() else ""
                for alias_line in aliases:
                    if alias_line not in content:
                        content += f"\n{alias_line}\n"

                if not DRY_RUN:
                    config_file.write_text(content)
                logging.info(f"✓ Alias created in {config_file}")
                logging.info(f"⚠️  请执行以下命令使 alias 生效:")
                logging.info(f"   source {config_file}")
                logging.info(f"   或重新打开终端")
            except Exception as e:
                logging.error(f"✗ Failed to create alias: {e}")

    # 6. API Key 设置（可选）
    if args.api_key:
        set_api_key(args.api_key, None)

    logging.info("\n✅ 安装完成！")
    return 0

def cmd_uninstall(args):
    """卸载子命令"""
    steps = []
    start_time = time.time()

    # 1. 备份（可选）
    backup_location = None
    if args.backup:
        try:
            backup_location = create_backup()
            logging.info(f"✓ Backup created at {backup_location}")
        except Exception as e:
            logging.error(f"✗ Backup failed: {e}")

    # 2. 检测安装
    logging.info("\n检测 Claude 安装...")
    installations = detect_all_installations()

    if installations['npm_global']:
        logging.info(f"✓ 检测到 npm 全局包: {', '.join(installations['npm_global'])}")
    if installations['homebrew']:
        logging.info(f"✓ 检测到 Homebrew 安装: {', '.join(installations['homebrew'])}")
    if installations['native']:
        logging.info(f"✓ 检测到 Native 安装: {', '.join(installations['native'])}")
    if installations['nvm_versions']:
        logging.info(f"✓ 检测到 NVM 版本: {', '.join(installations['nvm_versions'].keys())}")

    # 3. 停止进程
    logging.info("\n开始卸载...")
    kill_processes('claude-code-router')

    # 4. 卸载 npm 包
    for pkg in installations['npm_global']:
        if execute_command(['npm', 'uninstall', '-g', pkg], f"Uninstall npm package {pkg}"):
            logging.info(f"✓ Uninstalled {pkg}")
        else:
            logging.error(f"✗ Failed to uninstall {pkg}")

    # 5. 卸载 Homebrew
    if installations['homebrew']:
        if execute_command(['brew', 'uninstall', 'claude-code'], "Uninstall Homebrew package"):
            logging.info("✓ Uninstalled Homebrew package")

    # 6. 清理 Native 安装
    for path in installations['native']:
        try:
            path_obj = Path(path)
            if path_obj.is_dir():
                shutil.rmtree(path_obj)
            else:
                path_obj.unlink()
            logging.info(f"✓ Removed {path}")
        except Exception as e:
            logging.error(f"✗ Failed to remove {path}: {e}")

    # 7. 清理配置
    cleanup_user_configs()
    cleanup_env_vars()
    cleanup_aliases()

    # 8. 验证（可选）
    if not args.skip_verification:
        logging.info("\n验证...")
        checks = verify_cleanup()

        pass_count = sum(1 for c in checks if c.status == ValidationStatus.PASS)
        fail_count = sum(1 for c in checks if c.status == ValidationStatus.FAIL)

        for check in checks:
            status_icon = "✓" if check.status == ValidationStatus.PASS else "✗"
            logging.info(f"{status_icon} {check.check_name}: {check.actual}")

        logging.info(f"\n验证结果: {pass_count} 通过, {fail_count} 失败")

    # 9. 生成报告
    total_duration = time.time() - start_time
    logging.info(f"\n总耗时: {total_duration:.1f}秒")

    if backup_location:
        logging.info(f"备份位置: {backup_location}")

    logging.info("\n✅ 卸载完成！")
    return 0

def set_api_key(api_key: str, config_file: Optional[Path]):
    """设置 API key 到环境变量配置文件"""
    if not config_file:
        config_file = detect_zsh_config()

    try:
        content = config_file.read_text() if config_file.exists() else ""

        # 检查是否已存在
        pattern = r'^export\s+ANTHROPIC_API_KEY=.*$'
        if re.search(pattern, content, re.MULTILINE):
            # 替换现有行
            new_content = re.sub(pattern, f'export ANTHROPIC_API_KEY={api_key}', content, flags=re.MULTILINE)
        else:
            # 追加到文件末尾
            new_content = content + f'\nexport ANTHROPIC_API_KEY={api_key}\n'

        if not DRY_RUN:
            config_file.write_text(new_content)

        logging.info(f"✓ API key set in {config_file}")
        logging.info("请重新加载 shell 配置（source ~/.zshenv）或重启终端")
        return True
    except Exception as e:
        logging.error(f"✗ Failed to set API key: {e}")
        return False

def cmd_set_api_key(args):
    """设置 API key 子命令"""
    api_key = args.api_key

    if not api_key:
        api_key = input("请输入 API key: ").strip()
        if not api_key:
            logging.error("API key cannot be empty")
            return 2

    config_file = args.config_file if hasattr(args, 'config_file') else None

    if set_api_key(api_key, config_file):
        logging.info("✅ 完成！")
        return 0
    else:
        return 1

def cmd_set_config(args):
    """设置配置子命令"""
    config_path = Path.home() / '.claude' / 'settings.json'
    settings = ClaudeSettings.load(config_path)

    # 更新环境变量
    if args.env:
        for env_pair in args.env:
            key, value = env_pair.split('=', 1)
            settings.env_vars[key] = value
            logging.info(f"✓ Set env var: {key}")

    # 更新权限
    if args.permission:
        for perm_pair in args.permission:
            key, value = perm_pair.split('=', 1)
            settings.permissions[key] = value.lower() == 'true'
            logging.info(f"✓ Set permission: {key} = {value}")

    # 更新 alias
    if args.alias:
        for alias_pair in args.alias:
            name, cmd = alias_pair.split('=', 1)
            settings.aliases[name] = cmd
            logging.info(f"✓ Set alias: {name} = {cmd}")

    # 保存配置
    try:
        if not DRY_RUN:
            settings.save(config_path)
        logging.info(f"✓ Configuration saved to {config_path}")
        logging.info("✅ 完成！")
        return 0
    except Exception as e:
        logging.error(f"✗ Failed to save configuration: {e}")
        return 1

def cmd_verify(args):
    """验证子命令"""
    logging.info("运行验证检查...")
    checks = verify_cleanup()

    pass_count = sum(1 for c in checks if c.status == ValidationStatus.PASS)
    fail_count = sum(1 for c in checks if c.status == ValidationStatus.FAIL)

    for check in checks:
        status_icon = "✓" if check.status == ValidationStatus.PASS else "✗"
        logging.info(f"{status_icon} {check.check_name}: {check.actual}")

    logging.info(f"\n验证结果: {pass_count} 通过, {fail_count} 失败")

    return 0 if fail_count == 0 else 2


# ============================================================================
# 主函数
# ============================================================================

def main():
    """主函数：解析参数并调用子命令"""
    parser = argparse.ArgumentParser(
        description='Claude Code CLI/Router 管理工具',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    # 全局选项
    parser.add_argument('--dry-run', action='store_true', help='预览模式，不实际执行操作')
    parser.add_argument('--verbose', '-v', action='store_true', help='详细日志模式')
    parser.add_argument('--quiet', '-q', action='store_true', help='安静模式，仅显示错误和结果')
    parser.add_argument('--version', action='version', version='%(prog)s 1.0.0')

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

    # verify 子命令
    verify_parser = subparsers.add_parser('verify', help='验证清理结果')

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
        'verify': cmd_verify,
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

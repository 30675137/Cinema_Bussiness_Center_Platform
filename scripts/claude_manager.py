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

# Add scripts directory to path for core module imports
_SCRIPT_DIR = Path(__file__).parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

# Import core modules
from core.config_manager import (
    set_claude_config,
    set_env_vars_to_shell_config,
    load_claude_config,
    save_claude_config,
)
from core.env_manager import detect_config_file

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

    # 7. 同步配置文件中的环境变量到 shell 配置文件
    logging.info("\n同步配置...")
    
    # 优先读取项目模板配置文件
    template_config_path = Path("scripts/config/claude/settings.json")
    if template_config_path.exists():
        try:
            logging.info("\n📋 从项目模板配置文件读取配置...")
            logging.info(f"模板路径: {template_config_path}")
            
            with open(template_config_path, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            
            env_vars = config_data.get("env", {})
            
            if env_vars:
                logging.info(f"找到 {len(env_vars)} 个环境变量")
                
                # 保存到 ~/.claude/settings.json
                if save_claude_config(config_data):
                    logging.info("✓ 配置已保存到 ~/.claude/settings.json")
                else:
                    logging.warning("保存配置到 ~/.claude/settings.json 失败")
                
                # 同步到 shell 配置文件
                shell_config = detect_config_file()
                if shell_config:
                    logging.info(f"同步环境变量到: {shell_config}")
                    
                    if not DRY_RUN:
                        if set_env_vars_to_shell_config(env_vars, shell_config):
                            logging.info(f"✓ 环境变量已设置到: {shell_config}")
                            logging.info("\n已同步以下环境变量:")
                            for key in sorted(env_vars.keys()):
                                # 隐藏敏感信息
                                if "TOKEN" in key or "KEY" in key:
                                    value = env_vars[key]
                                    if len(value) > 8:
                                        masked_value = value[:4] + "*" * (len(value) - 8) + value[-4:]
                                    else:
                                        masked_value = "*" * len(value)
                                    logging.info(f"  ✓ {key} = {masked_value}")
                                else:
                                    logging.info(f"  ✓ {key} = {env_vars[key]}")
                        else:
                            logging.error("同步配置到 shell 配置文件失败")
                            logging.warning("请手动运行: python scripts/claude_manager.py sync-config")
                    else:
                        logging.info(f"[DRY-RUN] 将同步 {len(env_vars)} 个环境变量到 {shell_config}")
                else:
                    logging.warning("未找到 shell 配置文件，跳过同步")
            else:
                logging.info("配置文件中没有环境变量")
                
        except Exception as e:
            logging.warning(f"读取项目模板配置文件失败: {e}")
            logging.warning("跳过配置同步")
    else:
        logging.info(f"项目模板配置文件不存在: {template_config_path}")
        logging.info("跳过配置同步")

    # 8. 同步 Router 配置文件到 ~/.claude-code-router/config.json
    router_template_path = Path("scripts/config/claude-code-router/config.json")
    router_user_config_path = Path.home() / ".claude-code-router" / "config.json"
    
    if router_template_path.exists():
        logging.info("\n同步 Router 配置...")
        try:
            # 读取模板配置
            with open(router_template_path, 'r', encoding='utf-8') as f:
                router_config_data = json.load(f)
            logging.info(f"从项目模板配置文件读取: {router_template_path}")
            
            # 确保目标目录存在
            router_user_config_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 如果用户配置文件不存在，或者需要更新，则同步
            should_sync = False
            if not router_user_config_path.exists():
                should_sync = True
                logging.info("用户 Router 配置文件不存在，将创建新配置")
            else:
                # 检查用户配置文件是否为空或只有默认值
                try:
                    with open(router_user_config_path, 'r', encoding='utf-8') as f:
                        existing_config = json.load(f)
                    # 如果 Providers 为空或 Router 为空，则同步
                    if not existing_config.get("Providers") or not existing_config.get("Router"):
                        should_sync = True
                        logging.info("用户 Router 配置文件不完整，将更新配置")
                except Exception:
                    should_sync = True
                    logging.info("用户 Router 配置文件格式错误，将更新配置")
            
            if should_sync and not DRY_RUN:
                # 写入用户配置文件
                with open(router_user_config_path, 'w', encoding='utf-8') as f:
                    json.dump(router_config_data, f, indent=2, ensure_ascii=False)
                logging.info(f"✓ Router 配置已同步到: {router_user_config_path}")
                
                # 显示配置摘要
                if "Providers" in router_config_data:
                    providers = router_config_data["Providers"]
                    logging.info(f"已配置 {len(providers)} 个 Provider:")
                    for provider in providers:
                        provider_name = provider.get("name", "unknown")
                        models = provider.get("models", [])
                        logging.info(f"  ✓ {provider_name} ({len(models)} 个模型)")
                
                if "Router" in router_config_data:
                    router_rules = router_config_data["Router"]
                    if "default" in router_rules:
                        logging.info(f"默认路由: {router_rules['default']}")
            elif should_sync:
                logging.info(f"[DRY-RUN] 将同步 Router 配置到: {router_user_config_path}")
            else:
                logging.info("用户 Router 配置文件已存在且完整，跳过同步")
        except Exception as e:
            logging.warning(f"同步 Router 配置失败: {e}")
    else:
        logging.info("未找到 Router 配置模板文件，跳过同步")

    logging.info("\n✅ 安装完成！")
    logging.info("⚠️  请执行以下命令使环境变量生效:")
    logging.info("   source ~/.zshrc")
    logging.info("   或重新打开终端")
    return 0

def cmd_uninstall(args):
    """卸载子命令"""
    steps = []
    start_time = time.time()

    # 1. 备份（默认启用，除非明确指定 --no-backup）
    backup_location = None
    # args.backup 现在默认为 True（通过 default=True），--no-backup 会将其设为 False
    should_backup = getattr(args, 'backup', True)
    
    if should_backup:
        try:
            backup_location = create_backup()
            logging.info(f"✓ Backup created at {backup_location}")
        except Exception as e:
            logging.error(f"✗ Backup failed: {e}")
            # 备份失败时，询问是否继续（如果没有 --force 参数）
            if not hasattr(args, 'force') or not args.force:
                logging.error("✗ 无法创建备份，清理操作已中止。使用 --force 强制继续（不推荐）")
                return 1

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

    # 4.5. 清理 NVM bin 目录中的孤立符号链接
    try:
        nvm_dir = os.environ.get('NVM_DIR', os.path.expanduser('~/.nvm'))
        current_node_version = os.environ.get('NVM_BIN', '')
        if current_node_version:
            bin_dir = Path(current_node_version)
        else:
            # 尝试获取当前 node 版本
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version = result.stdout.strip()
                bin_dir = Path(nvm_dir) / 'versions' / 'node' / version / 'bin'
            else:
                bin_dir = None
        
        if bin_dir and bin_dir.exists():
            # 检查并删除 claude 和 ccr 命令
            for cmd_name in ['claude', 'ccr']:
                cmd_path = bin_dir / cmd_name
                if cmd_path.exists():
                    # 检查是否是孤立符号链接（指向不存在的目标）
                    if cmd_path.is_symlink():
                        target = cmd_path.resolve()
                        if not target.exists():
                            cmd_path.unlink()
                            logging.info(f"✓ 删除孤立符号链接: {cmd_path}")
                        else:
                            # 如果目标仍存在，也删除（因为 npm 包已卸载）
                            cmd_path.unlink()
                            logging.info(f"✓ 删除命令符号链接: {cmd_path}")
                    elif cmd_path.is_file():
                        # 如果是文件，也删除
                        cmd_path.unlink()
                        logging.info(f"✓ 删除命令文件: {cmd_path}")
    except Exception as e:
        logging.warning(f"清理 NVM bin 目录时出错: {e}")

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
    # 使用增强的环境变量清理函数（支持函数内部和 alias 中的变量）
    from core.env_manager import cleanup_env_vars_from_files
    cleanup_env_vars_from_files()
    cleanup_aliases()
    
    # 7.5. 刷新 shell 命令缓存
    try:
        logging.info("刷新 shell 命令缓存...")
        # hash -r 是 shell 内置命令，需要通过 shell 执行
        subprocess.run(['zsh', '-c', 'hash -r'], check=False, capture_output=True)
        logging.info("✓ 已刷新 shell 命令缓存")
    except Exception as e:
        logging.debug(f"刷新命令缓存时出错（可忽略）: {e}")

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
    logging.info("\n⚠️  请重新打开终端或执行以下命令使更改生效:")
    logging.info("   source ~/.zshrc")
    logging.info("   hash -r")
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
    # 初始化配置字典
    env_vars = {}
    permissions = {"allow": [], "deny": []}
    aliases = {}
    
    # T010-T014: 从 JSON 文件读取配置（如果提供）
    if args.json_file:
        json_path = args.json_file.resolve()  # 解析为绝对路径
        logging.info(f"从文件加载配置: {json_path}")
        
        try:
            # 检查文件是否存在
            if not json_path.exists():
                logging.error(f"JSON 文件不存在: {json_path}")
                return 1
            
            # 读取并解析 JSON
            with open(json_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            # T011: 提取 env 和 permissions，处理缺失字段
            if "env" in json_data:
                env_vars.update(json_data["env"])
                logging.info(f"从 JSON 文件读取环境变量: {list(json_data['env'].keys())}")
            
            if "permissions" in json_data:
                json_perms = json_data["permissions"]
                if "allow" in json_perms:
                    permissions["allow"] = json_perms["allow"]
                if "deny" in json_perms:
                    permissions["deny"] = json_perms["deny"]
                logging.info("从 JSON 文件读取权限配置")
            
            if "aliases" in json_data:
                aliases.update(json_data["aliases"])
                logging.info(f"从 JSON 文件读取别名: {list(json_data['aliases'].keys())}")
            
            logging.info("JSON 文件加载成功")
            
        except FileNotFoundError:
            logging.error(f"JSON 文件不存在: {json_path}")
            return 1
        except json.JSONDecodeError as e:
            logging.error(f"JSON 文件格式错误: {json_path}, 错误: {e}")
            return 1
        except Exception as e:
            logging.error(f"读取 JSON 文件失败: {json_path}, 错误: {e}")
            return 1
    
    # T022-T024: 处理命令行参数（优先级高于 JSON 文件）
    # 更新环境变量
    if args.env:
        for env_pair in args.env:
            try:
                if '=' not in env_pair:
                    logging.error(f"环境变量格式错误: {env_pair} (应为 KEY=VALUE)")
                    return 2
                key, value = env_pair.split('=', 1)
                env_vars[key] = value
                logging.info(f"✓ Set env var: {key}")
            except ValueError:
                logging.error(f"环境变量格式错误: {env_pair}")
                return 2
    
    # 更新权限
    if args.permission:
        for perm_pair in args.permission:
            try:
                if '=' not in perm_pair:
                    logging.error(f"权限格式错误: {perm_pair} (应为 KEY=VALUE)")
                    return 2
                key, value = perm_pair.split('=', 1)
                # 权限处理：根据值设置 allow 或 deny
                if value.lower() == 'true':
                    if key not in permissions["allow"]:
                        permissions["allow"].append(key)
                elif value.lower() == 'false':
                    if key not in permissions["deny"]:
                        permissions["deny"].append(key)
                logging.info(f"✓ Set permission: {key} = {value}")
            except ValueError:
                logging.error(f"权限格式错误: {perm_pair}")
                return 2
    
    # 更新 alias
    if args.alias:
        for alias_pair in args.alias:
            try:
                if '=' not in alias_pair:
                    logging.error(f"别名格式错误: {alias_pair} (应为 NAME=COMMAND)")
                    return 2
                name, cmd = alias_pair.split('=', 1)
                aliases[name] = cmd
                logging.info(f"✓ Set alias: {name} = {cmd}")
            except ValueError:
                logging.error(f"别名格式错误: {alias_pair}")
                return 2
    
    # T012: 合并配置到现有配置
    try:
        if not DRY_RUN:
            # 使用 set_claude_config 进行合并
            success = set_claude_config(
                env_vars=env_vars if env_vars else None,
                permissions=permissions if permissions.get("allow") or permissions.get("deny") else None,
                merge=True
            )
            
            if not success:
                logging.error("保存配置失败")
                return 1
            
            # 处理别名（如果 core/config_manager.py 不支持，需要单独处理）
            if aliases:
                config = load_claude_config()
                if "aliases" not in config:
                    config["aliases"] = {}
                config["aliases"].update(aliases)
                save_claude_config(config)
            
            logging.info("✓ 配置已保存到 ~/.claude/settings.json")
        else:
            logging.info("[DRY-RUN] 配置将被保存到 ~/.claude/settings.json")
    except Exception as e:
        logging.error(f"✗ 保存配置失败: {e}")
        return 1
    
    # T017-T021: 处理 --to-shell 参数
    if args.to_shell:
        # T017: 检测 shell 配置文件
        if args.shell_config:
            shell_config_path = args.shell_config.resolve()
        else:
            shell_config_path = detect_config_file()
        
        # T018: 检查文件是否存在
        if not shell_config_path or not shell_config_path.exists():
            if args.shell_config:
                logging.error(f"Shell 配置文件不存在: {shell_config_path}")
            else:
                logging.error("未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）")
            return 1
        
        # T019: 写入环境变量到 shell 配置文件
        if env_vars:
            success = set_env_vars_to_shell_config(env_vars, shell_config_path)
            
            if success:
                # T020: 成功消息
                logging.info(f"✓ 环境变量已设置到: {shell_config_path}")
                logging.info("请运行 'source ~/.zshrc' 或重新打开终端使环境变量生效")
            else:
                # T021: 错误处理
                logging.error("设置 shell 环境变量失败")
                return 1
        else:
            logging.warning("没有环境变量需要写入 shell 配置文件")
    
    logging.info("✅ 完成！")
    return 0

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

def cmd_sync_config(args):
    """同步配置子命令 - 将配置模板同步到 shell 和 ~/.claude"""
    logging.info("🔄 开始同步配置...")
    
    # 1. 确定源配置文件
    if args.from_template:
        template_path = args.from_template.resolve()
    else:
        # 默认使用项目模板配置
        template_path = Path("scripts/config/claude/settings.json")
    
    if not template_path.exists():
        logging.error(f"配置模板文件不存在: {template_path}")
        return 1
    
    # 2. 读取配置文件
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        logging.info(f"✓ 读取配置模板: {template_path}")
    except Exception as e:
        logging.error(f"读取配置模板失败: {e}")
        return 1
    
    # 3. 提取环境变量
    env_vars = config_data.get("env", {})
    if not env_vars:
        logging.warning("配置模板中没有环境变量")
    else:
        logging.info(f"找到 {len(env_vars)} 个环境变量: {', '.join(env_vars.keys())}")
    
    # 4. 同步到 ~/.claude/settings.json
    if args.to_claude:
        claude_config_path = Path.home() / ".claude" / "settings.json"
        
        # 检查是否已存在
        if claude_config_path.exists() and not args.force:
            logging.warning(f"~/.claude/settings.json 已存在，使用 --force 强制覆盖")
            
            # 合并配置
            try:
                existing_config = load_claude_config()
                if "env" not in existing_config:
                    existing_config["env"] = {}
                existing_config["env"].update(env_vars)
                
                if "permissions" in config_data:
                    existing_config["permissions"] = config_data["permissions"]
                
                if save_claude_config(existing_config):
                    logging.info("✓ 已合并环境变量到 ~/.claude/settings.json")
                else:
                    logging.error("合并配置失败")
                    return 1
            except Exception as e:
                logging.error(f"合并配置失败: {e}")
                return 1
        else:
            # 直接保存
            if not DRY_RUN:
                if save_claude_config(config_data):
                    logging.info(f"✓ 配置已保存到: {claude_config_path}")
                else:
                    logging.error("保存配置失败")
                    return 1
            else:
                logging.info(f"[DRY-RUN] 将保存配置到: {claude_config_path}")
    
    # 5. 同步到 shell 配置文件
    if args.to_shell and env_vars:
        shell_config = detect_config_file()
        if not shell_config:
            logging.error("未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）")
            return 1
        
        logging.info(f"同步环境变量到: {shell_config}")
        
        if not DRY_RUN:
            if set_env_vars_to_shell_config(env_vars, shell_config):
                logging.info(f"✓ 环境变量已设置到: {shell_config}")
                logging.info("\n已同步以下环境变量:")
                for key, value in sorted(env_vars.items()):
                    # 隐藏token的部分内容
                    if "TOKEN" in key or "KEY" in key:
                        if len(value) > 8:
                            masked_value = value[:4] + "*" * (len(value) - 8) + value[-4:]
                        else:
                            masked_value = "*" * len(value)
                        logging.info(f"  ✓ {key} = {masked_value}")
                    else:
                        logging.info(f"  ✓ {key} = {value}")
            else:
                logging.error("设置环境变量失败")
                return 1
        else:
            logging.info(f"[DRY-RUN] 将同步 {len(env_vars)} 个环境变量到 {shell_config}")
    
    # 6. 显示使用提示
    logging.info("\n✅ 配置同步完成！")
    if args.to_shell:
        logging.info("\n⚠️  请执行以下命令使环境变量生效:")
        logging.info(f"   source {shell_config if shell_config else '~/.zshrc'}")
        logging.info("或重新打开终端")
    
    return 0


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
    config_parser.add_argument('--json-file', type=Path, help='从 JSON 文件读取配置')
    config_parser.add_argument('--to-shell', action='store_true', help='同时设置到 shell 配置文件（~/.zshrc）')
    config_parser.add_argument('--shell-config', type=Path, help='Shell 配置文件路径（默认: 自动检测）')

    # sync-config 子命令（新增）
    sync_parser = subparsers.add_parser('sync-config', help='同步配置文件到 shell 和 ~/.claude')
    sync_parser.add_argument('--from-template', type=Path, help='从指定模板文件读取配置')
    sync_parser.add_argument('--to-shell', action='store_true', default=True, help='同步到 shell 配置文件（默认启用）')
    sync_parser.add_argument('--to-claude', action='store_true', default=True, help='同步到 ~/.claude/settings.json（默认启用）')
    sync_parser.add_argument('--force', action='store_true', help='强制覆盖现有配置')

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
        'sync-config': cmd_sync_config,
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

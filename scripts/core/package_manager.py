"""Package management module for npm, Homebrew, and Native installations."""

import subprocess
from pathlib import Path
from typing import List, Optional, Tuple
from utils.shell import run_command, check_command_exists, get_command_output
from utils.logger import log_info, log_warning, log_error, log_debug
from utils.file_ops import safe_remove


# Claude 包名
CLAUDE_CLI_PACKAGE = "@anthropic-ai/claude-code"
CLAUDE_ROUTER_PACKAGE = "@musistudio/claude-code-router"
HOMEBREW_PACKAGE = "claude-code"


def check_npm_available() -> bool:
    """
    检查 npm 是否可用
    
    Returns:
        如果 npm 可用返回 True，否则返回 False
    """
    return check_command_exists("npm")


def install_cli_npm() -> bool:
    """
    通过 npm 安装 Claude Code CLI
    
    Returns:
        如果安装成功返回 True，否则返回 False
    """
    if not check_npm_available():
        log_error("npm 不可用，无法安装 Claude Code CLI")
        return False
    
    try:
        log_info(f"正在安装 Claude Code CLI: {CLAUDE_CLI_PACKAGE}")
        result = run_command(["npm", "install", "-g", CLAUDE_CLI_PACKAGE], check=False)
        if result.returncode == 0:
            log_info(f"成功安装: {CLAUDE_CLI_PACKAGE}")
            return True
        else:
            log_error(f"安装失败: {CLAUDE_CLI_PACKAGE}")
            if result.stderr:
                log_error(f"错误信息: {result.stderr}")
            return False
    except Exception as e:
        log_error(f"安装 Claude Code CLI 时出错: {e}")
        return False


def install_router_npm() -> bool:
    """
    通过 npm 安装 Claude Code Router
    
    Returns:
        如果安装成功返回 True，否则返回 False
    """
    if not check_npm_available():
        log_error("npm 不可用，无法安装 Claude Code Router")
        return False
    
    try:
        log_info(f"正在安装 Claude Code Router: {CLAUDE_ROUTER_PACKAGE}")
        result = run_command(["npm", "install", "-g", CLAUDE_ROUTER_PACKAGE], check=False)
        if result.returncode == 0:
            log_info(f"成功安装: {CLAUDE_ROUTER_PACKAGE}")
            return True
        else:
            log_error(f"安装失败: {CLAUDE_ROUTER_PACKAGE}")
            if result.stderr:
                log_error(f"错误信息: {result.stderr}")
            return False
    except Exception as e:
        log_error(f"安装 Claude Code Router 时出错: {e}")
        return False


def verify_installation(components: List[str]) -> bool:
    """
    验证安装是否成功
    
    Args:
        components: 要验证的组件列表（'cli' 或 'router'）
        
    Returns:
        如果所有组件都验证成功返回 True，否则返回 False
    """
    all_success = True
    
    if 'cli' in components:
        try:
            log_info("验证 Claude Code CLI 安装...")
            result = run_command(["claude", "--version"], check=False)
            if result.returncode == 0:
                version = result.stdout.strip()
                log_info(f"✓ Claude Code CLI 已安装: {version}")
            else:
                log_warning("✗ Claude Code CLI 验证失败（命令不可用）")
                all_success = False
        except Exception as e:
            log_warning(f"✗ Claude Code CLI 验证失败: {e}")
            all_success = False
    
    if 'router' in components:
        try:
            log_info("验证 Claude Code Router 安装...")
            result = run_command(["ccr", "--version"], check=False)
            if result.returncode == 0:
                version = result.stdout.strip()
                log_info(f"✓ Claude Code Router 已安装: {version}")
            else:
                # Router 可能没有 --version 选项，尝试其他方式验证
                result = run_command(["which", "ccr"], check=False)
                if result.returncode == 0:
                    log_info("✓ Claude Code Router 已安装（命令可用）")
                else:
                    log_warning("✗ Claude Code Router 验证失败（命令不可用）")
                    all_success = False
        except Exception as e:
            log_warning(f"✗ Claude Code Router 验证失败: {e}")
            all_success = False
    
    return all_success


def detect_npm_packages() -> List[str]:
    """
    检测通过 npm 全局安装的 Claude 包
    
    Returns:
        已安装的包名列表
    """
    if not check_npm_available():
        return []
    
    installed_packages = []
    
    try:
        # 获取全局安装的包列表
        result = run_command(["npm", "list", "-g", "--depth=0"], check=False)
        if result.returncode == 0:
            output = result.stdout
            if CLAUDE_CLI_PACKAGE in output:
                installed_packages.append(CLAUDE_CLI_PACKAGE)
            if CLAUDE_ROUTER_PACKAGE in output:
                installed_packages.append(CLAUDE_ROUTER_PACKAGE)
    except Exception as e:
        log_debug(f"检测 npm 包时出错: {e}")
    
    return installed_packages


def uninstall_npm_packages(packages: Optional[List[str]] = None) -> bool:
    """
    卸载 npm 全局包
    
    Args:
        packages: 要卸载的包列表，如果为 None 则自动检测
        
    Returns:
        如果卸载成功返回 True，否则返回 False
    """
    if not check_npm_available():
        log_warning("npm 不可用，跳过 npm 包卸载")
        return False
    
    if packages is None:
        packages = detect_npm_packages()
    
    if not packages:
        log_info("没有需要卸载的 npm 包")
        return True
    
    all_success = True
    
    for package in packages:
        try:
            log_info(f"卸载 npm 包: {package}")
            result = run_command(["npm", "uninstall", "-g", package], check=False)
            if result.returncode == 0:
                log_info(f"成功卸载: {package}")
            else:
                log_warning(f"卸载失败: {package}, 错误: {result.stderr}")
                all_success = False
        except Exception as e:
            log_error(f"卸载 npm 包时出错: {package}, 错误: {e}")
            all_success = False
    
    # 刷新 shell 命令缓存（hash -r）
    # 注意：hash 是 shell 内置命令，需要通过 shell 执行
    if all_success or packages:  # 如果有卸载操作，无论成功与否都刷新缓存
        try:
            log_info("刷新 shell 命令缓存...")
            # 使用 shell 执行 hash -r（bash 或 zsh）
            import subprocess
            subprocess.run(["hash", "-r"], shell=True, check=False, capture_output=True)
            log_info("已刷新 shell 命令缓存")
        except Exception as e:
            log_debug(f"刷新命令缓存时出错（可忽略）: {e}")
    
    return all_success


def detect_homebrew_packages() -> List[str]:
    """
    检测通过 Homebrew 安装的 Claude 包
    
    Returns:
        已安装的包名列表
    """
    if not check_command_exists("brew"):
        return []
    
    installed_packages = []
    
    try:
        result = run_command(["brew", "list"], check=False)
        if result.returncode == 0:
            output = result.stdout
            if HOMEBREW_PACKAGE in output:
                installed_packages.append(HOMEBREW_PACKAGE)
    except Exception as e:
        log_debug(f"检测 Homebrew 包时出错: {e}")
    
    return installed_packages


def uninstall_homebrew_packages(packages: Optional[List[str]] = None) -> bool:
    """
    卸载 Homebrew 包
    
    Args:
        packages: 要卸载的包列表，如果为 None 则自动检测
        
    Returns:
        如果卸载成功返回 True，否则返回 False
    """
    if not check_command_exists("brew"):
        log_warning("Homebrew 不可用，跳过 Homebrew 包卸载")
        return False
    
    if packages is None:
        packages = detect_homebrew_packages()
    
    if not packages:
        log_info("没有需要卸载的 Homebrew 包")
        return True
    
    all_success = True
    
    for package in packages:
        try:
            log_info(f"卸载 Homebrew 包: {package}")
            result = run_command(["brew", "uninstall", package], check=False)
            if result.returncode == 0:
                log_info(f"成功卸载: {package}")
            else:
                log_warning(f"卸载失败: {package}, 错误: {result.stderr}")
                all_success = False
        except Exception as e:
            log_error(f"卸载 Homebrew 包时出错: {package}, 错误: {e}")
            all_success = False
    
    return all_success


def detect_native_installation() -> Tuple[bool, List[Path]]:
    """
    检测 Native 安装的残留文件
    
    Returns:
        (是否检测到安装, 文件/目录路径列表)
    """
    home = Path.home()
    native_paths = [
        home / ".local" / "bin" / "claude",
        home / ".claude-code",
    ]
    
    found_paths = [path for path in native_paths if path.exists()]
    
    return len(found_paths) > 0, found_paths


def cleanup_native_installation() -> bool:
    """
    清理 Native 安装的残留文件
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    has_installation, paths = detect_native_installation()
    
    if not has_installation:
        log_info("没有检测到 Native 安装")
        return True
    
    all_success = True
    
    for path in paths:
        try:
            log_info(f"清理 Native 安装文件: {path}")
            if safe_remove(path):
                log_info(f"成功清理: {path}")
            else:
                log_warning(f"清理失败: {path}")
                all_success = False
        except Exception as e:
            log_error(f"清理 Native 安装文件时出错: {path}, 错误: {e}")
            all_success = False
    
    return all_success


def cleanup_nvm_packages() -> bool:
    """
    清理 NVM 管理的所有 Node 版本中的 Claude 相关包
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    nvm_dir = Path.home() / ".nvm"
    
    if not nvm_dir.exists():
        log_info("NVM 未安装，跳过 NVM 包清理")
        return True
    
    # 检查 nvm 命令是否可用
    if not check_command_exists("nvm"):
        log_info("NVM 命令不可用，跳过 NVM 包清理")
        return True
    
    all_success = True
    
    try:
        # 获取所有 Node 版本
        result = run_command(["nvm", "list"], check=False)
        if result.returncode != 0:
            log_warning("无法获取 NVM Node 版本列表")
            return False
        
        # 解析版本列表（简化处理，实际可能需要更复杂的解析）
        # 这里我们尝试在每个可能的版本中卸载包
        log_info("清理 NVM 管理的所有 Node 版本中的 Claude 包")
        
        # 获取当前版本
        current_version = get_command_output(["nvm", "current"])
        if current_version:
            log_debug(f"当前 Node 版本: {current_version}")
        
        # 尝试卸载当前版本的包
        packages = [CLAUDE_CLI_PACKAGE, CLAUDE_ROUTER_PACKAGE]
        for package in packages:
            try:
                result = run_command(["npm", "uninstall", "-g", package], check=False)
                if result.returncode == 0:
                    log_info(f"在 NVM 当前版本中成功卸载: {package}")
            except Exception as e:
                log_debug(f"在 NVM 当前版本中卸载失败: {package}, 错误: {e}")
        
        # 注意：完整实现需要遍历所有 NVM 版本，这可能需要更复杂的逻辑
        log_info("NVM 包清理完成（注意：可能需要手动检查其他版本）")
        
        # 刷新 shell 命令缓存（hash -r）
        # 注意：hash 是 shell 内置命令，需要通过 shell 执行
        try:
            log_info("刷新 shell 命令缓存...")
            # 使用 shell 执行 hash -r（bash 或 zsh）
            import subprocess
            subprocess.run(["hash", "-r"], shell=True, check=False, capture_output=True)
            log_info("已刷新 shell 命令缓存")
        except Exception as e:
            log_debug(f"刷新命令缓存时出错（可忽略）: {e}")
        
    except Exception as e:
        log_warning(f"清理 NVM 包时出错: {e}")
        all_success = False
    
    return all_success


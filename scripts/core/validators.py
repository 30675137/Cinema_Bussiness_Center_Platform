"""Validation module for checking cleanup completeness."""

import os
from pathlib import Path
from typing import List
from . import ValidationResult, ValidationStatus
from utils.shell import check_command_exists, get_command_output, run_command
from utils.logger import log_debug
from core.package_manager import detect_npm_packages, detect_homebrew_packages, detect_native_installation
from core.process_manager import find_claude_processes


def check_command_removed(command: str) -> ValidationResult:
    """
    检查命令是否已从 PATH 中移除
    
    Args:
        command: 命令名称（如 'claude', 'ccr'）
        
    Returns:
        ValidationResult 对象
    """
    exists = check_command_exists(command)
    
    if not exists:
        return ValidationResult(
            check_name=f"命令 {command} 是否已移除",
            status=ValidationStatus.PASS,
            expected="命令不可用",
            actual="命令已从 PATH 中移除",
            command=f"which {command}"
        )
    else:
        path = get_command_output(["which", command])
        return ValidationResult(
            check_name=f"命令 {command} 是否已移除",
            status=ValidationStatus.FAIL,
            expected="命令不可用",
            actual=f"命令仍可用: {path}",
            command=f"which {command}"
        )


def check_npm_packages_removed() -> ValidationResult:
    """
    检查 npm 全局包是否已卸载
    
    Returns:
        ValidationResult 对象
    """
    packages = detect_npm_packages()
    
    if not packages:
        return ValidationResult(
            check_name="npm 全局包是否已卸载",
            status=ValidationStatus.PASS,
            expected="没有安装的包",
            actual="所有包已卸载",
            command="npm list -g --depth=0"
        )
    else:
        return ValidationResult(
            check_name="npm 全局包是否已卸载",
            status=ValidationStatus.FAIL,
            expected="没有安装的包",
            actual=f"仍有包未卸载: {', '.join(packages)}",
            command="npm list -g --depth=0"
        )


def check_config_dirs_removed() -> ValidationResult:
    """
    检查用户配置目录是否已清理
    
    Returns:
        ValidationResult 对象
    """
    home = Path.home()
    config_dirs = [
        home / ".claude",
        home / ".claude.json",
        home / ".claude-code-router",
        home / ".claude-code",
    ]
    
    existing_dirs = [d for d in config_dirs if d.exists()]
    
    if not existing_dirs:
        return ValidationResult(
            check_name="用户配置目录是否已清理",
            status=ValidationStatus.PASS,
            expected="所有配置目录已删除",
            actual="所有配置目录已清理",
            command="检查 ~/.claude* 目录"
        )
    else:
        dir_names = [str(d.name) for d in existing_dirs]
        return ValidationResult(
            check_name="用户配置目录是否已清理",
            status=ValidationStatus.FAIL,
            expected="所有配置目录已删除",
            actual=f"仍有目录存在: {', '.join(dir_names)}",
            command="检查 ~/.claude* 目录"
        )


def check_env_vars_removed() -> ValidationResult:
    """
    检查环境变量是否已清理
    
    Returns:
        ValidationResult 对象
    """
    import re
    
    # 检查当前会话环境变量
    session_vars = []
    for key in os.environ.keys():
        if key.startswith("ANTHROPIC_") or key.startswith("SILICONFLOW_"):
            session_vars.append(key)
    
    # 检查配置文件中的环境变量
    # 延迟导入避免循环依赖
    from core import env_manager
    config_file = env_manager.detect_config_file()
    file_vars = []
    
    if config_file and config_file.exists():
        try:
            content = config_file.read_text(encoding="utf-8")
            # 查找 ANTHROPIC_* 和 SILICONFLOW_* 环境变量
            patterns = [
                r'export\s+(ANTHROPIC_\w+)=',
                r'export\s+(SILICONFLOW_\w+)=',
            ]
            for pattern in patterns:
                matches = re.findall(pattern, content)
                file_vars.extend(matches)
        except Exception:
            pass
    
    all_vars = list(set(session_vars + file_vars))
    
    if not all_vars:
        return ValidationResult(
            check_name="环境变量是否已清理",
            status=ValidationStatus.PASS,
            expected="没有 Claude 相关环境变量",
            actual="所有环境变量已清理",
            command="检查环境变量和配置文件"
        )
    else:
        return ValidationResult(
            check_name="环境变量是否已清理",
            status=ValidationStatus.FAIL,
            expected="没有 Claude 相关环境变量",
            actual=f"仍有环境变量: {', '.join(all_vars)}",
            command="检查环境变量和配置文件"
        )


def check_processes_removed() -> ValidationResult:
    """
    检查 Router 进程和端口是否已清理
    
    Returns:
        ValidationResult 对象
    """
    processes = find_claude_processes()
    
    if not processes:
        return ValidationResult(
            check_name="进程和端口是否已清理",
            status=ValidationStatus.PASS,
            expected="没有运行中的进程",
            actual="所有进程已停止",
            command="psutil.process_iter()"
        )
    else:
        process_names = [p.name for p in processes]
        return ValidationResult(
            check_name="进程和端口是否已清理",
            status=ValidationStatus.FAIL,
            expected="没有运行中的进程",
            actual=f"仍有进程运行: {', '.join(process_names)}",
            command="psutil.process_iter()"
        )


def check_all() -> List[ValidationResult]:
    """
    执行所有验证检查
    
    Returns:
        ValidationResult 列表
    """
    results = []
    
    # 检查命令
    results.append(check_command_removed("claude"))
    results.append(check_command_removed("ccr"))
    
    # 检查 npm 包
    results.append(check_npm_packages_removed())
    
    # 检查配置目录
    results.append(check_config_dirs_removed())
    
    # 检查环境变量
    results.append(check_env_vars_removed())
    
    # 检查进程
    results.append(check_processes_removed())
    
    return results


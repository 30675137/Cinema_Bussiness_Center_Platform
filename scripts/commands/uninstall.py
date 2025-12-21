"""Uninstall command for Claude Code CLI and Router."""

import click
import time
from typing import List
from core import UninstallConfig, CleanupStep, StepStatus
from core.process_manager import find_claude_processes, stop_processes
from core.package_manager import (
    detect_npm_packages,
    uninstall_npm_packages,
    detect_homebrew_packages,
    uninstall_homebrew_packages,
    cleanup_native_installation,
    cleanup_nvm_packages,
)
from core.config_cleaner import cleanup_user_configs, cleanup_project_residue
from core.env_manager import cleanup_env_vars_from_files, cleanup_session_env_vars
from core.backup_manager import backup_configs
from core.config_manager import load_and_apply_config
from utils.logger import log_info, log_error, log_warning
from rich.table import Table
from rich.console import Console

console = Console()


def execute_cleanup_step(step_name: str, step_func, *args, **kwargs) -> CleanupStep:
    """
    执行清理步骤并记录结果
    
    Args:
        step_name: 步骤名称
        step_func: 步骤函数
        *args, **kwargs: 传递给步骤函数的参数
        
    Returns:
        CleanupStep 对象
    """
    start_time = time.time()
    
    try:
        log_info(f"开始执行: {step_name}")
        result = step_func(*args, **kwargs)
        duration = time.time() - start_time
        
        if result:
            log_info(f"✓ {step_name} - 成功")
            return CleanupStep(
                name=step_name,
                status=StepStatus.SUCCESS,
                duration=duration
            )
        else:
            log_warning(f"✗ {step_name} - 失败")
            return CleanupStep(
                name=step_name,
                status=StepStatus.FAILED,
                message="步骤执行失败",
                duration=duration
            )
    except Exception as e:
        duration = time.time() - start_time
        log_error(f"✗ {step_name} - 错误: {e}")
        return CleanupStep(
            name=step_name,
            status=StepStatus.FAILED,
            message=str(e),
            duration=duration
        )


@click.command()
@click.option('--backup', is_flag=True, default=True, help='在卸载前备份配置文件（默认启用）')
@click.option('--no-backup', is_flag=True, help='跳过备份步骤')
@click.option('--backup-dir', type=click.Path(), help='备份目录路径（默认: ~/.claude-cleanup-backup/）')
@click.option('--methods', help='要清理的安装方式，逗号分隔（npm,homebrew,native），默认: 自动检测所有方式')
@click.option('--skip-verify', is_flag=True, help='卸载后不执行验证')
@click.option('--force', is_flag=True, help='即使备份失败也强制继续（不推荐）')
@click.pass_context
def uninstall(ctx, backup, no_backup, backup_dir, methods, skip_verify, force):
    """
    卸载 Claude Code CLI 和 Claude Code Router，清理所有相关配置和残留
    """
    console.print("\n[bold cyan]开始卸载 Claude Code CLI 和 Router...[/bold cyan]\n")
    
    # 自动读取配置文件（如果存在）
    loaded_config = load_and_apply_config()
    if loaded_config:
        log_info("从配置文件加载环境变量设置")
    
    # 处理备份选项：默认启用，除非明确指定 --no-backup
    should_backup = backup and not no_backup
    
    config = UninstallConfig(
        backup=should_backup,
        backup_dir=backup_dir,
        methods=methods.split(',') if methods else None
    )
    
    steps: List[CleanupStep] = []
    
    # 步骤 1: 备份（默认启用，除非 --no-backup）
    backup_location = None
    if config.backup:
        backup_result = backup_configs(config.backup_dir)
        if backup_result:
            backup_location = backup_result
            step = CleanupStep(
                name="备份配置文件",
                status=StepStatus.SUCCESS,
                message=f"备份位置: {backup_location}"
            )
            log_info(f"✓ 备份已创建: {backup_location}")
        else:
            step = CleanupStep(
                name="备份配置文件",
                status=StepStatus.FAILED,
                message="备份失败"
            )
            # 如果备份失败且未使用 --force，中止清理操作
            if not force:
                log_error("✗ 无法创建备份，清理操作已中止。使用 --force 强制继续（不推荐）")
                ctx.exit(1)
            else:
                log_warning("⚠ 备份失败，但使用 --force 继续执行清理")
        steps.append(step)
    elif no_backup:
        log_warning("⚠ 跳过备份步骤（使用 --no-backup）")
    
    # 步骤 2: 停止进程
    processes = find_claude_processes()
    if processes:
        step = execute_cleanup_step(
            "停止 Claude 相关进程",
            stop_processes,
            processes
        )
        steps.append(step)
    else:
        steps.append(CleanupStep(
            name="停止 Claude 相关进程",
            status=StepStatus.SKIPPED,
            message="没有运行中的进程"
        ))
    
    # 步骤 3: 卸载包（根据检测到的安装方式）
    methods_to_clean = config.methods or ['npm', 'homebrew', 'native']
    
    if 'npm' in methods_to_clean:
        npm_packages = detect_npm_packages()
        if npm_packages:
            step = execute_cleanup_step(
                "卸载 npm 全局包",
                uninstall_npm_packages,
                npm_packages
            )
            steps.append(step)
        else:
            steps.append(CleanupStep(
                name="卸载 npm 全局包",
                status=StepStatus.SKIPPED,
                message="没有检测到 npm 安装的包"
            ))
    
    if 'homebrew' in methods_to_clean:
        homebrew_packages = detect_homebrew_packages()
        if homebrew_packages:
            step = execute_cleanup_step(
                "卸载 Homebrew 包",
                uninstall_homebrew_packages,
                homebrew_packages
            )
            steps.append(step)
        else:
            steps.append(CleanupStep(
                name="卸载 Homebrew 包",
                status=StepStatus.SKIPPED,
                message="没有检测到 Homebrew 安装的包"
            ))
    
    if 'native' in methods_to_clean:
        step = execute_cleanup_step(
            "清理 Native 安装残留",
            cleanup_native_installation
        )
        steps.append(step)
    
    # 步骤 4: 清理 NVM 包
    step = execute_cleanup_step(
        "清理 NVM 管理的包",
        cleanup_nvm_packages
    )
    steps.append(step)
    
    # 步骤 5: 清理用户配置文件
    step = execute_cleanup_step(
        "清理用户级配置文件",
        cleanup_user_configs
    )
    steps.append(step)
    
    # 步骤 6: 清理项目残留
    step = execute_cleanup_step(
        "清理项目级残留",
        cleanup_project_residue
    )
    steps.append(step)
    
    # 步骤 7: 清理环境变量（配置文件）
    step = execute_cleanup_step(
        "清理配置文件中的环境变量",
        cleanup_env_vars_from_files
    )
    steps.append(step)
    
    # 步骤 8: 清理会话环境变量
    step = execute_cleanup_step(
        "清理当前会话环境变量",
        cleanup_session_env_vars
    )
    steps.append(step)
    
    # 生成报告
    console.print("\n[bold]清理报告:[/bold]\n")
    table = Table(title="清理步骤执行结果")
    table.add_column("步骤", style="cyan")
    table.add_column("状态", style="magenta")
    table.add_column("耗时", style="green")
    table.add_column("备注", style="yellow")
    
    success_count = 0
    failed_count = 0
    skipped_count = 0
    
    for step in steps:
        if step.status == StepStatus.SUCCESS:
            status = "[green]✓ 成功[/green]"
            success_count += 1
        elif step.status == StepStatus.FAILED:
            status = "[red]✗ 失败[/red]"
            failed_count += 1
        else:
            status = "[yellow]⊘ 跳过[/yellow]"
            skipped_count += 1
        
        duration_str = f"{step.duration:.2f}s" if step.duration else "-"
        message = step.message or ""
        
        table.add_row(step.name, status, duration_str, message)
    
    console.print(table)
    console.print(f"\n[bold]总计:[/bold] 成功 {success_count}, 失败 {failed_count}, 跳过 {skipped_count}\n")
    
    if failed_count > 0:
        log_warning("部分步骤执行失败，请检查上述报告")
        ctx.exit(1)
    else:
        log_info("清理完成！")
        
        # 检查并提示清理当前会话环境变量
        import os
        session_vars = [key for key in os.environ.keys() if key.startswith("ANTHROPIC_") or key.startswith("SILICONFLOW_")]
        if session_vars:
            console.print("\n[bold yellow]⚠ 重要提示:[/bold yellow]")
            console.print("检测到当前终端会话中存在以下环境变量:")
            for var in session_vars:
                console.print(f"  - {var}")
            console.print("\n[bold]请在当前终端中执行以下命令清理环境变量:[/bold]\n")
            console.print("  [cyan]unset " + " ".join(session_vars) + "[/cyan]\n")
            console.print("或者重新打开终端窗口（新终端不会继承这些环境变量）\n")
        
        # 提示用户执行必要的命令使清理生效
        console.print("\n[bold yellow]⚠ 重要提示:[/bold yellow]")
        console.print("请执行以下命令使清理生效:")
        console.print("  [cyan]source ~/.zshrc[/cyan]")
        console.print("  [cyan]hash -r[/cyan]")
        console.print("或重新打开终端窗口\n")
        
        if not skip_verify:
            log_info("建议运行 'python scripts/claude_manager.py verify' 验证清理结果")


# 导出命令
uninstall_command = uninstall


"""Logging utility using rich for formatted output."""

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from typing import Optional
import sys

console = Console()


def get_verbose() -> bool:
    """获取是否启用详细模式（从上下文或环境变量）"""
    # 可以从上下文获取，这里简化处理
    return False


def should_log() -> bool:
    """判断是否应该输出日志（考虑 quiet 模式）"""
    # 可以从上下文获取，这里简化处理
    return True


def log_success(message: str) -> None:
    """输出成功消息"""
    if should_log():
        console.print(f"[green]✓[/green] {message}")


def log_error(message: str) -> None:
    """输出错误消息"""
    # rich Console 不支持 file 参数，需要创建新的 Console 实例输出到 stderr
    error_console = Console(file=sys.stderr)
    error_console.print(f"[red]✗[/red] {message}")


def log_info(message: str) -> None:
    """输出信息消息"""
    if should_log():
        console.print(f"[blue]ℹ[/blue] {message}")


def log_warning(message: str) -> None:
    """输出警告消息"""
    if should_log():
        console.print(f"[yellow]⚠[/yellow] {message}")


def log_step(step_name: str, status: str = "执行中") -> None:
    """输出步骤信息"""
    if should_log():
        console.print(f"[cyan]→[/cyan] {step_name}: {status}")


def log_debug(message: str) -> None:
    """输出调试消息（仅在详细模式下）"""
    if get_verbose() and should_log():
        console.print(f"[dim]{message}[/dim]")


def create_progress() -> Progress:
    """创建进度条"""
    return Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    )


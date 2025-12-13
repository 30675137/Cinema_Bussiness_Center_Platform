"""Verify command for checking cleanup completeness."""

import click
import json
from typing import List
from rich.console import Console
from rich.table import Table
from core.validators import check_all
from core import ValidationResult, ValidationStatus
from utils.logger import log_info, log_success, log_warning

console = Console()


def format_status(status: ValidationStatus) -> str:
    """格式化验证状态"""
    if status == ValidationStatus.PASS:
        return "[green]✓ 通过[/green]"
    elif status == ValidationStatus.FAIL:
        return "[red]✗ 失败[/red]"
    else:
        return "[yellow]⚠ 警告[/yellow]"


@click.command()
@click.option('--format', 'output_format', type=click.Choice(['table', 'json'], case_sensitive=False), default='table', help='输出格式（table 或 json）')
@click.pass_context
def verify(ctx, output_format):
    """
    验证清理是否彻底完成
    
    检查命令、配置文件、环境变量和进程是否都已清理。
    """
    console.print("\n[bold cyan]验证清理结果...[/bold cyan]\n")
    
    # 执行所有验证检查
    results = check_all()
    
    # 统计结果
    pass_count = sum(1 for r in results if r.status == ValidationStatus.PASS)
    fail_count = sum(1 for r in results if r.status == ValidationStatus.FAIL)
    warning_count = sum(1 for r in results if r.status == ValidationStatus.WARNING)
    total_count = len(results)
    
    # 根据格式输出结果
    if output_format.lower() == 'json':
        # JSON 格式输出
        output_data = {
            "summary": {
                "total": total_count,
                "pass": pass_count,
                "fail": fail_count,
                "warning": warning_count,
                "all_passed": fail_count == 0
            },
            "results": [
                {
                    "check_name": r.check_name,
                    "status": r.status.value,
                    "expected": r.expected,
                    "actual": r.actual,
                    "command": r.command
                }
                for r in results
            ]
        }
        console.print(json.dumps(output_data, indent=2, ensure_ascii=False))
    else:
        # 表格格式输出
        table = Table(title="清理验证报告")
        table.add_column("检查项", style="cyan", no_wrap=False)
        table.add_column("状态", style="magenta")
        table.add_column("期望结果", style="green")
        table.add_column("实际结果", style="yellow")
        
        for result in results:
            status_str = format_status(result.status)
            table.add_row(
                result.check_name,
                status_str,
                result.expected,
                result.actual
            )
        
        console.print(table)
        console.print(f"\n[bold]总计:[/bold] {total_count} 项检查")
        console.print(f"  [green]✓ 通过:[/green] {pass_count}")
        console.print(f"  [red]✗ 失败:[/red] {fail_count}")
        if warning_count > 0:
            console.print(f"  [yellow]⚠ 警告:[/yellow] {warning_count}")
        console.print()
    
    # 设置退出码
    if fail_count == 0:
        log_success("所有检查项通过，清理完成！")
        ctx.exit(0)
    else:
        log_warning(f"仍有 {fail_count} 项检查失败，请检查上述报告")
        ctx.exit(1)


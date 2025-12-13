#!/usr/bin/env python3
"""Claude Code CLI/Router 管理工具"""

import sys
from pathlib import Path

# 添加 scripts 目录到 Python 路径
scripts_dir = Path(__file__).parent
if str(scripts_dir) not in sys.path:
    sys.path.insert(0, str(scripts_dir))

import click
from rich.console import Console
from utils.logger import log_info

console = Console()


@click.group()
@click.version_option(version='1.0.0', prog_name='claude-manager')
@click.option('--verbose', '-v', is_flag=True, help='启用详细输出')
@click.option('--quiet', '-q', is_flag=True, help='静默模式，仅输出错误')
@click.pass_context
def cli(ctx, verbose, quiet):
    """
    Claude Code CLI/Router 管理工具
    
    用于安装、卸载和管理 Claude Code CLI 和 Claude Code Router
    """
    # 确保 ctx.obj 存在
    ctx.ensure_object(dict)
    ctx.obj['verbose'] = verbose
    ctx.obj['quiet'] = quiet
    
    if verbose and not quiet:
        log_info("详细模式已启用")


# 导入子命令
from commands import install, uninstall, set_api_key, verify, set_config
cli.add_command(install.install)
cli.add_command(uninstall.uninstall)
cli.add_command(set_api_key.set_api_key)
cli.add_command(verify.verify)
cli.add_command(set_config.set_config)


if __name__ == '__main__':
    cli()


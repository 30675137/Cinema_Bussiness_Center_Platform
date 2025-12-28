"""Set API key command for Claude Code."""

import click
from pathlib import Path
from rich.prompt import Prompt
from rich.console import Console
from core.env_manager import set_api_key as set_env_api_key, detect_config_file
from utils.logger import log_info, log_error, log_success, log_warning
from utils.validators import validate_api_key, sanitize_api_key

console = Console()


@click.command()
@click.argument('api_key', required=False)
@click.option('--config-file', type=click.Path(exists=False, path_type=Path), help='目标配置文件路径（默认: 自动检测 ~/.zshrc 或 ~/.zshenv）')
@click.option('--no-update', is_flag=True, help='如果已存在则不更新（默认: 更新）')
@click.pass_context
def set_api_key(ctx, api_key, config_file, no_update):
    """
    设置或更新 API key
    
    将 API key 写入环境变量配置文件（~/.zshrc 或 ~/.zshenv）。
    
    API_KEY: API key 值（如果未提供，则交互式询问）
    """
    console.print("\n[bold cyan]设置 Claude API Key[/bold cyan]\n")
    
    # 如果没有提供 API key，交互式询问
    if not api_key:
        api_key = Prompt.ask(
            "请输入 API key",
            password=True  # 隐藏输入
        )
    
    if not api_key or not api_key.strip():
        log_error("API key 不能为空")
        ctx.exit(2)  # Exit code 2: 参数错误
    
    # 清理和验证 API key
    api_key = sanitize_api_key(api_key)
    if not api_key:
        log_error("API key 格式无效")
        ctx.exit(2)
    
    # 验证 API key 格式（额外检查）
    if not validate_api_key(api_key):
        log_warning("API key 格式可能无效，但仍将继续设置")
    
    # 检测配置文件
    if not config_file:
        config_file = detect_config_file()
        if not config_file:
            log_error("未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）")
            log_info("请先创建 ~/.zshrc 文件")
            ctx.exit(1)
    
    # 检查配置文件是否存在
    if config_file and not config_file.exists():
        log_warning(f"配置文件不存在: {config_file}")
        if not click.confirm(f"是否创建配置文件 {config_file}?"):
            ctx.exit(1)
        # 创建空文件
        config_file.parent.mkdir(parents=True, exist_ok=True)
        config_file.touch()
    
    # 设置 API key
    update_existing = not no_update
    log_info(f"设置 API key 到: {config_file}")
    
    if set_env_api_key(api_key, config_file, update_existing):
        log_success("API key 设置成功！")
        console.print(f"\n[bold yellow]注意:[/bold yellow] 请运行以下命令使环境变量生效:")
        console.print(f"  [cyan]source {config_file}[/cyan]")
        console.print("  或重新打开终端\n")
        ctx.exit(0)
    else:
        log_error("API key 设置失败")
        ctx.exit(1)


"""Install command for Claude Code CLI and Router."""

import click
import os
from typing import List, Optional
from rich.prompt import Prompt, Confirm
from rich.console import Console
from core import InstallationConfig
from core.package_manager import (
    check_npm_available,
    install_cli_npm,
    install_router_npm,
    verify_installation,
)
from core.env_manager import set_api_key as set_env_api_key
from core.config_manager import load_and_apply_config, get_config_env_vars, load_claude_config
from utils.logger import log_info, log_error, log_warning, log_success, create_progress
from utils.validators import sanitize_api_key

console = Console()


def prompt_component_selection() -> List[str]:
    """
    交互式提示用户选择要安装的组件
    
    Returns:
        组件列表（['cli'], ['router'], 或 ['cli', 'router']）
    """
    console.print("\n[bold cyan]选择要安装的组件:[/bold cyan]")
    console.print("1. CLI 和 Router")
    console.print("2. 仅 CLI")
    console.print("3. 仅 Router")
    
    choice = Prompt.ask(
        "\n请选择",
        choices=["1", "2", "3"],
        default="1"
    )
    
    if choice == "1":
        return ["cli", "router"]
    elif choice == "2":
        return ["cli"]
    else:
        return ["router"]


def prompt_api_key() -> Optional[str]:
    """
    交互式提示用户输入 API key
    
    Returns:
        API key 字符串，如果用户取消则返回 None
    """
    if not Confirm.ask("\n是否现在设置 API key?", default=False):
        return None
    
    api_key = Prompt.ask(
        "请输入 API key",
        password=True  # 隐藏输入
    )
    
    if not api_key or not api_key.strip():
        log_warning("API key 为空，跳过设置")
        return None
    
    return api_key.strip()


@click.command()
@click.option('--cli', 'install_cli', is_flag=True, help='安装 Claude Code CLI')
@click.option('--router', 'install_router', is_flag=True, help='安装 Claude Code Router')
@click.option('--api-key', help='API key（可选，安装后自动设置）')
@click.option('--no-interactive', is_flag=True, help='非交互模式，需要提供所有参数')
@click.pass_context
def install(ctx, install_cli, install_router, api_key, no_interactive):
    """
    安装 Claude Code CLI 和/或 Claude Code Router
    
    使用官方推荐的 npm 方式安装。
    """
    console.print("\n[bold cyan]Claude Code 安装工具[/bold cyan]\n")
    
    # 自动读取配置文件（如果存在）
    config_env_vars = get_config_env_vars()
    if config_env_vars:
        log_info("从配置文件加载环境变量设置")
        # 应用到当前进程环境变量（供后续使用）
        load_and_apply_config()
        # 如果命令行未提供 API key，尝试从配置文件读取
        if not api_key and "ANTHROPIC_AUTH_TOKEN" in config_env_vars:
            api_key = config_env_vars["ANTHROPIC_AUTH_TOKEN"]
            log_info("从配置文件读取 API key")
    
    # 检查 npm 是否可用
    if not check_npm_available():
        log_error("npm 未安装或不可用")
        console.print("\n[bold red]错误:[/bold red] 请先安装 Node.js 和 npm")
        console.print("\n安装方法:")
        console.print("  - 使用 Homebrew: [cyan]brew install node[/cyan]")
        console.print("  - 或访问: [cyan]https://nodejs.org/[/cyan]\n")
        ctx.exit(4)  # Exit code 4: 依赖缺失
    
    # 确定要安装的组件
    components = []
    
    if install_cli:
        components.append("cli")
    if install_router:
        components.append("router")
    
    # 如果未指定组件，且非交互模式，则报错
    if not components and no_interactive:
        log_error("非交互模式下必须指定 --cli 或 --router")
        ctx.exit(2)  # Exit code 2: 参数错误
    
    # 如果未指定组件，则交互式询问
    if not components and not no_interactive:
        components = prompt_component_selection()
    
    if not components:
        log_error("未选择要安装的组件")
        ctx.exit(2)
    
    # 创建安装配置
    config = InstallationConfig(
        components=components,
        method='npm',
        api_key=api_key
    )
    
    console.print(f"\n[bold]将安装以下组件:[/bold] {', '.join(components)}\n")
    
    # 验证和清理 API key（如果提供）
    if api_key:
        from utils.validators import sanitize_api_key
        sanitized_key = sanitize_api_key(api_key)
        if not sanitized_key:
            log_error("API key 格式无效")
            ctx.exit(2)
        api_key = sanitized_key
    
    # 执行安装（使用进度指示器）
    all_success = True
    from utils.logger import create_progress
    
    with create_progress() as progress:
        task = progress.add_task("[cyan]安装组件...", total=len(components))
        
        # 安装 CLI
        if "cli" in components:
            progress.update(task, description="[cyan]安装 Claude Code CLI...")
            if not install_cli_npm():
                all_success = False
                log_error("Claude Code CLI 安装失败")
            progress.advance(task)
        
        # 安装 Router
        if "router" in components:
            progress.update(task, description="[cyan]安装 Claude Code Router...")
            if not install_router_npm():
                all_success = False
                log_error("Claude Code Router 安装失败")
            progress.advance(task)
    
    if not all_success:
        log_error("部分组件安装失败")
        ctx.exit(1)  # Exit code 1: 安装失败
    
    # 验证安装
    console.print("\n[bold]验证安装...[/bold]\n")
    if not verify_installation(components):
        log_warning("安装验证失败，但安装可能已成功")
        log_warning("请手动运行 'claude --version' 验证")
    
    # 设置 API key（如果提供）
    api_key_to_set = config.api_key
    if not api_key_to_set and not no_interactive:
        api_key_to_set = prompt_api_key()
    
    if api_key_to_set:
        console.print("\n[bold]设置 API key...[/bold]\n")
        if set_env_api_key(api_key_to_set):
            log_success("API key 设置成功")
            console.print("\n[bold yellow]注意:[/bold yellow] 请运行 [cyan]source ~/.zshrc[/cyan] 或重新打开终端以使环境变量生效\n")
        else:
            log_warning("API key 设置失败，请手动设置")
    
    # 完成
    console.print("\n[bold green]✓ 安装完成![/bold green]\n")
    
    # 显示当前配置信息
    console.print("[bold]当前配置信息:[/bold]\n")
    config = load_claude_config()
    if config and "env" in config:
        env_vars = config["env"]
        
        # 显示 ANTHROPIC_AUTH_TOKEN（部分隐藏）
        if "ANTHROPIC_AUTH_TOKEN" in env_vars:
            token = env_vars["ANTHROPIC_AUTH_TOKEN"]
            if len(token) > 8:
                masked_token = token[:4] + "*" * (len(token) - 8) + token[-4:]
            else:
                masked_token = "*" * len(token)
            console.print(f"  [cyan]ANTHROPIC_AUTH_TOKEN:[/cyan] {masked_token}")
        
        # 显示 ANTHROPIC_BASE_URL
        if "ANTHROPIC_BASE_URL" in env_vars:
            console.print(f"  [cyan]ANTHROPIC_BASE_URL:[/cyan] {env_vars['ANTHROPIC_BASE_URL']}")
        
        # 显示 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC
        if "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC" in env_vars:
            value = env_vars["CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC"]
            status = "已启用" if str(value) in ["1", "true", "True"] else "已禁用"
            console.print(f"  [cyan]CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:[/cyan] {status} ({value})")
        
        # 显示 API_TIMEOUT_MS
        if "API_TIMEOUT_MS" in env_vars:
            timeout_ms = env_vars["API_TIMEOUT_MS"]
            timeout_sec = int(timeout_ms) / 1000 if timeout_ms else 0
            console.print(f"  [cyan]API_TIMEOUT_MS:[/cyan] {timeout_ms} ({timeout_sec} 秒)")
    else:
        console.print("  [yellow]未找到配置文件，使用默认配置[/yellow]")
    
    console.print()
    log_info("可以使用以下命令验证安装:")
    if "cli" in components:
        console.print("  [cyan]claude --version[/cyan]")
    if "router" in components:
        console.print("  [cyan]ccr --version[/cyan]")
    console.print()


# 导出命令
install_command = install


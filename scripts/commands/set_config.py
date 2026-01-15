"""Set configuration command for Claude Code."""

import click
import json
from pathlib import Path
from rich.prompt import Prompt, Confirm
from rich.console import Console
from core.config_manager import (
    set_claude_config,
    set_env_vars_to_shell_config,
    get_claude_config_path,
    load_claude_config,
)
from core.env_manager import detect_config_file
from utils.logger import log_info, log_error, log_success, log_warning
from utils.validators import sanitize_api_key, sanitize_url, sanitize_timeout

console = Console()


@click.command()
@click.option('--auth-token', help='ANTHROPIC_AUTH_TOKEN (API key)')
@click.option('--base-url', help='ANTHROPIC_BASE_URL')
@click.option('--disable-nonessential-traffic', type=bool, help='CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC (true/false)')
@click.option('--api-timeout-ms', type=int, help='API_TIMEOUT_MS (毫秒)')
@click.option('--config-file', type=click.Path(exists=False, path_type=Path), help='Claude 配置文件路径（默认: ~/.claude/settings.json）')
@click.option('--shell-config', type=click.Path(exists=False, path_type=Path), help='Shell 配置文件路径（默认: 自动检测）')
@click.option('--to-shell', is_flag=True, help='同时设置到 shell 配置文件（~/.zshrc）')
@click.option('--json-file', type=click.Path(exists=True, path_type=Path), help='从 JSON 文件读取配置')
@click.pass_context
def set_config(
    ctx,
    auth_token,
    base_url,
    disable_nonessential_traffic,
    api_timeout_ms,
    config_file,
    shell_config,
    to_shell,
    json_file
):
    """
    设置 Claude Code 配置
    
    支持设置环境变量和权限配置。配置可以保存到：
    1. Claude 配置文件（~/.claude/settings.json）
    2. Shell 配置文件（~/.zshrc，如果使用 --to-shell）
    """
    console.print("\n[bold cyan]设置 Claude Code 配置[/bold cyan]\n")
    
    env_vars = {}
    permissions = {"allow": [], "deny": []}
    
    # 如果提供了 JSON 文件，从文件读取
    if json_file:
        try:
            content = json_file.read_text(encoding="utf-8")
            data = json.loads(content)
            
            if "env" in data:
                env_vars.update(data["env"])
            if "permissions" in data:
                permissions = data["permissions"]
            
            log_info(f"从文件加载配置: {json_file}")
        except Exception as e:
            log_error(f"读取 JSON 文件失败: {json_file}, 错误: {e}")
            ctx.exit(1)
    else:
        # 交互式或命令行参数设置（带输入验证和清理）
        if auth_token:
            sanitized_token = sanitize_api_key(auth_token)
            if not sanitized_token:
                log_error("API key 格式无效")
                ctx.exit(2)
            env_vars["ANTHROPIC_AUTH_TOKEN"] = sanitized_token
        else:
            token = Prompt.ask("请输入 ANTHROPIC_AUTH_TOKEN (API key)", password=True, default="")
            if token:
                sanitized_token = sanitize_api_key(token)
                if not sanitized_token:
                    log_error("API key 格式无效")
                    ctx.exit(2)
                env_vars["ANTHROPIC_AUTH_TOKEN"] = sanitized_token
        
        if base_url:
            sanitized_url = sanitize_url(base_url)
            if not sanitized_url:
                log_error("URL 格式无效")
                ctx.exit(2)
            env_vars["ANTHROPIC_BASE_URL"] = sanitized_url
        else:
            url = Prompt.ask("请输入 ANTHROPIC_BASE_URL", default="")
            if url:
                sanitized_url = sanitize_url(url)
                if sanitized_url:
                    env_vars["ANTHROPIC_BASE_URL"] = sanitized_url
                else:
                    log_warning("URL 格式无效，跳过")
        
        if disable_nonessential_traffic is not None:
            env_vars["CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC"] = "1" if disable_nonessential_traffic else "0"
        else:
            if Confirm.ask("是否禁用非必要流量 (CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC)?", default=False):
                env_vars["CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC"] = "1"
        
        if api_timeout_ms:
            sanitized_timeout = sanitize_timeout(str(api_timeout_ms))
            if not sanitized_timeout:
                log_error("超时值无效")
                ctx.exit(2)
            env_vars["API_TIMEOUT_MS"] = str(sanitized_timeout)
        else:
            timeout = Prompt.ask("请输入 API_TIMEOUT_MS (毫秒)", default="600000")
            if timeout:
                sanitized_timeout = sanitize_timeout(timeout)
                if sanitized_timeout:
                    env_vars["API_TIMEOUT_MS"] = str(sanitized_timeout)
                else:
                    log_warning("超时值无效，使用默认值 600000")
                    env_vars["API_TIMEOUT_MS"] = "600000"
    
    if not env_vars:
        log_warning("没有提供任何环境变量配置")
        ctx.exit(0)
    
    # 设置到 Claude 配置文件
    if not config_file:
        config_file = get_claude_config_path()
    
    log_info(f"保存配置到: {config_file}")
    
    if set_claude_config(env_vars=env_vars, permissions=permissions, merge=True):
        log_success("配置已保存到 Claude 配置文件")
    else:
        log_error("保存配置失败")
        ctx.exit(1)
    
    # 如果指定了 --to-shell，同时设置到 shell 配置文件
    if to_shell:
        if not shell_config:
            shell_config = detect_config_file()
            if not shell_config:
                log_error("未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）")
                ctx.exit(1)
        
        log_info(f"同时设置环境变量到: {shell_config}")
        if set_env_vars_to_shell_config(env_vars, shell_config):
            log_success("环境变量已设置到 shell 配置文件")
            console.print(f"\n[bold yellow]注意:[/bold yellow] 请运行以下命令使环境变量生效:")
            console.print(f"  [cyan]source {shell_config}[/cyan]")
            console.print("  或重新打开终端\n")
        else:
            log_warning("设置 shell 环境变量失败，但配置文件已保存")
    
    # 显示当前配置
    console.print("\n[bold]当前配置:[/bold]\n")
    current_config = load_claude_config()
    console.print(json.dumps(current_config, indent=2, ensure_ascii=False))
    console.print()


# 导出命令
set_config_command = set_config


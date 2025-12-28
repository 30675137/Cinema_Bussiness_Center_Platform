"""Configuration management module for Claude Code settings."""

import json
from pathlib import Path
from typing import Dict, Optional, Any
from utils.file_ops import read_file_safe, write_file_safe
from utils.logger import log_info, log_warning, log_error, log_debug


def get_claude_config_path() -> Path:
    """
    获取 Claude Code 配置文件路径
    
    Returns:
        配置文件路径（~/.claude/settings.json）
    """
    home = Path.home()
    config_dir = home / ".claude"
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir / "settings.json"


def load_claude_config() -> Dict[str, Any]:
    """
    加载 Claude Code 配置文件
    
    Returns:
        配置字典，如果文件不存在或格式错误返回空字典
    """
    config_path = get_claude_config_path()
    
    if not config_path.exists():
        log_debug(f"配置文件不存在: {config_path}")
        return {}
    
    try:
        content = read_file_safe(config_path)
        if content:
            config = json.loads(content)
            return config if isinstance(config, dict) else {}
    except json.JSONDecodeError as e:
        log_error(f"配置文件 JSON 格式错误: {config_path}, 错误: {e}")
    except Exception as e:
        log_error(f"读取配置文件失败: {config_path}, 错误: {e}")
    
    return {}


def save_claude_config(config: Dict[str, Any]) -> bool:
    """
    保存 Claude Code 配置文件
    
    Args:
        config: 配置字典
        
    Returns:
        如果保存成功返回 True，否则返回 False
    """
    config_path = get_claude_config_path()
    
    try:
        # 格式化 JSON（缩进 2 个空格）
        content = json.dumps(config, indent=2, ensure_ascii=False)
        if write_file_safe(config_path, content):
            log_info(f"成功保存配置文件: {config_path}")
            return True
        else:
            log_error(f"写入配置文件失败: {config_path}")
            return False
    except Exception as e:
        log_error(f"保存配置文件时出错: {config_path}, 错误: {e}")
        return False


def set_claude_config(
    env_vars: Optional[Dict[str, str]] = None,
    permissions: Optional[Dict[str, list]] = None,
    merge: bool = True
) -> bool:
    """
    设置 Claude Code 配置
    
    Args:
        env_vars: 环境变量字典
        permissions: 权限设置字典（包含 allow 和 deny 列表）
        merge: 是否合并到现有配置（默认: True）
        
    Returns:
        如果设置成功返回 True，否则返回 False
    """
    if merge:
        config = load_claude_config()
    else:
        config = {}
    
    # 更新环境变量
    if env_vars:
        if "env" not in config:
            config["env"] = {}
        config["env"].update(env_vars)
        log_info(f"更新环境变量配置: {list(env_vars.keys())}")
    
    # 更新权限设置
    if permissions:
        if "permissions" not in config:
            config["permissions"] = {"allow": [], "deny": []}
        if "allow" in permissions:
            config["permissions"]["allow"] = permissions["allow"]
        if "deny" in permissions:
            config["permissions"]["deny"] = permissions["deny"]
        log_info("更新权限配置")
    
    return save_claude_config(config)


def load_and_apply_config() -> Dict[str, Any]:
    """
    加载配置文件并应用到当前进程环境变量
    
    Returns:
        配置字典，如果文件不存在返回空字典
    """
    import os
    config = load_claude_config()
    
    if config and "env" in config:
        env_vars = config["env"]
        for key, value in env_vars.items():
            # 应用到当前进程环境变量
            os.environ[key] = str(value)
            log_debug(f"从配置文件加载环境变量: {key}")
    
    return config


def get_config_env_vars() -> Dict[str, str]:
    """
    从配置文件中获取环境变量（不应用到当前进程）
    
    Returns:
        环境变量字典
    """
    config = load_claude_config()
    if config and "env" in config:
        return config["env"]
    return {}


def set_env_vars_to_shell_config(
    env_vars: Dict[str, str],
    config_file: Optional[Path] = None
) -> bool:
    """
    将环境变量设置到 shell 配置文件
    
    Args:
        env_vars: 环境变量字典
        config_file: 配置文件路径，如果为 None 则自动检测
        
    Returns:
        如果设置成功返回 True，否则返回 False
    """
    from .env_manager import detect_config_file
    
    if not config_file:
        config_file = detect_config_file()
        if not config_file:
            log_error("未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）")
            return False
    
    try:
        content = read_file_safe(config_file)
        if content is None:
            content = ""
        
        import re
        
        # 更新或添加每个环境变量
        for key, value in env_vars.items():
            # 确保值是字符串类型
            if not isinstance(value, str):
                value = str(value)
            # 转义特殊字符
            escaped_value = value.replace('"', '\\"')
            
            # 检查是否已存在
            pattern = rf'export\s+{re.escape(key)}=["\']?([^"\'\n]+)["\']?'
            match = re.search(pattern, content)
            
            if match:
                # 更新现有的环境变量
                content = re.sub(pattern, f'export {key}="{escaped_value}"', content)
                log_info(f"更新环境变量: {key}")
            else:
                # 追加新的环境变量
                if content and not content.endswith('\n'):
                    content += '\n'
                content += f'export {key}="{escaped_value}"\n'
                log_info(f"添加环境变量: {key}")
        
        if write_file_safe(config_file, content):
            log_info(f"成功更新配置文件: {config_file}")
            return True
        else:
            log_error(f"写入配置文件失败: {config_file}")
            return False
            
    except Exception as e:
        log_error(f"设置环境变量时出错: {config_file}, 错误: {e}")
        return False


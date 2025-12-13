"""Environment variable management module."""

import os
import re
from pathlib import Path
from typing import List, Optional
from utils.file_ops import read_file_safe, write_file_safe
from utils.logger import log_info, log_warning, log_error, log_debug


def detect_config_file() -> Optional[Path]:
    """
    检测 shell 配置文件（优先 ~/.zshrc，其次 ~/.zshenv）
    
    Returns:
        配置文件路径，如果都不存在返回 None
    """
    home = Path.home()
    config_files = [
        home / ".zshrc",
        home / ".zshenv",
    ]
    
    for config_file in config_files:
        if config_file.exists() and config_file.is_file():
            log_debug(f"检测到配置文件: {config_file}")
            return config_file
    
    return None


def cleanup_env_vars_from_files() -> bool:
    """
    从 shell 配置文件中移除 Claude 相关的环境变量和 alias
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    config_file = detect_config_file()
    
    if not config_file:
        log_info("未找到 shell 配置文件，跳过环境变量清理")
        return True
    
    try:
        content = read_file_safe(config_file)
        if content is None:
            log_warning(f"无法读取配置文件: {config_file}")
            return False
        
        original_content = content
        
        # 移除 ANTHROPIC_* 环境变量
        content = re.sub(r'export\s+ANTHROPIC_\w+=.*\n', '', content)
        content = re.sub(r'export\s+ANTHROPIC_\w+=".*"\n', '', content)
        content = re.sub(r"export\s+ANTHROPIC_\w+='.*'\n", '', content)
        
        # 移除 SILICONFLOW_* 环境变量
        content = re.sub(r'export\s+SILICONFLOW_\w+=.*\n', '', content)
        content = re.sub(r'export\s+SILICONFLOW_\w+=".*"\n', '', content)
        content = re.sub(r"export\s+SILICONFLOW_\w+='.*'\n", '', content)
        
        # 移除 Claude 相关的 alias
        content = re.sub(r'alias\s+claude=.*\n', '', content)
        content = re.sub(r'alias\s+ccr=.*\n', '', content)
        
        # 移除 eval "$(ccr activate)" 行（多种格式）
        content = re.sub(r'eval\s+"\$\(ccr\s+activate\)"\s*\n', '', content)
        content = re.sub(r"eval\s+'\$\(ccr\s+activate\)'\s*\n", '', content)
        content = re.sub(r'eval\s+\$\(ccr\s+activate\)\s*\n', '', content)
        # 也匹配可能的变体格式
        content = re.sub(r'eval\s+"\$\(ccr\s+activate\)"\s*;?\s*\n', '', content)
        content = re.sub(r"eval\s+'\$\(ccr\s+activate\)'\s*;?\s*\n", '', content)
        
        # 移除空行（连续多个空行保留一个）
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        if content != original_content:
            log_info(f"从配置文件中移除 Claude 相关环境变量: {config_file}")
            if write_file_safe(config_file, content):
                log_info(f"成功更新配置文件: {config_file}")
                return True
            else:
                log_error(f"更新配置文件失败: {config_file}")
                return False
        else:
            log_info(f"配置文件中没有 Claude 相关环境变量: {config_file}")
            return True
            
    except Exception as e:
        log_error(f"清理环境变量时出错: {config_file}, 错误: {e}")
        return False


def cleanup_session_env_vars() -> bool:
    """
    清理当前终端会话的环境变量（ANTHROPIC_*, SILICONFLOW_*）
    
    注意：此函数只能清理当前 Python 进程的环境变量，无法影响父 shell。
    要清理父 shell 的环境变量，需要用户手动执行 unset 命令或重新打开终端。
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    env_vars_to_remove = []
    
    # 查找所有 ANTHROPIC_* 和 SILICONFLOW_* 环境变量
    for key in list(os.environ.keys()):  # 使用 list() 避免迭代时修改字典
        if key.startswith("ANTHROPIC_") or key.startswith("SILICONFLOW_"):
            env_vars_to_remove.append(key)
    
    if not env_vars_to_remove:
        log_info("当前会话中没有 Claude 相关环境变量")
        return True
    
    try:
        for key in env_vars_to_remove:
            log_info(f"从当前会话中移除环境变量: {key}")
            os.environ.pop(key, None)
        
        log_info(f"成功清理 {len(env_vars_to_remove)} 个环境变量")
        log_warning("注意：此操作仅影响当前 Python 进程")
        log_warning("要清理父 shell 的环境变量，请在终端中执行：")
        log_warning("  unset ANTHROPIC_API_KEY ANTHROPIC_BASE_URL ANTHROPIC_MODEL")
        log_warning("或重新打开终端")
        return True
    except Exception as e:
        log_error(f"清理会话环境变量时出错: {e}")
        return False


def set_api_key(api_key: str, config_file: Optional[Path] = None, update_existing: bool = True) -> bool:
    """
    设置 API key 到环境变量配置文件
    
    Args:
        api_key: API key 值
        config_file: 配置文件路径，如果为 None 则自动检测
        update_existing: 如果已存在则更新
        
    Returns:
        如果设置成功返回 True，否则返回 False
    """
    if not config_file:
        config_file = detect_config_file()
        if not config_file:
            log_error("未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）")
            return False
    
    try:
        content = read_file_safe(config_file)
        if content is None:
            # 如果文件不存在，创建新文件
            content = ""
        
        # 检查是否已存在 ANTHROPIC_API_KEY
        pattern = r'export\s+ANTHROPIC_API_KEY=["\']?([^"\'\n]+)["\']?'
        match = re.search(pattern, content)
        
        if match:
            if update_existing:
                # 更新现有的 API key
                content = re.sub(pattern, f'export ANTHROPIC_API_KEY="{api_key}"', content)
                log_info(f"更新现有 API key: {config_file}")
            else:
                log_warning(f"API key 已存在，跳过更新: {config_file}")
                return False
        else:
            # 追加新的 API key
            if content and not content.endswith('\n'):
                content += '\n'
            content += f'export ANTHROPIC_API_KEY="{api_key}"\n'
            log_info(f"添加新 API key: {config_file}")
        
        if write_file_safe(config_file, content):
            log_info(f"成功设置 API key: {config_file}")
            log_info("请运行 'source ~/.zshrc' 或重新打开终端以使环境变量生效")
            return True
        else:
            log_error(f"写入配置文件失败: {config_file}")
            return False
            
    except Exception as e:
        log_error(f"设置 API key 时出错: {config_file}, 错误: {e}")
        return False


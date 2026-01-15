"""Validation utility functions."""

import re
from pathlib import Path
from typing import Optional
from .logger import log_warning


def validate_api_key(api_key: str) -> bool:
    """
    验证 API key 格式
    
    Args:
        api_key: API key 字符串
        
    Returns:
        如果格式有效返回 True，否则返回 False
    """
    if not api_key or not isinstance(api_key, str):
        return False
    
    # 基本格式检查：至少 10 个字符，通常以 sk- 开头
    if len(api_key) < 10:
        log_warning("API key 长度不足")
        return False
    
    # Anthropic API key 通常以 sk-ant- 开头
    if api_key.startswith("sk-ant-"):
        return True
    
    # 也接受其他格式（向后兼容）
    if api_key.startswith("sk-"):
        return True
    
    log_warning("API key 格式可能无效（建议以 sk-ant- 开头）")
    return True  # 仍然接受，但给出警告


def validate_path(path: Path, must_exist: bool = False, must_be_file: bool = False, must_be_dir: bool = False) -> bool:
    """
    验证路径
    
    Args:
        path: 路径对象
        must_exist: 是否必须存在
        must_be_file: 是否必须是文件
        must_be_dir: 是否必须是目录
        
    Returns:
        如果验证通过返回 True，否则返回 False
    """
    if must_exist and not path.exists():
        return False
    
    if path.exists():
        if must_be_file and not path.is_file():
            return False
        if must_be_dir and not path.is_dir():
            return False
    
    return True


def validate_shell_config_file(path: Path) -> bool:
    """
    验证 shell 配置文件
    
    Args:
        path: 配置文件路径
        
    Returns:
        如果有效返回 True，否则返回 False
    """
    if not path.exists():
        return False
    
    if not path.is_file():
        return False
    
    # 检查是否可写
    if not path.parent.exists() or not path.parent.is_dir():
        return False
    
    return True


def sanitize_api_key(api_key: str) -> Optional[str]:
    """
    清理和验证 API key
    
    Args:
        api_key: 原始 API key 字符串
        
    Returns:
        清理后的 API key，如果无效返回 None
    """
    if not api_key:
        return None
    
    # 去除首尾空白
    api_key = api_key.strip()
    
    # 移除可能的引号
    api_key = api_key.strip('"\'')
    
    # 基本验证
    if not validate_api_key(api_key):
        return None
    
    return api_key


def sanitize_url(url: str) -> Optional[str]:
    """
    清理和验证 URL
    
    Args:
        url: 原始 URL 字符串
        
    Returns:
        清理后的 URL，如果无效返回 None
    """
    if not url:
        return None
    
    # 去除首尾空白
    url = url.strip()
    
    # 移除可能的引号
    url = url.strip('"\'')
    
    # 基本 URL 格式验证
    if not url.startswith(('http://', 'https://')):
        log_warning(f"URL 格式可能无效: {url}")
        return None
    
    return url


def sanitize_path_string(path_str: str) -> Optional[str]:
    """
    清理路径字符串，防止路径遍历攻击
    
    Args:
        path_str: 原始路径字符串
        
    Returns:
        清理后的路径字符串，如果无效返回 None
    """
    if not path_str:
        return None
    
    # 去除首尾空白
    path_str = path_str.strip()
    
    # 检查路径遍历攻击
    if '..' in path_str or path_str.startswith('/'):
        log_warning(f"路径可能不安全: {path_str}")
        return None
    
    return path_str


def sanitize_timeout(timeout_str: str) -> Optional[int]:
    """
    清理和验证超时值
    
    Args:
        timeout_str: 超时字符串（毫秒）
        
    Returns:
        超时值（整数），如果无效返回 None
    """
    if not timeout_str:
        return None
    
    try:
        timeout = int(timeout_str.strip())
        if timeout < 0:
            log_warning("超时值不能为负数")
            return None
        if timeout > 3600000:  # 1 小时
            log_warning("超时值过大（超过 1 小时）")
            return None
        return timeout
    except ValueError:
        log_warning(f"无效的超时值: {timeout_str}")
        return None


"""Shell command execution utility."""

import subprocess
from typing import List, Optional, Tuple
from .logger import log_error


def run_command(
    cmd: List[str],
    check: bool = True,
    capture_output: bool = True,
    text: bool = True,
) -> subprocess.CompletedProcess:
    """
    执行 Shell 命令
    
    Args:
        cmd: 命令列表
        check: 如果命令失败是否抛出异常
        capture_output: 是否捕获输出
        text: 是否以文本模式返回输出
        
    Returns:
        CompletedProcess 对象
        
    Raises:
        RuntimeError: 命令执行失败
    """
    try:
        result = subprocess.run(
            cmd,
            capture_output=capture_output,
            text=text,
            check=check,
        )
        return result
    except subprocess.CalledProcessError as e:
        error_msg = f"命令执行失败: {' '.join(cmd)}"
        if e.stderr:
            error_msg += f"\n错误信息: {e.stderr}"
        log_error(error_msg)
        raise RuntimeError(error_msg) from e
    except FileNotFoundError as e:
        error_msg = f"命令未找到: {cmd[0]}"
        log_error(error_msg)
        raise RuntimeError(error_msg) from e


def check_command_exists(command: str) -> bool:
    """
    检查命令是否存在
    
    Args:
        command: 命令名称
        
    Returns:
        如果命令存在返回 True，否则返回 False
    """
    try:
        result = run_command(
            ["which", command],
            check=False,
            capture_output=True,
        )
        return result.returncode == 0
    except Exception:
        return False


def get_command_output(cmd: List[str]) -> Optional[str]:
    """
    获取命令输出
    
    Args:
        cmd: 命令列表
        
    Returns:
        命令输出字符串，如果失败返回 None
    """
    try:
        result = run_command(cmd, check=False)
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception:
        return None




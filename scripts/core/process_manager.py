"""Process management module for detecting and stopping Claude processes."""

import os
import psutil
from typing import List, Optional
from . import ProcessInfo
from utils.logger import log_info, log_warning, log_debug


def find_claude_processes() -> List[ProcessInfo]:
    """
    查找所有 Claude 相关进程
    
    排除当前脚本进程，只检测真正的 Claude 命令进程。
    
    Returns:
        ProcessInfo 列表
    """
    processes = []
    current_pid = os.getpid()  # 获取当前进程 PID，排除自己
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                proc_info = proc.info
                pid = proc_info['pid']
                
                # 排除当前进程
                if pid == current_pid:
                    continue
                
                name = proc_info.get('name', '').lower()
                cmdline_list = proc_info.get('cmdline', []) or []
                cmdline = ' '.join(cmdline_list).lower()
                
                # 排除包含 claude_manager.py 的进程（我们的脚本）
                if 'claude_manager.py' in cmdline:
                    continue
                
                # 更精确地匹配 Claude 进程：
                # 1. 进程名是 'claude' 或 'ccr'
                # 2. 或者命令行包含 'claude-code-router' 或 '@musistudio/claude-code-router'
                # 3. 或者命令行包含 '@anthropic-ai/claude-code' 且不是我们的脚本
                is_claude_process = False
                
                # 检查是否是 claude 或 ccr 命令
                if name in ['claude', 'ccr']:
                    is_claude_process = True
                # 检查命令行是否包含 Claude Code Router
                elif 'claude-code-router' in cmdline or '@musistudio/claude-code-router' in cmdline:
                    is_claude_process = True
                # 检查命令行是否包含 Claude Code CLI（但排除我们的脚本）
                elif '@anthropic-ai/claude-code' in cmdline:
                    is_claude_process = True
                # 检查是否是 node 进程运行 claude-code-router
                elif name == 'node' and ('claude-code-router' in cmdline or 'ccr' in cmdline):
                    is_claude_process = True
                
                if is_claude_process:
                    processes.append(ProcessInfo(
                        pid=pid,
                        name=proc_info.get('name', 'unknown'),
                        cmdline=cmdline if cmdline else None
                    ))
                    log_debug(f"发现 Claude 进程: PID={pid}, Name={proc_info.get('name')}, Cmdline={cmdline[:100]}")
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                # 进程可能已经结束或没有权限访问
                continue
    except Exception as e:
        log_warning(f"查找进程时出错: {e}")
    
    return processes


def stop_processes(processes: List[ProcessInfo], force: bool = False) -> bool:
    """
    停止进程列表
    
    先尝试使用 ccr stop 优雅停止 Router，然后使用 psutil 停止其他进程。
    
    Args:
        processes: 要停止的进程列表
        force: 是否强制终止（kill），默认 False（先尝试 terminate）
        
    Returns:
        如果所有进程都成功停止返回 True，否则返回 False
    """
    if not processes:
        log_info("没有需要停止的进程")
        return True
    
    # 先尝试使用 ccr stop 优雅停止 Router（如果存在）
    from utils.shell import run_command, check_command_exists
    if check_command_exists("ccr"):
        try:
            log_info("尝试使用 ccr stop 停止 Router...")
            result = run_command(["ccr", "stop"], check=False)
            if result.returncode == 0:
                log_info("成功使用 ccr stop 停止 Router")
            else:
                log_debug("ccr stop 失败或 Router 未运行，继续使用其他方法")
        except Exception as e:
            log_debug(f"执行 ccr stop 时出错（可忽略）: {e}")
    
    all_success = True
    
    for proc_info in processes:
        try:
            proc = psutil.Process(proc_info.pid)
            name = proc_info.name
            
            if force:
                log_info(f"强制终止进程: {name} (PID: {proc_info.pid})")
                proc.kill()
            else:
                log_info(f"停止进程: {name} (PID: {proc_info.pid})")
                proc.terminate()
            
            # 等待进程结束（最多等待 5 秒）
            try:
                proc.wait(timeout=5)
                log_info(f"进程已停止: {name}")
            except psutil.TimeoutExpired:
                # 如果 terminate 失败，尝试 kill
                log_warning(f"进程未响应，强制终止: {name}")
                proc.kill()
                proc.wait(timeout=2)
                log_info(f"进程已强制终止: {name}")
                
        except psutil.NoSuchProcess:
            log_debug(f"进程已不存在: {proc_info.name} (PID: {proc_info.pid})")
            # 进程已经不存在，视为成功
        except psutil.AccessDenied:
            log_warning(f"权限不足，无法停止进程: {proc_info.name} (PID: {proc_info.pid})")
            all_success = False
        except Exception as e:
            log_warning(f"停止进程失败: {proc_info.name}, 错误: {e}")
            all_success = False
    
    return all_success


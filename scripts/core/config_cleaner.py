"""Configuration file cleanup module."""

from pathlib import Path
from typing import List
from utils.file_ops import safe_remove, find_files
from utils.logger import log_info, log_warning, log_error


def cleanup_user_configs() -> bool:
    """
    清理用户级配置文件
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    home = Path.home()
    config_paths = [
        home / ".claude",
        home / ".claude.json",
        home / ".claude-code-router",
        home / ".claude-code",
    ]
    
    all_success = True
    
    for config_path in config_paths:
        if config_path.exists():
            try:
                log_info(f"清理用户配置文件: {config_path}")
                # 对于目录，使用 shutil.rmtree 强制删除
                if config_path.is_dir():
                    import shutil
                    try:
                        # 强制删除目录及其所有内容
                        shutil.rmtree(config_path, ignore_errors=False)
                        log_info(f"成功清理目录: {config_path}")
                    except PermissionError as e:
                        log_error(f"权限不足，无法删除目录: {config_path}, 错误: {e}")
                        log_warning(f"请手动执行: rm -rf {config_path}")
                        all_success = False
                    except Exception as e:
                        log_warning(f"清理目录失败: {config_path}, 错误: {e}")
                        # 尝试使用 safe_remove 作为备选
                        try:
                            if not safe_remove(config_path):
                                log_warning(f"备选删除方法也失败，请手动执行: rm -rf {config_path}")
                                all_success = False
                        except Exception:
                            log_warning(f"请手动执行: rm -rf {config_path}")
                            all_success = False
                else:
                    if safe_remove(config_path):
                        log_info(f"成功清理: {config_path}")
                    else:
                        log_warning(f"清理失败: {config_path}")
                        all_success = False
            except Exception as e:
                log_error(f"清理用户配置文件时出错: {config_path}, 错误: {e}")
                all_success = False
        else:
            log_info(f"配置文件不存在，跳过: {config_path}")
    
    return all_success


def cleanup_project_residue() -> bool:
    """
    查找并清理项目级残留（.claude/, .mcp.json）
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    home = Path.home()
    
    # 搜索范围：用户主目录下的常见项目目录
    search_paths = [
        home,
        home / "Projects",
        home / "Documents",
        home / "Code",
        home / "workspace",
    ]
    
    all_success = True
    found_count = 0
    
    for search_path in search_paths:
        if not search_path.exists():
            continue
        
        # 查找 .claude/ 目录
        claude_dirs = find_files(".claude", search_path)
        for claude_dir in claude_dirs:
            if claude_dir.is_dir():
                try:
                    log_info(f"清理项目残留目录: {claude_dir}")
                    if safe_remove(claude_dir):
                        log_info(f"成功清理: {claude_dir}")
                        found_count += 1
                    else:
                        log_warning(f"清理失败: {claude_dir}")
                        all_success = False
                except Exception as e:
                    log_error(f"清理项目残留目录时出错: {claude_dir}, 错误: {e}")
                    all_success = False
        
        # 查找 .mcp.json 文件
        mcp_files = find_files(".mcp.json", search_path)
        for mcp_file in mcp_files:
            if mcp_file.is_file():
                try:
                    log_info(f"清理项目残留文件: {mcp_file}")
                    if safe_remove(mcp_file):
                        log_info(f"成功清理: {mcp_file}")
                        found_count += 1
                    else:
                        log_warning(f"清理失败: {mcp_file}")
                        all_success = False
                except Exception as e:
                    log_error(f"清理项目残留文件时出错: {mcp_file}, 错误: {e}")
                    all_success = False
    
    if found_count == 0:
        log_info("没有找到项目级残留文件")
    
    return all_success


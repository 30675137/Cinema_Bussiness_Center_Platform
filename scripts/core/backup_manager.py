"""Backup management module for configuration files."""

from pathlib import Path
from datetime import datetime
from typing import Optional, List
from utils.file_ops import safe_copy, ensure_dir
from utils.logger import log_info, log_error, log_warning


def create_backup_dir(backup_dir: Optional[str] = None) -> Path:
    """
    创建带时间戳的备份目录
    
    Args:
        backup_dir: 备份根目录，如果为 None 则使用默认路径
        
    Returns:
        创建的备份目录路径
    """
    if backup_dir is None:
        # 使用与 claude_manager.py 一致的备份目录格式
        backup_base = Path.home() / "claude-backup"
    else:
        backup_base = Path(backup_dir)
    
    ensure_dir(backup_base)
    
    # 使用与 claude_manager.py 一致的时间戳格式: YYYYMMDD-HHMMSS
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = backup_base / f"claude-backup-{timestamp}"
    ensure_dir(backup_path)
    
    log_info(f"创建备份目录: {backup_path}")
    return backup_path


def backup_configs(backup_dir: Optional[str] = None) -> bool:
    """
    备份所有相关配置文件
    
    Args:
        backup_dir: 备份根目录，如果为 None 则使用默认路径
        
    Returns:
        如果备份成功返回 True，否则返回 False
    """
    backup_path = create_backup_dir(backup_dir)
    home = Path.home()
    
    # 要备份的配置文件列表
    config_files_to_backup: List[Path] = []
    
    # Shell 配置文件（如果包含 Claude 相关配置）
    shell_configs = [
        home / ".zshrc",
        home / ".zshenv",
    ]
    
    for config_file in shell_configs:
        if config_file.exists():
            # 默认备份所有 shell 配置文件（即使不包含 Claude 相关配置）
            # 这样可以确保在清理前有完整备份
            config_files_to_backup.append(config_file)
    
    # 用户配置文件
    user_configs = [
        home / ".claude",
        home / ".claude.json",
        home / ".claude-code-router",
        home / ".claude-code",
    ]
    
    for config_path in user_configs:
        if config_path.exists():
            config_files_to_backup.append(config_path)
    
    if not config_files_to_backup:
        log_info("没有需要备份的配置文件")
        return True
    
    all_success = True
    
    for config_path in config_files_to_backup:
        try:
            dst_path = backup_path / config_path.name
            log_info(f"备份配置文件: {config_path} -> {dst_path}")
            if safe_copy(config_path, dst_path):
                log_info(f"成功备份: {config_path.name}")
            else:
                log_warning(f"备份失败: {config_path.name}")
                all_success = False
        except Exception as e:
            log_error(f"备份配置文件时出错: {config_path}, 错误: {e}")
            all_success = False
    
    # 创建备份说明文件
    readme_path = backup_path / "README.txt"
    readme_content = f"""Claude 清理备份

备份时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
备份目录: {backup_path}

此备份包含以下文件:
{chr(10).join(f"  - {p.name}" for p in config_files_to_backup)}

恢复方法:
1. 查看备份的文件
2. 手动复制需要的文件到原始位置
3. 或使用以下命令恢复所有文件:
   cp -r {backup_path}/* ~/
"""
    try:
        readme_path.write_text(readme_content, encoding="utf-8")
        log_info(f"创建备份说明文件: {readme_path}")
    except Exception as e:
        log_warning(f"创建备份说明文件失败: {e}")
    
    if all_success:
        log_info(f"备份完成: {backup_path}")
    
    return all_success



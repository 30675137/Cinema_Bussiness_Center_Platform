"""File operations utility."""

from pathlib import Path
from typing import List, Optional
import shutil
import os
from .logger import log_error, log_warning, log_debug


def ensure_dir(path: Path) -> None:
    """
    确保目录存在，如果不存在则创建
    
    Args:
        path: 目录路径
    """
    path.mkdir(parents=True, exist_ok=True)


def safe_remove(path: Path) -> bool:
    """
    安全删除文件或目录
    
    Args:
        path: 要删除的路径
        
    Returns:
        如果删除成功返回 True，否则返回 False
    """
    try:
        if path.exists():
            if path.is_dir():
                shutil.rmtree(path)
            else:
                path.unlink()
            return True
        return False
    except PermissionError:
        log_error(f"权限不足，无法删除: {path}")
        return False
    except Exception as e:
        log_warning(f"删除失败: {path}, 错误: {e}")
        return False


def safe_copy(src: Path, dst: Path) -> bool:
    """
    安全复制文件或目录
    
    Args:
        src: 源路径
        dst: 目标路径
        
    Returns:
        如果复制成功返回 True，否则返回 False
    """
    try:
        if src.exists():
            if src.is_dir():
                shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                shutil.copy2(src, dst)
            return True
        return False
    except Exception as e:
        log_error(f"复制失败: {src} -> {dst}, 错误: {e}")
        return False


def find_files(pattern: str, root: Path) -> List[Path]:
    """
    查找匹配模式的文件
    
    跳过无法访问的目录（如网络驱动器、Google Drive 等），避免超时。
    
    Args:
        pattern: 文件名模式（支持 glob）
        root: 搜索根目录
        
    Returns:
        匹配的文件路径列表
    """
    if not root.exists():
        return []
    
    results = []
    
    # 需要跳过的路径模式（网络驱动器、云存储等）
    skip_patterns = [
        '/Library/CloudStorage',  # macOS 云存储
        '/.Trash',  # 回收站
        '/Volumes/',  # 挂载的卷（可能包含网络驱动器）
    ]
    
    try:
        # 使用 walk 而不是 rglob，以便更好地控制错误处理
        for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
            try:
                dir_path = Path(dirpath)
                
                # 检查是否应该跳过此目录
                dir_str = str(dir_path)
                if any(skip_pattern in dir_str for skip_pattern in skip_patterns):
                    log_debug(f"跳过无法访问的目录: {dir_path}")
                    dirnames[:] = []  # 不继续遍历子目录
                    continue
                
                # 检查目录是否可访问
                try:
                    os.listdir(dir_path)  # 尝试列出目录内容
                except (OSError, PermissionError, TimeoutError) as e:
                    log_debug(f"无法访问目录，跳过: {dir_path}, 错误: {e}")
                    dirnames[:] = []  # 不继续遍历子目录
                    continue
                
                # 查找匹配的文件/目录
                for item in dirnames + filenames:
                    if pattern in item:
                        item_path = dir_path / item
                        if item_path.exists():
                            results.append(item_path)
                            
            except (OSError, PermissionError, TimeoutError) as e:
                log_debug(f"遍历目录时出错，跳过: {dirpath}, 错误: {e}")
                continue
                
    except (OSError, PermissionError, TimeoutError) as e:
        log_warning(f"搜索文件时出错: {root}, 错误: {e}")
        return []
    
    return results


def read_file_safe(path: Path) -> Optional[str]:
    """
    安全读取文件内容
    
    Args:
        path: 文件路径
        
    Returns:
        文件内容，如果读取失败返回 None
    """
    try:
        return path.read_text(encoding="utf-8")
    except Exception as e:
        log_warning(f"读取文件失败: {path}, 错误: {e}")
        return None


def write_file_safe(path: Path, content: str) -> bool:
    """
    安全写入文件内容
    
    Args:
        path: 文件路径
        content: 文件内容
        
    Returns:
        如果写入成功返回 True，否则返回 False
    """
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return True
    except Exception as e:
        log_error(f"写入文件失败: {path}, 错误: {e}")
        return False


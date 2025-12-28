"""Core functionality package for Claude manager."""

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional
from pathlib import Path


class StepStatus(Enum):
    """步骤状态"""
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class ValidationStatus(Enum):
    """验证状态"""
    PASS = "pass"  # 通过（已清理）
    FAIL = "fail"  # 失败（仍有残留）
    WARNING = "warning"  # 警告（不确定状态）


@dataclass
class InstallationConfig:
    """安装配置"""
    components: List[str]  # ['cli', 'router'] 或 ['cli'] 或 ['router']
    method: str = 'npm'  # 安装方式，目前仅支持 'npm'
    api_key: Optional[str] = None  # 可选的 API key（如果用户选择同时设置）


@dataclass
class UninstallConfig:
    """卸载配置"""
    backup: bool = False  # 是否在卸载前备份配置文件
    backup_dir: Optional[str] = None  # 备份目录，默认 ~/.claude-cleanup-backup/
    methods: Optional[List[str]] = None  # 要清理的安装方式，None 表示自动检测所有方式


@dataclass
class ApiKeyConfig:
    """API key 配置"""
    api_key: str  # API key 值
    config_file: Optional[Path] = None  # 配置文件路径，None 表示自动检测（~/.zshrc 或 ~/.zshenv）
    update_existing: bool = True  # 如果已存在则更新


@dataclass
class CleanupStep:
    """清理步骤"""
    name: str  # 步骤名称
    status: StepStatus  # 执行状态
    message: Optional[str] = None  # 状态消息（错误信息或跳过原因）
    duration: Optional[float] = None  # 执行耗时（秒）


@dataclass
class ValidationResult:
    """验证结果"""
    check_name: str  # 检查项名称
    status: ValidationStatus  # 验证状态
    expected: str  # 期望结果
    actual: str  # 实际结果
    command: Optional[str] = None  # 执行的检查命令


@dataclass
class ProcessInfo:
    """进程信息"""
    pid: int  # 进程 ID
    name: str  # 进程名称
    cmdline: Optional[str] = None  # 命令行参数
    port: Optional[int] = None  # 监听的端口（如果适用）

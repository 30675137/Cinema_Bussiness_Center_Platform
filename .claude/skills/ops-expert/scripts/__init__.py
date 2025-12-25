"""
Ops Expert Scripts Package

运营专家技能的 Python 操作脚本包。
提供与后端 API 交互的功能，用于执行运营操作。
"""

__version__ = "0.1.0"
__author__ = "Cinema Business Center Platform"

from .api_client import OpsApiClient, get_client
from .utils import format_response, confirm_action

__all__ = [
    "OpsApiClient",
    "get_client",
    "format_response",
    "confirm_action",
]

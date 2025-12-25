#!/usr/bin/env python3
"""
Ops Expert API Client

提供与后端 API 交互的基础客户端类。
支持认证、错误处理和请求重试。
"""

import os
import json
import time
from typing import Any, Dict, List, Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode

try:
    from .utils import format_response
except ImportError:
    from utils import format_response


class OpsApiClient:
    """运营专家 API 客户端

    提供与后端 REST API 交互的统一接口。

    环境变量:
        SUPABASE_URL: Supabase 项目 URL
        SUPABASE_ANON_KEY: Supabase 匿名密钥
        API_TIMEOUT: 请求超时时间（秒，默认 30）
        API_MAX_RETRIES: 最大重试次数（默认 3）

    Example:
        >>> client = OpsApiClient()
        >>> result = client.get("/rest/v1/stores", {"status": "eq.ACTIVE"})
        >>> print(result["data"])
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: Optional[int] = None,
        max_retries: Optional[int] = None
    ):
        """初始化 API 客户端

        Args:
            base_url: API 基础 URL，默认从 SUPABASE_URL 环境变量读取
            api_key: API 密钥，默认从 SUPABASE_ANON_KEY 环境变量读取
            timeout: 请求超时时间（秒）
            max_retries: 最大重试次数
        """
        self.base_url = base_url or os.environ.get("SUPABASE_URL", "")
        self.api_key = api_key or os.environ.get("SUPABASE_ANON_KEY", "")
        self.timeout = timeout or int(os.environ.get("API_TIMEOUT", "30"))
        self.max_retries = max_retries or int(os.environ.get("API_MAX_RETRIES", "3"))

        # 验证必需的配置
        if not self.base_url:
            raise ValueError("SUPABASE_URL 环境变量未设置")
        if not self.api_key:
            raise ValueError("SUPABASE_ANON_KEY 环境变量未设置")

    def _get_headers(self, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """获取请求头

        Args:
            extra_headers: 额外的请求头

        Returns:
            完整的请求头字典
        """
        headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        if extra_headers:
            headers.update(extra_headers)
        return headers

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, str]] = None,
        data: Optional[Dict[str, Any]] = None,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """执行 HTTP 请求

        Args:
            method: HTTP 方法（GET, POST, PATCH, DELETE）
            endpoint: API 端点路径
            params: URL 查询参数
            data: 请求体数据
            extra_headers: 额外的请求头

        Returns:
            标准格式的响应字典
        """
        # 构建 URL
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        if params:
            url = f"{url}?{urlencode(params)}"

        # 准备请求
        headers = self._get_headers(extra_headers)
        body = json.dumps(data).encode("utf-8") if data else None

        request = Request(url, data=body, headers=headers, method=method)

        # 重试逻辑
        last_error = None
        for attempt in range(self.max_retries):
            try:
                with urlopen(request, timeout=self.timeout) as response:
                    response_data = response.read().decode("utf-8")

                    # 解析响应
                    if response_data:
                        result = json.loads(response_data)
                    else:
                        result = None

                    return format_response(
                        success=True,
                        message="请求成功",
                        data=result
                    )

            except HTTPError as e:
                last_error = e
                error_body = e.read().decode("utf-8") if e.fp else ""

                # 4xx 错误不重试
                if 400 <= e.code < 500:
                    return format_response(
                        success=False,
                        message=f"请求失败: HTTP {e.code}",
                        error=error_body or e.reason
                    )

                # 5xx 错误重试
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)  # 指数退避
                    continue

            except URLError as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue

            except Exception as e:
                last_error = e
                break

        # 所有重试失败
        return format_response(
            success=False,
            message="请求失败",
            error=str(last_error) if last_error else "未知错误"
        )

    def get(
        self,
        endpoint: str,
        params: Optional[Dict[str, str]] = None,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """发送 GET 请求

        Args:
            endpoint: API 端点路径
            params: URL 查询参数
            extra_headers: 额外的请求头

        Returns:
            标准格式的响应字典
        """
        return self._make_request("GET", endpoint, params=params, extra_headers=extra_headers)

    def post(
        self,
        endpoint: str,
        data: Dict[str, Any],
        params: Optional[Dict[str, str]] = None,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """发送 POST 请求

        Args:
            endpoint: API 端点路径
            data: 请求体数据
            params: URL 查询参数
            extra_headers: 额外的请求头

        Returns:
            标准格式的响应字典
        """
        return self._make_request("POST", endpoint, params=params, data=data, extra_headers=extra_headers)

    def patch(
        self,
        endpoint: str,
        data: Dict[str, Any],
        params: Optional[Dict[str, str]] = None,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """发送 PATCH 请求

        Args:
            endpoint: API 端点路径
            data: 请求体数据
            params: URL 查询参数
            extra_headers: 额外的请求头

        Returns:
            标准格式的响应字典
        """
        return self._make_request("PATCH", endpoint, params=params, data=data, extra_headers=extra_headers)

    def delete(
        self,
        endpoint: str,
        params: Optional[Dict[str, str]] = None,
        extra_headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """发送 DELETE 请求

        Args:
            endpoint: API 端点路径
            params: URL 查询参数
            extra_headers: 额外的请求头

        Returns:
            标准格式的响应字典
        """
        return self._make_request("DELETE", endpoint, params=params, extra_headers=extra_headers)

    # ============ 便捷方法 ============

    def list_stores(self, status: Optional[str] = None, limit: int = 100) -> Dict[str, Any]:
        """获取门店列表

        Args:
            status: 状态筛选（ACTIVE, INACTIVE）
            limit: 返回数量限制

        Returns:
            门店列表
        """
        params = {"limit": str(limit), "order": "created_at.desc"}
        if status:
            params["status"] = f"eq.{status}"
        return self.get("/rest/v1/stores", params=params)

    def list_scenario_packages(self, status: Optional[str] = None, limit: int = 100) -> Dict[str, Any]:
        """获取场景包列表

        Args:
            status: 状态筛选（DRAFT, PUBLISHED, ARCHIVED）
            limit: 返回数量限制

        Returns:
            场景包列表
        """
        params = {"limit": str(limit), "order": "created_at.desc"}
        if status:
            params["status"] = f"eq.{status}"
        return self.get("/rest/v1/scenario_packages", params=params)

    def list_halls(self, store_id: Optional[str] = None, limit: int = 100) -> Dict[str, Any]:
        """获取影厅列表

        Args:
            store_id: 门店 ID 筛选
            limit: 返回数量限制

        Returns:
            影厅列表
        """
        params = {"limit": str(limit), "order": "created_at.desc"}
        if store_id:
            params["store_id"] = f"eq.{store_id}"
        return self.get("/rest/v1/halls", params=params)

    def list_reservations(
        self,
        status: Optional[str] = None,
        store_id: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """获取预约订单列表

        Args:
            status: 状态筛选（PENDING, CONFIRMED, COMPLETED, CANCELLED）
            store_id: 门店 ID 筛选
            limit: 返回数量限制

        Returns:
            预约订单列表
        """
        params = {"limit": str(limit), "order": "created_at.desc"}
        if status:
            params["status"] = f"eq.{status}"
        if store_id:
            params["store_id"] = f"eq.{store_id}"
        return self.get("/rest/v1/reservations", params=params)

    def update_scenario_status(self, scenario_id: str, new_status: str) -> Dict[str, Any]:
        """更新场景包状态

        Args:
            scenario_id: 场景包 ID
            new_status: 新状态（DRAFT, PUBLISHED, ARCHIVED）

        Returns:
            更新结果
        """
        valid_statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"]
        if new_status not in valid_statuses:
            return format_response(
                success=False,
                message=f"无效的状态值: {new_status}",
                error=f"状态必须是以下之一: {', '.join(valid_statuses)}"
            )

        return self.patch(
            "/rest/v1/scenario_packages",
            data={"status": new_status},
            params={"id": f"eq.{scenario_id}"}
        )

    def update_store_reservation_settings(
        self,
        store_id: str,
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """更新门店预约设置

        Args:
            store_id: 门店 ID
            settings: 预约设置字典

        Returns:
            更新结果
        """
        return self.patch(
            "/rest/v1/store_reservation_settings",
            data=settings,
            params={"store_id": f"eq.{store_id}"}
        )


# 创建默认客户端实例（延迟初始化）
_client: Optional[OpsApiClient] = None


def get_client() -> OpsApiClient:
    """获取默认客户端实例

    Returns:
        OpsApiClient 实例

    Raises:
        ValueError: 环境变量未配置时
    """
    global _client
    if _client is None:
        _client = OpsApiClient()
    return _client


# 为了向后兼容，提供 client 别名
client = property(lambda self: get_client())

#!/usr/bin/env python3
"""
Tests for Ops Expert API Client

使用 unittest 进行测试，不依赖外部测试框架。
"""

import json
import os
import unittest
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread
from typing import Any, Dict
from unittest.mock import patch, MagicMock

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api_client import OpsApiClient, get_client
from utils import format_response


class MockHTTPRequestHandler(BaseHTTPRequestHandler):
    """模拟 HTTP 服务器处理器"""

    def log_message(self, format, *args):
        """禁用日志输出"""
        pass

    def do_GET(self):
        """处理 GET 请求"""
        if "/stores" in self.path:
            self._send_json_response([
                {"id": "1", "name": "旗舰店", "status": "ACTIVE"},
                {"id": "2", "name": "分店", "status": "ACTIVE"}
            ])
        elif "/scenario_packages" in self.path:
            self._send_json_response([
                {"id": "1", "name": "VIP派对", "status": "PUBLISHED"},
            ])
        elif "/error" in self.path:
            self._send_error(500, "Internal Server Error")
        elif "/not_found" in self.path:
            self._send_error(404, "Not Found")
        else:
            self._send_json_response({"message": "OK"})

    def do_POST(self):
        """处理 POST 请求"""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        data = json.loads(body) if body else {}
        self._send_json_response({"created": True, **data})

    def do_PATCH(self):
        """处理 PATCH 请求"""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        data = json.loads(body) if body else {}
        self._send_json_response({"updated": True, **data})

    def do_DELETE(self):
        """处理 DELETE 请求"""
        self._send_json_response({"deleted": True})

    def _send_json_response(self, data: Any, status: int = 200):
        """发送 JSON 响应"""
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _send_error(self, status: int, message: str):
        """发送错误响应"""
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode("utf-8"))


class TestOpsApiClientInit(unittest.TestCase):
    """测试 OpsApiClient 初始化"""

    def test_init_with_env_vars(self):
        """测试使用环境变量初始化"""
        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_ANON_KEY": "test-key"
        }):
            client = OpsApiClient()
            self.assertEqual(client.base_url, "https://test.supabase.co")
            self.assertEqual(client.api_key, "test-key")
            self.assertEqual(client.timeout, 30)
            self.assertEqual(client.max_retries, 3)

    def test_init_with_params(self):
        """测试使用参数初始化"""
        client = OpsApiClient(
            base_url="https://custom.supabase.co",
            api_key="custom-key",
            timeout=60,
            max_retries=5
        )
        self.assertEqual(client.base_url, "https://custom.supabase.co")
        self.assertEqual(client.api_key, "custom-key")
        self.assertEqual(client.timeout, 60)
        self.assertEqual(client.max_retries, 5)

    def test_init_missing_url(self):
        """测试缺少 URL 时抛出异常"""
        with patch.dict(os.environ, {"SUPABASE_URL": "", "SUPABASE_ANON_KEY": "key"}, clear=True):
            with self.assertRaises(ValueError) as ctx:
                OpsApiClient()
            self.assertIn("SUPABASE_URL", str(ctx.exception))

    def test_init_missing_key(self):
        """测试缺少 API Key 时抛出异常"""
        with patch.dict(os.environ, {"SUPABASE_URL": "https://test.co", "SUPABASE_ANON_KEY": ""}, clear=True):
            with self.assertRaises(ValueError) as ctx:
                OpsApiClient()
            self.assertIn("SUPABASE_ANON_KEY", str(ctx.exception))


class TestOpsApiClientHeaders(unittest.TestCase):
    """测试请求头生成"""

    def setUp(self):
        """设置测试客户端"""
        self.client = OpsApiClient(
            base_url="https://test.supabase.co",
            api_key="test-api-key"
        )

    def test_get_headers_basic(self):
        """测试基础请求头"""
        headers = self.client._get_headers()
        self.assertEqual(headers["apikey"], "test-api-key")
        self.assertEqual(headers["Authorization"], "Bearer test-api-key")
        self.assertEqual(headers["Content-Type"], "application/json")
        self.assertEqual(headers["Prefer"], "return=representation")

    def test_get_headers_with_extra(self):
        """测试带额外请求头"""
        headers = self.client._get_headers({"X-Custom": "value"})
        self.assertEqual(headers["X-Custom"], "value")
        self.assertEqual(headers["apikey"], "test-api-key")


class TestOpsApiClientRequests(unittest.TestCase):
    """测试 HTTP 请求方法"""

    @classmethod
    def setUpClass(cls):
        """启动模拟服务器"""
        cls.server = HTTPServer(("localhost", 0), MockHTTPRequestHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        """关闭模拟服务器"""
        cls.server.shutdown()

    def setUp(self):
        """设置测试客户端"""
        self.client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )

    def test_get_request(self):
        """测试 GET 请求"""
        result = self.client.get("/stores")
        self.assertTrue(result["success"])
        self.assertEqual(len(result["data"]), 2)
        self.assertEqual(result["data"][0]["name"], "旗舰店")

    def test_get_with_params(self):
        """测试带参数的 GET 请求"""
        result = self.client.get("/stores", {"status": "eq.ACTIVE"})
        self.assertTrue(result["success"])

    def test_post_request(self):
        """测试 POST 请求"""
        result = self.client.post("/stores", {"name": "新门店"})
        self.assertTrue(result["success"])
        self.assertTrue(result["data"]["created"])
        self.assertEqual(result["data"]["name"], "新门店")

    def test_patch_request(self):
        """测试 PATCH 请求"""
        result = self.client.patch("/stores", {"status": "INACTIVE"}, {"id": "eq.1"})
        self.assertTrue(result["success"])
        self.assertTrue(result["data"]["updated"])
        self.assertEqual(result["data"]["status"], "INACTIVE")

    def test_delete_request(self):
        """测试 DELETE 请求"""
        result = self.client.delete("/stores", {"id": "eq.1"})
        self.assertTrue(result["success"])
        self.assertTrue(result["data"]["deleted"])

    def test_404_error(self):
        """测试 404 错误处理"""
        result = self.client.get("/not_found")
        self.assertFalse(result["success"])
        self.assertIn("404", result["message"])

    def test_500_error(self):
        """测试 500 错误处理"""
        result = self.client.get("/error")
        self.assertFalse(result["success"])
        # 500 错误会重试后返回 "请求失败"
        self.assertIn("失败", result["message"])


class TestOpsApiClientConvenienceMethods(unittest.TestCase):
    """测试便捷方法"""

    @classmethod
    def setUpClass(cls):
        """启动模拟服务器"""
        cls.server = HTTPServer(("localhost", 0), MockHTTPRequestHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        """关闭模拟服务器"""
        cls.server.shutdown()

    def setUp(self):
        """设置测试客户端"""
        self.client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )

    def test_list_stores(self):
        """测试获取门店列表"""
        result = self.client.list_stores()
        self.assertTrue(result["success"])
        self.assertIsInstance(result["data"], list)

    def test_list_stores_with_status(self):
        """测试带状态筛选的门店列表"""
        result = self.client.list_stores(status="ACTIVE")
        self.assertTrue(result["success"])

    def test_list_scenario_packages(self):
        """测试获取场景包列表"""
        result = self.client.list_scenario_packages()
        self.assertTrue(result["success"])

    def test_list_scenario_packages_with_status(self):
        """测试带状态筛选的场景包列表"""
        result = self.client.list_scenario_packages(status="PUBLISHED")
        self.assertTrue(result["success"])

    def test_update_scenario_status_valid(self):
        """测试更新场景包状态 - 有效状态"""
        result = self.client.update_scenario_status("123", "ARCHIVED")
        self.assertTrue(result["success"])

    def test_update_scenario_status_invalid(self):
        """测试更新场景包状态 - 无效状态"""
        result = self.client.update_scenario_status("123", "INVALID")
        self.assertFalse(result["success"])
        self.assertIn("无效的状态值", result["message"])


class TestGetClient(unittest.TestCase):
    """测试 get_client 函数"""

    def test_get_client_returns_instance(self):
        """测试 get_client 返回实例"""
        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_ANON_KEY": "test-key"
        }):
            # 重置全局客户端
            import api_client
            api_client._client = None

            client = get_client()
            self.assertIsInstance(client, OpsApiClient)

    def test_get_client_returns_same_instance(self):
        """测试 get_client 返回相同实例（单例）"""
        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_ANON_KEY": "test-key"
        }):
            import api_client
            api_client._client = None

            client1 = get_client()
            client2 = get_client()
            self.assertIs(client1, client2)


class TestFormatResponse(unittest.TestCase):
    """测试 format_response 函数"""

    def test_success_response(self):
        """测试成功响应格式"""
        result = format_response(True, "操作成功", data={"id": 1})
        self.assertTrue(result["success"])
        self.assertEqual(result["message"], "操作成功")
        self.assertEqual(result["data"]["id"], 1)
        self.assertIn("timestamp", result)

    def test_failure_response(self):
        """测试失败响应格式"""
        result = format_response(False, "操作失败", error="资源不存在")
        self.assertFalse(result["success"])
        self.assertEqual(result["message"], "操作失败")
        self.assertEqual(result["error"], "资源不存在")

    def test_response_without_data(self):
        """测试无数据的响应"""
        result = format_response(True, "删除成功")
        self.assertTrue(result["success"])
        self.assertNotIn("data", result)


if __name__ == "__main__":
    unittest.main()

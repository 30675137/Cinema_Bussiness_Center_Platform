#!/usr/bin/env python3
"""
Tests for Store Operations

测试门店操作脚本的功能。
"""

import json
import os
import unittest
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread
from typing import Any
from unittest.mock import patch

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api_client import OpsApiClient
from store_ops import StoreOps


class MockStoreHandler(BaseHTTPRequestHandler):
    """模拟门店 API 处理器"""

    # 模拟数据存储
    stores = {
        "1": {"id": "1", "name": "旗舰店", "code": "QJD001", "status": "ACTIVE", "city": "北京"},
        "2": {"id": "2", "name": "分店", "code": "FD001", "status": "INACTIVE", "city": "上海"}
    }

    settings = {
        "1": {
            "id": "s1",
            "store_id": "1",
            "weekday_start_time": "10:00:00",
            "weekday_end_time": "22:00:00",
            "weekend_start_time": "09:00:00",
            "weekend_end_time": "23:00:00",
            "duration_unit": 60,
            "min_advance_hours": 24,
            "max_advance_days": 30,
            "deposit_required": True,
            "deposit_amount": 500
        }
    }

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if "/stores" in self.path:
            if "id=eq." in self.path:
                store_id = self.path.split("id=eq.")[1].split("&")[0]
                if store_id in self.stores:
                    self._send_json([self.stores[store_id]])
                else:
                    self._send_json([])
            elif "name=eq." in self.path:
                import urllib.parse
                name = self.path.split("name=eq.")[1].split("&")[0]
                name = urllib.parse.unquote(name)
                matches = [s for s in self.stores.values() if s["name"] == name]
                self._send_json(matches)
            else:
                self._send_json(list(self.stores.values()))
        elif "/store_reservation_settings" in self.path:
            if "store_id=eq." in self.path:
                store_id = self.path.split("store_id=eq.")[1].split("&")[0]
                if store_id in self.settings:
                    self._send_json([self.settings[store_id]])
                else:
                    self._send_json([])
            else:
                self._send_json(list(self.settings.values()))
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_PATCH(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        data = json.loads(body) if body else {}

        if "/stores" in self.path:
            if "id=eq." in self.path:
                store_id = self.path.split("id=eq.")[1].split("&")[0]
                if store_id in self.stores:
                    self.stores[store_id].update(data)
                    self._send_json([self.stores[store_id]])
                else:
                    self._send_json({"error": "Not found"}, 404)
            else:
                self._send_json({"error": "Missing id"}, 400)
        elif "/store_reservation_settings" in self.path:
            if "store_id=eq." in self.path:
                store_id = self.path.split("store_id=eq.")[1].split("&")[0]
                if store_id in self.settings:
                    self.settings[store_id].update(data)
                    self._send_json([self.settings[store_id]])
                else:
                    # 创建新设置
                    self.settings[store_id] = {"store_id": store_id, **data}
                    self._send_json([self.settings[store_id]])
            else:
                self._send_json({"error": "Missing store_id"}, 400)
        else:
            self._send_json({"error": "Not found"}, 404)

    def _send_json(self, data: Any, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))


class TestStoreOpsQuery(unittest.TestCase):
    """测试门店查询功能"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockStoreHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = StoreOps(client)

    def test_get_store_by_id_found(self):
        """测试按 ID 查询 - 找到"""
        result = self.ops.get_store_by_id("1")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["name"], "旗舰店")

    def test_get_store_by_id_not_found(self):
        """测试按 ID 查询 - 未找到"""
        result = self.ops.get_store_by_id("999")
        self.assertFalse(result["success"])
        self.assertIn("未找到", result["message"])

    def test_get_store_by_name_found(self):
        """测试按名称查询 - 找到"""
        result = self.ops.get_store_by_name("旗舰店")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["id"], "1")

    def test_get_reservation_settings(self):
        """测试获取预约设置"""
        result = self.ops.get_reservation_settings("1")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["duration_unit"], 60)


class TestStoreOpsTimeParser(unittest.TestCase):
    """测试时间解析"""

    def test_parse_time_valid(self):
        """测试有效时间格式"""
        self.assertEqual(StoreOps.parse_time("9:00"), "09:00:00")
        self.assertEqual(StoreOps.parse_time("09:00"), "09:00:00")
        self.assertEqual(StoreOps.parse_time("21:30"), "21:30:00")
        self.assertEqual(StoreOps.parse_time("0:00"), "00:00:00")
        self.assertEqual(StoreOps.parse_time("24:00"), "24:00:00")

    def test_parse_time_invalid(self):
        """测试无效时间格式"""
        self.assertIsNone(StoreOps.parse_time("25:00"))
        self.assertIsNone(StoreOps.parse_time("12:60"))
        self.assertIsNone(StoreOps.parse_time("abc"))
        self.assertIsNone(StoreOps.parse_time(""))


class TestStoreOpsUpdateTime(unittest.TestCase):
    """测试时间更新"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockStoreHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        # 重置数据
        MockStoreHandler.stores = {
            "1": {"id": "1", "name": "旗舰店", "code": "QJD001", "status": "ACTIVE", "city": "北京"},
            "2": {"id": "2", "name": "分店", "code": "FD001", "status": "INACTIVE", "city": "上海"}
        }
        MockStoreHandler.settings = {
            "1": {
                "id": "s1", "store_id": "1",
                "weekday_start_time": "10:00:00", "weekday_end_time": "22:00:00",
                "weekend_start_time": "09:00:00", "weekend_end_time": "23:00:00",
                "duration_unit": 60, "min_advance_hours": 24, "max_advance_days": 30,
                "deposit_required": True, "deposit_amount": 500
            }
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = StoreOps(client)

    def test_update_weekend_time(self):
        """测试更新周末时间"""
        result = self.ops.update_reservation_time(
            "1",
            weekend_start="8:00",
            weekend_end="24:00"
        )
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_values"]["weekend_start_time"], "08:00:00")
        self.assertEqual(result["data"]["new_values"]["weekend_end_time"], "24:00:00")

    def test_update_weekday_time(self):
        """测试更新工作日时间"""
        result = self.ops.update_reservation_time(
            "1",
            weekday_start="9:00",
            weekday_end="21:00"
        )
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_values"]["weekday_start_time"], "09:00:00")

    def test_update_time_invalid_format(self):
        """测试无效时间格式"""
        result = self.ops.update_reservation_time(
            "1",
            weekend_start="invalid"
        )
        self.assertFalse(result["success"])
        self.assertIn("无效", result["message"])

    def test_update_time_no_data(self):
        """测试不指定任何时间"""
        result = self.ops.update_reservation_time("1")
        self.assertFalse(result["success"])
        self.assertIn("请指定", result["message"])


class TestStoreOpsUpdateDuration(unittest.TestCase):
    """测试时长单位更新"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockStoreHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        MockStoreHandler.stores = {
            "1": {"id": "1", "name": "旗舰店", "code": "QJD001", "status": "ACTIVE", "city": "北京"}
        }
        MockStoreHandler.settings = {
            "1": {"id": "s1", "store_id": "1", "duration_unit": 60}
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = StoreOps(client)

    def test_update_duration_valid(self):
        """测试更新有效时长"""
        result = self.ops.update_duration_unit("1", 120)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_duration_unit"], 120)

    def test_update_duration_invalid(self):
        """测试更新无效时长"""
        result = self.ops.update_duration_unit("1", 45)  # 45 不在有效列表中
        self.assertFalse(result["success"])
        self.assertIn("无效", result["message"])


class TestStoreOpsUpdateAdvance(unittest.TestCase):
    """测试提前量设置更新"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockStoreHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        MockStoreHandler.stores = {
            "1": {"id": "1", "name": "旗舰店", "status": "ACTIVE"}
        }
        MockStoreHandler.settings = {
            "1": {"id": "s1", "store_id": "1", "min_advance_hours": 24, "max_advance_days": 30}
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = StoreOps(client)

    def test_update_min_advance(self):
        """测试更新最小提前时间"""
        result = self.ops.update_advance_settings("1", min_advance_hours=12)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_values"]["min_advance_hours"], 12)

    def test_update_max_advance(self):
        """测试更新最大提前天数"""
        result = self.ops.update_advance_settings("1", max_advance_days=60)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_values"]["max_advance_days"], 60)

    def test_update_advance_invalid_min(self):
        """测试无效的最小提前时间"""
        result = self.ops.update_advance_settings("1", min_advance_hours=200)
        self.assertFalse(result["success"])

    def test_update_advance_invalid_max(self):
        """测试无效的最大提前天数"""
        result = self.ops.update_advance_settings("1", max_advance_days=100)
        self.assertFalse(result["success"])


class TestStoreOpsUpdateDeposit(unittest.TestCase):
    """测试押金设置更新"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockStoreHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        MockStoreHandler.stores = {
            "1": {"id": "1", "name": "旗舰店", "status": "ACTIVE"}
        }
        MockStoreHandler.settings = {
            "1": {"id": "s1", "store_id": "1", "deposit_required": True, "deposit_amount": 500}
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = StoreOps(client)

    def test_update_deposit_required(self):
        """测试更新是否需要押金"""
        result = self.ops.update_deposit_settings("1", deposit_required=False)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_values"]["deposit_required"], False)

    def test_update_deposit_amount(self):
        """测试更新押金金额"""
        result = self.ops.update_deposit_settings("1", deposit_amount=1000)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_values"]["deposit_amount"], 1000)

    def test_update_deposit_negative(self):
        """测试负数押金金额"""
        result = self.ops.update_deposit_settings("1", deposit_amount=-100)
        self.assertFalse(result["success"])


class TestStoreOpsUpdateStatus(unittest.TestCase):
    """测试状态更新"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockStoreHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        MockStoreHandler.stores = {
            "1": {"id": "1", "name": "旗舰店", "status": "ACTIVE"},
            "2": {"id": "2", "name": "分店", "status": "INACTIVE"}
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = StoreOps(client)

    def test_deactivate_store(self):
        """测试停用门店"""
        result = self.ops.update_store_status("1", "INACTIVE")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_status"], "INACTIVE")

    def test_activate_store(self):
        """测试启用门店"""
        result = self.ops.update_store_status("2", "ACTIVE")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_status"], "ACTIVE")

    def test_same_status(self):
        """测试设置相同状态"""
        result = self.ops.update_store_status("1", "ACTIVE")
        self.assertFalse(result["success"])
        self.assertIn("已经是", result["message"])

    def test_invalid_status(self):
        """测试无效状态"""
        result = self.ops.update_store_status("1", "INVALID")
        self.assertFalse(result["success"])
        self.assertIn("无效", result["message"])


if __name__ == "__main__":
    unittest.main()

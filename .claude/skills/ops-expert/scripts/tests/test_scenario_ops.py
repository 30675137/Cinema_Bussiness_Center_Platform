#!/usr/bin/env python3
"""
Tests for Scenario Operations

测试场景包操作脚本的功能。
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

from api_client import OpsApiClient
from scenario_ops import ScenarioOps


class MockScenarioHandler(BaseHTTPRequestHandler):
    """模拟场景包 API 处理器"""

    # 模拟数据存储
    scenarios = {
        "1": {
            "id": "1",
            "name": "VIP派对套餐",
            "status": "PUBLISHED",
            "price": 3500,
            "applicable_halls": ["hall-1", "hall-2"],
            "hard_benefits": [{"name": "饮料"}],
            "soft_benefits": [],
            "service_items": []
        },
        "2": {
            "id": "2",
            "name": "测试草稿",
            "status": "DRAFT",
            "price": 2000,
            "applicable_halls": ["hall-1"],
            "hard_benefits": [{"name": "零食"}],
            "soft_benefits": [],
            "service_items": []
        },
        "3": {
            "id": "3",
            "name": "已归档套餐",
            "status": "ARCHIVED",
            "price": 1500,
            "applicable_halls": [],
            "hard_benefits": [],
            "soft_benefits": [],
            "service_items": []
        },
        "4": {
            "id": "4",
            "name": "不完整草稿",
            "status": "DRAFT",
            "price": 0,
            "applicable_halls": [],
            "hard_benefits": [],
            "soft_benefits": [],
            "service_items": []
        }
    }

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if "/scenario_packages" in self.path:
            # 解析查询参数
            if "id=eq." in self.path:
                scenario_id = self.path.split("id=eq.")[1].split("&")[0]
                if scenario_id in self.scenarios:
                    self._send_json([self.scenarios[scenario_id]])
                else:
                    self._send_json([])
            elif "name=eq." in self.path:
                name = self.path.split("name=eq.")[1].split("&")[0]
                # URL 解码
                import urllib.parse
                name = urllib.parse.unquote(name)
                matches = [s for s in self.scenarios.values() if s["name"] == name]
                self._send_json(matches)
            else:
                self._send_json(list(self.scenarios.values()))
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_PATCH(self):
        if "/scenario_packages" in self.path:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body) if body else {}

            # 解析要更新的 ID
            if "id=eq." in self.path:
                scenario_id = self.path.split("id=eq.")[1].split("&")[0]
                if scenario_id in self.scenarios:
                    self.scenarios[scenario_id].update(data)
                    self._send_json([self.scenarios[scenario_id]])
                else:
                    self._send_json({"error": "Not found"}, 404)
            else:
                self._send_json({"error": "Missing id"}, 400)
        else:
            self._send_json({"error": "Not found"}, 404)

    def _send_json(self, data: Any, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))


class TestScenarioOpsQuery(unittest.TestCase):
    """测试场景包查询功能"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockScenarioHandler)
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
        self.ops = ScenarioOps(client)

    def test_get_scenario_by_id_found(self):
        """测试按 ID 查询 - 找到"""
        result = self.ops.get_scenario_by_id("1")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["name"], "VIP派对套餐")

    def test_get_scenario_by_id_not_found(self):
        """测试按 ID 查询 - 未找到"""
        result = self.ops.get_scenario_by_id("999")
        self.assertFalse(result["success"])
        self.assertIn("未找到", result["message"])

    def test_get_scenario_by_name_found(self):
        """测试按名称查询 - 找到"""
        result = self.ops.get_scenario_by_name("VIP派对套餐")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["id"], "1")

    def test_get_scenario_by_name_not_found(self):
        """测试按名称查询 - 未找到"""
        result = self.ops.get_scenario_by_name("不存在的套餐")
        self.assertFalse(result["success"])


class TestScenarioOpsValidation(unittest.TestCase):
    """测试发布条件验证"""

    def setUp(self):
        self.ops = ScenarioOps()

    def test_validate_complete_scenario(self):
        """测试完整场景包通过验证"""
        scenario = {
            "name": "测试套餐",
            "price": 1000,
            "applicable_halls": ["hall-1"],
            "hard_benefits": [{"name": "饮料"}],
            "soft_benefits": [],
            "service_items": []
        }
        result = self.ops.validate_publish_conditions(scenario)
        self.assertTrue(result["success"])

    def test_validate_missing_name(self):
        """测试缺少名称"""
        scenario = {
            "name": "",
            "price": 1000,
            "applicable_halls": ["hall-1"],
            "hard_benefits": [{"name": "饮料"}]
        }
        result = self.ops.validate_publish_conditions(scenario)
        self.assertFalse(result["success"])
        self.assertIn("名称", result["error"])

    def test_validate_missing_price(self):
        """测试缺少价格"""
        scenario = {
            "name": "测试",
            "price": 0,
            "applicable_halls": ["hall-1"],
            "hard_benefits": [{"name": "饮料"}]
        }
        result = self.ops.validate_publish_conditions(scenario)
        self.assertFalse(result["success"])
        self.assertIn("价格", result["error"])

    def test_validate_missing_halls(self):
        """测试缺少影厅"""
        scenario = {
            "name": "测试",
            "price": 1000,
            "applicable_halls": [],
            "hard_benefits": [{"name": "饮料"}]
        }
        result = self.ops.validate_publish_conditions(scenario)
        self.assertFalse(result["success"])
        self.assertIn("影厅", result["error"])

    def test_validate_missing_content(self):
        """测试缺少内容"""
        scenario = {
            "name": "测试",
            "price": 1000,
            "applicable_halls": ["hall-1"],
            "hard_benefits": [],
            "soft_benefits": [],
            "service_items": []
        }
        result = self.ops.validate_publish_conditions(scenario)
        self.assertFalse(result["success"])
        self.assertIn("内容", result["error"])


class TestScenarioOpsPublish(unittest.TestCase):
    """测试发布操作"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockScenarioHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        # 重置模拟数据
        MockScenarioHandler.scenarios = {
            "1": {"id": "1", "name": "VIP派对套餐", "status": "PUBLISHED", "price": 3500,
                  "applicable_halls": ["hall-1"], "hard_benefits": [{"name": "饮料"}],
                  "soft_benefits": [], "service_items": []},
            "2": {"id": "2", "name": "测试草稿", "status": "DRAFT", "price": 2000,
                  "applicable_halls": ["hall-1"], "hard_benefits": [{"name": "零食"}],
                  "soft_benefits": [], "service_items": []},
            "3": {"id": "3", "name": "已归档套餐", "status": "ARCHIVED", "price": 1500,
                  "applicable_halls": [], "hard_benefits": [], "soft_benefits": [], "service_items": []},
            "4": {"id": "4", "name": "不完整草稿", "status": "DRAFT", "price": 0,
                  "applicable_halls": [], "hard_benefits": [], "soft_benefits": [], "service_items": []}
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = ScenarioOps(client)

    def test_publish_draft(self):
        """测试发布草稿"""
        result = self.ops.publish("2")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_status"], "PUBLISHED")

    def test_publish_already_published(self):
        """测试发布已发布的场景包"""
        result = self.ops.publish("1")
        self.assertFalse(result["success"])
        self.assertIn("已经是发布状态", result["message"])

    def test_publish_archived(self):
        """测试发布已归档的场景包"""
        result = self.ops.publish("3")
        self.assertFalse(result["success"])
        self.assertIn("归档", result["message"])

    def test_publish_incomplete(self):
        """测试发布不完整的场景包"""
        result = self.ops.publish("4")
        self.assertFalse(result["success"])
        self.assertIn("未满足发布条件", result["message"])


class TestScenarioOpsUnpublish(unittest.TestCase):
    """测试下架操作"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockScenarioHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        MockScenarioHandler.scenarios = {
            "1": {"id": "1", "name": "VIP派对套餐", "status": "PUBLISHED", "price": 3500,
                  "applicable_halls": ["hall-1"], "hard_benefits": [{"name": "饮料"}],
                  "soft_benefits": [], "service_items": []},
            "2": {"id": "2", "name": "测试草稿", "status": "DRAFT", "price": 2000,
                  "applicable_halls": ["hall-1"], "hard_benefits": [],
                  "soft_benefits": [], "service_items": []},
            "3": {"id": "3", "name": "已归档套餐", "status": "ARCHIVED", "price": 1500,
                  "applicable_halls": [], "hard_benefits": [],
                  "soft_benefits": [], "service_items": []}
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = ScenarioOps(client)

    def test_unpublish_published(self):
        """测试下架已发布的场景包"""
        result = self.ops.unpublish("1")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_status"], "ARCHIVED")

    def test_unpublish_already_archived(self):
        """测试下架已归档的场景包"""
        result = self.ops.unpublish("3")
        self.assertFalse(result["success"])
        self.assertIn("已经是归档状态", result["message"])

    def test_unpublish_draft(self):
        """测试下架草稿"""
        result = self.ops.unpublish("2")
        self.assertFalse(result["success"])
        self.assertIn("草稿", result["message"])


class TestScenarioOpsPriceUpdate(unittest.TestCase):
    """测试价格更新"""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), MockScenarioHandler)
        cls.server_port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        MockScenarioHandler.scenarios = {
            "1": {"id": "1", "name": "VIP派对套餐", "status": "PUBLISHED", "price": 3500,
                  "applicable_halls": ["hall-1"], "hard_benefits": [{"name": "饮料"}],
                  "soft_benefits": [], "service_items": []}
        }

        client = OpsApiClient(
            base_url=f"http://localhost:{self.server_port}",
            api_key="test-key",
            timeout=5,
            max_retries=1
        )
        self.ops = ScenarioOps(client)

    def test_update_price_valid(self):
        """测试更新有效价格"""
        result = self.ops.update_price("1", 4000)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["new_price"], 4000)

    def test_update_price_invalid(self):
        """测试更新无效价格"""
        result = self.ops.update_price("1", -100)
        self.assertFalse(result["success"])
        self.assertIn("价格", result["message"])

    def test_update_price_with_original(self):
        """测试更新价格和原价"""
        result = self.ops.update_price("1", 3000, original_price=4000)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["original_price"], 4000)

    def test_update_price_invalid_original(self):
        """测试无效的原价（低于销售价）"""
        result = self.ops.update_price("1", 4000, original_price=3000)
        self.assertFalse(result["success"])
        self.assertIn("原价", result["message"])


if __name__ == "__main__":
    unittest.main()

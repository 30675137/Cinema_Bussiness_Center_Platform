#!/usr/bin/env python3
"""
场景包操作脚本

提供场景包的状态变更、发布、下架等操作功能。
"""

import sys
import os

# 添加父目录到路径以支持导入
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from .api_client import OpsApiClient, get_client
    from .utils import format_response, print_json, confirm_action, parse_cli_args, validate_required_args
except ImportError:
    from api_client import OpsApiClient, get_client
    from utils import format_response, print_json, confirm_action, parse_cli_args, validate_required_args

from typing import Any, Dict, List, Optional


class ScenarioOps:
    """场景包操作类"""

    def __init__(self, client: Optional[OpsApiClient] = None):
        """初始化

        Args:
            client: API 客户端实例，不传则使用默认客户端
        """
        self._client = client

    @property
    def client(self) -> OpsApiClient:
        """获取 API 客户端"""
        if self._client is None:
            self._client = get_client()
        return self._client

    def get_scenario_by_name(self, name: str) -> Dict[str, Any]:
        """根据名称查询场景包

        Args:
            name: 场景包名称

        Returns:
            场景包信息或错误
        """
        result = self.client.get(
            "/rest/v1/scenario_packages",
            params={"name": f"eq.{name}", "limit": "1"}
        )

        if not result["success"]:
            return result

        if not result["data"] or len(result["data"]) == 0:
            return format_response(
                success=False,
                message=f"未找到场景包: {name}",
                error="SCENARIO_NOT_FOUND"
            )

        return format_response(
            success=True,
            message="查询成功",
            data=result["data"][0]
        )

    def get_scenario_by_id(self, scenario_id: str) -> Dict[str, Any]:
        """根据 ID 查询场景包

        Args:
            scenario_id: 场景包 ID

        Returns:
            场景包信息或错误
        """
        result = self.client.get(
            "/rest/v1/scenario_packages",
            params={"id": f"eq.{scenario_id}", "limit": "1"}
        )

        if not result["success"]:
            return result

        if not result["data"] or len(result["data"]) == 0:
            return format_response(
                success=False,
                message=f"未找到场景包 ID: {scenario_id}",
                error="SCENARIO_NOT_FOUND"
            )

        return format_response(
            success=True,
            message="查询成功",
            data=result["data"][0]
        )

    def validate_publish_conditions(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """验证场景包发布条件

        Args:
            scenario: 场景包数据

        Returns:
            验证结果
        """
        errors = []

        # 检查名称
        if not scenario.get("name"):
            errors.append("名称不能为空")

        # 检查价格
        price = scenario.get("price")
        if price is None or float(price) <= 0:
            errors.append("价格必须大于 0")

        # 检查适用影厅
        applicable_halls = scenario.get("applicable_halls")
        if not applicable_halls or len(applicable_halls) == 0:
            errors.append("必须选择至少一个适用影厅")

        # 检查内容
        hard_benefits = scenario.get("hard_benefits") or []
        soft_benefits = scenario.get("soft_benefits") or []
        service_items = scenario.get("service_items") or []

        if len(hard_benefits) == 0 and len(soft_benefits) == 0 and len(service_items) == 0:
            errors.append("必须包含至少一项内容（硬权益/软权益/服务项目）")

        if errors:
            return format_response(
                success=False,
                message="未满足发布条件",
                error="; ".join(errors)
            )

        return format_response(
            success=True,
            message="发布条件检查通过"
        )

    def publish(self, scenario_id: str, force: bool = False) -> Dict[str, Any]:
        """发布场景包

        Args:
            scenario_id: 场景包 ID
            force: 是否跳过条件验证

        Returns:
            操作结果
        """
        # 查询场景包
        result = self.get_scenario_by_id(scenario_id)
        if not result["success"]:
            return result

        scenario = result["data"]

        # 检查当前状态
        current_status = scenario.get("status")
        if current_status == "PUBLISHED":
            return format_response(
                success=False,
                message="场景包已经是发布状态",
                error="ALREADY_PUBLISHED"
            )

        if current_status == "ARCHIVED":
            return format_response(
                success=False,
                message="已归档的场景包不能直接发布，请先恢复为草稿",
                error="CANNOT_PUBLISH_ARCHIVED"
            )

        # 验证发布条件
        if not force:
            validation = self.validate_publish_conditions(scenario)
            if not validation["success"]:
                return validation

        # 执行发布
        update_result = self.client.patch(
            "/rest/v1/scenario_packages",
            data={"status": "PUBLISHED"},
            params={"id": f"eq.{scenario_id}"}
        )

        if not update_result["success"]:
            return update_result

        return format_response(
            success=True,
            message=f"场景包 '{scenario.get('name')}' 发布成功",
            data={
                "id": scenario_id,
                "name": scenario.get("name"),
                "old_status": current_status,
                "new_status": "PUBLISHED"
            }
        )

    def unpublish(self, scenario_id: str) -> Dict[str, Any]:
        """下架场景包（归档）

        Args:
            scenario_id: 场景包 ID

        Returns:
            操作结果
        """
        # 查询场景包
        result = self.get_scenario_by_id(scenario_id)
        if not result["success"]:
            return result

        scenario = result["data"]

        # 检查当前状态
        current_status = scenario.get("status")
        if current_status == "ARCHIVED":
            return format_response(
                success=False,
                message="场景包已经是归档状态",
                error="ALREADY_ARCHIVED"
            )

        if current_status == "DRAFT":
            return format_response(
                success=False,
                message="草稿状态的场景包不需要下架",
                error="CANNOT_UNPUBLISH_DRAFT"
            )

        # 执行下架
        update_result = self.client.patch(
            "/rest/v1/scenario_packages",
            data={"status": "ARCHIVED"},
            params={"id": f"eq.{scenario_id}"}
        )

        if not update_result["success"]:
            return update_result

        return format_response(
            success=True,
            message=f"场景包 '{scenario.get('name')}' 下架成功",
            data={
                "id": scenario_id,
                "name": scenario.get("name"),
                "old_status": current_status,
                "new_status": "ARCHIVED"
            }
        )

    def restore_to_draft(self, scenario_id: str) -> Dict[str, Any]:
        """恢复场景包为草稿状态

        Args:
            scenario_id: 场景包 ID

        Returns:
            操作结果
        """
        # 查询场景包
        result = self.get_scenario_by_id(scenario_id)
        if not result["success"]:
            return result

        scenario = result["data"]

        # 检查当前状态
        current_status = scenario.get("status")
        if current_status == "DRAFT":
            return format_response(
                success=False,
                message="场景包已经是草稿状态",
                error="ALREADY_DRAFT"
            )

        # 执行恢复
        update_result = self.client.patch(
            "/rest/v1/scenario_packages",
            data={"status": "DRAFT"},
            params={"id": f"eq.{scenario_id}"}
        )

        if not update_result["success"]:
            return update_result

        return format_response(
            success=True,
            message=f"场景包 '{scenario.get('name')}' 已恢复为草稿",
            data={
                "id": scenario_id,
                "name": scenario.get("name"),
                "old_status": current_status,
                "new_status": "DRAFT"
            }
        )

    def update_price(self, scenario_id: str, new_price: float, original_price: Optional[float] = None) -> Dict[str, Any]:
        """更新场景包价格

        Args:
            scenario_id: 场景包 ID
            new_price: 新价格
            original_price: 原价（划线价），可选

        Returns:
            操作结果
        """
        # 验证价格
        if new_price <= 0:
            return format_response(
                success=False,
                message="价格必须大于 0",
                error="INVALID_PRICE"
            )

        # 查询场景包
        result = self.get_scenario_by_id(scenario_id)
        if not result["success"]:
            return result

        scenario = result["data"]
        old_price = scenario.get("price")

        # 构建更新数据
        update_data = {"price": new_price}
        if original_price is not None:
            if original_price < new_price:
                return format_response(
                    success=False,
                    message="原价不能低于销售价",
                    error="INVALID_ORIGINAL_PRICE"
                )
            update_data["original_price"] = original_price

        # 执行更新
        update_result = self.client.patch(
            "/rest/v1/scenario_packages",
            data=update_data,
            params={"id": f"eq.{scenario_id}"}
        )

        if not update_result["success"]:
            return update_result

        return format_response(
            success=True,
            message=f"场景包 '{scenario.get('name')}' 价格更新成功",
            data={
                "id": scenario_id,
                "name": scenario.get("name"),
                "old_price": old_price,
                "new_price": new_price,
                "original_price": original_price
            }
        )

    # ============ 批量操作 ============

    def batch_unpublish(self, scenario_ids: List[str]) -> Dict[str, Any]:
        """批量下架场景包

        Args:
            scenario_ids: 场景包 ID 列表

        Returns:
            操作结果，包含成功和失败的详情
        """
        if not scenario_ids:
            return format_response(
                success=False,
                message="请指定要下架的场景包",
                error="EMPTY_LIST"
            )

        results = {
            "success_count": 0,
            "fail_count": 0,
            "success_items": [],
            "fail_items": []
        }

        for scenario_id in scenario_ids:
            result = self.unpublish(scenario_id)
            if result["success"]:
                results["success_count"] += 1
                results["success_items"].append({
                    "id": scenario_id,
                    "name": result["data"].get("name")
                })
            else:
                results["fail_count"] += 1
                results["fail_items"].append({
                    "id": scenario_id,
                    "error": result.get("message")
                })

        total = len(scenario_ids)
        if results["fail_count"] == 0:
            return format_response(
                success=True,
                message=f"批量下架成功，共 {total} 个场景包",
                data=results
            )
        elif results["success_count"] == 0:
            return format_response(
                success=False,
                message=f"批量下架失败，共 {total} 个场景包",
                data=results
            )
        else:
            return format_response(
                success=True,
                message=f"批量下架部分成功：{results['success_count']} 成功，{results['fail_count']} 失败",
                data=results
            )

    def batch_unpublish_by_status(self, current_status: str = "PUBLISHED") -> Dict[str, Any]:
        """按状态批量下架场景包

        Args:
            current_status: 当前状态筛选

        Returns:
            操作结果
        """
        # 查询符合条件的场景包
        result = self.client.get(
            "/rest/v1/scenario_packages",
            params={"status": f"eq.{current_status}", "select": "id,name", "limit": "1000"}
        )

        if not result["success"]:
            return result

        scenarios = result["data"]
        if not scenarios:
            return format_response(
                success=False,
                message=f"没有找到状态为 {current_status} 的场景包",
                error="NO_MATCHING_SCENARIOS"
            )

        scenario_ids = [s["id"] for s in scenarios]
        return self.batch_unpublish(scenario_ids)

    def list_by_status(self, status: str, limit: int = 100) -> Dict[str, Any]:
        """按状态列出场景包

        Args:
            status: 状态筛选
            limit: 返回数量限制

        Returns:
            场景包列表
        """
        return self.client.list_scenario_packages(status=status, limit=limit)


def main():
    """命令行入口"""
    args = parse_cli_args()

    action = args.get("action")
    if not action:
        print_json(format_response(
            success=False,
            message="请指定操作类型",
            error="用法: scenario_ops.py <action> [options]\n"
                  "操作: publish, unpublish, restore, update_price\n"
                  "示例: scenario_ops.py publish --id=xxx"
        ))
        sys.exit(1)

    ops = ScenarioOps()

    if action == "publish":
        scenario_id = args.get("id")
        if not scenario_id:
            # 尝试通过名称查找
            name = args.get("name")
            if name:
                result = ops.get_scenario_by_name(name)
                if result["success"]:
                    scenario_id = result["data"]["id"]
                else:
                    print_json(result)
                    sys.exit(1)
            else:
                print_json(format_response(
                    success=False,
                    message="请指定场景包 ID 或名称",
                    error="用法: scenario_ops.py publish --id=xxx 或 --name=xxx"
                ))
                sys.exit(1)

        result = ops.publish(scenario_id)
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    elif action == "unpublish":
        scenario_id = args.get("id")
        if not scenario_id:
            name = args.get("name")
            if name:
                result = ops.get_scenario_by_name(name)
                if result["success"]:
                    scenario_id = result["data"]["id"]
                else:
                    print_json(result)
                    sys.exit(1)
            else:
                print_json(format_response(
                    success=False,
                    message="请指定场景包 ID 或名称",
                    error="用法: scenario_ops.py unpublish --id=xxx 或 --name=xxx"
                ))
                sys.exit(1)

        result = ops.unpublish(scenario_id)
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    elif action == "restore":
        scenario_id = args.get("id")
        if not scenario_id:
            name = args.get("name")
            if name:
                result = ops.get_scenario_by_name(name)
                if result["success"]:
                    scenario_id = result["data"]["id"]
                else:
                    print_json(result)
                    sys.exit(1)
            else:
                print_json(format_response(
                    success=False,
                    message="请指定场景包 ID 或名称",
                    error="用法: scenario_ops.py restore --id=xxx 或 --name=xxx"
                ))
                sys.exit(1)

        result = ops.restore_to_draft(scenario_id)
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    elif action == "update_price":
        error_msg = validate_required_args(args, ["id", "price"])
        if error_msg:
            print_json(format_response(
                success=False,
                message=error_msg,
                error="用法: scenario_ops.py update_price --id=xxx --price=1000"
            ))
            sys.exit(1)

        try:
            new_price = float(args["price"])
        except ValueError:
            print_json(format_response(
                success=False,
                message="价格必须是数字",
                error="INVALID_PRICE_FORMAT"
            ))
            sys.exit(1)

        original_price = None
        if "original_price" in args:
            try:
                original_price = float(args["original_price"])
            except ValueError:
                print_json(format_response(
                    success=False,
                    message="原价必须是数字",
                    error="INVALID_ORIGINAL_PRICE_FORMAT"
                ))
                sys.exit(1)

        result = ops.update_price(args["id"], new_price, original_price)
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    else:
        print_json(format_response(
            success=False,
            message=f"未知操作: {action}",
            error="支持的操作: publish, unpublish, restore, update_price"
        ))
        sys.exit(1)


if __name__ == "__main__":
    main()

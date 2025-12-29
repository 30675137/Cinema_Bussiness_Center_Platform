#!/usr/bin/env python3
"""
门店操作脚本

提供门店设置修改、预约配置等操作功能。
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
import re


class StoreOps:
    """门店操作类"""

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

    def get_store_by_name(self, name: str) -> Dict[str, Any]:
        """根据名称查询门店

        Args:
            name: 门店名称

        Returns:
            门店信息或错误
        """
        result = self.client.get(
            "/rest/v1/stores",
            params={"name": f"eq.{name}", "limit": "1"}
        )

        if not result["success"]:
            return result

        if not result["data"] or len(result["data"]) == 0:
            return format_response(
                success=False,
                message=f"未找到门店: {name}",
                error="STORE_NOT_FOUND"
            )

        return format_response(
            success=True,
            message="查询成功",
            data=result["data"][0]
        )

    def get_store_by_id(self, store_id: str) -> Dict[str, Any]:
        """根据 ID 查询门店

        Args:
            store_id: 门店 ID

        Returns:
            门店信息或错误
        """
        result = self.client.get(
            "/rest/v1/stores",
            params={"id": f"eq.{store_id}", "limit": "1"}
        )

        if not result["success"]:
            return result

        if not result["data"] or len(result["data"]) == 0:
            return format_response(
                success=False,
                message=f"未找到门店 ID: {store_id}",
                error="STORE_NOT_FOUND"
            )

        return format_response(
            success=True,
            message="查询成功",
            data=result["data"][0]
        )

    def get_reservation_settings(self, store_id: str) -> Dict[str, Any]:
        """获取门店预约设置

        Args:
            store_id: 门店 ID

        Returns:
            预约设置或错误
        """
        result = self.client.get(
            "/rest/v1/store_reservation_settings",
            params={"store_id": f"eq.{store_id}", "limit": "1"}
        )

        if not result["success"]:
            return result

        if not result["data"] or len(result["data"]) == 0:
            return format_response(
                success=False,
                message="门店未配置预约设置",
                error="SETTINGS_NOT_FOUND"
            )

        return format_response(
            success=True,
            message="查询成功",
            data=result["data"][0]
        )

    @staticmethod
    def parse_time(time_str: str) -> Optional[str]:
        """解析时间字符串

        Args:
            time_str: 时间字符串，如 "9:00", "09:00", "21:30"

        Returns:
            标准化的时间字符串 "HH:MM:SS" 或 None
        """
        if not time_str:
            return None

        # 尝试匹配时间格式
        match = re.match(r'^(\d{1,2}):(\d{2})(?::(\d{2}))?$', time_str.strip())
        if not match:
            return None

        hour = int(match.group(1))
        minute = int(match.group(2))
        second = int(match.group(3)) if match.group(3) else 0

        if hour < 0 or hour > 24 or minute < 0 or minute >= 60:
            return None

        return f"{hour:02d}:{minute:02d}:{second:02d}"

    def update_reservation_time(
        self,
        store_id: str,
        weekday_start: Optional[str] = None,
        weekday_end: Optional[str] = None,
        weekend_start: Optional[str] = None,
        weekend_end: Optional[str] = None
    ) -> Dict[str, Any]:
        """更新门店预约时段

        Args:
            store_id: 门店 ID
            weekday_start: 工作日开始时间
            weekday_end: 工作日结束时间
            weekend_start: 周末开始时间
            weekend_end: 周末结束时间

        Returns:
            操作结果
        """
        # 验证门店存在
        store_result = self.get_store_by_id(store_id)
        if not store_result["success"]:
            return store_result

        store = store_result["data"]

        # 获取当前设置
        settings_result = self.get_reservation_settings(store_id)

        # 构建更新数据
        update_data = {}
        old_values = {}

        if weekday_start:
            parsed = self.parse_time(weekday_start)
            if not parsed:
                return format_response(
                    success=False,
                    message=f"无效的时间格式: {weekday_start}",
                    error="INVALID_TIME_FORMAT"
                )
            update_data["weekday_start_time"] = parsed
            if settings_result["success"]:
                old_values["weekday_start_time"] = settings_result["data"].get("weekday_start_time")

        if weekday_end:
            parsed = self.parse_time(weekday_end)
            if not parsed:
                return format_response(
                    success=False,
                    message=f"无效的时间格式: {weekday_end}",
                    error="INVALID_TIME_FORMAT"
                )
            update_data["weekday_end_time"] = parsed
            if settings_result["success"]:
                old_values["weekday_end_time"] = settings_result["data"].get("weekday_end_time")

        if weekend_start:
            parsed = self.parse_time(weekend_start)
            if not parsed:
                return format_response(
                    success=False,
                    message=f"无效的时间格式: {weekend_start}",
                    error="INVALID_TIME_FORMAT"
                )
            update_data["weekend_start_time"] = parsed
            if settings_result["success"]:
                old_values["weekend_start_time"] = settings_result["data"].get("weekend_start_time")

        if weekend_end:
            parsed = self.parse_time(weekend_end)
            if not parsed:
                return format_response(
                    success=False,
                    message=f"无效的时间格式: {weekend_end}",
                    error="INVALID_TIME_FORMAT"
                )
            update_data["weekend_end_time"] = parsed
            if settings_result["success"]:
                old_values["weekend_end_time"] = settings_result["data"].get("weekend_end_time")

        if not update_data:
            return format_response(
                success=False,
                message="请指定要修改的时间",
                error="NO_UPDATE_DATA"
            )

        # 执行更新
        result = self.client.patch(
            "/rest/v1/store_reservation_settings",
            data=update_data,
            params={"store_id": f"eq.{store_id}"}
        )

        if not result["success"]:
            return result

        return format_response(
            success=True,
            message=f"门店 '{store.get('name')}' 预约时段更新成功",
            data={
                "store_id": store_id,
                "store_name": store.get("name"),
                "old_values": old_values,
                "new_values": update_data
            }
        )

    def update_duration_unit(self, store_id: str, duration_minutes: int) -> Dict[str, Any]:
        """更新门店预约时长单位

        Args:
            store_id: 门店 ID
            duration_minutes: 时长单位（分钟）

        Returns:
            操作结果
        """
        # 验证时长单位
        valid_durations = [30, 60, 90, 120, 180, 240]
        if duration_minutes not in valid_durations:
            return format_response(
                success=False,
                message=f"无效的时长单位: {duration_minutes}",
                error=f"时长单位必须是以下之一: {', '.join(map(str, valid_durations))} 分钟"
            )

        # 验证门店存在
        store_result = self.get_store_by_id(store_id)
        if not store_result["success"]:
            return store_result

        store = store_result["data"]

        # 获取当前设置
        settings_result = self.get_reservation_settings(store_id)
        old_duration = None
        if settings_result["success"]:
            old_duration = settings_result["data"].get("duration_unit")

        # 执行更新
        result = self.client.patch(
            "/rest/v1/store_reservation_settings",
            data={"duration_unit": duration_minutes},
            params={"store_id": f"eq.{store_id}"}
        )

        if not result["success"]:
            return result

        return format_response(
            success=True,
            message=f"门店 '{store.get('name')}' 时长单位更新成功",
            data={
                "store_id": store_id,
                "store_name": store.get("name"),
                "old_duration_unit": old_duration,
                "new_duration_unit": duration_minutes
            }
        )

    def update_advance_settings(
        self,
        store_id: str,
        min_advance_hours: Optional[int] = None,
        max_advance_days: Optional[int] = None
    ) -> Dict[str, Any]:
        """更新门店预约提前量设置

        Args:
            store_id: 门店 ID
            min_advance_hours: 最小提前预约小时数
            max_advance_days: 最大提前预约天数

        Returns:
            操作结果
        """
        # 验证门店存在
        store_result = self.get_store_by_id(store_id)
        if not store_result["success"]:
            return store_result

        store = store_result["data"]

        # 构建更新数据
        update_data = {}
        old_values = {}

        settings_result = self.get_reservation_settings(store_id)

        if min_advance_hours is not None:
            if min_advance_hours < 0 or min_advance_hours > 168:  # 最多提前 7 天
                return format_response(
                    success=False,
                    message="最小提前时间必须在 0-168 小时之间",
                    error="INVALID_MIN_ADVANCE"
                )
            update_data["min_advance_hours"] = min_advance_hours
            if settings_result["success"]:
                old_values["min_advance_hours"] = settings_result["data"].get("min_advance_hours")

        if max_advance_days is not None:
            if max_advance_days < 1 or max_advance_days > 90:
                return format_response(
                    success=False,
                    message="最大提前天数必须在 1-90 天之间",
                    error="INVALID_MAX_ADVANCE"
                )
            update_data["max_advance_days"] = max_advance_days
            if settings_result["success"]:
                old_values["max_advance_days"] = settings_result["data"].get("max_advance_days")

        if not update_data:
            return format_response(
                success=False,
                message="请指定要修改的提前量设置",
                error="NO_UPDATE_DATA"
            )

        # 执行更新
        result = self.client.patch(
            "/rest/v1/store_reservation_settings",
            data=update_data,
            params={"store_id": f"eq.{store_id}"}
        )

        if not result["success"]:
            return result

        return format_response(
            success=True,
            message=f"门店 '{store.get('name')}' 提前量设置更新成功",
            data={
                "store_id": store_id,
                "store_name": store.get("name"),
                "old_values": old_values,
                "new_values": update_data
            }
        )

    def update_deposit_settings(
        self,
        store_id: str,
        deposit_required: Optional[bool] = None,
        deposit_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """更新门店押金设置

        Args:
            store_id: 门店 ID
            deposit_required: 是否需要押金
            deposit_amount: 押金金额

        Returns:
            操作结果
        """
        # 验证门店存在
        store_result = self.get_store_by_id(store_id)
        if not store_result["success"]:
            return store_result

        store = store_result["data"]

        # 构建更新数据
        update_data = {}
        old_values = {}

        settings_result = self.get_reservation_settings(store_id)

        if deposit_required is not None:
            update_data["deposit_required"] = deposit_required
            if settings_result["success"]:
                old_values["deposit_required"] = settings_result["data"].get("deposit_required")

        if deposit_amount is not None:
            if deposit_amount < 0:
                return format_response(
                    success=False,
                    message="押金金额不能为负数",
                    error="INVALID_DEPOSIT_AMOUNT"
                )
            update_data["deposit_amount"] = deposit_amount
            if settings_result["success"]:
                old_values["deposit_amount"] = settings_result["data"].get("deposit_amount")

        if not update_data:
            return format_response(
                success=False,
                message="请指定要修改的押金设置",
                error="NO_UPDATE_DATA"
            )

        # 执行更新
        result = self.client.patch(
            "/rest/v1/store_reservation_settings",
            data=update_data,
            params={"store_id": f"eq.{store_id}"}
        )

        if not result["success"]:
            return result

        return format_response(
            success=True,
            message=f"门店 '{store.get('name')}' 押金设置更新成功",
            data={
                "store_id": store_id,
                "store_name": store.get("name"),
                "old_values": old_values,
                "new_values": update_data
            }
        )

    def update_store_status(self, store_id: str, new_status: str) -> Dict[str, Any]:
        """更新门店状态

        Args:
            store_id: 门店 ID
            new_status: 新状态（ACTIVE, INACTIVE）

        Returns:
            操作结果
        """
        valid_statuses = ["ACTIVE", "INACTIVE"]
        if new_status not in valid_statuses:
            return format_response(
                success=False,
                message=f"无效的状态: {new_status}",
                error=f"状态必须是以下之一: {', '.join(valid_statuses)}"
            )

        # 验证门店存在
        store_result = self.get_store_by_id(store_id)
        if not store_result["success"]:
            return store_result

        store = store_result["data"]
        old_status = store.get("status")

        if old_status == new_status:
            return format_response(
                success=False,
                message=f"门店已经是 {new_status} 状态",
                error="SAME_STATUS"
            )

        # 执行更新
        result = self.client.patch(
            "/rest/v1/stores",
            data={"status": new_status},
            params={"id": f"eq.{store_id}"}
        )

        if not result["success"]:
            return result

        return format_response(
            success=True,
            message=f"门店 '{store.get('name')}' 状态更新成功",
            data={
                "store_id": store_id,
                "store_name": store.get("name"),
                "old_status": old_status,
                "new_status": new_status
            }
        )

    # ============ 批量操作 ============

    def batch_update_duration(self, store_ids: List[str], duration_minutes: int) -> Dict[str, Any]:
        """批量更新门店预约时长单位

        Args:
            store_ids: 门店 ID 列表
            duration_minutes: 时长单位（分钟）

        Returns:
            操作结果
        """
        if not store_ids:
            return format_response(
                success=False,
                message="请指定要更新的门店",
                error="EMPTY_LIST"
            )

        results = {
            "success_count": 0,
            "fail_count": 0,
            "success_items": [],
            "fail_items": []
        }

        for store_id in store_ids:
            result = self.update_duration_unit(store_id, duration_minutes)
            if result["success"]:
                results["success_count"] += 1
                results["success_items"].append({
                    "store_id": store_id,
                    "store_name": result["data"].get("store_name")
                })
            else:
                results["fail_count"] += 1
                results["fail_items"].append({
                    "store_id": store_id,
                    "error": result.get("message")
                })

        total = len(store_ids)
        if results["fail_count"] == 0:
            return format_response(
                success=True,
                message=f"批量更新成功，共 {total} 家门店",
                data=results
            )
        elif results["success_count"] == 0:
            return format_response(
                success=False,
                message=f"批量更新失败，共 {total} 家门店",
                data=results
            )
        else:
            return format_response(
                success=True,
                message=f"批量更新部分成功：{results['success_count']} 成功，{results['fail_count']} 失败",
                data=results
            )

    def batch_update_duration_all(self, duration_minutes: int, city: Optional[str] = None) -> Dict[str, Any]:
        """批量更新所有（或指定城市的）门店预约时长

        Args:
            duration_minutes: 时长单位（分钟）
            city: 可选的城市筛选

        Returns:
            操作结果
        """
        # 查询门店
        params = {"select": "id,name", "limit": "1000", "status": "eq.ACTIVE"}
        if city:
            params["city"] = f"eq.{city}"

        result = self.client.get("/rest/v1/stores", params=params)

        if not result["success"]:
            return result

        stores = result["data"]
        if not stores:
            msg = f"没有找到城市为 {city} 的门店" if city else "没有找到启用的门店"
            return format_response(
                success=False,
                message=msg,
                error="NO_MATCHING_STORES"
            )

        store_ids = [s["id"] for s in stores]
        return self.batch_update_duration(store_ids, duration_minutes)

    def list_all_stores(self, status: Optional[str] = None, city: Optional[str] = None, limit: int = 100) -> Dict[str, Any]:
        """列出门店

        Args:
            status: 状态筛选
            city: 城市筛选
            limit: 返回数量限制

        Returns:
            门店列表
        """
        params = {"limit": str(limit), "order": "created_at.desc"}
        if status:
            params["status"] = f"eq.{status}"
        if city:
            params["city"] = f"eq.{city}"

        return self.client.get("/rest/v1/stores", params=params)


def main():
    """命令行入口"""
    args = parse_cli_args()

    action = args.get("action")
    if not action:
        print_json(format_response(
            success=False,
            message="请指定操作类型",
            error="用法: store_ops.py <action> [options]\n"
                  "操作: update_time, update_duration, update_advance, update_deposit, update_status\n"
                  "示例: store_ops.py update_time --id=xxx --weekend_start=8:00 --weekend_end=24:00"
        ))
        sys.exit(1)

    ops = StoreOps()

    # 获取门店 ID
    store_id = args.get("id")
    if not store_id:
        name = args.get("name")
        if name:
            result = ops.get_store_by_name(name)
            if result["success"]:
                store_id = result["data"]["id"]
            else:
                print_json(result)
                sys.exit(1)
        else:
            print_json(format_response(
                success=False,
                message="请指定门店 ID 或名称",
                error="用法: store_ops.py <action> --id=xxx 或 --name=xxx"
            ))
            sys.exit(1)

    if action == "update_time":
        result = ops.update_reservation_time(
            store_id,
            weekday_start=args.get("weekday_start"),
            weekday_end=args.get("weekday_end"),
            weekend_start=args.get("weekend_start"),
            weekend_end=args.get("weekend_end")
        )
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    elif action == "update_duration":
        duration = args.get("duration")
        if not duration:
            print_json(format_response(
                success=False,
                message="请指定时长单位",
                error="用法: store_ops.py update_duration --id=xxx --duration=120"
            ))
            sys.exit(1)

        try:
            duration_minutes = int(duration)
        except ValueError:
            print_json(format_response(
                success=False,
                message="时长必须是整数",
                error="INVALID_DURATION_FORMAT"
            ))
            sys.exit(1)

        result = ops.update_duration_unit(store_id, duration_minutes)
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    elif action == "update_advance":
        min_hours = None
        max_days = None

        if "min_hours" in args:
            try:
                min_hours = int(args["min_hours"])
            except ValueError:
                print_json(format_response(
                    success=False,
                    message="最小提前时间必须是整数",
                    error="INVALID_FORMAT"
                ))
                sys.exit(1)

        if "max_days" in args:
            try:
                max_days = int(args["max_days"])
            except ValueError:
                print_json(format_response(
                    success=False,
                    message="最大提前天数必须是整数",
                    error="INVALID_FORMAT"
                ))
                sys.exit(1)

        result = ops.update_advance_settings(store_id, min_hours, max_days)
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    elif action == "update_deposit":
        required = None
        amount = None

        if "required" in args:
            required = args["required"].lower() in ("true", "1", "yes")

        if "amount" in args:
            try:
                amount = float(args["amount"])
            except ValueError:
                print_json(format_response(
                    success=False,
                    message="押金金额必须是数字",
                    error="INVALID_FORMAT"
                ))
                sys.exit(1)

        result = ops.update_deposit_settings(store_id, required, amount)
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    elif action == "update_status":
        status = args.get("status")
        if not status:
            print_json(format_response(
                success=False,
                message="请指定状态",
                error="用法: store_ops.py update_status --id=xxx --status=ACTIVE"
            ))
            sys.exit(1)

        result = ops.update_store_status(store_id, status.upper())
        print_json(result)
        sys.exit(0 if result["success"] else 1)

    else:
        print_json(format_response(
            success=False,
            message=f"未知操作: {action}",
            error="支持的操作: update_time, update_duration, update_advance, update_deposit, update_status"
        ))
        sys.exit(1)


if __name__ == "__main__":
    main()

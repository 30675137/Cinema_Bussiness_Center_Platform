"""
飞书表格操作辅助模块 - 数据转换和 MCP 调用参数生成

注意：实际的飞书 MCP 调用由 Claude 执行，本模块提供数据转换辅助函数
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
from .config import (
    FIELD_NAMES,
    STATUS_MAPPING,
    STATUS_MAPPING_REVERSE,
    TABLE_FIELDS,
)


class FeishuDataTransformer:
    """飞书数据转换器"""

    @staticmethod
    def record_to_product_data(record: Dict, sku_id: str, category_id: str) -> Dict:
        """
        将飞书记录转换为创建商品的 API 请求数据

        Args:
            record: 飞书表格记录 (fields 字典)
            sku_id: 查询到的 SKU ID
            category_id: 查询到的分类 ID

        Returns:
            创建商品的请求数据
        """
        fields = record.get("fields", record)

        # 价格转换：元 -> 分
        price_yuan = fields.get(FIELD_NAMES["channel_price"], 0)
        price_fen = int(float(price_yuan) * 100) if price_yuan else 0

        # 目标状态映射
        target_status = fields.get(FIELD_NAMES["target_status"], "草稿")
        api_status = STATUS_MAPPING.get(target_status, "DRAFT")

        # 详情图处理：多行文本分割为数组
        detail_images_text = fields.get(FIELD_NAMES["detail_images"], "")
        detail_images = []
        if detail_images_text:
            detail_images = [
                url.strip()
                for url in detail_images_text.split("\n")
                if url.strip()
            ]

        product_data = {
            "skuId": sku_id,
            "categoryId": category_id,
            "displayName": fields.get(FIELD_NAMES["product_name"]),
            "channelPrice": price_fen,
            "mainImage": fields.get(FIELD_NAMES["main_image"]),
            "detailImages": detail_images if detail_images else None,
            "description": fields.get(FIELD_NAMES["description"]),
            "specs": fields.get(FIELD_NAMES["specs"]),
            "isRecommended": bool(fields.get(FIELD_NAMES["is_recommended"], False)),
            "sortOrder": int(fields.get(FIELD_NAMES["sort_order"], 0) or 0),
            "status": api_status,
        }

        # 移除 None 值
        return {k: v for k, v in product_data.items() if v is not None}

    @staticmethod
    def build_success_update(system_id: str) -> Dict:
        """构建同步成功的更新数据"""
        return {
            FIELD_NAMES["system_id"]: system_id,
            FIELD_NAMES["sync_status"]: "已同步",
            FIELD_NAMES["sync_time"]: datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            FIELD_NAMES["error_message"]: "",
        }

    @staticmethod
    def build_failure_update(error_msg: str) -> Dict:
        """构建同步失败的更新数据"""
        return {
            FIELD_NAMES["sync_status"]: "失败",
            FIELD_NAMES["error_message"]: error_msg,
        }

    @staticmethod
    def get_sku_name(record: Dict) -> str:
        """从记录中获取 SKU 名称"""
        fields = record.get("fields", record)
        return fields.get(FIELD_NAMES["sku_name"], "")

    @staticmethod
    def get_category_name(record: Dict) -> str:
        """从记录中获取分类名称"""
        fields = record.get("fields", record)
        return fields.get(FIELD_NAMES["category_name"], "")

    @staticmethod
    def get_product_name(record: Dict) -> str:
        """从记录中获取商品名称"""
        fields = record.get("fields", record)
        return fields.get(FIELD_NAMES["product_name"], "未知商品")

    @staticmethod
    def get_system_id(record: Dict) -> Optional[str]:
        """从记录中获取系统商品ID"""
        fields = record.get("fields", record)
        return fields.get(FIELD_NAMES["system_id"])

    @staticmethod
    def get_target_status(record: Dict) -> str:
        """从记录中获取目标状态"""
        fields = record.get("fields", record)
        return fields.get(FIELD_NAMES["target_status"], "草稿")


class MCPParamsBuilder:
    """MCP 调用参数构建器"""

    @staticmethod
    def build_search_pending_records(app_token: str, table_id: str) -> Dict:
        """
        构建搜索待同步记录的 MCP 参数

        用于调用: mcp__lark-mcp__bitable_v1_appTableRecord_search
        """
        return {
            "path": {
                "app_token": app_token,
                "table_id": table_id,
            },
            "data": {
                "filter": {
                    "conjunction": "and",
                    "conditions": [
                        {
                            "field_name": FIELD_NAMES["sync_status"],
                            "operator": "is",
                            "value": ["待同步"],
                        }
                    ],
                },
            },
        }

    @staticmethod
    def build_search_by_status(
        app_token: str,
        table_id: str,
        target_status: str,
        sync_status: str = "已同步"
    ) -> Dict:
        """
        构建按状态搜索记录的 MCP 参数

        用于调用: mcp__lark-mcp__bitable_v1_appTableRecord_search
        """
        return {
            "path": {
                "app_token": app_token,
                "table_id": table_id,
            },
            "data": {
                "filter": {
                    "conjunction": "and",
                    "conditions": [
                        {
                            "field_name": FIELD_NAMES["target_status"],
                            "operator": "is",
                            "value": [target_status],
                        },
                        {
                            "field_name": FIELD_NAMES["sync_status"],
                            "operator": "is",
                            "value": [sync_status],
                        },
                    ],
                },
            },
        }

    @staticmethod
    def build_search_by_product_name(
        app_token: str,
        table_id: str,
        product_name: str
    ) -> Dict:
        """
        构建按商品名称搜索的 MCP 参数

        用于调用: mcp__lark-mcp__bitable_v1_appTableRecord_search
        """
        return {
            "path": {
                "app_token": app_token,
                "table_id": table_id,
            },
            "data": {
                "filter": {
                    "conjunction": "and",
                    "conditions": [
                        {
                            "field_name": FIELD_NAMES["product_name"],
                            "operator": "is",
                            "value": [product_name],
                        },
                    ],
                },
            },
        }

    @staticmethod
    def build_update_record(
        app_token: str,
        table_id: str,
        record_id: str,
        fields: Dict
    ) -> Dict:
        """
        构建更新记录的 MCP 参数

        用于调用: mcp__lark-mcp__bitable_v1_appTableRecord_update
        """
        return {
            "path": {
                "app_token": app_token,
                "table_id": table_id,
                "record_id": record_id,
            },
            "data": {
                "fields": fields,
            },
        }

    @staticmethod
    def build_create_table(app_token: str, categories: List[str]) -> Dict:
        """
        构建创建表格的 MCP 参数

        用于调用: mcp__lark-mcp__bitable_v1_appTable_create

        Args:
            app_token: Base App Token
            categories: 分类选项列表
        """
        # 复制字段定义并更新分类选项
        fields = []
        for field_def in TABLE_FIELDS:
            field = field_def.copy()
            if field["field_name"] == "分类名称":
                field["property"] = {
                    "options": [
                        {"name": cat, "color": i % 10}
                        for i, cat in enumerate(categories)
                    ]
                }
            fields.append(field)

        return {
            "path": {
                "app_token": app_token,
            },
            "data": {
                "table": {
                    "name": "小程序商品管理",
                    "default_view_name": "全部商品",
                    "fields": fields,
                },
            },
        }

    @staticmethod
    def build_create_base_app() -> Dict:
        """
        构建创建 Base App 的 MCP 参数

        用于调用: mcp__lark-mcp__bitable_v1_app_create
        """
        return {
            "data": {
                "name": "小程序商品管理",
            },
            "useUAT": True,
        }


def format_sync_result(
    success_list: List[str],
    failed_list: List[Dict]
) -> str:
    """格式化同步结果输出"""
    lines = []

    if success_list:
        lines.append("成功同步:")
        for name in success_list:
            lines.append(f"  ✅ {name}")

    if failed_list:
        lines.append("\n失败项:")
        for item in failed_list:
            lines.append(f"  ❌ {item['name']} - {item['error']}")

    lines.append(f"\n总计: 成功 {len(success_list)} 条，失败 {len(failed_list)} 条")

    return "\n".join(lines)


def format_status_summary(records: List[Dict]) -> str:
    """格式化状态统计"""
    sync_status_count = {"待同步": 0, "已同步": 0, "失败": 0}
    target_status_count = {"草稿": 0, "上架": 0, "下架": 0}

    for record in records:
        fields = record.get("fields", record)
        sync_status = fields.get(FIELD_NAMES["sync_status"], "待同步")
        target_status = fields.get(FIELD_NAMES["target_status"], "草稿")

        if sync_status in sync_status_count:
            sync_status_count[sync_status] += 1
        if target_status in target_status_count:
            target_status_count[target_status] += 1

    lines = [
        "📊 商品同步状态统计",
        "",
        "飞书表格数据:",
        "┌──────────┬──────┐",
        "│ 同步状态  │ 数量 │",
        "├──────────┼──────┤",
    ]

    for status, count in sync_status_count.items():
        lines.append(f"│ {status:<8} │ {count:^4} │")

    total = sum(sync_status_count.values())
    lines.extend([
        "├──────────┼──────┤",
        f"│ 总计      │ {total:^4} │",
        "└──────────┴──────┘",
        "",
        "目标状态分布:",
        "┌──────────┬──────┐",
        "│ 目标状态  │ 数量 │",
        "├──────────┼──────┤",
    ])

    for status, count in target_status_count.items():
        lines.append(f"│ {status:<8} │ {count:^4} │")

    lines.extend([
        "└──────────┴──────┘",
    ])

    # 待处理提示
    pending = sync_status_count.get("待同步", 0)
    failed = sync_status_count.get("失败", 0)
    if pending or failed:
        lines.append("\n待处理:")
        if pending:
            lines.append(f"- {pending} 条记录待同步")
        if failed:
            lines.append(f"- {failed} 条同步失败需处理")

    return "\n".join(lines)

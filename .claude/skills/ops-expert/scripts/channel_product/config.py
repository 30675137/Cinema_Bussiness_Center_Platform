"""
配置模块 - 商品管理相关配置
"""
import os

# 后端 API 配置
BACKEND_API_BASE_URL = os.environ.get("BACKEND_API_BASE_URL", "http://localhost:8080")

# 飞书表格配置（创建表后自动更新）
FEISHU_APP_TOKEN = os.environ.get("FEISHU_PRODUCT_APP_TOKEN", "")
FEISHU_TABLE_ID = os.environ.get("FEISHU_PRODUCT_TABLE_ID", "")

# 字段名称定义
FIELD_NAMES = {
    "product_name": "商品名称",
    "sku_name": "SKU名称",
    "category_name": "分类名称",
    "channel_price": "渠道价格",
    "main_image": "主图URL",
    "detail_images": "详情图URL",
    "description": "商品描述",
    "specs": "规格说明",
    "is_recommended": "是否推荐",
    "sort_order": "排序权重",
    "target_status": "目标状态",
    "system_id": "系统商品ID",
    "sync_status": "同步状态",
    "sync_time": "同步时间",
    "error_message": "错误信息",
}

# 状态映射：飞书 -> API
STATUS_MAPPING = {
    "草稿": "DRAFT",
    "上架": "ACTIVE",
    "下架": "INACTIVE",
}

# 反向状态映射：API -> 飞书
STATUS_MAPPING_REVERSE = {v: k for k, v in STATUS_MAPPING.items()}

# 同步状态选项
SYNC_STATUS_OPTIONS = ["待同步", "已同步", "失败"]

# 目标状态选项
TARGET_STATUS_OPTIONS = ["草稿", "上架", "下架"]

# 表格字段定义（用于创建表格）
TABLE_FIELDS = [
    {"field_name": "商品名称", "type": 1, "ui_type": "Text"},
    {"field_name": "SKU名称", "type": 1, "ui_type": "Text"},
    {
        "field_name": "分类名称",
        "type": 3,
        "ui_type": "SingleSelect",
        "property": {"options": []},  # 动态从系统获取
    },
    {"field_name": "渠道价格", "type": 2, "ui_type": "Number"},
    {"field_name": "主图URL", "type": 15, "ui_type": "Url"},
    {"field_name": "详情图URL", "type": 1, "ui_type": "Text"},
    {"field_name": "商品描述", "type": 1, "ui_type": "Text"},
    {"field_name": "规格说明", "type": 1, "ui_type": "Text"},
    {"field_name": "是否推荐", "type": 7, "ui_type": "Checkbox"},
    {"field_name": "排序权重", "type": 2, "ui_type": "Number"},
    {
        "field_name": "目标状态",
        "type": 3,
        "ui_type": "SingleSelect",
        "property": {
            "options": [
                {"name": "草稿", "color": 0},
                {"name": "上架", "color": 1},
                {"name": "下架", "color": 2},
            ]
        },
    },
    {"field_name": "系统商品ID", "type": 1, "ui_type": "Text"},
    {
        "field_name": "同步状态",
        "type": 3,
        "ui_type": "SingleSelect",
        "property": {
            "options": [
                {"name": "待同步", "color": 0},
                {"name": "已同步", "color": 1},
                {"name": "失败", "color": 2},
            ]
        },
    },
    {"field_name": "同步时间", "type": 5, "ui_type": "DateTime"},
    {"field_name": "错误信息", "type": 1, "ui_type": "Text"},
]

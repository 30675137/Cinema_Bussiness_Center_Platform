"""
后端 API 客户端 - 封装渠道商品相关 API 调用
"""
import requests
from typing import Dict, List, Optional, Any
from .config import BACKEND_API_BASE_URL


class ChannelProductAPI:
    """渠道商品 API 客户端"""

    def __init__(self, base_url: str = None):
        self.base_url = base_url or BACKEND_API_BASE_URL

    def _request(self, method: str, path: str, **kwargs) -> Dict:
        """发送 HTTP 请求"""
        url = f"{self.base_url}{path}"
        resp = requests.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp.json()

    # ========== SKU 相关 ==========

    def find_sku_by_name(self, name: str) -> Dict:
        """通过名称查询 SKU"""
        result = self._request("GET", "/api/skus", params={"name": name})
        data = result.get("data", [])
        if not data:
            raise ValueError(f"SKU '{name}' 不存在")
        # 如果返回多个，取第一个完全匹配的
        for item in data:
            if item.get("name") == name:
                return item
        return data[0]

    def list_skus(self, page: int = 0, size: int = 100) -> List[Dict]:
        """获取 SKU 列表"""
        result = self._request("GET", "/api/skus", params={"page": page, "size": size})
        return result.get("data", {}).get("content", [])

    # ========== 分类相关 ==========

    def find_category_by_name(self, name: str) -> Dict:
        """通过名称查询菜单分类"""
        result = self._request("GET", "/api/admin/menu-categories")
        data = result.get("data", [])
        for item in data:
            if item.get("displayName") == name or item.get("name") == name:
                return item
        raise ValueError(f"分类 '{name}' 不存在")

    def list_categories(self) -> List[Dict]:
        """获取所有菜单分类"""
        result = self._request("GET", "/api/admin/menu-categories")
        return result.get("data", [])

    # ========== 渠道商品相关 ==========

    def create_product(self, data: Dict) -> Dict:
        """
        创建渠道商品

        注意：后端使用 snake_case 命名策略，请求体字段必须使用下划线格式

        正确格式示例:
        {
            "sku_id": "550e8400-...",
            "category_id": "fd02eba4-...",
            "display_name": "青岛啤酒",
            "channel_price": 1800,  # 单位: 分
            "is_recommended": false,
            "sort_order": 85,
            "status": "ACTIVE",
            "channel_type": "MINI_PROGRAM"
        }
        """
        result = self._request("POST", "/api/channel-products", json=data)
        return result

    def build_create_request(
        self,
        sku_id: str,
        category_id: str,
        display_name: str,
        price_yuan: float,
        description: str = None,
        is_recommended: bool = False,
        sort_order: int = 0,
        status: str = "ACTIVE"
    ) -> Dict:
        """
        构建创建商品请求体（自动转换为正确格式）

        Args:
            sku_id: SKU UUID
            category_id: 分类 UUID
            display_name: 商品名称
            price_yuan: 价格（元），会自动转换为分
            description: 商品描述
            is_recommended: 是否推荐
            sort_order: 排序权重
            status: 状态 (ACTIVE/INACTIVE/DRAFT)

        Returns:
            符合后端 snake_case 格式的请求体
        """
        return {
            "sku_id": sku_id,
            "category_id": category_id,
            "display_name": display_name,
            "channel_price": int(price_yuan * 100),  # 元转分
            "description": description,
            "is_recommended": is_recommended,
            "sort_order": sort_order,
            "status": status,
            "channel_type": "MINI_PROGRAM"
        }

    def update_product(self, product_id: str, data: Dict) -> Dict:
        """更新渠道商品"""
        result = self._request("PUT", f"/api/channel-products/{product_id}", json=data)
        return result

    def update_status(self, product_id: str, status: str) -> Dict:
        """修改商品状态（上架/下架）"""
        result = self._request(
            "PATCH",
            f"/api/channel-products/{product_id}/status",
            json={"status": status}
        )
        return result

    def get_product(self, product_id: str) -> Dict:
        """获取商品详情"""
        result = self._request("GET", f"/api/channel-products/{product_id}")
        return result.get("data", {})

    def list_products(
        self,
        page: int = 0,
        size: int = 100,
        status: str = None,
        category_id: str = None
    ) -> Dict:
        """获取商品列表"""
        params = {"page": page, "size": size}
        if status:
            params["status"] = status
        if category_id:
            params["categoryId"] = category_id
        result = self._request("GET", "/api/channel-products", params=params)
        return result.get("data", {})

    def delete_product(self, product_id: str) -> Dict:
        """删除商品（软删除）"""
        result = self._request("DELETE", f"/api/channel-products/{product_id}")
        return result

    def find_product_by_sku(self, sku_id: str) -> Optional[Dict]:
        """通过 SKU ID 查找已存在的商品"""
        result = self.list_products(size=1000)
        products = result.get("content", [])
        for product in products:
            if product.get("skuId") == sku_id:
                return product
        return None


def test_connection() -> bool:
    """测试 API 连接"""
    try:
        api = ChannelProductAPI()
        api.list_categories()
        return True
    except Exception as e:
        print(f"API 连接测试失败: {e}")
        return False


if __name__ == "__main__":
    # 测试连接
    print(f"API Base URL: {BACKEND_API_BASE_URL}")
    if test_connection():
        print("✅ API 连接成功")

        api = ChannelProductAPI()

        # 测试获取分类
        categories = api.list_categories()
        print(f"\n分类列表 ({len(categories)} 个):")
        for cat in categories[:5]:
            print(f"  - {cat.get('displayName', cat.get('name'))}")
    else:
        print("❌ API 连接失败")

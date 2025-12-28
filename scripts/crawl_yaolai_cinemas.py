#!/usr/bin/env python3
"""
耀莱影城影厅信息爬虫脚本
功能：从猫眼电影获取耀莱影城的门店和影厅详细信息

数据来源：
1. 猫眼电影 API (通过 MaoYanApi 开源项目)
2. 直接爬取猫眼网页

使用方法：
1. 安装依赖: pip install requests beautifulsoup4 pandas
2. 运行脚本: python crawl_yaolai_cinemas.py
"""

import requests
import json
import time
import re
import os
from datetime import datetime
from typing import Dict, List, Optional, Any

# 请求头配置 - 模拟浏览器请求
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": "https://maoyan.com/",
    "Origin": "https://maoyan.com"
}

# 城市ID映射（猫眼使用的城市ID）
CITY_MAP = {
    "北京": {"ci": 1, "ct": "北京"},
    "上海": {"ci": 10, "ct": "上海"},
    "天津": {"ci": 20, "ct": "天津"},
    "广州": {"ci": 20, "ct": "广州"},
    "深圳": {"ci": 30, "ct": "深圳"},
    "成都": {"ci": 59, "ct": "成都"},
    "武汉": {"ci": 45, "ct": "武汉"},
    "济南": {"ci": 55, "ct": "济南"},
    "长春": {"ci": 60, "ct": "长春"},
    "大庆": {"ci": 354, "ct": "大庆"},
    "郑州": {"ci": 50, "ct": "郑州"},
    "黄冈": {"ci": 253, "ct": "黄冈"},
}


class MaoyanCrawler:
    """猫眼电影爬虫类"""
    
    # 猫眼 API 基础地址
    BASE_URL = "https://maoyan.com"
    API_BASE = "https://m.maoyan.com/ajax"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.results = []
        
    def search_cinemas(self, city_id: int, keyword: str = "耀莱") -> List[Dict]:
        """
        搜索影院
        
        Args:
            city_id: 城市ID
            keyword: 搜索关键词
            
        Returns:
            影院列表
        """
        url = f"{self.API_BASE}/search"
        params = {
            "ci": city_id,
            "kw": keyword,
            "limit": 50,
            "offset": 0
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                cinemas = data.get("cinemas", {}).get("list", [])
                print(f"  找到 {len(cinemas)} 家影院")
                return cinemas
        except Exception as e:
            print(f"  搜索影院失败: {e}")
        
        return []
    
    def get_cinema_detail(self, cinema_id: int) -> Optional[Dict]:
        """
        获取影院详情
        
        Args:
            cinema_id: 影院ID
            
        Returns:
            影院详情信息
        """
        url = f"{self.API_BASE}/cinemaDetail"
        params = {
            "cinemaId": cinema_id
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get("cinemaDetailModel", {})
        except Exception as e:
            print(f"  获取影院详情失败 (ID={cinema_id}): {e}")
        
        return None
    
    def get_cinema_shows(self, cinema_id: int, city_id: int) -> List[Dict]:
        """
        获取影院场次信息（包含影厅信息）
        
        Args:
            cinema_id: 影院ID
            city_id: 城市ID
            
        Returns:
            场次列表
        """
        url = f"{self.API_BASE}/cinemaShows"
        params = {
            "cinemaId": cinema_id,
            "ci": city_id
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get("showData", {}).get("movies", [])
        except Exception as e:
            print(f"  获取场次信息失败: {e}")
        
        return []
    
    def extract_hall_info_from_shows(self, shows: List[Dict]) -> List[Dict]:
        """
        从场次信息中提取影厅信息
        
        Args:
            shows: 场次列表
            
        Returns:
            影厅列表（去重）
        """
        halls = {}
        
        for movie in shows:
            movie_name = movie.get("nm", "")
            for show in movie.get("shows", []):
                for item in show.get("plist", []):
                    hall_name = item.get("th", "")
                    hall_type = item.get("tp", "")  # 影厅类型
                    lang = item.get("lang", "")  # 语言版本
                    version = item.get("version", "")  # 2D/3D等
                    
                    if hall_name and hall_name not in halls:
                        halls[hall_name] = {
                            "name": hall_name,
                            "type": self._parse_hall_type(hall_name, hall_type),
                            "features": self._extract_features(hall_name),
                            "sample_versions": set()
                        }
                    
                    if hall_name and version:
                        halls[hall_name]["sample_versions"].add(version)
        
        # 转换set为list
        for hall in halls.values():
            hall["sample_versions"] = list(hall["sample_versions"])
        
        return list(halls.values())
    
    def _parse_hall_type(self, hall_name: str, hall_type: str = "") -> str:
        """解析影厅类型"""
        name_lower = hall_name.lower()
        
        if "vip" in name_lower or "贵宾" in name_lower:
            return "VIP"
        elif "imax" in name_lower:
            return "IMAX"
        elif "杜比" in name_lower or "dolby" in name_lower:
            return "Dolby"
        elif "4dx" in name_lower:
            return "4DX"
        elif "screenx" in name_lower:
            return "ScreenX"
        elif "激光" in name_lower:
            return "Laser"
        elif "巨幕" in name_lower:
            return "BigScreen"
        elif "党建" in name_lower or "party" in name_lower:
            return "Party"
        elif "包厢" in name_lower or "私人" in name_lower:
            return "CP"
        else:
            return "Public"
    
    def _extract_features(self, hall_name: str) -> List[str]:
        """提取影厅特色标签"""
        features = []
        name_lower = hall_name.lower()
        
        feature_map = {
            "imax": "IMAX巨幕",
            "杜比": "杜比音效",
            "dolby": "杜比音效",
            "4dx": "4DX动感",
            "screenx": "ScreenX环幕",
            "激光": "激光放映",
            "巨幕": "巨幕厅",
            "vip": "VIP尊享",
            "贵宾": "贵宾服务",
            "全景声": "全景声",
            "atmos": "杜比全景声",
            "真皮": "真皮座椅",
            "沙发": "沙发座椅",
            "情侣": "情侣座",
        }
        
        for key, feature in feature_map.items():
            if key in name_lower:
                features.append(feature)
        
        return features if features else ["标准影厅"]
    
    def crawl_yaolai_cinemas(self) -> List[Dict]:
        """
        爬取所有耀莱影城信息
        
        Returns:
            所有耀莱影城的详细信息列表
        """
        all_cinemas = []
        
        print("=" * 60)
        print("开始爬取耀莱影城信息")
        print("=" * 60)
        
        for city_name, city_info in CITY_MAP.items():
            print(f"\n📍 正在搜索 {city_name} 的耀莱影城...")
            
            # 搜索该城市的耀莱影城
            cinemas = self.search_cinemas(city_info["ci"], "耀莱成龙")
            
            for cinema in cinemas:
                cinema_id = cinema.get("id")
                cinema_name = cinema.get("nm", "")
                
                if "耀莱" not in cinema_name:
                    continue
                
                print(f"  🎬 正在获取 {cinema_name} 的详细信息...")
                
                # 获取影院详情
                detail = self.get_cinema_detail(cinema_id)
                
                # 获取场次信息以提取影厅
                shows = self.get_cinema_shows(cinema_id, city_info["ci"])
                halls = self.extract_hall_info_from_shows(shows)
                
                cinema_info = {
                    "cinema_id": cinema_id,
                    "name": cinema_name,
                    "city": city_name,
                    "address": detail.get("addr", "") if detail else cinema.get("addr", ""),
                    "phone": detail.get("tel", "") if detail else "",
                    "hall_count": len(halls) if halls else cinema.get("hallCount", 0),
                    "halls": halls,
                    "features": detail.get("feature", []) if detail else [],
                    "latitude": cinema.get("lat", 0),
                    "longitude": cinema.get("lng", 0),
                    "crawl_time": datetime.now().isoformat()
                }
                
                all_cinemas.append(cinema_info)
                print(f"    ✓ 获取到 {len(halls)} 个影厅信息")
                
                # 避免请求过快
                time.sleep(0.5)
        
        print(f"\n{'=' * 60}")
        print(f"爬取完成！共获取 {len(all_cinemas)} 家耀莱影城信息")
        print("=" * 60)
        
        return all_cinemas
    
    def save_to_json(self, data: List[Dict], filename: str = None):
        """保存数据到JSON文件"""
        if filename is None:
            filename = f"yaolai_cinemas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        filepath = os.path.join(os.path.dirname(__file__), "..", "docs", "database", filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"📁 数据已保存到: {filepath}")
        return filepath
    
    def generate_sql(self, data: List[Dict]) -> str:
        """
        生成SQL插入语句
        
        Args:
            data: 影院数据列表
            
        Returns:
            SQL语句字符串
        """
        sql_lines = [
            "-- ============================================================",
            "-- 自动生成: 耀莱影城影厅数据",
            f"-- 生成时间: {datetime.now().isoformat()}",
            "-- 数据来源: 猫眼电影",
            "-- ============================================================",
            ""
        ]
        
        for cinema in data:
            cinema_name = cinema.get("name", "")
            store_code = self._generate_store_code(cinema_name)
            
            sql_lines.append(f"-- {cinema_name} 的影厅")
            
            for idx, hall in enumerate(cinema.get("halls", []), 1):
                hall_name = hall.get("name", f"影厅{idx}")
                hall_type = hall.get("type", "Public")
                features = hall.get("features", [])
                
                # 估算容量（根据影厅类型）
                capacity = self._estimate_capacity(hall_type, hall_name)
                
                tags_str = "{" + ",".join(f'"{f}"' for f in features) + "}" if features else "NULL"
                
                sql = f"""INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-{store_code}-{idx:02d}', '{hall_name}', '{hall_type}', {capacity}, '{tags_str}'::text[], 'active'
FROM stores s WHERE s.name LIKE '%{cinema_name.split('(')[0].strip()}%'
ON CONFLICT DO NOTHING;
"""
                sql_lines.append(sql)
            
            sql_lines.append("")
        
        return "\n".join(sql_lines)
    
    def _generate_store_code(self, cinema_name: str) -> str:
        """生成门店代码"""
        # 从影城名称提取简码
        name_parts = cinema_name.replace("耀莱成龙国际影城", "").replace("(", "").replace(")", "").replace("店", "")
        pinyin_map = {
            "五棵松": "WKS", "马连道": "MLD", "王府井": "WFJ",
            "上海真北路": "SHZB", "上海曹杨路": "SHCY",
            "天津友谊路": "TJYY", "长春湖西路": "CCHX",
            "大庆银浪": "DQYL", "武汉八大家": "WHBD",
            "黄冈": "HG", "济南领秀城": "JNLX",
            "成都新津": "CDXJ", "郑州锦艺城": "ZZJY"
        }
        
        for key, code in pinyin_map.items():
            if key in name_parts:
                return code
        
        return name_parts[:4].upper() if name_parts else "UNKNOWN"
    
    def _estimate_capacity(self, hall_type: str, hall_name: str) -> int:
        """根据影厅类型估算容量"""
        capacity_map = {
            "VIP": 30,
            "CP": 20,
            "IMAX": 400,
            "Dolby": 200,
            "4DX": 120,
            "ScreenX": 150,
            "Laser": 180,
            "BigScreen": 300,
            "Party": 50,
            "Public": 150
        }
        
        base_capacity = capacity_map.get(hall_type, 150)
        
        # 从名称中提取数字作为参考
        numbers = re.findall(r'\d+', hall_name)
        if numbers:
            # 如果影厅名含数字，可能表示座位数或厅号
            num = int(numbers[0])
            if num > 50:  # 可能是座位数
                return num
        
        return base_capacity


def main():
    """主函数"""
    crawler = MaoyanCrawler()
    
    # 爬取数据
    cinemas = crawler.crawl_yaolai_cinemas()
    
    if cinemas:
        # 保存JSON
        crawler.save_to_json(cinemas, "yaolai_halls_data.json")
        
        # 生成SQL
        sql = crawler.generate_sql(cinemas)
        sql_path = os.path.join(
            os.path.dirname(__file__), "..", "docs", "database", 
            f"024-yaolai-halls-data.sql"
        )
        os.makedirs(os.path.dirname(sql_path), exist_ok=True)
        with open(sql_path, 'w', encoding='utf-8') as f:
            f.write(sql)
        print(f"📁 SQL已保存到: {sql_path}")
        
        # 打印统计信息
        print("\n📊 统计信息:")
        total_halls = sum(len(c.get("halls", [])) for c in cinemas)
        print(f"   总门店数: {len(cinemas)}")
        print(f"   总影厅数: {total_halls}")
        
        # 按城市统计
        print("\n📍 按城市分布:")
        city_stats = {}
        for cinema in cinemas:
            city = cinema.get("city", "未知")
            if city not in city_stats:
                city_stats[city] = {"stores": 0, "halls": 0}
            city_stats[city]["stores"] += 1
            city_stats[city]["halls"] += len(cinema.get("halls", []))
        
        for city, stats in city_stats.items():
            print(f"   {city}: {stats['stores']}家门店, {stats['halls']}个影厅")
    else:
        print("\n⚠️ 未获取到数据，可能需要检查网络或登录状态")


if __name__ == "__main__":
    main()

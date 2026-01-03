# Quickstart Guide: 小程序菜单与商品API集成（阶段一）

**@spec O007-miniapp-menu-api**

**Branch**: `O007-miniapp-menu-api` | **Date**: 2026-01-03

本文档提供小程序菜单与商品API集成功能的快速上手指南，帮助开发者快速搭建环境并开始开发。

---

## 📋 前置条件

### 系统要求

- **Node.js**: ≥ 18.0.0
- **npm**: ≥ 9.0.0
- **Java**: 17 (强制，符合规则07-backend-architecture.md)
- **Maven**: ≥ 3.8.0
- **Git**: ≥ 2.30.0

### 必需工具

- **微信开发者工具**: 用于小程序调试
- **浏览器**: Chrome/Firefox/Safari (用于H5调试)
- **IDE**: VS Code (推荐) / IntelliJ IDEA

---

## 🚀 环境搭建

### 1. 克隆代码库

```bash
# 克隆项目
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform

# 切换到功能分支
git checkout O007-miniapp-menu-api
```

### 2. 后端启动（Spring Boot）

```bash
# 进入后端目录
cd backend

# 安装依赖并启动
./mvnw clean install
./mvnw spring-boot:run

# 验证后端服务
curl http://localhost:8080/api/channel-products?salesChannel=MINI_PROGRAM_MENU
```

**预期输出**:
```json
{
  "success": true,
  "data": [...],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "timestamp": "2026-01-03T10:00:00Z"
}
```

### 3. 前端C端启动（Taro小程序）

```bash
# 进入Taro项目目录
cd miniapp-ordering-taro

# 安装依赖
npm install

# 启动H5开发服务器
npm run dev:h5
# 访问 http://localhost:10086

# 启动微信小程序（需要微信开发者工具）
npm run dev:weapp
# 然后在微信开发者工具中打开 miniapp-ordering-taro/dist 目录
```

---

## 📂 项目结构导览

### 核心文件位置

```
Cinema_Bussiness_Center_Platform/
│
├── specs/O007-miniapp-menu-api/          # 规格文档
│   ├── spec.md                           # 功能规格
│   ├── plan.md                           # 实施计划
│   ├── research.md                       # 技术研究
│   ├── data-model.md                     # 数据模型
│   ├── quickstart.md                     # 本文档
│   └── contracts/
│       └── api.yaml                      # API契约（OpenAPI 3.0）
│
├── miniapp-ordering-taro/                # Taro小程序前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── menu/                     # 菜单页面（本功能）
│   │   │   │   ├── index.tsx            # 主页面组件
│   │   │   │   └── index.module.scss    # 页面样式
│   │   │   └── ...
│   │   ├── components/                   # 组件库
│   │   │   ├── CategoryTabs/            # 分类导航组件
│   │   │   ├── ProductCard/             # 商品卡片组件
│   │   │   └── ProductList/             # 商品列表组件
│   │   ├── services/                     # API服务层
│   │   │   └── productService.ts        # 商品API封装
│   │   ├── stores/                       # Zustand状态管理
│   │   │   └── productListStore.ts      # 商品列表状态
│   │   ├── types/                        # TypeScript类型定义
│   │   │   └── product.ts               # 商品相关类型
│   │   └── utils/                        # 工具函数
│   │       ├── price.ts                 # 价格格式化
│   │       └── category.ts              # 分类映射
│   └── package.json
│
└── backend/                              # Spring Boot后端
    └── src/main/java/com/cinema/
        ├── channelproduct/               # 渠道商品模块
        │   ├── controller/
        │   │   └── ChannelProductController.java
        │   ├── service/
        │   │   └── ChannelProductService.java
        │   └── dto/
        │       └── ChannelProductDTO.java
        └── ...
```

---

## 🛠️ 开发工作流

### 阶段一：后端开发与验证（1-2天）

#### 任务1: API验证与测试

**目标**: 确认现有API满足前端需求

```bash
# 1. 启动后端服务
cd backend && ./mvnw spring-boot:run

# 2. 测试API端点（使用curl或Postman）

# 2.1 查询所有分类的商品
curl "http://localhost:8080/api/channel-products?salesChannel=MINI_PROGRAM_MENU&status=ACTIVE"

# 2.2 按分类筛选（咖啡类）
curl "http://localhost:8080/api/channel-products?salesChannel=MINI_PROGRAM_MENU&category=COFFEE&status=ACTIVE"

# 2.3 分页查询
curl "http://localhost:8080/api/channel-products?salesChannel=MINI_PROGRAM_MENU&page=1&pageSize=10"

# 2.4 按价格排序
curl "http://localhost:8080/api/channel-products?salesChannel=MINI_PROGRAM_MENU&sortBy=priceInCents&sortOrder=DESC"
```

**验收标准**:
- ✅ API返回格式符合 `contracts/api.yaml` 定义
- ✅ 所有必需字段（FR-005到FR-012）存在且有效
- ✅ 分页、排序、筛选功能正常
- ✅ 响应时间 P95 ≤ 1秒

#### 任务2: 准备测试数据

**目标**: 确保每个分类至少有5个测试商品

```sql
-- 使用Supabase SQL Editor插入测试数据
-- 或通过后端API POST /api/channel-products 批量导入

INSERT INTO channel_products (product_id, product_name, main_image_url, category, sales_channel, status, price_in_cents, sort_order, tags)
VALUES
  ('sku-coffee-001', '美式咖啡', 'https://cdn.example.com/americano.jpg', 'COFFEE', 'MINI_PROGRAM_MENU', 'ACTIVE', 2500, 100, '["热销"]'),
  ('sku-coffee-002', '拿铁咖啡', 'https://cdn.example.com/latte.jpg', 'COFFEE', 'MINI_PROGRAM_MENU', 'ACTIVE', 2800, 200, '["推荐"]'),
  -- ... 更多测试数据
```

#### 任务3: 性能测试

```bash
# 使用Apache Bench测试并发性能
ab -n 1000 -c 10 "http://localhost:8080/api/channel-products?salesChannel=MINI_PROGRAM_MENU"

# 预期结果:
# - Requests per second: ≥ 100
# - Time per request (mean): ≤ 100ms
# - Failed requests: 0
```

---

### 阶段二：前端集成与UI实现（3-5天）

#### 步骤1: 创建类型定义

```typescript
// miniapp-ordering-taro/src/types/product.ts

/**
 * @spec O007-miniapp-menu-api
 * 商品相关类型定义
 */

export enum ChannelCategory {
  ALCOHOL = 'ALCOHOL',
  COFFEE = 'COFFEE',
  BEVERAGE = 'BEVERAGE',
  SNACK = 'SNACK',
  MEAL = 'MEAL',
  OTHER = 'OTHER'
}

export interface ChannelProductDTO {
  id: string;
  productId: string;
  productName: string;
  mainImageUrl: string | null;
  category: ChannelCategory;
  salesChannel: 'H5_MENU' | 'MINI_PROGRAM_MENU';
  status: 'ACTIVE' | 'INACTIVE';
  priceInCents: number;
  sortOrder: number;
  tags?: string[];
  stockStatus?: 'AVAILABLE' | 'OUT_OF_STOCK';
}

export interface ProductCard {
  id: string;
  name: string;
  imageUrl: string;
  priceText: string;
  tags: string[];
  minSalesUnit: string;
  isAvailable: boolean;
  category: ChannelCategory;
}
```

#### 步骤2: 创建API服务

```typescript
// miniapp-ordering-taro/src/services/productService.ts

/**
 * @spec O007-miniapp-menu-api
 * 商品API服务
 */

import Taro from '@tarojs/taro';
import { ChannelProductDTO, ChannelCategory } from '@/types/product';

export interface ProductListParams {
  category?: ChannelCategory;
  salesChannel: 'MINI_PROGRAM_MENU';
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
  timestamp: string;
}

const BASE_URL = process.env.TARO_ENV === 'weapp'
  ? 'https://api.cinema-platform.com'  // 生产环境
  : 'http://localhost:8080';            // 本地开发

export const fetchProducts = async (
  params: ProductListParams
): Promise<ApiResponse<ChannelProductDTO[]>> => {
  const response = await Taro.request({
    url: `${BASE_URL}/api/channel-products`,
    method: 'GET',
    data: params,
    header: {
      'Content-Type': 'application/json'
    }
  });

  if (response.statusCode !== 200) {
    throw new Error(`API请求失败: ${response.statusCode}`);
  }

  return response.data as ApiResponse<ChannelProductDTO[]>;
};
```

#### 步骤3: 创建状态管理Store

```typescript
// miniapp-ordering-taro/src/stores/productListStore.ts

/**
 * @spec O007-miniapp-menu-api
 * 商品列表状态管理
 */

import { create } from 'zustand';
import { ChannelCategory } from '@/types/product';

interface ProductListState {
  selectedCategory: ChannelCategory | null;
  setSelectedCategory: (category: ChannelCategory | null) => void;
  reset: () => void;
}

export const useProductListStore = create<ProductListState>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  reset: () => set({ selectedCategory: null })
}));
```

#### 步骤4: 创建工具函数

```typescript
// miniapp-ordering-taro/src/utils/price.ts

/**
 * @spec O007-miniapp-menu-api
 * 价格格式化工具
 */

export interface PriceFormatOptions {
  showDecimals?: boolean;
  showCurrency?: boolean;
  freeText?: string;
}

export const formatPrice = (
  priceInCents: number,
  options: PriceFormatOptions = {}
): string => {
  const { showDecimals = false, showCurrency = true, freeText = '免费' } = options;

  if (priceInCents === 0) return freeText;

  const priceInYuan = priceInCents / 100;
  const formattedPrice = showDecimals
    ? priceInYuan.toFixed(2)
    : Math.floor(priceInYuan).toString();

  return showCurrency ? `¥${formattedPrice}` : formattedPrice;
};
```

```typescript
// miniapp-ordering-taro/src/utils/category.ts

/**
 * @spec O007-miniapp-menu-api
 * 分类映射工具
 */

import { ChannelCategory } from '@/types/product';

export const CATEGORY_DISPLAY_NAMES: Record<ChannelCategory, string> = {
  [ChannelCategory.ALCOHOL]: '经典特调',
  [ChannelCategory.COFFEE]: '精品咖啡',
  [ChannelCategory.BEVERAGE]: '经典饮品',
  [ChannelCategory.SNACK]: '主厨小食',
  [ChannelCategory.MEAL]: '精品餐食',
  [ChannelCategory.OTHER]: '其他商品'
};

export const getCategoryDisplayName = (category: ChannelCategory): string => {
  return CATEGORY_DISPLAY_NAMES[category];
};
```

#### 步骤5: 创建组件

**组件1: 分类导航 (CategoryTabs)**

```tsx
// miniapp-ordering-taro/src/components/CategoryTabs/index.tsx

/**
 * @spec O007-miniapp-menu-api
 * 分类导航Tab组件
 */

import React from 'react';
import { View, Text } from '@tarojs/components';
import { ChannelCategory } from '@/types/product';
import { getCategoryDisplayName } from '@/utils/category';
import './index.module.scss';

interface CategoryTabsProps {
  categories: ChannelCategory[];
  activeCategory: ChannelCategory | null;
  onCategoryChange: (category: ChannelCategory) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <View className="category-tabs">
      {categories.map(category => (
        <View
          key={category}
          className={`tab-item ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryChange(category)}
        >
          <Text className="tab-label">{getCategoryDisplayName(category)}</Text>
        </View>
      ))}
    </View>
  );
};
```

**组件2: 商品卡片 (ProductCard)**

```tsx
// miniapp-ordering-taro/src/components/ProductCard/index.tsx

/**
 * @spec O007-miniapp-menu-api
 * 商品卡片组件
 */

import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import { ProductCard as ProductCardType } from '@/types/product';
import './index.module.scss';

interface ProductCardProps {
  product: ProductCardType;
  onClick?: (product: ProductCardType) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <View
      className="product-card"
      onClick={() => onClick?.(product)}
    >
      <Image
        className="product-image"
        src={product.imageUrl}
        mode="aspectFill"
        lazyLoad
      />

      <View className="product-info">
        <Text className="product-name">{product.name}</Text>

        {product.tags.length > 0 && (
          <View className="tags">
            {product.tags.map(tag => (
              <Text key={tag} className="tag">{tag}</Text>
            ))}
          </View>
        )}

        <View className="product-footer">
          <Text className="price">{product.priceText}</Text>
          <Text className="unit">{product.minSalesUnit}</Text>
        </View>

        {!product.isAvailable && (
          <View className="unavailable-mask">
            <Text>暂时缺货</Text>
          </View>
        )}
      </View>
    </View>
  );
};
```

**组件3: 商品列表页面 (MenuPage)**

```tsx
// miniapp-ordering-taro/src/pages/menu/index.tsx

/**
 * @spec O007-miniapp-menu-api
 * 菜单页面（商品列表）
 */

import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { useQuery } from '@tanstack/react-query';
import { CategoryTabs } from '@/components/CategoryTabs';
import { ProductCard } from '@/components/ProductCard';
import { useProductListStore } from '@/stores/productListStore';
import { fetchProducts } from '@/services/productService';
import { ChannelCategory } from '@/types/product';
import { formatPrice } from '@/utils/price';
import './index.module.scss';

const MenuPage: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useProductListStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => fetchProducts({
      salesChannel: 'MINI_PROGRAM_MENU',
      category: selectedCategory || undefined,
      status: 'ACTIVE'
    }),
    staleTime: 5 * 60 * 1000 // 5分钟缓存
  });

  const productCards = data?.data.map(dto => ({
    id: dto.id,
    name: dto.productName,
    imageUrl: dto.mainImageUrl || '/images/placeholder.png',
    priceText: formatPrice(dto.priceInCents),
    tags: dto.tags || [],
    minSalesUnit: '1份', // Phase 1硬编码
    isAvailable: dto.stockStatus !== 'OUT_OF_STOCK',
    category: dto.category
  })) || [];

  const categories = [
    ChannelCategory.ALCOHOL,
    ChannelCategory.COFFEE,
    ChannelCategory.BEVERAGE,
    ChannelCategory.SNACK
  ];

  return (
    <View className="menu-page">
      <CategoryTabs
        categories={categories}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {isLoading && <View className="loading">加载中...</View>}
      {isError && <View className="error">加载失败，请重试</View>}

      <View className="product-list">
        {productCards.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => console.log('点击商品', product.id)}
          />
        ))}
      </View>
    </View>
  );
};

export default MenuPage;
```

---

## 🧪 测试指南

### 单元测试

```bash
# 运行单元测试
cd miniapp-ordering-taro
npm run test

# 运行测试覆盖率
npm run test:coverage
```

**示例测试用例**:

```typescript
// miniapp-ordering-taro/src/utils/__tests__/price.test.ts

import { formatPrice } from '../price';

describe('formatPrice', () => {
  it('应该正确格式化价格（分转元）', () => {
    expect(formatPrice(2500)).toBe('¥25');
    expect(formatPrice(2580)).toBe('¥25'); // 默认不显示小数
  });

  it('应该支持显示小数位', () => {
    expect(formatPrice(2580, { showDecimals: true })).toBe('¥25.80');
  });

  it('应该支持零价格显示为"免费"', () => {
    expect(formatPrice(0)).toBe('免费');
    expect(formatPrice(0, { freeText: 'Free' })).toBe('Free');
  });
});
```

### 集成测试

```bash
# 启动后端和前端
cd backend && ./mvnw spring-boot:run &
cd miniapp-ordering-taro && npm run dev:h5

# 手动测试清单:
# ✅ 分类Tab切换流畅
# ✅ 商品列表正确显示
# ✅ 价格格式化正确（¥25，不显示小数）
# ✅ 缺货商品显示"暂时缺货"遮罩
# ✅ 图片懒加载生效
# ✅ 网络错误时显示重试按钮
```

---

## 📊 性能优化检查

### 检查清单

- [ ] **TanStack Query缓存**: `staleTime: 5 * 60 * 1000` (5分钟)
- [ ] **图片懒加载**: `<Image lazyLoad />`
- [ ] **防抖处理**: 分类切换防抖300ms（如需）
- [ ] **虚拟列表**: 商品数量 > 50 时启用 (可选)
- [ ] **API响应时间**: P95 ≤ 1秒

### 性能测试命令

```bash
# Chrome DevTools Performance分析
# 1. 打开 http://localhost:10086
# 2. 打开Chrome DevTools → Performance
# 3. 点击Record → 操作页面 → 停止
# 4. 检查指标:
#    - First Contentful Paint (FCP): < 1.5s
#    - Largest Contentful Paint (LCP): < 2.5s
#    - Time to Interactive (TTI): < 3.0s
```

---

## 🐛 常见问题排查

### 问题1: API请求失败 (Network Error)

**症状**: 控制台显示 `Network request failed`

**排查步骤**:
```bash
# 1. 确认后端服务是否启动
curl http://localhost:8080/api/channel-products?salesChannel=MINI_PROGRAM_MENU

# 2. 检查跨域配置（仅H5开发环境）
# 后端需要添加CORS配置
```

**解决方案**:
```java
// backend/src/main/java/com/cinema/config/CorsConfig.java

@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
          .allowedOrigins("http://localhost:10086") // Taro H5开发服务器
          .allowedMethods("GET", "POST", "PUT", "DELETE");
      }
    };
  }
}
```

### 问题2: 微信小程序不支持localhost

**症状**: 小程序真机调试时无法访问 `http://localhost:8080`

**解决方案**:
```typescript
// 方案1: 使用本地IP地址
const BASE_URL = process.env.TARO_ENV === 'weapp'
  ? 'http://192.168.1.100:8080'  // 替换为本机IP
  : 'http://localhost:8080';

// 方案2: 使用内网穿透工具（推荐ngrok）
# 启动ngrok
ngrok http 8080

# 使用生成的公网URL
const BASE_URL = 'https://abc123.ngrok.io';
```

### 问题3: 图片显示失败

**症状**: 商品图片显示为空白

**排查步骤**:
```bash
# 1. 检查图片URL是否有效
curl -I https://cdn.example.com/coffee.jpg

# 2. 检查微信小程序域名白名单
# 微信开发者工具 → 详情 → 服务器域名 → 添加 cdn.example.com
```

**临时解决方案**:
```typescript
// 使用占位图
const imageUrl = dto.mainImageUrl || '/images/placeholder.png';
```

---

## 📚 相关文档

- **功能规格**: [spec.md](./spec.md)
- **数据模型**: [data-model.md](./data-model.md)
- **API契约**: [contracts/api.yaml](./contracts/api.yaml)
- **技术研究**: [research.md](./research.md)
- **实施计划**: [plan.md](./plan.md)

---

## 🎯 下一步

完成本功能后，可以继续开发：

- **Phase 2**: 商品详情页 (`O008-miniapp-product-detail`)
- **Phase 3**: 购物车功能 (`O009-miniapp-shopping-cart`)
- **Phase 4**: 订单提交与支付 (`O010-miniapp-order-checkout`)

---

**版本**: 1.0.0 | **最后更新**: 2026-01-03

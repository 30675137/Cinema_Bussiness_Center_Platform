# Quickstart Guide: 小程序商品列表开发快速上手

**Feature**: O009-miniapp-product-list
**Date**: 2026-01-05
**Status**: Draft

本文档帮助开发者快速搭建本地开发环境，了解核心开发模式，并开始小程序商品列表功能的开发和调试。

---

## 📋 前置条件

### 必需工具

| 工具 | 版本要求 | 下载链接 | 用途 |
|------|---------|---------|------|
| Node.js | ≥ 16.x | https://nodejs.org/ | JavaScript 运行时 |
| npm | ≥ 8.x | (Node.js 自带) | 包管理器 |
| 微信开发者工具 | 最新稳定版 | https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html | 小程序调试 |
| Git | ≥ 2.30 | https://git-scm.com/ | 版本控制 |

### 可选工具

| 工具 | 用途 |
|------|------|
| VS Code | 代码编辑器（推荐插件：Taro、ESLint、Prettier） |
| Chrome DevTools | H5 调试 |
| Postman | API 测试 |

---

## 🚀 快速开始（5分钟）

### 步骤 1：克隆仓库并切换分支

```bash
# 克隆项目（如果尚未克隆）
git clone https://github.com/your-org/Cinema_Bussiness_Center_Platform.git
cd Cinema_Bussiness_Center_Platform

# 切换到功能分支
git checkout feat/O009-miniapp-product-list

# 或创建新分支（如果尚不存在）
git checkout -b feat/O009-miniapp-product-list
```

### 步骤 2：安装依赖

```bash
# 进入 Taro 项目目录
cd hall-reserve-taro

# 安装依赖（首次需要几分钟）
npm install

# 验证安装是否成功
npm run --version  # 应显示 Taro CLI 版本
```

### 步骤 3：启动开发服务器

#### 方式 A：H5 模式（推荐初期开发）

```bash
# 启动 H5 开发服务器
npm run dev:h5

# 成功后访问 http://localhost:10086
# 浏览器会自动打开并显示小程序页面
```

#### 方式 B：微信小程序模式

```bash
# 启动微信小程序编译（监听文件变化）
npm run dev:weapp

# 编译完成后，打开微信开发者工具
# 导入项目：选择 hall-reserve-taro/dist 目录
```

### 步骤 4：验证环境

访问 H5 页面（http://localhost:10086）或微信开发者工具，检查：

- [ ] 页面能正常加载（无白屏）
- [ ] 控制台无致命错误
- [ ] 网络请求能够发送（可能返回 401，正常）

如果以上检查通过，说明开发环境已就绪！

---

## 🛠️ 开发工作流

### 典型开发流程

```
1. 创建组件/页面 → 2. 编写业务逻辑 → 3. 调用 API → 4. 本地测试 → 5. 提交代码
```

### 示例：创建商品卡片组件

#### 步骤 1：创建组件文件

```bash
cd hall-reserve-taro/src/components
mkdir ProductCard
cd ProductCard
touch index.tsx index.module.scss ProductCard.test.tsx
```

#### 步骤 2：编写组件代码

**`index.tsx`**:

```tsx
/**
 * @spec O009-miniapp-product-list
 * 商品卡片组件
 */
import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import './index.module.scss'

export interface ProductCardProps {
  id: string
  name: string
  price: string
  imageUrl: string
  isRecommended: boolean
  badge?: string
  onTap?: () => void
}

const DEFAULT_IMAGE = '/assets/images/placeholder-product.png'

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  isRecommended,
  badge,
  onTap,
}) => {
  const [imageSrc, setImageSrc] = React.useState(imageUrl || DEFAULT_IMAGE)

  const handleImageError = () => {
    setImageSrc(DEFAULT_IMAGE)
  }

  return (
    <View className="product-card" onClick={onTap}>
      {badge && <View className="product-card__badge">{badge}</View>}

      <Image
        src={imageSrc}
        mode="aspectFill"
        lazyLoad
        onError={handleImageError}
        className="product-card__image"
      />

      <View className="product-card__info">
        <Text className="product-card__name">{name}</Text>
        <Text className="product-card__price">{price}</Text>
      </View>
    </View>
  )
}
```

**`index.module.scss`**:

```scss
.product-card {
  position: relative;
  width: 340rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;

  &__badge {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    padding: 8rpx 16rpx;
    background: #ff6b6b;
    color: #fff;
    font-size: 24rpx;
    border-radius: 8rpx;
    z-index: 1;
  }

  &__image {
    width: 100%;
    height: 340rpx;
  }

  &__info {
    padding: 24rpx;
  }

  &__name {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 12rpx;
  }

  &__price {
    display: block;
    font-size: 32rpx;
    font-weight: 700;
    color: #ff6b6b;
  }
}
```

#### 步骤 3：编写单元测试

**`ProductCard.test.tsx`**:

```tsx
import { render, screen } from '@testing-library/react'
import { ProductCard } from './index'

describe('ProductCard', () => {
  it('应该正确渲染商品信息', () => {
    render(
      <ProductCard
        id="123"
        name="经典拿铁"
        price="¥28.00"
        imageUrl="https://example.com/image.jpg"
        isRecommended={true}
        badge="推荐"
      />
    )

    expect(screen.getByText('经典拿铁')).toBeInTheDocument()
    expect(screen.getByText('¥28.00')).toBeInTheDocument()
    expect(screen.getByText('推荐')).toBeInTheDocument()
  })

  it('应该使用占位图当图片加载失败', () => {
    const { container } = render(
      <ProductCard
        id="123"
        name="测试商品"
        price="¥10.00"
        imageUrl=""
        isRecommended={false}
      />
    )

    const image = container.querySelector('image')
    expect(image?.getAttribute('src')).toContain('placeholder-product.png')
  })
})
```

#### 步骤 4：本地运行测试

```bash
# 运行单元测试
npm run test

# 查看覆盖率
npm run test:coverage
```

---

## 🔌 API 集成示例

### 使用 TanStack Query 调用 API

#### 步骤 1：创建 API Service

**`hall-reserve-taro/src/services/productService.ts`**:

```typescript
/**
 * @spec O009-miniapp-product-list
 * 商品 API 服务
 */
import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API_URL || 'http://localhost:8080'

interface FetchProductsParams {
  categoryId?: string
  page?: number
  pageSize?: number
}

export const fetchProducts = async (params: FetchProductsParams) => {
  const token = Taro.getStorageSync('token')

  const response = await Taro.request({
    url: `${BASE_URL}/api/client/channel-products`,
    method: 'GET',
    header: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      channel: 'MINIAPP',
      ...params,
    },
  })

  if (response.statusCode === 401) {
    // Token 过期，触发静默登录
    await refreshToken()
    return fetchProducts(params) // 重试
  }

  if (response.statusCode !== 200) {
    throw new Error(response.data?.message || '获取商品列表失败')
  }

  return response.data
}

const refreshToken = async () => {
  const { code } = await Taro.login()
  const response = await Taro.request({
    url: `${BASE_URL}/api/auth/refresh`,
    method: 'POST',
    data: { code },
  })

  const { token } = response.data
  Taro.setStorageSync('token', token)
}
```

#### 步骤 2：创建自定义 Hook

**`hall-reserve-taro/src/hooks/useProducts.ts`**:

```typescript
/**
 * @spec O009-miniapp-product-list
 * 商品查询 Hook
 */
import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '../services/productService'

export const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['channel-products', categoryId],
    queryFn: () => fetchProducts({ categoryId, page: 1, pageSize: 20 }),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 60 * 1000, // 1分钟轮询
    retry: 2,
  })
}
```

#### 步骤 3：在页面中使用

**`hall-reserve-taro/src/pages/product-list/index.tsx`**:

```tsx
/**
 * @spec O009-miniapp-product-list
 * 商品列表页面
 */
import React, { useState } from 'react'
import { View, ScrollView } from '@tarojs/components'
import { useProducts } from '../../hooks/useProducts'
import { ProductCard } from '../../components/ProductCard'
import './index.module.scss'

const ProductListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { data, isLoading, isError, error } = useProducts(selectedCategory || undefined)

  if (isLoading) {
    return <View className="loading">加载中...</View>
  }

  if (isError) {
    return <View className="error">加载失败: {error.message}</View>
  }

  return (
    <ScrollView scrollY className="product-list">
      {data?.data.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.displayName}
          price={`¥${(product.basePrice / 100).toFixed(2)}`}
          imageUrl={product.mainImage}
          isRecommended={product.isRecommended}
          badge={product.isRecommended ? '推荐' : undefined}
        />
      ))}
    </ScrollView>
  )
}

export default ProductListPage
```

---

## 🐛 常见问题排查

### 问题 1：`npm install` 失败

**症状**: 安装依赖时报错

**解决方案**:

```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm cache clean --force

# 重新安装
npm install
```

### 问题 2：微信开发者工具无法打开项目

**症状**: 提示"project.config.json 不存在"

**解决方案**:

```bash
# 确保在正确的目录
cd hall-reserve-taro

# 检查配置文件
ls project.config.json  # 应该存在

# 导入项目时选择 hall-reserve-taro 目录（不是 dist 目录）
```

### 问题 3：API 请求返回 401

**症状**: 所有 API 请求返回 401 Unauthorized

**解决方案**:

```bash
# 检查 Token 是否存在
# 在微信开发者工具控制台执行：
Taro.getStorageSync('token')

# 如果没有 Token，需要先登录
# 调用登录接口或使用 Mock Token（开发环境）
Taro.setStorageSync('token', 'mock-token-for-development')
```

### 问题 4：图片无法显示

**症状**: 商品图片显示破损图标

**解决方案**:

1. **检查图片 URL**:
   - 确保 URL 以 `https://` 开头（小程序不支持 `http://`）
   - 检查 Supabase Storage 公开访问权限

2. **添加域名白名单**（微信小程序）:
   ```
   微信开发者工具 → 详情 → 本地设置 → 不校验合法域名（开发期间）
   ```

3. **使用占位图**:
   ```tsx
   const [imageSrc, setImageSrc] = useState(imageUrl || DEFAULT_IMAGE)
   ```

### 问题 5：样式不生效

**症状**: SCSS 样式未应用

**解决方案**:

1. **检查文件命名**:
   ```
   ✅ index.module.scss
   ❌ index.scss (Taro 3.x+ 需要 .module.scss)
   ```

2. **重新编译**:
   ```bash
   # 停止开发服务器
   Ctrl + C

   # 清除缓存并重新启动
   rm -rf .temp dist
   npm run dev:h5
   ```

---

## 📦 Mock 数据配置

### 使用 MSW 模拟 API（开发期间）

#### 步骤 1：安装 MSW（如果未安装）

```bash
npm install msw --save-dev
```

#### 步骤 2：创建 Mock Handler

**`hall-reserve-taro/src/mocks/handlers.ts`**:

```typescript
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/client/channel-products', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          {
            id: '660e8400-e29b-41d4-a716-446655440000',
            skuId: '770e8400-e29b-41d4-a716-446655440000',
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            displayName: '经典拿铁',
            basePrice: 2800,
            mainImage: 'https://storage.supabase.co/products/latte.jpg',
            isRecommended: true,
            sortOrder: 1,
            status: 'ACTIVE',
            channel: 'MINIAPP',
          },
        ],
        total: 1,
        hasNext: false,
        timestamp: new Date().toISOString(),
      })
    )
  }),
]
```

#### 步骤 3：启用 MSW（仅 H5 模式）

**`hall-reserve-taro/src/app.tsx`**:

```tsx
if (process.env.TARO_ENV === 'h5' && process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser')
  worker.start()
}
```

---

## 🎯 下一步

完成 Quickstart 后，建议按以下顺序继续开发：

1. **阅读规格文档**: `specs/O009-miniapp-product-list/spec.md`
2. **查看数据模型**: `specs/O009-miniapp-product-list/data-model.md`
3. **查看 API 契约**: `specs/O009-miniapp-product-list/contracts/api.yaml`
4. **查看技术决策**: `specs/O009-miniapp-product-list/research.md`
5. **开始实现任务**: 按照 `tasks.md` 任务分解逐步实现

---

## 📚 相关资源

| 资源 | 链接 |
|------|------|
| Taro 官方文档 | https://taro-docs.jd.com/ |
| TanStack Query 文档 | https://tanstack.com/query/latest |
| 微信小程序开发文档 | https://developers.weixin.qq.com/miniprogram/dev/ |
| Zustand 文档 | https://github.com/pmndrs/zustand |
| 项目 CLAUDE.md | `/CLAUDE.md` |

---

## ✅ 环境验证清单

开发环境搭建完成后，请确认以下检查项：

- [ ] Node.js 版本 ≥ 16.x (`node --version`)
- [ ] npm 版本 ≥ 8.x (`npm --version`)
- [ ] 依赖安装成功 (`ls node_modules | wc -l` 应返回 > 500)
- [ ] H5 开发服务器启动成功 (`npm run dev:h5`)
- [ ] 微信开发者工具能打开项目
- [ ] 浏览器能访问 http://localhost:10086
- [ ] 控制台无致命错误
- [ ] 单元测试可运行 (`npm run test`)

---

**文档完成日期**: 2026-01-05
**维护者**: Cinema Business Center Platform Team

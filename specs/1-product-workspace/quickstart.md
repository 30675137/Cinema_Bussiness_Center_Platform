# 商品工作台快速开始指南

**版本**: 1.0
**日期**: 2025-12-10
**分支**: 1-product-workspace

## 概述

商品工作台是耀莱影城商品管理中台的核心功能，采用单页双区布局设计，将商品列表与商品创建/编辑功能合并在同一页面，显著提升运营效率。

### 核心特性

- ✅ **单页双区布局**: 左侧列表 + 右侧编辑面板
- ✅ **状态驱动操作**: 根据商品状态智能显示操作按钮
- ✅ **强治理策略**: 已发布商品通过草稿版本编辑
- ✅ **批量操作**: 支持批量提交审核、导出等操作
- ✅ **实时验证**: SKU重复检查、必填项验证
- ✅ **权限控制**: 基于角色的细粒度权限管理

## 技术架构

### 前端技术栈
- **React 18** + **TypeScript 5.0**: 核心框架
- **Ant Design 6.x**: UI组件库
- **Tailwind CSS 4**: 样式框架
- **Vite 6**: 构建工具
- **React Router 6**: 路由管理
- **Zustand**: 客户端状态管理
- **TanStack Query**: 服务端状态管理
- **React Hook Form**: 表单处理
- **Zod**: 数据验证

### 后端技术栈
- **Node.js** + **Express**: API服务
- **TypeScript**: 类型安全
- **PostgreSQL**: 主数据库
- **Redis**: 缓存和会话
- **Casbin**: 权限控制
- **JWT**: 身份认证

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0

### 安装步骤

#### 1. 克隆项目
```bash
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform
```

#### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 返回根目录
cd ..
```

#### 3. 环境配置
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑环境配置
vim .env
```

环境配置示例：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinema_platform
DB_USER=postgres
DB_PASSWORD=password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# API配置
API_PORT=3000
API_BASE_URL=http://localhost:3000/v1

# 前端配置
FRONTEND_PORT=5173
FRONTEND_BASE_URL=http://localhost:5173
```

#### 4. 数据库初始化
```bash
# 创建数据库
createdb cinema_platform

# 运行数据库迁移
npm run db:migrate

# 初始化基础数据
npm run db:seed
```

#### 5. 启动开发服务器
```bash
# 启动后端服务
npm run dev:api

# 新开终端，启动前端服务
npm run dev:frontend
```

访问地址：
- 前端应用: http://localhost:5173
- API文档: http://localhost:3000/docs

## 功能使用指南

### 用户登录

1. 访问系统登录页面
2. 输入用户名和密码
3. 系统验证用户权限并跳转到工作台

### 商品工作台布局

```
┌─────────────────────────────────────────────────────────────┐
│ 顶部工具栏: 商品工作台 [+新建商品] [批量导入] [导出] [刷新]      │
├─────────────────────────────────────────────────────────────┤
│ 筛选区域                                                      │
│ [商品名称] [SKU] [类目] [状态] [物料类型] [清空] [搜索]          │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│     数据表格区域          │         编辑面板区域                │
│                         │                                   │
│ □ 商品名称   SKU  状态    │   商品基本信息                      │
│ □ 商品名称   SKU  状态    │   - 类目: [下拉选择]                │
│ □ 商品名称   SKU  状态    │   - 名称: [输入框]                  │
│ □ 商品名称   SKU  状态    │   - 状态: [标签显示]                │
│                         │                                   │
│                         │   库存信息                          │
│                         │   - 当前库存: [显示]                 │
│                         │   - 安全库存: [显示]                 │
│                         │                                   │
│                         │   价格信息                          │
│                         │   - 基础价格: [显示/编辑]             │
│                         │   - 成本价格: [权限控制显示]          │
│                         │                                   │
│                         │   [保存草稿] [提交审核] [发布] [关闭]  │
└─────────────────────────┴───────────────────────────────────┘
```

### 新建商品流程（30秒目标）

1. **点击"+新建商品"** → 右侧面板自动打开创建模式
2. **选择类目** → 系统自动带出允许的物料类型
3. **填写基础信息** → SKU、名称、基础价、库存等必填项
4. **点击"保存草稿"** → 系统保存并显示成功提示
5. **继续编辑或关闭面板** → 左侧列表显示新创建的商品

### 编辑商品流程

1. **在列表中点击商品行** → 右侧面板打开显示商品详情
2. **根据权限和状态** → 面板显示查看/编辑模式
3. **修改商品信息** → 实时验证字段有效性
4. **点击"保存草稿"** → 保存但不提交审核
5. **点击"提交审核"** → 提交审核流程

### 批量操作流程

1. **选择商品** → 勾选列表中的商品行（最多50个）
2. **批量操作条出现** → 显示可执行的批量操作
3. **选择操作类型** → 批量提交审核/批量导出等
4. **确认操作** → 系统执行并显示操作结果
5. **查看结果** → 显示成功/失败的详细情况

## 权限系统说明

### 角色定义

| 角色 | 权限范围 | 主要职责 |
|------|----------|----------|
| 运营人员 | 日常商品操作 | 创建、编辑草稿商品，提交审核 |
| 店长 | 门店级管理 | 本店商品管理，部分成本价查看 |
| 审核员 | 商品审核 | 审核商品，批准/驳回操作 |
| 管理员 | 系统管理 | 全部权限，删除商品等管理操作 |

### 权限控制示例

```typescript
// 前端权限控制
const ProductActions = ({ product }) => {
  const { hasPermission, hasRole } = usePermissions();

  return (
    <div>
      <AccessControl permissions={['product:edit']}>
        <Button onClick={() => editProduct(product)}>编辑</Button>
      </AccessControl>

      <AccessControl permissions={['product:delete']}>
        <Button danger onClick={() => deleteProduct(product)}>删除</Button>
      </AccessControl>

      <AccessControl roles={['admin']}>
        <Button onClick={() => viewAuditLog(product)}>审计日志</Button>
      </AccessControl>
    </div>
  );
};
```

### 敏感信息权限

| 数据类型 | 运营人员 | 店长 | 审核员 | 管理员 |
|----------|----------|------|--------|--------|
| 商品售价 | ✅ | ✅ | ✅ | ✅ |
| 库存数量 | ✅ | ✅ | ❌ | ✅ |
| 成本价格 | ❌ | ⚠️ | ❌ | ✅ |
| 操作日志 | ✅ | ✅ | ✅ | ✅ |

## API接口使用

### 认证流程

```typescript
// 用户登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'operator001',
    password: 'password123',
    rememberMe: true
  })
});

const { accessToken, user } = await loginResponse.json();

// 保存token
localStorage.setItem('accessToken', accessToken);
```

### 商品CRUD操作

```typescript
// 获取商品列表
const productsResponse = await fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const { data: products } = await productsResponse.json();

// 创建商品
const createProductResponse = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sku: 'GOODS001',
    name: '爆米花套餐',
    categoryId: 'cat001',
    unitId: 'unit001',
    materialType: 'finished_good',
    basePrice: 25.00,
    currentStock: 100
  })
});

const newProduct = await createProductResponse.json();
```

### 批量操作

```typescript
// 批量提交审核
const batchResponse = await fetch('/api/products/batch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productIds: ['prod001', 'prod002', 'prod003'],
    operation: 'submit_review'
  })
});

const { successCount, failedCount } = await batchResponse.json();
```

## 开发指南

### 组件结构

```
frontend/src/
├── components/
│   ├── common/              # 通用组件
│   │   ├── AccessControl.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── product/             # 商品相关组件
│   │   ├── ProductTable.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── ProductPanel.tsx
│   │   └── ProductActions.tsx
├── hooks/                   # 自定义Hooks
│   ├── usePermissions.ts
│   ├── useProducts.ts
│   └── useProductFilters.ts
├── stores/                  # 状态管理
│   ├── authStore.ts
│   ├── productStore.ts
│   └── permissionStore.ts
└── services/                # API服务
    ├── authService.ts
    ├── productService.ts
    └── categoryService.ts
```

### 状态管理示例

```typescript
// productStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ProductStore {
  products: Product[];
  selectedProducts: string[];
  filters: ProductFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  setSelectedProducts: (productIds: string[]) => void;
  updateFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
}

export const useProductStore = create<ProductStore>()(
  devtools((set, get) => ({
    products: [],
    selectedProducts: [],
    filters: {
      keyword: '',
      categoryId: '',
      status: '',
      materialType: ''
    },
    loading: false,
    error: null,

    setProducts: (products) => set({ products }),

    setSelectedProducts: (productIds) => set({ selectedProducts: productIds }),

    updateFilters: (newFilters) => set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

    clearFilters: () => set({
      filters: {
        keyword: '',
        categoryId: '',
        status: '',
        materialType: ''
      }
    })
  }))
);
```

### 表单验证

```typescript
// 产品表单验证
import { z } from 'zod';

const productSchema = z.object({
  sku: z.string()
    .regex(/^[A-Z0-9]{6,20}$/, 'SKU格式不正确')
    .min(1, 'SKU不能为空'),
  name: z.string()
    .min(2, '商品名称至少2个字符')
    .max(200, '商品名称不能超过200个字符'),
  categoryId: z.string().min(1, '请选择商品类目'),
  unitId: z.string().min(1, '请选择计量单位'),
  materialType: z.enum(['finished_good', 'raw_material', 'consumable']),
  basePrice: z.number()
    .min(0, '基础价格不能小于0')
    .max(999999.99, '基础价格不能超过999999.99'),
  currentStock: z.number()
    .min(0, '库存不能小于0')
    .max(999999.999, '库存不能超过999999.999'),
  barcode: z.string().regex(/^[0-9]{8,14}$/, '条码格式不正确').optional()
});

type ProductFormData = z.infer<typeof productSchema>;
```

## 测试指南

### 单元测试

```typescript
// __tests__/ProductService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { productService } from '../services/productService';

describe('ProductService', () => {
  it('should create product successfully', async () => {
    const mockProduct = {
      sku: 'TEST001',
      name: '测试商品',
      categoryId: 'cat001',
      basePrice: 10.00
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ data: mockProduct })
    });

    const result = await productService.create(mockProduct);
    expect(result).toEqual(mockProduct);
  });
});
```

### E2E测试

```typescript
// e2e/product-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('商品工作台', () => {
  test('新建商品流程', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid=username]', 'operator001');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');

    // 进入商品工作台
    await page.goto('/products');

    // 点击新建商品
    await page.click('[data-testid=create-product-button]');

    // 填写商品信息
    await page.selectOption('[data-testid=category-select]', 'cat001');
    await page.fill('[data-testid=product-name]', '测试商品');
    await page.fill('[data-testid=product-sku]', 'TEST001');
    await page.fill('[data-testid=base-price]', '25.00');

    // 保存草稿
    await page.click('[data-testid=save-draft-button]');

    // 验证保存成功
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('text=测试商品')).toBeVisible();
  });
});
```

## 部署指南

### 构建生产版本

```bash
# 构建前端
cd frontend
npm run build

# 构建完成后会在dist目录生成静态文件
ls -la dist/
```

### 环境变量配置

生产环境需要配置以下关键环境变量：

```env
# 生产数据库
DB_HOST=prod-db-host
DB_PORT=5432
DB_NAME=cinema_platform_prod
DB_USER=app_user
DB_PASSWORD=secure_password

# Redis集群
REDIS_CLUSTER_URL=redis://prod-redis-cluster:6379

# JWT密钥（生产环境必须使用强密钥）
JWT_SECRET=very-secure-jwt-secret-for-production
JWT_EXPIRES_IN=8h

# API配置
API_PORT=3000
NODE_ENV=production

# 文件上传配置
UPLOAD_BUCKET=cinema-platform-uploads
UPLOAD_REGION=us-east-1
```

### Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 故障排除

### 常见问题

**Q: 商品创建时提示SKU已存在**
A: 检查SKU是否重复，系统会自动校验SKU唯一性

**Q: 批量操作失败**
A: 检查选择的商品数量是否超过50个限制，并确认有相应操作权限

**Q: 权限控制不生效**
A: 检查用户角色配置和权限设置，确保前端和后端权限验证一致

**Q: 商品状态无法转换**
A: 查看状态流转规则，确认当前状态是否支持目标状态转换

### 性能优化建议

1. **列表查询优化**: 使用游标分页替代偏移分页
2. **缓存策略**: 缓存类目树结构和用户权限信息
3. **批量操作优化**: 分批处理大量数据，避免超时
4. **图片加载**: 使用CDN和懒加载优化图片显示

### 日志监控

```typescript
// 错误日志记录
import { logger } from './utils/logger';

try {
  await productService.create(productData);
} catch (error) {
  logger.error('创建商品失败', {
    error: error.message,
    stack: error.stack,
    data: productData,
    userId: currentUser.id
  });
  throw error;
}
```

## 支持与反馈

- 技术支持：dev-team@cinema-platform.com
- 问题反馈：在GitHub创建Issue
- 文档更新：提交Pull Request到项目仓库

---

**文档维护**: 开发团队
**最后更新**: 2025-12-10
**版本**: 1.0
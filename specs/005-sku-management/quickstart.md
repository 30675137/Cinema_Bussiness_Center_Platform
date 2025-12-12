# SKU 管理功能 - 快速开始指南

**功能分支**: `005-sku-management`  
**创建日期**: 2025-01-27  
**技术栈**: React 18.2.0 + TypeScript 5.0.4 + Ant Design 6.1.0

## 概述

SKU 管理功能提供完整的商品库存单元管理能力，包括列表查看、检索、新建/编辑、详情查看、状态切换和选择器功能。所有数据操作通过前端 Mock 服务实现，不依赖后端 API。

## 功能特性

### 核心功能

1. **SKU 列表查看** (User Story 1)
   - 关键字搜索（匹配编码、名称、条码）
   - 多条件筛选（SPU、品牌、类目、状态、库存管理）
   - 分页和排序
   - 状态标签显示

2. **SKU 创建** (User Story 2)
   - 多步骤表单（基础信息、单位条码、规格属性、其他配置）
   - 上下分离布局（顶部：步骤导航+操作按钮，底部：内容录入）
   - 状态设置区域（页面顶部）
   - 实时表单验证
   - 条码唯一性检查

3. **SKU 编辑** (User Story 3)
   - 预填充现有数据
   - 多步骤表单编辑
   - 支持步骤间快速跳转
   - 实时验证和错误提示

4. **SKU 详情查看** (User Story 4)
   - 完整信息展示
   - 关联信息入口（BOM、价格规则、库存、场景包）

5. **状态切换** (User Story 5)
   - 启用/停用操作
   - 确认对话框
   - 状态实时更新

6. **SKU 选择器** (User Story 6)
   - 可复用组件
   - 支持单选/多选模式
   - 搜索和筛选功能

## 技术架构

### 技术栈

- **框架**: React 18.2.0
- **语言**: TypeScript 5.0.4
- **UI组件库**: Ant Design 6.1.0
- **状态管理**: Zustand 5.0.9 (UI状态) + TanStack Query 5.90.12 (数据状态)
- **路由**: React Router 6
- **表单管理**: React Hook Form 7.68.0
- **数据验证**: Zod 4.1.13
- **样式**: Tailwind CSS 4.1.17
- **构建工具**: Vite 6.0.7

### 目录结构

```
frontend/Cinema_Operation_Admin/src/
├── components/sku/              # SKU组件
│   ├── SkuForm/                # 表单组件（多步骤）
│   ├── SkuDetail.tsx           # 详情组件
│   ├── SkuFilters.tsx          # 筛选组件
│   ├── SkuTable.tsx             # 表格组件
│   └── SkuSelector.tsx          # 选择器组件
├── pages/product/sku/          # SKU页面
│   └── SkuListPage.tsx         # 列表页
├── services/
│   └── mockSkuApi.ts           # Mock API服务
├── stores/
│   └── skuStore.ts             # Zustand状态管理
├── hooks/
│   └── useSku.ts               # TanStack Query Hooks
└── types/
    └── sku.ts                   # 类型定义
```

## 快速开始

### 1. 环境准备

确保已安装以下依赖：

```bash
# 检查Node.js版本（需要 >= 18）
node --version

# 检查npm版本
npm --version

# 进入前端目录
cd frontend/Cinema_Operation_Admin

# 安装依赖
npm install
```

### 2. 启动开发服务器

```bash
# 启动开发服务器（默认端口3000）
npm run dev

# 或指定端口
npm run dev -- --port 3003
```

### 3. 访问功能页面

在浏览器中访问：

```
http://localhost:3003/products/sku
```

### 4. 功能验证清单

#### 列表功能
- [ ] 页面正常加载，显示SKU列表
- [ ] 关键字搜索功能正常
- [ ] 筛选功能正常（SPU、品牌、类目、状态、库存管理）
- [ ] 分页功能正常
- [ ] 排序功能正常
- [ ] 状态标签正确显示

#### 创建功能
- [ ] 点击"新建SKU"按钮，打开表单
- [ ] 表单采用上下分离布局（顶部：步骤导航+操作按钮，底部：内容录入）
- [ ] 状态设置区域显示在页面顶部
- [ ] 选择SPU后，品牌和类目自动填充
- [ ] 必填字段验证正常
- [ ] 条码唯一性检查正常
- [ ] 保存成功后，列表刷新并显示新SKU

#### 编辑功能
- [ ] 点击"编辑"按钮，打开表单并预填充数据
- [ ] 可以切换步骤
- [ ] 修改数据后保存成功
- [ ] 条码重复检查正常（排除当前SKU）

#### 详情功能
- [ ] 点击"查看"按钮，打开详情视图
- [ ] 所有字段正确显示
- [ ] 关联信息入口显示（如适用）

#### 状态切换
- [ ] 点击"启用"/"停用"按钮，弹出确认对话框
- [ ] 确认后状态正确切换
- [ ] 列表状态实时更新

#### 选择器功能
- [ ] 在其他模块中调用SKU选择器
- [ ] 选择器支持搜索和筛选
- [ ] 单选/多选模式正常
- [ ] 选择后正确返回数据

## 数据模型

### SKU实体

主要字段：
- `id`: 唯一标识符
- `code`: SKU编码（系统自动生成）
- `name`: SKU名称
- `spuId`: 所属SPU ID
- `mainUnit`: 主库存单位
- `mainBarcode`: 主条码
- `status`: 状态（draft/enabled/disabled）

详细数据模型定义请参考：[data-model.md](./data-model.md)

## API接口

所有接口通过Mock服务实现，接口定义请参考：[contracts/mock-api.yaml](./contracts/mock-api.yaml)

主要接口：
- `GET /api/sku` - 获取SKU列表
- `POST /api/sku` - 创建SKU
- `GET /api/sku/{id}` - 获取SKU详情
- `PUT /api/sku/{id}` - 更新SKU
- `PATCH /api/sku/{id}/status` - 切换状态
- `POST /api/sku/check-barcode` - 检查条码唯一性

## 开发指南

### 添加新字段

1. 更新类型定义 (`types/sku.ts`)
2. 更新Mock数据生成逻辑 (`services/mockSkuApi.ts`)
3. 更新表单组件 (`components/sku/SkuForm/`)
4. 更新表格列 (`components/sku/SkuTable.tsx`)
5. 更新详情组件 (`components/sku/SkuDetail.tsx`)

### 添加新筛选条件

1. 更新 `SkuQueryParams` 类型 (`types/sku.ts`)
2. 更新筛选组件 (`components/sku/SkuFilters.tsx`)
3. 更新Mock API筛选逻辑 (`services/mockSkuApi.ts`)
4. 更新Zustand Store (`stores/skuStore.ts`)

### 表单验证

使用 React Hook Form + Zod 进行表单验证：

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const skuSchema = z.object({
  name: z.string().min(1, 'SKU名称不能为空').max(200),
  spuId: z.string().min(1, '请选择所属SPU'),
  mainUnit: z.string().min(1, '请选择主库存单位'),
  mainBarcode: z.string().min(1, '主条码不能为空'),
});

const form = useForm({
  resolver: zodResolver(skuSchema),
});
```

### 状态管理

UI状态使用Zustand：

```typescript
import { useSkuStore } from '@/stores/skuStore';

const { filters, setFilters } = useSkuStore();
```

数据状态使用TanStack Query：

```typescript
import { useSkuListQuery } from '@/hooks/useSku';

const { data, isLoading, error } = useSkuListQuery(filters);
```

## 测试

### E2E测试

```bash
# 运行E2E测试
npm run test

# 运行特定测试文件
npm run test tests/e2e/sku-management.spec.ts

# 调试模式
npm run test:debug
```

### 单元测试

```bash
# 运行单元测试
npm run test:unit

# 运行特定测试文件
npm run test:unit tests/unit/sku/SkuForm.test.tsx
```

## 性能指标

根据成功标准，功能应满足以下性能要求：

- **列表加载时间**: < 2秒
- **搜索响应时间**: < 2秒
- **表单提交成功率**: > 95%
- **支持数据量**: 至少1000条SKU数据的分页展示

## 常见问题

### Q: Mock数据如何生成？

A: Mock数据在 `services/mockSkuApi.ts` 中生成，包含1000条SKU记录，关联到50-100个SPU。

### Q: 如何修改Mock数据？

A: 直接编辑 `services/mockSkuApi.ts` 中的 `generateMockSkus()` 函数。

### Q: 表单验证失败怎么办？

A: 检查表单字段的验证规则（在 `types/sku.ts` 中的Zod schema），确保必填字段已填写，格式正确。

### Q: 条码重复检查不工作？

A: 确保调用了 `/api/sku/check-barcode` 接口，并正确处理返回结果。

### Q: 状态切换不生效？

A: 检查 `useToggleSkuStatusMutation` Hook是否正确调用，并确认Mock API的状态更新逻辑。

## 相关文档

- [功能规范](./spec.md)
- [实施计划](./plan.md)
- [技术研究](./research.md)
- [数据模型](./data-model.md)
- [API合约](./contracts/mock-api.yaml)
- [任务列表](./tasks.md)

## 下一步

1. 查看[任务列表](./tasks.md)了解实施进度
2. 运行E2E测试验证功能完整性
3. 根据实际使用情况优化性能和用户体验
4. 准备后端API对接（如需要）

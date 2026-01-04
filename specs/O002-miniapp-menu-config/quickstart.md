# O002-miniapp-menu-config 快速入门指南

**@spec O002-miniapp-menu-config**

本指南帮助开发者快速上手小程序菜单分类配置功能，包括 API 调用、前端集成和常见场景示例。

---

## 目录

1. [功能概述](#1-功能概述)
2. [环境准备](#2-环境准备)
3. [功能验证与访问](#3-功能验证与访问)
4. [后端 API 快速使用](#4-后端-api-快速使用)
5. [前端 B端 集成](#5-前端-b端-集成)
6. [前端 C端 集成](#6-前端-c端-集成)
7. [常见场景示例](#7-常见场景示例)
8. [故障排查](#8-故障排查)

---

## 1. 功能概述

### 1.1 核心功能

小程序菜单分类配置将原硬编码的 `ChannelCategory` 枚举替换为动态可配置的分类系统，支持：

- ✅ **动态分类管理**: 管理员可创建、编辑、删除分类
- ✅ **拖拽排序**: 前端支持拖拽调整分类顺序
- ✅ **可见性控制**: 隐藏分类后小程序不显示
- ✅ **默认分类保护**: 系统默认分类不可删除、不可隐藏
- ✅ **商品自动迁移**: 删除分类时关联商品自动迁移到默认分类
- ✅ **审计日志**: 记录关键操作（删除、批量排序）
- ✅ **向后兼容**: 支持旧枚举值通过 code 查询

---

### 1.2 架构图

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   B端管理后台    │◄──────│   Spring Boot    │◄──────│   PostgreSQL    │
│  (React + Ant)  │       │   REST API       │       │  Supabase       │
└─────────────────┘       └──────────────────┘       └─────────────────┘
                                   ▲
                                   │
                          ┌────────┴────────┐
                          │                 │
                  ┌───────▼───────┐ ┌──────▼──────┐
                  │  C端小程序    │ │  C端 H5     │
                  │   (Taro)      │ │  (Taro)     │
                  └───────────────┘ └─────────────┘
```

---

## 2. 环境准备

### 2.1 后端环境

**必需依赖**:
- Java 17
- Spring Boot 3.3.5
- PostgreSQL 14+
- Flyway 数据库迁移工具

**启动后端**:
```bash
cd backend
./mvnw spring-boot:run
```

**验证后端运行**:
```bash
curl http://localhost:8080/actuator/health
# 期望输出: {"status":"UP"}
```

---

### 2.2 前端 B端 环境

**必需依赖**:
- Node.js 18+
- React 19
- Ant Design 6
- TanStack Query 5
- @dnd-kit（拖拽库）

**启动 B端**:
```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

**访问菜单分类管理**:
- 登录后台 → 渠道商品配置 → O002-菜单分类
- 或直接访问: http://localhost:3000/menu-category

---

### 2.3 前端 C端 环境

**启动 C端（Taro H5）**:
```bash
cd hall-reserve-taro
npm install
npm run dev:h5
# 访问 http://localhost:10086
```

---

## 3. 功能验证与访问

### 3.1 B端管理后台访问

#### 访问路径

**开发环境**:
```
http://localhost:3000/menu-category
```

**导航路径**:
```
登录后台 → 侧边栏 → 渠道商品配置 → O002-菜单分类
```

#### 菜单配置验证

检查 `frontend/src/components/layout/AppLayout.tsx` 中是否已添加菜单项：

```typescript
{
  key: '/menu-category',
  icon: <AppstoreOutlined />,
  label: 'O002-菜单分类',
  path: '/menu-category'
}
```

---

### 3.2 数据库验证

#### 验证数据迁移是否成功

**连接 Supabase 数据库**:
```bash
# 使用 psql 连接（需要 Supabase 连接信息）
psql -h <SUPABASE_HOST> -U postgres -d postgres
```

**检查表结构**:
```sql
-- 检查 menu_category 表是否存在
\d menu_category

-- 检查初始数据是否迁移成功（应该有 6 个分类）
SELECT code, display_name, sort_order, is_visible, is_default
FROM menu_category
ORDER BY sort_order;

-- 期望输出：
-- ALCOHOL    | 经典特调 | 10 | true  | false
-- COFFEE     | 精品咖啡 | 20 | true  | false
-- BEVERAGE   | 饮品     | 30 | true  | false
-- SNACK      | 小食     | 40 | true  | false
-- MEAL       | 套餐     | 50 | true  | false
-- OTHER      | 其他商品 | 100| true  | true
```

**检查商品关联**:
```sql
-- 检查所有商品是否都有 category_id
SELECT COUNT(*) as total_products,
       COUNT(category_id) as products_with_category
FROM channel_product_config;
-- total_products 应该等于 products_with_category

-- 检查每个分类的商品数量
SELECT mc.code, mc.display_name, COUNT(cpc.id) as product_count
FROM menu_category mc
LEFT JOIN channel_product_config cpc ON cpc.category_id = mc.id
WHERE mc.deleted_at IS NULL
GROUP BY mc.id, mc.code, mc.display_name
ORDER BY mc.sort_order;
```

**检查审计日志表**:
```sql
-- 检查 category_audit_log 表是否存在
\d category_audit_log

-- 查看审计日志（如果有删除或排序操作）
SELECT action, category_id, affected_product_count, created_at
FROM category_audit_log
ORDER BY created_at DESC
LIMIT 10;
```

---

### 3.3 功能完整性检查

#### 后端 API 健康检查

```bash
# 1. 检查后端服务是否运行
curl http://localhost:8080/actuator/health
# 期望: {"status":"UP"}

# 2. 检查分类列表 API
curl -X GET "http://localhost:8080/api/admin/menu-categories" \
  -H "Authorization: Bearer <JWT_TOKEN>"
# 期望: 返回 6 个初始分类

# 3. 检查 C端分类 API
curl -X GET "http://localhost:8080/api/client/menu-categories"
# 期望: 返回可见分类列表（is_visible=true）
```

#### 前端功能检查清单

**B端管理后台**:
- [ ] 能够访问 `/menu-category` 页面
- [ ] 表格显示所有分类（包括隐藏分类）
- [ ] 每个分类显示商品数量
- [ ] "新建分类"按钮可点击
- [ ] 表格支持拖拽排序
- [ ] 可见性开关可切换
- [ ] 编辑按钮打开表单
- [ ] 删除按钮触发确认对话框

**C端小程序**:
- [ ] 菜单页显示分类标签
- [ ] 点击分类标签筛选商品
- [ ] 隐藏的分类不显示
- [ ] 分类按 `sort_order` 排序
- [ ] 显示每个分类的商品数量

---

### 3.4 端到端验证流程

#### 验证流程 1: 创建分类 → 小程序可见

```bash
# 步骤 1: B端创建新分类
curl -X POST "http://localhost:8080/api/admin/menu-categories" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST_CATEGORY",
    "displayName": "测试分类",
    "sortOrder": 999,
    "isVisible": true,
    "description": "端到端测试分类"
  }'

# 步骤 2: 验证数据库
psql -c "SELECT code, display_name FROM menu_category WHERE code='TEST_CATEGORY';"

# 步骤 3: C端获取分类列表
curl http://localhost:8080/api/client/menu-categories | jq '.data[] | select(.code=="TEST_CATEGORY")'

# 步骤 4: 小程序 H5 页面验证
# 访问 http://localhost:10086 → 菜单页 → 应该看到"测试分类"标签

# 步骤 5: 清理测试数据
curl -X DELETE "http://localhost:8080/api/admin/menu-categories/{category_id}?confirm=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 验证流程 2: 隐藏分类 → 小程序不可见

```bash
# 步骤 1: 隐藏"小食"分类
curl -X PATCH "http://localhost:8080/api/admin/menu-categories/{snack_category_id}/visibility?isVisible=false" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 步骤 2: C端验证（不应返回 SNACK 分类）
curl http://localhost:8080/api/client/menu-categories | jq '.data[] | select(.code=="SNACK")'
# 期望输出：空（不返回任何结果）

# 步骤 3: 小程序验证
# 访问小程序菜单页 → "小食"标签应该消失

# 步骤 4: 恢复可见性
curl -X PATCH "http://localhost:8080/api/admin/menu-categories/{snack_category_id}/visibility?isVisible=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 验证流程 3: 拖拽排序 → 顺序变更

```bash
# 步骤 1: 记录当前排序
curl http://localhost:8080/api/client/menu-categories | jq '.data[].displayName'

# 步骤 2: B端执行批量排序（将"精品咖啡"移到第一位）
curl -X PUT "http://localhost:8080/api/admin/menu-categories/batch-sort" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "id": "{coffee_id}", "sortOrder": 5 },
      { "id": "{alcohol_id}", "sortOrder": 10 },
      { "id": "{beverage_id}", "sortOrder": 20 }
    ]
  }'

# 步骤 3: 验证新排序
curl http://localhost:8080/api/client/menu-categories | jq '.data[].displayName'
# 期望："精品咖啡"排在第一位

# 步骤 4: 检查审计日志
psql -c "SELECT action, created_at FROM category_audit_log WHERE action='BATCH_SORT' ORDER BY created_at DESC LIMIT 1;"
```

#### 验证流程 4: 删除分类 → 商品迁移

```bash
# 步骤 1: 创建测试分类并关联商品
# （假设已创建"测试分类"并分配了 5 个商品）

# 步骤 2: 预览删除影响
curl -X DELETE "http://localhost:8080/api/admin/menu-categories/{test_category_id}?confirm=false" \
  -H "Authorization: Bearer <JWT_TOKEN>"
# 期望输出：affectedProductCount = 5

# 步骤 3: 确认删除
curl -X DELETE "http://localhost:8080/api/admin/menu-categories/{test_category_id}?confirm=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 步骤 4: 验证商品已迁移到默认分类
psql -c "SELECT COUNT(*) FROM channel_product_config WHERE category_id = (SELECT id FROM menu_category WHERE is_default=true);"

# 步骤 5: 检查审计日志
psql -c "SELECT action, affected_product_count FROM category_audit_log WHERE action='DELETE' ORDER BY created_at DESC LIMIT 1;"
# 期望：affected_product_count = 5
```

---

### 3.5 性能验证

#### API 响应时间验证

```bash
# 使用 curl 测量 API 响应时间
time curl -X GET "http://localhost:8080/api/admin/menu-categories?includeProductCount=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 期望：P95 响应时间 ≤ 1 秒

# 使用 Apache Bench 压力测试
ab -n 100 -c 10 -H "Authorization: Bearer <JWT_TOKEN>" \
  "http://localhost:8080/api/client/menu-categories"

# 期望：
# - 95% 请求 < 1000ms
# - 无失败请求
```

#### 前端性能验证

**B端拖拽排序**:
```typescript
// 在浏览器 Console 中监控拖拽排序时间
console.time('drag-sort');
// 手动拖拽分类
// 等待保存完成
console.timeEnd('drag-sort');

// 期望：< 200ms
```

**C端分类加载**:
```bash
# 使用 Chrome DevTools → Network 面板
# 访问小程序菜单页，查看 /api/client/menu-categories 请求耗时

# 期望：
# - 请求耗时 < 500ms
# - 首屏渲染 < 1.5s
```

---

### 3.6 向后兼容性验证

```bash
# 验证旧版 API 参数仍然可用

# 方式 1: 使用新参数 categoryId（推荐）
curl "http://localhost:8080/api/client/channel-products/mini-program?categoryId={coffee_uuid}" | jq '.data | length'

# 方式 2: 使用旧参数 category（向后兼容）
curl "http://localhost:8080/api/client/channel-products/mini-program?category=COFFEE" | jq '.data | length'

# 验证两种方式返回相同结果
diff <(curl -s "...?categoryId={uuid}" | jq '.data') \
     <(curl -s "...?category=COFFEE" | jq '.data')

# 期望：无差异
```

---

### 3.7 问题排查工具

#### 查看后端日志

```bash
# 查看 Spring Boot 日志
tail -f backend/logs/application.log | grep -i "category"

# 查看特定操作日志
grep "DELETE.*category" backend/logs/application.log
grep "BATCH_SORT" backend/logs/application.log
```

#### 数据库查询工具

```sql
-- 快速诊断脚本
WITH category_stats AS (
  SELECT
    mc.code,
    mc.display_name,
    mc.is_visible,
    mc.is_default,
    COUNT(cpc.id) as product_count
  FROM menu_category mc
  LEFT JOIN channel_product_config cpc ON cpc.category_id = mc.id
  WHERE mc.deleted_at IS NULL
  GROUP BY mc.id
)
SELECT * FROM category_stats ORDER BY product_count DESC;

-- 检查孤立商品（没有分类的商品）
SELECT id, sku_id, display_name
FROM channel_product_config
WHERE category_id IS NULL
LIMIT 10;
```

#### 前端调试工具

```typescript
// 在浏览器 Console 中调试 TanStack Query 缓存
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// 查看缓存的分类数据
console.log(queryClient.getQueryData(['menu-categories']));

// 手动刷新分类列表
queryClient.invalidateQueries({ queryKey: ['menu-categories'] });

// 清除所有缓存
queryClient.clear();
```

---

## 4. 后端 API 快速使用

### 4.1 管理员 API（B端）

#### 获取分类列表

```bash
# 获取所有分类（包含隐藏分类和商品数量）
curl -X GET "http://localhost:8080/api/admin/menu-categories?includeHidden=true&includeProductCount=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "code": "ALCOHOL",
      "displayName": "经典特调",
      "sortOrder": 10,
      "isVisible": true,
      "isDefault": false,
      "iconUrl": "https://cdn.example.com/icons/alcohol.png",
      "description": "鸡尾酒、威士忌、啤酒等",
      "productCount": 15,
      "version": 0,
      "createdAt": "2026-01-01T10:00:00Z",
      "updatedAt": "2026-01-03T08:30:00Z"
    }
  ],
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

#### 创建分类

```bash
curl -X POST "http://localhost:8080/api/admin/menu-categories" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SEASONAL",
    "displayName": "季节限定",
    "sortOrder": 50,
    "isVisible": true,
    "iconUrl": "https://cdn.example.com/icons/seasonal.png",
    "description": "季节性特别推荐商品"
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-new",
    "code": "SEASONAL",
    "displayName": "季节限定",
    "sortOrder": 50,
    "isVisible": true,
    "isDefault": false,
    "iconUrl": "https://cdn.example.com/icons/seasonal.png",
    "description": "季节性特别推荐商品",
    "productCount": 0,
    "version": 0,
    "createdAt": "2026-01-04T10:00:00Z",
    "updatedAt": "2026-01-04T10:00:00Z"
  },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

#### 更新分类

```bash
curl -X PUT "http://localhost:8080/api/admin/menu-categories/uuid-new" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 0,
    "displayName": "季节限定（新年特辑）",
    "sortOrder": 45
  }'
```

---

#### 删除分类

```bash
# 步骤 1: 预览删除影响（confirm=false）
curl -X DELETE "http://localhost:8080/api/admin/menu-categories/uuid-new?confirm=false" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 步骤 2: 确认删除（confirm=true）
curl -X DELETE "http://localhost:8080/api/admin/menu-categories/uuid-new?confirm=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**响应**:
```json
{
  "success": true,
  "data": {
    "deletedCategoryId": "uuid-new",
    "deletedCategoryName": "季节限定",
    "affectedProductCount": 10,
    "targetCategoryId": "uuid-other",
    "targetCategoryName": "其他商品"
  },
  "message": "分类已删除，10 个商品已迁移到"其他商品"分类",
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

#### 批量排序

```bash
curl -X PUT "http://localhost:8080/api/admin/menu-categories/batch-sort" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "id": "uuid-002", "sortOrder": 10 },
      { "id": "uuid-001", "sortOrder": 20 },
      { "id": "uuid-003", "sortOrder": 30 }
    ]
  }'
```

---

#### 切换可见性

```bash
# 隐藏分类
curl -X PATCH "http://localhost:8080/api/admin/menu-categories/uuid-001/visibility?isVisible=false" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 显示分类
curl -X PATCH "http://localhost:8080/api/admin/menu-categories/uuid-001/visibility?isVisible=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### 4.2 客户端 API（C端）

#### 获取可见分类列表

```bash
# 小程序获取分类列表
curl -X GET "http://localhost:8080/api/client/menu-categories"
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "code": "ALCOHOL",
      "displayName": "经典特调",
      "iconUrl": "https://cdn.example.com/icons/alcohol.png",
      "productCount": 15
    },
    {
      "id": "uuid-002",
      "code": "COFFEE",
      "displayName": "精品咖啡",
      "iconUrl": "https://cdn.example.com/icons/coffee.png",
      "productCount": 20
    }
  ],
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

#### 按分类查询商品

```bash
# 推荐：使用 categoryId（UUID）
curl -X GET "http://localhost:8080/api/client/channel-products/mini-program?categoryId=uuid-002"

# 向后兼容：使用 category（code）
curl -X GET "http://localhost:8080/api/client/channel-products/mini-program?category=COFFEE"
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cp-001",
      "skuId": "sku-001",
      "displayName": "美式咖啡",
      "basePrice": 2500,
      "mainImage": "https://cdn.example.com/coffee.jpg",
      "isRecommended": true,
      "sortOrder": 1,
      "status": "ACTIVE",
      "categoryId": "uuid-002",
      "category": {
        "id": "uuid-002",
        "code": "COFFEE",
        "displayName": "精品咖啡"
      }
    }
  ],
  "total": 20,
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

## 5. 前端 B端 集成

### 5.1 使用 TanStack Query Hooks

```typescript
import {
  useMenuCategories,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useBatchUpdateSortOrder,
  useToggleCategoryVisibility,
} from '@/features/menu-category/hooks/useMenuCategories';

export const MenuCategoryPage: React.FC = () => {
  // 查询分类列表
  const { data: categories, isLoading } = useMenuCategories({
    includeHidden: true,
    includeProductCount: true,
  });

  // 创建分类
  const createMutation = useCreateMenuCategory();
  const handleCreate = async (data: CreateMenuCategoryRequest) => {
    await createMutation.mutateAsync(data);
  };

  // 更新分类
  const updateMutation = useUpdateMenuCategory();
  const handleUpdate = async (id: string, data: UpdateMenuCategoryRequest) => {
    await updateMutation.mutateAsync({ id, request: data });
  };

  // 删除分类
  const deleteMutation = useDeleteMenuCategory();
  const handleDelete = async (id: string) => {
    const preview = await deleteMutation.mutateAsync({ id, confirm: false });
    // 显示确认对话框...
    await deleteMutation.mutateAsync({ id, confirm: true });
  };

  // 批量排序
  const sortMutation = useBatchUpdateSortOrder();
  const handleSort = async (items: Array<{ id: string; sortOrder: number }>) => {
    await sortMutation.mutateAsync({ items });
  };

  // 切换可见性
  const toggleMutation = useToggleCategoryVisibility();
  const handleToggle = async (id: string, isVisible: boolean) => {
    await toggleMutation.mutateAsync({ id, isVisible });
  };

  return (
    <CategoryTable
      data={categories}
      loading={isLoading}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      onToggleVisibility={handleToggle}
      onSortChange={handleSort}
    />
  );
};
```

---

### 5.2 使用拖拽排序组件

```typescript
import { CategoryTable } from '@/features/menu-category/components';

<CategoryTable
  data={categories}
  loading={isLoading}
  onEdit={(category) => console.log('编辑', category)}
  onDelete={(category) => console.log('删除', category)}
  onToggleVisibility={(id, isVisible) => console.log('切换可见性', id, isVisible)}
  onSortChange={(items) => console.log('排序变更', items)}
  sortLoading={sortMutation.isPending}
/>
```

**拖拽功能特性**:
- ✅ 支持鼠标拖拽和键盘导航
- ✅ 拖拽时行样式变化
- ✅ 自动保存排序结果到后端
- ✅ 乐观更新（立即反映 UI 变化）

---

### 5.3 使用表单组件

```typescript
import { CategoryForm } from '@/features/menu-category/components';

const [formOpen, setFormOpen] = useState(false);
const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
const [editingCategory, setEditingCategory] = useState<MenuCategoryDTO | null>(null);

<CategoryForm
  open={formOpen}
  mode={formMode}
  initialData={editingCategory}
  loading={createMutation.isPending || updateMutation.isPending}
  onSubmit={(data) => {
    if (formMode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: editingCategory.id, request: data });
    }
  }}
  onCancel={() => setFormOpen(false)}
/>
```

---

## 6. 前端 C端 集成

### 6.1 Taro 小程序集成

```typescript
import Taro from '@tarojs/taro';
import { useQuery } from '@tanstack/react-query';

// API 调用
const fetchCategories = async () => {
  const response = await Taro.request({
    url: 'http://localhost:8080/api/client/menu-categories',
    method: 'GET',
  });
  return response.data.data;
};

// 使用 TanStack Query
export const CategoryTabs: React.FC = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 缓存 5 分钟
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  return (
    <View className="category-tabs">
      {categories.map((category) => (
        <View
          key={category.id}
          className={`tab-item ${selectedCategoryId === category.id ? 'active' : ''}`}
          onClick={() => setSelectedCategoryId(category.id)}
        >
          {category.iconUrl && <Image src={category.iconUrl} mode="aspectFit" />}
          <Text>{category.displayName}</Text>
          <View className="badge">{category.productCount}</View>
        </View>
      ))}
    </View>
  );
};
```

---

### 6.2 按分类查询商品

```typescript
const fetchProducts = async (categoryId: string | null) => {
  const url = categoryId
    ? `http://localhost:8080/api/client/channel-products/mini-program?categoryId=${categoryId}`
    : 'http://localhost:8080/api/client/channel-products/mini-program';

  const response = await Taro.request({ url, method: 'GET' });
  return response.data.data;
};

export const ProductList: React.FC<{ categoryId: string | null }> = ({ categoryId }) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', categoryId],
    queryFn: () => fetchProducts(categoryId),
    staleTime: 2 * 60 * 1000, // 缓存 2 分钟
  });

  return (
    <ScrollView>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScrollView>
  );
};
```

---

## 7. 常见场景示例

### 7.1 场景：新增一个"节日特惠"分类

**步骤**:

1. **管理员登录后台**
2. **进入菜单分类管理页**: 渠道商品配置 → O002-菜单分类
3. **点击"新建分类"**
4. **填写表单**:
   - 分类编码: `HOLIDAY_SPECIAL`
   - 显示名称: `节日特惠`
   - 排序序号: `25`（留空自动分配）
   - 是否可见: `✅ 显示`
   - 图标 URL: `https://cdn.example.com/icons/holiday.png`
   - 分类描述: `节日限定特惠商品`
5. **点击"确定"** → 分类创建成功
6. **小程序端自动显示新分类标签**

---

### 7.2 场景：隐藏"季节限定"分类

**步骤**:

1. **找到"季节限定"分类行**
2. **点击"是否可见"开关**（切换为隐藏）
3. **前端发送 PATCH 请求**: `/api/admin/menu-categories/{id}/visibility?isVisible=false`
4. **小程序端不再显示该分类标签**

---

### 7.3 场景：调整分类顺序（拖拽排序）

**步骤**:

1. **鼠标拖拽分类行**（如将"精品咖啡"拖到"经典特调"上方）
2. **前端自动计算新的排序序号**
3. **发送批量排序请求**:
   ```json
   {
     "items": [
       { "id": "uuid-coffee", "sortOrder": 10 },
       { "id": "uuid-alcohol", "sortOrder": 20 }
     ]
   }
   ```
4. **后端更新排序 + 记录审计日志**
5. **小程序端下次刷新时显示新顺序**

---

### 7.4 场景：删除分类（商品迁移）

**步骤**:

1. **点击"季节限定"分类的"删除"按钮**
2. **系统查询该分类下有 10 个商品**
3. **显示确认对话框**:
   ```
   确定要删除分类「季节限定」（SEASONAL）吗？

   该分类下有 10 个商品，删除后将自动迁移到默认分类「其他商品」。
   ```
4. **用户点击"确认删除"**
5. **后端执行**:
   - 迁移 10 个商品到"其他商品"分类
   - 软删除"季节限定"分类（设置 `deleted_at`）
   - 记录审计日志
6. **前端刷新列表，分类已消失**

---

### 7.5 场景：修改分类名称和图标

**步骤**:

1. **点击"经典特调"分类的"编辑"按钮**
2. **表单自动填充当前数据**
3. **修改**:
   - 显示名称: `经典特调` → `酒品系列`
   - 图标 URL: `https://cdn.example.com/icons/alcohol-new.png`
4. **点击"确定"**
5. **前端发送 PUT 请求**:
   ```json
   {
     "version": 0,
     "displayName": "酒品系列",
     "iconUrl": "https://cdn.example.com/icons/alcohol-new.png"
   }
   ```
6. **后端更新成功，返回新数据**
7. **前端乐观更新，立即显示新名称和图标**

---

## 8. 故障排查

### 8.1 分类编码重复错误

**错误信息**:
```json
{
  "success": false,
  "error": "CAT_DUP_001",
  "message": "分类编码已存在: SEASONAL",
  "timestamp": "2026-01-04T10:00:00Z"
}
```

**解决方案**:
- 检查是否已有同名 code 的分类
- 使用不同的编码，如 `SEASONAL_2026`

---

### 8.2 默认分类不能删除

**错误信息**:
```json
{
  "success": false,
  "error": "CAT_BIZ_001",
  "message": "默认分类不能删除",
  "timestamp": "2026-01-04T10:00:00Z"
}
```

**原因**: 尝试删除 `isDefault=true` 的分类（如"其他商品"）

**解决方案**:
- 默认分类用于兜底，不可删除
- 如需更改默认分类，请联系系统管理员修改数据库

---

### 8.3 乐观锁冲突

**错误信息**:
```json
{
  "success": false,
  "error": "CAT_CONFLICT_001",
  "message": "数据已被其他用户修改，请刷新后重试",
  "timestamp": "2026-01-04T10:00:00Z"
}
```

**原因**: 多人同时编辑同一分类，version 字段不匹配

**解决方案**:
- 刷新页面重新获取最新数据
- 重新提交修改

---

### 8.4 小程序看不到新创建的分类

**可能原因**:

1. **分类设置为隐藏** → 检查 `isVisible` 字段
2. **小程序缓存** → 清除小程序缓存或重启
3. **TanStack Query 缓存** → 默认缓存 5 分钟，等待自动刷新或手动刷新

**解决方案**:
```typescript
// 手动刷新分类列表
queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
```

---

### 8.5 拖拽排序不生效

**可能原因**:

1. **未启用拖拽传感器** → 检查 DndContext 配置
2. **权限不足** → 检查 JWT Token 是否有效
3. **网络错误** → 检查浏览器 Network 面板

**调试**:
```typescript
// 监听排序事件
onSortChange={(items) => {
  console.log('New sort order:', items);
}}
```

---

## 附录

### A. 相关文档

- **数据模型文档**: `specs/O002-miniapp-menu-config/data-model.md`
- **OpenAPI 规范**: `specs/O002-miniapp-menu-config/contracts/api.yaml`
- **实施计划**: `specs/O002-miniapp-menu-config/plan.md`
- **任务分解**: `specs/O002-miniapp-menu-config/tasks.md`

---

### B. 在线工具

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API 文档**: http://localhost:8080/v3/api-docs
- **健康检查**: http://localhost:8080/actuator/health

---

### C. 示例代码仓库

```bash
# 完整示例代码
git clone https://github.com/cinema-platform/o002-examples.git
cd o002-examples
npm install && npm run dev
```

---

**版本**: 1.0.0
**最后更新**: 2026-01-04
**维护者**: Cinema Business Center Platform Team

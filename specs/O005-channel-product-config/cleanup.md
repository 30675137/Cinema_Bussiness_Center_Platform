# Cleanup Checklist: 历史代码清理

**@spec O005-channel-product-config**

**Date**: 2026-01-01

## 前置条件

> **重要**: 此清理必须在以下条件满足后执行

- [ ] 渠道商品配置功能（Phase 1-3）已完成并验证
- [ ] 小程序端商品展示正常
- [ ] 小程序端下单流程正常
- [ ] 所有相关测试通过
- [ ] 产品验收通过

---

## 1. 前端代码清理

### 1.1 删除 beverage-config 模块（完全删除）

**目录**: `frontend/src/features/beverage-config/`

| 文件/目录 | 说明 | 操作 |
|-----------|------|------|
| `components/BeverageFormModal.tsx` | 饮品表单弹窗 | 删除 |
| `components/ImageUpload.tsx` | 图片上传组件 | **可复用** → 移动到通用组件 |
| `components/MigrationNotice.tsx` | 迁移通知（O004） | 删除 |
| `components/RecipeConfigModal.tsx` | 配方配置弹窗 | 删除 |
| `components/SpecConfigModal.tsx` | 规格配置弹窗 | **可参考** → 新模块重写 |
| `components/index.ts` | 组件导出 | 删除 |
| `pages/BeverageListPage.tsx` | 饮品列表页 | 删除 |
| `pages/index.ts` | 页面导出 | 删除 |
| `services/beverageAdminApi.ts` | 饮品管理 API | 删除 |
| `types/beverage.ts` | 饮品类型定义 | 删除 |

**删除命令**:
```bash
rm -rf frontend/src/features/beverage-config/
```

---

### 1.2 清理 beverage-order-management 模块（保留订单管理，删除配置相关）

**目录**: `frontend/src/features/beverage-order-management/`

| 文件/目录 | 说明 | 操作 |
|-----------|------|------|
| `components/BeverageOrderCard.tsx` | 订单卡片 | **保留** - 订单管理使用 |
| `components/BeverageOrderStatusBadge.tsx` | 订单状态徽章 | **保留** - 订单管理使用 |
| `components/OrderActionButtons.tsx` | 订单操作按钮 | **保留** - 订单管理使用 |
| `components/OrderStatusBadge.tsx` | 订单状态徽章 | **保留** - 订单管理使用 |
| `components/BestSellingList.tsx` | 热销榜单 | **保留** - 统计使用 |
| `components/SalesChart.tsx` | 销售图表 | **保留** - 统计使用 |
| `pages/OrderListPage.tsx` | 订单列表页 | **保留** - 核心订单管理 |
| `pages/PendingOrdersPage.tsx` | 待处理订单页 | **保留** - 核心订单管理 |
| `pages/SalesStatisticsPage.tsx` | 销售统计页 | **保留** - 运营统计 |
| `services/beverageOrderApi.ts` | 订单 API | **保留** - 订单管理使用 |
| `services/orderStatisticsApi.ts` | 统计 API | **保留** - 统计使用 |
| `hooks/useOrderStatistics.ts` | 统计 Hook | **保留** - 统计使用 |
| `types/statistics.ts` | 统计类型 | **保留** - 统计使用 |

**注意**: 此模块主要保留，仅需审查是否有对 `beverage-config` 的引用需要清理。

---

### 1.3 清理路由配置

**文件**: `frontend/src/router/index.tsx`

**需要删除的路由**:
```typescript
// 删除以下路由
{
  path: '/beverage/list',
  element: <BeverageListPage />,
}

// 删除相关导入
import { BeverageListPage } from '@/features/beverage-config/pages';
```

**可选：添加重定向**:
```typescript
// 添加重定向（兼容旧链接）
{
  path: '/beverage/*',
  element: <Navigate to="/channel-products/mini-program" replace />,
}
```

---

### 1.4 清理菜单配置

**文件**: `frontend/src/components/layout/AppLayout.tsx`

**需要删除的菜单项**（约 Line 275-280）:
```typescript
// 删除
{
  key: '/beverage/list',
  label: '饮品管理',
  icon: <CoffeeOutlined />,
}
```

**已在 T012 中添加的新菜单**:
```typescript
// 新增
{
  key: '/channel-products',
  label: '渠道商品配置',
  icon: <ShoppingOutlined />,
  children: [
    {
      key: '/channel-products/mini-program',
      label: '小程序商品',
    },
  ],
}
```

---

### 1.5 清理其他引用

**需要检查并清理的文件**:

| 文件 | 可能的引用 | 操作 |
|------|-----------|------|
| `frontend/src/App.tsx` | beverage 相关路由 | 检查并删除 |
| `frontend/src/components/layout/Sidebar.tsx` | beverage 菜单项 | 检查并删除 |
| `frontend/src/components/layout/Router.tsx` | beverage 路由 | 检查并删除 |
| `frontend/src/components/atoms/EmptyState/index.tsx` | beverage 示例 | 检查并更新 |

**全局搜索命令**:
```bash
# 搜索所有 beverage 相关引用
grep -r "beverage" frontend/src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# 搜索 beverage-config 模块引用
grep -r "beverage-config" frontend/src/ --include="*.ts" --include="*.tsx"

# 搜索 BeverageListPage 引用
grep -r "BeverageListPage" frontend/src/ --include="*.ts" --include="*.tsx"
```

---

## 2. 后端代码清理

### 2.1 删除 beverage 模块（如存在）

**目录**: `backend/src/main/java/com/cinema/beverage/`

```bash
# 检查是否存在
ls -la backend/src/main/java/com/cinema/beverage/

# 如果存在，删除
rm -rf backend/src/main/java/com/cinema/beverage/
```

### 2.2 清理 beverage 相关 Entity/DTO/Repository

**需要检查的目录**:
- `backend/src/main/java/com/cinema/entity/` - Beverage 实体
- `backend/src/main/java/com/cinema/dto/` - Beverage DTO
- `backend/src/main/java/com/cinema/repository/` - Beverage Repository
- `backend/src/main/java/com/cinema/service/` - Beverage Service
- `backend/src/main/java/com/cinema/controller/` - Beverage Controller

```bash
# 搜索 beverage 相关文件
find backend/src/main/java -name "*Beverage*" -type f
find backend/src/main/java -name "*beverage*" -type f

# 搜索 beverage 相关代码引用
grep -r "Beverage" backend/src/main/java/ --include="*.java"
grep -r "beverage" backend/src/main/java/ --include="*.java"
```

---

## 3. 数据库清理

### 3.1 删除历史表

**需要删除的表**:

| 表名 | 说明 | 依赖 |
|------|------|------|
| `beverages` | 饮品主表 | 无 |
| `beverage_specs` | 饮品规格表 | beverages |
| `beverage_recipes` | 饮品配方表 | beverages |
| `beverage_config` | 饮品配置表（旧） | 无 |
| `beverage_sku_mapping` | SKU 映射表（O004） | skus |

**清理迁移脚本**:

```sql
-- File: V2026_01_01_002__cleanup_beverage_tables.sql

-- 删除外键依赖表
DROP TABLE IF EXISTS beverage_recipes CASCADE;
DROP TABLE IF EXISTS beverage_specs CASCADE;

-- 删除映射表
DROP TABLE IF EXISTS beverage_sku_mapping CASCADE;

-- 删除主表
DROP TABLE IF EXISTS beverages CASCADE;
DROP TABLE IF EXISTS beverage_config CASCADE;

-- 添加迁移日志
INSERT INTO schema_version_log (version, description, executed_at)
VALUES ('V2026_01_01_002', 'Cleanup beverage related tables - migrated to channel_product_config', NOW());
```

**执行前备份**:
```sql
-- 可选：备份数据
CREATE TABLE beverages_backup AS SELECT * FROM beverages;
CREATE TABLE beverage_specs_backup AS SELECT * FROM beverage_specs;
CREATE TABLE beverage_recipes_backup AS SELECT * FROM beverage_recipes;
```

---

## 4. 规格文档归档

### 4.1 标记废弃规格

**需要标记的规格**:

| 规格 | 路径 | 状态 |
|------|------|------|
| O003-beverage-order | `specs/O003-beverage-order/` | 部分废弃（饮品配置部分） |
| O004-beverage-sku-reuse | `specs/O004-beverage-sku-reuse/` | 完全废弃，被 O005 替代 |

**添加废弃标记**:

在 `O004-beverage-sku-reuse/spec.md` 顶部添加：
```markdown
> **⚠️ DEPRECATED**: 此规格已被 O005-channel-product-config 替代。
>
> 日期: 2026-01-01
> 原因: 架构改进，采用 SKU 主数据 + 渠道配置的分层架构
> 替代方案: specs/O005-channel-product-config/
```

---

## 5. 验证清单

### 5.1 编译验证

```bash
# 前端编译
cd frontend
npm run build

# 检查 lint
npm run lint

# 运行测试
npm run test
```

### 5.2 后端验证

```bash
# 后端编译
cd backend
./mvnw clean package

# 运行测试
./mvnw test
```

### 5.3 功能验证

- [ ] 访问 `/channel-products/mini-program` 正常
- [ ] 新增渠道商品正常
- [ ] 编辑渠道商品正常
- [ ] 规格配置正常
- [ ] 小程序商品展示正常
- [ ] 小程序下单流程正常
- [ ] 旧路径 `/beverage/list` 返回 404 或重定向

### 5.4 搜索验证

```bash
# 确认无遗留引用
grep -r "beverage-config" frontend/src/ --include="*.ts" --include="*.tsx"
# 应返回空结果

grep -r "BeverageListPage" frontend/src/ --include="*.ts" --include="*.tsx"
# 应返回空结果

grep -r "BeverageFormModal" frontend/src/ --include="*.ts" --include="*.tsx"
# 应返回空结果
```

---

## 6. 清理脚本（一键执行）

> **警告**: 此脚本仅供参考，请逐步执行并验证

```bash
#!/bin/bash
# cleanup-beverage.sh

echo "=== 开始清理 beverage 历史代码 ==="

# 1. 删除 beverage-config 模块
echo "删除 beverage-config 模块..."
rm -rf frontend/src/features/beverage-config/

# 2. 清理路由和菜单中的引用（需手动完成）
echo "请手动清理以下文件中的 beverage 引用："
echo "  - frontend/src/router/index.tsx"
echo "  - frontend/src/components/layout/AppLayout.tsx"

# 3. 搜索遗留引用
echo "搜索遗留引用..."
grep -r "beverage-config" frontend/src/ --include="*.ts" --include="*.tsx" || echo "无遗留引用 ✓"

# 4. 编译验证
echo "运行编译验证..."
cd frontend && npm run build

echo "=== 清理完成 ==="
echo "请运行 npm run test 进行完整测试"
```

---

## Summary

| 类别 | 删除项 | 保留项 |
|------|--------|--------|
| 前端模块 | beverage-config（完整删除） | beverage-order-management（订单管理保留） |
| 路由 | /beverage/* | /channel-products/* |
| 菜单 | 饮品管理 | 渠道商品配置 |
| 数据库表 | beverages, beverage_specs, beverage_recipes, beverage_sku_mapping | channel_product_config |
| 规格文档 | O004（标记废弃） | O005（新规格） |

---

**清理负责人**: _______________

**清理日期**: _______________

**验证签字**: _______________

# O008 渠道商品分类迁移 - 验证文档

**规格标识**: O008-channel-product-category-migration
**版本**: 1.0.0
**创建日期**: 2026-01-04
**创建者**: Claude Code

---

## 1. 概述

本文档描述 O008 渠道商品分类迁移功能的验证方案。该迁移将 B端商品配置从硬编码的 `ChannelCategory` 枚举迁移到动态的 `MenuCategory`（基于 UUID 的 `categoryId`）。

### 1.1 迁移范围

| 组件 | 变更内容 |
|------|---------|
| `types/index.ts` | 删除 `ChannelCategory` 枚举，使用 `categoryId: string` (UUID) |
| `CategorySelect.tsx` | 新增动态分类选择组件 |
| `ChannelProductBasicForm.tsx` | 使用 `CategorySelect` 替代硬编码 Select |
| `ChannelProductFilter.tsx` | 筛选器使用动态分类 |
| `ChannelProductTable.tsx` | 显示 `category.displayName` |
| `channelProductService.ts` | 查询参数改为 `categoryId` |
| `useChannelProductStore.ts` | Store filters 使用 `categoryId` |

---

## 2. 验证场景

### 2.1 E2E-CHANNEL-002: 创建商品时使用动态分类选择

**用户故事**: US1 - 创建渠道商品时选择动态分类

#### 前置条件
- 用户已登录 B端管理后台
- 系统中存在可见的菜单分类 (isVisible=true)
- 系统中存在成品 SKU 可用于配置

#### 测试步骤

| 步骤 | 操作 | 预期结果 |
|------|------|---------|
| 1 | 登录 B端管理后台 | 成功登录 |
| 2 | 导航到 `/channel-products/mini-program` | 显示渠道商品列表页 |
| 3 | 点击"新增商品"按钮 | 弹出 SKU 选择器 |
| 4 | 选择一个成品 SKU 并确认 | 进入商品创建页面 |
| 5 | 点击分类选择器下拉框 | 显示分类列表，按 sortOrder 排序 |
| 6 | 在搜索框输入"饮品" | 分类列表过滤显示匹配项 |
| 7 | 选择一个分类 | 分类选择器显示选中的分类名称 |
| 8 | 填写商品名称和描述 | 表单正确填充 |
| 9 | 点击保存 | 显示成功提示，返回列表页 |

#### 验收标准
- [ ] CategorySelect 组件正确渲染
- [ ] 分类列表至少显示 1 个选项
- [ ] 数据库记录的 `category_id` 为有效 UUID
- [ ] `category_id` 关联到有效的 `menu_category` 记录

---

### 2.2 E2E-CHANNEL-003: 编辑商品时隐藏分类正确显示

**用户故事**: US2 - 编辑商品时显示已隐藏的关联分类

#### 前置条件
- 用户已登录 B端管理后台
- 系统中存在一个渠道商品，关联到已隐藏的分类 (isVisible=false)
- 系统中存在其他可见分类可供切换

#### 测试步骤

| 步骤 | 操作 | 预期结果 |
|------|------|---------|
| 1 | 登录 B端管理后台 | 成功登录 |
| 2 | 导航到渠道商品列表页 | 显示商品列表 |
| 3 | 搜索"隐藏分类测试商品" | 显示目标商品 |
| 4 | 点击编辑按钮 | 进入编辑页面 |
| 5 | 查看分类选择器当前值 | 显示当前分类名称 + "(已隐藏)" 标记 |
| 6 | 点击分类选择器下拉框 | 隐藏分类在列表中可见，带 "(已隐藏)" 标记 |
| 7 | 选择一个可见分类 | 分类切换成功 |
| 8 | 点击保存 | 显示成功提示 |

#### 验收标准
- [ ] edit 模式下 CategorySelect 加载包含隐藏分类
- [ ] 隐藏分类显示 "(已隐藏)" 后缀
- [ ] 切换到可见分类后保存成功
- [ ] 数据库 `category_id` 更新为新分类的 UUID

---

### 2.3 E2E-CHANNEL-004: 按动态分类筛选渠道商品

**用户故事**: US3 - 使用动态分类筛选商品列表

#### 前置条件
- 用户已登录 B端管理后台
- 系统中存在多个不同分类的渠道商品
- 至少有 2 个可见分类，各有至少 1 个商品

#### 测试步骤

| 步骤 | 操作 | 预期结果 |
|------|------|---------|
| 1 | 登录 B端管理后台 | 成功登录 |
| 2 | 导航到渠道商品列表页 | 显示全部商品，记录总数 |
| 3 | 点击分类筛选下拉框 | 显示可见分类列表（不含隐藏分类） |
| 4 | 选择第一个分类 | 列表刷新，显示筛选后结果 |
| 5 | 验证筛选结果 | 商品数量 ≤ 初始总数 |
| 6 | 点击清除按钮 | 筛选清除 |
| 7 | 验证恢复全部 | 商品数量恢复为初始总数 |

#### 验收标准
- [ ] 筛选器仅显示可见分类（不显示隐藏分类）
- [ ] 选择分类后显示清除按钮 (allowClear)
- [ ] API 请求包含 `categoryId` 参数
- [ ] 筛选结果仅包含选中分类的商品

---

## 3. 数据库验证

### 3.1 表结构变更

```sql
-- channel_product_config 表
ALTER TABLE channel_product_config
  DROP COLUMN IF EXISTS channel_category,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES menu_category(id);
```

### 3.2 数据迁移验证

```sql
-- 验证所有记录都有有效的 category_id
SELECT count(*) FROM channel_product_config
WHERE category_id IS NULL OR category_id = '';
-- 预期结果: 0

-- 验证 category_id 关联有效
SELECT count(*) FROM channel_product_config cpc
LEFT JOIN menu_category mc ON cpc.category_id = mc.id
WHERE mc.id IS NULL AND cpc.category_id IS NOT NULL;
-- 预期结果: 0
```

---

## 4. API 验证

### 4.1 查询接口

**GET /api/channel-products**

| 参数 | 类型 | 说明 |
|------|------|------|
| `categoryId` | UUID (可选) | 分类 ID 筛选 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "displayName": "商品名称",
        "categoryId": "category-uuid",
        "category": {
          "id": "category-uuid",
          "displayName": "分类名称",
          "isVisible": true
        }
      }
    ]
  }
}
```

### 4.2 创建接口

**POST /api/channel-products**

**请求体**:
```json
{
  "skuId": "sku-uuid",
  "categoryId": "category-uuid",
  "displayName": "商品名称"
}
```

### 4.3 更新接口

**PUT /api/channel-products/{id}**

**请求体**:
```json
{
  "categoryId": "new-category-uuid",
  "displayName": "更新后名称"
}
```

---

## 5. 前端组件验证

### 5.1 CategorySelect 组件

| 属性 | 类型 | 说明 |
|------|------|------|
| `mode` | `'create' \| 'edit'` | 模式：create 仅显示可见分类，edit 包含隐藏分类 |
| `currentCategory` | `MenuCategoryDTO` | 编辑模式下当前关联的分类 |
| `allowClear` | `boolean` | 是否允许清除选择 |
| `value` | `string` | 选中的 categoryId (UUID) |
| `onChange` | `(categoryId: string \| undefined) => void` | 选择变化回调 |

### 5.2 验证要点

- [ ] 加载状态正确显示
- [ ] 错误状态显示重试按钮
- [ ] 搜索过滤功能正常
- [ ] 隐藏分类标记 "(已隐藏)"
- [ ] 按 sortOrder 排序

---

## 6. 测试用例文件

| 文件 | 说明 |
|------|------|
| `scenarios/channel-product/E2E-CHANNEL-002.yaml` | 创建商品动态分类选择 |
| `scenarios/channel-product/E2E-CHANNEL-003.yaml` | 编辑商品隐藏分类显示 |
| `scenarios/channel-product/E2E-CHANNEL-004.yaml` | 按动态分类筛选商品 |

---

## 7. 验证清单

### 7.1 功能验证

- [ ] 创建商品时可选择动态分类
- [ ] 编辑商品时隐藏分类正确显示
- [ ] 列表筛选使用动态分类
- [ ] 表格显示分类名称
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过

### 7.2 回归验证

- [ ] 现有商品配置功能正常
- [ ] 规格配置功能不受影响
- [ ] 上架/下架操作正常
- [ ] 删除操作正常

### 7.3 兼容性验证

- [ ] 旧数据迁移正确
- [ ] API 向后兼容

---

## 8. 附录

### 8.1 相关文档

- 规格文档: `specs/O008-channel-product-category-migration/spec.md`
- 任务清单: `specs/O008-channel-product-category-migration/tasks.md`
- 数据模型: `specs/O008-channel-product-category-migration/data-model.md`

### 8.2 Git 提交

```
e9a30d1 feat(O008): migrate channel product category from enum to dynamic MenuCategory
18 files changed, 1751 insertions(+), 154 deletions(-)
```

---

**文档状态**: 待验证
**最后更新**: 2026-01-04

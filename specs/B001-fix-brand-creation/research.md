# Research: 品牌创建问题根因分析

**Spec**: B001-fix-brand-creation
**Date**: 2026-01-10
**Status**: 完成

---

## 研究概述

本文档记录了对品牌管理模块两个关键缺陷的根因分析研究结果。

---

## 缺陷 1：品牌创建后不出现在列表中

### 问题描述

用户创建品牌后显示"品牌创建成功"消息，但新品牌不会出现在品牌列表中。

### 根因分析

经过代码审查，发现存在 **两个独立的问题**：

#### 问题 1A：Mock API 未使用 MSW Handler

**文件**: `frontend/src/pages/mdm-pim/brand/hooks/useBrandActions.ts`

`useBrandActions.ts` 中定义了一个内部的 `brandApi` 对象（第 24-175 行），其中 `createBrand` 函数是一个独立的 mock 实现：

```typescript
// useBrandActions.ts 第 26-55 行
const brandApi = {
  createBrand: async (data: CreateBrandRequest): Promise<ApiResponse<Brand>> => {
    // Mock API 延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟创建品牌响应 - 只返回新品牌，但未添加到 MSW mockBrands 数组
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      // ... 其他字段
    };

    return {
      success: true,
      data: newBrand,
      message: '品牌创建成功',
      timestamp: new Date().toISOString(),
    };
  },
  // ...
};
```

这个内部 mock 函数：
- ✅ 返回成功响应和新品牌数据
- ❌ **未将新品牌添加到 MSW 的 `mockBrands` 数组**
- ❌ **未调用真正的 MSW handler**

而 MSW handler（`brandHandlers.ts` 第 128-178 行）会正确地将新品牌推入 `mockBrands` 数组：

```typescript
// brandHandlers.ts 第 167 行
mockBrands.push(newBrand);
```

#### 问题 1B：TanStack Query Key 不匹配

**文件对比**:
- `useBrandActions.ts` 第 191 行：`queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists })`
- `useBrandList.ts` 第 55 行：`queryKey: ['brands', filters, pagination]`
- `brand.types.ts` 第 324 行：`lists: ['brands', 'list']`

缓存失效使用的 key 是 `['brands', 'list']`，但实际查询使用的 key 是 `['brands', filters, pagination]`。

**TanStack Query 的 key 匹配规则**：`invalidateQueries` 会匹配以指定 key 开头的所有查询。`['brands', 'list']` 不会匹配 `['brands', filters, pagination]`，因为第二个元素不同（`'list'` vs `filters` 对象）。

### 决策

**修复方案**: 双管齐下

1. **修改 `useBrandActions.ts`**: 使用 `brandService` 调用真正的 API（会被 MSW 拦截），而不是内部 mock
2. **统一 Query Key**: 确保 invalidateQueries 使用正确的 key pattern

**理由**:
- 使用 MSW handler 确保数据一致性
- 统一 query key 确保缓存正确失效

**备选方案（已拒绝）**:
- 只修复 query key：不解决根本的数据不同步问题
- 手动更新缓存：增加复杂性，容易出错

---

## 缺陷 2：重复的"新建品牌"按钮

### 问题描述

品牌创建抽屉中显示两个相同的"新建品牌"按钮，造成用户困惑。

### 根因分析

经过代码审查，发现 **两个组件同时渲染了提交按钮**：

#### 位置 1：BrandDrawer.tsx

**文件**: `frontend/src/pages/mdm-pim/brand/components/organisms/BrandDrawer.tsx`

第 149-183 行的 `getActionButtons()` 函数在 Drawer 的 `footer` prop 中渲染按钮：

```tsx
// BrandDrawer.tsx 第 196 行
<Drawer
  // ...
  footer={getActionButtons()}  // 这里渲染了一个"新建品牌"按钮
>
```

`getActionButtons()` 返回：

```tsx
<Button type="primary" ... >
  {mode === 'create' ? '新建品牌' : '保存修改'}
</Button>
```

#### 位置 2：BrandForm.tsx

**文件**: `frontend/src/pages/mdm-pim/brand/components/molecules/BrandForm.tsx`

第 325-349 行的 `form-actions` div 中也渲染了按钮：

```tsx
// BrandForm.tsx 第 325-349 行
<div className="form-actions" data-testid="form-actions">
  <Space>
    {mode !== 'view' && (
      <>
        <Button onClick={handleCancel} ... >取消</Button>
        <Button type="primary" htmlType="submit" ... >
          {mode === 'create' ? '新建品牌' : '保存修改'}  // 重复的按钮！
        </Button>
      </>
    )}
  </Space>
</div>
```

### 决策

**修复方案**: 移除 `BrandForm.tsx` 中的操作按钮

**理由**:
- Ant Design Drawer 的最佳实践是将操作按钮放在 `footer` 中
- `BrandDrawer` 是容器组件，负责控制整体布局和操作
- `BrandForm` 是表单组件，应该只负责表单字段渲染
- 按钮在 Drawer footer 中位置更显眼，用户体验更好

**备选方案（已拒绝）**:
- 移除 Drawer footer 的按钮：不符合 Ant Design Drawer 的标准用法
- 条件渲染其中一个：增加不必要的复杂性

---

## 修复计划

### 任务清单

| 任务 ID | 描述 | 优先级 | 预估复杂度 |
|---------|------|--------|-----------|
| T1 | 修改 `useBrandActions.ts` 使用 `brandService` 而非内部 mock | P0 | 中 |
| T2 | 统一 TanStack Query key 命名 | P0 | 低 |
| T3 | 移除 `BrandForm.tsx` 中的重复按钮 | P0 | 低 |
| T4 | 编写单元测试验证修复 | P1 | 中 |
| T5 | 手动验证完整工作流程 | P1 | 低 |

### 涉及文件

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `frontend/src/pages/mdm-pim/brand/hooks/useBrandActions.ts` | 修改 | 使用 brandService，移除内部 mock |
| `frontend/src/pages/mdm-pim/brand/hooks/useBrandList.ts` | 可能修改 | 确认 query key 一致性 |
| `frontend/src/pages/mdm-pim/brand/types/brand.types.ts` | 可能修改 | 更新 brandQueryKeys 定义 |
| `frontend/src/pages/mdm-pim/brand/components/molecules/BrandForm.tsx` | 修改 | 移除 form-actions 中的按钮 |

---

## 技术最佳实践

### TanStack Query 缓存失效

```typescript
// 推荐：使用 queryKey 的 fuzzy matching
queryClient.invalidateQueries({ queryKey: ['brands'] }); // 匹配所有以 'brands' 开头的查询

// 不推荐：使用精确 key 可能导致不匹配
queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists }); // 只匹配 ['brands', 'list']
```

### Ant Design Drawer 按钮位置

```tsx
// 推荐：按钮放在 Drawer footer
<Drawer
  footer={
    <Space>
      <Button>取消</Button>
      <Button type="primary">确定</Button>
    </Space>
  }
>
  {/* 表单内容，不包含操作按钮 */}
</Drawer>

// 不推荐：按钮放在表单内部
<Drawer>
  <Form>
    {/* 表单字段 */}
    <Form.Item>
      <Button>提交</Button>  {/* 会与 footer 按钮重复 */}
    </Form.Item>
  </Form>
</Drawer>
```

---

## 验证方法

### 缺陷 1 验证

1. 打开品牌管理页面
2. 点击"新建品牌"按钮
3. 填写表单并提交
4. 验证：
   - ✅ 显示成功消息
   - ✅ 抽屉关闭
   - ✅ 新品牌出现在列表中（无需刷新页面）
   - ✅ Chrome DevTools Network 面板显示列表 API 被调用

### 缺陷 2 验证

1. 打开品牌管理页面
2. 点击"新建品牌"按钮打开抽屉
3. 验证：
   - ✅ 抽屉中只有一个"新建品牌"按钮（在底部 footer）
   - ✅ 表单区域没有操作按钮
   - ✅ 按钮功能正常

---

**研究完成时间**: 2026-01-10
**下一步**: 生成 data-model.md 和 quickstart.md

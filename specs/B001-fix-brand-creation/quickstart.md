# Quickstart: 品牌创建问题修复

**Spec**: B001-fix-brand-creation
**Date**: 2026-01-10

---

## 快速开始

### 1. 启动开发环境

```bash
# 进入前端项目目录
cd frontend

# 安装依赖（如果尚未安装）
npm install

# 启动开发服务器（自动启用 MSW mock）
npm run dev
```

访问 http://localhost:3000，导航到 **MDM-PIM > 品牌管理**。

### 2. 复现问题

#### 缺陷 1：品牌创建后不出现在列表

1. 点击「新建品牌」按钮
2. 填写表单：
   - 品牌名称：`测试品牌-${Date.now()}`
   - 品牌类型：国产品牌
   - 主营类目：饮料
3. 点击「新建品牌」提交
4. **预期**：品牌出现在列表中
5. **实际**：显示成功消息，但列表中无新品牌

#### 缺陷 2：重复的「新建品牌」按钮

1. 点击「新建品牌」按钮打开抽屉
2. 观察抽屉中的按钮
3. **预期**：只有一个「新建品牌」按钮
4. **实际**：有两个「新建品牌」按钮

---

## 修复指南

### 修复缺陷 1：品牌创建后不出现在列表

**涉及文件**：
- `frontend/src/pages/mdm-pim/brand/hooks/useBrandActions.ts`

**修改步骤**：

1. **删除内部 mock 实现**，改用 `brandService`：

```typescript
// 修改前（第 26-55 行）
const brandApi = {
  createBrand: async (data: CreateBrandRequest): Promise<ApiResponse<Brand>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newBrand: Brand = { /* ... */ };
    return { success: true, data: newBrand, /* ... */ };
  },
  // ...
};

// 修改后 - 使用 brandService 调用真正的 API（会被 MSW 拦截）
import { brandService } from '../services/brandService';

// 在 useBrandActions hook 中直接使用 brandService
const createBrandMutation = useMutation({
  mutationFn: (data: CreateBrandRequest) => brandService.create(data),
  // ...
});
```

2. **修复缓存失效逻辑**：

```typescript
// 修改前（第 191 行）
queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists });
// brandQueryKeys.lists = ['brands', 'list']，与实际 query key 不匹配

// 修改后 - 使用更宽泛的 key
queryClient.invalidateQueries({ queryKey: ['brands'] });
// 匹配所有以 'brands' 开头的查询
```

### 修复缺陷 2：移除重复按钮

**涉及文件**：
- `frontend/src/pages/mdm-pim/brand/components/molecules/BrandForm.tsx`

**修改步骤**：

删除 `BrandForm.tsx` 中的 `form-actions` 区域（第 324-349 行）：

```tsx
// 修改前（第 324-349 行）
{/* 操作按钮 */}
<div className="form-actions" data-testid="form-actions">
  <Space>
    {mode !== 'view' && (
      <>
        <Button onClick={handleCancel} disabled={loading} data-testid="cancel-brand-button">
          取消
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={mode === 'create' ? <PlusOutlined /> : undefined}
          data-testid="save-brand-button"
        >
          {mode === 'create' ? '新建品牌' : '保存修改'}
        </Button>
      </>
    )}
    {mode === 'view' && (
      <Button onClick={handleCancel} data-testid="close-brand-button">
        关闭
      </Button>
    )}
  </Space>
</div>

// 修改后 - 完全删除上述代码块
// 按钮已在 BrandDrawer.tsx 的 footer 中渲染
```

---

## 验证修复

### 手动验证

1. **验证缺陷 1 修复**：
   - 打开品牌管理页面
   - 创建新品牌
   - 确认：
     - ✅ 成功消息显示
     - ✅ 抽屉自动关闭
     - ✅ 新品牌立即出现在列表中
   - 打开 Chrome DevTools > Network
     - ✅ 创建成功后，GET /api/brands 被调用

2. **验证缺陷 2 修复**：
   - 打开品牌创建抽屉
   - 确认：
     - ✅ 只有一个「新建品牌」按钮（在底部 footer）
     - ✅ 表单区域没有操作按钮

### 单元测试

```bash
# 运行品牌模块测试
npm run test:unit -- --grep "brand"

# 运行特定测试文件
npm run test:unit -- frontend/src/pages/mdm-pim/brand/__tests__/
```

### E2E 测试（可选）

```bash
# 运行品牌管理 E2E 测试
npm run test:e2e -- --grep "brand"
```

---

## 关键代码位置

| 文件 | 行号 | 说明 |
|------|------|------|
| `useBrandActions.ts` | 24-175 | 内部 mock API（需删除） |
| `useBrandActions.ts` | 191 | 缓存失效逻辑（需修改 key） |
| `useBrandList.ts` | 55 | 实际使用的 query key |
| `brand.types.ts` | 324 | `brandQueryKeys` 定义 |
| `BrandForm.tsx` | 324-349 | 重复的按钮区域（需删除） |
| `BrandDrawer.tsx` | 149-183 | `getActionButtons()` 函数 |
| `BrandDrawer.tsx` | 196 | Drawer footer prop |
| `brandHandlers.ts` | 128-178 | MSW 创建品牌 handler |

---

## 调试技巧

### 查看 TanStack Query 缓存

在浏览器控制台中：

```javascript
// 获取 queryClient 实例
const queryClient = window.__REACT_QUERY_DEVTOOLS_GLOBAL_CACHE__;

// 查看所有缓存的查询
queryClient.getQueryCache().getAll();

// 查看品牌相关查询
queryClient.getQueryCache().getAll().filter(q =>
  q.queryKey[0] === 'brands'
);
```

### 查看 MSW 请求日志

在浏览器控制台中，MSW 会记录所有拦截的请求：

```
[MSW] 12:00:00 POST /api/brands (201 Created)
[MSW] 12:00:00 GET /api/brands (200 OK)
```

### 验证 mockBrands 数组

在 `brandHandlers.ts` 中添加临时日志：

```typescript
http.post('/api/brands', async ({ request }) => {
  // ...
  mockBrands.push(newBrand);
  console.log('mockBrands after create:', mockBrands);
  // ...
});
```

---

## 常见问题

### Q: 修复后仍然不刷新列表？

检查：
1. `invalidateQueries` 的 key 是否正确（应为 `['brands']`）
2. 浏览器 Network 面板是否有 GET /api/brands 请求
3. TanStack Query DevTools 中是否显示查询被标记为 stale

### Q: 创建成功但数据不持久？

这是正常的 - MSW mock 数据存储在内存中，页面刷新后会重置。
真实后端连接后，数据将持久化到数据库。

### Q: 如何禁用 MSW 测试真实 API？

```typescript
// 在 main.tsx 中注释掉 MSW 启动代码
// await worker.start();
```

然后确保后端服务运行在 http://localhost:8080。

---

**最后更新**: 2026-01-10

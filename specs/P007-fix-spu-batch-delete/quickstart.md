# Quickstart Guide: SPU 批量删除功能修复

**Feature**: P007-fix-spu-batch-delete
**Date**: 2026-01-09
**Purpose**: 快速上手指南,帮助开发者本地验证和调试批量删除功能修复

---

## 1. 前置条件

### 1.1 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **浏览器**: Chrome, Firefox, Safari, Edge (最新版本)

### 1.2 项目依赖

确保已安装项目依赖:

```bash
cd frontend
npm install
```

### 1.3 分支切换

确保在正确的功能分支上:

```bash
# 查看当前分支
git branch --show-current
# 应该显示: P007-fix-spu-batch-delete

# 如果不在该分支,切换到此分支
git checkout P007-fix-spu-batch-delete
```

---

## 2. 本地开发环境搭建

### 2.1 启动开发服务器

```bash
cd frontend
npm run dev
```

输出示例:

```
  VITE v7.2.4  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 2.2 访问 SPU 列表页面

打开浏览器,访问:

```
http://localhost:3000/spu/list
```

**预期结果**:
- 看到 SPU 列表页面,显示 Mock 数据
- 列表中有多个 SPU 商品记录
- 每行记录前有 checkbox 可以选中

---

## 3. 验证 Bug 修复效果

### 3.1 复现原始 Bug (可选)

**如果你想先复现原始 bug(代码未修复前)**:

1. 切换到 dev 分支:
   ```bash
   git checkout dev
   cd frontend && npm run dev
   ```

2. 访问 http://localhost:3000/spu/list

3. 选中 3 个 SPU,点击"批量删除"

4. 确认删除操作

5. **观察**: 显示"成功删除 3 个 SPU",但刷新页面后数据仍然存在 ❌

### 3.2 验证修复后的行为

**切换回修复分支**:

```bash
git checkout P007-fix-spu-batch-delete
cd frontend && npm run dev
```

**测试步骤**:

1. 访问 http://localhost:3000/spu/list

2. **步骤 A: 选中 SPU**
   - 勾选列表中的 3 个 SPU checkbox
   - 观察顶部批量操作工具栏显示"已选择 3 项"

3. **步骤 B: 触发批量删除**
   - 点击"批量操作"下拉菜单
   - 选择"批量删除"
   - 确认弹窗中点击"确认删除"

4. **步骤 C: 观察删除过程**
   - 看到 loading 加载状态(按钮显示 loading 图标)
   - 约 1-2 秒后显示成功提示"成功删除 3 个 SPU"
   - 列表自动刷新,选中的 3 个 SPU 从列表中消失 ✅

5. **步骤 D: 验证数据一致性**
   - 手动刷新页面 (F5 或 Ctrl+R)
   - 确认刚才删除的 3 个 SPU 仍然不在列表中 ✅
   - 总记录数减少了 3 条 ✅

**预期结果**:
- ✅ 删除操作真实生效,数据从 Mock 数据源中移除
- ✅ 刷新页面后数据保持一致(不会重新出现被删除的 SPU)
- ✅ 用户体验流畅,有明确的 loading 和成功提示

---

## 4. Mock 数据持久化测试

### 4.1 启用 localStorage 持久化

**修改代码(临时测试)**:

编辑 `frontend/src/mocks/data/mockSPUStore.ts`:

```typescript
// 在 constructor 中启用持久化
constructor() {
  this.enablePersistence(true); // 设置为 true
  this.initialize();
}
```

**重新启动开发服务器**:

```bash
npm run dev
```

### 4.2 验证持久化效果

1. 访问 SPU 列表,删除几个 SPU

2. **完全关闭浏览器标签页**

3. **重新打开** http://localhost:3000/spu/list

4. **观察**: 删除的 SPU 仍然不在列表中(数据从 localStorage 恢复) ✅

### 4.3 清除 localStorage 数据(恢复初始状态)

**方式 1: 浏览器开发者工具**

1. 按 F12 打开开发者工具
2. 切换到 "Application" 标签
3. 左侧选择 "Local Storage" > http://localhost:3000
4. 找到 `mockSPUData` 键,右键删除
5. 刷新页面,Mock 数据重新初始化

**方式 2: 在控制台执行**

```javascript
localStorage.removeItem('mockSPUData');
location.reload();
```

---

## 5. 运行自动化测试

### 5.1 运行单元测试

```bash
cd frontend
npm run test
```

**预期输出**:

```
✓ frontend/src/mocks/data/mockSPUStore.test.ts (5 tests)
  ✓ MockSPUStore > should delete SPUs by ids
  ✓ MockSPUStore > should handle non-existent ids
  ✓ MockSPUStore > should return correct counts

✓ frontend/src/services/spuService.test.ts (3 tests)
  ✓ spuService.batchDeleteSPU > should call API with correct payload
  ✓ spuService.batchDeleteSPU > should handle errors

Test Files  2 passed (2)
     Tests  8 passed (8)
```

### 5.2 运行 E2E 测试

```bash
npm run test:e2e
```

**预期输出**:

```
Running 1 test using 1 worker

✓ e2e/spu-batch-delete.spec.ts:10:1 › batch delete SPUs (5s)

  1 passed (6s)
```

### 5.3 调试测试失败

**如果单元测试失败**:

```bash
# 运行特定测试文件
npm run test -- mockSPUStore.test.ts

# 查看详细错误信息
npm run test -- --reporter=verbose
```

**如果 E2E 测试失败**:

```bash
# UI 模式调试
npm run test:e2e:ui

# Headed 模式(显示浏览器)
npm run test:headed
```

---

## 6. 调试技巧

### 6.1 查看 MSW 请求日志

MSW 会在浏览器控制台输出拦截的请求:

1. 按 F12 打开开发者工具
2. 切换到 "Console" 标签
3. 执行批量删除操作
4. **观察日志**:
   ```
   [MSW] POST /api/spu/batch (200)
   [MSW] GET /api/spu/list (200)
   ```

### 6.2 检查 Mock 数据状态

**在浏览器控制台执行**:

```javascript
// 查看当前 Mock SPU 数据
import { mockSPUStore } from './mocks/data/mockSPUStore';
console.log('Total SPUs:', mockSPUStore.getAll().length);
console.log('All SPUs:', mockSPUStore.getAll());
```

### 6.3 断点调试 MSW Handler

1. 在 `frontend/src/mocks/handlers/index.ts` 中找到批量操作 handler:

```typescript
http.post('/api/spu/batch', async ({ request }) => {
  debugger; // 添加断点
  await delay(1000);

  const { operation, ids } = await request.json();
  // ...
})
```

2. 打开浏览器开发者工具 "Sources" 标签
3. 执行批量删除操作
4. 代码会在 `debugger;` 处暂停,可以查看变量和单步执行

### 6.4 查看网络请求

1. 开发者工具 "Network" 标签
2. 筛选 "Fetch/XHR"
3. 执行批量删除操作
4. **观察请求**:
   - **POST /api/spu/batch**: Request Payload 包含 `{ operation: "delete", ids: [...] }`
   - **Response**: `{ success: true, data: { processedCount: 3, failedCount: 0 } }`

---

## 7. 常见问题

### Q1: 删除后列表没有刷新?

**原因**: TanStack Query 缓存未失效

**解决方案**:

检查 `frontend/src/components/SPU/SPUList/index.tsx`:

```typescript
const handleBatchDelete = async () => {
  await spuAPI.batchDeleteSPU(selectedRowKeys);
  refetchSPUList(); // 确保调用了 refetch
};
```

### Q2: 刷新页面后数据又回来了?

**原因**: Mock 数据未持久化,或每次调用 `generateMockSPUList()` 重新生成

**解决方案**:

确保 MSW handler 使用 `mockSPUStore.getAll()` 而非 `generateMockSPUList()`:

```typescript
// ❌ 错误
http.get('/api/spu/list', () => {
  const allSPU = generateMockSPUList(100); // 每次生成新数据
  return HttpResponse.json({ data: { list: allSPU } });
});

// ✅ 正确
http.get('/api/spu/list', () => {
  const allSPU = mockSPUStore.getAll(); // 从持久化 store 获取
  return HttpResponse.json({ data: { list: allSPU } });
});
```

### Q3: 测试用例运行失败?

**原因**: Mock 数据状态污染(前一个测试未清理数据)

**解决方案**:

在测试文件中添加 `beforeEach` 清理:

```typescript
import { mockSPUStore } from '@/mocks/data/mockSPUStore';

beforeEach(() => {
  mockSPUStore.reset(); // 重置为初始状态
});
```

### Q4: localhost:3000 无法访问?

**原因**: 端口被占用或开发服务器未启动

**解决方案**:

```bash
# 检查端口占用
lsof -i :3000

# 杀掉占用进程
kill -9 <PID>

# 重新启动
npm run dev
```

---

## 8. 下一步

修复验证通过后,可以继续以下步骤:

1. **运行完整测试套件**:
   ```bash
   npm run test && npm run test:e2e
   ```

2. **代码格式检查**:
   ```bash
   npm run lint
   npm run format
   ```

3. **提交代码**:
   ```bash
   git add .
   git commit -m "fix(P007): 修复 SPU 批量删除功能数据不一致 bug"
   ```

4. **推送到远程**:
   ```bash
   git push origin P007-fix-spu-batch-delete
   ```

5. **创建 Pull Request**:
   - 在 GitHub/GitLab 上创建 PR
   - 目标分支: `dev` 或 `001-ui-implementation`
   - 标题: `fix(P007): 修复 SPU 批量删除功能数据不一致 bug`
   - 描述: 引用 `specs/P007-fix-spu-batch-delete/spec.md`

---

## 9. 参考资料

- **功能规格**: [spec.md](./spec.md)
- **实现计划**: [plan.md](./plan.md)
- **研究报告**: [research.md](./research.md)
- **数据模型**: [data-model.md](./data-model.md)
- **API 契约**: [contracts/api.yaml](./contracts/api.yaml)
- **MSW 官方文档**: https://mswjs.io/
- **TanStack Query 文档**: https://tanstack.com/query/latest

---

**版本历史**:
- v1.0 - 初始快速上手指南创建
- 创建日期: 2026-01-09
- 创建者: Claude AI

# Research Findings: SPU 批量删除功能修复

**Feature**: P007-fix-spu-batch-delete
**Date**: 2026-01-09
**Purpose**: 研究技术方案以修复批量删除功能的数据不一致 bug

---

## 1. Mock 数据持久化方案选择

### Decision

采用 **全局变量 (in-memory) + localStorage (可选持久化)** 的混合方案:

- **主要方案**: 使用全局单例对象 `mockSPUStore` 管理 SPU 数据,存储在内存中
- **可选持久化**: 提供 `enablePersistence()` 方法,将数据同步到 localStorage,支持页面刷新后恢复数据

### Rationale

1. **全局变量方案优势**:
   - 性能最佳,无需序列化/反序列化
   - 实现简单,直接在 MSW handlers 中修改数据即可
   - 符合 MSW 官方推荐的做法(使用内存状态管理 mock 数据)

2. **localStorage 作为可选补充**:
   - 支持页面刷新后数据保留(开发调试便利)
   - 可通过配置开关启用/禁用(避免测试环境数据污染)
   - 序列化开销小(JSON.stringify/parse)

3. **为什么不使用 IndexedDB**:
   - 过度设计,mock 数据不需要复杂的数据库功能
   - 异步 API 增加复杂度,MSW handlers 同步执行更简单
   - 浏览器兼容性问题(虽然主流浏览器已支持,但增加测试负担)

### Alternatives Considered

| 方案 | 优势 | 劣势 | 不采用原因 |
|------|------|------|----------|
| **纯 localStorage** | 数据持久化,页面刷新保留 | 序列化开销,容量限制(5-10MB),同步 API 阻塞主线程 | 性能不佳,不符合 MSW 最佳实践 |
| **纯内存全局变量** | 性能最优,实现简单 | 页面刷新数据丢失 | 开发调试不便,已通过混合方案解决 |
| **IndexedDB** | 大容量,异步操作 | 过度复杂,异步 API 与 MSW 同步 handlers 不匹配 | 杀鸡用牛刀,不适合 mock 数据场景 |
| **SessionStorage** | 与 localStorage 类似,标签页隔离 | 容量限制,序列化开销 | 不需要标签页隔离特性 |

### Implementation Details

```typescript
// frontend/src/mocks/data/mockSPUStore.ts
class MockSPUStore {
  private data: SPUItem[] = [];
  private persistenceEnabled = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // 尝试从 localStorage 恢复数据
    const stored = localStorage.getItem('mockSPUData');
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      // 初始化默认数据
      this.data = generateMockSPUList(100);
      this.saveToPersistence();
    }
  }

  enablePersistence(enabled: boolean) {
    this.persistenceEnabled = enabled;
  }

  private saveToPersistence() {
    if (this.persistenceEnabled) {
      localStorage.setItem('mockSPUData', JSON.stringify(this.data));
    }
  }

  getAll(): SPUItem[] {
    return [...this.data]; // 返回副本,防止外部修改
  }

  deleteMany(ids: string[]): { success: number; failed: number } {
    const initialCount = this.data.length;
    this.data = this.data.filter(spu => !ids.includes(spu.id));
    const deletedCount = initialCount - this.data.length;

    this.saveToPersistence();

    return {
      success: deletedCount,
      failed: ids.length - deletedCount,
    };
  }
}

export const mockSPUStore = new MockSPUStore();
```

---

## 2. MSW Handler 数据变更最佳实践

### Decision

采用 **单例模式 + 同步操作 + 返回副本** 的策略:

1. 使用单例 `mockSPUStore` 管理所有 SPU 数据
2. MSW handlers 同步调用 store 的方法修改数据
3. 所有读取操作返回数据副本,防止外部直接修改内部状态

### Rationale

1. **单例模式确保数据唯一性**:
   - 所有 handlers 共享同一个数据源,避免数据不一致
   - 方便集中管理数据状态和生命周期

2. **同步操作符合 MSW 设计**:
   - MSW handlers 设计为同步执行(或使用 async/await)
   - 避免竞态条件,简化逻辑

3. **返回副本防止外部修改**:
   - 使用 `[...data]` 或 `structuredClone(data)` 返回副本
   - 保护内部状态,遵循不可变数据原则

### Best Practices from MSW Official Docs

1. **使用内存状态管理**: MSW 官方推荐使用全局变量或 Map/Set 管理 mock 数据
   ```typescript
   // ✅ 推荐
   const mockDatabase = new Map<string, User>();

   // ❌ 不推荐: 每次请求重新生成数据
   http.get('/users', () => {
     const users = generateUsers(); // 每次都是新数据,无法模拟 CRUD
     return HttpResponse.json(users);
   });
   ```

2. **数据操作应该有副作用**: DELETE 请求应该真正删除数据,而非仅返回成功响应
   ```typescript
   // ✅ 正确
   http.delete('/api/users/:id', ({ params }) => {
     mockDatabase.delete(params.id);
     return HttpResponse.json({ success: true });
   });

   // ❌ 错误
   http.delete('/api/users/:id', () => {
     return HttpResponse.json({ success: true }); // 未实际删除
   });
   ```

3. **避免数据竞争**: 使用同步操作或正确处理异步逻辑
   ```typescript
   // ✅ 同步操作,无竞争
   const users = mockDatabase.getAll();
   mockDatabase.delete(id);

   // ⚠️ 异步操作需要注意顺序
   await delay(1000);
   const users = mockDatabase.getAll(); // 确保 delay 后再获取
   ```

### Alternatives Considered

| 方案 | 优势 | 劣势 | 不采用原因 |
|------|------|------|----------|
| **每次重新生成数据** | 实现简单 | 无法模拟 CRUD,数据不一致 | 导致当前 bug,已证明不可行 |
| **使用 Zustand/Redux** | 完整的状态管理 | 过度复杂,引入不必要的依赖 | Mock 数据不需要复杂状态管理 |
| **直接修改全局数组** | 实现最简单 | 缺少封装,容易误用 | 缺少数据保护,单例模式更优 |

---

## 3. 批量操作 API 设计模式

### Decision

采用 **POST /api/spu/batch** 统一批量操作端点,使用 `operation` 字段区分操作类型:

```typescript
// Request
POST /api/spu/batch
{
  "operation": "delete", // "delete" | "updateStatus" | "copy" | ...
  "ids": ["SPU001", "SPU002", "SPU003"],
  "additionalParams": { ... } // 可选,用于 updateStatus 等操作
}

// Response
{
  "success": true,
  "data": {
    "processedCount": 3,
    "failedCount": 0,
    "results": [ // 可选,详细结果
      { "id": "SPU001", "success": true },
      { "id": "SPU002", "success": true },
      { "id": "SPU003", "success": true }
    ]
  },
  "message": "批量删除操作成功"
}
```

### Rationale

1. **统一端点 vs 多个端点**:
   - ✅ **统一端点**: 一个 `/api/spu/batch` 支持多种操作(delete, updateStatus, copy)
   - ❌ 多个端点: `/api/spu/batch-delete`, `/api/spu/batch-update-status`, ... (端点爆炸)

2. **POST vs DELETE 方法**:
   - ✅ **使用 POST**: 批量操作通常需要复杂的 request body,POST 更合适
   - ❌ 使用 DELETE: `DELETE /api/spu?ids=1,2,3` 不够 RESTful,且 URL 长度有限

3. **operation 字段设计**:
   - 使用字符串枚举: `"delete"`, `"updateStatus"`, `"copy"`, ...
   - 易于扩展新操作类型,无需修改 API 路由

4. **错误处理策略**:
   - 支持部分成功场景: `processedCount` + `failedCount`
   - 可选 `results` 数组返回每个 ID 的详细结果
   - 前端根据 `failedCount` 决定提示内容

### Alternatives Considered

| 方案 | 优势 | 劣势 | 不采用原因 |
|------|------|------|----------|
| **DELETE /api/spu?ids=1,2,3** | RESTful 语义清晰 | URL 长度限制,不支持复杂参数 | 批量操作需要 request body |
| **POST /api/spu/batch-delete** | 每个操作独立端点 | 端点数量过多,维护成本高 | 不够灵活,难以扩展 |
| **GraphQL mutation** | 灵活,支持复杂操作 | 引入 GraphQL 依赖,学习曲线 | 项目使用 REST,不引入新技术栈 |
| **使用 HTTP PATCH** | 符合部分更新语义 | 批量删除不是"部分更新" | 语义不匹配 |

### API Contract Example (OpenAPI 3.0)

```yaml
paths:
  /api/spu/batch:
    post:
      summary: 批量操作 SPU
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                operation:
                  type: string
                  enum: [delete, updateStatus, copy]
                ids:
                  type: array
                  items:
                    type: string
                additionalParams:
                  type: object
      responses:
        200:
          description: 操作成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      processedCount:
                        type: integer
                      failedCount:
                        type: integer
```

---

## 4. 前端 Service 层 HTTP 请求实现

### Decision

修改 `spuService.ts` 的 `batchDeleteSPU()` 方法,调用真实的 HTTP API:

```typescript
async batchDeleteSPU(ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
  try {
    const response = await fetch('/api/spu/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'delete',
        ids,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: result.success,
      data: {
        success: result.data.processedCount,
        failed: result.data.failedCount,
      },
      message: result.message,
      code: response.status,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      data: { success: 0, failed: ids.length },
      message: error instanceof Error ? error.message : '批量删除失败',
      code: 500,
      timestamp: Date.now(),
    };
  }
}
```

### Rationale

1. **使用 Fetch API**:
   - 原生 API,无需引入 axios 等依赖
   - 项目其他部分也使用 fetch,保持一致性

2. **错误处理**:
   - 捕获网络错误和 HTTP 错误
   - 返回统一的 `ApiResponse` 格式,便于上层调用

3. **移除 setTimeout 模拟延迟**:
   - MSW handler 内部已有 `delay(1000)`,无需重复模拟

---

## 5. 测试策略

### Unit Tests (Vitest)

测试 `mockSPUStore` 和 `spuService.ts`:

```typescript
// mockSPUStore.test.ts
describe('MockSPUStore', () => {
  it('should delete SPUs by ids', () => {
    const result = mockSPUStore.deleteMany(['SPU001', 'SPU002']);
    expect(result.success).toBe(2);
    expect(result.failed).toBe(0);
  });

  it('should handle non-existent ids', () => {
    const result = mockSPUStore.deleteMany(['INVALID_ID']);
    expect(result.success).toBe(0);
    expect(result.failed).toBe(1);
  });
});

// spuService.test.ts (使用 MSW 拦截请求)
describe('spuService.batchDeleteSPU', () => {
  it('should call /api/spu/batch with correct payload', async () => {
    const result = await spuService.batchDeleteSPU(['SPU001']);
    expect(result.success).toBe(true);
    expect(result.data.success).toBe(1);
  });
});
```

### E2E Tests (Playwright)

测试完整的用户操作流程:

```typescript
test('batch delete SPUs', async ({ page }) => {
  await page.goto('/spu/list');

  // 选中 3 个 SPU
  await page.check('[data-testid="spu-checkbox-1"]');
  await page.check('[data-testid="spu-checkbox-2"]');
  await page.check('[data-testid="spu-checkbox-3"]');

  // 点击批量删除
  await page.click('[data-testid="batch-delete-button"]');

  // 确认弹窗
  await page.click('[data-testid="confirm-delete"]');

  // 等待成功提示
  await expect(page.locator('.ant-message-success')).toBeVisible();

  // 刷新页面验证数据已删除
  await page.reload();
  await expect(page.locator('[data-testid="spu-row-1"]')).not.toBeVisible();
});
```

---

## Summary

| 技术决策 | 选择方案 | 关键原因 |
|---------|---------|---------|
| Mock 数据持久化 | 全局变量 + localStorage (可选) | 性能优,符合 MSW 最佳实践 |
| MSW Handler 实现 | 单例 mockSPUStore + 同步操作 | 数据一致性,避免竞态 |
| API 设计 | POST /api/spu/batch | 统一端点,易扩展,支持复杂参数 |
| HTTP 请求实现 | Fetch API | 原生 API,保持项目一致性 |
| 测试策略 | Vitest 单元测试 + Playwright E2E | 覆盖 service 层和用户流程 |

所有技术选型均已考虑项目现有架构、性能要求、开发效率和可维护性,确保修复方案简洁可靠。

---

**版本历史**:
- v1.0 - 初始研究文档创建
- 创建日期: 2026-01-09
- 创建者: Claude AI

# Feature Specification: SPU 批量删除功能修复

**Feature Branch**: `P007-fix-spu-batch-delete`
**Created**: 2026-01-09
**Status**: Draft
**Input**: User description: "了解spec中关于spu 相关的md,有一个bug 需要fix 就是 批量删除虽然提示成功 但实际并没有删除"

## User Scenarios & Testing

### User Story 1 - 批量删除 SPU 商品 (Priority: P1)

**场景描述**: 作为商品管理员,当我在 SPU 列表页面选中多个不需要的商品后,点击"批量删除"按钮并确认操作,系统应该真实地删除这些商品,而不仅仅是显示成功提示但实际数据仍然存在。

**为什么是 P1 优先级**: 批量删除是核心的数据管理功能,当前的 bug 会导致用户对系统失去信任(看到成功提示但数据未删除),造成数据管理混乱。这是一个严重影响用户体验和数据准确性的缺陷。

**独立测试方式**:
1. 在 SPU 列表页面选中 3 个测试商品
2. 点击批量删除按钮并确认
3. 刷新页面或重新查询
4. 验证这 3 个商品确实从列表中消失

**验收场景**:

1. **Given** SPU 列表中有 10 个商品,用户选中了其中 3 个商品, **When** 用户点击"批量删除"按钮并在确认弹窗中点击"确认删除", **Then** 系统调用删除 API,成功删除这 3 个商品,并显示"成功删除 3 个 SPU"的提示消息,列表刷新后只剩下 7 个商品

2. **Given** 用户已经选中了 5 个 SPU 商品, **When** 用户点击批量删除并确认后等待 2 秒, **Then** 页面显示 loading 状态,删除完成后显示成功提示,选中状态被清空,列表数据从后端重新加载并更新

3. **Given** 用户选中了 2 个商品准备删除, **When** 用户在确认删除弹窗中点击"取消"按钮, **Then** 删除操作不执行,商品仍然存在于列表中,选中状态保持不变

### Edge Cases

- 当用户选中的商品在删除前已被其他用户删除时,如何处理?系统应该返回部分成功的结果,提示用户"成功删除 2 个,失败 1 个(商品不存在)"
- 当网络请求失败或后端返回错误时,如何处理?系统应该显示错误提示,保持选中状态,允许用户重试
- 当用户在删除请求发送后但未完成时刷新页面,如何处理?系统应该允许重新查询,显示实际的删除结果
- 当选中的商品数量很多(如 100 个)时,删除操作需要多长时间?系统应该显示进度指示器,避免用户等待焦虑

## Requirements

### Functional Requirements

- **FR-001**: 系统必须在用户确认批量删除后,实际调用后端 API 删除接口 (DELETE /api/spu/batch 或类似端点),而非仅返回模拟的成功响应

- **FR-002**: 系统必须在删除操作完成后,重新从后端加载 SPU 列表数据,确保页面显示的数据与后端数据库保持一致

- **FR-003**: 系统必须在批量删除过程中显示 loading 加载状态,防止用户重复点击或执行其他操作

- **FR-004**: 系统必须在删除成功后清空已选中的商品状态 (selectedRowKeys),避免用户误操作

- **FR-005**: 系统必须在删除失败时显示明确的错误提示信息,并保持选中状态,允许用户重试删除操作

- **FR-006**: 系统必须支持部分成功的批量删除结果处理,例如选中 5 个商品,成功删除 3 个,失败 2 个,需要明确提示用户结果

### Key Entities

- **SPU (Standard Product Unit)**: 标准商品单元,包含 id(唯一标识符)、name(商品名称)、code(商品编码)、status(状态)、brandId(品牌ID)、categoryId(分类ID) 等属性
- **BatchDeleteRequest**: 批量删除请求,包含 ids(待删除的 SPU ID 数组)、operation(操作类型,固定为 "delete") 等字段
- **BatchDeleteResponse**: 批量删除响应,包含 success(是否成功)、processedCount(处理数量)、failedCount(失败数量)、message(提示信息) 等字段

## Success Criteria

### Measurable Outcomes

- **SC-001**: 用户执行批量删除操作后,在 3 秒内看到删除结果提示,列表数据在 5 秒内完成刷新

- **SC-002**: 批量删除操作的成功率达到 100%(在正常网络和后端服务可用的情况下),删除后的数据一致性达到 100%(页面显示与数据库实际数据完全一致)

- **SC-003**: 用户在执行批量删除时,能够清晰地看到操作进度(loading 状态)和明确的成功/失败提示,减少用户对操作结果的疑惑

- **SC-004**: 修复后的批量删除功能能够通过自动化测试验证,包括单元测试(service 层)和端到端测试(完整的用户操作流程)

## Assumptions

- 假设后端已经提供了批量删除 API 接口 (如 POST /api/spu/batch,携带 operation: "delete" 和 ids 数组),前端需要正确调用此接口
- 假设 MSW (Mock Service Worker) 已经配置了批量删除的 mock handler,能够模拟真实的删除行为(从内存中的 mock 数据中移除对应的记录)
- 假设当前的 SPU 数据是基于 Mock 数据管理(前端内存状态),需要在 spuService.ts 中调用 HTTP 请求,并在 MSW handlers 中正确处理删除逻辑
- 假设用户在执行批量删除前已经选中了至少 1 个商品,系统会禁用批量删除按钮当选中数量为 0 时

## Known Issues & Root Cause Analysis

### 当前问题描述

用户在 SPU 列表页面选中多个商品后,点击"批量删除"按钮并确认,系统显示"成功删除 X 个 SPU"的提示消息,但实际刷新页面后,这些商品仍然存在于列表中,未被真正删除。

### 根本原因分析

通过代码审查发现以下问题:

1. **spuService.ts 中的 batchDeleteSPU 方法未调用真实 API**:
   - 文件位置: `frontend/src/services/spuService.ts:459-481`
   - 当前代码仅模拟了延迟和返回成功响应,未发起 HTTP 请求
   ```typescript
   async batchDeleteSPU(ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
     try {
       // 模拟API请求延迟
       await new Promise((resolve) => setTimeout(resolve, 1200));

       // Mock批量删除结果 (仅返回成功响应,未实际删除数据)
       return {
         success: true,
         data: { success: ids.length, failed: 0 },
         message: `成功删除${ids.length}个SPU`,
         code: 200,
         timestamp: Date.now(),
       };
     } catch (error) {
       // ...
     }
   }
   ```

2. **MSW handlers 中的批量操作 handler 未正确处理删除逻辑**:
   - 文件位置: `frontend/src/mocks/handlers/index.ts:153-166`
   - 当前 handler 仅返回成功响应,未从 mock 数据源中移除对应的 SPU 记录
   ```typescript
   http.post('/api/spu/batch', async ({ request }) => {
     await delay(1000);

     const { operation, ids } = (await request.json()) as any;

     // 仅返回成功响应,未实际修改 mockSPUList 数据
     return HttpResponse.json({
       success: true,
       data: {
         processedCount: ids.length,
         operation,
       },
       message: `批量${operation}操作成功`,
     });
   }),
   ```

3. **缺少持久化的 mock 数据管理机制**:
   - 当前 mock 数据通过 `generateMockSPUList(100)` 每次动态生成,未使用全局状态或数据库存储
   - 即使 handler 中尝试删除数据,下次查询时仍会重新生成相同的 mock 数据

### 修复方案建议

1. **修改 spuService.ts 的 batchDeleteSPU 方法**: 添加真实的 HTTP 请求调用
2. **修改 MSW batch handler**: 实现真正的删除逻辑,从持久化的 mock 数据中移除记录
3. **引入持久化的 mock 数据管理**: 使用全局变量或 localStorage 存储 mock SPU 数据,确保数据在多次请求间保持一致

---

**版本历史**:
- v1.0 - 初始版本创建,分析批量删除 bug 根本原因
- 创建日期: 2026-01-09
- 创建者: Claude AI

# P004 库存调整功能开发总结

> 版本：v1.0  
> 更新时间：2025-12-27  
> 作者：开发团队

## 概述

本文档记录在库存调整（P004）功能开发过程中，通过 Chrome DevTools 测试发现的问题及其修复过程。主要涉及前端响应解析错误和后端库存更新逻辑缺失两个关键问题。

---

## 问题1：前端响应解析错误

### 问题发现

在使用 Chrome DevTools 进行盘亏调整功能测试时，发现以下异常现象：

- **API 请求**：`POST /api/adjustments` 返回 HTTP 201 Created
- **前端表现**：显示"创建调整失败"错误提示

通过 Chrome DevTools Network 面板检查，确认后端返回了正确的响应：

```json
{
  "data": {
    "id": "xxx-xxx-xxx",
    "adjustmentNo": "ADJ20251226001",
    "status": "COMPLETED",
    ...
  }
}
```

### 根本原因分析

问题出在前端响应解析逻辑上。

**后端 ApiResponse 结构**：
```java
public class ApiResponse<T> {
    private T data;
    private String error;
    private String message;
    // 注意：没有 success 字段
}
```

**前端错误的判断逻辑**：
```typescript
// useInventoryAdjustment.ts (错误代码)
if (!response.success) {
  throw new Error(response.message || '创建调整失败');
}
```

由于后端 `ApiResponse` 没有 `success` 字段，`response.success` 的值为 `undefined`，导致 `!response.success` 判断为 `true`，从而错误地抛出异常。

### 修复措施

修改 `frontend/src/features/inventory/hooks/useInventoryAdjustment.ts`，将响应检查逻辑从检查 `success` 字段改为检查 `error` 字段：

```typescript
// 修复后的代码
if (response.error) {
  throw new Error(response.error || '创建调整失败');
}
return response.data;
```

### 修复文件

| 文件路径 | 修改内容 |
|---------|---------|
| `frontend/src/features/inventory/hooks/useInventoryAdjustment.ts` | 修改 `createAdjustmentMutation` 的响应解析逻辑 |

---

## 问题2：后端库存更新逻辑缺失

### 问题发现

修复前端响应解析问题后，继续测试发现新问题：

- **API 请求**：调整记录创建成功，返回 `stockAfter=1280`
- **页面刷新**：库存列表显示的库存数量仍为 `1290`，未发生变化

通过 Chrome DevTools 刷新页面并检查 `GET /api/inventory` 响应，确认数据库中的库存数量确实没有更新。

### 根本原因分析

检查后端代码 `InventoryAdjustmentService.java`，发现 `updateInventoryStock` 方法存在严重问题：

**原始代码（问题代码）**：
```java
/**
 * 更新库存数量
 * TODO: 实现库存更新逻辑
 */
private void updateInventoryStock(UUID skuId, UUID storeId, int stockAfter, int availableAfter) {
    // 实际应该调用 inventoryRepository 更新库存
    // 这里暂时只记录日志
    logger.info("Updating inventory: skuId={}, storeId={}, stockAfter={}, availableAfter={}",
        skuId, storeId, stockAfter, availableAfter);
}
```

该方法被标记为 TODO，只记录日志而没有实际更新数据库中的库存数量。

### 修复措施

实现完整的库存更新逻辑，调用 `inventoryRepository.updateInventoryQty()` 方法更新数据库：

```java
/**
 * 更新库存数量
 * 立即更新库存表中的现存数量和可用数量
 */
private void updateInventoryStock(UUID skuId, UUID storeId, int stockAfter, int availableAfter) {
    logger.info("Updating inventory: skuId={}, storeId={}, stockAfter={}, availableAfter={}",
        skuId, storeId, stockAfter, availableAfter);
    
    // 查询库存记录获取ID
    var inventoryOpt = inventoryRepository.findBySkuIdAndStoreId(skuId, storeId);
    if (inventoryOpt.isEmpty()) {
        logger.error("Inventory record not found for update: skuId={}, storeId={}", skuId, storeId);
        throw new ResourceNotFoundException("库存记录", "skuId=" + skuId + ", storeId=" + storeId);
    }
    
    var inventory = inventoryOpt.get();
    boolean success = inventoryRepository.updateInventoryQty(
        inventory.getId(),
        new BigDecimal(stockAfter),
        new BigDecimal(availableAfter)
    );
    
    if (!success) {
        logger.error("Failed to update inventory: id={}", inventory.getId());
        throw new BusinessException("UPDATE_FAILED", "更新库存失败");
    }
    
    logger.info("Inventory updated successfully: id={}, stockAfter={}, availableAfter={}",
        inventory.getId(), stockAfter, availableAfter);
}
```

### 修复文件

| 文件路径 | 修改内容 |
|---------|---------|
| `backend/src/main/java/com/cinema/inventory/service/InventoryAdjustmentService.java` | 实现 `updateInventoryStock` 方法的完整逻辑 |

### 相关依赖

`StoreInventoryRepository` 中已有 `updateInventoryQty` 方法可用：

```java
public boolean updateInventoryQty(UUID id, BigDecimal onHandQty, BigDecimal availableQty) {
    // 通过 Supabase REST API 更新库存
    Map<String, Object> updateData = new HashMap<>();
    updateData.put("on_hand_qty", onHandQty);
    updateData.put("available_qty", availableQty);
    updateData.put("updated_at", java.time.Instant.now().toString());
    
    webClient.patch()
        .uri("/store_inventory?id=eq." + id)
        .bodyValue(updateData)
        .retrieve()
        .toBodilessEntity()
        .block();
    
    return true;
}
```

---

## 测试验证

### 测试环境

- 前端：`http://localhost:3000`
- 后端：`http://localhost:10086`
- 测试工具：Chrome DevTools (MCP)

### 测试步骤

1. **进入库存查询页面**
   - 导航至 `/inventory/query`
   - 确认页面正常加载库存列表

2. **发起盘亏调整**
   - 点击"奶油爆米花(大)"的"调整"按钮
   - 填写调整表单：
     - 调整类型：盘亏
     - 调整数量：5 桶
     - 调整原因：销售损耗
   - 确认调整后库存预览：1290 → 1285

3. **提交调整**
   - 点击"确认调整"按钮
   - 等待 loading 状态完成

4. **验证结果**
   - 检查 Network 面板：`POST /api/adjustments` 返回 201 Created
   - 刷新页面，确认库存列表显示更新后的值

### 测试结果

| 测试项 | 预期结果 | 实际结果 | 状态 |
|-------|---------|---------|------|
| API 调用 | POST 返回 201 | 返回 201 Created | ✅ 通过 |
| 前端提示 | 显示成功提示 | 调整成功，无错误 | ✅ 通过 |
| 库存更新 | 1290 → 1285 | 库存显示 1285 | ✅ 通过 |
| 页面刷新 | 列表自动刷新 | 自动触发刷新 | ✅ 通过 |

### 验证截图（文字描述）

修复后的库存查询页面显示：

```
SKU编码         SKU名称           现存数量    可用数量    预占数量    库存状态
6901234567026   奶油爆米花(大)    1285.00     1235.00     24.00       充足
```

---

## 经验总结

### 问题预防建议

1. **前后端接口契约一致性**
   - 在开发前明确 API Response 结构
   - 前端判断逻辑应基于实际的字段（如 `error`）而非假设的字段（如 `success`）
   - 建议在 `api-diff-report.md` 中记录响应格式

2. **后端代码完整性**
   - 标记为 TODO 的代码应在上线前完成实现
   - 关键业务逻辑（如库存更新）应有单元测试覆盖
   - 代码审查时需关注只记录日志而无实际操作的方法

3. **测试驱动开发**
   - 使用 Chrome DevTools 进行端到端测试
   - 验证 API 请求和响应的完整性
   - 确认数据库状态变更符合预期

### 相关文档

| 文档 | 路径 |
|-----|------|
| 需求规格 | `specs/P004-inventory-adjustment/spec.md` |
| 任务清单 | `specs/P004-inventory-adjustment/tasks.md` |
| API 契约 | `specs/P004-inventory-adjustment/contracts/api.yaml` |
| 数据模型 | `specs/P004-inventory-adjustment/data-model.md` |

---

## 变更历史

| 版本 | 日期 | 作者 | 变更说明 |
|-----|------|-----|---------|
| v1.0 | 2025-12-27 | 开发团队 | 初始版本，记录盘亏调整功能测试发现的问题及修复 |

# 库存不足处理功能分析报告

**分析日期**: 2025-12-29
**模块**: O003-饮品订单创建与出品管理
**功能**: 库存不足处理

---

## 📊 分析结论

**状态**: ✅ **已实现（部分需要修复）**

库存不足处理功能的核心逻辑已经完整实现，但存在一个 GlobalExceptionHandler 的配置问题需要修复。

---

## ✅ 已实现的功能

### 1. 库存验证逻辑 (T088)

**文件**: `backend/src/main/java/com/cinema/beverage/service/BomDeductionService.java`

#### 实现要点：

1. **validateInventory() 方法** (Line 128-182)
   - 在执行扣料前验证所有原料的库存充足性
   - 逐个检查每个原料的可用库存 vs 需求数量
   - 如果任何一项库存不足，收集错误信息并抛出异常

2. **库存查询集成** (Line 136-145)
   ```java
   InventoryIntegrationService.InventoryInfo inventory = queryInventory(item.getSkuId(), item.getStoreId());

   if (inventory == null) {
       String error = String.format("库存记录不存在: %s (SKU: %s)", item.getMaterialName(), item.getSkuId());
       insufficientItems.add(error);
       continue;
   }
   ```

3. **数量比较验证** (Line 148-163)
   ```java
   BigDecimal availableQty = getAvailableQty(inventory);
   BigDecimal requiredQty = BigDecimal.valueOf(item.getQuantity());

   if (availableQty.compareTo(requiredQty) < 0) {
       String error = String.format("%s: 可用库存 %s %s < 需求 %s %s",
               item.getMaterialName(), availableQty, item.getUnit(), requiredQty, item.getUnit());
       insufficientItems.add(error);
   }
   ```

4. **异常抛出** (Line 173-178)
   ```java
   if (!insufficientItems.isEmpty()) {
       String errorMessage = "库存不足，无法完成扣料:\n" + String.join("\n", insufficientItems);
       throw new InsufficientInventoryException(errorMessage);
   }
   ```

### 2. 事务回滚机制

**文件**: `backend/src/main/java/com/cinema/beverage/service/BomDeductionService.java`

- **@Transactional 注解** (Line 58)
  ```java
  @Transactional(rollbackFor = Exception.class)
  public BomDeductionResult deductMaterialsForOrder(BeverageOrder order)
  ```

- **异常重新抛出** (Line 99-105)
  ```java
  } catch (InsufficientInventoryException e) {
      // T088: 库存不足异常，触发事务回滚
      logger.error("BomDeduction - INSUFFICIENT_INVENTORY: orderNumber={}, orderId={}, operation=BOM_DEDUCT, error={}",
              order.getOrderNumber(), order.getId(), e.getMessage());
      result.setSuccess(false);
      result.setErrorMessage(e.getMessage());
      throw e; // 重新抛出异常以触发事务回滚
  }
  ```

### 3. 异常类定义

**文件**: `backend/src/main/java/com/cinema/beverage/exception/InsufficientInventoryException.java`

```java
/**
 * @spec O003-beverage-order
 * 库存不足异常 (T088)
 */
public class InsufficientInventoryException extends RuntimeException {
    public InsufficientInventoryException(String message) {
        super(message);
    }

    public InsufficientInventoryException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 4. 结构化日志记录

**文件**: `BomDeductionService.java`

完整的日志追踪：
- **InventoryValidation - START**: 开始验证库存
- **InventoryValidation - NOT_FOUND**: 库存记录不存在
- **InventoryValidation - INSUFFICIENT**: 库存不足
- **InventoryValidation - OK**: 库存充足
- **InventoryValidation - FAILED**: 验证失败（库存不足）
- **InventoryValidation - SUCCESS**: 验证成功
- **BomDeduction - INSUFFICIENT_INVENTORY**: BOM扣料因库存不足失败

---

## ❌ 发现的问题

### Issue: GlobalExceptionHandler 未处理饮品模块的 InsufficientInventoryException

**文件**: `backend/src/main/java/com/cinema/common/exception/GlobalExceptionHandler.java`

**当前状态**:
- ✅ 已处理 `com.cinema.reservation.exception.InsufficientInventoryException` (Line 9, 148-154)
- ❌ 未处理 `com.cinema.beverage.exception.InsufficientInventoryException`

**影响**:
- 饮品订单的库存不足异常会被默认异常处理器捕获，返回 500 错误
- 无法返回标准的 409 CONFLICT 状态码和清晰的错误信息

**修复方案**:

在 `GlobalExceptionHandler.java` 中添加导入和处理器：

```java
// 1. 添加导入
import com.cinema.beverage.exception.InsufficientInventoryException as BeverageInsufficientInventoryException;

// 2. 添加异常处理方法
/**
 * 处理饮品订单库存不足异常
 *
 * @param ex      异常对象
 * @param request Web 请求
 * @return 409 响应
 */
@ExceptionHandler(BeverageInsufficientInventoryException.class)
public ResponseEntity<ErrorResponse> handleBeverageInsufficientInventory(
        BeverageInsufficientInventoryException ex, WebRequest request) {
    logger.warn("Beverage order insufficient inventory: {}", ex.getMessage());
    ErrorResponse error = ErrorResponse.of("BEV_INSUFFICIENT_INVENTORY", ex.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
}
```

或者更优雅的方案（处理所有同名异常）：

```java
/**
 * 处理所有库存不足异常（预订和饮品订单）
 */
@ExceptionHandler({
    com.cinema.reservation.exception.InsufficientInventoryException.class,
    com.cinema.beverage.exception.InsufficientInventoryException.class
})
public ResponseEntity<ErrorResponse> handleInsufficientInventory(
        Exception ex, WebRequest request) {
    logger.warn("Insufficient inventory: {}", ex.getMessage());
    ErrorResponse error = ErrorResponse.of("INSUFFICIENT_INVENTORY", ex.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
}
```

---

## 🧪 验证建议

### 1. 单元测试验证

创建测试用例验证库存不足场景：

```java
@Test
void shouldThrowInsufficientInventoryExceptionWhenStockIsLow() {
    // Given: 库存不足的场景
    // 咖啡豆库存仅 10g，但需要 25g

    // When: 执行BOM扣料
    // Then: 抛出 InsufficientInventoryException
    // And: 事务回滚，订单状态保持 PENDING_PRODUCTION
}
```

### 2. 集成测试验证

运行 E2E 测试中的 TC-BEV-002（库存不足异常测试）：

```bash
npx jest tests/e2e/api/tc_bev_002_insufficient_inventory.test.ts
```

预期结果：
- HTTP 409 CONFLICT
- 错误码: `INSUFFICIENT_INVENTORY` 或 `BEV_INSUFFICIENT_INVENTORY`
- 错误信息包含具体不足的原料清单

---

## 📝 测试用例覆盖

### TC-BEV-002: 订单状态流转异常 - 制作中时库存不足

**状态**: ⏸️ TODO (测试代码待实现)

**测试步骤**:
1. 准备测试环境：将咖啡豆库存设置为 10g（不足 25g）
2. 创建订单并完成支付（状态: PENDING_PRODUCTION）
3. 调用 "开始制作" API
4. 验证返回 409 错误，错误信息包含 "咖啡豆: 可用库存 10 g < 需求 25 g"
5. 验证订单状态仍为 PENDING_PRODUCTION（未变更为 PRODUCING）
6. 验证所有原料库存未被扣减

---

## 🎯 总结

| 功能项 | 状态 | 完成度 |
|-------|------|--------|
| 库存验证逻辑 | ✅ 已实现 | 100% |
| 事务回滚机制 | ✅ 已实现 | 100% |
| 异常类定义 | ✅ 已实现 | 100% |
| 结构化日志 | ✅ 已实现 | 100% |
| 全局异常处理 | ❌ 需修复 | 50% |
| 测试用例 | ⏸️ 待实现 | 0% |

**总体完成度**: 约 80%

**下一步行动**:
1. 修复 GlobalExceptionHandler（5分钟）
2. 实现 TC-BEV-002 测试代码（30分钟）
3. 运行测试验证功能正确性（10分钟）

---

**报告生成**: Claude Code
**分析工具**: 代码审查 + 文件检索

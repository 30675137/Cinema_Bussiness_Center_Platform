# 库存相关 Spec 完整汇总

**分析日期**: 2025-12-29
**分析工具**: Claude Code
**目的**: 全面梳理项目中所有与库存管理相关的功能规格

---

## 📊 核心库存管理 Specs (8个)

按库存相关度从高到低排序：

### 1. 🔴 P003-inventory-query (122次提及)

**功能**: 门店SKU库存查询
**分支**: `P003-inventory-query`
**优先级**: P0 (基础设施)
**依赖**: P001-sku-master-data

**核心功能**:
- **US1**: 查看门店库存列表（分页、筛选、排序）
- **US2**: 搜索库存（按SKU名称/编码/分类）

**API 端点**:
- `GET /api/inventory/query` - 查询门店库存

**数据模型**:
- `store_inventory` 表（关联 SKU、门店、库存数量）

**与库存验证的关系**:
- 被 O003-beverage-order 调用进行库存充足性验证（T086）
- 被 U001-reservation-order-management 调用进行场次库存查询

---

### 2. 🔴 P004-inventory-adjustment (112次提及)

**功能**: 库存调整管理
**分支**: `P004-inventory-adjustment`
**优先级**: P1 (核心业务)
**依赖**: P003-inventory-query

**核心功能**:
- **US1**: 录入库存调整（入库、出库、盘盈、盘亏）
- **US2**: 查看库存流水记录（审计日志）

**API 端点**:
- `POST /api/adjustments` - 创建库存调整
- `GET /api/adjustments` - 查询调整记录

**数据模型**:
- `inventory_adjustments` 表（调整类型、数量、原因、操作人）
- `adjustment_reasons` 表（预定义调整原因）

**与库存扣减的关系**:
- 被 O003-beverage-order BOM扣料调用（T089）
- 支持事务性库存扣减（悲观锁）

---

### 3. 🔴 003-inventory-management (101次提及)

**功能**: 库存与仓店库存管理系统
**分支**: `003-inventory-management`
**优先级**: P1
**依赖**: P001, P003, P004

**核心功能**:
- **US1**: 库存台账查看与筛选
- **US2**: 库存流水追踪与对账

**特点**:
- 综合性库存管理平台
- 整合查询和调整功能
- 提供报表和统计分析

---

### 4. 🟡 O003-beverage-order (37次提及)

**功能**: 饮品订单创建与出品管理
**分支**: `O003-beverage-order` ⭐ **当前分支**
**优先级**: P1 MVP
**依赖**: P003-inventory-query, P004-inventory-adjustment

**库存相关功能**:
- **US2 - AC3**: 开始制作时自动 BOM 扣料
- **US2 - AC6**: 库存不足时阻止制作并提示

**关键任务**:
- **T086**: 调用 P003 查询 API 验证库存充足性
- **T088**: 实现 `validateInventory()` 库存验证逻辑（**包含库存不足处理**）
- **T089**: 调用 P004 执行 BOM 扣料

**库存验证流程** (T088):
```
1. 计算原料需求（根据配方 + 订单数量）
2. 调用 P003 API 查询当前库存
3. 验证每个原料的 可用库存 >= 需求数量
4. 如果任何原料不足 → 抛出 InsufficientInventoryException
5. 如果验证通过 → 调用 P004 执行扣料
```

**异常类**:
- `InsufficientInventoryException` - 库存不足异常（触发事务回滚）

**测试用例**:
- **TC-BEV-002**: 库存不足异常测试（验证阻止扣料、事务回滚）

---

### 5. 🟡 P001-sku-master-data (36次提及)

**功能**: SKU主数据管理(支持BOM)
**分支**: `P001-sku-master-data`
**优先级**: P0 (基础数据)

**库存相关功能**:
- SKU 与库存的主数据关联
- 支持 BOM 配方定义（用于自动扣料）

**数据模型**:
- `skus` 表（商品/原料主数据）
- `bom_recipes` 表（配方定义）
- `bom_ingredients` 表（配方原料清单）

---

### 6. 🟢 005-sku-management (34次提及)

**功能**: SKU 管理
**分支**: `005-sku-management`
**优先级**: P1

**库存相关功能**:
- SKU 库存状态查看
- SKU 与库存联动管理

---

### 7. 🟢 U001-reservation-order-management (28次提及)

**功能**: 预约单管理系统
**分支**: `U001-reservation-order-management`
**优先级**: P1

**库存相关功能**:
- **场次库存**: 影厅场次的库存管理（座位/时段）
- **预约锁定**: 创建预约单时锁定场次库存
- **库存释放**: 取消预约时释放库存

**与商品库存的区别**:
- 场次库存（时间维度）vs 商品库存（数量维度）
- 使用 `slot_inventory_snapshot` 表管理

---

### 8. 🟢 P002-unit-conversion (12次提及)

**功能**: 单位换算系统
**分支**: `P002-unit-conversion`
**优先级**: P2 (辅助功能)

**库存相关功能**:
- 库存数量的单位换算（kg ↔ g, L ↔ ml）
- 支持 BOM 配方中的单位转换

---

## 🔗 库存功能依赖关系图

```
P001 (SKU主数据)
  ↓
P003 (库存查询) ←─────┐
  ↓                   │
P004 (库存调整)       │
  ↓                   │
┌─────────┬──────────┐
│         │          │
O003      U001       003
(饮品订单) (预约单)  (库存管理台)
BOM扣料   场次库存   综合管理
```

**依赖说明**:
1. **P001** 是基础，定义了 SKU 和 BOM
2. **P003** 基于 P001，提供库存查询能力
3. **P004** 依赖 P003，执行库存调整
4. **O003** 依赖 P003+P004，实现 BOM 自动扣料
5. **U001** 使用独立的场次库存模型
6. **003** 整合 P003+P004，提供统一管理界面

---

## 📋 库存不足处理功能分布

| Spec | 功能模块 | 库存验证逻辑 | 异常处理 | 事务回滚 |
|------|---------|------------|---------|---------|
| **O003-beverage-order** | BOM扣料 | ✅ T088 `validateInventory()` | ✅ `InsufficientInventoryException` | ✅ `@Transactional` |
| **U001-reservation-order-management** | 场次预约 | ✅ 场次库存检查 | ✅ `InsufficientInventoryException` | ✅ 悲观锁 |
| **P004-inventory-adjustment** | 手动调整 | ⚠️ 前端验证 | ❌ 无业务异常 | ✅ 数据库约束 |
| **P003-inventory-query** | 查询服务 | ❌ 仅查询 | N/A | N/A |

**结论**: 库存不足处理功能主要在 **O003** 和 **U001** 中实现，P003/P004 作为基础服务被调用。

---

## 🧪 测试用例覆盖

### O003-beverage-order
- ✅ **TC-BEV-001**: 正向流程（BOM扣料成功）
- ⏸️ **TC-BEV-002**: 库存不足异常测试（**待实现**）
- ⏸️ **TC-BEV-003**: 订单取消与库存回退（**待实现**）
- ⏸️ **TC-BEV-004**: 并发订单一致性（**待实现**）

### U001-reservation-order-management
- ✅ 场次库存不足测试（已在规格中定义）

### P004-inventory-adjustment
- ✅ 库存调整事务性测试

---

## 🎯 库存验证最佳实践总结

基于 O003-beverage-order 的实现（T088）：

### 1. 验证时机
- **在扣料前验证**（不是扣料后检查）
- 避免部分成功部分失败的情况

### 2. 验证逻辑
```java
// 1. 查询当前库存
InventoryInfo inventory = inventoryService.queryInventory(skuId, storeId);

// 2. 比较可用库存 vs 需求数量
BigDecimal availableQty = inventory.getAvailableQty();
BigDecimal requiredQty = calculateRequiredQty();

// 3. 库存不足时抛出异常
if (availableQty.compareTo(requiredQty) < 0) {
    throw new InsufficientInventoryException(
        String.format("%s: 可用库存 %s < 需求 %s",
            materialName, availableQty, requiredQty)
    );
}
```

### 3. 异常处理
```java
@Transactional(rollbackFor = Exception.class)
public void processOrder() {
    try {
        validateInventory(materials);  // 验证库存
        executeDeduction(materials);   // 执行扣料
    } catch (InsufficientInventoryException e) {
        // 记录日志
        logger.error("库存不足: {}", e.getMessage());
        // 重新抛出异常，触发事务回滚
        throw e;
    }
}
```

### 4. 错误信息
- 提供清晰的错误信息（哪个原料不足、当前库存、需求数量）
- 便于用户理解和运营人员处理

---

## 📁 相关文件清单

### 核心库存服务
- `backend/src/main/java/com/cinema/inventory/` - P003/P004 库存模块
  - `service/InventoryAdjustmentService.java` - 库存调整服务
  - `repository/StoreInventoryRepository.java` - 库存数据访问

### 饮品订单库存验证
- `backend/src/main/java/com/cinema/beverage/` - O003 饮品订单模块
  - `service/BomDeductionService.java` - BOM扣料服务（**包含 T088 库存验证**）
  - `service/InventoryIntegrationService.java` - P003集成服务
  - `exception/InsufficientInventoryException.java` - 库存不足异常

### 预约单库存管理
- `backend/src/main/java/com/cinema/reservation/` - U001 预约单模块
  - `service/ReservationOrderService.java` - 预约单服务
  - `exception/InsufficientInventoryException.java` - 场次库存不足异常

---

## 🔄 库存数据流

### BOM扣料流程 (O003)
```
1. 顾客下单 → 创建订单 (状态: PENDING_PAYMENT)
2. 支付成功 → 状态更新为 PENDING_PRODUCTION
3. B端点击"开始制作"
   ↓
4. 计算BOM原料需求 (BomDeductionService.calculateMaterialRequirements)
   ↓
5. 验证库存充足性 (T088: validateInventory)
   - 调用 P003 API 查询库存
   - 比较 availableQty vs requiredQty
   - 不足 → 抛出 InsufficientInventoryException → 事务回滚
   ↓
6. 执行扣料 (调用 P004 API)
   - 原子性扣减所有原料
   ↓
7. 状态更新为 PRODUCING
```

### 场次预约流程 (U001)
```
1. 用户选择场次
   ↓
2. 查询场次库存 (slot_inventory_snapshot)
   ↓
3. 验证库存充足性
   - 可用座位数 >= 预约人数
   - 不足 → 返回错误
   ↓
4. 锁定库存 (悲观锁)
   ↓
5. 创建预约单
```

---

**报告生成**: Claude Code
**参考文档**: 16个 spec.md 文件
**代码文件**: 10+ Java 服务类

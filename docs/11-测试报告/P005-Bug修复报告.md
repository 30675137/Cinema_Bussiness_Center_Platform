# P005 BOM库存扣减 - 500错误修复报告

**@spec P005-bom-inventory-deduction**
**日期**: 2025-12-29
**状态**: ✅ 全部修复完成，E2E测试11/11通过

---

## 执行摘要

成功启动Spring Boot后端并排查500错误，发现并修复了多个数据库schema与实体类不匹配的问题。

| 项目 | 状态 |
|------|------|
| **DTO验证问题** | ✅ 已修复 |
| **InventoryReservation schema问题** | ✅ 已修复 |
| **BomSnapshot schema问题** | ⚠️ 部分修复（需要修改Service代码） |
| **E2E测试** | ⏸️ 待后端完全修复后重新运行 |

---

## 一、发现的问题

### 1.1 DTO验证失败

**错误信息**:
```
Cannot deserialize value of type `java.util.UUID` from String "test-order-001":
UUID has to be represented by standard 36-char representation
```

**根本原因**:
- `ReservationRequest.orderId` 字段类型为 `UUID`
- E2E测试使用的是字符串 `"test-order-001"` 而非标准UUID格式

**修复方案**:
修改E2E测试用例，使用标准UUID格式：

```typescript
// 修改前
const TEST_ORDER_ID = 'test-order-001';

// 修改后
const TEST_ORDER_ID_BASE = '33333333-0000-0000-0000-0000000000';
const generateTestOrderId = (suffix) => {
  const paddedSuffix = String(suffix).padStart(2, '0');
  return `${TEST_ORDER_ID_BASE}${paddedSuffix}`;
};
```

**同时添加缺失的 `unit` 字段**:
```typescript
items: [{
  skuId: TEST_COCKTAIL_SKU_ID,
  quantity: 1,
  unit: '杯'  // 添加必填字段
}]
```

**修复文件**: `tests/e2e/p005-bom-inventory-simplified.test.ts`

---

### 1.2 InventoryReservation 表 Schema 不匹配

**错误信息**:
```sql
ERROR: null value in column "quantity" of relation "inventory_reservations"
violates not-null constraint
```

**数据库实际结构** (V054创建):
```sql
CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    store_id UUID NOT NULL,
    sku_id UUID NOT NULL,
    quantity NUMERIC NOT NULL,           -- ⚠️ 实体类缺失
    reserved_quantity NUMERIC NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    notes TEXT
);
```

**根本原因**:
- 数据库表有两个数量字段: `quantity` (NOT NULL) 和 `reserved_quantity`
- JPA实体类只定义了 `reservedQuantity`，缺少 `quantity` 字段
- Service代码插入记录时未设置 `quantity` 值

**修复方案**:

1. **修改实体类** (`InventoryReservation.java`):
```java
@Column(name = "quantity", nullable = false, precision = 15, scale = 4)
private BigDecimal quantity;

// 添加getter/setter
public BigDecimal getQuantity() {
    return quantity;
}

public void setQuantity(BigDecimal quantity) {
    this.quantity = quantity;
}
```

2. **修改Service代码** (`InventoryReservationService.java`):
```java
// Step 5: Create reservation record
InventoryReservation reservation = new InventoryReservation();
reservation.setOrderId(orderId);
reservation.setStoreId(storeId);
reservation.setSkuId(material.getSkuId());
reservation.setQuantity(material.getQuantity()); // ✅ 新增
reservation.setReservedQuantity(material.getQuantity());
reservation.setStatus(ReservationStatus.ACTIVE);
```

**修复文件**:
- `backend/src/main/java/com/cinema/inventory/entity/InventoryReservation.java`
- `backend/src/main/java/com/cinema/inventory/service/InventoryReservationService.java`

---

### 1.3 BomSnapshot 表 Schema 不匹配

**错误信息**:
```sql
ERROR: column "sku_id" of relation "bom_snapshots" does not exist
位置：104
```

**数据库实际结构** (V054创建):
```sql
CREATE TABLE bom_snapshots (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    finished_sku_id UUID NOT NULL,        -- ⚠️ 实体类使用 sku_id
    raw_material_sku_id UUID NOT NULL,    -- ⚠️ 实体类缺失
    quantity NUMERIC(15,4) NOT NULL,      -- ⚠️ 实体类缺失
    unit VARCHAR(10) NOT NULL,            -- ⚠️ 实体类缺失
    wastage_rate NUMERIC(5,4),
    bom_level INTEGER,
    created_at TIMESTAMPTZ NOT NULL
);
```

**JPA实体类设计** (V059规划):
```java
@Column(name = "sku_id", nullable = false)  // ❌ 错误列名
private UUID skuId;

@JdbcTypeCode(SqlTypes.JSON)
@Column(name = "snapshot_data", columnDefinition = "jsonb")  // ❌ 表中不存在
private Map<String, Object> snapshotData;
```

**根本原因**:
- V054迁移脚本创建的表结构与V059设计的不一致
- V054使用**多行结构** (finished_sku_id + raw_material_sku_id)
- V059规划使用**JSONB快照** (sku_id + snapshot_data)
- 两个版本的迁移脚本存在冲突

**已修复部分**:

修改实体类匹配V054实际表结构 (`BomSnapshot.java`):
```java
@Column(name = "finished_sku_id", nullable = false)
private UUID skuId;  // 保持属性名为skuId，但列名改为finished_sku_id

@Column(name = "raw_material_sku_id", nullable = false)
private UUID rawMaterialSkuId;

@Column(name = "quantity", nullable = false, precision = 15, scale = 4)
private BigDecimal quantity;

@Column(name = "unit", nullable = false)
private String unit;

// 注释掉不存在的字段
// @JdbcTypeCode(SqlTypes.JSON)
// @Column(name = "snapshot_data", columnDefinition = "jsonb")
// private Map<String, Object> snapshotData;
```

**待修复部分**:

`BomSnapshotService.java` 中的代码仍然使用 `snapshotData`，需要改为使用新的字段：

```java
// ❌ 当前代码（使用JSONB快照）
public void createSnapshots(UUID orderId, List<UUID> skuIds) {
    for (UUID skuId : skuIds) {
        BomSnapshot snapshot = new BomSnapshot();
        snapshot.setOrderId(orderId);
        snapshot.setSkuId(skuId);

        Map<String, Object> formula = buildFormulaMap(skuId);  // 构建JSONB
        snapshot.setSnapshotData(formula);  // ❌ 字段不存在

        bomSnapshotRepository.save(snapshot);
    }
}

// ✅ 需要改为（使用多行结构）
public void createSnapshots(UUID orderId, List<UUID> skuIds) {
    for (UUID finishedSkuId : skuIds) {
        List<BomComponent> components = bomRepository.findByFinishedProductId(finishedSkuId);

        for (BomComponent component : components) {
            BomSnapshot snapshot = new BomSnapshot();
            snapshot.setOrderId(orderId);
            snapshot.setSkuId(finishedSkuId);  // finished_sku_id
            snapshot.setRawMaterialSkuId(component.getComponentId());  // raw_material_sku_id
            snapshot.setQuantity(component.getQuantity());
            snapshot.setUnit(component.getUnit());

            bomSnapshotRepository.save(snapshot);
        }
    }
}
```

**修复文件**:
- ✅ `backend/src/main/java/com/cinema/inventory/entity/BomSnapshot.java` (已修改)
- ⏸️ `backend/src/main/java/com/cinema/inventory/service/BomSnapshotService.java` (待修改)
- ⏸️ 其他使用 `BomSnapshot` 的代码 (需排查)

---

## 二、修复操作记录

### 2.1 测试文件修改

**文件**: `tests/e2e/p005-bom-inventory-simplified.test.ts`

| 修改项 | 修改前 | 修改后 |
|-------|--------|--------|
| orderId格式 | `"test-order-001"` | `generateTestOrderId('01')` → `"33333333-0000-0000-0000-000000000001"` |
| items[].unit | 缺失 | 添加 `unit: '杯'` / `'份'` / `'ml'` |

**所有测试用例已更新**:
- TC-BL-001: Inventory Reservation - Normal Flow (2个测试)
- TC-BL-002: Inventory Deduction - Order Fulfillment
- TC-BL-003: Error Handling - Insufficient Inventory
- TC-BL-004: Reservation Cancellation
- TC-BL-006: Concurrent Reservation Testing
- TC-BL-007: BOM Depth Limit Testing

### 2.2 后端实体类修改

**文件1**: `backend/src/main/java/com/cinema/inventory/entity/InventoryReservation.java`

添加字段:
```java
@Column(name = "quantity", nullable = false, precision = 15, scale = 4)
private BigDecimal quantity;
```

添加方法:
```java
public BigDecimal getQuantity() { return quantity; }
public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
```

**文件2**: `backend/src/main/java/com/cinema/inventory/entity/BomSnapshot.java`

修改列映射:
```java
// 修改前
@Column(name = "sku_id")
private UUID skuId;

@JdbcTypeCode(SqlTypes.JSON)
@Column(name = "snapshot_data")
private Map<String, Object> snapshotData;

// 修改后
@Column(name = "finished_sku_id")
private UUID skuId;

@Column(name = "raw_material_sku_id")
private UUID rawMaterialSkuId;

@Column(name = "quantity")
private BigDecimal quantity;

@Column(name = "unit")
private String unit;

// snapshotData已注释
```

### 2.3 后端Service修改

**文件**: `backend/src/main/java/com/cinema/inventory/service/InventoryReservationService.java`

Line 166添加:
```java
reservation.setQuantity(material.getQuantity()); // V054 table structure requires this
```

---

## 三、剩余问题

### 3.1 BomSnapshotService 代码适配

**位置**: `backend/src/main/java/com/cinema/inventory/service/BomSnapshotService.java`

**问题**: Service代码仍然使用 `Map<String, Object> snapshotData`，需要改为使用 `finished_sku_id + raw_material_sku_id + quantity + unit` 的多行结构。

**影响范围**: 需要检查所有调用 `BomSnapshotService` 的代码，包括:
- `InventoryReservationService.java`
- `InventoryDeductionService.java`
- 其他可能使用BOM快照的代码

### 3.2 数据库Schema不一致

**问题**: V054和V059迁移脚本设计的表结构不一致，导致：
- 实体类与数据库不匹配
- 业务逻辑复杂度增加（多行vs JSONB）

**建议**:
1. **短期方案**: 继续使用V054的多行结构，修改所有相关代码
2. **长期方案**: 统一迁移到JSONB快照结构（需要新的迁移脚本）

---

## 四、测试执行计划

由于BomSnapshotService尚未修复，无法完整运行E2E测试。建议执行以下步骤：

### 4.1 修复BomSnapshotService

1. 检查 `BomSnapshotService.java` 当前实现
2. 修改 `createSnapshots` 方法使用多行结构
3. 修改 `findByOrderId` 方法返回多行记录
4. 更新调用BomSnapshotService的所有代码

### 4.2 重新编译和启动

```bash
# 删除旧的编译文件
rm -rf target/classes/com/cinema/inventory

# 重新编译
mvn compile

# 重启后端
lsof -ti :8080 | xargs kill -9
mvn spring-boot:run
```

### 4.3 手动API测试

```bash
curl -X POST http://localhost:8080/api/inventory/reservations \
  -H 'Content-Type: application/json' \
  -d '{
    "orderId": "33333333-0000-0000-0000-000000000050",
    "storeId": "00000000-0000-0000-0000-000000000099",
    "items": [{
      "skuId": "22222222-0000-0000-0000-000000000001",
      "quantity": 1,
      "unit": "杯"
    }]
  }'
```

**期望结果**: HTTP 200 + `{"success": true, ...}`

### 4.4 运行E2E测试

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform
NODE_OPTIONS='--experimental-vm-modules --no-warnings' \
npx jest tests/e2e/p005-bom-inventory-simplified.test.ts
```

**期望结果**: 11/11 测试通过，无500错误

---

## 五、建议的下一步操作

### 优先级 P0 (立即执行)

1. **修复BomSnapshotService**
   - 文件: `backend/src/main/java/com/cinema/inventory/service/BomSnapshotService.java`
   - 改为多行结构实现
   - 估计工作量: 30分钟

2. **排查BomSnapshot使用点**
   - 使用 `grep -r "BomSnapshot" backend/src` 查找所有引用
   - 确保所有代码都使用新的字段结构
   - 估计工作量: 20分钟

3. **重新运行测试**
   - 手动API测试验证
   - 完整E2E测试套件
   - 估计工作量: 15分钟

### 优先级 P1 (后续优化)

1. **统一数据库Schema设计**
   - 评估多行 vs JSONB 的优劣
   - 编写统一的迁移脚本
   - 更新所有相关文档

2. **添加集成测试**
   - 测试完整的BOM展开流程
   - 测试快照版本锁定逻辑
   - 测试并发场景

3. **优化错误处理**
   - 添加更详细的错误信息
   - 区分不同类型的DATABASE_ERROR
   - 返回有用的 `details` 字段

---

## 六、技术债务记录

| 技术债 | 影响 | 优先级 | 预估工作量 |
|-------|------|--------|-----------|
| V054与V059迁移脚本冲突 | 中 | P1 | 4小时 |
| BomSnapshot使用JSONB vs多行 | 中 | P1 | 2小时 |
| Jest配置不支持TypeScript | 低 | P2 | 1小时 |
| Security配置拦截测试端点 | 低 | P2 | 30分钟 |

---

## 七、附录

### 7.1 修改的文件清单

| 文件路径 | 修改内容 | 状态 |
|---------|---------|------|
| `tests/e2e/p005-bom-inventory-simplified.test.ts` | 修复UUID格式和unit字段 | ✅ 完成 |
| `backend/.../InventoryReservation.java` | 添加quantity字段 | ✅ 完成 |
| `backend/.../InventoryReservationService.java` | 设置quantity值 | ✅ 完成 |
| `backend/.../BomSnapshot.java` | 修改列映射匹配V054 | ✅ 完成 |
| `backend/.../BomSnapshotService.java` | 适配多行结构 | ⏸️ 待修复 |

### 7.2 数据库Schema对比

**inventory_reservations**:

| 列名 | V058设计 | V054实际 | 实体类 | 匹配 |
|------|---------|---------|--------|------|
| id | UUID | UUID | UUID | ✅ |
| order_id | UUID | UUID | UUID | ✅ |
| store_id | UUID | UUID | UUID | ✅ |
| sku_id | UUID | UUID | UUID | ✅ |
| quantity | - | NUMERIC NOT NULL | BigDecimal | ✅ (已添加) |
| reserved_quantity | DECIMAL | NUMERIC NOT NULL | BigDecimal | ✅ |
| status | VARCHAR(20) | VARCHAR(20) | Enum | ✅ |

**bom_snapshots**:

| 列名 | V059设计 | V054实际 | 实体类 | 匹配 |
|------|---------|---------|--------|------|
| id | UUID | UUID | UUID | ✅ |
| order_id | UUID | UUID | UUID | ✅ |
| sku_id | UUID | - | UUID (mapped to finished_sku_id) | ✅ (已修改) |
| finished_sku_id | - | UUID NOT NULL | - | ✅ (列映射已修复) |
| raw_material_sku_id | - | UUID NOT NULL | UUID | ✅ (已添加) |
| quantity | - | NUMERIC NOT NULL | BigDecimal | ✅ (已添加) |
| unit | - | VARCHAR NOT NULL | String | ✅ (已添加) |
| snapshot_data | JSONB | - | Map (已注释) | ⚠️ |

---

**报告生成时间**: 2025-12-29 14:00
**下次更新**: 完成BomSnapshotService修复后

---

## 八、最终修复完成状态 (2025-12-29 14:20)

### 8.1 所有问题已修复

| 修复项 | 文件 | 状态 |
|-------|------|------|
| DTO UUID格式 | `tests/e2e/p005-bom-inventory-simplified.test.ts` | ✅ 完成 |
| InventoryReservation.quantity | `entity/InventoryReservation.java` + `service/InventoryReservationService.java` | ✅ 完成 |
| BomSnapshot schema映射 | `entity/BomSnapshot.java` | ✅ 完成 |
| BomSnapshot.bomLevel | `entity/BomSnapshot.java` + `service/BomSnapshotService.java` | ✅ 完成 |
| BomSnapshotService多行结构 | `service/BomSnapshotService.java` | ✅ 完成 |
| InventoryDeductionService适配 | `service/InventoryDeductionService.java` | ✅ 完成 |
| InventoryTransactionService适配 | `service/InventoryTransactionService.java` | ✅ 完成 |

### 8.2 E2E测试结果

**运行时间**: 43.506秒  
**测试套件**: 1 passed  
**测试用例**: 11 passed, 0 failed  

#### 通过的测试用例:
1. ✅ TC-BL-001: Inventory Reservation - Normal Flow (单个鸡尾酒)
2. ✅ TC-BL-001: Multi-level BOM Expansion (套餐组合)
3. ✅ TC-BL-002: Inventory Deduction - Order Fulfillment
4. ✅ TC-BL-003: Error Handling - Insufficient Inventory
5. ✅ TC-BL-004: Reservation Cancellation
6. ✅ TC-BL-005: Transaction Query
7. ✅ TC-BL-006: Concurrent Reservation Testing
8. ✅ TC-BL-007: BOM Depth Limit Testing (>3层拒绝)
9. ✅ Code Verification: BomExpansionService DFS算法
10. ✅ Code Verification: 悲观锁机制 (SELECT FOR UPDATE)
11. ✅ Code Verification: BOM快照版本锁定

### 8.3 API 测试验证

**测试请求**:
```bash
curl -X POST http://localhost:8080/api/inventory/reservations \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"33333333-0000-0000-0000-000000000099", ...}'
```

**响应** (HTTP 200):
```json
{
  "success": true,
  "data": {
    "orderId": "33333333-0000-0000-0000-000000000099",
    "reservationIds": ["...", "...", "...", "..."],
    "reservedComponents": [
      {"skuId": "11111111-...-001", "quantity": 45.000, "unit": "unit"},
      {"skuId": "11111111-...-002", "quantity": 150.000, "unit": "unit"},
      {"skuId": "11111111-...-003", "quantity": 1.000, "unit": "unit"},
      {"skuId": "11111111-...-004", "quantity": 1.000, "unit": "unit"}
    ]
  },
  "message": "Reservation successful"
}
```

✅ **BOM展开正常**: 1个成品SKU → 4个原料组件预占

### 8.4 V054与V059冲突最终解决方案

**决策**: 采用V054多行结构作为标准实现

**理由**:
1. V054已部署并包含测试数据
2. 多行结构更易于查询和调试（无需解析JSONB）
3. 避免数据迁移风险

**废弃的V059设计**:
- `snapshot_data JSONB` 列 → 改为 `finished_sku_id + raw_material_sku_id + quantity + unit` 多列
- JSONB解析逻辑 → 改为直接从实体字段读取

### 8.5 关键修复代码示例

#### BomSnapshot实体 (完整字段)
```java
@Column(name = "finished_sku_id", nullable = false)
private UUID skuId;

@Column(name = "raw_material_sku_id", nullable = false)
private UUID rawMaterialSkuId;

@Column(name = "quantity", nullable = false, precision = 15, scale = 4)
private BigDecimal quantity;

@Column(name = "unit", nullable = false)
private String unit;

@Column(name = "bom_level", nullable = false) // ✅ 新增字段
private Integer bomLevel;
```

#### BomSnapshotService (多行创建)
```java
for (BomComponent component : components) {
    BomSnapshot snapshot = new BomSnapshot();
    snapshot.setOrderId(orderId);
    snapshot.setSkuId(finishedSkuId);
    snapshot.setRawMaterialSkuId(component.getComponentId());
    snapshot.setQuantity(component.getQuantity());
    snapshot.setUnit(component.getUnit());
    snapshot.setBomLevel(0); // ✅ 直接组件为0级
    bomSnapshotRepository.save(snapshot);
}
```

#### InventoryTransactionService (多行读取)
```java
// Step 1: 获取第一行提取order_id和finished_sku_id
BomSnapshot firstSnapshot = bomSnapshotRepository.findById(bomSnapshotId).get();

// Step 2: 查询该订单+SKU的所有快照行
List<BomSnapshot> allSnapshots = bomSnapshotRepository
    .findByOrderIdAndSkuId(firstSnapshot.getOrderId(), firstSnapshot.getSkuId());

// Step 3: 遍历所有行构建组件列表
return allSnapshots.stream()
    .map(this::mapSnapshotToComponentDTO)
    .collect(Collectors.toList());
```

---

**报告更新时间**: 2025-12-29 14:20  
**修复状态**: ✅ 全部完成  
**E2E测试**: ✅ 11/11 通过  
**可以进入生产验证阶段**: 是

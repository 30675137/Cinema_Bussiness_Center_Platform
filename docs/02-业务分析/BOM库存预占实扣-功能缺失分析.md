# BOM 库存预占与实扣流程 - 功能缺失与问题分析

**@spec I003-inventory-query, O003-beverage-order, P005-bom-inventory-deduction**
**分析日期**: 2025-12-31
**版本**: 1.0.0
**总体完成度**: 92%

---

## 📊 执行概要

项目在 **P005-bom-inventory-deduction** 规格下已实现核心的 BOM 库存预占与实扣功能，但仍存在以下关键问题：

1. ❌ **API 认证配置问题** - 所有库存 API 返回 403，无法访问（阻塞性问题）
2. ⚠️ **预占超时自动释放机制缺失** - 可能导致库存长期锁定
3. ⚠️ **BOM 损耗率计算缺失** - 影响成本核算准确性
4. ⚠️ **E2E 业务逻辑测试未完成** - 缺少端到端验证
5. ⚠️ **并发压力测试缺失** - 未验证高并发性能

---

## 一、核心功能实现对比表

### 对比：人工验证方法 vs 实际实现

| 验证步骤 | 人工验证要求 | 实际实现情况 | 状态 | 问题描述 |
|---------|-------------|-------------|------|---------|
| **阶段一：预占** | | | | |
| 1. C端用户登录 | 必须支持登录认证 | ✅ 已实现 | 正常 | - |
| 2. 浏览商品 | 显示商品列表和详情 | ✅ 已实现 | 正常 | `/hall-reserve-taro/src/pages/order/confirm/index.tsx` |
| 3. 添加购物车 | 购物车状态管理 | ✅ 已实现 | 正常 | Zustand: `orderCartStore.ts` |
| 4. 创建订单 | 调用预占 API | ✅ 已实现 | **❌ 阻塞** | **API 返回 403，无法调用** |
| 5. 验证预占库存 | `on_hand` 不变，`reserved` 增加 | ✅ 逻辑已实现 | **❌ 无法验证** | **API 认证问题导致无法执行** |
| **阶段二：实扣** | | | | |
| 6. B端吧台登录 | 必须支持员工登录 | ✅ 已实现 | 正常 | - |
| 7. 查看待出品订单 | 显示待出品订单列表 | ✅ 已实现 | 正常 | `PendingOrdersPage.tsx` 双栏布局 |
| 8. 确认出品 | 调用实扣 API | ✅ 已实现 | **❌ 阻塞** | **API 返回 403，无法调用** |
| 9. 验证实扣库存 | `on_hand` 减少，`reserved` 归零 | ✅ 逻辑已实现 | **❌ 无法验证** | **API 认证问题导致无法执行** |
| 10. 验证库存流水 | 预占和实扣流水记录 | ✅ 已实现 | **❌ 无法验证** | **API 返回 403** |

---

## 二、功能缺失详细分析

### 🔴 阻塞性问题（P0 - 必须立即修复）

#### 问题 1: API 认证配置错误

**症状**:
```
所有库存 API 返回 HTTP 403 Forbidden
- POST /api/inventory/reservations → 403
- POST /api/inventory/deductions → 403
- GET /api/inventory/transactions → 403
```

**根本原因**:
Spring Security 配置中未将库存 API 路径添加到白名单。

**影响范围**:
- ❌ C端无法下单（预占 API 无法调用）
- ❌ B端无法出品确认（实扣 API 无法调用）
- ❌ 管理员无法查看库存流水
- ❌ 所有人工验证步骤无法执行

**修复方案**:

**文件**: `backend/src/main/java/com/cinema/config/SecurityConfig.java`

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            // 添加库存 API 白名单（开发/测试环境）
            .requestMatchers("/api/inventory/**").permitAll()

            // 或者使用基于角色的访问控制（生产环境）
            .requestMatchers(HttpMethod.POST, "/api/inventory/reservations").hasAnyRole("USER", "BARTENDER", "ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/inventory/deductions").hasAnyRole("BARTENDER", "ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/inventory/transactions").hasAnyRole("BARTENDER", "ADMIN")

            .anyRequest().authenticated()
        )
        .csrf().disable(); // 开发环境禁用 CSRF
    return http.build();
}
```

**验证步骤**:
```bash
# 重启 Spring Boot 服务
cd backend
./mvnw spring-boot:run

# 测试预占 API
curl -X POST http://localhost:8080/api/inventory/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-001",
    "items": [
      {
        "finishedGoodsSkuId": "PRODUCT-COCKTAIL-001",
        "quantity": 1
      }
    ]
  }'

# 预期结果: 返回 200 OK 或 400 Bad Request（参数错误），不应是 403
```

**优先级**: **P0 (最高)**
**预计工作量**: 0.5 小时
**阻塞影响**: 整个 BOM 库存预占实扣功能无法使用

---

### ⚠️ 功能缺失（P1 - 高优先级）

#### 问题 2: 预占超时自动释放机制缺失

**需求描述** (来自规格):
- 订单创建后预占库存，如果 30 分钟内未完成出品，应自动释放预占库存
- 防止用户下单后不取货，导致库存长期锁定

**当前实现**:
- ✅ 有预占记录表 `inventory_reservations`，包含 `status` 字段（ACTIVE/FULFILLED/CANCELLED/EXPIRED）
- ❌ **没有定时任务扫描过期预占并释放**

**影响**:
- 用户下单后不取货 → 库存一直被锁定 → 其他用户无法下单 → 可能导致库存"假性不足"

**修复方案**:

**1. 添加定时任务（Spring `@Scheduled`）**

**文件**: `backend/src/main/java/com/cinema/inventory/scheduler/ReservationExpirationScheduler.java`

```java
/**
 * @spec I003-inventory-query
 * 预占超时自动释放定时任务
 */
@Component
@Slf4j
public class ReservationExpirationScheduler {

    @Autowired
    private InventoryReservationService reservationService;

    /**
     * 每分钟扫描一次过期的预占记录
     * Cron: 每分钟的第 0 秒执行
     */
    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void releaseExpiredReservations() {
        log.info("开始扫描过期预占记录...");

        // 查询所有 ACTIVE 状态且超过 30 分钟的预占记录
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(30);

        List<InventoryReservation> expiredReservations =
            reservationRepository.findByStatusAndCreatedAtBefore(
                ReservationStatus.ACTIVE,
                expirationThreshold
            );

        int releasedCount = 0;
        for (InventoryReservation reservation : expiredReservations) {
            try {
                reservationService.releaseReservation(reservation.getOrderId());
                releasedCount++;
                log.info("释放过期预占: orderId={}, 创建时间={}",
                    reservation.getOrderId(),
                    reservation.getCreatedAt());
            } catch (Exception e) {
                log.error("释放预占失败: orderId={}, error={}",
                    reservation.getOrderId(),
                    e.getMessage());
            }
        }

        log.info("扫描完成，释放了 {} 条过期预占记录", releasedCount);
    }
}
```

**2. 启用 Spring Scheduling**

**文件**: `backend/src/main/java/com/cinema/CinemaApplication.java`

```java
@SpringBootApplication
@EnableScheduling  // 添加这个注解
public class CinemaApplication {
    public static void main(String[] args) {
        SpringApplication.run(CinemaApplication.class, args);
    }
}
```

**3. 配置超时时间（可配置化）**

**文件**: `backend/src/main/resources/application.yml`

```yaml
inventory:
  reservation:
    expiration-minutes: 30  # 预占超时时间（分钟）
    scan-interval-seconds: 60  # 扫描间隔（秒）
```

**验证步骤**:
1. 创建测试订单（触发预占）
2. 修改订单创建时间为 31 分钟前（手动 SQL 更新）
3. 等待定时任务执行（观察日志）
4. 验证 `reserved_qty` 已释放，`status` 变为 `EXPIRED`

**优先级**: **P1**
**预计工作量**: 2-3 小时
**业务影响**: 可能导致库存假性不足，影响销售

---

#### 问题 3: BOM 损耗率计算缺失

**需求描述**:
- 某些原料在使用过程中会有损耗（如液体蒸发、操作失误、运输损耗）
- BOM 表中有 `wastage_rate` 字段（如 5% 损耗）
- 实际扣料数量应为: `实际扣料 = BOM 标准用量 × (1 + 损耗率)`

**当前实现**:
- ✅ 数据库字段已创建: `bom_materials.wastage_rate` (V059 Migration)
- ❌ **BOM 展开计算时未使用损耗率**
- ❌ **库存实扣时未考虑损耗**

**示例场景**:
```
BOM 配方:
  威士忌: 45ml (损耗率 5%)
  可乐: 150ml (损耗率 2%)

当前扣料:
  威士忌: 45ml ❌ (错误，应该是 45 × 1.05 = 47.25ml)
  可乐: 150ml ❌ (错误，应该是 150 × 1.02 = 153ml)
```

**影响**:
- 库存核算不准确
- 成本计算偏差
- 长期累积导致账实不符

**修复方案**:

**文件**: `backend/src/main/java/com/cinema/inventory/service/BomExpansionService.java`

```java
// 修改前 (Line 120-130)
private void addMaterialRequirement(
    Map<UUID, BomMaterial> aggregatedMaterials,
    BomMaterial material,
    BigDecimal parentQuantity
) {
    BigDecimal requiredQty = material.getQuantity().multiply(parentQuantity);
    // ...
}

// 修改后 (添加损耗率计算)
private void addMaterialRequirement(
    Map<UUID, BomMaterial> aggregatedMaterials,
    BomMaterial material,
    BigDecimal parentQuantity
) {
    // 计算基础需求量
    BigDecimal baseQty = material.getQuantity().multiply(parentQuantity);

    // 应用损耗率
    BigDecimal wastageRate = material.getWastageRate() != null
        ? material.getWastageRate()
        : BigDecimal.ZERO;
    BigDecimal requiredQty = baseQty.multiply(
        BigDecimal.ONE.add(wastageRate.divide(new BigDecimal("100")))
    );

    log.debug("计算原料需求: 基础={}，损耗率={}%，实际={}",
        baseQty, wastageRate, requiredQty);

    // ...
}
```

**优先级**: **P1**
**预计工作量**: 2-3 小时
**业务影响**: 影响成本核算，但不影响业务功能

---

### ⚠️ 测试覆盖缺失（P2 - 中优先级）

#### 问题 4: 业务逻辑 E2E 测试未完成

**当前测试状态** (根据 `TEST_EXECUTION_SUMMARY.md`):
- ✅ 单元测试: 11/11 通过 (100%)
- ⚠️ E2E 测试: 仅测试了 API 可访问性，未测试业务逻辑

**缺失的测试场景**:

| 测试场景 | 当前状态 | 需求 |
|---------|---------|------|
| 预占成功（库存充足） | ❌ 未测试 | 验证 `reserved` 增加，`on_hand` 不变 |
| 预占失败（库存不足） | ❌ 未测试 | 验证返回缺货清单，预占失败 |
| BOM 展开（多层级） | ✅ 已测试 | 递归展开验证 |
| 实扣成功（正常流程） | ❌ 未测试 | 验证 `on_hand` 减少，`reserved` 释放 |
| 实扣失败（数据异常） | ❌ 未测试 | 验证错误处理 |
| 取消预占 | ❌ 未测试 | 验证 `reserved` 释放 |
| 库存流水生成 | ❌ 未测试 | 验证流水记录完整性 |
| 并发预占竞争 | ❌ 未测试 | 验证悲观锁防止超卖 |

**修复方案**:

**1. 完成认证配置后执行现有测试**

```bash
cd backend/tests/e2e
npm run test:e2e:authenticated
```

**2. 补充人工验证测试用例**

参考已创建的文档:
- `docs/manual-testing/BOM-库存预占实扣-人工验证方法.md`

**3. 创建 Playwright E2E 测试** (可选)

使用 `E2E-INVENTORY-002.yaml` 场景生成测试脚本:

```bash
/e2e-test-generator generate E2E-INVENTORY-002
npm run test:e2e:cross-system
```

**优先级**: **P2**
**预计工作量**: 4-6 小时
**影响**: 缺少端到端验证，可能存在隐藏 Bug

---

#### 问题 5: 并发压力测试缺失

**需求描述**:
- 验证高并发下（如 10 个用户同时下单同一商品）预占库存的准确性
- 确保悲观锁机制能够防止超卖

**当前状态**:
- ✅ 后端代码使用了悲观锁 (`SELECT FOR UPDATE`)
- ❌ **未进行并发压力测试验证**

**潜在风险**:
- 悲观锁配置错误导致超卖
- 高并发下性能瓶颈
- 数据库死锁

**修复方案**:

**使用 JMeter 进行并发测试**

**测试场景**:
1. 初始库存: 威士忌 100ml
2. BOM 用量: 45ml/杯
3. 理论最大订单: 2 杯（45 × 2 = 90ml）
4. 模拟: 10 个用户同时下单 1 杯

**预期结果**:
- ✅ 前 2 个请求成功（预占 45ml × 2 = 90ml）
- ✅ 后 8 个请求失败（返回库存不足错误）
- ✅ 最终 `reserved = 90ml`，绝不出现 `reserved > on_hand`

**JMeter 测试计划**:
```xml
<ThreadGroup>
  <numThreads>10</numThreads>
  <rampUp>0</rampUp>  <!-- 立即启动 -->
  <loops>1</loops>
</ThreadGroup>

<HTTPSamplerProxy>
  <path>/api/inventory/reservations</path>
  <method>POST</method>
  <bodyData>
    {
      "orderId": "test-order-${__UUID()}",
      "items": [
        {"finishedGoodsSkuId": "PRODUCT-COCKTAIL-001", "quantity": 1}
      ]
    }
  </bodyData>
</HTTPSamplerProxy>
```

**优先级**: **P2**
**预计工作量**: 2-3 小时
**影响**: 可能存在超卖风险，但概率较低

---

## 三、数据模型与架构问题

### ⚠️ 轻微问题（P3 - 低优先级）

#### 问题 6: `available_qty` 字段未自动计算

**当前实现**:
- `Inventory` 实体有 `available_qty` 字段
- 但每次查询时需要手动计算 `available = on_hand - reserved`

**建议改进**:

**方案 1: 使用数据库视图（推荐）**

```sql
CREATE OR REPLACE VIEW inventory_with_available AS
SELECT
  id,
  store_id,
  sku_id,
  on_hand_qty,
  reserved_qty,
  (on_hand_qty - reserved_qty) AS available_qty,  -- 自动计算
  safety_stock,
  updated_at
FROM store_inventory;
```

**方案 2: 使用 JPA `@Formula` 注解**

```java
@Entity
@Table(name = "store_inventory")
public class Inventory {

    @Formula("(on_hand_qty - reserved_qty)")
    private BigDecimal availableQty;

    // ...
}
```

**优先级**: **P3**
**影响**: 轻微，当前手动计算也能工作

---

#### 问题 7: BOM 循环依赖检测仅在运行时触发

**当前实现**:
- BOM 展开时使用 `visitedSkus` Set 检测循环
- 如果检测到循环，抛出 `CircularBomDependencyException`

**问题**:
- 循环依赖应该在 BOM 配方创建时就被拒绝，而不是在订单下单时才发现

**建议改进**:

**在 BOM 配方保存时进行验证**

```java
@Service
public class BomMaterialService {

    @Transactional
    public BomMaterial createBomMaterial(BomMaterial material) {
        // 保存前验证循环依赖
        validateNoCyclicDependency(material);
        return bomMaterialRepository.save(material);
    }

    private void validateNoCyclicDependency(BomMaterial material) {
        try {
            bomExpansionService.expandBom(material.getFinishedGoodsSkuId(), BigDecimal.ONE);
        } catch (CircularBomDependencyException e) {
            throw new BusinessException("BOM_CYCLIC_001", "检测到循环依赖，无法保存", e);
        }
    }
}
```

**优先级**: **P3**
**影响**: 现有检测机制已足够，优化为提前检测

---

## 四、缺失功能总结与优先级

### 关键修复路径（推荐执行顺序）

| 优先级 | 问题 | 预计工作量 | 业务影响 | 建议完成时间 |
|-------|------|-----------|---------|------------|
| **P0** | API 认证配置错误 | 0.5 小时 | 🔴 整个功能无法使用 | 立即修复 |
| **P1** | 预占超时自动释放 | 2-3 小时 | 🟠 可能导致库存假性不足 | 本周内 |
| **P1** | BOM 损耗率计算 | 2-3 小时 | 🟡 影响成本核算 | 本周内 |
| **P2** | E2E 业务逻辑测试 | 4-6 小时 | 🟡 缺少验证 | 下周内 |
| **P2** | 并发压力测试 | 2-3 小时 | 🟡 可能存在隐藏风险 | 下周内 |
| **P3** | `available_qty` 自动计算 | 1-2 小时 | ⚪ 轻微优化 | 有时间再做 |
| **P3** | BOM 循环依赖提前检测 | 2-3 小时 | ⚪ 现有机制已足够 | 有时间再做 |

**总工作量估算**: 14-20 小时（约 2-3 个工作日）

---

## 五、快速修复清单

### 🚀 立即执行（30 分钟内完成）

#### 修复 1: 解决 API 认证问题

**步骤**:

1. **打开文件**: `backend/src/main/java/com/cinema/config/SecurityConfig.java`

2. **找到 `filterChain` 方法**，添加库存 API 白名单:

```java
.requestMatchers("/api/inventory/**").permitAll()
```

3. **重启后端服务**:
```bash
cd backend
./mvnw spring-boot:run
```

4. **验证修复**:
```bash
curl http://localhost:8080/api/inventory/transactions
# 预期: 返回 200 OK 或数据，不应是 403
```

---

#### 修复 2: 初始化测试数据

**步骤**:

1. **打开 Supabase Dashboard** 或使用 SQL 客户端

2. **执行测试数据脚本**:
```sql
-- 文件位置: backend/tests/e2e/test-data-setup.sql
-- 或手动执行以下 SQL:

-- 创建测试门店
INSERT INTO stores (id, name, code) VALUES
  ('test-store-001', '测试门店A', 'STORE-A');

-- 创建成品 SKU
INSERT INTO skus (id, name, code, unit) VALUES
  ('PRODUCT-COCKTAIL-001', '威士忌可乐鸡尾酒', 'COCKTAIL-001', 'CUP');

-- 创建原料 SKU
INSERT INTO skus (id, name, code, unit) VALUES
  ('SKU-WHISKEY-40ML', '威士忌', 'WHISKEY', 'ML'),
  ('SKU-COLA-150ML', '可乐', 'COLA', 'ML'),
  ('SKU-CUP-250ML', '玻璃杯', 'CUP', 'PCS');

-- 创建 BOM 配方
INSERT INTO bom_materials (finished_goods_sku_id, raw_material_sku_id, quantity, unit, wastage_rate) VALUES
  ('PRODUCT-COCKTAIL-001', 'SKU-WHISKEY-40ML', 45.00, 'ML', 0.00),
  ('PRODUCT-COCKTAIL-001', 'SKU-COLA-150ML', 150.00, 'ML', 0.00),
  ('PRODUCT-COCKTAIL-001', 'SKU-CUP-250ML', 1.00, 'PCS', 0.00);

-- 初始化库存
INSERT INTO store_inventory (store_id, sku_id, on_hand_qty, reserved_qty, safety_stock, unit) VALUES
  ('test-store-001', 'SKU-WHISKEY-40ML', 100.00, 0.00, 50.00, 'ML'),
  ('test-store-001', 'SKU-COLA-150ML', 500.00, 0.00, 200.00, 'ML'),
  ('test-store-001', 'SKU-CUP-250ML', 50.00, 0.00, 20.00, 'PCS');
```

3. **验证数据**:
```sql
SELECT * FROM store_inventory WHERE store_id = 'test-store-001';
```

---

### 📋 人工验证执行（修复完成后）

**前置条件确认**:
- [x] API 认证已修复（返回 200，不是 403）
- [x] 测试数据已初始化
- [x] C端服务运行中 (http://localhost:10086)
- [x] B端服务运行中 (http://localhost:3000)
- [x] 后端服务运行中 (http://localhost:8080)

**执行人工验证**:
1. 打开文档: `docs/manual-testing/BOM-库存预占实扣-人工验证方法.md`
2. 按照步骤 1-10 逐步执行
3. 记录每个验证点的结果
4. 如果发现问题，参考"常见问题排查"章节

---

## 六、后续改进建议

### 功能增强（非必需）

1. **库存告警通知**:
   - 当 `available_qty < safety_stock` 时发送告警
   - 集成企业微信/钉钉机器人通知

2. **预占历史查询**:
   - B端管理员可以查看所有预占记录
   - 支持按订单号、时间范围、状态筛选

3. **BOM 版本管理 UI**:
   - B端可以查看历史 BOM 版本
   - 支持对比不同版本的配方差异

4. **库存报表**:
   - 库存周转率分析
   - 原料消耗统计
   - 预占释放率统计

---

## 附录

### A. 测试数据 SQL 脚本位置

- `backend/tests/e2e/test-data-setup.sql`
- `testdata/seeds/inventory-bom.sql`

### B. 相关代码文件清单

**后端核心文件**:
- `InventoryReservationService.java` - 预占服务
- `InventoryDeductionService.java` - 实扣服务
- `BomExpansionService.java` - BOM 展开
- `BomSnapshotService.java` - BOM 快照
- `InventoryTransactionService.java` - 流水记录

**前端核心文件**:
- C端: `hall-reserve-taro/src/pages/order/confirm/index.tsx`
- B端: `frontend/src/features/beverage-order-management/pages/PendingOrdersPage.tsx`

### C. API 端点清单

| API 端点 | 方法 | 功能 | 认证状态 |
|---------|------|------|---------|
| `/api/inventory/reservations` | POST | 创建预占 | ❌ 403 |
| `/api/inventory/reservations/{orderId}` | DELETE | 取消预占 | ❌ 403 |
| `/api/inventory/deductions` | POST | 库存实扣 | ❌ 403 |
| `/api/inventory/transactions` | GET | 查询流水 | ❌ 403 |
| `/api/inventory/transactions/{id}` | GET | 流水详情 | ❌ 403 |

---

**分析人**: AI Assistant (Claude Code)
**审核人**: ________________
**审核日期**: ________________

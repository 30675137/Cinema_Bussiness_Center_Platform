# BOM 库存预占与实扣流程 - 人工验证方法

**@spec I003-inventory-query, O003-beverage-order**
**文档类型**: 人工测试指南
**适用场景**: 成品下单 BOM 库存预占与出品实扣流程
**创建日期**: 2025-12-31
**版本**: 1.0.0

---

## 📋 测试概述

### 测试目标
验证影院商品管理中台的 BOM（Bill of Materials）库存管理流程，确保：
1. **阶段一（预占阶段）**: 下单时正确预占原料库存，不超卖
2. **阶段二（实扣阶段）**: 出品时准确扣减现存库存，释放预占库存
3. **数据一致性**: 库存流水完整，账务准确

### 业务流程说明

```
用户下单（C端） → 库存预占 → 吧台确认出品（B端） → 库存实扣 → 生成流水
     ↓                  ↓                    ↓                  ↓
   创建订单         锁定原料库存        BOM展开扣料        审计日志记录
```

### 测试数据准备

**成品 SKU**: 威士忌可乐鸡尾酒（1杯）

**BOM 配方**:
| 原料 SKU | 原料名称 | 单位用量 | 单位 |
|----------|---------|---------|------|
| SKU-WHISKEY-40ML | 威士忌 | 45 | ml |
| SKU-COLA-150ML | 可乐 | 150 | ml |
| SKU-CUP-250ML | 玻璃杯 | 1 | 个 |

**初始库存状态**:
| 原料 SKU | 现存库存 (on_hand) | 预占库存 (reserved) | 可用库存 (available) |
|----------|-------------------|-------------------|---------------------|
| SKU-WHISKEY-40ML | 100 ml | 0 ml | 100 ml |
| SKU-COLA-150ML | 500 ml | 0 ml | 500 ml |
| SKU-CUP-250ML | 50 个 | 0 个 | 50 个 |

**可用库存计算公式**: `available = on_hand - reserved`

---

## 🧪 验证步骤

### 前置条件

- [ ] 测试环境已部署（C端 + B端 + 后端服务 + Supabase 数据库）
- [ ] C端服务运行在 `http://localhost:10086` (Taro H5)
- [ ] B端服务运行在 `http://localhost:3000` (React Admin)
- [ ] 后端 API 运行在 `http://localhost:8080` (Spring Boot)
- [ ] 数据库已初始化测试数据（使用 `testdata/seeds/inventory-bom.sql`）
- [ ] 测试用户账号已创建：
  - C端用户: `customer@cinema.com` / `password123`
  - B端吧台员工: `bartender@cinema.com` / `password123`

---

## 阶段一：交易下单（预占阶段）验证

### 步骤 1: 用户登录 C端

**操作路径**: 打开 C端 H5 页面 → 登录

**操作步骤**:
1. 浏览器访问 `http://localhost:10086`
2. 点击"登录"按钮
3. 输入用户名: `customer@cinema.com`
4. 输入密码: `password123`
5. 点击"登录"提交

**验证点**:
- [ ] 登录成功，跳转到商品页面
- [ ] 页面顶部显示用户名: `customer@cinema.com`

---

### 步骤 2: 浏览商品并添加到购物车

**操作路径**: 商品页面 → 选择"威士忌可乐鸡尾酒" → 添加到购物车

**操作步骤**:
1. 在商品列表中找到"威士忌可乐鸡尾酒"
2. 查看商品详情（确认价格、BOM 配方展示）
3. 点击"加入购物车"按钮
4. 在弹出的数量选择器中输入 `1`
5. 点击"确认"

**验证点**:
- [ ] 商品成功添加到购物车
- [ ] 购物车图标显示数字 `1`
- [ ] 弹出提示: "已添加到购物车"

---

### 步骤 3: 结账并创建订单

**操作路径**: 购物车 → 结账 → 提交订单

**操作步骤**:
1. 点击购物车图标进入购物车页面
2. 确认商品信息:
   - 商品名称: 威士忌可乐鸡尾酒
   - 数量: 1
   - 单价: ¥50.00 (示例价格)
3. 点击"去结算"按钮
4. 选择门店: `测试门店 A`
5. 选择取货时间: `今天 18:00`
6. 点击"提交订单"

**验证点**:
- [ ] 订单提交成功
- [ ] 显示订单号（格式: `ORD-20251231-XXXXXX`）
- [ ] 显示订单状态: `待出品`
- [ ] 弹出提示: "订单创建成功，请前往门店取货"

---

### 步骤 4: 验证预占库存（后端数据检查）

**操作**: 使用 Supabase Dashboard 或 SQL 查询验证库存预占

**SQL 查询语句**:

```sql
-- 查询威士忌库存状态
SELECT
  sku_id,
  sku_name,
  on_hand,
  reserved,
  (on_hand - reserved) AS available,
  updated_at
FROM inventory
WHERE sku_id = 'SKU-WHISKEY-40ML';

-- 查询可乐库存状态
SELECT
  sku_id,
  sku_name,
  on_hand,
  reserved,
  (on_hand - reserved) AS available,
  updated_at
FROM inventory
WHERE sku_id = 'SKU-COLA-150ML';

-- 查询杯子库存状态
SELECT
  sku_id,
  sku_name,
  on_hand,
  reserved,
  (on_hand - reserved) AS available,
  updated_at
FROM inventory
WHERE sku_id = 'SKU-CUP-250ML';
```

**预期结果（预占后）**:

| 原料 SKU | 现存库存 (on_hand) | 预占库存 (reserved) | 可用库存 (available) | 说明 |
|----------|-------------------|-------------------|---------------------|------|
| SKU-WHISKEY-40ML | **100 ml** (不变) | **45 ml** (↑ +45) | **55 ml** (↓ -45) | 预占了 1 杯的威士忌用量 |
| SKU-COLA-150ML | **500 ml** (不变) | **150 ml** (↑ +150) | **350 ml** (↓ -150) | 预占了 1 杯的可乐用量 |
| SKU-CUP-250ML | **50 个** (不变) | **1 个** (↑ +1) | **49 个** (↓ -1) | 预占了 1 个杯子 |

**验证点**:
- [ ] ✅ `on_hand` (现存库存) **保持不变**（关键！预占阶段不扣减物理库存）
- [ ] ✅ `reserved` (预占库存) **正确增加**（按 BOM 配方计算的用量）
- [ ] ✅ `available` (可用库存) **正确减少**（= on_hand - reserved）
- [ ] ✅ `updated_at` 时间戳已更新

**常见错误检测**:
- [ ] ❌ 如果 `on_hand` 减少了 → **错误**: 预占阶段不应扣减现存库存
- [ ] ❌ 如果 `reserved` 没有增加 → **错误**: 预占失败，可能超卖
- [ ] ❌ 如果 `reserved` 增加的数量不对 → **错误**: BOM 计算错误

---

### 步骤 5: 验证订单状态

**操作**: 在 C端 查看订单详情

**操作路径**: 我的订单 → 订单详情

**操作步骤**:
1. 返回 C端 H5 页面
2. 点击"我的订单"
3. 找到刚创建的订单（订单号: `ORD-20251231-XXXXXX`）
4. 点击订单查看详情

**验证点**:
- [ ] 订单状态显示: `待出品`
- [ ] 商品信息正确:
  - 商品名称: 威士忌可乐鸡尾酒
  - 数量: 1
  - 单价: ¥50.00
- [ ] 取货信息正确:
  - 门店: 测试门店 A
  - 取货时间: 今天 18:00

---

## 阶段二：出品/履约（实扣阶段）验证

### 步骤 6: 吧台员工登录 B端

**操作路径**: 打开 B端管理后台 → 登录

**操作步骤**:
1. 浏览器新标签页访问 `http://localhost:3000`
2. 输入用户名: `bartender@cinema.com`
3. 输入密码: `password123`
4. 点击"登录"

**验证点**:
- [ ] 登录成功，跳转到工作台
- [ ] 左侧菜单显示"饮品订单管理"模块

---

### 步骤 7: 查看待出品订单

**操作路径**: 饮品订单管理 → 待出品订单列表

**操作步骤**:
1. 点击左侧菜单"饮品订单管理" → "待出品订单"
2. 在订单列表中找到刚创建的订单（通过订单号或商品名称筛选）
3. 查看订单详情:
   - 订单号: `ORD-20251231-XXXXXX`
   - 商品: 威士忌可乐鸡尾酒 × 1
   - 状态: 待出品

**验证点**:
- [ ] 订单在待出品列表中显示
- [ ] 订单信息准确（订单号、商品、数量、客户）
- [ ] 显示"确认出品"按钮

---

### 步骤 8: 确认出品（触发实扣）

**操作路径**: 待出品订单 → 确认出品

**操作步骤**:
1. 点击订单右侧的"确认出品"按钮
2. 系统弹出确认对话框:
   - 提示: "确认出品后将扣减原料库存，是否继续？"
   - 显示 BOM 配方明细:
     - 威士忌: 45 ml
     - 可乐: 150 ml
     - 玻璃杯: 1 个
3. 点击"确认"

**验证点**:
- [ ] 弹出成功提示: "出品成功"
- [ ] 订单状态更新为: `已出品`
- [ ] 订单从"待出品"列表移除，进入"已出品"列表

---

### 步骤 9: 验证实扣库存（后端数据检查）

**操作**: 使用 Supabase Dashboard 或 SQL 查询验证库存实扣

**SQL 查询语句** (同步骤 4):

```sql
-- 查询威士忌库存状态（实扣后）
SELECT
  sku_id,
  sku_name,
  on_hand,
  reserved,
  (on_hand - reserved) AS available,
  updated_at
FROM inventory
WHERE sku_id = 'SKU-WHISKEY-40ML';

-- 查询可乐库存状态（实扣后）
SELECT
  sku_id,
  sku_name,
  on_hand,
  reserved,
  (on_hand - reserved) AS available,
  updated_at
FROM inventory
WHERE sku_id = 'SKU-COLA-150ML';

-- 查询杯子库存状态（实扣后）
SELECT
  sku_id,
  sku_name,
  on_hand,
  reserved,
  (on_hand - reserved) AS available,
  updated_at
FROM inventory
WHERE sku_id = 'SKU-CUP-250ML';
```

**预期结果（实扣后）**:

| 原料 SKU | 现存库存 (on_hand) | 预占库存 (reserved) | 可用库存 (available) | 说明 |
|----------|-------------------|-------------------|---------------------|------|
| SKU-WHISKEY-40ML | **55 ml** (↓ -45) | **0 ml** (↓ -45) | **55 ml** (不变) | 扣减现存库存，释放预占 |
| SKU-COLA-150ML | **350 ml** (↓ -150) | **0 ml** (↓ -150) | **350 ml** (不变) | 扣减现存库存，释放预占 |
| SKU-CUP-250ML | **49 个** (↓ -1) | **0 个** (↓ -1) | **49 个** (不变) | 扣减现存库存，释放预占 |

**验证点**:
- [ ] ✅ `on_hand` (现存库存) **正确减少**（扣减了实际消耗量）
- [ ] ✅ `reserved` (预占库存) **归零**（释放了之前的预占）
- [ ] ✅ `available` (可用库存) **保持不变**（= on_hand - reserved，减少的 on_hand 和 reserved 相等）
- [ ] ✅ `updated_at` 时间戳已更新

**数学验证**:
```
初始状态: on_hand=100, reserved=0, available=100
预占后:   on_hand=100, reserved=45, available=55
实扣后:   on_hand=55,  reserved=0,  available=55

验证公式:
  实扣后 on_hand = 预占后 on_hand - BOM用量  (100 - 45 = 55) ✅
  实扣后 reserved = 0  (预占完全释放) ✅
  实扣后 available = 实扣后 on_hand - 实扣后 reserved = 55 - 0 = 55 ✅
```

**常见错误检测**:
- [ ] ❌ 如果 `on_hand` 没有减少 → **错误**: 实扣失败，库存未扣减
- [ ] ❌ 如果 `on_hand` 减少量不对 → **错误**: BOM 展开计算错误
- [ ] ❌ 如果 `reserved` 没有归零 → **错误**: 预占未释放，会导致可用库存计算错误
- [ ] ❌ 如果 `on_hand` 变成负数 → **严重错误**: 超卖了，库存管理失败

---

### 步骤 10: 验证库存变动流水

**操作**: 查询库存变动流水表（Inventory Transaction Log）

**SQL 查询语句**:

```sql
-- 查询威士忌的库存变动流水（最近 2 条记录）
SELECT
  id,
  sku_id,
  transaction_type,
  quantity,
  unit,
  on_hand_before,
  on_hand_after,
  reserved_before,
  reserved_after,
  reference_type,
  reference_id,
  created_at,
  created_by
FROM inventory_transactions
WHERE sku_id = 'SKU-WHISKEY-40ML'
ORDER BY created_at DESC
LIMIT 2;

-- 查询可乐的库存变动流水（最近 2 条记录）
SELECT
  id,
  sku_id,
  transaction_type,
  quantity,
  unit,
  on_hand_before,
  on_hand_after,
  reserved_before,
  reserved_after,
  reference_type,
  reference_id,
  created_at,
  created_by
FROM inventory_transactions
WHERE sku_id = 'SKU-COLA-150ML'
ORDER BY created_at DESC
LIMIT 2;
```

**预期结果（威士忌流水）**:

| transaction_type | quantity | on_hand_before | on_hand_after | reserved_before | reserved_after | reference_type | reference_id |
|------------------|----------|----------------|---------------|-----------------|----------------|----------------|--------------|
| **RESERVE** (预占) | 45 ml | 100 | 100 | 0 | 45 | ORDER | ORD-20251231-XXXXXX |
| **DEDUCT** (实扣) | 45 ml | 100 | 55 | 45 | 0 | ORDER_FULFILL | ORD-20251231-XXXXXX |

**预期结果（可乐流水）**:

| transaction_type | quantity | on_hand_before | on_hand_after | reserved_before | reserved_after | reference_type | reference_id |
|------------------|----------|----------------|---------------|-----------------|----------------|----------------|--------------|
| **RESERVE** (预占) | 150 ml | 500 | 500 | 0 | 150 | ORDER | ORD-20251231-XXXXXX |
| **DEDUCT** (实扣) | 150 ml | 500 | 350 | 150 | 0 | ORDER_FULFILL | ORD-20251231-XXXXXX |

**验证点**:
- [ ] ✅ **预占流水记录存在**:
  - `transaction_type` = `RESERVE`
  - `quantity` = BOM 配方中的用量（威士忌 45 ml，可乐 150 ml）
  - `on_hand_before` = `on_hand_after` (预占不扣现存库存)
  - `reserved_before` < `reserved_after` (预占库存增加)
  - `reference_type` = `ORDER`
  - `reference_id` = 订单号

- [ ] ✅ **实扣流水记录存在**:
  - `transaction_type` = `DEDUCT`
  - `quantity` = BOM 配方中的用量
  - `on_hand_before` > `on_hand_after` (现存库存减少)
  - `reserved_before` > `reserved_after` = 0 (预占库存释放)
  - `reference_type` = `ORDER_FULFILL`
  - `reference_id` = 订单号

- [ ] ✅ **时间戳逻辑正确**:
  - 预占流水的 `created_at` < 实扣流水的 `created_at`

**常见错误检测**:
- [ ] ❌ 如果缺少预占流水 → **错误**: 预占操作未记录，审计不完整
- [ ] ❌ 如果缺少实扣流水 → **错误**: 实扣操作未记录，审计不完整
- [ ] ❌ 如果流水的 `quantity` 与 BOM 不符 → **错误**: 扣料计算错误
- [ ] ❌ 如果流水的 `reference_id` 不是订单号 → **错误**: 业务关联错误

---

## 📊 完整验证总结表

### 库存状态变化全流程

| 阶段 | 威士忌 on_hand | 威士忌 reserved | 威士忌 available | 可乐 on_hand | 可乐 reserved | 可乐 available |
|------|---------------|----------------|-----------------|-------------|--------------|---------------|
| **初始状态** | 100 ml | 0 ml | 100 ml | 500 ml | 0 ml | 500 ml |
| **预占后** (下单) | 100 ml | 45 ml | 55 ml | 500 ml | 150 ml | 350 ml |
| **实扣后** (出品) | 55 ml | 0 ml | 55 ml | 350 ml | 0 ml | 350 ml |

### 验证检查清单

#### 功能性验证
- [ ] C端用户可以正常登录
- [ ] C端可以浏览商品并添加到购物车
- [ ] C端可以结账并创建订单
- [ ] B端吧台员工可以正常登录
- [ ] B端可以查看待出品订单
- [ ] B端可以确认出品并触发实扣

#### 数据一致性验证
- [ ] **预占阶段**: `on_hand` 不变，`reserved` 增加，`available` 减少
- [ ] **实扣阶段**: `on_hand` 减少，`reserved` 归零，`available` 保持
- [ ] **库存公式**: `available = on_hand - reserved` 在所有阶段都成立
- [ ] **BOM 计算**: 扣减量与 BOM 配方完全一致
- [ ] **流水记录**: 预占和实扣都有对应的流水记录
- [ ] **订单关联**: 流水中的 `reference_id` 与订单号一致

#### 边界情况验证
- [ ] **库存不足预警**: 如果可用库存不足，下单时应提示"库存不足"
- [ ] **并发下单**: 两个用户同时下单同一商品，预占库存应正确累加
- [ ] **取消订单**: 取消订单后，预占库存应释放（`reserved` 减少，`available` 增加）
- [ ] **超时未出品**: 订单超时后，预占库存应自动释放

---

## 🐛 常见问题排查

### 问题 1: 预占后现存库存 (on_hand) 减少了

**症状**: 下单后 `on_hand` 从 100 减少到 55

**原因**: 预占逻辑错误，直接扣减了现存库存

**修复方法**:
1. 检查预占接口 `/api/inventory/reserve`
2. 确认只更新 `reserved` 字段，不更新 `on_hand` 字段
3. 修复 SQL:
   ```sql
   -- ❌ 错误的预占 SQL
   UPDATE inventory
   SET on_hand = on_hand - #{quantity},
       reserved = reserved + #{quantity}
   WHERE sku_id = #{skuId};

   -- ✅ 正确的预占 SQL
   UPDATE inventory
   SET reserved = reserved + #{quantity}
   WHERE sku_id = #{skuId}
     AND (on_hand - reserved) >= #{quantity};
   ```

---

### 问题 2: 实扣后预占库存 (reserved) 没有归零

**症状**: 出品后 `reserved` 仍然是 45，没有变成 0

**原因**: 实扣逻辑只扣减了 `on_hand`，忘记释放 `reserved`

**修复方法**:
1. 检查实扣接口 `/api/inventory/deduct`
2. 确认同时更新 `on_hand` 和 `reserved` 两个字段
3. 修复 SQL:
   ```sql
   -- ❌ 错误的实扣 SQL
   UPDATE inventory
   SET on_hand = on_hand - #{quantity}
   WHERE sku_id = #{skuId};

   -- ✅ 正确的实扣 SQL
   UPDATE inventory
   SET on_hand = on_hand - #{quantity},
       reserved = reserved - #{quantity}
   WHERE sku_id = #{skuId};
   ```

---

### 问题 3: BOM 扣料数量不对

**症状**: 威士忌应该扣 45 ml，实际扣了 40 ml

**原因**: BOM 配方数据错误，或 BOM 展开逻辑错误

**排查方法**:
1. 查询 BOM 配方表:
   ```sql
   SELECT * FROM bom_materials
   WHERE finished_goods_sku_id = 'PRODUCT-COCKTAIL-001';
   ```
2. 验证配方中的 `quantity` 和 `unit` 是否正确
3. 检查 BOM 展开代码的计算逻辑

---

### 问题 4: 库存变动流水缺失

**症状**: `inventory_transactions` 表中找不到预占或实扣记录

**原因**: 流水记录代码未执行，或事务回滚

**排查方法**:
1. 检查库存操作代码是否包含流水记录逻辑
2. 确认流水记录与库存更新在同一事务中
3. 检查日志是否有异常导致事务回滚

---

## 📈 性能验证（可选）

### 并发下单压力测试

**测试目标**: 验证高并发下预占库存的准确性

**测试方法**:
1. 使用 JMeter 或 Postman 模拟 10 个用户同时下单
2. 每个用户下单 1 杯威士忌可乐
3. 验证最终库存状态:
   - 预期: `reserved` = 450 ml (10 × 45)
   - 验证: 不会出现超卖（`reserved` > `on_hand`）

---

## 📚 相关文档

- E2E 测试场景: `scenarios/inventory/E2E-INVENTORY-002.yaml`
- E2E 测试脚本: `scenarios/inventory/E2E-INVENTORY-002.spec.ts`
- 库存 API 规格: `specs/I003-inventory-query/contracts/api.yaml`
- BOM 数据模型: `specs/P005-bom-management/data-model.md`
- 测试数据种子: `testdata/seeds/inventory-bom.sql`

---

## ✅ 验证通过标准

完成以上所有验证步骤后，如果满足以下条件，则认为 BOM 库存预占与实扣流程验证通过：

1. ✅ **预占阶段**:
   - 下单成功，订单状态为"待出品"
   - `on_hand` 保持不变
   - `reserved` 正确增加（按 BOM 配方计算）
   - `available` 正确减少
   - 预占流水记录存在且准确

2. ✅ **实扣阶段**:
   - 出品确认成功，订单状态变为"已出品"
   - `on_hand` 正确减少（扣减实际消耗量）
   - `reserved` 归零（预占完全释放）
   - `available` 保持不变（预占后的可用库存）
   - 实扣流水记录存在且准确

3. ✅ **数据一致性**:
   - 所有阶段 `available = on_hand - reserved` 公式成立
   - BOM 配方展开计算准确
   - 订单与库存流水正确关联
   - 时间戳逻辑正确（预占 < 实扣）

4. ✅ **用户体验**:
   - C端用户可以顺利下单和查看订单
   - B端吧台可以顺利确认出品
   - 提示信息清晰准确

---

**验证人**: ________________
**验证日期**: ________________
**验证结果**: [ ] 通过  [ ] 失败
**备注**: ________________

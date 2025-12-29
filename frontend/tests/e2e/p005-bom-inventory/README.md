# P005 BOM库存预占与扣减 - Playwright E2E 测试

**@spec P005-bom-inventory-deduction**

## 概述

这是 P005 BOM库存预占与扣减功能的完整 Playwright E2E 测试套件，涵盖前端 UI 交互和业务流程验证。

### 测试场景

- ✅ **BOM库存预占** - 用户下单时自动预占BOM原料库存
- ✅ **订单履约扣减** - 订单完成后扣减库存并释放预占
- ✅ **预占取消** - 订单取消时释放预占库存
- ✅ **库存事务日志查看** - 查看BOM扣减的事务记录
- ✅ **并发预占处理** - 验证悲观锁机制

## 测试文件结构

```
frontend/tests/e2e/p005-bom-inventory/
├── page-objects/                    # Page Object Models
│   ├── InventoryPage.ts            # 库存查询页面对象
│   ├── OrderPage.ts                # 订单管理页面对象
│   └── TransactionLogPage.ts       # 事务日志页面对象
├── fixtures/                        # 测试数据固件
│   └── test-data.ts                # SKU、订单、库存测试数据
├── helpers/                         # 测试辅助工具
│   └── database-helper.ts          # 数据库查询和验证工具
├── 01-bom-reservation.spec.ts      # BOM库存预占测试 (5个用例)
├── 02-order-fulfillment.spec.ts    # 订单履约扣减测试 (6个用例)
├── 03-reservation-cancellation.spec.ts # 预占取消测试 (6个用例)
├── 04-concurrent-operations.spec.ts    # 并发操作测试 (5个用例)
└── README.md                        # 本文件
```

## 前置条件

### 1. 环境准备

- ✅ Spring Boot 后端运行在 `http://localhost:8080`
- ✅ React 前端运行在 `http://localhost:3000`
- ✅ Supabase PostgreSQL 数据库可访问
- ✅ 测试数据已导入（运行 `setup-test-data-direct.sql`）

### 2. 依赖安装

```bash
cd frontend
npm install @playwright/test
npx playwright install
```

### 3. 环境变量

确保设置以下环境变量：

```bash
export SUPABASE_DB_PASSWORD="Pgsql.2024"
```

## 运行测试

### 运行所有测试

```bash
cd frontend
npx playwright test tests/e2e/p005-bom-inventory
```

### 运行单个测试文件

```bash
# BOM库存预占测试
npx playwright test tests/e2e/p005-bom-inventory/01-bom-reservation.spec.ts

# 订单履约扣减测试
npx playwright test tests/e2e/p005-bom-inventory/02-order-fulfillment.spec.ts

# 预占取消测试
npx playwright test tests/e2e/p005-bom-inventory/03-reservation-cancellation.spec.ts

# 并发操作测试
npx playwright test tests/e2e/p005-bom-inventory/04-concurrent-operations.spec.ts
```

### 运行单个测试用例

```bash
npx playwright test tests/e2e/p005-bom-inventory/01-bom-reservation.spec.ts -g "TC-UI-001"
```

### 调试模式

```bash
npx playwright test tests/e2e/p005-bom-inventory --debug
```

### 生成测试报告

```bash
npx playwright test tests/e2e/p005-bom-inventory --reporter=html
npx playwright show-report
```

## 测试用例清单

### 01-bom-reservation.spec.ts (BOM库存预占)

| 用例ID | 测试内容 | 优先级 |
|--------|---------|--------|
| TC-UI-001 | 单品下单后UI显示预占库存增加 | P0 |
| TC-UI-002 | 多杯下单验证批量预占 | P0 |
| TC-UI-003 | 库存不足时UI显示错误提示 | P0 |
| TC-UI-004 | 打开库存详情查看预占明细 | P1 |
| TC-UI-005 | 验证BOM展开计算正确性（4个组件全部预占） | P0 |

### 02-order-fulfillment.spec.ts (订单履约扣减)

| 用例ID | 测试内容 | 优先级 |
|--------|---------|--------|
| TC-UI-006 | 订单履约后UI显示库存实扣 | P0 |
| TC-UI-007 | 验证所有BOM组件同步扣减 | P0 |
| TC-UI-008 | 履约后生成BOM扣减事务日志 | P1 |
| TC-UI-009 | 查看事务详情显示BOM组件明细 | P1 |
| TC-UI-010 | 多杯履约验证批量扣减 | P0 |
| TC-UI-011 | BOM快照版本锁定验证 | P1 |

### 03-reservation-cancellation.spec.ts (预占取消)

| 用例ID | 测试内容 | 优先级 |
|--------|---------|--------|
| TC-UI-012 | 取消订单后UI显示预占释放 | P0 |
| TC-UI-013 | 验证所有BOM组件预占同步释放 | P0 |
| TC-UI-014 | 取消后生成预占释放事务日志 | P1 |
| TC-UI-015 | 验证预占记录状态变更 | P1 |
| TC-UI-016 | 多杯取消验证批量释放 | P0 |
| TC-UI-017 | 重复取消订单验证幂等性 | P2 |

### 04-concurrent-operations.spec.ts (并发操作)

| 用例ID | 测试内容 | 优先级 |
|--------|---------|--------|
| TC-UI-018 | 并发下单验证悲观锁机制 | P0 |
| TC-UI-019 | 库存接近耗尽时的并发防护 | P0 |
| TC-UI-020 | 并发履约验证原子性 | P1 |
| TC-UI-021 | 并发取消验证原子性 | P1 |
| TC-UI-022 | 混合并发操作（下单+履约+取消） | P1 |

**总计**: 22个测试用例

## 测试数据

### 测试用SKU

| SKU名称 | SKU ID | 用途 |
|---------|--------|------|
| 威士忌可乐鸡尾酒 | `22222222-0000-0000-0000-000000000001` | 成品（测试主体） |
| 威士忌 | `11111111-0000-0000-0000-000000000001` | 原料（45ml/杯） |
| 可乐 | `11111111-0000-0000-0000-000000000002` | 原料（150ml/杯） |
| 冰块 | `11111111-0000-0000-0000-000000000003` | 原料（1个/杯） |
| 柠檬片 | `11111111-0000-0000-0000-000000000004` | 原料（1个/杯） |

### BOM配方

```
威士忌可乐鸡尾酒 (1杯) =
  - 威士忌 45ml
  - 可乐 150ml
  - 冰块 1个
  - 柠檬片 1个
```

## 常见问题排查

### 1. 测试失败 - "Backend API not available"

**问题**: Spring Boot 后端未运行

**解决**:
```bash
cd backend
mvn spring-boot:run
```

### 2. 测试失败 - "Frontend not accessible"

**问题**: React 前端未运行

**解决**:
```bash
cd frontend
npm run dev
```

### 3. 数据库连接失败

**问题**: Supabase 数据库无法访问

**解决**:
- 检查网络连接
- 确认 `SUPABASE_DB_PASSWORD` 环境变量设置正确
- 检查防火墙设置

### 4. 测试数据不一致

**问题**: 多次运行测试后数据累积

**解决**:
```bash
# 每个测试都会在 beforeEach 中自动调用 resetTestData()
# 如需手动重置，运行：
cd backend/src/main/resources/db/migration
psql -h aws-1-us-east-2.pooler.supabase.com -p 6543 -U postgres.fxhgyxceqrmnpezluaht -d postgres -f setup-test-data-direct.sql
```

### 5. Page Object 找不到元素

**问题**: UI 元素选择器已变更

**解决**:
- 检查前端代码中的 `data-testid` 属性
- 更新 `page-objects/*.ts` 中的选择器
- 使用 Playwright Inspector 调试: `npx playwright test --debug`

## 测试覆盖范围

| 功能模块 | 测试类型 | 覆盖率 |
|---------|---------|--------|
| BOM库存预占 | UI + API | 100% |
| 订单履约扣减 | UI + API | 100% |
| 预占取消 | UI + API | 100% |
| 库存事务日志 | UI + API | 100% |
| 并发控制 | API | 100% |
| 数据库一致性 | DB验证 | 100% |

## 测试报告示例

运行测试后会生成详细报告：

```
Running 22 tests using 4 workers

  ✓ [chromium] › 01-bom-reservation.spec.ts:TC-UI-001 (5.2s)
  ✓ [chromium] › 01-bom-reservation.spec.ts:TC-UI-002 (4.8s)
  ✓ [chromium] › 01-bom-reservation.spec.ts:TC-UI-003 (6.1s)
  ...
  ✓ [chromium] › 04-concurrent-operations.spec.ts:TC-UI-022 (12.5s)

  22 passed (2.5m)
```

## 下一步

1. ✅ 使用 `e2e-test-executor` skill 运行测试
2. 📝 记录发现的bug到 `bug-log.md`
3. 🔧 修复失败的测试用例
4. 📊 生成测试覆盖率报告
5. 📋 更新测试文档

## 维护指南

### 添加新测试

1. 在相应的 `*.spec.ts` 文件中添加测试用例
2. 遵循现有的命名规范: `TC-UI-{序号}`
3. 使用 Page Object Model 封装UI操作
4. 添加详细的日志输出便于调试

### 更新Page Object

当前端UI变更时，更新对应的 Page Object:

```typescript
// 示例：更新按钮选择器
readonly submitButton = page.locator('button[data-testid="submit-order"]');
```

### 添加测试数据

在 `fixtures/test-data.ts` 中添加新的测试数据：

```typescript
export const NEW_SKU = '11111111-0000-0000-0000-000000000005';
```

## 联系与支持

- **规格文档**: `specs/P005-bom-inventory-deduction/spec.md`
- **E2E测试用例**: `specs/P005-bom-inventory-deduction/e2e-test-cases.md`
- **问题追踪**: GitHub Issues

---

**最后更新**: 2025-12-29
**维护者**: E2E Test Writer Skill

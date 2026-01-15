# Research: 库存调整管理 (P004-inventory-adjustment)

**Date**: 2025-12-26
**Status**: Complete

## Research Questions

### 1. 现有库存模块集成方式

**Question**: 如何复用P003-inventory-query现有组件和API进行扩展？

**Decision**: 采用模块内扩展方式，在 `frontend/src/features/inventory/` 目录下新增调整相关组件和服务

**Rationale**:
- P003已实现库存列表、详情抽屉、状态标签等核心组件
- 调整功能是库存管理的自然延伸，应保持模块内聚
- 复用现有类型定义（`InventoryTransaction`、`StoreInventoryItem`）减少重复代码

**Alternatives Considered**:
1. 创建独立的 `inventory-adjustment` feature模块 → 拒绝，会导致代码分散
2. 在pages层直接实现 → 拒绝，违反组件化原则

---

### 2. 调整流水与现有InventoryTransaction关系

**Question**: 库存调整生成的流水记录应该使用现有的 `InventoryTransaction` 类型还是新建类型？

**Decision**: 复用并扩展现有 `InventoryTransaction` 类型

**Rationale**:
- P003已定义 `TransactionType` 枚举，包含 `ADJUSTMENT_IN`（盘点入库）和 `ADJUSTMENT_OUT`（盘点出库）
- 现有类型已包含 `stockBefore`、`stockAfter`、`operatorId` 等必要字段
- 需要扩展：增加 `reasonCode`、`reasonText`、`remarks` 字段关联调整原因

**Code Reference**:
```typescript
// 现有类型 frontend/src/types/inventory.ts:32-44
export enum TransactionType {
  ADJUSTMENT_IN = 'adjustment_in',   // 盘点入库（盘盈）
  ADJUSTMENT_OUT = 'adjustment_out', // 盘点出库（盘亏）
  DAMAGE_OUT = 'damage_out',         // 损耗出库（报损）
  // ... 其他类型
}
```

---

### 3. 审批流程状态机设计

**Question**: 大额调整审批的状态流转应如何设计？

**Decision**: 采用简单的四状态模型

**Rationale**:
- 规格明确本期仅支持单级审批，无需复杂工作流引擎
- 状态变更需原子性保证，使用数据库事务

**State Machine**:
```
DRAFT → PENDING_APPROVAL → APPROVED → (库存已更新)
                       ↘ REJECTED → (库存不变)
                       ↘ WITHDRAWN → (申请人撤回)
```

---

### 4. 审批阈值触发逻辑

**Question**: 如何计算调整金额并触发审批？

**Decision**: 调整金额 = 调整数量 × SKU单价，阈值默认1000元，>=阈值触发审批

**Rationale**:
- 规格假设SKU单价已存在于主数据
- 阈值硬编码为1000元（后续可配置化）
- 边界处理：金额=阈值时触发（>=）

**Implementation Notes**:
```typescript
const requiresApproval = (quantity: number, unitPrice: number, threshold: number = 1000): boolean => {
  const adjustmentAmount = Math.abs(quantity * unitPrice);
  return adjustmentAmount >= threshold;
};
```

---

### 5. 二次确认弹窗交互设计

**Question**: 二次确认弹窗应显示哪些信息？

**Decision**: 显示调整前后库存对比 + 调整摘要

**Rationale**:
- 产品文档明确要求"展示调整前后对比"
- 帮助用户确认操作正确性，防止误操作

**UI Structure**:
```
┌─────────────────────────────────────┐
│ 确认库存调整                      [X] │
├─────────────────────────────────────┤
│ SKU: SKU000001 - 威士忌              │
│ 门店: 中山路门店                      │
│ 调整类型: 盘盈                        │
│ 调整数量: +10 瓶                     │
│ 调整原因: 盘点发现                   │
│                                     │
│ ┌───────────┬──────────┬──────────┐ │
│ │           │ 调整前   │ 调整后   │ │
│ ├───────────┼──────────┼──────────┤ │
│ │ 现存数量   │ 100      │ 110     │ │
│ │ 可用数量   │ 80       │ 90      │ │
│ └───────────┴──────────┴──────────┘ │
│                                     │
│              [取消] [确认调整]       │
└─────────────────────────────────────┘
```

---

### 6. 流水列表颜色标识

**Question**: 入库/出库的颜色标识如何实现？

**Decision**: 使用Ant Design Tag组件 + 自定义样式

**Rationale**:
- 产品文档明确：入库绿色"+"、出库红色"-"
- 与现有InventoryStatusTag组件风格一致

**Implementation**:
```typescript
const TransactionQuantityTag: React.FC<{ quantity: number; type: TransactionType }> = ({ quantity, type }) => {
  const isInbound = ['adjustment_in', 'purchase_in', 'transfer_in', 'return_in'].includes(type);
  return (
    <span style={{ color: isInbound ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
      {isInbound ? '+' : '-'}{Math.abs(quantity)}
    </span>
  );
};
```

---

### 7. 权限控制方案

**Question**: 如何实现库存管理员/运营总监的权限分离？

**Decision**: 基于角色的前端路由守卫 + 后端API权限校验

**Rationale**:
- 规格假设权限体系已实现
- 复用现有用户角色体系

**Permission Mapping**:
| 操作 | 所需角色 |
|------|----------|
| 录入调整 | inventory_admin |
| 编辑安全库存 | inventory_admin |
| 审批调整 | operations_director |
| 撤回调整 | inventory_admin (仅限自己创建的) |
| 查看流水 | inventory_admin, operations_director |

---

## Technology Decisions

### 前端技术选型

| 需求 | 技术选择 | 说明 |
|------|----------|------|
| 表单验证 | Zod + React Hook Form | 复用现有项目配置 |
| 状态管理 | Zustand（表单草稿）+ TanStack Query（API数据） | 符合宪法要求 |
| 日期选择 | Ant Design DatePicker + dayjs | 流水筛选日期范围 |
| 弹窗组件 | Ant Design Modal | 调整录入、二次确认 |
| 表格组件 | Ant Design Table | 流水列表、审批列表 |

### 后端API设计原则

1. **RESTful风格**: 资源路径清晰（`/api/inventory-adjustments`、`/api/approvals`）
2. **统一响应格式**: 遵循宪法定义的 `ApiResponse<T>` 结构
3. **事务保证**: 调整提交和库存更新在同一事务内完成
4. **乐观锁**: 安全库存编辑使用version字段防止并发冲突

---

## Open Questions (Resolved)

| 问题 | 答案 | 来源 |
|------|------|------|
| 调整类型有哪些？ | 盘盈、盘亏、报损 | spec.md FR-001 |
| 审批阈值是多少？ | 1000元 | spec.md Assumptions |
| 原因字典有哪些？ | 盘点差异、货物损坏、过期报废、入库错误、其他 | spec.md FR-006 |
| 谁可以审批？ | 运营总监 | spec.md Clarifications |
| 是否支持批量调整？ | 否，本期仅逐条录入 | spec.md Out of Scope |

---

## Next Steps

1. 生成 `data-model.md` - 定义数据库表结构
2. 生成 `contracts/api.yaml` - OpenAPI规范
3. 生成 `quickstart.md` - 开发快速入门

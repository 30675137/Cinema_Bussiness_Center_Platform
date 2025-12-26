# 单位换算知识库

本文档描述单位换算配置功能的业务规则和操作指南，供运营专家技能参考。

## 功能概述

单位换算配置是 BOM（物料清单/配方）系统的基础支撑模块，提供标准化的单位转换能力。

### 核心能力

| 能力 | 描述 | 示例 |
|------|------|------|
| **基础换算关系配置** | 定义两个单位之间的换算比例 | 1瓶 = 750ml |
| **换算链支持** | 通过多个换算规则实现间接换算 | 瓶→ml→L |
| **双向自动换算** | 定义正向换算后，系统自动支持反向计算 | 定义 1瓶=750ml，自动支持 ml→瓶 |
| **分类管理** | 按体积/重量/计数分类管理 | 体积类：ml↔L |
| **舍入精度控制** | 按单位类型配置默认舍入规则 | 体积类保留1位小数 |

---

## 数据库表结构

### unit_conversions 表

```sql
CREATE TABLE unit_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit VARCHAR(20) NOT NULL,           -- 源单位
  to_unit VARCHAR(20) NOT NULL,             -- 目标单位
  conversion_rate DECIMAL(10,6) NOT NULL,   -- 换算率
  category VARCHAR(20) NOT NULL             -- 类别: volume/weight/quantity
    CHECK (category IN ('volume', 'weight', 'quantity')),
  CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `from_unit` | VARCHAR(20) | 源单位名称（如：瓶、ml、kg） |
| `to_unit` | VARCHAR(20) | 目标单位名称 |
| `conversion_rate` | DECIMAL(10,6) | 换算率：1 from_unit = ? to_unit |
| `category` | VARCHAR(20) | 类别：volume（体积）/weight（重量）/quantity（计数） |

### 预置数据

系统预置以下基础换算规则：

| 类别 | 源单位 | 目标单位 | 换算率 |
|------|--------|----------|--------|
| volume | ml | L | 0.001 |
| volume | L | ml | 1000 |
| weight | g | kg | 0.001 |
| weight | kg | g | 1000 |
| quantity | 个 | 打 | 0.083333 |
| quantity | 打 | 个 | 12 |
| quantity | 瓶 | 箱 | 0.083333 |
| quantity | 箱 | 瓶 | 12 |

---

## 常用查询

### 查询所有换算规则

```sql
SELECT * FROM unit_conversions ORDER BY category, from_unit;
```

### 按类别筛选

```sql
-- 查询体积类换算规则
SELECT * FROM unit_conversions WHERE category = 'volume';

-- 查询重量类换算规则
SELECT * FROM unit_conversions WHERE category = 'weight';

-- 查询计数类换算规则
SELECT * FROM unit_conversions WHERE category = 'quantity';
```

### 搜索包含特定单位的规则

```sql
SELECT * FROM unit_conversions
WHERE from_unit ILIKE '%瓶%' OR to_unit ILIKE '%瓶%';
```

### 统计各类别规则数量

```sql
SELECT category, COUNT(*) as count
FROM unit_conversions
GROUP BY category;
```

---

## 换算计算规则

### 直接换算

当存在从 A 到 B 的直接换算规则时：

```
结果 = 数量 × conversion_rate
```

**示例**：45ml 换算为瓶（假设 1瓶 = 750ml）
- 需要查找 ml → 瓶 的规则
- 如果存在：结果 = 45 × (1/750) = 0.06瓶

### 换算链计算

当不存在直接换算规则时，系统自动查找换算路径：

```
路径：A → B → C
总换算率 = rate(A→B) × rate(B→C)
结果 = 数量 × 总换算率
```

**示例**：瓶 → L（通过 ml 中转）
- 路径：瓶 → ml → L
- 总换算率 = 750 × 0.001 = 0.75
- 1瓶 = 0.75L

### 路径查找规则

1. 使用 BFS（广度优先搜索）找最短路径
2. 最多支持 5 个中间步骤
3. 优先选择路径最短的换算链

---

## 舍入规则

### 按类别舍入

| 类别 | 数据库值 | 默认精度 | 舍入方式 |
|------|---------|---------|---------|
| 体积 | volume | 1 位小数 | 四舍五入 |
| 重量 | weight | 0 位小数 | 四舍五入 |
| 计数 | quantity | 0 位小数 | 向上取整 |

### 示例

```
45.67ml → 45.7ml    (体积类，四舍五入保留1位)
12.8g → 13g         (重量类，四舍五入取整)
2.5个 → 3个         (计数类，向上取整)
```

---

## 业务场景

### 场景一：酒吧按杯售酒

| 角色 | 操作 | 系统依赖 |
|------|------|----------|
| 采购 | 入库威士忌2瓶 | 库存记录：2瓶 或 1400ml |
| 收银 | 销售威士忌1杯 | BOM定义：1杯=45ml |
| 系统 | 自动扣减库存 | 单位换算：45ml = 0.06瓶 |

### 场景二：现调饮品配方

| 配方组件 | 配方用量 | 库存单位 | 换算过程 |
|----------|----------|----------|----------|
| 威士忌 | 45ml | 瓶(750ml/瓶) | 45ml ÷ 750 = 0.06瓶 |
| 可乐 | 150ml | ml | 直接扣减150ml |
| 高脚杯 | 1个 | 个 | 直接扣减1个 |

### 场景三：成本计算

```
成品标准成本 = Σ(组件数量 × 组件单位成本)

示例 - 威士忌可乐成本：
┌─────────────────────────────────────────┐
│ 组件        │ 用量    │ 单位成本   │ 小计    │
├─────────────────────────────────────────┤
│ 威士忌      │ 45ml    │ 0.50元/ml  │ 22.50元 │
│ 可乐        │ 150ml   │ 0.02元/ml  │ 3.00元  │
│ 高脚杯      │ 1个     │ 2.00元/个  │ 2.00元  │
├─────────────────────────────────────────┤
│ 标准成本                        │ 27.50元 │
└─────────────────────────────────────────┘
```

---

## 配置原则

### 原则一：以基础计量单位为核心

```
推荐做法：
  瓶 ─→ ml ←─ 杯
  kg ─→ g  ←─ 份

不推荐做法：
  瓶 ─→ 杯 ─→ L ─→ ml  （路径过长，精度损失）
```

### 原则二：保持换算链简洁

| 推荐 | 不推荐 | 原因 |
|------|--------|------|
| 1瓶=750ml | 1瓶=5杯, 1杯=150ml | 间接换算增加计算误差 |
| 1L=1000ml | 1L=6.67杯 | 避免非整数换算率 |

### 原则三：按单位类型分类

| 类型 | 常用单位 | 默认精度 |
|------|----------|----------|
| 体积类 (volume) | ml, L, 杯, 瓶 | 1位小数 |
| 重量类 (weight) | g, kg, 份 | 0位小数 |
| 计数类 (quantity) | 个, 打, 箱 | 0位小数 |

---

## 错误处理

### 常见错误

| 错误场景 | 错误代码 | 处理方式 |
|---------|---------|---------|
| 换算路径不存在 | `PATH_NOT_FOUND` | 提示用户先配置相关换算规则 |
| 循环依赖检测 | `CYCLE_DETECTED` | 显示循环路径，阻止保存 |
| 规则被 BOM 引用 | `RULE_REFERENCED` | 显示引用的 BOM 列表，阻止删除 |
| 规则已存在 | `DUPLICATE_RULE` | 提示规则已存在，提供修改选项 |
| 换算数量无效 | `INVALID_QUANTITY` | 提示数量必须为正数 |

### 循环依赖检测

系统在创建/修改换算规则时会自动检测循环依赖：

```
循环依赖示例：A → B → C → A

检测到循环时，系统阻止保存并显示：
"添加此规则将导致循环依赖：A → B → C → A，请检查换算规则配置"
```

### BOM 引用检查

删除换算规则前，系统检查是否被 BOM 引用：

```
如果规则被引用，系统提示：
"该换算规则被以下 BOM 配方引用：
- 威士忌可乐 (SKU: WC001)
- 长岛冰茶 (SKU: LI002)
请先修改这些 BOM 配方后再删除规则"
```

---

## API 接口参考

### 获取换算规则列表

```
GET /api/unit-conversions
GET /api/unit-conversions?category=volume
GET /api/unit-conversions?search=瓶
```

### 创建换算规则

```
POST /api/unit-conversions
Content-Type: application/json

{
  "fromUnit": "箱",
  "toUnit": "瓶",
  "conversionRate": 12,
  "category": "quantity"
}
```

### 执行换算计算

```
POST /api/unit-conversions/calculate-path
Content-Type: application/json

{
  "fromUnit": "ml",
  "toUnit": "瓶"
}

Response:
{
  "fromUnit": "ml",
  "toUnit": "瓶",
  "path": ["ml", "瓶"],
  "totalRate": 0.001333,
  "steps": 1,
  "found": true
}
```

### 循环依赖检测

```
POST /api/unit-conversions/validate-cycle
Content-Type: application/json

{
  "fromUnit": "A",
  "toUnit": "B",
  "existingRules": [...]
}

Response (无循环):
{
  "hasCycle": false
}

Response (有循环):
{
  "hasCycle": true,
  "cyclePath": ["A", "B", "C", "A"]
}
```

---

## 相关文档

- 业务需求：`/docs/业务需求/需求专项说明/单位换算配置功能专项说明.md`
- 功能规格：`/specs/P002-unit-conversion/spec.md`
- 数据模型：`/specs/P002-unit-conversion/data-model.md`
- 前端页面：`/bom/conversion`（单位换算配置页面）

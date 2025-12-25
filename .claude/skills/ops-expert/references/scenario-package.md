# 场景包管理规则

本文档描述场景包（Scenario Package）的业务规则和操作流程。

---

## 数据模型

### 基本信息

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 唯一标识 |
| name | String | 场景包名称 |
| description | Text | 描述说明 |
| status | Enum | 状态：DRAFT/PUBLISHED/ARCHIVED |
| price | Decimal | 销售价格 |
| original_price | Decimal | 原价（划线价） |
| valid_from | Timestamp | 有效期开始 |
| valid_to | Timestamp | 有效期结束 |

### 内容组成

场景包包含三种权益类型：

1. **硬权益 (hard_benefits)**: 实物商品
   - 饮料套餐、零食拼盘、装饰品等
   - 存储为 JSONB 数组

2. **软权益 (soft_benefits)**: 服务权益
   - VIP通道、专属接待、优先选座等
   - 存储为 JSONB 数组

3. **服务项目 (service_items)**: 增值服务
   - 摄影服务、主持服务、场地布置等
   - 存储为 JSONB 数组

---

## 状态流转

```
┌─────────┐     发布      ┌───────────┐     归档      ┌───────────┐
│  DRAFT  │──────────────▶│ PUBLISHED │──────────────▶│ ARCHIVED  │
│ (草稿)  │               │ (已发布)  │               │ (已归档)  │
└─────────┘               └───────────┘               └───────────┘
     ▲                          │
     │                          │
     └─────── 撤回发布 ─────────┘
```

### 状态说明

| 状态 | 英文 | 可见性 | 可预约 | 可编辑 |
|-----|------|--------|--------|--------|
| 草稿 | DRAFT | 仅管理员 | 否 | 是 |
| 已发布 | PUBLISHED | 所有用户 | 是 | 部分字段 |
| 已归档 | ARCHIVED | 仅管理员 | 否 | 否 |

---

## 发布条件

场景包从草稿状态发布到已发布状态，必须满足以下条件：

### 必要条件

1. **名称不为空**: `name IS NOT NULL AND name != ''`
2. **包含内容**: 至少有一项硬权益、软权益或服务项目
3. **设置价格**: `price > 0`
4. **选择影厅**: `applicable_halls` 数组不为空

### 验证规则

```sql
-- 检查发布条件
SELECT
    id,
    name,
    CASE
        WHEN name IS NULL OR name = '' THEN '名称不能为空'
        WHEN price IS NULL OR price <= 0 THEN '价格必须大于0'
        WHEN applicable_halls IS NULL OR array_length(applicable_halls, 1) IS NULL THEN '必须选择适用影厅'
        WHEN (hard_benefits IS NULL OR hard_benefits = '[]'::jsonb)
             AND (soft_benefits IS NULL OR soft_benefits = '[]'::jsonb)
             AND (service_items IS NULL OR service_items = '[]'::jsonb) THEN '必须包含至少一项内容'
        ELSE 'OK'
    END as validation_result
FROM scenario_packages
WHERE status = 'DRAFT';
```

---

## 常用查询

### 查询所有已发布的场景包

```sql
SELECT id, name, price, status, created_at
FROM scenario_packages
WHERE status = 'PUBLISHED'
ORDER BY created_at DESC;
```

### 按名称搜索场景包

```sql
SELECT id, name, status, price
FROM scenario_packages
WHERE name ILIKE '%关键词%';
```

### 查询场景包详情

```sql
SELECT
    id, name, description, status, price, original_price,
    hard_benefits, soft_benefits, service_items,
    applicable_halls, valid_from, valid_to,
    created_at, updated_at
FROM scenario_packages
WHERE id = '场景包ID';
```

### 统计场景包数量

```sql
SELECT
    status,
    COUNT(*) as count
FROM scenario_packages
GROUP BY status;
```

### 查询即将过期的场景包

```sql
SELECT id, name, valid_to
FROM scenario_packages
WHERE status = 'PUBLISHED'
  AND valid_to IS NOT NULL
  AND valid_to < NOW() + INTERVAL '7 days';
```

---

## 操作指南

### 发布场景包

1. 确认场景包满足所有发布条件
2. 执行状态变更：`UPDATE scenario_packages SET status = 'PUBLISHED' WHERE id = ?`
3. 验证发布成功

### 下架场景包

1. 检查是否有关联的待履约预约
2. 如有待履约预约，需要先处理预约
3. 执行状态变更：`UPDATE scenario_packages SET status = 'ARCHIVED' WHERE id = ?`

### 批量下架

当需要批量下架场景包时：
1. 显示受影响的场景包数量
2. 要求用户确认
3. 超过 10 个需要二次确认

---

## 注意事项

1. **已发布的场景包**只能修改部分字段（描述、价格等），不能修改核心结构
2. **有效期**设置后，系统会自动在过期时提醒运营人员
3. **原价**用于展示优惠力度，不影响实际销售
4. **适用影厅**变更会影响用户预约选择

# US-001 创建SKU主档 验证文档

**版本**: 1.2  
**更新日期**: 2025-12-25  
**状态**: MVP完成 + 类型继承重构

---

## 📚 关键概念理解

### SPU vs SKU 区别

| 维度 | SPU (标准产品单元) | SKU (库存单位) |
|------|-------------------|----------------|
| **定义** | 一类产品的抽象 | 最小可管理库存单位 |
| **作用** | 产品归类、品牌分类 | 库存管理、成本核算、BOM组件 |
| **属性** | 品牌、分类、描述 | 规格、成本、库存、条码 |

### SKU 四种类型说明

| 类型 | 说明 | 成本来源 | 例子 |
|------|------|---------|------|
| **原料 (raw_material)** | 生产原材料 | 手动输入 | 威士忌(0.5元/ml)、可乐糖浆(0.02元/ml) |
| **包材 (packaging)** | 包装耗材 | 手动输入 | 纸杯(0.3元/个)、吸管(0.1元/根)、高脚杯(2元/个) |
| **成品 (finished_product)** | 可售卖商品 | BOM自动计算 | 冰镇可乐(=糖浆+纸杯+吸管) |
| **套餐 (combo)** | 商品组合 | 子项自动计算 | 观影套餐(=可乐×2+爆米花×1) |

### 为什么包材是 SKU 而不是 SPU？

包材应该是 **SKU**，原因：
1. **需要管库存** - 纸杯用完要补货
2. **有明确成本** - 0.3元/个
3. **是BOM组件** - 成品配方需要引用它
4. **可能有多规格** - 大/中/小纸杯

### SKU 类型继承机制（重构后）

**重构前**：SKU 类型由用户手动选择，可能与 SPU 分类不一致

**重构后**：
- SPU 新增 `product_type` 字段
- 创建 SKU 时自动继承 SPU 的产品类型
- SKU 表单中产品类型为只读展示

```
创建流程：
1. 创建 SPU「纸杯」(product_type: packaging)
2. 创建 SKU → 类型自动 = packaging ✅ 继承
```

### 业务场景举例

**场景：制作一杯「冰镇可乐」**

```
SPU: 可乐饮品 (分类: 饮料)
  └── SKU: 冰镇可乐 (类型: 成品)
        └── BOM配方:
              ├── 可乐糖浆 200ml × 0.02元 = 4.00元 (原料SKU)
              ├── 纸杯 1个 × 0.30元 = 0.30元 (包材SKU)
              └── 吸管 1根 × 0.10元 = 0.10元 (包材SKU)
        └── 成本合计: 4.40元
```

---

## 📌 访问链接汇总

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端首页** | http://localhost:3002 | 影院业务中台 |
| **SKU管理页面** | http://localhost:3002/products/sku | SKU列表/新建/编辑/查看 |
| **后端API** | http://localhost:8080 | Spring Boot服务 |
| **SKU API基础路径** | http://localhost:8080/api/skus | RESTful接口 |

---

## 🚀 启动步骤

### 1. 启动后端服务

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/backend
mvn package -DskipTests -Dmaven.test.skip=true -q && java -jar target/*.jar
```

**验证启动成功**:
```bash
curl http://localhost:8080/api/skus
```

预期返回:
```json
{
  "success": true,
  "data": [...],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

### 2. 启动前端服务

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/frontend
npm install  # 首次运行
npm run dev
```

**访问地址**: http://localhost:3002

---

## 🎯 验收场景验证

### 场景1: 创建原料SKU

**对应用户故事**: US-001 用户故事1 - 创建原料SKU (P1)

**页面操作**:
1. 访问: http://localhost:3002/products/sku
2. 点击「新建SKU」按钮
3. 填写基本信息:
   - SKU类型: **原料**
   - SKU名称: `Jack Daniel's威士忌`
   - 规格: `700ml`
   - 主单位: `ml`
   - 标准成本: `0.50` 元/ml
4. 点击「保存」

**验收标准**:
- [ ] SKU成功保存
- [ ] SKU列表显示类型标签「原料」(蓝色)
- [ ] 可在BOM组件选择中看到该SKU

**API测试**:
```bash
curl -X POST http://localhost:8080/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "code": "RM-001",
    "name": "Jack Daniels威士忌",
    "spuId": "00000000-0000-0000-0000-000000000001",
    "skuType": "raw_material",
    "mainUnit": "ml",
    "standardCost": 0.50,
    "status": "draft"
  }'
```

---

### 场景2: 创建包材SKU

**对应用户故事**: US-001 用户故事2 - 创建包材SKU (P1)

**页面操作**:
1. 访问: http://localhost:3002/products/sku
2. 点击「新建SKU」按钮
3. 填写基本信息:
   - SKU类型: **包材**
   - SKU名称: `高脚杯`
   - 主单位: `个`
   - 标准成本: `2.00` 元/个
4. 点击「保存」

**验收标准**:
- [ ] SKU成功保存
- [ ] SKU列表显示类型标签「包材」(绿色)
- [ ] 可在BOM组件选择中看到该SKU

**API测试**:
```bash
curl -X POST http://localhost:8080/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PK-001",
    "name": "高脚杯",
    "spuId": "00000000-0000-0000-0000-000000000001",
    "skuType": "packaging",
    "mainUnit": "个",
    "standardCost": 2.00,
    "status": "draft"
  }'
```

---

### 场景3: 创建成品SKU + BOM配置 (核心)

**对应用户故事**: US-001 用户故事3 - 创建成品SKU (P2)

**前置条件**: 已创建原料和包材SKU

**页面操作**:
1. 访问: http://localhost:3002/products/sku
2. 点击「新建SKU」
3. 填写基本信息:
   - SKU类型: **成品**
   - SKU名称: `威士忌可乐鸡尾酒`
   - 主单位: `杯`
   - 损耗率: `5%`
4. 切换到「BOM配置」Tab
5. 点击「添加组件」，选择:
   - 威士忌 45ml (0.50元/ml)
   - 可乐原液 150ml (0.02元/ml)
   - 高脚杯 1个 (2.00元/个)
   - 吸管 1根 (0.10元/根)
6. 验证成本自动计算:
   - 组件成本 = 45×0.50 + 150×0.02 + 2.00 + 0.10 = **27.60**
   - 含5%损耗 = 27.60 × 1.05 = **28.98**
7. 点击「保存」

**验收标准**:
- [ ] SKU成功保存
- [ ] 标准成本字段禁用（从BOM计算）
- [ ] BOM组件明细正确显示
- [ ] 成本计算公式: Σ(组件数量 × 组件单位成本) × (1 + 损耗率)

**API测试**:
```bash
curl -X POST http://localhost:8080/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FP-001",
    "name": "威士忌可乐鸡尾酒",
    "spuId": "00000000-0000-0000-0000-000000000002",
    "skuType": "finished_product",
    "mainUnit": "杯",
    "wasteRate": 5.0,
    "status": "draft",
    "bomComponents": [
      {"componentId": "<威士忌SKU的ID>", "quantity": 45, "unit": "ml"},
      {"componentId": "<可乐原液SKU的ID>", "quantity": 150, "unit": "ml"},
      {"componentId": "<高脚杯SKU的ID>", "quantity": 1, "unit": "个"},
      {"componentId": "<吸管SKU的ID>", "quantity": 1, "unit": "根"}
    ]
  }'
```

---

### 场景4: 创建套餐SKU

**对应用户故事**: US-001 用户故事4 - 创建组合/套餐SKU (P3)

**前置条件**: 已创建成品SKU

**页面操作**:
1. 访问: http://localhost:3002/products/sku
2. 点击「新建SKU」
3. 填写基本信息:
   - SKU类型: **套餐**
   - SKU名称: `观影小吃套餐`
   - 主单位: `份`
4. 切换到「套餐配置」Tab
5. 添加子项:
   - 威士忌可乐 × 2杯
   - 大份爆米花 × 1份
6. 验证套餐成本 = Σ(子项成本)
7. 点击「保存」

**验收标准**:
- [ ] SKU成功保存
- [ ] 可选择多个成品SKU作为子项
- [ ] 标准成本为所有子项成本之和
- [ ] 类型标签显示「套餐」(紫色)

**API测试**:
```bash
curl -X POST http://localhost:8080/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CB-001",
    "name": "观影小吃套餐",
    "spuId": "00000000-0000-0000-0000-000000000003",
    "skuType": "combo",
    "mainUnit": "份",
    "status": "draft",
    "comboItems": [
      {"subItemId": "<威士忌可乐SKU的ID>", "quantity": 2, "unit": "杯"},
      {"subItemId": "<大份爆米花SKU的ID>", "quantity": 1, "unit": "份"}
    ]
  }'
```

---

### 场景5: SKU状态管理

**对应用户故事**: US-001 用户故事5 - 管理SKU状态和门店范围 (P2)

**页面操作**:
1. 访问: http://localhost:3002/products/sku
2. 选择一个草稿状态的SKU
3. 点击「启用」按钮
4. 验证状态变为「已启用」
5. 点击「停用」按钮
6. 验证状态变为「已停用」

**验收标准**:
- [ ] 支持状态转换: 草稿→已启用→已停用→已启用
- [ ] 草稿/已停用SKU不能用于新BOM配方
- [ ] 停用有BOM引用的SKU时显示警告

**API测试**:
```bash
# 启用SKU
curl -X PUT http://localhost:8080/api/skus/{skuId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "enabled"}'

# 停用SKU
curl -X PUT http://localhost:8080/api/skus/{skuId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "disabled"}'
```

---

### 场景6: 门店范围配置

**对应用户故事**: US-001 用户故事5 - 管理SKU状态和门店范围 (P2)

**页面操作**:
1. 编辑一个SKU
2. 配置门店范围:
   - 选择「特定门店」
   - 勾选: 门店A、门店B
3. 保存
4. 验证该SKU仅在选定门店可见

**验收标准**:
- [ ] 支持配置「全门店」或「特定门店」
- [ ] 门店范围验证: 成品的门店范围 ⊆ 组件的门店范围
- [ ] 筛选功能按门店过滤SKU

**API测试**:
```bash
# 验证门店范围
curl -X POST http://localhost:8080/api/skus/{成品ID}/validate-store-scope \
  -H "Content-Type: application/json" \
  -d '{"storeScope": ["store-1", "store-2"]}'
```

预期响应:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

---

## 🔧 数据验证SQL

```sql
-- 查看所有SKU及类型
SELECT id, code, name, sku_type, standard_cost, status, store_scope
FROM skus ORDER BY sku_type, code;

-- 查看成品BOM配置
SELECT
    s1.name as finished_product,
    s2.name as component,
    bc.quantity,
    bc.unit,
    bc.unit_cost,
    (bc.quantity * bc.unit_cost) as total_cost
FROM bom_components bc
JOIN skus s1 ON bc.finished_product_id = s1.id
JOIN skus s2 ON bc.component_id = s2.id
ORDER BY s1.name, bc.sort_order;

-- 验证成本计算
SELECT
    s.name,
    s.standard_cost,
    s.waste_rate,
    (SELECT SUM(quantity * unit_cost) FROM bom_components WHERE finished_product_id = s.id) as component_cost
FROM skus s
WHERE s.sku_type = 'finished_product';

-- 查看套餐配置
SELECT
    s1.name as combo,
    s2.name as sub_item,
    ci.quantity,
    ci.unit_cost
FROM combo_items ci
JOIN skus s1 ON ci.combo_id = s1.id
JOIN skus s2 ON ci.sub_item_id = s2.id
ORDER BY s1.name, ci.sort_order;
```

---

## 📋 验收检查清单

### 功能需求验收

| 编号 | 需求 | 状态 |
|------|------|------|
| FR-001 | 支持四种SKU类型: 原料/包材/成品/套餐 | ⬜ |
| FR-002 | SKU列表显示类型标签(蓝/绿/橙/紫) | ⬜ |
| FR-003 | 原料/包材需要手动输入成本，成品/套餐自动计算 | ⬜ |
| FR-004 | 支持按类型筛选SKU列表 | ⬜ |
| FR-005 | 必填字段: SKU类型、名称、主库存单位 | ⬜ |
| FR-017 | 成品成本公式: Σ(数量×单位成本)×(1+损耗率) | ⬜ |
| FR-018 | 套餐成本 = Σ子项成本 | ⬜ |
| FR-020 | 三种状态: 草稿/已启用/已停用 | ⬜ |
| FR-024 | 门店范围配置 | ⬜ |
| FR-025 | 门店范围验证(组件覆盖成品) | ⬜ |

### 边界情况验收

| 场景 | 预期行为 | 状态 |
|------|---------|------|
| 成品无BOM时启用 | 阻止启用，显示警告 | ⬜ |
| 删除被BOM引用的原料 | 阻止删除，列出引用 | ⬜ |
| 创建重复SKU编码 | 显示唯一性验证错误 | ⬜ |
| 门店范围冲突 | 阻止启用，提示组件不可用 | ⬜ |
| 套餐子项被停用 | 警告套餐包含已停用商品 | ⬜ |

---

## ❓ 常见问题

### Q: 前端看不到数据？
检查后端是否启动，确认 http://localhost:8080/api/skus 返回正常

### Q: 成本计算不对？
检查BOM组件的 unit_cost 是否正确，损耗率是否在0-100范围内

### Q: 门店范围验证失败？
检查成品的门店范围是否是组件门店范围的子集

### Q: 数据如何重置？
```sql
TRUNCATE TABLE bom_components CASCADE;
TRUNCATE TABLE combo_items CASCADE;
DELETE FROM skus;
```

---

**文档完成** ✅

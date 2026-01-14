# Research: E2E Postman 业务流程测试

**Date**: 2026-01-14  
**Branch**: T009-e2e-postman-flow-test  
**Phase**: 0 - Research & Investigation

## Purpose

解决 Technical Context 中的所有 NEEDS CLARIFICATION 项，并研究最佳实践以支持 Phase 1 设计。本 research 文档为 Postman Collection 的设计和实现提供技术决策依据。

---

## Research Topics

### 1. Postman Collection 版本与兼容性

**Question**: 使用 Postman Collection v2.1 还是 v2.0？

**Research Findings**:
- **Postman Collection v2.1** 是当前稳定版本，被 Postman Desktop App 和 Newman CLI 完全支持
- v2.1 相比 v2.0 的优势：
  - 支持更丰富的变量作用域（environment、global、collection、data）
  - 支持 Test Scripts 和 Pre-request Scripts 的模块化
  - 更好的错误处理和调试信息
  - 支持 OAuth 2.0、Bearer Token 等高级认证方式
- Newman CLI v5.x+ 完全支持 v2.1 格式

**Decision**: 使用 **Postman Collection v2.1**

**Rationale**: 
- 最新稳定版本，兼容性好
- 功能更强大，满足 E2E 测试需求
- 团队协作和 CI/CD 集成友好

---

### 2. 已存在 API 端点验证

**Question**: O012、P001、P005 模块的 API 端点是否已完整实现？是否需要额外的采购入库 API？

**Research Findings**:
通过搜索现有代码库和文档，确认以下 API 端点：

#### ✅ 已存在的 API 端点 (P001-sku-master-data)
- `POST /api/spu` - 创建 SPU
- `POST /api/sku` - 创建 SKU
- `GET /api/sku/{id}` - 查询 SKU 详情

#### ✅ 已存在的 API 端点 (P005-bom-inventory-deduction)
- `POST /api/bom` - 创建 BOM 配方
- `GET /api/bom/{skuId}` - 查询 SKU 的 BOM 配方

#### ✅ 已存在的 API 端点 (O012-order-inventory-reservation)
- `POST /api/orders` - 创建销售订单（支持库存预占）
- `POST /api/orders/{id}/cancel` - 取消订单（释放库存）
- `GET /api/stores/{storeId}/inventory` - 查询门店库存

#### ❓ 需要确认的 API 端点 (采购入库模块)
- `POST /api/purchase-orders` - 创建采购订单
- `POST /api/purchase-orders/{id}/receive` - 采购入库
- 或者使用 Supabase REST API 直接插入 `store_inventory` 表初始化库存

**Decision**: 
- **主要方案**: 使用 Supabase REST API 直接初始化库存（参考 O012 Setup Collection）
- **备选方案**: 如果采购入库 API 已实现，则使用业务 API

**Rationale**:
- Supabase REST API 更灵活，可精确控制初始库存数据
- 与 O012 Setup Collection 设计一致，降低学习成本
- 避免依赖采购模块的复杂业务逻辑
- 如果后续采购 API 完善，可轻松切换到业务 API

---

### 3. 测试数据准备策略

**Question**: 如何确保测试数据的幂等性和可重复性？

**Research Findings**:

**最佳实践**:
1. **固定的测试资源标识**:
   - 测试门店 ID: `00000000-0000-0000-0000-000000000099`
   - 测试分类 ID: `550e8400-e29b-41d4-a716-446655440003`（饮品分类）
   - 测试 SKU 编码前缀: `TEST_MAT_*` (原料)、`TEST_PRD_*` (成品)

2. **Teardown 清理策略**:
   - 删除测试创建的所有资源（SPU、SKU、BOM、订单、库存记录）
   - 使用环境变量保存的资源 ID 进行精确删除
   - 清理顺序：订单 → BOM → SKU → SPU → 库存记录

3. **Environment Variables 管理**:
   - Setup 阶段：动态创建资源并保存 ID 到环境变量
   - 测试阶段：使用环境变量引用资源 ID
   - Teardown 阶段：使用环境变量删除资源

4. **幂等性设计**:
   - 每次测试执行前先运行 Teardown（清理残留数据）
   - 再运行 Setup（创建新数据）
   - 测试完成后再次运行 Teardown（清理测试数据）

**Decision**: 采用 **Setup → Test → Teardown** 三阶段设计

**Rationale**:
- 确保测试环境干净，避免数据残留
- 支持重复执行，不受上次测试影响
- 便于调试和失败重试

---

### 4. Postman Test Scripts 最佳实践

**Question**: 如何编写健壮的 Test Scripts 验证响应正确性？

**Research Findings**:

**最佳实践**:
1. **状态码验证**:
   ```javascript
   pm.test("Status code is 201", function () {
       pm.response.to.have.status(201);
   });
   ```

2. **响应体字段验证**:
   ```javascript
   pm.test("Response contains required fields", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('success');
       pm.expect(jsonData.success).to.be.true;
       pm.expect(jsonData.data).to.have.property('id');
   });
   ```

3. **环境变量保存**:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set('test_sku_id', jsonData.data.id);
   console.log('SKU ID saved:', jsonData.data.id);
   ```

4. **错误响应验证**:
   ```javascript
   pm.test("库存不足返回 409 错误", function () {
       pm.response.to.have.status(409);
       var jsonData = pm.response.json();
       pm.expect(jsonData.error).to.eql('ORD_BIZ_002');
       pm.expect(jsonData).to.have.property('shortageItems');
   });
   ```

5. **数据类型验证**:
   ```javascript
   pm.test("库存数量是数字类型", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.data.available_qty).to.be.a('number');
       pm.expect(jsonData.data.available_qty).to.be.at.least(0);
   });
   ```

**Decision**: 每个请求至少包含以下验证：
- ✅ 响应状态码验证
- ✅ 响应体结构验证（success、data 字段）
- ✅ 关键业务字段验证（如 SKU ID、库存数量）
- ✅ 环境变量自动保存（如适用）

**Rationale**:
- 提高测试可靠性和可维护性
- 自动化验证减少人工检查
- 清晰的错误信息便于调试

---

### 5. BOM 配方数据结构

**Question**: BOM API 的请求体格式是什么？如何正确引用原料 SKU？

**Research Findings**:

**参考 O012 Setup Collection**:
```json
{
  "finishedProductId": "{{test_sku_id_1}}",
  "components": [
    {
      "componentType": "MATERIAL",
      "materialId": "{{test_material_rum_id}}",
      "quantity": 45,
      "unit": "ml"
    },
    {
      "componentType": "MATERIAL",
      "materialId": "{{test_material_mint_id}}",
      "quantity": 5,
      "unit": "g"
    },
    {
      "componentType": "MATERIAL",
      "materialId": "{{test_material_soda_id}}",
      "quantity": 200,
      "unit": "ml"
    }
  ],
  "wasteRate": 5.0
}
```

**关键点**:
- `componentType` 必须是 `"MATERIAL"` (而不是 `"SKU"`)
- 使用 `materialId` 字段引用原料 SKU ID (而不是 `componentId`)
- `quantity` 和 `unit` 必须与原料 SKU 的主单位一致
- `wasteRate` 是损耗率，单位为百分比（5.0 表示 5%）

**Decision**: 严格遵循 MATERIAL 类型组件格式

**Rationale**:
- 避免 O012 模块中曾出现的 null 错误
- 与现有实现保持一致
- 简化 BOM 展开逻辑（直接作为叶子节点）

---

### 6. 库存初始化方法

**Question**: 使用采购入库 API 还是直接插入 `store_inventory` 表？

**Research Findings**:

**方案 1: Supabase REST API 直接插入库存**
```http
POST {{supabase_url}}/rest/v1/store_inventory
Headers:
  - apikey: {{supabase_anon_key}}
  - Prefer: return=representation

Body:
{
  "store_id": "00000000-0000-0000-0000-000000000099",
  "sku_id": "{{test_material_rum_id}}",
  "on_hand_qty": 5000,
  "available_qty": 5000,
  "reserved_qty": 0,
  "safety_stock": 500
}
```

**方案 2: 业务 API 采购入库**
```http
POST /api/purchase-orders
Body:
{
  "supplierId": "...",
  "items": [...]
}

POST /api/purchase-orders/{id}/receive
```

**Decision**: 使用 **Supabase REST API 直接初始化库存**

**Rationale**:
- **更快速**: 无需创建采购订单，直接设置库存数量
- **更精确**: 可精确控制 on_hand_qty、available_qty、reserved_qty
- **更稳定**: 不依赖采购模块的业务逻辑和状态流转
- **参考先例**: O012 Setup Collection 已采用此方案并验证可行

**注意事项**:
- 需要配置 Supabase URL 和 API Key 到环境变量
- Supabase REST API 使用 `return=representation` 返回创建的记录

---

### 7. 测试场景优先级

**Question**: 5 个测试场景的执行顺序如何安排？

**Research Findings**:

**推荐执行顺序**:
1. **场景 1: 正常下单 - 单品订单** (基础场景，验证核心流程)
2. **场景 2: 正常下单 - 多品订单** (扩展场景，验证多商品处理)
3. **场景 5: 边界值测试 - 刚好用完库存** (边界条件)
4. **场景 3: 库存不足 - 超大数量订单** (异常场景)
5. **场景 4: 订单取消 - 释放库存** (取消流程)

**Decision**: 采用上述执行顺序

**Rationale**:
- 先验证正常流程，确保核心功能正确
- 再验证边界条件和异常场景
- 最后验证取消流程（需要先有订单才能取消）
- 失败时可快速定位问题（基础场景失败说明核心逻辑有问题）

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Collection 版本 | Postman Collection v2.1 | 最新稳定版，功能强大 |
| API 端点 | 使用已存在 API + Supabase REST API | 覆盖所有业务流程 |
| 库存初始化 | Supabase REST API 直接插入 | 快速、精确、稳定 |
| 测试数据准备 | Setup → Test → Teardown 三阶段 | 确保幂等性和可重复性 |
| Test Scripts | 状态码 + 字段 + 类型验证 | 自动化验证，减少人工 |
| BOM 格式 | MATERIAL 类型 + materialId | 与现有实现一致 |
| 测试顺序 | 正常 → 边界 → 异常 → 取消 | 逐步深入验证 |

---

## Next Steps (Phase 1)

Phase 0 研究已完成，所有技术决策已明确，可以进入 Phase 1 设计阶段：

1. ✅ 创建 `data-model.md` - 定义测试数据模型（SPU、SKU、BOM、Order 等）
2. ✅ 创建 `contracts/api-endpoints.md` - 文档化所有涉及的 API 端点
3. ✅ 创建 `quickstart.md` - 快速开始指南（如何运行测试）
4. ✅ 更新 `.specify/context/qoder.md` - 添加 Postman Testing 技术上下文

**准备进入 Phase 1 设计** 🚀

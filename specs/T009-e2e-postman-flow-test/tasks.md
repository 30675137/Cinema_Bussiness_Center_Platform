# Implementation Tasks: E2E Postman 业务流程测试

**Feature**: T009-e2e-postman-flow-test  
**Branch**: `T009-e2e-postman-flow-test`  
**Date**: 2026-01-14

---

## Summary

本文档定义了实施 E2E Postman 业务流程测试的详细任务清单。任务按照 Setup → Foundational → User Story → Polish 的顺序组织，确保每个阶段都可以独立测试和验证。

**总任务数**: 25 个任务  
**并行机会**: 10 个可并行任务 ([P] 标记)  
**MVP 范围**: Phase 1-3 (Setup + Foundational + User Story 1)

---

## Implementation Strategy

### MVP-First Approach
- **Phase 1-3** 构成 MVP，实现完整的 E2E 测试流程
- User Story 1 (P1) 涵盖所有核心场景，完成后即可交付使用
- Phase 4 为可选的优化和增强

### Independent Testing
每个 Phase 完成后都有明确的验证标准，确保可以独立测试：
- **Phase 1**: Collection 文件结构正确，可导入 Postman
- **Phase 2**: Environment 配置正确，Setup 请求可执行
- **Phase 3**: 完整测试流程可执行，所有场景通过
- **Phase 4**: 文档完整，团队可自主使用

---

## Phase 1: Setup (Project Initialization)

**Goal**: 创建 Postman Collection 的基础目录结构和主文件

**Independent Test**: 
- ✅ `postman/` 目录存在
- ✅ Collection 文件可被 Postman 成功导入（即使为空）
- ✅ Environment 文件格式正确

### Tasks

- [x] T001 创建 postman 目录结构在 `specs/T009-e2e-postman-flow-test/postman/`
- [x] T002 创建主 Collection 文件 `specs/T009-e2e-postman-flow-test/postman/T009-e2e-postman-flow-test.postman_collection.json` (空骨架)
- [x] T003 创建本地 Environment 文件 `specs/T009-e2e-postman-flow-test/postman/T009-local.postman_environment.json`
- [x] T004 在 Environment 文件中配置固定变量 (api_base_url, supabase_url, test_store_id, test_category_id)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: 实现 Setup 阶段的测试数据准备功能

**Independent Test**:
- ✅ 执行 Setup Folder 中的所有请求成功
- ✅ 环境变量中保存了所有资源 ID (test_spu_id, test_material_*_id, test_sku_id_1, test_bom_id)
- ✅ 数据库中可查询到创建的 SPU、SKU、BOM、库存记录

**Depends on**: Phase 1 完成

### Tasks - Setup Stage

- [x] T005 在 Collection 中创建 "Setup" 文件夹
- [x] T006 [P] 实现请求: 创建测试 SPU 在 `Setup/01-Create-SPU` + Test Scripts 保存 test_spu_id
- [x] T007 [P] 实现请求: 创建朗姆酒 SKU 在 `Setup/02-Create-SKU-Rum` + Test Scripts 保存 test_material_rum_id
- [x] T008 [P] 实现请求: 创建薄荷叶 SKU 在 `Setup/03-Create-SKU-Mint` + Test Scripts 保存 test_material_mint_id
- [x] T009 [P] 实现请求: 创建苏打水 SKU 在 `Setup/04-Create-SKU-Soda` + Test Scripts 保存 test_material_soda_id
- [x] T010 [P] 实现请求: 创建莫吉托成品 SKU 在 `Setup/05-Create-SKU-Mojito` + Test Scripts 保存 test_sku_id_1
- [x] T011 实现请求: 创建莫吉托 BOM 配方在 `Setup/06-Create-BOM-Mojito` + Test Scripts 保存 test_bom_id
- [x] T012 [P] 实现请求: 初始化朗姆酒库存(5000ml) 在 `Setup/07-Init-Inventory-Rum` (Supabase REST API)
- [x] T013 [P] 实现请求: 初始化薄荷叶库存(500g) 在 `Setup/08-Init-Inventory-Mint` (Supabase REST API)
- [x] T014 [P] 实现请求: 初始化苏打水库存(20000ml) 在 `Setup/09-Init-Inventory-Soda` (Supabase REST API)

---

## Phase 3: User Story 1 - 完整业务流程端到端测试 (P1)

**Goal**: 实现从商品创建到订单下单的完整测试流程，验证正常场景、异常场景和边界条件

**Independent Test**:
- ✅ 执行 Setup → Test Scenarios → Teardown 完整流程成功
- ✅ 场景 1-5 的所有 Test Scripts 验证通过
- ✅ 库存扣减逻辑正确：朗姆酒-90ml, 薄荷叶-10g, 苏打水-400ml (场景1)
- ✅ 库存不足场景返回 409 错误和缺货清单 (场景3)
- ✅ 订单取消后库存正确恢复 (场景4)
- ✅ 执行 Teardown 后数据库清理完毕

**Depends on**: Phase 2 完成

### Tasks - Test Scenarios

- [x] T015 [US1] 在 Collection 中创建 "Test Scenarios" 文件夹
- [x] T016 [US1] 实现场景 1: 正常下单 - 单品订单 (2杯莫吉托) 在 `Test Scenarios/Scenario-01-Normal-Order` + 验证库存扣减
- [x] T017 [P] [US1] 实现场景 2: 正常下单 - 多品订单 (暂时跳过草莓莫吉托,仅测试莫吉托) 在 `Test Scenarios/Scenario-02-Multiple-Items`
- [x] T018 [US1] 实现场景 3: 库存不足 - 超大数量订单 (9999杯) 在 `Test Scenarios/Scenario-03-Insufficient-Inventory` + 验证 ORD_BIZ_002 错误码和缺货清单
- [x] T019 [US1] 实现场景 4: 订单取消 - 释放库存 在 `Test Scenarios/Scenario-04-Cancel-Order` + 验证库存恢复
- [x] T020 [P] [US1] 实现场景 5: 边界值测试 - 刚好用完库存 (100杯) 在 `Test Scenarios/Scenario-05-Boundary-Test` + 验证可用库存=0

### Tasks - Teardown Stage

- [x] T021 [US1] 在 Collection 中创建 "Teardown" 文件夹
- [x] T022 [P] [US1] 实现 Teardown: 删除库存记录 在 `Teardown/01-Delete-Inventory` (Supabase REST API DELETE)
- [x] T023 [P] [US1] 实现 Teardown: 删除 BOM 配方 在 `Teardown/02-Delete-BOM`
- [x] T024 [P] [US1] 实现 Teardown: 删除 SKU 在 `Teardown/03-Delete-SKU`
- [x] T025 [P] [US1] 实现 Teardown: 删除 SPU 在 `Teardown/04-Delete-SPU`

---

## Phase 4: Polish & Cross-Cutting Concerns

**Goal**: 完善文档和使用体验，确保团队可以自主使用

**Independent Test**:
- ✅ README.md 包含完整的使用说明
- ✅ 新团队成员可以根据 README 独立运行测试
- ✅ Collection 在 Postman 中组织清晰，注释完整

**Depends on**: Phase 3 完成

### Tasks

- [x] T026 创建 postman/README.md 在 `specs/T009-e2e-postman-flow-test/postman/README.md`，包含使用说明、前置条件、执行步骤
- [x] T027 为每个 Request 添加 Description 说明（在 Postman UI 中可见）
- [x] T028 验证所有 Test Scripts 的错误信息清晰易懂
- [x] T029 [P] 创建可选的测试环境 Environment 文件 `specs/T009-e2e-postman-flow-test/postman/T009-test.postman_environment.json`
- [x] T030 提交代码并合并到 dev 分支

---

## Dependencies & Execution Order

### Story Dependencies
```
Setup (Phase 1)
  ↓
Foundational (Phase 2) - 阻塞所有 User Stories
  ↓
User Story 1 (Phase 3) - 核心 E2E 测试流程
  ↓
Polish (Phase 4) - 增强用户体验
```

### Parallel Execution Opportunities

#### Phase 2 - Setup Stage
可并行执行的任务组：
- **Group 1**: T007, T008, T009 (创建3个原料SKU - 不同文件)
- **Group 2**: T012, T013, T014 (初始化3个库存记录 - 不同资源)

#### Phase 3 - Test Scenarios
可并行执行的任务组：
- **Group 1**: T017, T020 (场景2和场景5 - 独立场景)

#### Phase 3 - Teardown Stage
可并行执行的任务组：
- **Group 1**: T022, T023, T024, T025 (删除操作 - 注意顺序：先删订单→库存→BOM→SKU→SPU)

#### Phase 4 - Polish
可并行执行的任务组：
- **Group 1**: T027, T028, T029 (文档和优化 - 不同方面)

---

## Test Scripts Template

每个请求的 Test Scripts 应包含以下验证：

```javascript
// 1. 状态码验证
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// 2. 响应体结构验证
pm.test("Response has success=true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('id');
});

// 3. 环境变量保存
var jsonData = pm.response.json();
pm.environment.set('test_xxx_id', jsonData.data.id);
console.log('Resource ID saved:', jsonData.data.id);

// 4. 业务逻辑验证（根据具体场景）
pm.test("Specific business logic validation", function () {
    // 例如：验证库存数量、订单状态等
});
```

---

## Implementation Notes

### 关键技术点

1. **BOM 配方格式** (参考 data-model.md):
   ```json
   {
     "finishedProductId": "{{test_sku_id_1}}",
     "components": [
       {
         "componentType": "MATERIAL",
         "materialId": "{{test_material_rum_id}}",
         "quantity": 45,
         "unit": "ml"
       }
     ],
     "wasteRate": 5.0
   }
   ```
   ⚠️ 必须使用 `componentType: "MATERIAL"` 和 `materialId`（不要用 `componentId`）

2. **库存初始化** (使用 Supabase REST API):
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

3. **错误场景验证** (场景3):
   ```javascript
   pm.test("库存不足返回 409 错误", function () {
       pm.response.to.have.status(409);
   });
   
   pm.test("错误码为 ORD_BIZ_002", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.error).to.eql('ORD_BIZ_002');
   });
   
   pm.test("返回缺货清单", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('shortageItems');
       pm.expect(jsonData.shortageItems).to.be.an('array');
       pm.expect(jsonData.shortageItems.length).to.be.greaterThan(0);
   });
   ```

### 测试数据规格

参考 spec.md 和 data-model.md：
- **SPU**: "测试饮品 SPU - Mojito"
- **原料 SKU**: 朗姆酒(ml, 0.15元/ml), 薄荷叶(g, 0.05元/g), 苏打水(ml, 0.01元/ml)
- **成品 SKU**: 莫吉托(杯, 35元/杯, 5%损耗率)
- **BOM 配方**: 45ml朗姆酒 + 5g薄荷叶 + 200ml苏打水
- **初始库存**: 朗姆酒5000ml, 薄荷叶500g, 苏打水20000ml (约100杯莫吉托)

---

## Validation Checklist

在完成所有任务后，验证以下项目：

### Format Validation
- [ ] 所有任务遵循 `- [ ] TXXX [P?] [Story?] Description with file path` 格式
- [ ] 并行任务正确标记 [P]
- [ ] User Story 任务正确标记 [US1]
- [ ] Task ID 连续且唯一 (T001-T030)

### Functionality Validation
- [ ] Setup 阶段创建所有必需的测试数据
- [ ] 5 个测试场景全部实现且验证逻辑完整
- [ ] Teardown 阶段清理所有测试数据
- [ ] Environment 变量配置完整且正确

### Documentation Validation
- [ ] README.md 包含完整使用说明
- [ ] 每个 Request 有清晰的 Description
- [ ] Test Scripts 包含有意义的错误信息

### Integration Validation
- [ ] 完整流程 Setup → Test → Teardown 可顺利执行
- [ ] 测试可重复执行（幂等性）
- [ ] 所有 Test Scripts 验证通过

---

## MVP Scope

**建议 MVP 范围**: Phase 1-3 (Setup + Foundational + User Story 1)

**交付物**:
1. ✅ 可执行的 Postman Collection 文件
2. ✅ 配置完整的 Environment 文件
3. ✅ 5 个核心测试场景（正常、异常、边界）
4. ✅ 完整的 Setup & Teardown 流程
5. ✅ 自动化的响应验证（Test Scripts）

**验收标准**:
- ✅ 测试执行时间 < 5 分钟
- ✅ 所有场景通过率 100%
- ✅ 可重复执行无副作用
- ✅ 错误信息清晰易懂

**后续增强** (Phase 4):
- 📖 完善文档和使用说明
- 🎨 优化 Collection 组织结构
- 🌍 支持多环境配置

---

**Generated**: 2026-01-14  
**Total Tasks**: 30  
**Parallel Tasks**: 10  
**Estimated Effort**: 2-3 天（1 人）

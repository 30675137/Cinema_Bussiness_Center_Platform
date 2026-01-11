# Tasks: 物料单位体系统一方案 (M001)

**@spec M001-material-unit-system**

**Input**: 设计文档来自 `/specs/M001-material-unit-system/`
**Prerequisites**: plan.md (已完成), spec.md (已完成)

**Tests**: 本功能遵循 TDD 原则，包含单元测试和集成测试任务

**Organization**: 任务按用户故事分组，以实现每个故事的独立实现和测试

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行运行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（如 US1, US2, US3）
- 包含精确文件路径

## Path Conventions

本项目为 Web 应用：
- **后端**: `backend/src/main/java/com/cinema/`
- **前端**: `frontend/src/`
- **数据库迁移**: `backend/src/main/resources/db/migration/`
- **测试**: `backend/src/test/java/`, `frontend/src/tests/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基本结构

- [ ] T001 更新 active_spec 指向 M001-material-unit-system
- [ ] T002 [P] 创建后端模块目录结构 backend/src/main/java/com/cinema/unit/
- [ ] T003 [P] 创建后端模块目录结构 backend/src/main/java/com/cinema/material/
- [ ] T004 [P] 创建前端模块目录结构 frontend/src/components/unit/
- [ ] T005 [P] 创建前端模块目录结构 frontend/src/components/material/
- [ ] T006 创建数据库迁移脚本目录 backend/src/main/resources/db/migration/

---

## Phase 2: Foundational (阻塞性前置条件)

**目的**: 所有用户故事依赖的核心基础设施，必须在任何用户故事实现前完成

**⚠️ 关键**: 此阶段完成前，任何用户故事工作都不能开始

- [ ] T007 创建数据库迁移脚本 V202601110001__create_units_table.sql（包含预置基础单位数据）
- [ ] T008 创建数据库迁移脚本 V202601110002__create_materials_table.sql
- [ ] T009 创建数据库迁移脚本 V202601110003__add_material_to_bom.sql（BOM 组件表增加 material_id 字段）
- [ ] T010 创建数据库迁移脚本 V202601110004__update_inventory_for_materials.sql（库存表增加 inventory_item_type 和 material_id）
- [ ] T011 [P] 创建 Unit 实体类 backend/src/main/java/com/cinema/unit/domain/Unit.java
- [ ] T012 [P] 创建 UnitCategory 枚举 backend/src/main/java/com/cinema/unit/domain/UnitCategory.java
- [ ] T013 [P] 创建 Material 实体类 backend/src/main/java/com/cinema/material/domain/Material.java
- [ ] T014 [P] 创建 MaterialCategory 枚举 backend/src/main/java/com/cinema/material/domain/MaterialCategory.java
- [ ] T015 运行数据库迁移脚本并验证表结构正确创建

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 单位主数据管理 (Priority: P1) 🎯 MVP

**Goal**: 建立单位主数据表和 CRUD API，将硬编码的单位列表迁移到数据库

**Independent Test**: 可通过单位管理界面完成单位的增删改查操作，并验证单位选择器从 API 获取数据而非硬编码

### Tests for User Story 1 (TDD)

> **NOTE: 先编写测试，确保测试失败后再实现功能**

- [ ] T016 [P] [US1] 单元测试：UnitServiceTest - 测试创建单位（正常、重复代码）in backend/src/test/java/com/cinema/unit/service/UnitServiceTest.java
- [ ] T017 [P] [US1] 单元测试：UnitServiceTest - 测试删除单位（正常、被引用）in backend/src/test/java/com/cinema/unit/service/UnitServiceTest.java
- [ ] T018 [P] [US1] 单元测试：UnitServiceTest - 测试按分类筛选 in backend/src/test/java/com/cinema/unit/service/UnitServiceTest.java
- [ ] T019 [P] [US1] 集成测试：UnitControllerIntegrationTest - 测试单位 CRUD API in backend/src/test/java/com/cinema/unit/controller/UnitControllerIntegrationTest.java

### Implementation for User Story 1

- [ ] T020 [P] [US1] 创建 UnitRepository 接口 in backend/src/main/java/com/cinema/unit/repository/UnitRepository.java
- [ ] T021 [P] [US1] 创建 Unit DTO 类（UnitRequest, UnitResponse, UnitListResponse）in backend/src/main/java/com/cinema/unit/dto/
- [ ] T022 [US1] 实现 UnitService 接口 in backend/src/main/java/com/cinema/unit/service/UnitService.java
- [ ] T023 [US1] 实现 UnitServiceImpl（包含创建、查询、更新、删除、引用检查逻辑）in backend/src/main/java/com/cinema/unit/service/impl/UnitServiceImpl.java
- [ ] T024 [P] [US1] 创建 UnitNotFoundException 异常类 in backend/src/main/java/com/cinema/unit/exception/UnitNotFoundException.java
- [ ] T025 [P] [US1] 创建 UnitInUseException 异常类 in backend/src/main/java/com/cinema/unit/exception/UnitInUseException.java
- [ ] T026 [US1] 实现 UnitController（CRUD 接口）in backend/src/main/java/com/cinema/unit/controller/UnitController.java
- [ ] T027 [US1] 运行测试验证后端功能（T016-T019 应全部通过）
- [ ] T028 [P] [US1] 创建 unitService.ts（前端 API 服务）in frontend/src/services/unitService.ts
- [ ] T029 [P] [US1] 创建 unit.ts 类型定义 in frontend/src/types/unit.ts
- [ ] T030 [P] [US1] 创建 useUnits Hook in frontend/src/hooks/useUnits.ts
- [ ] T031 [US1] 实现 UnitList 组件 in frontend/src/components/unit/UnitList.tsx
- [ ] T032 [US1] 实现 UnitForm 组件（新建/编辑）in frontend/src/components/unit/UnitForm.tsx
- [ ] T033 [US1] 实现 UnitManagement 页面 in frontend/src/pages/unit/UnitManagement.tsx
- [ ] T034 [US1] 在 AppLayout 菜单中添加单位管理入口
- [ ] T035 [US1] 前端测试：UnitList.test.tsx - 测试单位列表加载和显示 in frontend/src/tests/components/unit/UnitList.test.tsx
- [ ] T036 [US1] 前端测试：UnitForm.test.tsx - 测试表单验证和提交 in frontend/src/tests/components/unit/UnitForm.test.tsx

**Checkpoint**: 此时，User Story 1 应完全功能并可独立测试

---

## Phase 4: User Story 2 - 物料主数据管理 (Priority: P1)

**Goal**: 建立物料主数据表和 CRUD API，支持物料级换算配置，物料创建不依赖 SPU

**Independent Test**: 可创建物料并配置单位换算，验证物料数据独立于 SPU 体系

**Dependencies**: 依赖 US1（需要单位主数据 API）

### Tests for User Story 2 (TDD)

- [ ] T037 [P] [US2] 单元测试：MaterialServiceTest - 测试创建物料（正常、无效单位）in backend/src/test/java/com/cinema/material/service/MaterialServiceTest.java
- [ ] T038 [P] [US2] 单元测试：MaterialServiceTest - 测试配置换算（采购单位+换算率）in backend/src/test/java/com/cinema/material/service/MaterialServiceTest.java
- [ ] T039 [P] [US2] 单元测试：MaterialServiceTest - 测试删除物料（正常、被 BOM 引用）in backend/src/test/java/com/cinema/material/service/MaterialServiceTest.java
- [ ] T040 [P] [US2] 集成测试：MaterialControllerIntegrationTest - 测试物料 CRUD API in backend/src/test/java/com/cinema/material/controller/MaterialControllerIntegrationTest.java

### Implementation for User Story 2

- [ ] T041 [P] [US2] 创建 MaterialRepository 接口 in backend/src/main/java/com/cinema/material/repository/MaterialRepository.java
- [ ] T042 [P] [US2] 创建 Material DTO 类（MaterialRequest, MaterialResponse, MaterialConversionConfigDTO）in backend/src/main/java/com/cinema/material/dto/
- [ ] T043 [US2] 实现 MaterialService 接口 in backend/src/main/java/com/cinema/material/service/MaterialService.java
- [ ] T044 [US2] 实现 MaterialServiceImpl（包含创建、查询、更新、删除、换算配置逻辑）in backend/src/main/java/com/cinema/material/service/impl/MaterialServiceImpl.java
- [ ] T045 [P] [US2] 创建 MaterialNotFoundException 异常类 in backend/src/main/java/com/cinema/material/exception/MaterialNotFoundException.java
- [ ] T046 [P] [US2] 创建 MaterialInUseException 异常类 in backend/src/main/java/com/cinema/material/exception/MaterialInUseException.java
- [ ] T047 [US2] 实现 MaterialController（CRUD 接口 + 换算配置接口）in backend/src/main/java/com/cinema/material/controller/MaterialController.java
- [ ] T048 [US2] 实现物料编码自动生成逻辑（MAT-{类别}-{序号}）in MaterialServiceImpl
- [ ] T049 [US2] 运行测试验证后端功能（T037-T040 应全部通过）
- [ ] T050 [P] [US2] 创建 materialService.ts（前端 API 服务）in frontend/src/services/materialService.ts
- [ ] T051 [P] [US2] 创建 material.ts 类型定义 in frontend/src/types/material.ts
- [ ] T052 [P] [US2] 创建 useMaterials Hook in frontend/src/hooks/useMaterials.ts
- [ ] T053 [US2] 实现 MaterialList 组件 in frontend/src/components/material/MaterialList.tsx
- [ ] T054 [US2] 实现 MaterialForm 组件（新建/编辑）in frontend/src/components/material/MaterialForm.tsx
- [ ] T055 [US2] 实现 MaterialConversionConfig 组件（换算配置）in frontend/src/components/material/MaterialConversionConfig.tsx
- [ ] T056 [US2] 实现 MaterialManagement 页面 in frontend/src/pages/material/MaterialManagement.tsx
- [ ] T057 [US2] 在 AppLayout 菜单中添加物料管理入口
- [ ] T058 [US2] 前端测试：MaterialForm.test.tsx - 测试表单验证（库存单位必填）in frontend/src/tests/components/material/MaterialForm.test.tsx
- [ ] T059 [US2] 前端测试：MaterialConversionConfig.test.tsx - 测试换算配置组件 in frontend/src/tests/components/material/MaterialConversionConfig.test.tsx

**Checkpoint**: 此时，User Stories 1 AND 2 应都能独立工作

---

## Phase 5: User Story 3 - 统一换算服务 (Priority: P1)

**Goal**: 扩展 P002 换算服务，支持物料级换算优先查找，降级到全局换算

**Independent Test**: 可验证同一单位换算（瓶→ml）在不同物料下返回不同结果

**Dependencies**: 依赖 US1（单位主数据）和 US2（物料主数据）

### Tests for User Story 3 (TDD)

- [ ] T060 [P] [US3] 单元测试：UnifiedConversionServiceTest - 测试物料级换算优先级 in backend/src/test/java/com/cinema/unitconversion/service/UnifiedConversionServiceTest.java
- [ ] T061 [P] [US3] 单元测试：UnifiedConversionServiceTest - 测试降级到全局换算 in backend/src/test/java/com/cinema/unitconversion/service/UnifiedConversionServiceTest.java
- [ ] T062 [P] [US3] 单元测试：UnifiedConversionServiceTest - 测试 use_global_conversion 标志 in backend/src/test/java/com/cinema/unitconversion/service/UnifiedConversionServiceTest.java
- [ ] T063 [P] [US3] 单元测试：UnifiedConversionServiceTest - 测试换算来源字段（source=material/global）in backend/src/test/java/com/cinema/unitconversion/service/UnifiedConversionServiceTest.java

### Implementation for User Story 3

- [ ] T064 [P] [US3] 扩展 ConversionRequest DTO，新增 materialId 参数 in backend/src/main/java/com/cinema/unitconversion/dto/ConversionRequest.java
- [ ] T065 [P] [US3] 扩展 ConversionResponse DTO，新增 source 字段 in backend/src/main/java/com/cinema/unitconversion/dto/ConversionResponse.java
- [ ] T066 [US3] 创建 UnifiedConversionService 接口 in backend/src/main/java/com/cinema/unitconversion/service/UnifiedConversionService.java
- [ ] T067 [US3] 实现 UnifiedConversionServiceImpl（物料级换算优先逻辑）in backend/src/main/java/com/cinema/unitconversion/service/impl/UnifiedConversionServiceImpl.java
- [ ] T068 [US3] 扩展 UnitConversionController，集成 UnifiedConversionService in backend/src/main/java/com/cinema/unitconversion/controller/UnitConversionController.java
- [ ] T069 [US3] 运行测试验证后端功能（T060-T063 应全部通过）

**Checkpoint**: 所有 P1 优先级用户故事现在应独立功能

---

## Phase 6: User Story 4 - 采购入库换算 (Priority: P2)

**Goal**: 在采购订单入库时自动调用换算服务，将采购数量转换为库存数量

**Independent Test**: 可创建采购订单并验证入库数量自动换算正确

**Dependencies**: 依赖 US2（物料主数据）和 US3（统一换算服务）

### Tests for User Story 4 (TDD)

- [ ] T070 [P] [US4] 集成测试：ProcurementIntegrationTest - 测试采购入库自动换算 in backend/src/test/java/com/cinema/procurement/ProcurementIntegrationTest.java
- [ ] T071 [P] [US4] 集成测试：ProcurementIntegrationTest - 测试换算结果正确写入库存 in backend/src/test/java/com/cinema/procurement/ProcurementIntegrationTest.java
- [ ] T072 [P] [US4] 集成测试：ProcurementIntegrationTest - 验证双单位显示（采购10瓶 → 库存5000ml）in backend/src/test/java/com/cinema/procurement/ProcurementIntegrationTest.java

### Implementation for User Story 4

- [ ] T073 [US4] 扩展 ProcurementService，集成 UnifiedConversionService in backend/src/main/java/com/cinema/procurement/service/ProcurementService.java
- [ ] T074 [US4] 在 confirmReceipt() 方法中调用换算服务 in backend/src/main/java/com/cinema/procurement/service/impl/ProcurementServiceImpl.java
- [ ] T075 [US4] 扩展库存增加逻辑，支持 material_id 和 inventory_item_type in backend/src/main/java/com/cinema/inventory/service/InventoryService.java
- [ ] T076 [US4] 运行测试验证后端功能（T070-T072 应全部通过）
- [ ] T077 [US4] 扩展前端采购入库表单，显示换算后的库存数量 in frontend/src/components/procurement/PurchaseOrderForm.tsx

**Checkpoint**: 采购入库换算功能完整并可测试

---

## Phase 7: User Story 5 - BOM 配方用量换算 (Priority: P2)

**Goal**: BOM 配方支持选择物料，并在订单处理时自动换算扣减库存

**Independent Test**: 可创建包含物料的 BOM 配方，验证订单处理时库存扣减正确

**Dependencies**: 依赖 US2（物料主数据）和 US3（统一换算服务）

### Tests for User Story 5 (TDD)

- [ ] T078 [P] [US5] 集成测试：BomProcessingIntegrationTest - 测试 BOM 订单处理时物料扣减 in backend/src/test/java/com/cinema/beverage/BomProcessingIntegrationTest.java
- [ ] T079 [P] [US5] 集成测试：BomProcessingIntegrationTest - 测试混合 BOM（物料组件 + SKU 组件）in backend/src/test/java/com/cinema/beverage/BomProcessingIntegrationTest.java
- [ ] T080 [P] [US5] 集成测试：BomProcessingIntegrationTest - 验证库存扣减正确 in backend/src/test/java/com/cinema/beverage/BomProcessingIntegrationTest.java

### Implementation for User Story 5

- [ ] T081 [P] [US5] 扩展 BomComponent 实体，新增 material_id 字段 in backend/src/main/java/com/cinema/beverage/domain/BomComponent.java
- [ ] T082 [US5] 扩展 BomDeductionService，支持物料组件扣减 in backend/src/main/java/com/cinema/beverage/service/BomDeductionService.java
- [ ] T083 [US5] 在订单处理逻辑中调用 UnifiedConversionService in backend/src/main/java/com/cinema/beverage/service/impl/BomDeductionServiceImpl.java
- [ ] T084 [US5] 运行测试验证后端功能（T078-T080 应全部通过）
- [ ] T085 [US5] 扩展前端 BOM 表单，支持选择物料（非 SKU）in frontend/src/components/beverage/BomComponentForm.tsx
- [ ] T086 [US5] 在物料选择时自动填充库存单位 in frontend/src/components/beverage/BomComponentForm.tsx

**Checkpoint**: BOM 配方物料扣减功能完整并可测试

---

## Phase 8: User Story 6 - 前端单位选择器统一 (Priority: P2)

**Goal**: 将硬编码的单位下拉组件改造为从 API 动态获取单位列表

**Independent Test**: 可验证所有单位选择器从 /api/units 获取数据

**Dependencies**: 依赖 US1（单位主数据 API）

### Tests for User Story 6

- [ ] T087 [P] [US6] 前端测试：UnitSelector.test.tsx - 测试从 API 加载单位列表 in frontend/src/tests/components/common/UnitSelector.test.tsx
- [ ] T088 [P] [US6] 前端测试：UnitSelector.test.tsx - 测试按分类筛选 in frontend/src/tests/components/common/UnitSelector.test.tsx
- [ ] T089 [P] [US6] 前端测试：UnitSelector.test.tsx - 测试选择单位触发 onChange in frontend/src/tests/components/common/UnitSelector.test.tsx

### Implementation for User Story 6

- [ ] T090 [US6] 创建 UnitSelector 组件（基于 Ant Design Select）in frontend/src/components/common/UnitSelector.tsx
- [ ] T091 [US6] 迁移 SkuForm 中的单位选择器到 UnitSelector in frontend/src/components/sku/SkuForm.tsx
- [ ] T092 [US6] 迁移 BomComponentForm 中的单位选择器到 UnitSelector in frontend/src/components/beverage/BomComponentForm.tsx
- [ ] T093 [US6] 迁移 PurchaseOrderForm 中的单位选择器到 UnitSelector in frontend/src/components/procurement/PurchaseOrderForm.tsx
- [ ] T094 [US6] 查找并迁移其他包含硬编码单位选择器的表单组件
- [ ] T095 [US6] 删除硬编码的单位常量文件 frontend/src/constants/units.ts（如果存在）
- [ ] T096 [US6] 运行测试验证前端功能（T087-T089 应全部通过）

**Checkpoint**: 所有单位选择器已统一为 API 驱动

---

## Phase 9: 数据清理与迁移 (Priority: P2)

**Goal**: 清理开发环境中 SKU 表的 RAW_MATERIAL 和 PACKAGING 类型数据，迁移到 Material 表

**Independent Test**: 验证 SKU 表仅保留 FINISHED_PRODUCT 和 COMBO 类型，Material 表包含迁移后的数据

- [ ] T097 创建数据迁移脚本 V202601110005__migrate_sku_to_material.sql（将 RAW_MATERIAL/PACKAGING 类型 SKU 迁移到 Material 表）
- [ ] T098 创建数据清理脚本 V202601110006__cleanup_sku_types.sql（删除 SKU 表中的 RAW_MATERIAL/PACKAGING 记录）
- [ ] T099 运行迁移脚本并验证数据迁移正确
- [ ] T100 运行清理脚本并验证 SKU 表仅保留成品和套餐
- [ ] T101 更新 SkuType 枚举，移除 RAW_MATERIAL 和 PACKAGING 值 in backend/src/main/java/com/cinema/hallstore/domain/enums/SkuType.java
- [ ] T102 验证所有依赖 SkuType 的代码无编译错误

**Checkpoint**: 数据迁移完成，SKU 和 Material 职责清晰分离

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: 跨多个用户故事的改进

- [ ] T103 [P] 更新 API 文档（OpenAPI/Swagger）in backend/src/main/resources/api-docs/
- [ ] T104 [P] 更新 README 文档，说明物料单位体系 in docs/M001-material-unit-system.md
- [ ] T105 代码清理和重构（移除未使用的导入、优化命名）
- [ ] T106 [P] 性能优化：为 materials 表的 id 字段添加索引（如未自动创建）
- [ ] T107 [P] 性能优化：为 units 表的 code 字段添加索引（如未自动创建）
- [ ] T108 [P] 安全加固：验证所有 API 端点的认证和授权
- [ ] T109 [P] 添加日志记录：物料创建、换算调用、数据迁移操作
- [ ] T110 运行完整回归测试套件（所有单元测试 + 集成测试）
- [ ] T111 运行 E2E 测试（Playwright）验证用户流程
- [ ] T112 更新 plan.md，标记实现完成并记录实际工作量

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-8)**: 全部依赖 Foundational phase 完成
  - US1（单位主数据）: 可在 Foundational 后开始 - 无其他故事依赖
  - US2（物料主数据）: 可在 Foundational 后开始 - 依赖 US1
  - US3（统一换算）: 依赖 US1 和 US2 完成
  - US4（采购入库）: 依赖 US2 和 US3 完成
  - US5（BOM 配方）: 依赖 US2 和 US3 完成
  - US6（前端选择器）: 依赖 US1 完成
- **数据迁移 (Phase 9)**: 依赖 US2 完成
- **Polish (Phase 10)**: 依赖所有期望的用户故事完成

### User Story Dependencies

```
US1 (单位主数据) ──┬──> US2 (物料主数据) ──┬──> US3 (统一换算) ──┬──> US4 (采购入库)
                  │                      │                    │
                  └──────────────────────┴────────────────────┴──> US5 (BOM 配方)
                  │
                  └──> US6 (前端选择器)

US2 ──> Phase 9 (数据迁移)
```

### Within Each User Story

- 测试必须在实现前编写并失败
- 模型在服务之前
- 服务在端点之前
- 核心实现在集成之前
- 故事完成后再进入下一个优先级

### Parallel Opportunities

- 所有标记 [P] 的 Setup 任务可并行运行
- 所有标记 [P] 的 Foundational 任务可并行运行（在 Phase 2 内）
- Foundational phase 完成后，US1 可立即开始
- US1 完成后，US2 和 US6 可并行开始
- US2 和 US3 完成后，US4 和 US5 可并行开始
- 一个用户故事内标记 [P] 的所有测试可并行运行
- 一个用户故事内标记 [P] 的模型可并行运行
- 不同用户故事可由不同团队成员并行工作

---

## Parallel Example: User Story 1

```bash
# 并行启动 User Story 1 的所有测试:
Task: "单元测试：UnitServiceTest - 测试创建单位（正常、重复代码）"
Task: "单元测试：UnitServiceTest - 测试删除单位（正常、被引用）"
Task: "单元测试：UnitServiceTest - 测试按分类筛选"
Task: "集成测试：UnitControllerIntegrationTest - 测试单位 CRUD API"

# 并行启动 User Story 1 的所有 DTO 创建:
Task: "创建 Unit DTO 类（UnitRequest, UnitResponse, UnitListResponse）"
Task: "创建 UnitNotFoundException 异常类"
Task: "创建 UnitInUseException 异常类"
```

---

## Parallel Example: User Story 2

```bash
# 并行启动 User Story 2 的所有测试:
Task: "单元测试：MaterialServiceTest - 测试创建物料（正常、无效单位）"
Task: "单元测试：MaterialServiceTest - 测试配置换算（采购单位+换算率）"
Task: "单元测试：MaterialServiceTest - 测试删除物料（正常、被 BOM 引用）"
Task: "集成测试：MaterialControllerIntegrationTest - 测试物料 CRUD API"

# 并行启动 User Story 2 的所有 DTO 创建:
Task: "创建 Material DTO 类（MaterialRequest, MaterialResponse, MaterialConversionConfigDTO）"
Task: "创建 MaterialNotFoundException 异常类"
Task: "创建 MaterialInUseException 异常类"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1 + 2 + 3)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (**关键 - 阻塞所有故事**)
3. 完成 Phase 3: User Story 1（单位主数据）
4. 完成 Phase 4: User Story 2（物料主数据）
5. 完成 Phase 5: User Story 3（统一换算）
6. **停止并验证**: 独立测试 US1-3
7. 如果就绪，部署/演示

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 添加 User Story 4 → 独立测试 → 部署/演示
6. 添加 User Story 5 → 独立测试 → 部署/演示
7. 添加 User Story 6 → 独立测试 → 部署/演示
8. 执行数据迁移（Phase 9）
9. 每个故事添加价值而不破坏之前的故事

### Parallel Team Strategy

使用多个开发者:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - 开发者 A: User Story 1
   - 开发者 B: 准备 User Story 2 的测试和设计
3. US1 完成后:
   - 开发者 A: User Story 6
   - 开发者 B: User Story 2
4. US2 完成后:
   - 开发者 A + B: User Story 3（协作）
5. US3 完成后:
   - 开发者 A: User Story 4
   - 开发者 B: User Story 5
6. 故事独立完成和集成

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应可独立完成和测试
- 实现前验证测试失败
- 每个任务或逻辑组后提交
- 在任何检查点停止以独立验证故事
- 避免: 模糊任务、同一文件冲突、破坏独立性的跨故事依赖

---

## Summary

- **总任务数**: 112
- **User Story 1**: 21 个任务（T016-T036）
- **User Story 2**: 23 个任务（T037-T059）
- **User Story 3**: 10 个任务（T060-T069）
- **User Story 4**: 8 个任务（T070-T077）
- **User Story 5**: 9 个任务（T078-T086）
- **User Story 6**: 10 个任务（T087-T096）
- **数据迁移**: 6 个任务（T097-T102）
- **并行机会**: 每个用户故事内的测试、DTO、异常类创建都可并行
- **建议的 MVP 范围**: US1 + US2 + US3（P1 优先级故事）

---

**格式验证**: ✅ 所有任务遵循检查表格式（复选框、ID、标签、文件路径）

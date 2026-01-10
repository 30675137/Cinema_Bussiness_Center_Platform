# Tasks: P008 SKU 类型重构 - 移除 SPU productType

**@spec P008-sku-type-refactor**
**Input**: Design documents from `/specs/P008-sku-type-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: 可选（仅在明确要求时添加测试任务）

**Organization**: 任务按用户故事分组，支持独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事 (US1, US2, US3)
- 包含精确文件路径

## Path Conventions

- **后端**: `backend/src/main/java/com/cinema/hallstore/`
- **前端**: `frontend/src/`

---

## Phase 1: Setup (基础准备)

**Purpose**: 验证环境和确认现有代码结构

- [ ] T001 验证当前分支为 `P008-sku-type-refactor` 且 active_spec 正确
- [ ] T002 [P] 验证后端 SkuType 枚举存在于 `backend/src/main/java/com/cinema/hallstore/domain/enums/SkuType.java`
- [ ] T003 [P] 验证前端 SkuType 枚举存在于 `frontend/src/types/sku.ts`
- [ ] T004 [P] 检查 SPU productType 在数据库中是否有数据，运行验证脚本

---

## Phase 2: Foundational (基础依赖 - 阻塞后续用户故事)

**Purpose**: 后端核心修改，所有用户故事依赖此阶段完成

**⚠️ CRITICAL**: 此阶段完成前，不能开始任何用户故事实现

### 2.1 SPU 实体修改

- [ ] T005 移除 `backend/src/main/java/com/cinema/hallstore/domain/Spu.java` 中的 productType 字段及 getter/setter
- [ ] T006 更新 `backend/src/main/java/com/cinema/hallstore/dto/SpuCreateRequest.java` 移除 productType 字段
- [ ] T007 [P] 更新 `backend/src/main/java/com/cinema/hallstore/dto/SpuUpdateRequest.java` 移除 productType 字段（如果存在）
- [ ] T008 更新 `backend/src/main/java/com/cinema/hallstore/service/SpuService.java` 移除 productType 相关逻辑
- [ ] T009 更新 `backend/src/main/java/com/cinema/hallstore/controller/SpuController.java` 移除 productType 参数和响应处理

### 2.2 SKU 类型不可变校验

- [ ] T010 在 `backend/src/main/java/com/cinema/hallstore/service/SkuService.java` 的 updateSku 方法中添加 skuType 不可变校验
- [ ] T011 添加业务异常 `SKU_BIZ_001: SKU类型创建后不可修改` 到异常处理

### 2.3 前端类型定义修改

- [ ] T012 移除 `frontend/src/types/spu.ts` 中的 ProductType 类型定义和 PRODUCT_TYPE_OPTIONS
- [ ] T013 更新 `frontend/src/types/spu.ts` 中 SPUItem 和 SPUCreationForm 接口，移除 productType 字段
- [ ] T014 更新 `frontend/src/services/spuService.ts` 移除 productType 相关的请求/响应处理

**Checkpoint**: 基础依赖完成 - 可以开始用户故事实现

---

## Phase 3: User Story 1 - 创建 SKU 时选择类型 (Priority: P1) 🎯 MVP

**Goal**: 用户在 SKU 创建页面可以选择类型（原料/包材/成品/套餐），系统根据类型展示不同的必填字段

**Independent Test**: 创建不同类型的 SKU，验证表单字段变化

### Implementation for User Story 1

- [ ] T015 [US1] 更新 `frontend/src/types/sku.ts` 中的 SKU_TYPE_CONFIG，添加 description 字段
- [ ] T016 [US1] 更新 `frontend/src/components/sku/SkuForm/schema.ts` 添加 skuType 必填校验和条件验证（原料/包材必须填写 standardCost）
- [ ] T017 [US1] 在 `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx` 添加 SKU 类型选择器组件
- [ ] T018 [US1] 更新 `frontend/src/components/sku/SkuForm/index.tsx` 根据 skuType 动态显示/隐藏 Tab（BOM 配置、套餐配置）
- [ ] T019 [US1] 更新 `frontend/src/components/sku/SkuForm/OtherConfigTab.tsx` 根据 skuType 显示/隐藏标准成本字段
- [ ] T020 [US1] 验证 SKU 创建请求包含 skuType 字段，检查 `frontend/src/services/skuService.ts`

**Checkpoint**: User Story 1 完成 - SKU 创建时可选择类型，表单根据类型动态调整

---

## Phase 4: User Story 2 - 编辑 SKU 时查看和理解类型 (Priority: P2)

**Goal**: 编辑现有 SKU 时，类型显示为只读状态，不可修改

**Independent Test**: 打开已有 SKU 编辑页面，验证类型显示且不可修改

### Implementation for User Story 2

- [ ] T021 [US2] 更新 `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx` 在编辑模式下将类型选择器设为 disabled
- [ ] T022 [US2] 添加只读提示文案 "SKU 类型创建后不可修改" 在 `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx`
- [ ] T023 [US2] 验证后端 PUT /api/skus/{id} 拒绝修改 skuType 返回 400 错误

**Checkpoint**: User Story 2 完成 - SKU 编辑页面类型只读，尝试修改会被后端拒绝

---

## Phase 5: User Story 3 - SPU 不再需要 productType (Priority: P3)

**Goal**: SPU 创建/编辑表单和列表不再显示产品类型

**Independent Test**: 创建/编辑 SPU 时不再看到产品类型选项

### Implementation for User Story 3

- [ ] T024 [P] [US3] 移除 SPU 创建表单中的产品类型选择器（查找并更新相关组件文件）
- [ ] T025 [P] [US3] 移除 SPU 编辑表单中的产品类型选择器
- [ ] T026 [US3] 移除 SPU 列表页面中的产品类型列显示
- [ ] T027 [US3] 验证 SPU API 响应不再包含 productType 字段

**Checkpoint**: User Story 3 完成 - SPU 管理界面不再显示产品类型

---

## Phase 6: Polish & 验收

**Purpose**: 跨故事优化和最终验证

- [ ] T028 [P] 运行 TypeScript 编译检查，确保无 productType 相关编译错误 `cd frontend && npm run build`
- [ ] T029 [P] 运行后端编译检查 `cd backend && ./mvnw compile`
- [ ] T030 验证所有现有 SKU 数据正常显示和编辑
- [ ] T031 验证所有现有 SPU 数据正常显示和编辑
- [ ] T032 更新代码中的 @spec 归属标识为 P008-sku-type-refactor
- [ ] T033 运行 quickstart.md 中的验收检查清单

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-5)**: 全部依赖 Foundational 完成
  - US1 (Phase 3): 可在 Foundational 后开始
  - US2 (Phase 4): 可在 Foundational 后开始，但建议在 US1 后
  - US3 (Phase 5): 可在 Foundational 后开始，独立于 US1/US2
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 独立 - 核心功能，MVP
- **User Story 2 (P2)**: 依赖 US1 中的类型选择器实现
- **User Story 3 (P3)**: 独立 - 可与 US1/US2 并行

### Within Each User Story

- 后端修改先于前端修改
- 类型定义先于组件实现
- 组件实现先于服务调用
- 核心功能先于验证

### Parallel Opportunities

- T002, T003, T004 可并行（不同验证任务）
- T006, T007 可并行（不同 DTO 文件）
- T024, T025 可并行（不同表单组件）
- T028, T029 可并行（前后端编译检查）

---

## Parallel Example: Foundational Phase

```bash
# 并行执行 SPU DTO 更新:
Task: "T006 更新 SpuCreateRequest.java 移除 productType"
Task: "T007 更新 SpuUpdateRequest.java 移除 productType"

# 并行执行前端类型更新:
Task: "T012 移除 ProductType 类型定义"
Task: "T013 更新 SPUItem 接口"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL)
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 测试 SKU 创建类型选择功能
5. 可部署/演示 MVP

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 测试 → 部署 (MVP!)
3. 添加 User Story 2 → 测试 → 部署
4. 添加 User Story 3 → 测试 → 部署
5. 每个故事独立增值，不破坏之前的功能

### Suggested MVP Scope

**仅完成 User Story 1 (Phase 3)** 即可作为 MVP：
- 用户可以在创建 SKU 时选择类型
- 表单根据类型动态显示/隐藏字段
- 后端验证 skuType 必填

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事
- 每个用户故事应可独立完成和测试
- 每个任务完成后提交代码
- 在任何检查点停止以独立验证故事
- 避免：模糊任务、同一文件冲突、破坏独立性的跨故事依赖

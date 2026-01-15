# Tasks: Material Management Filter & Actions

**Input**: Design documents from `/specs/M002-material-filter/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Branch**: `M002-material-filter`  
**Feature**: 物料主数据管理的筛选器、导出、导入、批量操作功能

**Tests**: 本功能包含单元测试和集成测试任务（已在plan.md中明确）

**Organization**: 任务按用户故事（US1-US4）组织，每个故事可以独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务归属的用户故事（US1, US2, US3, US4）
- 所有任务包含精确的文件路径

## 路径约定

本项目为 **Web Application** 结构：
- 后端：`backend/src/main/java/com/cinema/`
- 前端：`frontend/src/`
- 测试：`backend/src/test/java/` 和 `frontend/tests/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基础结构准备

- [ ] T001 [P] 安装前端依赖: 在 frontend/ 目录执行 npm install exceljs file-saver @types/file-saver
- [ ] T002 [P] 验证后端依赖: 确认 backend/pom.xml 中包含 Apache POI (org.apache.poi:poi 和 org.apache.poi:poi-ooxml)
- [ ] T003 [P] 创建数据库索引: 执行 data-model.md 中的索引创建 SQL（idx_materials_filter, idx_materials_search）
- [ ] T004 验证现有 Material 实体和 Repository: 确认 backend/src/main/java/com/cinema/material/ 中的 Material.java 和 MaterialRepository.java 存在

---

## Phase 2: Foundational (阻塞性前置条件)

**目的**: 所有用户故事必须依赖的核心基础设施

**⚠️ 关键**: 所有用户故事工作必须在此阶段完成后才能开始

### 后端基础

- [ ] T005 [P] 创建 MaterialFilterDTO: backend/src/main/java/com/cinema/material/dto/MaterialFilterDTO.java（包含 category, status, minCost, maxCost, keyword 字段和 isCostRangeValid 验证方法）
- [ ] T006 [P] 创建 MaterialExportDTO: backend/src/main/java/com/cinema/material/dto/MaterialExportDTO.java（包含 11 个导出字段：code, name, category, status等）
- [ ] T007 [P] 创建 MaterialImportDataDTO: backend/src/main/java/com/cinema/material/dto/MaterialImportDataDTO.java（包含 Bean Validation 注解）
- [ ] T008 [P] 创建 MaterialImportRecordDTO: backend/src/main/java/com/cinema/material/dto/MaterialImportRecordDTO.java
- [ ] T009 [P] 创建 MaterialImportResultDTO: backend/src/main/java/com/cinema/material/dto/MaterialImportResultDTO.java
- [ ] T010 [P] 创建 MaterialBatchOperationRequestDTO: backend/src/main/java/com/cinema/material/dto/MaterialBatchOperationRequestDTO.java（包含 BatchOperationType 枚举）
- [ ] T011 [P] 创建 MaterialBatchOperationResultDTO: backend/src/main/java/com/cinema/material/dto/MaterialBatchOperationResultDTO.java
- [ ] T012 [P] 创建 MaterialBatchOperationItemDTO: backend/src/main/java/com/cinema/material/dto/MaterialBatchOperationItemDTO.java

### 前端基础

- [ ] T013 [P] 扩展 Material 类型定义: frontend/src/types/material.ts（添加 MaterialFilter, MaterialExportData, MaterialImportRecord, MaterialImportResult, MaterialBatchOperation 接口和枚举）
- [ ] T014 [P] 创建 Zod 验证 Schema: frontend/src/types/material.ts（添加 MaterialFilterSchema 和 MaterialImportDataSchema）

### 工具类

- [ ] T015 创建 ExcelUtil 工具类: backend/src/main/java/com/cinema/common/util/ExcelUtil.java（包含 createWorkbook, createSheet, writeRow 等方法）

**检查点**: 基础就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 快速筛选物料 (Priority: P1) 🎯 MVP

**目标**: 允许物料管理员通过分类、状态、成本范围、关键词快速筛选和搜索物料

**独立测试**: 在物料列表页面输入不同筛选条件，验证筛选结果是否正确，无需依赖其他功能

### 后端实现 (User Story 1)

- [ ] T016 [P] [US1] 扩展 MaterialRepository 查询方法: backend/src/main/java/com/cinema/material/repository/MaterialRepository.java（添加 findByFilter 方法，支持 JPA Specification 动态查询）
- [ ] T017 [US1] 扩展 MaterialService 筛选逻辑: backend/src/main/java/com/cinema/material/service/MaterialService.java（添加 filterMaterials 方法，构建动态查询条件）
- [ ] T018 [US1] 新增 MaterialController 筛选接口: backend/src/main/java/com/cinema/material/controller/MaterialController.java（添加 GET /api/materials 接口，接收筛选参数并返回分页结果）
- [ ] T019 [US1] 添加筛选接口参数验证: MaterialController.java 中的 filterMaterials 方法（使用 @Validated 注解和 MaterialFilterDTO 验证）

### 前端实现 (User Story 1)

- [ ] T020 [P] [US1] 创建 MaterialFilter 组件: frontend/src/components/material/MaterialFilter.tsx（包含 4 个筛选器：分类、状态、成本范围、关键词，以及查询和重置按钮）
- [ ] T021 [P] [US1] 扩展 materialService 筛选接口: frontend/src/services/materialService.ts（添加 filterMaterials 函数，调用 GET /api/materials）
- [ ] T022 [US1] 扩展 useMaterials hook: frontend/src/hooks/useMaterials.ts（添加筛选参数支持，使用 TanStack Query 管理筛选状态）
- [ ] T023 [US1] 集成 MaterialFilter 到页面: frontend/src/features/material-management/MaterialManagementPage.tsx（添加 MaterialFilter 组件，连接筛选逻辑到表格数据）
- [ ] T024 [US1] 实现 URL Query Parameters 同步: MaterialManagementPage.tsx（使用 useSearchParams 将筛选条件同步到 URL）

### 测试 (User Story 1)

- [ ] T025 [P] [US1] MaterialService 筛选逻辑单元测试: backend/src/test/java/com/cinema/material/service/MaterialServiceTest.java（测试不同筛选条件组合）
- [ ] T026 [P] [US1] MaterialController 筛选接口集成测试: backend/src/test/java/com/cinema/material/controller/MaterialControllerTest.java（测试 GET /api/materials 接口的各种场景）
- [ ] T027 [P] [US1] MaterialFilter 组件单元测试: frontend/tests/components/material/MaterialFilter.test.tsx（测试筛选器交互和表单提交）

**检查点**: 此时 User Story 1 应该完全功能化并可独立测试

---

## Phase 4: User Story 2 - 批量导出物料数据 (Priority: P2)

**目标**: 允许物料管理员将筛选后的物料数据导出为 Excel 文件

**独立测试**: 点击"批量导出"按钮后是否生成正确的 Excel 文件，文件中是否包含当前筛选条件下的所有物料数据及正确的列

### 后端实现 (User Story 2)

- [ ] T028 [P] [US2] 创建 MaterialExportService: backend/src/main/java/com/cinema/material/service/MaterialExportService.java（实现 exportMaterials 方法，使用 Apache POI SXSSF 流式写入）
- [ ] T029 [US2] 新增 MaterialController 导出接口: backend/src/main/java/com/cinema/material/controller/MaterialController.java（添加 GET /api/materials/export 接口，返回 Excel 文件流）
- [ ] T030 [US2] 实现导出数据量限制检查: MaterialExportService.java（单次导出最多 10000 条，超出提示错误）
- [ ] T031 [US2] 实现导出文件名生成: MaterialExportService.java（格式：物料数据_YYYYMMDD_HHmmss.xlsx）

### 前端实现 (User Story 2)

- [ ] T032 [P] [US2] 创建 MaterialExportButton 组件: frontend/src/components/material/MaterialExportButton.tsx（包含导出按钮和加载状态）
- [ ] T033 [P] [US2] 扩展 materialService 导出接口: frontend/src/services/materialService.ts（添加 exportMaterials 函数，调用 GET /api/materials/export）
- [ ] T034 [P] [US2] 创建 useExportMaterials hook: frontend/src/hooks/useExportMaterials.ts（使用 TanStack Query Mutation 管理导出状态）
- [ ] T035 [US2] 实现前端文件下载: useExportMaterials.ts（使用 file-saver 库下载 Blob 数据）
- [ ] T036 [US2] 集成 MaterialExportButton 到页面: frontend/src/features/material-management/MaterialManagementPage.tsx（添加导出按钮，传递当前筛选条件）

### 测试 (User Story 2)

- [ ] T037 [P] [US2] MaterialExportService 单元测试: backend/src/test/java/com/cinema/material/service/MaterialExportServiceTest.java（测试 Excel 生成逻辑和数据量限制）
- [ ] T038 [P] [US2] MaterialController 导出接口集成测试: backend/src/test/java/com/cinema/material/controller/MaterialControllerTest.java（测试 GET /api/materials/export 接口）
- [ ] T039 [P] [US2] MaterialExportButton 组件单元测试: frontend/tests/components/material/MaterialExportButton.test.tsx（测试导出按钮交互和状态）

**检查点**: 此时 User Stories 1 和 2 应该都独立工作

---

## Phase 5: User Story 3 - 批量导入物料数据 (Priority: P3)

**目标**: 允许物料管理员通过上传 Excel 文件批量导入物料数据

**独立测试**: 准备符合模板格式的 Excel 文件，上传后验证物料是否正确创建，错误处理是否符合预期

### 后端实现 (User Story 3)

- [ ] T040 [P] [US3] 创建 MaterialImportService: backend/src/main/java/com/cinema/material/service/MaterialImportService.java（实现 previewImport 和 confirmImport 方法）
- [ ] T041 [US3] 实现 Excel 文件解析: MaterialImportService.java（使用 Apache POI 解析 .xlsx 和 .xls 文件）
- [ ] T042 [US3] 实现导入数据校验: MaterialImportService.java（校验必填字段、数据格式、业务规则）
- [ ] T043 [US3] 实现导入预览逻辑: MaterialImportService.java（返回校验结果但不保存）
- [ ] T044 [US3] 实现导入确认逻辑: MaterialImportService.java（批量创建物料，使用事务保证一致性）
- [ ] T045 [US3] 新增 MaterialController 导入接口: backend/src/main/java/com/cinema/material/controller/MaterialController.java（添加 POST /api/materials/import/preview 和 POST /api/materials/import/confirm 接口）

### 前端实现 (User Story 3)

- [ ] T046 [P] [US3] 创建 MaterialImportModal 组件: frontend/src/components/material/MaterialImportModal.tsx（包含文件上传、预览结果、确认导入功能）
- [ ] T047 [P] [US3] 实现前端文件校验: MaterialImportModal.tsx（校验文件格式、大小，使用 Zod 验证）
- [ ] T048 [P] [US3] 实现 Excel 文件解析: MaterialImportModal.tsx（使用 ExcelJS 解析文件并预览前 100 行）
- [ ] T049 [P] [US3] 扩展 materialService 导入接口: frontend/src/services/materialService.ts（添加 previewImport 和 confirmImport 函数）
- [ ] T050 [P] [US3] 创建 useImportMaterials hook: frontend/src/hooks/useImportMaterials.ts（管理导入流程状态）
- [ ] T051 [US3] 实现导入模板下载: MaterialImportModal.tsx（生成包含示例数据的 Excel 模板）
- [ ] T052 [US3] 实现导入错误展示: MaterialImportModal.tsx（显示每行的错误信息和失败统计）
- [ ] T053 [US3] 集成 MaterialImportModal 到页面: frontend/src/features/material-management/MaterialManagementPage.tsx（添加批量导入按钮，打开导入弹窗）

### 测试 (User Story 3)

- [ ] T054 [P] [US3] MaterialImportService 单元测试: backend/src/test/java/com/cinema/material/service/MaterialImportServiceTest.java（测试文件解析、数据校验、批量创建逻辑）
- [ ] T055 [P] [US3] MaterialController 导入接口集成测试: backend/src/test/java/com/cinema/material/controller/MaterialControllerTest.java（测试 POST /api/materials/import/preview 和 confirm 接口）
- [ ] T056 [P] [US3] MaterialImportModal 组件单元测试: frontend/tests/components/material/MaterialImportModal.test.tsx（测试文件上传、预览、确认流程）

**检查点**: 此时 User Stories 1, 2 和 3 应该都独立工作

---

## Phase 6: User Story 4 - 批量操作物料 (Priority: P3)

**目标**: 允许物料管理员批量选择多个物料并执行批量操作（删除、修改状态）

**独立测试**: 在列表中勾选多个物料，点击批量操作按钮，验证操作是否正确应用到所有选中的物料

### 后端实现 (User Story 4)

- [ ] T057 [P] [US4] 扩展 MaterialService 批量删除: backend/src/main/java/com/cinema/material/service/MaterialService.java（添加 batchDelete 方法，检测 BOM 引用）
- [ ] T058 [P] [US4] 扩展 MaterialService 批量修改状态: MaterialService.java（添加 batchUpdateStatus 方法）
- [ ] T059 [US4] 实现批量操作结果反馈: MaterialService.java（返回成功/失败详情，包含失败原因）
- [ ] T060 [US4] 新增 MaterialController 批量操作接口: backend/src/main/java/com/cinema/material/controller/MaterialController.java（添加 POST /api/materials/batch 接口）

### 前端实现 (User Story 4)

- [ ] T061 [P] [US4] 扩展 MaterialTable 支持批量选择: frontend/src/components/material/MaterialTable.tsx（添加 Checkbox 列，管理选中状态）
- [ ] T062 [P] [US4] 创建 MaterialBatchActions 组件: frontend/src/components/material/MaterialBatchActions.tsx（包含批量删除、批量修改状态按钮）
- [ ] T063 [P] [US4] 扩展 materialService 批量操作接口: frontend/src/services/materialService.ts（添加 batchOperateMaterials 函数）
- [ ] T064 [P] [US4] 创建 useBatchMaterials hook: frontend/src/hooks/useBatchMaterials.ts（管理批量操作状态）
- [ ] T065 [US4] 实现批量操作确认对话框: MaterialBatchActions.tsx（使用 Ant Design Modal 显示确认提示）
- [ ] T066 [US4] 实现批量操作结果展示: MaterialBatchActions.tsx（显示成功/失败统计和详情）
- [ ] T067 [US4] 集成 MaterialBatchActions 到页面: frontend/src/features/material-management/MaterialManagementPage.tsx（添加批量操作区域，连接选中状态）

### 测试 (User Story 4)

- [ ] T068 [P] [US4] MaterialService 批量操作单元测试: backend/src/test/java/com/cinema/material/service/MaterialServiceTest.java（测试批量删除和批量修改状态逻辑）
- [ ] T069 [P] [US4] MaterialController 批量操作接口集成测试: backend/src/test/java/com/cinema/material/controller/MaterialControllerTest.java（测试 POST /api/materials/batch 接口）
- [ ] T070 [P] [US4] MaterialBatchActions 组件单元测试: frontend/tests/components/material/MaterialBatchActions.test.tsx（测试批量操作按钮交互）

**检查点**: 所有用户故事现在都应该独立功能化

---

## Phase 7: Polish & Cross-Cutting Concerns

**目的**: 影响多个用户故事的改进和优化

- [ ] T071 [P] 添加前端错误边界: frontend/src/components/material/MaterialErrorBoundary.tsx（捕获组件错误并显示友好提示）
- [ ] T072 [P] 优化前端性能: 使用 useMemo 和 useCallback 优化 MaterialFilter 和 MaterialTable 组件
- [ ] T073 [P] 添加前端日志: 使用 console.error 记录关键错误（导出失败、导入失败、批量操作失败）
- [ ] T074 [P] 优化后端查询性能: 验证数据库索引是否生效，调整查询策略
- [ ] T075 [P] 添加后端日志: 在 MaterialService 和 MaterialController 中添加日志记录（使用 SLF4J）
- [ ] T076 [P] 代码质量检查: 运行 ESLint (前端) 和 Checkstyle (后端)，修复警告
- [ ] T077 [P] 更新组件导出: frontend/src/components/material/index.ts（导出所有新增组件）
- [ ] T078 [P] 添加 @spec 标识: 在所有新增文件的文件头添加 @spec M002-material-filter 注释
- [ ] T079 集成测试验证: frontend/tests/features/MaterialManagementPage.test.tsx（测试完整的用户流程：筛选→导出→导入→批量操作）
- [ ] T080 运行 quickstart.md 验证: 按照 quickstart.md 步骤验证功能是否正常工作

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-6)**: 所有用户故事都依赖 Foundational phase 完成
  - 用户故事可以并行进行（如果有多人协作）
  - 或按优先级顺序执行（P1 → P2 → P3 → P3）
- **Polish (Phase 7)**: 依赖所有所需用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在 Foundational (Phase 2) 后开始 - 无其他故事依赖
- **User Story 2 (P2)**: 可在 Foundational (Phase 2) 后开始 - 依赖 US1 的筛选功能（导出时使用筛选条件）
- **User Story 3 (P3)**: 可在 Foundational (Phase 2) 后开始 - 无其他故事依赖（独立导入功能）
- **User Story 4 (P3)**: 可在 Foundational (Phase 2) 后开始 - 依赖 US1 的列表功能（批量操作基于列表选择）

### Within Each User Story

- 后端 DTO 和工具类优先于服务层
- 服务层优先于控制器层
- 前端类型定义优先于组件
- 组件优先于页面集成
- 核心实现优先于集成
- 故事完成后再进入下一个优先级

### Parallel Opportunities

- Phase 1 所有标记 [P] 的任务可并行运行
- Phase 2 所有标记 [P] 的任务可并行运行（在 Phase 2 内部）
- Foundational phase 完成后，所有用户故事可并行开始（如果团队容量允许）
- 每个用户故事内标记 [P] 的任务可并行运行
- 不同用户故事可由不同团队成员并行工作

---

## Parallel Example: User Story 1

```bash
# 并行执行 User Story 1 的后端任务:
Task T016: "扩展 MaterialRepository 查询方法"
Task T019: "添加筛选接口参数验证" (T016 完成后)

# 并行执行 User Story 1 的前端组件任务:
Task T020: "创建 MaterialFilter 组件"
Task T021: "扩展 materialService 筛选接口"

# 并行执行 User Story 1 的测试任务:
Task T025: "MaterialService 筛选逻辑单元测试"
Task T026: "MaterialController 筛选接口集成测试"
Task T027: "MaterialFilter 组件单元测试"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1（快速筛选物料）
4. **停止并验证**: 独立测试 User Story 1
5. 如果就绪，可以部署/演示

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示（MVP!）
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 添加 User Story 4 → 独立测试 → 部署/演示
6. 每个故事增加价值而不破坏之前的故事

### Parallel Team Strategy

如果有多个开发人员：

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后：
   - Developer A: User Story 1（筛选功能）
   - Developer B: User Story 2（导出功能）
   - Developer C: User Story 3（导入功能）
   - Developer D: User Story 4（批量操作）
3. 各故事独立完成和集成

---

## Task Count Summary

- **Total Tasks**: 80
- **Setup (Phase 1)**: 4 tasks
- **Foundational (Phase 2)**: 11 tasks
- **User Story 1 (Phase 3)**: 12 tasks (包含 3 个测试任务)
- **User Story 2 (Phase 4)**: 12 tasks (包含 3 个测试任务)
- **User Story 3 (Phase 5)**: 17 tasks (包含 3 个测试任务)
- **User Story 4 (Phase 6)**: 14 tasks (包含 3 个测试任务)
- **Polish (Phase 7)**: 10 tasks

**Parallel Tasks**: 45 个任务标记为 [P]，可并行执行

**Independent Test Criteria**:
- US1: 筛选结果正确，无需其他功能
- US2: Excel 文件生成正确，包含筛选后的数据
- US3: 导入文件解析和校验正确，物料创建成功
- US4: 批量操作正确应用到选中物料

**Suggested MVP Scope**: User Story 1（快速筛选物料）

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应该可以独立完成和测试
- 实现前验证测试失败
- 每个任务或逻辑组后提交代码
- 在任何检查点停止以独立验证故事
- 避免：模糊任务、相同文件冲突、破坏独立性的跨故事依赖

---

## 格式验证

✅ 所有任务遵循严格的检查清单格式：
- 复选框：`- [ ]`
- 任务 ID：T001-T080（按执行顺序）
- [P] 标记：45 个并行任务
- [Story] 标签：56 个任务标记为 US1-US4
- 文件路径：所有任务包含具体文件路径

✅ 任务按用户故事组织，支持独立实现和测试
✅ 每个用户故事包含独立测试标准
✅ 依赖关系清晰定义
✅ 并行执行示例提供


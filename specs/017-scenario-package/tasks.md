# Tasks: 场景包管理 (Scenario Package Management)

**Input**: Design documents from `/specs/017-scenario-package/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: 根据宪法原则要求采用测试驱动开发（TDD），所有关键业务流程必须先编写测试

**Organization**: 任务按用户故事分组，每个故事可独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（US1, US2, US3, US4）
- 描述中包含精确的文件路径

## Path Conventions

- **后端**: `backend/src/main/java/com/cinema/scenariopackage/`
- **前端**: `frontend/src/features/scenario-package-management/`
- **测试**: `backend/src/test/`, `frontend/src/features/scenario-package-management/__tests__/`
- **数据库**: `backend/src/main/resources/db/migration/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基础结构搭建

- [X] T001 执行数据库迁移脚本 backend/src/main/resources/db/migration/V1__create_scenario_packages.sql
- [X] T002 配置 Supabase Storage bucket (scenario-packages)，设置为 public-read，限制 5MB
- [X] T003 [P] 创建后端项目结构 backend/src/main/java/com/cinema/scenariopackage/{controller,service,repository,model,dto,exception}/
- [X] T004 [P] 创建前端项目结构 frontend/src/features/scenario-package-management/{components/{atoms,molecules,organisms},hooks,services,types,stores,utils}/
- [X] T005 [P] 创建前端页面结构 frontend/src/pages/scenario-packages/{list,create,edit,preview}.tsx
- [X] T006 [P] 配置后端环境变量 (Supabase URL, API Key, Storage Bucket) 在 backend/src/main/resources/application.yml
- [X] T007 [P] 配置前端环境变量 (API Base URL, Supabase URL) 在 frontend/.env.local

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 所有用户故事依赖的核心基础设施，必须在任何用户故事之前完成

**⚠️ CRITICAL**: 此阶段完成前不能开始任何用户故事工作

### 后端基础

- [X] T008 创建 ApiResponse<T> 统一响应包装类 backend/src/main/java/com/cinema/common/dto/ApiResponse.java
- [X] T009 创建 ListResponse<T> 列表响应类 backend/src/main/java/com/cinema/common/dto/ListResponse.java
- [X] T010 创建 ErrorResponse 错误响应类 backend/src/main/java/com/cinema/common/dto/ErrorResponse.java
- [X] T011 [P] 创建全局异常处理器 backend/src/main/java/com/cinema/common/exception/GlobalExceptionHandler.java
- [X] T012 [P] 创建自定义异常类 backend/src/main/java/com/cinema/scenariopackage/exception/{PackageNotFoundException,ConcurrentModificationException,ValidationException}.java
- [X] T013 创建 Supabase 配置类 backend/src/main/java/com/cinema/config/SupabaseConfig.java
- [X] T014 创建 RestTemplate Bean 配置用于调用 Supabase API backend/src/main/java/com/cinema/config/RestTemplateConfig.java

### 前端基础

- [X] T015 创建 API 客户端配置 frontend/src/services/apiClient.ts (Axios instance with interceptors)
- [X] T016 [P] 配置 TanStack Query Provider frontend/src/App.tsx
- [X] T017 [P] 创建 TypeScript 类型定义 frontend/src/features/scenario-package-management/types/index.ts (所有接口定义)
- [X] T018 创建路由配置 frontend/src/router.tsx (场景包管理相关路由)

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 创建基础场景包 (Priority: P1) 🎯 MVP

**Goal**: 运营人员可以创建新的场景包，填写名称、描述、上传背景图片并选择适用影厅类型，保存为草稿状态

**Independent Test**: 用户可以独立完成"创建一个新场景包并保存为草稿"的完整流程，验证场景包基本信息的创建、编辑和存储功能是否正常工作

### 测试 for User Story 1 (TDD - 先写测试) ⚠️

> **NOTE: 先编写这些测试，确保它们 FAIL 之后再开始实现**

- [X] T019 [P] [US1] 后端集成测试：创建场景包 backend/src/test/java/com/cinema/scenariopackage/controller/ScenarioPackageControllerTest.java (testCreatePackage)
- [X] T020 [P] [US1] 后端集成测试：查询场景包列表 backend/src/test/java/com/cinema/scenariopackage/controller/ScenarioPackageControllerTest.java (testListPackages)
- [X] T021 [P] [US1] 后端集成测试：查询单个场景包详情 backend/src/test/java/com/cinema/scenariopackage/controller/ScenarioPackageControllerTest.java (testGetPackageById)
- [X] T022 [P] [US1] 后端集成测试：更新场景包基本信息 backend/src/test/java/com/cinema/scenariopackage/controller/ScenarioPackageControllerTest.java (testUpdatePackage)
- [X] T023 [P] [US1] 后端集成测试：乐观锁并发冲突 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testOptimisticLockConflict)
- [X] T024 [P] [US1] 前端组件测试：PackageList 列表渲染 frontend/src/features/scenario-package-management/__tests__/PackageList.test.tsx
- [X] T025 [P] [US1] 前端组件测试：PackageForm 表单验证 frontend/src/features/scenario-package-management/__tests__/PackageForm.test.tsx
- [X] T026 [P] [US1] E2E 测试：完整创建流程 frontend/tests/e2e/scenario-package-create.spec.ts

### 后端实现 for User Story 1

#### 数据模型层

- [X] T027 [P] [US1] 创建 ScenarioPackage 实体 backend/src/main/java/com/cinema/scenariopackage/model/ScenarioPackage.java (包含 @Version 乐观锁)
- [X] T028 [P] [US1] 创建 PackageRule 实体 backend/src/main/java/com/cinema/scenariopackage/model/PackageRule.java
- [X] T029 [P] [US1] 创建 PackageHallAssociation 实体 backend/src/main/java/com/cinema/scenariopackage/model/PackageHallAssociation.java

#### Repository 层

- [X] T030 [P] [US1] 创建 ScenarioPackageRepository backend/src/main/java/com/cinema/scenariopackage/repository/ScenarioPackageRepository.java (JPA Repository)
- [X] T031 [P] [US1] 创建 PackageRuleRepository backend/src/main/java/com/cinema/scenariopackage/repository/PackageRuleRepository.java
- [X] T032 [P] [US1] 创建 PackageHallAssociationRepository backend/src/main/java/com/cinema/scenariopackage/repository/PackageHallAssociationRepository.java

#### DTO 层

- [X] T033 [P] [US1] 创建 ScenarioPackageDTO backend/src/main/java/com/cinema/scenariopackage/dto/ScenarioPackageDTO.java (响应 DTO)
- [X] T034 [P] [US1] 创建 ScenarioPackageSummary DTO backend/src/main/java/com/cinema/scenariopackage/dto/ScenarioPackageSummary.java (列表摘要)
- [X] T035 [P] [US1] 创建 CreatePackageRequest DTO backend/src/main/java/com/cinema/scenariopackage/dto/CreatePackageRequest.java (创建请求)
- [X] T036 [P] [US1] 创建 UpdatePackageRequest DTO backend/src/main/java/com/cinema/scenariopackage/dto/UpdatePackageRequest.java (更新请求，包含 versionLock)

#### Service 层

- [X] T037 [US1] 实现 ImageUploadService backend/src/main/java/com/cinema/scenariopackage/service/ImageUploadService.java (预签名 URL 生成，文件验证)
- [X] T038 [US1] 实现 ScenarioPackageService 基础方法 backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java (create, findById, findAll, update, delete)
- [X] T039 [US1] 在 ScenarioPackageService 中实现乐观锁冲突检测和版本创建逻辑

#### Controller 层

- [X] T040 [US1] 实现 ScenarioPackageController backend/src/main/java/com/cinema/scenariopackage/controller/ScenarioPackageController.java (POST /api/scenario-packages, GET /api/scenario-packages, GET /api/scenario-packages/{id}, PUT /api/scenario-packages/{id}, DELETE /api/scenario-packages/{id})
- [X] T041 [US1] 实现图片上传端点 ScenarioPackageController (POST /api/scenario-packages/{id}/image 生成预签名 URL, PATCH /api/scenario-packages/{id}/image 确认上传)

### 前端实现 for User Story 1

#### 类型定义和 API 服务

- [X] T042 [P] [US1] 完善 TypeScript 类型定义 frontend/src/features/scenario-package-management/types/index.ts (ScenarioPackageDetail, CreatePackageRequest, UpdatePackageRequest)
- [X] T043 [US1] 创建 packageService API 封装 frontend/src/features/scenario-package-management/services/packageService.ts (list, getById, create, update, delete, generateImageUploadUrl, confirmImageUpload)

#### Hooks (TanStack Query)

- [X] T044 [P] [US1] 创建 usePackageList hook frontend/src/features/scenario-package-management/hooks/usePackageList.ts
- [X] T045 [P] [US1] 创建 usePackageDetail hook frontend/src/features/scenario-package-management/hooks/usePackageDetail.ts
- [X] T046 [P] [US1] 创建 useCreatePackage mutation hook frontend/src/features/scenario-package-management/hooks/useCreatePackage.ts
- [X] T047 [P] [US1] 创建 useUpdatePackage mutation hook frontend/src/features/scenario-package-management/hooks/useUpdatePackage.ts (包含乐观锁错误处理)
- [X] T048 [P] [US1] 创建 useDeletePackage mutation hook frontend/src/features/scenario-package-management/hooks/useDeletePackage.ts

#### 组件 - Atoms

- [X] T049 [P] [US1] 创建 ImageUpload 组件 frontend/src/features/scenario-package-management/components/atoms/ImageUpload.tsx (支持预签名 URL 上传，文件验证)
- [X] T050 [P] [US1] 创建 StatusBadge 组件 frontend/src/features/scenario-package-management/components/atoms/StatusBadge.tsx (DRAFT/PUBLISHED/UNPUBLISHED)

#### 组件 - Molecules

- [X] T051 [US1] 创建 PackageForm 组件 frontend/src/features/scenario-package-management/components/molecules/PackageForm.tsx (名称、描述、影厅类型选择、图片上传)
- [X] T052 [US1] 创建 PackageListFilters 组件 frontend/src/features/scenario-package-management/components/molecules/PackageListFilters.tsx (状态筛选、搜索框)

#### 组件 - Organisms

- [X] T053 [US1] 创建 PackageList 组件 frontend/src/features/scenario-package-management/components/organisms/PackageList.tsx (表格展示，操作按钮)
- [X] T054 [US1] 创建 PackageEditor 组件 frontend/src/features/scenario-package-management/components/organisms/PackageEditor.tsx (编辑表单容器)

#### 页面

- [X] T055 [US1] 实现场景包列表页 frontend/src/pages/scenario-packages/list.tsx
- [X] T056 [US1] 实现场景包创建页 frontend/src/pages/scenario-packages/create.tsx
- [X] T057 [US1] 实现场景包编辑页 frontend/src/pages/scenario-packages/edit.tsx

#### UI 优化（按设计图调整）

- [X] T056a [US1] 创建页布局重构：单列布局 → 左右两栏布局（Row/Col 16:8） frontend/src/pages/scenario-packages/create.tsx
- [X] T056b [US1] 创建页头部优化：按钮移至右上角，标题添加下划线强调 frontend/src/pages/scenario-packages/create.tsx
- [X] T056c [US1] 创建页基础信息 Card 添加图标标题 frontend/src/pages/scenario-packages/create.tsx
- [X] T056d [US1] 创建页适用影厅类型改为标签选择器样式 (Tag.CheckableTag) frontend/src/pages/scenario-packages/create.tsx
- [X] T056e [US1] 创建页使用规则三字段横向排列，标签改为"建议时长" frontend/src/pages/scenario-packages/create.tsx
- [X] T056f [US1] 创建页右侧添加封面图上传 Card (Upload.Dragger) frontend/src/pages/scenario-packages/create.tsx
- [X] T056g [US1] 创建页右侧添加定价策略 Card（单品总价、服务总价、参考总价、打包一口价） frontend/src/pages/scenario-packages/create.tsx
- [X] T057a [US1] 编辑页布局重构：同步创建页的左右两栏设计 frontend/src/pages/scenario-packages/edit.tsx
- [X] T057b [US1] 编辑页 UI 优化：按设计图调整头部、基础信息、使用规则、侧边栏样式 frontend/src/pages/scenario-packages/edit.tsx

**Checkpoint**: User Story 1 应该完全可用且可独立测试（创建、查看、编辑基础场景包）

---

## Phase 4: User Story 2 - 配置场景包规则和内容组合 (Priority: P2)

**Goal**: 运营人员可以为草稿状态的场景包配置使用规则（时长、人数范围）和内容组合（硬权益、软权益、服务项目）

**Independent Test**: 用户可以独立完成"为草稿状态的场景包配置完整的规则和内容"的流程，验证规则配置、权益选择和服务项目选择功能是否正常工作

### 测试 for User Story 2 (TDD - 先写测试) ⚠️

- [ ] T058 [P] [US2] 后端集成测试：配置使用规则 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testConfigureRules)
- [ ] T059 [P] [US2] 后端集成测试：添加硬权益 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testAddBenefits)
- [ ] T060 [P] [US2] 后端集成测试：添加软权益单品 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testAddItems)
- [ ] T061 [P] [US2] 后端集成测试：添加服务项目 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testAddServices)
- [ ] T062 [P] [US2] 前端组件测试：ContentSelector 内容选择器 frontend/src/features/scenario-package-management/__tests__/ContentSelector.test.tsx
- [ ] T063 [P] [US2] E2E 测试：完整内容配置流程 frontend/tests/e2e/scenario-package-configure-content.spec.ts

### 后端实现 for User Story 2

#### 数据模型层

- [ ] T064 [P] [US2] 创建 PackageBenefit 实体 backend/src/main/java/com/cinema/scenariopackage/model/PackageBenefit.java (硬权益)
- [ ] T065 [P] [US2] 创建 PackageItem 实体 backend/src/main/java/com/cinema/scenariopackage/model/PackageItem.java (软权益单品，包含快照字段)
- [ ] T066 [P] [US2] 创建 PackageService 实体 backend/src/main/java/com/cinema/scenariopackage/model/PackageService.java (服务项目，包含快照字段)

#### Repository 层

- [ ] T067 [P] [US2] 创建 PackageBenefitRepository backend/src/main/java/com/cinema/scenariopackage/repository/PackageBenefitRepository.java
- [ ] T068 [P] [US2] 创建 PackageItemRepository backend/src/main/java/com/cinema/scenariopackage/repository/PackageItemRepository.java
- [ ] T069 [P] [US2] 创建 PackageServiceRepository backend/src/main/java/com/cinema/scenariopackage/repository/PackageServiceRepository.java

#### Service 层

- [ ] T070 [US2] 扩展 ScenarioPackageService：添加规则配置方法 (configureRule)
- [ ] T071 [US2] 扩展 ScenarioPackageService：添加内容管理方法 (addBenefit, removeBenefit, addItem, removeItem, updateItemQuantity, addService, removeService)
- [ ] T072 [US2] 实现快照逻辑：在添加 Item/Service 时自动从主数据复制名称和价格到快照字段

#### Controller 层

- [ ] T073 [US2] 扩展 ScenarioPackageController：添加内容配置端点 (PUT /api/scenario-packages/{id}/content)

### 前端实现 for User Story 2

#### 组件 - Molecules

- [ ] T074 [P] [US2] 创建 RuleConfigurator 组件 frontend/src/features/scenario-package-management/components/molecules/RuleConfigurator.tsx (时长、人数范围)
- [ ] T075 [P] [US2] 创建 BenefitSelector 组件 frontend/src/features/scenario-package-management/components/molecules/BenefitSelector.tsx (硬权益选择，结构化表单)
- [ ] T076 [P] [US2] 创建 ItemSelector 组件 frontend/src/features/scenario-package-management/components/molecules/ItemSelector.tsx (软权益单品选择，下拉菜单 + 数量调整)
- [ ] T077 [P] [US2] 创建 ServiceSelector 组件 frontend/src/features/scenario-package-management/components/molecules/ServiceSelector.tsx (服务项目选择，与 ItemSelector 交互一致)

#### 组件 - Organisms

- [ ] T078 [US2] 创建 ContentConfigurator 组件 frontend/src/features/scenario-package-management/components/organisms/ContentConfigurator.tsx (整合规则、硬权益、软权益、服务项目配置)

#### 页面更新

- [ ] T079 [US2] 更新编辑页面，集成 ContentConfigurator frontend/src/pages/scenario-packages/edit.tsx

**Checkpoint**: User Stories 1 AND 2 应该都能独立工作（可以创建基础包，也可以配置内容）

---

## Phase 5: User Story 3 - 设置场景包定价策略 (Priority: P3)

**Goal**: 运营人员可以为场景包设置打包一口价，系统实时计算参考总价、优惠比例和优惠金额

**Independent Test**: 用户可以独立完成"为已配置内容的场景包设置打包价格"的流程，验证定价设置、价格计算和优惠比例提示功能是否正常工作

### 测试 for User Story 3 (TDD - 先写测试) ⚠️

- [ ] T080 [P] [US3] 后端集成测试：计算参考总价 backend/src/test/java/com/cinema/scenariopackage/service/PricingServiceTest.java (testCalculateReferencePrice)
- [ ] T081 [P] [US3] 后端集成测试：设置打包价格 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testSetPackagePrice)
- [ ] T082 [P] [US3] 后端单元测试：价格计算边缘案例 backend/src/test/java/com/cinema/scenariopackage/service/PricingServiceTest.java (testEdgeCases: 零价格、参考总价=0、打包价>参考总价)
- [ ] T083 [P] [US3] 前端组件测试：PricingCalculator 定价计算器 frontend/src/features/scenario-package-management/__tests__/PricingCalculator.test.tsx
- [ ] T084 [P] [US3] E2E 测试：定价设置流程 frontend/tests/e2e/scenario-package-pricing.spec.ts

### 后端实现 for User Story 3

#### 数据模型层

- [ ] T085 [US3] 创建 PackagePricing 实体 backend/src/main/java/com/cinema/scenariopackage/model/PackagePricing.java

#### Repository 层

- [ ] T086 [US3] 创建 PackagePricingRepository backend/src/main/java/com/cinema/scenariopackage/repository/PackagePricingRepository.java

#### Service 层

- [ ] T087 [US3] 实现 PricingService backend/src/main/java/com/cinema/scenariopackage/service/PricingService.java (calculateReferencePrice 实时计算，仅包含软权益和服务)
- [ ] T088 [US3] 在 PricingService 中实现优惠比例和金额计算逻辑，处理边缘案例（参考总价=0，打包价>参考总价）
- [ ] T089 [US3] 扩展 ScenarioPackageService：添加定价设置方法 (setPricing, updatePricing)

#### Controller 层

- [ ] T090 [US3] 添加定价相关端点 ScenarioPackageController (GET /api/scenario-packages/{id}/pricing/reference 计算参考总价)
- [ ] T091 [US3] 扩展更新端点支持定价更新 (PUT /api/scenario-packages/{id}/pricing)

### 前端实现 for User Story 3

#### Hooks

- [ ] T092 [US3] 创建 usePricingCalculator hook frontend/src/features/scenario-package-management/hooks/usePricingCalculator.ts (实时计算参考总价)

#### 组件 - Molecules

- [ ] T093 [US3] 创建 PricingCalculator 组件 frontend/src/features/scenario-package-management/components/molecules/PricingCalculator.tsx (显示参考总价、打包价格输入、优惠比例和金额实时计算)

#### 页面更新

- [ ] T094 [US3] 更新编辑页面，集成 PricingCalculator frontend/src/pages/scenario-packages/edit.tsx

**Checkpoint**: 所有 User Stories 1, 2, 3 应该独立可用（创建、配置内容、设置定价）

---

## Phase 6: User Story 4 - 发布和管理场景包状态 (Priority: P4)

**Goal**: 运营人员可以发布草稿场景包（验证完整性），下架已发布场景包，重新上架，以及软删除场景包

**Independent Test**: 用户可以独立完成"将草稿场景包发布上架"的流程，验证状态变更、权限控制和小程序端可见性联动功能是否正常工作

### 测试 for User Story 4 (TDD - 先写测试) ⚠️

- [ ] T095 [P] [US4] 后端集成测试：发布场景包（成功） backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testPublishPackageSuccess)
- [ ] T096 [P] [US4] 后端集成测试：发布场景包（失败 - 配置不完整） backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testPublishPackageValidationFailed)
- [ ] T097 [P] [US4] 后端集成测试：下架场景包 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testUnpublishPackage)
- [ ] T098 [P] [US4] 后端集成测试：软删除场景包 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testSoftDeletePackage)
- [ ] T099 [P] [US4] 后端集成测试：删除时检查订单关联 backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java (testDeletePackageWithActiveOrders)
- [ ] T100 [P] [US4] E2E 测试：发布和状态管理流程 frontend/tests/e2e/scenario-package-publish.spec.ts

### 后端实现 for User Story 4

#### Service 层

- [ ] T101 [US4] 实现发布验证逻辑 ScenarioPackageService (validatePackageCompleteness: 检查至少有一项内容、必须有定价)
- [ ] T102 [US4] 实现状态管理方法 ScenarioPackageService (publish, unpublish, softDelete)
- [ ] T103 [US4] 实现软删除前检查订单关联 (checkActiveOrders，如有进行中订单则阻止删除)
- [ ] T104 [US4] 实现版本创建触发逻辑：修改已发布包时自动创建新版本（version+1, status=DRAFT, is_latest=true）

#### Controller 层

- [ ] T105 [US4] 添加状态管理端点 ScenarioPackageController (POST /api/scenario-packages/{id}/publish, POST /api/scenario-packages/{id}/unpublish)

### 前端实现 for User Story 4

#### Hooks

- [ ] T106 [P] [US4] 创建 usePublishPackage mutation hook frontend/src/features/scenario-package-management/hooks/usePublishPackage.ts
- [ ] T107 [P] [US4] 创建 useUnpublishPackage mutation hook frontend/src/features/scenario-package-management/hooks/useUnpublishPackage.ts

#### 页面更新

- [ ] T108 [US4] 更新列表页面，添加发布/下架/删除操作按钮 frontend/src/pages/scenario-packages/list.tsx
- [ ] T109 [US4] 更新编辑页面，添加"保存并发布"按钮 frontend/src/pages/scenario-packages/edit.tsx

#### 预览页面

- [ ] T110 [US4] 实现场景包预览页 frontend/src/pages/scenario-packages/preview.tsx (显示完整的规则、内容、定价信息，用于发布前确认)

**Checkpoint**: 所有 User Stories 完整可用（创建、配置、定价、发布/状态管理）

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 影响多个用户故事的改进和优化

- [ ] T111 [P] 添加后端日志记录（关键操作：创建、发布、删除） backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java
- [ ] T112 [P] 前端错误边界处理 frontend/src/features/scenario-package-management/components/ErrorBoundary.tsx
- [ ] T113 [P] 前端加载状态优化（骨架屏） frontend/src/features/scenario-package-management/components/atoms/SkeletonLoader.tsx
- [ ] T114 性能优化：列表虚拟滚动（如需支持 >100 条数据） frontend/src/features/scenario-package-management/components/organisms/PackageList.tsx
- [ ] T115 [P] 可访问性检查：键盘导航、ARIA 标签、焦点管理
- [ ] T116 [P] 代码质量：ESLint 检查通过，无警告
- [ ] T117 [P] 代码质量：Java 静态检查通过（Checkstyle/SonarLint）
- [ ] T118 [P] 添加关键 Java 代码注释（领域类、公共方法、复杂业务逻辑）
- [ ] T119 执行 quickstart.md 验证流程（确保文档与实现一致）
- [ ] T120 [P] 更新 API 文档（如有变更） specs/017-scenario-package/contracts/api.yaml

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-6)**: 所有依赖 Foundational 完成
  - User stories 可并行进行（如有人力）
  - 或按优先级顺序（P1 → P2 → P3 → P4）
- **Polish (Phase 7)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后即可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Foundational 完成后即可开始 - 依赖 US1 的数据模型（ScenarioPackage），但可独立测试
- **User Story 3 (P3)**: Foundational 完成后即可开始 - 依赖 US2 的内容配置，但可独立测试
- **User Story 4 (P4)**: Foundational 完成后即可开始 - 依赖 US1-3 的完整功能，但状态管理逻辑可独立测试

### Within Each User Story

- 测试 MUST 先写且 FAIL 后再实现
- 数据模型 → Repository → Service → Controller
- 前端：类型定义 → API 服务 → Hooks → 组件（Atoms → Molecules → Organisms） → 页面
- 故事核心实现 → 集成其他故事 → 故事完成后移至下一优先级

### Parallel Opportunities

- Setup 阶段所有标记 [P] 的任务可并行
- Foundational 阶段所有标记 [P] 的任务可并行（Phase 2 内部）
- Foundational 完成后，所有用户故事可并行开始（如团队容量允许）
- 每个用户故事内所有测试标记 [P] 可并行
- 每个用户故事内所有数据模型标记 [P] 可并行
- 不同用户故事可由不同团队成员并行工作

---

## Parallel Example: User Story 1

```bash
# 并行启动 User Story 1 的所有测试（TDD）:
Task: "后端集成测试：创建场景包"
Task: "后端集成测试：查询场景包列表"
Task: "后端集成测试：查询单个场景包详情"
Task: "前端组件测试：PackageList 列表渲染"
Task: "前端组件测试：PackageForm 表单验证"

# 并行启动 User Story 1 的所有数据模型:
Task: "创建 ScenarioPackage 实体"
Task: "创建 PackageRule 实体"
Task: "创建 PackageHallAssociation 实体"

# 并行启动 User Story 1 的所有 Repository:
Task: "创建 ScenarioPackageRepository"
Task: "创建 PackageRuleRepository"
Task: "创建 PackageHallAssociationRepository"
```

---

## Parallel Example: Multiple User Stories

```bash
# Foundational 完成后，多个开发者并行工作:

Developer A:
  - User Story 1 (T019-T057) - 创建基础场景包

Developer B:
  - User Story 2 (T058-T079) - 配置内容组合

Developer C:
  - User Story 3 (T080-T094) - 设置定价策略

Developer D:
  - User Story 4 (T095-T110) - 发布和状态管理
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 独立测试 User Story 1
5. 如准备就绪可部署/演示

### Incremental Delivery (推荐)

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示（MVP！）
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 添加 User Story 4 → 独立测试 → 部署/演示
6. 每个故事都增加价值而不破坏之前的故事

### Parallel Team Strategy

多个开发者时：

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后：
   - 开发者 A: User Story 1
   - 开发者 B: User Story 2
   - 开发者 C: User Story 3
   - 开发者 D: User Story 4
3. 故事独立完成并集成

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应可独立完成和测试
- 实现前验证测试失败
- 每个任务或逻辑组后提交
- 在任何检查点停止以独立验证故事
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖

---

## Task Summary

**Total Tasks**: 129
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 11 tasks
- **Phase 3 (US1 - 创建基础场景包)**: 48 tasks (8 tests + 31 implementation + 9 UI 优化)
- **Phase 4 (US2 - 配置内容组合)**: 22 tasks (6 tests + 16 implementation)
- **Phase 5 (US3 - 设置定价策略)**: 15 tasks (5 tests + 10 implementation)
- **Phase 6 (US4 - 发布和状态管理)**: 16 tasks (6 tests + 10 implementation)
- **Phase 7 (Polish)**: 10 tasks

**Parallel Opportunities**: 约 60+ 任务标记为 [P]，可并行执行

**MVP Scope** (推荐): Phase 1 + Phase 2 + Phase 3 (User Story 1) = 57 tasks

**Independent Test Criteria**:
- US1: 可创建、查看、编辑基础场景包（名称、描述、图片、影厅）
- US2: 可为场景包配置规则和内容（硬权益、软权益、服务）
- US3: 可设置打包价格并实时查看优惠比例
- US4: 可发布、下架、删除场景包，验证完整性

**Format Validation**: ✅ 所有 120 个任务都遵循清单格式（复选框、ID、标签、文件路径）

# Tasks: 小程序菜单分类动态配置

**Spec**: O002-miniapp-menu-config | **Created**: 2026-01-04 | **Status**: In Progress

## Overview

将硬编码的 `ChannelCategory` 枚举迁移到数据库表 `menu_category`，实现完全动态的商品分类管理系统。

**User Stories**: 7 个用户故事按优先级排序
- **P1**: US1 (Admin CRUD), US2 (C端分类API), US5 (数据迁移), US6 (商品筛选)
- **P2**: US3 (拖拽排序), US4 (可见性切换)
- **P3**: US7 (图标描述)

**Technologies**: Spring Boot 3.3.5 + JPA + Flyway, React 19 + Ant Design 6 + @dnd-kit/sortable, Taro 4.1.9

---

## Phase 1: Setup & Foundation

**Goal**: 项目初始化、依赖安装、数据库表结构

### Backend Setup

- [ ] **T001** [P] 添加 Flyway 依赖到 `backend/pom.xml`
  - 添加 `org.flywaydb:flyway-core` 依赖
  - 配置 Flyway 在 `application.yml` (baseline-on-migrate: true)
  - 文件: `backend/pom.xml`, `backend/src/main/resources/application.yml`

- [ ] **T002** [P] 创建 `menu_category` 表 Flyway 迁移脚本
  - 路径: `backend/src/main/resources/db/migration/V001__create_menu_category_table.sql`
  - 字段: id (UUID PK), code (VARCHAR 50 UNIQUE), display_name (VARCHAR 50 NOT NULL), sort_order (INT DEFAULT 0), is_visible (BOOLEAN DEFAULT true), is_default (BOOLEAN DEFAULT false), icon_url (VARCHAR 500), description (TEXT), version (BIGINT DEFAULT 0), created_at, updated_at, created_by, updated_by, deleted_at
  - 索引: UNIQUE(code), INDEX(sort_order), INDEX(is_visible), INDEX(deleted_at)

- [ ] **T003** [P] 创建 `category_audit_log` 表 Flyway 迁移脚本
  - 路径: `backend/src/main/resources/db/migration/V002__create_category_audit_log_table.sql`
  - 字段: id (UUID PK), category_id (UUID FK), action (VARCHAR 20 CHECK IN ('DELETE', 'BATCH_SORT')), before_data (JSONB), after_data (JSONB), affected_product_count (INT DEFAULT 0), operator_id (VARCHAR 100), operator_name (VARCHAR 100), created_at
  - 索引: INDEX(category_id), INDEX(action), INDEX(created_at)

### Frontend B端 Setup

- [ ] **T004** [P] 安装 B端拖拽排序依赖
  - 安装 `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - 安装 `zod` (表单验证)
  - 文件: `frontend/package.json`
  - 命令: `cd frontend && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zod`

- [ ] **T005** [P] 创建分类功能目录结构
  - 创建目录:
    - `frontend/src/features/channel-products/menu-categories/components/`
    - `frontend/src/features/channel-products/menu-categories/hooks/`
    - `frontend/src/features/channel-products/menu-categories/services/`
    - `frontend/src/features/channel-products/menu-categories/types/`
    - `frontend/src/features/channel-products/menu-categories/pages/`

---

## Phase 2: Foundational Backend Entities & DTOs

**Goal**: 创建核心实体类、Repository、基础 DTO（阻塞后续 API 开发）

### Entity Layer

- [ ] **T006** 创建 `MenuCategory` 实体类
  - 路径: `backend/src/main/java/com/cinema/category/entity/MenuCategory.java`
  - 注解: `@Entity`, `@Table(name = "menu_category")`
  - 字段: id (UUID), code, displayName, sortOrder, isVisible, isDefault, iconUrl, description, **version** (@Version for 乐观锁), createdAt, updatedAt, createdBy, updatedBy, deletedAt
  - JPA 映射: `@Column(unique = true)` for code, `@Version` for version
  - **@spec O002-miniapp-menu-config**

- [ ] **T007** 创建 `CategoryAuditLog` 实体类
  - 路径: `backend/src/main/java/com/cinema/category/entity/CategoryAuditLog.java`
  - 注解: `@Entity`, `@Table(name = "category_audit_log")`
  - 字段: id (UUID), categoryId (UUID), action (ENUM: DELETE, BATCH_SORT), beforeData (String/JSONB), afterData (String/JSONB), affectedProductCount, operatorId, operatorName, createdAt
  - JPA 映射: `@Enumerated(EnumType.STRING)` for action, `@Type(JsonBinaryType.class)` for JSONB
  - **@spec O002-miniapp-menu-config**

- [ ] **T008** 修改 `ChannelProductConfig` 实体
  - 路径: `backend/src/main/java/com/cinema/product/entity/ChannelProductConfig.java`
  - 变更: 添加 `categoryId` (UUID) 字段
  - 添加: `@ManyToOne @JoinColumn(name = "category_id")` 关联到 `MenuCategory`
  - 保留: `channelCategory` 枚举字段（迁移期间向后兼容，24h 后废弃）
  - **@spec O002-miniapp-menu-config**

### Repository Layer

- [ ] **T009** [P] 创建 `MenuCategoryRepository` 接口
  - 路径: `backend/src/main/java/com/cinema/category/repository/MenuCategoryRepository.java`
  - 继承: `JpaRepository<MenuCategory, UUID>`
  - 方法: `Optional<MenuCategory> findByCode(String code)`, `List<MenuCategory> findAllByIsVisibleTrueOrderBySortOrderAsc()`, `Optional<MenuCategory> findByIsDefaultTrue()`, `List<MenuCategory> findAllByOrderBySortOrderAsc()`
  - **@spec O002-miniapp-menu-config**

- [ ] **T010** [P] 创建 `CategoryAuditLogRepository` 接口
  - 路径: `backend/src/main/java/com/cinema/category/repository/CategoryAuditLogRepository.java`
  - 继承: `JpaRepository<CategoryAuditLog, UUID>`
  - 方法: `List<CategoryAuditLog> findByCategoryIdOrderByCreatedAtDesc(UUID categoryId)`
  - **@spec O002-miniapp-menu-config**

### DTO Layer

- [ ] **T011** [P] 创建分类 DTO 类
  - 路径: `backend/src/main/java/com/cinema/category/dto/MenuCategoryDTO.java`
  - 字段: id, code, displayName, sortOrder, isVisible, isDefault, iconUrl, description, productCount (transient), version, createdAt, updatedAt
  - **@spec O002-miniapp-menu-config**

- [ ] **T012** [P] 创建分类请求 DTO
  - 路径: `backend/src/main/java/com/cinema/category/dto/CategoryCreateRequest.java`
  - 字段: code (validation: uppercase, letters/numbers/_), displayName (max 50 chars), sortOrder, isVisible, iconUrl (URL validation), description
  - 注解: `@NotBlank`, `@Pattern`, `@Size`, `@URL`
  - **@spec O002-miniapp-menu-config**

- [ ] **T013** [P] 创建分类更新 DTO
  - 路径: `backend/src/main/java/com/cinema/category/dto/CategoryUpdateRequest.java`
  - 字段: displayName, sortOrder, isVisible, iconUrl, description, **version** (required for optimistic locking)
  - **@spec O002-miniapp-menu-config**

- [ ] **T014** [P] 创建批量排序 DTO
  - 路径: `backend/src/main/java/com/cinema/category/dto/BatchSortRequest.java`
  - 字段: `List<CategorySortItem>` (inner class: categoryId, sortOrder)
  - **@spec O002-miniapp-menu-config**

### Exception Handling

- [ ] **T015** [P] 创建分类异常类
  - 路径: `backend/src/main/java/com/cinema/category/exception/CategoryNotFoundException.java`
  - 错误码: `CAT_NTF_001`
  - HTTP 状态: 404
  - **@spec O002-miniapp-menu-config**

- [ ] **T016** [P] 创建默认分类异常类
  - 路径: `backend/src/main/java/com/cinema/category/exception/DefaultCategoryException.java`
  - 错误码: `CAT_BIZ_001` (删除默认分类), `CAT_BIZ_002` (隐藏默认分类)
  - HTTP 状态: 422
  - **@spec O002-miniapp-menu-config**

---

## Phase 3: Data Migration (US5 - P1, 阻塞其他 US)

**Goal**: 执行 enum → table 数据迁移，确保零数据丢失

### Migration Scripts

- [ ] **T017** [US5] 创建数据迁移脚本（枚举 → 表）
  - 路径: `backend/src/main/resources/db/migration/V003__migrate_channel_category_data.sql`
  - 步骤:
    1. INSERT INTO menu_category 6 个分类（ALCOHOL, COFFEE, BEVERAGE, SNACK, MEAL, OTHER）
    2. 设置 OTHER 为 `is_default=true`
    3. UPDATE channel_product_config SET category_id = (SELECT id FROM menu_category WHERE code = channel_category)
    4. 处理 NULL 值：UPDATE channel_product_config SET category_id = (SELECT id FROM menu_category WHERE is_default=true) WHERE category_id IS NULL
  - 幂等性检查: `WHERE NOT EXISTS (SELECT 1 FROM menu_category WHERE code = 'ALCOHOL')`
  - **@spec O002-miniapp-menu-config**

- [ ] **T018** [US5] 添加 `category_id` 外键约束
  - 路径: 在 V003 脚本末尾添加
  - SQL: `ALTER TABLE channel_product_config ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES menu_category(id)`
  - **@spec O002-miniapp-menu-config**

- [ ] **T019** [US5] 创建紧急回滚脚本（24h 内使用）
  - 路径: `backend/src/main/resources/db/migration/R001__rollback_to_enum.sql`
  - 步骤:
    1. UPDATE channel_product_config SET channel_category = (SELECT code FROM menu_category WHERE id = category_id)
    2. ALTER TABLE channel_product_config DROP CONSTRAINT fk_category
    3. ALTER TABLE channel_product_config DROP COLUMN category_id
    4. DROP TABLE category_audit_log
    5. DROP TABLE menu_category
  - 注释: 仅在迁移后 24h 内发现严重数据丢失时使用，需停机验证
  - **@spec O002-miniapp-menu-config**

### Migration Validation

- [ ] **T020** [US5] 编写迁移验证单元测试
  - 路径: `backend/src/test/java/com/cinema/category/migration/MigrationValidationTest.java`
  - 验证点:
    - 6 个分类记录全部创建
    - OTHER 分类 `is_default=true`
    - 所有商品 `category_id` 非空
    - 商品数量迁移前后一致
    - 外键约束正常工作
  - **@spec O002-miniapp-menu-config**

---

## Phase 4: US1 - Admin CRUD (P1)

**Goal**: 管理员可以创建、编辑、删除分类

### Service Layer

- [ ] **T021** [US1] 创建 `MenuCategoryService` 核心业务逻辑
  - 路径: `backend/src/main/java/com/cinema/category/service/MenuCategoryService.java`
  - 方法:
    - `List<MenuCategoryDTO> findAll()` - 查询所有分类（包含商品数量）
    - `MenuCategoryDTO findById(UUID id)` - 查询单个分类
    - `MenuCategoryDTO create(CategoryCreateRequest request)` - 创建分类，校验 code 唯一性
    - `MenuCategoryDTO update(UUID id, CategoryUpdateRequest request)` - 更新分类，处理 @Version 冲突
    - `void delete(UUID id)` - 删除分类，商品重分配到默认分类
    - `void updateVisibility(UUID id, boolean isVisible)` - 切换可见性（防止隐藏默认分类）
    - `void batchSort(BatchSortRequest request)` - 批量排序
  - 乐观锁处理: catch `OptimisticLockingFailureException` 返回 409 Conflict
  - **@spec O002-miniapp-menu-config**

- [ ] **T022** [US1] 创建 `CategoryAuditService` 审计日志服务
  - 路径: `backend/src/main/java/com/cinema/category/service/CategoryAuditService.java`
  - 方法:
    - `void logDelete(UUID categoryId, MenuCategory before, int affectedProductCount, String operatorId)`
    - `void logBatchSort(List<MenuCategory> before, List<MenuCategory> after, String operatorId)`
  - 仅记录 DELETE 和 BATCH_SORT 操作
  - **@spec O002-miniapp-menu-config**

### Controller Layer

- [ ] **T023** [US1] 创建 `MenuCategoryController` Admin API
  - 路径: `backend/src/main/java/com/cinema/category/controller/MenuCategoryController.java`
  - 端点:
    - `GET /api/admin/menu-categories` - 获取所有分类（含商品数量）
    - `GET /api/admin/menu-categories/{id}` - 获取单个分类
    - `POST /api/admin/menu-categories` - 创建分类
    - `PUT /api/admin/menu-categories/{id}` - 更新分类
    - `DELETE /api/admin/menu-categories/{id}` - 删除分类
    - `PATCH /api/admin/menu-categories/{id}/visibility` - 切换可见性
    - `PUT /api/admin/menu-categories/batch-sort` - 批量排序
  - 响应格式: 统一 `ApiResponse<T>` 封装
  - 错误处理: DefaultCategoryException (422), CategoryNotFoundException (404), OptimisticLockingFailure (409)
  - **@spec O002-miniapp-menu-config**

### Business Logic Tests

- [ ] **T024** [US1] 编写分类删除业务逻辑测试
  - 路径: `backend/src/test/java/com/cinema/category/service/MenuCategoryServiceTest.java`
  - 测试场景:
    - 删除无商品分类 → 成功删除
    - 删除有商品分类 → 商品重分配到默认分类 + 审计日志记录
    - 删除默认分类 → 抛出 DefaultCategoryException
    - 并发删除同一分类 → 乐观锁冲突 OptimisticLockingFailureException
  - 覆盖率目标: 100%（关键业务逻辑）
  - **@spec O002-miniapp-menu-config**

- [ ] **T025** [US1] 编写分类创建/更新测试
  - 路径: `backend/src/test/java/com/cinema/category/service/MenuCategoryServiceTest.java`
  - 测试场景:
    - 创建分类成功 → code 唯一性校验通过
    - 创建重复 code → 抛出异常
    - 更新分类成功 → version 自动递增
    - 并发更新同一分类 → 乐观锁冲突 OptimisticLockingFailureException
  - **@spec O002-miniapp-menu-config**

---

## Phase 5: US2 - C端分类 API (P1)

**Goal**: 小程序动态获取分类列表（替代硬编码枚举）

### Client API Controller

- [ ] **T026** [US2] 创建 `ClientMenuCategoryController` C端 API
  - 路径: `backend/src/main/java/com/cinema/category/controller/ClientMenuCategoryController.java`
  - 端点: `GET /api/client/menu-categories`
  - 查询条件: `is_visible=true`, 排序: `sort_order ASC`
  - 返回字段: id, code, displayName, sortOrder, iconUrl, description, productCount
  - 性能优化: 使用 JOIN FETCH 一次查询获取商品数量（避免 N+1 问题）
  - 响应格式: `ApiResponse<List<MenuCategoryDTO>>`
  - **@spec O002-miniapp-menu-config**

### C端 Taro 集成

- [ ] **T027** [US2] 创建 C端分类类型定义
  - 路径: `hall-reserve-taro/src/types/category.ts`
  - 接口: `MenuCategory { id, code, displayName, sortOrder, iconUrl, description, productCount }`
  - **@spec O002-miniapp-menu-config**

- [ ] **T028** [US2] 创建 C端分类 API Service
  - 路径: `hall-reserve-taro/src/services/category.ts`
  - 函数: `fetchMenuCategories(): Promise<MenuCategory[]>`
  - 使用 TanStack Query: `useQuery({ queryKey: ['menu-categories'], queryFn: fetchMenuCategories, staleTime: 0 })` (无缓存，实时请求)
  - **@spec O002-miniapp-menu-config**

- [ ] **T029** [US2] 更新小程序菜单组件使用动态分类
  - 路径: `hall-reserve-taro/src/pages/menu/index.tsx`（假设路径）
  - 移除硬编码 `ChannelCategory` 枚举映射
  - 使用 `useQuery(['menu-categories'])` 获取分类列表
  - 渲染分类 tabs/列表
  - **@spec O002-miniapp-menu-config**

---

## Phase 6: US6 - Products Filtered by Dynamic Category (P1)

**Goal**: 商品列表 API 支持 `categoryId` 参数，向后兼容 `category` 枚举参数

### Product API Enhancement

- [ ] **T030** [US6] 修改 `ChannelProductController` 商品列表 API
  - 路径: `backend/src/main/java/com/cinema/product/controller/ChannelProductController.java`
  - 端点: `GET /api/client/channel-products/mini-program`
  - 新增参数: `@RequestParam(required = false) UUID categoryId`
  - 保留参数: `@RequestParam(required = false) String category` (枚举 code, 向后兼容)
  - 优先级: `categoryId` 优先，如果都提供则忽略 `category`
  - 查询逻辑: `WHERE category_id = :categoryId` 或 `WHERE category_id = (SELECT id FROM menu_category WHERE code = :category)`
  - **@spec O002-miniapp-menu-config**

- [ ] **T031** [US6] 修改 `ChannelProductService` 商品查询逻辑
  - 路径: `backend/src/main/java/com/cinema/product/service/ChannelProductService.java`
  - 方法: `List<ChannelProductDTO> findByCategory(UUID categoryId, String categoryCode)`
  - 逻辑: 先查询 categoryId，如果为空则通过 code 查询分类
  - **@spec O002-miniapp-menu-config**

- [ ] **T032** [US6] 修改商品 DTO 包含分类信息
  - 路径: `backend/src/main/java/com/cinema/product/dto/ChannelProductDTO.java`
  - 新增字段: `CategoryInfo category { id, code, displayName }`
  - 移除: 直接暴露 `channelCategory` 枚举（改为嵌套对象）
  - **@spec O002-miniapp-menu-config**

### API Tests

- [ ] **T033** [US6] 编写商品筛选 API 测试
  - 路径: `backend/src/test/java/com/cinema/product/controller/ChannelProductControllerTest.java`
  - 测试场景:
    - `GET /api/client/channel-products/mini-program?categoryId=uuid-xxx` → 返回匹配商品
    - `GET /api/client/channel-products/mini-program?category=COFFEE` → 返回咖啡分类商品（向后兼容）
    - 同时提供 `categoryId` 和 `category` → `categoryId` 优先
    - 提供不存在的 `categoryId` → 返回空列表或 404
  - **@spec O002-miniapp-menu-config**

---

## Phase 7: US3 - Admin Reorders Menu Categories (P2)

**Goal**: 管理员拖拽排序分类，拖拽结束立即保存

### B端组件开发

- [ ] **T034** [US3] 创建 Zod 分类验证 Schema
  - 路径: `frontend/src/schemas/category.schema.ts`
  - Schema: `categoryCreateSchema`, `categoryUpdateSchema`, `batchSortSchema`
  - 验证规则: code (uppercase, letters/numbers/_), displayName (max 50), sortOrder (integer), iconUrl (URL format)
  - **@spec O002-miniapp-menu-config**

- [ ] **T035** [US3] 创建分类 TypeScript 类型定义
  - 路径: `frontend/src/features/channel-products/menu-categories/types/category.types.ts`
  - 接口: `MenuCategory`, `CategoryCreateRequest`, `CategoryUpdateRequest`, `BatchSortRequest`
  - **@spec O002-miniapp-menu-config**

- [ ] **T036** [US3] 创建分类 API Service
  - 路径: `frontend/src/features/channel-products/menu-categories/services/categoryService.ts`
  - 函数: `fetchCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`, `updateVisibility()`, `batchSort()`
  - **@spec O002-miniapp-menu-config**

- [ ] **T037** [US3] 创建分类 TanStack Query Hooks
  - 路径: `frontend/src/features/channel-products/menu-categories/hooks/useCategories.ts`
  - Hooks:
    - `useCategories()` - 查询分类列表
    - `useCreateCategory()` - 创建分类 mutation
    - `useUpdateCategory()` - 更新分类 mutation
    - `useDeleteCategory()` - 删除分类 mutation
    - `useBatchSort()` - 批量排序 mutation
    - `useToggleVisibility()` - 切换可见性 mutation
  - 缓存失效: mutation onSuccess 后 `invalidateQueries(['menu-categories'])`
  - **@spec O002-miniapp-menu-config**

- [ ] **T038** [US3] 创建可拖拽分类列表组件（@dnd-kit/sortable）
  - 路径: `frontend/src/features/channel-products/menu-categories/components/CategoryList.tsx`
  - 使用库: `@dnd-kit/core` (DndContext), `@dnd-kit/sortable` (SortableContext, useSortable)
  - 功能:
    - Ant Design Table 结合 sortable rows
    - 拖拽结束事件: `onDragEnd` → 重新计算 `sortOrder` → 调用 `batchSort()` mutation
    - 显示拖拽手柄图标（DragHandleOutlined）
    - 显示加载状态（拖拽保存期间禁用拖拽）
    - 成功提示: `message.success('排序已保存')`
  - **@spec O002-miniapp-menu-config**

- [ ] **T039** [US3] 实现表格内嵌可见性开关
  - 路径: `frontend/src/features/channel-products/menu-categories/components/CategoryList.tsx` (可见性列)
  - 组件: `<Switch checked={record.isVisible} onChange={() => toggleVisibility.mutate({ id: record.id, isVisible: !record.isVisible })} />`
  - 禁用默认分类开关: `disabled={record.isDefault}` + Tooltip "默认分类不可隐藏"
  - 加载状态: Switch loading prop 绑定 mutation isPending
  - **@spec O002-miniapp-menu-config**

---

## Phase 8: US4 - Admin Sets Category Visibility (P2)

**Goal**: 管理员切换分类可见性（已在 Phase 7 实现）

- [ ] **T040** [US4] 验证可见性切换功能完整性
  - 检查点:
    - Switch 开关点击立即调用 API
    - 默认分类禁用切换（disabled + tooltip）
    - 切换成功后刷新列表
    - 切换失败显示错误提示
  - 无需新增任务（已在 T039 实现）
  - **@spec O002-miniapp-menu-config**

---

## Phase 9: US7 - Admin Sets Category Icons and Descriptions (P3)

**Goal**: 管理员设置分类图标和描述（表单增强）

### Form Components

- [ ] **T041** [US7] 创建分类创建/编辑表单组件
  - 路径: `frontend/src/features/channel-products/menu-categories/components/CategoryForm.tsx`
  - 使用: React Hook Form + Zod resolver
  - 表单字段:
    - 分类编码 (TextInput, disabled on edit, required, pattern validation)
    - 显示名称 (TextInput, required, max 50 chars)
    - 排序权重 (NumberInput, auto-filled with max+10 on create)
    - 是否可见 (Switch)
    - 图标URL (TextInput, optional, URL validation, placeholder: "https://cdn.example.com/icon.png")
    - 描述 (TextArea, optional, rows=4)
  - 错误处理: 显示服务器端验证错误 (setError from react-hook-form)
  - 乐观锁冲突: catch 409 错误 → 提示 "数据已被其他用户修改，请刷新后重试"
  - **@spec O002-miniapp-menu-config**

- [ ] **T042** [US7] 创建分类创建页面
  - 路径: `frontend/src/features/channel-products/menu-categories/pages/MenuCategoryFormPage.tsx`
  - 路由: `/channel-products/menu-categories/create`
  - 页面布局: PageHeader + Card + CategoryForm
  - 提交: `createCategory.mutate()` → 成功后跳转到列表页
  - **@spec O002-miniapp-menu-config**

- [ ] **T043** [US7] 创建分类编辑页面
  - 路径: `frontend/src/features/channel-products/menu-categories/pages/MenuCategoryFormPage.tsx` (复用)
  - 路由: `/channel-products/menu-categories/:id/edit`
  - 页面布局: PageHeader + Card + CategoryForm (预填充数据)
  - 提交: `updateCategory.mutate()` → 成功后跳转到列表页
  - **@spec O002-miniapp-menu-config**

- [ ] **T044** [US7] 创建删除确认对话框组件
  - 路径: `frontend/src/features/channel-products/menu-categories/components/DeleteConfirmModal.tsx`
  - 功能:
    - 显示分类名称
    - 显示商品数量（如果有）: "删除后，15 个商品将移动到 '其他商品' 分类"
    - 确认/取消按钮
    - 禁止删除默认分类（Modal 不应该出现，按钮已禁用）
  - **@spec O002-miniapp-menu-config**

---

## Phase 10: Polish & Integration

**Goal**: 最终集成、文档完善、端到端验证

### Navigation & Routing

- [ ] **T045** 添加 "O002-菜单分类" 菜单项到 B端导航
  - 路径: `frontend/src/components/layout/AppLayout.tsx`
  - 位置: "渠道商品配置" section 下
  - 菜单项:
    ```typescript
    {
      key: '/channel-products/menu-categories',
      icon: <AppstoreOutlined />,
      label: 'O002-菜单分类',
    }
    ```
  - **@spec O002-miniapp-menu-config**

- [ ] **T046** 配置 B端路由
  - 路径: `frontend/src/App.tsx` (或路由配置文件)
  - 路由:
    - `/channel-products/menu-categories` → `MenuCategoryListPage`
    - `/channel-products/menu-categories/create` → `MenuCategoryFormPage` (mode=create)
    - `/channel-products/menu-categories/:id/edit` → `MenuCategoryFormPage` (mode=edit)
  - **@spec O002-miniapp-menu-config**

- [ ] **T047** 创建分类列表主页面
  - 路径: `frontend/src/features/channel-products/menu-categories/pages/MenuCategoryListPage.tsx`
  - 页面布局:
    - PageHeader (title: "菜单分类配置", extra: "新增分类" Button)
    - CategoryList component (拖拽表格)
  - **@spec O002-miniapp-menu-config**

### OpenAPI Contracts

- [ ] **T048** 生成 OpenAPI 3.0 规范文档
  - 路径: `specs/O002-miniapp-menu-config/contracts/api.yaml`
  - 端点:
    - Admin API: 7 个端点（CRUD + visibility + batch sort）
    - Client API: 1 个端点（GET /api/client/menu-categories）
    - Product API: 1 个端点（增强 categoryId 参数）
  - Schemas: MenuCategory, CategoryCreateRequest, CategoryUpdateRequest, BatchSortRequest
  - Validation rules: 与 Zod schema 保持一致
  - **@spec O002-miniapp-menu-config**

- [ ] **T049** 后端集成 OpenAPI 验证（可选）
  - 使用 SpringDoc OpenAPI 或手动实现验证逻辑
  - 确保后端验证规则与 `contracts/api.yaml` 一致
  - **@spec O002-miniapp-menu-config**

### Documentation

- [ ] **T050** 生成数据模型文档
  - 路径: `specs/O002-miniapp-menu-config/data-model.md`
  - 内容: MenuCategory 实体、CategoryAuditLog 实体、ER 图、迁移脚本说明
  - **@spec O002-miniapp-menu-config**

- [ ] **T051** 生成快速入门文档
  - 路径: `specs/O002-miniapp-menu-config/quickstart.md`
  - 内容:
    - 环境准备（JDK 17, Node.js, Supabase）
    - 运行迁移脚本: `./mvnw flyway:migrate`
    - 启动后端: `./mvnw spring-boot:run`
    - 启动 B端: `npm run dev`
    - 启动 C端: `npm run dev:h5` (Taro)
    - 常见问题排查
  - **@spec O002-miniapp-menu-config**

### End-to-End Verification

- [ ] **T052** 执行端到端功能验证
  - 验证场景:
    - [x] US1: 管理员创建/编辑/删除分类
    - [x] US2: 小程序动态获取分类列表
    - [x] US3: 管理员拖拽排序分类
    - [x] US4: 管理员切换分类可见性
    - [x] US5: 数据迁移成功，无数据丢失
    - [x] US6: 商品列表按分类筛选
    - [x] US7: 管理员设置图标和描述
  - 性能验证:
    - API P95 响应时间 ≤ 1s
    - B端拖拽排序反馈 <200ms
    - C端分类加载 <1s
  - **@spec O002-miniapp-menu-config**

- [ ] **T053** 验证向后兼容性
  - 测试旧版小程序使用 `?category=COFFEE` 参数仍能正常筛选商品
  - 验证 6 个月过渡期内两种参数都可用
  - **@spec O002-miniapp-menu-config**

- [ ] **T054** 生成验收测试报告
  - 路径: `specs/O002-miniapp-menu-config/acceptance-test-report.md`
  - 内容: 7 个用户故事的验收场景测试结果、性能指标、边界用例测试
  - **@spec O002-miniapp-menu-config**

---

## Success Criteria Checklist

以下成功指标必须在部署前达成：

- [ ] **SC-001**: Admin 创建新分类后，5 秒内小程序可见该分类
- [ ] **SC-002**: 6 个 ChannelCategory 枚举值 100% 迁移到 menu_category 表
- [ ] **SC-003**: 所有商品 category_id 非空，无孤立商品
- [ ] **SC-004**: 小程序加载 50 个分类耗时 <1 秒
- [ ] **SC-005**: 100% 现有小程序用户迁移后无中断
- [ ] **SC-006**: Admin 批量排序 10 个分类耗时 <30 秒
- [ ] **SC-007**: 分类配置变更后 5 秒内新会话可见
- [ ] **SC-008**: 零用户投诉分类显示或筛选问题
- [ ] **SC-009**: 100% 商品筛选准确性（categoryId 和 category 参数）
- [ ] **SC-010**: 向后兼容 API 保留 6 个月

---

## Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Entities/DTOs) → Phase 3 (Migration)
                                              ↓
Phase 4 (US1 Admin CRUD) ← Phase 3 ────────→ Phase 5 (US2 C端API)
                                              ↓
                                           Phase 6 (US6 商品筛选)
                                              ↓
Phase 7 (US3 排序) ← Phase 4 ────────────→ Phase 8 (US4 可见性)
                                              ↓
Phase 9 (US7 图标描述) ← Phase 7 ─────────→ Phase 10 (集成验证)
```

**并行执行建议**:
- Phase 2 的 T006-T016 可并行开发（不同开发者）
- Phase 4 的 Service (T021-T022) 和 Phase 5 的 Client API (T026) 可并行
- Phase 7 的前端组件 (T034-T039) 可并行开发
- Phase 9 的表单组件 (T041-T044) 可并行开发

---

## Notes

- **乐观锁冲突处理**: 所有更新操作需捕获 `OptimisticLockingFailureException`，返回 409 状态码，提示用户刷新重试
- **默认分类保护**: 删除和隐藏操作前必须检查 `is_default` 标志，抛出 `DefaultCategoryException`
- **审计日志策略**: 仅记录 DELETE 和 BATCH_SORT 操作，普通更新不记录（减少存储开销）
- **C端缓存策略**: TanStack Query `staleTime: 0`，无缓存，每次实时请求
- **迁移回滚窗口**: 24 小时内允许紧急回滚，需停机验证数据完整性

---

**Generated**: 2026-01-04 | **Spec**: O002-miniapp-menu-config | **Total Tasks**: 54

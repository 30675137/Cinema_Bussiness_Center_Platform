# Feature Specification: 小程序菜单分类动态配置

**Feature Branch**: `O002-miniapp-menu-config`
**Created**: 2026-01-03
**Updated**: 2026-01-04
**Status**: Draft
**Input**: 开发后端的菜单配置功能，为小程序的左侧边栏实现可配置。整合现有 `ChannelCategory` 枚举和新的 `menu_category` 表，实现完全动态的商品分类管理，使用 O007 目前小程序中的分类作为初始数据。

## 核心变更概述

本规格采用**方案二：完全动态分类整合**，将硬编码的 `ChannelCategory` 枚举迁移到数据库表，实现：

1. **统一分类来源**: `menu_category` 表成为分类的唯一数据源
2. **商品关联变更**: `channel_product_config.channel_category` 枚举字段改为 `category_id` 外键
3. **新增分类 API**: 小程序从 API 动态获取分类列表，不再使用前端硬编码映射
4. **向后兼容**: 商品列表 API 同时支持 `categoryId` 和 `category` 参数

---

## User Scenarios & Testing

### User Story 1 - Admin Configures Menu Categories (Priority: P1)

**Cinema operations manager needs to configure product categories (menu items) for the mini-program so customers can browse products by category.**

**Why this priority**: This is the core functionality that enables the entire menu system. Without configurable categories, the mini-program cannot display products in an organized manner. This directly impacts user experience and product discoverability.

**Independent Test**: Can be fully tested by creating/updating/deleting a category through the admin interface and verifying it appears/updates/disappears in the mini-program menu. Delivers immediate value by allowing flexible category management without code changes.

**Acceptance Scenarios**:

1. **Given** admin is logged into the management platform, **When** admin creates a new category (e.g., "季节限定") with code "SEASONAL", **Then** the category appears in the mini-program menu sidebar and products can be assigned to it
2. **Given** admin has existing categories, **When** admin updates a category display name (e.g., "咖啡" to "精品咖啡"), **Then** the mini-program immediately reflects the updated category name
3. **Given** admin has a category with no products, **When** admin deletes the category, **Then** it is removed from both admin system and mini-program menu
4. **Given** admin has a category "季节限定" with 15 products assigned, **When** admin deletes the category, **Then** system shows confirmation dialog indicating "15 products will be moved to '其他商品' category" and upon confirmation, all products are automatically reassigned to the default category
5. **Given** admin attempts to delete the default "其他商品" category (is_default=true), **Then** system prevents deletion and displays error message "默认分类不可删除"

---

### User Story 2 - Mini-Program Fetches Dynamic Categories (Priority: P1)

**Mini-program needs to fetch category list from API instead of using hardcoded frontend mapping, ensuring categories are always up-to-date.**

**Why this priority**: This is essential for the dynamic configuration system to work. Without this, even if backend allows category changes, the mini-program would still show outdated hardcoded categories.

**Independent Test**: Can be fully tested by calling the new category list API and verifying the response matches database configuration. Delivers real-time category synchronization.

**Acceptance Scenarios**:

1. **Given** mini-program loads the menu page, **When** it calls `GET /api/client/menu-categories`, **Then** it receives a list of visible categories sorted by `sortOrder`
2. **Given** admin has hidden a category, **When** mini-program fetches categories, **Then** the hidden category is not included in the response
3. **Given** admin has added a new category, **When** mini-program refreshes, **Then** the new category appears in the menu within 5 seconds
4. **Given** categories have icons configured, **When** mini-program displays the menu, **Then** each category shows its corresponding icon

---

### User Story 3 - Admin Reorders Menu Categories (Priority: P2)

**Cinema operations manager needs to adjust the display order of categories in the mini-program menu to highlight seasonal or promotional items.**

**Why this priority**: While core category management (P1) is essential, the ability to reorder provides important merchandising control. This allows business flexibility to promote certain product lines without restructuring the entire menu.

**Independent Test**: Can be fully tested by dragging category order in admin interface and verifying the mini-program displays categories in the new order. Delivers merchandising value independently from other features.

**Acceptance Scenarios**:

1. **Given** admin has multiple categories in the menu, **When** admin drags "季节限定" to the first position, **Then** the mini-program displays it as the first category tab
2. **Given** admin has reordered categories, **When** a customer opens the mini-program, **Then** categories appear in the configured order
3. **Given** admin has set custom ordering, **When** admin adds a new category, **Then** it appears at the end of the list by default and can be repositioned
4. **Given** admin uses batch sort API, **When** admin submits new sort order for all categories, **Then** all categories are reordered in a single operation

---

### User Story 4 - Admin Sets Category Visibility (Priority: P2)

**Cinema operations manager needs to temporarily hide certain categories (e.g., out-of-season items) without deleting them.**

**Why this priority**: This provides operational flexibility to manage seasonal inventory and promotional campaigns. It's less critical than basic category management but more important than advanced features like icons or descriptions.

**Independent Test**: Can be fully tested by toggling category visibility in admin interface and verifying it shows/hides in mini-program. Delivers inventory management value independently.

**Acceptance Scenarios**:

1. **Given** admin has a category "冰品" during winter, **When** admin sets it to "hidden" (is_visible=false), **Then** customers do not see it in the mini-program menu
2. **Given** admin has hidden a category, **When** admin re-enables it, **Then** it reappears in the mini-program at its configured position
3. **Given** a category is hidden, **When** admin views the category list, **Then** the hidden status is clearly indicated
4. **Given** admin attempts to hide the default category, **Then** system prevents the action and displays error message "默认分类不可隐藏"

---

### User Story 5 - System Migrates Existing ChannelCategory Data (Priority: P1)

**System needs to automatically migrate existing `ChannelCategory` enum values and product associations to the new `menu_category` table without data loss.**

**Why this priority**: This is critical for deployment success. Without proper migration, existing mini-program functionality will break and customers will lose access to products. Must be tested before any production deployment.

**Independent Test**: Can be fully tested by running migration script against test database and verifying all categories and products are preserved with correct relationships. Delivers deployment readiness.

**Acceptance Scenarios**:

1. **Given** O007 system has `ChannelCategory` enum values (ALCOHOL, COFFEE, BEVERAGE, SNACK, MEAL, OTHER), **When** migration script runs, **Then** all categories are created in the `menu_category` table with correct Chinese labels:
   - ALCOHOL → "经典特调"
   - COFFEE → "精品咖啡"
   - BEVERAGE → "经典饮品"
   - SNACK → "主厨小食"
   - MEAL → "精品餐食"
   - OTHER → "其他商品" (is_default=true)
2. **Given** existing products have `channel_category` enum values, **When** migration completes, **Then** all products have valid `category_id` foreign keys pointing to the corresponding `menu_category` records
3. **Given** migration has completed, **When** mini-program fetches menu data via new API, **Then** it displays the same categories as before migration with no disruption to users
4. **Given** some products have no category, **When** migration runs, **Then** those products are assigned to the default "其他商品" category

---

### User Story 6 - Products Filtered by Dynamic Category (Priority: P1)

**Mini-program needs to filter products by category using the new `category_id` field while maintaining backward compatibility with the old `category` parameter.**

**Why this priority**: This ensures existing mini-program code continues to work during the migration period while allowing new code to use the improved category system.

**Independent Test**: Can be fully tested by calling the product list API with both `categoryId` and `category` parameters and verifying correct filtering. Delivers seamless transition.

**Acceptance Scenarios**:

1. **Given** mini-program calls `GET /api/client/channel-products/mini-program?categoryId=uuid-xxx`, **When** API processes the request, **Then** only products with matching `category_id` are returned
2. **Given** mini-program calls `GET /api/client/channel-products/mini-program?category=COFFEE`, **When** API processes the request, **Then** only products whose category has `code=COFFEE` are returned (backward compatible)
3. **Given** both `categoryId` and `category` parameters are provided, **When** API processes the request, **Then** `categoryId` takes precedence
4. **Given** product list is returned, **When** response includes `category` object, **Then** it contains `id`, `code`, and `displayName` for frontend display

---

### User Story 7 - Admin Sets Category Icons and Descriptions (Priority: P3)

**Cinema operations manager wants to add visual icons and descriptions to categories to improve menu clarity.**

**Why this priority**: This is a nice-to-have enhancement that improves user experience but is not essential for core functionality. Can be added after basic category management is stable.

**Independent Test**: Can be fully tested by uploading an icon and description for a category and verifying it displays in mini-program. Delivers UX polish independently from other features.

**Acceptance Scenarios**:

1. **Given** admin is editing a category, **When** admin uploads an icon image, **Then** the icon URL is saved and displays next to the category name in the mini-program menu
2. **Given** admin has set a category description, **When** category is returned via API, **Then** description is included in the response

---

### Edge Cases

- What happens when admin deletes a category while products from that category are currently in customer shopping carts? (Expected: Products remain in cart with updated category reference to default, cart functionality unaffected)
- What happens when the default category already has many products and admin deletes another category with hundreds of products? (Expected: All products migrate successfully, performance impact acceptable)
- How does the system handle concurrent category updates from multiple admin users? (Expected: Optimistic locking with @Version field detects conflicts; user receives error message prompting refresh and retry; no data corruption)
- What happens when the mini-program API request fails during category data fetch? (Expected: Show error state with retry button; no cached data fallback since caching is disabled for real-time accuracy)
- How does the system handle category names that exceed maximum character limits? (Expected: Validation rejects the request with clear error message)
- What happens when an admin tries to create a duplicate category code? (Expected: System rejects with "分类编码已存在" error)
- What happens if admin tries to hide or delete the default category? (Expected: System prevents with clear error message)
- What happens when migration finds products with invalid `channel_category` values? (Expected: Assign to default category and log warning)
- What happens when API is called with non-existent `categoryId`? (Expected: Return empty list or 404 depending on endpoint design)

---

## Clarifications

### Session 2026-01-04

- Q: 分类列表页应该采用什么样的表格交互模式？ → A: 标准 Ant Design 表格 + 独立表单页（编辑按钮跳转到独立表单页，适合复杂表单和验证）
- Q: 拖拽排序后的保存时机是什么？ → A: 拖拽结束立即保存（调用批量排序 API，显示加载状态和成功提示）
- Q: 可见性切换的操作方式是什么？ → A: 表格内嵌 Switch 开关（可见性列包含状态徽章 + 开关，点击立即切换并保存）
- Q: 拖拽排序功能使用什么拖拽库？ → A: @dnd-kit/sortable（现代化、性能好、维护活跃、与 Ant Design 兼容性好）
- Q: 菜单标签的显示格式是什么？ → A: O002-菜单分类（显示 spec ID 前缀，便于开发人员快速识别功能模块）
- Q: 当多个管理员同时编辑同一个分类时，系统应该采用哪种并发控制策略？ → A: 乐观锁（Optimistic Locking）- 使用 @Version 字段检测冲突，冲突时提示用户刷新重试
- Q: 小程序获取分类列表时，应该采用什么样的缓存策略？ → A: 无缓存（每次都实时请求 API，确保数据绝对实时）
- Q: 分类审计日志应该采用什么样的保留策略？ → A: 仅记录关键操作 + 简化存储（只记录删除、批量排序等关键变更，普通更新如名称修改、可见性切换不记录，最小化存储开销）
- Q: 前后端表单验证应该采用什么样的同步策略？ → A: Zod + OpenAPI 生成（前端使用 Zod schema 定义验证规则，后端通过 OpenAPI 规范 contracts/api.yaml 生成对应验证逻辑，确保前后端验证一致）
- Q: 数据迁移回滚应该在什么条件下触发？回滚流程应该如何执行？ → A: 24h 内紧急回滚 + 停机验证（仅当迁移后 24 小时内发现严重数据丢失或业务中断时允许回滚，需要停机维护，执行完整数据验证后才能恢复服务）

---

## Requirements

### Functional Requirements

**Category Management (B端)**

- **FR-001**: System MUST provide a backend API to create, read, update, and delete menu categories via `/api/admin/menu-categories`
- **FR-002**: System MUST store category configuration including: `code` (unique identifier), `display_name` (Chinese label), `sort_order` (display priority), `is_visible` (enabled/disabled), `is_default` (permanent category flag), `icon_url` (optional), and `description` (optional)
- **FR-003**: Admin users MUST be able to manage categories through a dedicated management interface
- **FR-004**: System MUST enforce unique category codes within the system (case-insensitive, format: uppercase letters, numbers, underscores, starting with letter)
- **FR-005**: System MUST validate category `display_name` length (minimum 1 character, maximum 50 characters)
- **FR-006**: System MUST support reordering categories through batch sort API (`PUT /api/admin/menu-categories/batch-sort`)
- **FR-007**: System MUST allow toggling category visibility via `PATCH /api/admin/menu-categories/{id}/visibility` without deleting the category or its product associations
- **FR-008**: System MUST automatically reassign all products to the default category when their assigned category is deleted
- **FR-009**: System MUST designate one category as `is_default=true` that cannot be deleted or hidden (but can be renamed and reordered)
- **FR-010**: System MUST display a confirmation dialog when admin deletes a category with existing products, showing the count of products that will be moved
- **FR-011**: System MUST provide audit logging for critical category operations (delete, batch sort) in `category_audit_log` table; routine updates (display name, visibility, icon URL) are NOT logged to minimize storage overhead
- **FR-012**: System MUST support optional icon image URL with validation (accepted formats: PNG, JPG, WebP; valid URL format)
- **FR-012a**: System MUST use optimistic locking (@Version field) to detect concurrent edits; when update conflict occurs, system MUST return error response prompting user to refresh and retry

**Category API (C端)**

- **FR-013**: System MUST provide `GET /api/client/menu-categories` endpoint for mini-program to fetch visible categories in configured display order
- **FR-014**: Client category API MUST only return categories where `is_visible=true`, sorted by `sort_order` ascending
- **FR-015**: Client category API MUST include `productCount` for each category (count of ACTIVE products)
- **FR-016**: Mini-program MUST call category API to get dynamic category list instead of using hardcoded frontend mapping
- **FR-016a**: Mini-program MUST NOT cache category data locally; MUST fetch fresh data from API on every page load to ensure real-time accuracy
- **FR-016b**: When category API request fails, mini-program MUST display error state with retry button; no cached fallback data

**Product-Category Integration**

- **FR-017**: System MUST modify `channel_product_config` table to use `category_id` (UUID FK) instead of `channel_category` (ENUM)
- **FR-018**: Product list API MUST support filtering by `categoryId` parameter (UUID, preferred)
- **FR-019**: Product list API MUST support filtering by `category` parameter (code string, backward compatible)
- **FR-020**: Product DTO MUST include nested `category` object with `id`, `code`, and `displayName`

**Data Migration**

- **FR-021**: System MUST provide migration script to create `menu_category` records from existing `ChannelCategory` enum values
- **FR-022**: Migration MUST map enum values to Chinese display names: ALCOHOL→"经典特调", COFFEE→"精品咖啡", BEVERAGE→"经典饮品", SNACK→"主厨小食", MEAL→"精品餐食", OTHER→"其他商品"
- **FR-023**: Migration MUST set "其他商品" (OTHER) as the default category (`is_default=true`)
- **FR-024**: Migration MUST update all `channel_product_config` records to set `category_id` based on their existing `channel_category` value
- **FR-025**: Migration MUST assign products with null/invalid `channel_category` to the default category
- **FR-026**: Migration MUST be idempotent (can be run multiple times safely)
- **FR-027**: System MUST provide rollback script to restore original enum-based structure if needed; rollback is ONLY permitted within 24 hours of migration completion and ONLY when severe data loss or business interruption is detected; rollback requires scheduled downtime and MUST include complete data integrity verification before service restoration

**Frontend Requirements (B端管理界面)**

- **FR-028**: System MUST add a "O002-菜单分类" menu item under "渠道商品配置" section in the admin platform navigation
- **FR-029**: Menu category list page MUST be accessible at route `/channel-products/menu-categories`
- **FR-030**: Category list page MUST use standard Ant Design Table component with separate form pages for create/edit operations
- **FR-031**: Category list table MUST display columns: 分类编码 (code), 显示名称 (display_name), 排序 (sort_order), 商品数量 (product count), 可见性 (status badge + inline Switch toggle that immediately calls `PATCH /api/admin/menu-categories/{id}/visibility` on change), 操作 (action buttons: Edit, Delete)
- **FR-032**: Category list page MUST support drag-and-drop row reordering using @dnd-kit/sortable library with visual feedback during drag operation and automatic save on drop (no manual save button required)
- **FR-033**: Category list page MUST include "新增分类" button in page header that navigates to `/channel-products/menu-categories/create`
- **FR-034**: Category create/edit form page MUST include fields: 分类编码 (text input, disabled on edit), 显示名称 (text input, required, max 50 chars), 排序权重 (number input, auto-filled with max+10 on create), 是否可见 (switch toggle), 图标URL (text input, optional, URL validation), 描述 (textarea, optional)
- **FR-035**: Category form MUST validate code format (uppercase letters, numbers, underscores only, must start with letter) on client side before submission
- **FR-036**: Category form MUST display server-side validation errors inline next to corresponding form fields
- **FR-037**: Category list table row actions MUST disable "删除" button for default category with tooltip "默认分类不可删除"
- **FR-038**: Category list table MUST disable visibility Switch for default category with tooltip "默认分类不可隐藏"
- **FR-039**: Drag-and-drop reorder operation MUST immediately call batch sort API (`PUT /api/admin/menu-categories/batch-sort`) on drop, display loading indicator during save, and show success message on completion
- **FR-040**: Category delete action MUST show confirmation modal with product count warning if category has associated products
- **FR-041**: System MUST use Zod schema for frontend form validation and maintain corresponding validation rules in `contracts/api.yaml` OpenAPI specification; backend validation logic MUST be generated from or aligned with the OpenAPI spec to ensure frontend-backend validation consistency

### Key Entities

- **Menu Category**: Represents a product category in the mini-program menu. Key attributes include:
  - `id`: Unique identifier (UUID)
  - `code`: Category code (unique, uppercase, e.g., "ALCOHOL", "COFFEE")
  - `display_name`: Chinese display label (e.g., "经典特调", "精品咖啡")
  - `sort_order`: Numeric sort priority (lower numbers appear first)
  - `is_visible`: Visibility status (boolean, default true)
  - `is_default`: Default category flag (boolean, only one can be true)
  - `icon_url`: Optional icon image URL
  - `description`: Optional description text
  - `version`: Optimistic locking version number (Long, auto-incremented by JPA @Version)
  - `created_at`, `updated_at`: Timestamps
  - `created_by`, `updated_by`: Admin user IDs
  - `deleted_at`: Soft delete timestamp

- **Channel Product Config (Modified)**: Represents a product configured for a sales channel. Modified attributes:
  - `category_id`: Foreign key to `menu_category.id` (replaces `channel_category` enum)
  - Other attributes unchanged

- **Category Audit Log**: Records critical category configuration changes. Key attributes:
  - `category_id`: Reference to the affected category
  - `action`: Operation type (DELETE, BATCH_SORT) - only critical operations are logged
  - `before_data`, `after_data`: JSON snapshots of category state
  - `affected_product_count`: Number of products impacted (for deletions)
  - `operator_id`, `operator_name`: Who made the change
  - `created_at`: When the change occurred

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can create a new category and see it reflected in the mini-program within 5 seconds
- **SC-002**: System successfully migrates all existing ChannelCategory enum values (6 categories) to the new system with zero data loss
- **SC-003**: System successfully migrates all product-category associations with zero orphaned products
- **SC-004**: Mini-program menu loading time remains under 1 second even with 50+ configured categories
- **SC-005**: 100% of existing mini-program users can continue browsing products by category without disruption after migration
- **SC-006**: Admin can reorder 10 categories in under 30 seconds using the batch sort API
- **SC-007**: Category configuration changes are visible to new mini-program sessions within 5 seconds
- **SC-008**: Zero customer-reported issues related to menu category display or product filtering after migration
- **SC-009**: Product list API correctly filters by both `categoryId` and `category` parameters with 100% accuracy
- **SC-010**: Backward compatible API (`?category=COFFEE`) continues to work for at least 6 months after deployment

---

## Assumptions

- The existing O007 `ChannelCategory` enum is the primary data source for initial category migration
- Admin users have appropriate permissions to manage menu configuration (role-based access control exists)
- Mini-program uses TanStack Query for API data fetching (caching disabled for category API to ensure real-time data)
- Category icons are hosted on Supabase Storage or CDN with public access
- The "其他商品" (OTHER) category will serve as the permanent default category
- Products reassigned to the default category during deletion will not affect customer shopping carts or active orders
- Multi-store support is out of scope (categories are global across all stores)
- Category localization (multiple languages) is out of scope (Chinese only)
- Category nesting (sub-categories) is out of scope (single-level hierarchy only)
- The old `channel_category` enum column will be retained for at least 24 hours after migration to support emergency rollback; permanent removal requires additional planning and stakeholder approval

---

## Dependencies

- **O007-miniapp-menu-api**: Current category enum values and display name mappings serve as initial data
- **O005-channel-product-config**: Product configuration table structure being modified
- **O006-miniapp-channel-order**: Product list and cart functionality must remain functional
- **Supabase database**: For storing category configuration and migration
- **Admin management platform**: Frontend interface for category management (B端)
- **Mini-program Taro application**: Frontend consumer of category configuration API (C端)
- **@dnd-kit/sortable**: React drag-and-drop library for table row reordering (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities required)

---

## Out of Scope

- Multi-language category names (only Chinese supported)
- Category nesting or hierarchical categories (only flat list)
- Category-specific pricing or promotions (handled by separate pricing system)
- Category-based access control (all categories visible to all users, visibility toggle only)
- Real-time live updates in already-opened mini-program sessions (requires page refresh/reopen)
- Category analytics or usage tracking (may be added in future iteration)
- Multi-store category configuration (categories are global)
- Category image upload through admin UI (icon URL must be provided directly)

---

## Related Documents

- [Data Model](./data-model.md) - Complete database schema and migration scripts
- [API Contract](./contracts/api.yaml) - OpenAPI 3.0 specification
- [O007 Spec](../O007-miniapp-menu-api/spec.md) - Current category implementation being replaced

# Feature Specification: 小程序菜单分类动态配置

**Feature Branch**: `O002-miniapp-menu-config`
**Created**: 2026-01-03
**Updated**: 2026-01-03
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
- How does the system handle concurrent category updates from multiple admin users? (Expected: Optimistic locking or last-write-wins, no data corruption)
- What happens when the mini-program API request fails during category data fetch? (Expected: Show cached data or error state with retry button)
- How does the system handle category names that exceed maximum character limits? (Expected: Validation rejects the request with clear error message)
- What happens when an admin tries to create a duplicate category code? (Expected: System rejects with "分类编码已存在" error)
- What happens if admin tries to hide or delete the default category? (Expected: System prevents with clear error message)
- What happens when migration finds products with invalid `channel_category` values? (Expected: Assign to default category and log warning)
- What happens when API is called with non-existent `categoryId`? (Expected: Return empty list or 404 depending on endpoint design)

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
- **FR-011**: System MUST provide audit logging for all category configuration changes (create, update, delete, reorder) in `category_audit_log` table
- **FR-012**: System MUST support optional icon image URL with validation (accepted formats: PNG, JPG, WebP; valid URL format)

**Category API (C端)**

- **FR-013**: System MUST provide `GET /api/client/menu-categories` endpoint for mini-program to fetch visible categories in configured display order
- **FR-014**: Client category API MUST only return categories where `is_visible=true`, sorted by `sort_order` ascending
- **FR-015**: Client category API MUST include `productCount` for each category (count of ACTIVE products)
- **FR-016**: Mini-program MUST call category API to get dynamic category list instead of using hardcoded frontend mapping

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
- **FR-027**: System MUST provide rollback script to restore original enum-based structure if needed

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
  - `created_at`, `updated_at`: Timestamps
  - `created_by`, `updated_by`: Admin user IDs
  - `deleted_at`: Soft delete timestamp

- **Channel Product Config (Modified)**: Represents a product configured for a sales channel. Modified attributes:
  - `category_id`: Foreign key to `menu_category.id` (replaces `channel_category` enum)
  - Other attributes unchanged

- **Category Audit Log**: Records all category configuration changes. Key attributes:
  - `category_id`: Reference to the affected category
  - `action`: Operation type (CREATE, UPDATE, DELETE, REORDER)
  - `before_data`, `after_data`: JSON snapshots
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
- Mini-program has TanStack Query infrastructure for API data fetching and caching
- Category icons are hosted on Supabase Storage or CDN with public access
- The "其他商品" (OTHER) category will serve as the permanent default category
- Products reassigned to the default category during deletion will not affect customer shopping carts or active orders
- Multi-store support is out of scope (categories are global across all stores)
- Category localization (multiple languages) is out of scope (Chinese only)
- Category nesting (sub-categories) is out of scope (single-level hierarchy only)
- The old `channel_category` enum column will be retained for rollback capability during transition period

---

## Dependencies

- **O007-miniapp-menu-api**: Current category enum values and display name mappings serve as initial data
- **O005-channel-product-config**: Product configuration table structure being modified
- **O006-miniapp-channel-order**: Product list and cart functionality must remain functional
- **Supabase database**: For storing category configuration and migration
- **Admin management platform**: Frontend interface for category management (B端)
- **Mini-program Taro application**: Frontend consumer of category configuration API (C端)

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

# Feature Specification: Mini-Program Menu Configuration

**Feature Branch**: `O001-miniapp-menu-config`
**Created**: 2026-01-03
**Status**: Draft
**Input**: User description: "开发后端的菜单配置功能 为小程序的左侧边栏实现可配置，需要考虑 现有的功能 小程序商品（选择分类的时候就是菜单） 同时需要考虑 O007目前小程序中的分类 作为初始数据"

## User Scenarios & Testing

### User Story 1 - Admin Configures Menu Categories (Priority: P1)

**Cinema operations manager needs to configure product categories (menu items) for the mini-program so customers can browse beverages by category.**

**Why this priority**: This is the core functionality that enables the entire menu system. Without configurable categories, the mini-program cannot display products in an organized manner. This directly impacts user experience and product discoverability.

**Independent Test**: Can be fully tested by creating/updating/deleting a category through the admin interface and verifying it appears/updates/disappears in the mini-program menu. Delivers immediate value by allowing flexible category management without code changes.

**Acceptance Scenarios**:

1. **Given** admin is logged into the management platform, **When** admin creates a new beverage category (e.g., "季节限定"), **Then** the category appears in the mini-program menu sidebar and products can be assigned to it
2. **Given** admin has existing categories, **When** admin updates a category name (e.g., "咖啡" to "精品咖啡"), **Then** the mini-program immediately reflects the updated category name
3. **Given** admin has a category with no products, **When** admin deletes the category, **Then** it is removed from both admin system and mini-program menu
4. **Given** admin has a category "季节限定" with 15 products assigned, **When** admin deletes the category, **Then** system shows confirmation dialog indicating "15 products will be moved to '其他' category" and upon confirmation, all products are automatically reassigned to "其他"
5. **Given** admin attempts to delete the default "其他" category, **Then** system prevents deletion and displays error message "Default category cannot be deleted"

---

### User Story 2 - Admin Reorders Menu Categories (Priority: P2)

**Cinema operations manager needs to adjust the display order of categories in the mini-program menu to highlight seasonal or promotional items.**

**Why this priority**: While core category management (P1) is essential, the ability to reorder provides important merchandising control. This allows business flexibility to promote certain product lines without restructuring the entire menu.

**Independent Test**: Can be fully tested by dragging category order in admin interface and verifying the mini-program displays categories in the new order. Delivers merchandising value independently from other features.

**Acceptance Scenarios**:

1. **Given** admin has multiple categories in the menu, **When** admin drags "季节限定" to the first position, **Then** the mini-program displays it as the first category tab
2. **Given** admin has reordered categories, **When** a customer opens the mini-program, **Then** categories appear in the configured order
3. **Given** admin has set custom ordering, **When** admin adds a new category, **Then** it appears at the end of the list by default and can be repositioned

---

### User Story 3 - Admin Sets Category Visibility (Priority: P2)

**Cinema operations manager needs to temporarily hide certain categories (e.g., out-of-season items) without deleting them.**

**Why this priority**: This provides operational flexibility to manage seasonal inventory and promotional campaigns. It's less critical than basic category management but more important than advanced features like icons or descriptions.

**Independent Test**: Can be fully tested by toggling category visibility in admin interface and verifying it shows/hides in mini-program. Delivers inventory management value independently.

**Acceptance Scenarios**:

1. **Given** admin has a category "冰品" during winter, **When** admin sets it to "hidden", **Then** customers do not see it in the mini-program menu
2. **Given** admin has hidden a category, **When** admin re-enables it, **Then** it reappears in the mini-program at its configured position
3. **Given** a category is hidden, **When** admin views the category list, **Then** the hidden status is clearly indicated

---

### User Story 4 - System Migrates Existing O003 Categories (Priority: P1)

**System needs to automatically migrate existing hardcoded beverage categories to the new configurable menu system without data loss.**

**Why this priority**: This is critical for deployment success. Without proper migration, existing mini-program functionality will break and customers will lose access to products. Must be tested before any production deployment.

**Independent Test**: Can be fully tested by running migration script against test database with O003 data and verifying all categories and products are preserved with correct relationships. Delivers deployment readiness.

**Acceptance Scenarios**:

1. **Given** O003 system has hardcoded categories ('咖啡', '茶饮', '果汁', '奶制品', '碳酸饮料', '水', '其他'), **When** migration script runs, **Then** all categories are created in the new menu configuration table with correct Chinese labels
2. **Given** existing products are linked to hardcoded categories, **When** migration completes, **Then** all products maintain their category associations
3. **Given** migration has completed, **When** mini-program fetches menu data, **Then** it displays the same categories as before migration with no disruption to users

---

### User Story 5 - Admin Sets Category Icons and Descriptions (Priority: P3)

**Cinema operations manager wants to add visual icons and descriptions to categories to improve menu clarity.**

**Why this priority**: This is a nice-to-have enhancement that improves user experience but is not essential for core functionality. Can be added after basic category management is stable.

**Independent Test**: Can be fully tested by uploading an icon and description for a category and verifying it displays in mini-program. Delivers UX polish independently from other features.

**Acceptance Scenarios**:

1. **Given** admin is editing a category, **When** admin uploads an icon image, **Then** the icon displays next to the category name in the mini-program menu
2. **Given** admin has set a category description, **When** customer taps on the category, **Then** a brief description appears (optional)

---

### Edge Cases

- What happens when admin deletes a category while products from that category are currently in customer shopping carts? (Expected: Products remain in cart with updated category reference to "其他", cart functionality unaffected)
- What happens when the "其他" (Other) default category already has many products and admin deletes another category with hundreds of products?
- How does the system handle concurrent category updates from multiple admin users?
- What happens when the mini-program API request fails during category data fetch?
- How does the system handle category names that exceed maximum character limits?
- What happens when an admin tries to create a duplicate category name?
- How does the system maintain menu state when switching between different store locations (if multi-store support exists)?
- What happens if admin tries to hide the "其他" default category?
- What happens during migration if the "其他" category doesn't exist in the old system?

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a backend API to create, read, update, and delete menu categories
- **FR-002**: System MUST store category configuration including: category name (Chinese label), display order (sort priority), visibility status (enabled/disabled), icon image URL (optional), and description text (optional)
- **FR-003**: Admin users MUST be able to manage categories through a dedicated management interface
- **FR-004**: System MUST enforce unique category names within the same scope (case-insensitive)
- **FR-005**: System MUST automatically migrate existing O003 hardcoded categories ('COFFEE'→'咖啡', 'TEA'→'茶饮', 'JUICE'→'果汁', 'MILK'→'奶制品', 'SODA'→'碳酸饮料', 'WATER'→'水', 'OTHER'→'其他') to the new configurable system during deployment
- **FR-006**: System MUST provide an API endpoint for mini-program to fetch active (visible) categories in configured display order
- **FR-007**: System MUST support reordering categories through drag-and-drop or numeric sort order input
- **FR-008**: System MUST allow toggling category visibility without deleting the category or its product associations
- **FR-009**: System MUST validate category name length (minimum 1 character, maximum 20 characters)
- **FR-010**: System MUST automatically reassign all products to the default "其他" (Other) category when their assigned category is deleted
- **FR-011**: System MUST designate "其他" (Other) as the permanent default category that cannot be deleted or hidden (but can be renamed and reordered)
- **FR-012**: System MUST display a confirmation dialog when admin deletes a category with existing products, showing the count of products that will be moved to "其他"
- **FR-013**: System MUST provide audit logging for all category configuration changes (create, update, delete, reorder) including automatic product reassignments
- **FR-014**: Mini-program MUST continue to function with existing category selection logic (filtering beverages by selected category)
- **FR-015**: System MUST support optional icon image upload with validation (accepted formats: PNG, JPG, WebP; max file size: 500KB)

### Key Entities

- **Menu Category**: Represents a product category in the mini-program menu. Key attributes include:
  - Unique identifier
  - Category name (Chinese display label)
  - Display order (numeric sort priority, lower numbers appear first)
  - Visibility status (enabled/disabled boolean)
  - Icon image URL (optional, for visual enhancement)
  - Description text (optional, for customer guidance)
  - Creation timestamp
  - Last update timestamp
  - Created by user (admin user ID)
  - Last updated by user (admin user ID)

- **Product-Category Association**: Links beverage products to categories. Key attributes include:
  - Product ID (foreign key to beverage product)
  - Category ID (foreign key to menu category)
  - Association timestamp

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can create a new category and see it reflected in the mini-program within 5 seconds (real-time or near-real-time synchronization)
- **SC-002**: System successfully migrates all existing O003 categories (7 hardcoded categories) to the new system with zero data loss during deployment
- **SC-003**: Mini-program menu loading time remains under 1 second even with 20+ configured categories
- **SC-004**: 100% of existing mini-program users can continue browsing products by category without disruption after deployment
- **SC-005**: Admin can reorder 10 categories in under 30 seconds using the management interface
- **SC-006**: Category configuration changes are immediately visible to new mini-program sessions (no more than 5-second cache delay)
- **SC-007**: System supports at least 50 active categories without performance degradation
- **SC-008**: Zero customer-reported issues related to menu category display or product filtering after migration

## Assumptions

- The existing O003 beverage order system is the primary data source for product categories
- Admin users have appropriate permissions to manage menu configuration (role-based access control exists or will be implemented separately)
- Mini-program already has infrastructure to fetch dynamic configuration data from backend APIs
- Category icons are hosted on the same infrastructure as product images (Supabase Storage or CDN)
- The "其他" (Other) category will serve as the permanent default category and always exists in the system
- Products reassigned to the default category during deletion will not affect customer shopping carts or active orders
- Multi-store support is out of scope for this feature (categories are global across all stores)
- Category localization (multiple languages) is out of scope (Chinese only)
- Category nesting (sub-categories) is out of scope (single-level hierarchy only)

## Dependencies

- O003 beverage order system (existing categories and product associations must be preserved)
- Supabase database (for storing category configuration)
- Admin management platform (frontend interface for category management)
- Mini-program Taro application (frontend consumer of category configuration API)

## Out of Scope

- Multi-language category names (only Chinese supported)
- Category nesting or hierarchical categories (only flat list)
- Category-specific pricing or promotions (handled by separate pricing system)
- Category-based access control (all categories visible to all users, visibility toggle only)
- Real-time live updates in already-opened mini-program sessions (requires page refresh/reopen)
- Category analytics or usage tracking (may be added in future iteration)

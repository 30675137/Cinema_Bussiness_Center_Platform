# Tasks: 订单模块迁移至渠道商品体系

**Spec**: O013-order-channel-migration  
**Branch**: `O013-order-channel-migration`  
**Created**: 2026-01-14

---

## Phase 1: Database Migration

### P1-01: Create Flyway migration script for beverage_order_items table
- [ ] Create migration file `V20260114001__order_channel_migration.sql`
- [ ] Add `channel_product_id UUID` column
- [ ] Add `sku_id UUID` column
- [ ] Add `product_snapshot JSONB` column
- [ ] Rename `beverage_name` → `product_name`
- [ ] Rename `beverage_image_url` → `product_image_url`
- [ ] Drop old foreign key constraint `beverage_order_items_beverage_id_fkey`
- [ ] Add new foreign key to `channel_product_config`
- [ ] Create indexes

**Files**:
- `backend/src/main/resources/db/migration/V20260114001__order_channel_migration.sql`

### P1-02: Create Flyway migration script for legacy table cleanup
- [ ] Create migration file `V20260114002__drop_legacy_beverage_tables.sql`
- [ ] Drop `beverage_specs` table
- [ ] Drop `beverage_recipes` table  
- [ ] Drop `recipe_ingredients` table
- [ ] Drop `beverage_sku_mapping` table
- [ ] Drop `beverages` table

**Files**:
- `backend/src/main/resources/db/migration/V20260114002__drop_legacy_beverage_tables.sql`

---

## Phase 2: Backend API Changes

### P2-01: Update BeverageOrderItem entity [P]
- [ ] Add `channelProductId` UUID field with `@Column(name = "channel_product_id")`
- [ ] Add `skuId` UUID field with `@Column(name = "sku_id")`
- [ ] Add `productSnapshot` String field with `@JdbcTypeCode(SqlTypes.JSON)`
- [ ] Rename `beverageName` → `productName`
- [ ] Rename `beverageImageUrl` → `productImageUrl`
- [ ] Remove `@NotNull` from old `beverageId` field (make nullable during transition)
- [ ] Add `@spec O013-order-channel-migration` annotation

**Files**:
- `backend/src/main/java/com/cinema/beverage/entity/BeverageOrderItem.java`

### P2-02: Update CreateBeverageOrderRequest DTO [P]
- [ ] Rename `OrderItemRequest.skuId` → `channelProductId`
- [ ] Update validation annotations
- [ ] Update `selectedSpecs` structure to match new format
- [ ] Add `@spec O013-order-channel-migration` annotation

**Files**:
- `backend/src/main/java/com/cinema/beverage/dto/CreateBeverageOrderRequest.java`

### P2-03: Update BeverageOrderDTO
- [ ] Update `OrderItemDTO` to include `channelProductId`, `skuId`, `productName`, `productImageUrl`, `productSnapshot`
- [ ] Keep backward compatible field names (beverageId → skuId alias)
- [ ] Update `fromEntity()` mapping method
- [ ] Add `@spec O013-order-channel-migration` annotation

**Files**:
- `backend/src/main/java/com/cinema/beverage/dto/BeverageOrderDTO.java`

### P2-04: Update BeverageOrderService
- [ ] Inject `ChannelProductConfigRepository` 
- [ ] Modify `createOrderItem()` to:
  - Query `ChannelProductConfig` by `channelProductId`
  - Get `skuId` from channel product config
  - Build `productSnapshot` JSON
  - Set `productName`, `productImageUrl` from channel config
- [ ] Update `calculateOrderTotal()` to use channel product pricing
- [ ] Update `extractSkuQuantities()` to extract SKU from channel product
- [ ] Add `@spec O013-order-channel-migration` annotation

**Files**:
- `backend/src/main/java/com/cinema/beverage/service/BeverageOrderService.java`

### P2-05: Create ConsumerOrderController (new API path)
- [ ] Create `ConsumerOrderController` with `@RequestMapping("/api/client/orders")`
- [ ] Implement `POST /api/client/orders` - createOrder
- [ ] Implement `GET /api/client/orders/{id}` - getOrderById
- [ ] Implement `GET /api/client/orders/my` - getMyOrders
- [ ] Implement `POST /api/client/orders/{id}/pay` - payOrder
- [ ] Implement `POST /api/client/orders/{id}/cancel` - cancelOrder
- [ ] Implement `GET /api/client/orders/by-number/{orderNumber}` - getOrderByNumber
- [ ] Add `@spec O013-order-channel-migration` annotation
- [ ] Keep `BeverageOrderController` for backward compatibility (deprecated)

**Files**:
- `backend/src/main/java/com/cinema/beverage/controller/ConsumerOrderController.java`

### P2-06: Create ProductSnapshotBuilder utility
- [ ] Create `ProductSnapshotBuilder` class
- [ ] Implement `buildSnapshot(ChannelProductConfig config, Map<String, SelectedSpecOption> selectedSpecs)` method
- [ ] Return JSON string with channel product info, SKU info, specs, snapshotAt timestamp

**Files**:
- `backend/src/main/java/com/cinema/beverage/util/ProductSnapshotBuilder.java`

### P2-07: Update BeverageOrderService unit tests
- [ ] Update `BeverageOrderServiceTest` to use `channelProductId`
- [ ] Mock `ChannelProductConfigRepository`
- [ ] Update test assertions for new field structure

**Files**:
- `backend/src/test/java/com/cinema/beverage/service/BeverageOrderServiceTest.java`

---

## Phase 3: Frontend Adaptation (miniapp-ordering-taro)

### P3-01: Update order service API calls
- [ ] Update `createOrder` API path from `/api/client/beverage-orders` to `/api/client/orders`
- [ ] Update request body: `skuId` → `channelProductId`
- [ ] Update `selectedSpecs` structure to new format
- [ ] Add `@spec O013-order-channel-migration` comment

**Files**:
- `miniapp-ordering-taro/src/services/orderService.ts`

### P3-02: Update cart store data structure
- [ ] Update `CartItem` interface: add `channelProductId`, keep backward compat
- [ ] Update `addToCart` action to use `channelProductId`
- [ ] Update cart persistence/serialization

**Files**:
- `miniapp-ordering-taro/src/store/cartStore.ts`

### P3-03: Update order types
- [ ] Update `CreateOrderRequest` interface
- [ ] Update `OrderItemDTO` interface
- [ ] Add `ProductSnapshot` interface
- [ ] Add `SelectedSpecOption` interface

**Files**:
- `miniapp-ordering-taro/src/types/order.ts`

### P3-04: Update order confirm page
- [ ] Update order creation request to use new API
- [ ] Map cart items to `channelProductId` format

**Files**:
- `miniapp-ordering-taro/src/pages/order/confirm/index.tsx`

### P3-05: Update order detail page
- [ ] Display product info from `productSnapshot` or direct fields
- [ ] Handle backward compatibility with old order format

**Files**:
- `miniapp-ordering-taro/src/pages/order-detail/index.tsx`

---

## Phase 4: O012 Postman Tests Update

### P4-01: Update O012 setup collection
- [ ] Add step: Create `channel_product_config` record for test SKU
- [ ] Add step: Link channel product to existing SKU
- [ ] Update variable: `{{channelProductId}}` instead of `{{skuId}}`

**Files**:
- `specs/O012-order-inventory-reservation/postman/O012-setup-teardown.postman_collection.json`

### P4-02: Update O012 order reservation collection
- [ ] Update `Create Order` request: use `channelProductId`
- [ ] Update API path to `/api/client/orders`
- [ ] Update assertions for new response structure

**Files**:
- `specs/O012-order-inventory-reservation/postman/O012-order-reservation.postman_collection.json`

### P4-03: Update O012 test data CSV
- [ ] Replace `skuId` column with `channelProductId`
- [ ] Add channel product config test data

**Files**:
- `specs/O012-order-inventory-reservation/postman/O012-test-data.csv`

---

## Phase 5: Legacy Code Cleanup

### P5-01: Delete Beverage entity and repository
- [ ] Delete `Beverage.java` entity
- [ ] Delete `BeverageRepository.java`
- [ ] Delete `BeverageSpecRepository.java`
- [ ] Remove all imports/references to deleted classes

**Files**:
- `backend/src/main/java/com/cinema/beverage/entity/Beverage.java` (DELETE)
- `backend/src/main/java/com/cinema/beverage/repository/BeverageRepository.java` (DELETE)
- `backend/src/main/java/com/cinema/beverage/repository/BeverageSpecRepository.java` (DELETE)

### P5-02: Update BeverageAdminService
- [ ] Remove references to `BeverageRepository`
- [ ] Remove references to `BeverageSpecRepository`
- [ ] Update or remove methods that depend on deleted entities

**Files**:
- `backend/src/main/java/com/cinema/beverage/service/BeverageAdminService.java`

### P5-03: Deprecate BeverageClientController
- [ ] Add `@Deprecated` annotation
- [ ] Add deprecation notice in Javadoc pointing to new API

**Files**:
- `backend/src/main/java/com/cinema/beverage/controller/BeverageClientController.java`

### P5-04: Clean up BeverageOrderItem old field
- [ ] Remove `beverageId` field (after migration verified)
- [ ] Update `fromEntity` mappings

**Note**: This task should be done AFTER verifying the migration is complete.

---

## Phase 6: Integration Testing & Verification

### P6-01: Run database migration
- [ ] Execute `mvn flyway:migrate`
- [ ] Verify table structure changes
- [ ] Verify foreign key constraints

### P6-02: Run backend unit tests
- [ ] Execute `mvn test`
- [ ] Verify all tests pass
- [ ] Check code coverage

### P6-03: Run O012 Postman tests
- [ ] Execute Newman with updated collection
- [ ] Verify order creation with `channelProductId`
- [ ] Verify inventory reservation flow

### P6-04: Manual E2E verification
- [ ] Start backend service
- [ ] Start miniapp in dev mode
- [ ] Complete order flow: browse menu → add to cart → checkout → view order
- [ ] Verify order detail shows correct product info

---

## Completion Checklist

- [ ] All database migrations applied successfully
- [ ] Backend compiles without errors
- [ ] All unit tests pass
- [ ] O012 Postman tests pass
- [ ] Frontend builds without errors
- [ ] E2E order flow works correctly
- [ ] Legacy beverages tables deleted
- [ ] Legacy code cleaned up

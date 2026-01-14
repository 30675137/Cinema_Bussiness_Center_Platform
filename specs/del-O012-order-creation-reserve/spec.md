# Feature Specification: Order Creation with Inventory Reservation

**Feature Branch**: `001-order-creation-reserve`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "了解订单的现状,然后完成订单创建时预占功能规格设计"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prevent Overselling Through Automatic Inventory Reservation (Priority: P1)

When a customer places an order for finished products (e.g., popcorn combo, beverages), the system must automatically reserve the raw materials needed to fulfill that order. This prevents the cinema from accepting more orders than it can fulfill, ensuring customer satisfaction and operational efficiency.

**Why this priority**: This is the core value proposition of the feature. Without automatic reservation, cinemas risk overselling products, leading to customer complaints, refunds, and reputational damage.

**Independent Test**: Can be fully tested by placing an order with mixed items (finished products requiring BOM expansion) and verifying that:
1. Inventory reservation records are created
2. Available inventory quantities decrease appropriately
3. Subsequent orders are blocked if insufficient inventory remains

**Acceptance Scenarios**:

1. **Given** a customer wants to order 2 units of "Deluxe Popcorn Combo" (which requires corn kernels, butter, salt via BOM), **When** the order is submitted, **Then** the system calculates raw material requirements, locks inventory rows, reserves exact quantities, and creates reservation records with order linkage.

2. **Given** current available inventory for "Premium Coffee Beans" is 500g and an order requires 600g (after BOM expansion), **When** the order is submitted, **Then** the system detects insufficient inventory, rolls back the transaction, returns error with detailed shortage information (SKU name, available quantity, required quantity, shortage amount), and does not create the order.

3. **Given** two concurrent orders both request the last 100g of "Chocolate Syrup", **When** both orders are submitted simultaneously, **Then** only one order succeeds (using pessimistic row locking), the other receives insufficient inventory error, ensuring no overselling occurs.

---

### User Story 2 - Automatic BOM Expansion for Finished Products (Priority: P1)

When an order contains finished products (SKUs with BOM definitions), the system must automatically expand the Bill of Materials to calculate the exact raw material requirements, supporting multi-level BOM structures (e.g., "Combo Meal" contains "Popcorn", which requires "Corn Kernels", "Butter", "Salt").

**Why this priority**: Essential foundation for P1 User Story 1. Without BOM expansion, the system cannot determine what raw materials to reserve.

**Independent Test**: Can be fully tested by placing an order for a multi-level finished product and verifying that all recursive material requirements are correctly calculated and reserved at each BOM level.

**Acceptance Scenarios**:

1. **Given** a customer orders 1x "Premium Combo" (contains 1x Large Popcorn + 1x Medium Coke), **When** the system expands BOM, **Then** it calculates: Large Popcorn requires 150g corn kernels + 20g butter + 5g salt; Medium Coke requires 400ml syrup + 50ml water; total 5 raw materials reserved.

2. **Given** a finished product has a 3-level BOM structure (Combo → Popcorn Set → Individual Ingredients), **When** BOM expansion occurs, **Then** the system recursively processes all levels, aggregates duplicate materials across different paths, and returns a flattened list of unique material requirements with total quantities.

3. **Given** a SKU has no BOM definition (e.g., pre-packaged candy), **When** the order is submitted, **Then** the system treats it as a raw material, skips BOM expansion, and directly reserves 1 unit of that SKU.

---

### User Story 3 - Release Reserved Inventory on Order Cancellation (Priority: P2)

When a customer or operator cancels an order before fulfillment, the system must release all reserved inventory back to available stock, allowing other customers to place orders using those materials.

**Why this priority**: Important for inventory accuracy and customer experience, but not as critical as preventing overselling. Orders can be manually adjusted if release fails, but overselling cannot be easily remedied.

**Independent Test**: Can be fully tested by creating an order (which reserves inventory), then cancelling it, and verifying that reserved quantities decrease and available quantities increase by the exact amounts.

**Acceptance Scenarios**:

1. **Given** an order with reservation records in ACTIVE status, **When** the order is cancelled, **Then** the system locks inventory rows, subtracts reserved quantities, marks reservations as CANCELLED, creates transaction logs with type RESERVATION_RELEASE, and commits all changes atomically.

2. **Given** an order with no active reservations (already fulfilled or previously cancelled), **When** cancellation is requested, **Then** the system returns a warning message "No active reservations found" and does not modify inventory.

3. **Given** an order is cancelled after partial fulfillment (some items already deducted), **When** release is triggered, **Then** the system only releases reservations for unfulfilled items, leaving fulfilled items unchanged, and logs partial release details.

---

### User Story 4 - Prevent Reservation Expiry for Unpaid Orders (Priority: P3)

To avoid inventory being locked indefinitely by unpaid orders, the system should automatically release reservations after a configurable timeout period (e.g., 30 minutes for self-service kiosks, 24 hours for pre-orders).

**Why this priority**: Nice-to-have for operational efficiency, but not critical for initial release. Operators can manually cancel timed-out orders if needed.

**Independent Test**: Can be fully tested by creating an order, waiting for the expiry period, running a scheduled job to detect expired reservations, and verifying that reservations are released and inventory becomes available again.

**Acceptance Scenarios**:

1. **Given** an order is created at 10:00 AM with 30-minute expiry configured, **When** the scheduled job runs at 10:35 AM, **Then** the system detects the expired reservation, automatically releases inventory, marks order as CANCELLED with reason "Payment timeout", and sends notification to customer.

2. **Given** an order is paid at 10:20 AM (before 30-minute expiry), **When** the scheduled job runs at 10:35 AM, **Then** the system skips this order (payment completed), maintains reservation status, and proceeds to fulfill the order normally.

3. **Given** different order types (kiosk vs. pre-order) have different expiry rules, **When** reservations are created, **Then** the system sets `expires_at` timestamp based on order source type (kiosk: +30 min, pre-order: +24 hours, walk-in: no expiry).

---

### Edge Cases

- **What happens when BOM expansion detects a circular dependency** (e.g., Product A requires Product B, which requires Product A)?
  - System must detect cycles during BOM traversal, throw `BomDepthExceededException` with detailed cycle path, and reject order creation to prevent infinite loops.

- **How does system handle concurrent modifications to BOM definitions during order placement?**
  - System creates BOM snapshots at order creation time, stores them in `bom_snapshots` table, and uses snapshots for all subsequent operations (fulfillment, deduction) to ensure consistency even if BOM definitions change later.

- **What happens when inventory data is inconsistent** (e.g., `reserved_qty > on_hand_qty` due to database corruption)?
  - System validates data integrity before reservation using `calculateAvailableForReservation()`, which returns `MAX(0, on_hand_qty - reserved_qty)`. If inconsistent, it treats available as 0 and rejects the order with insufficient inventory error.

- **How does system handle database deadlocks during high-concurrency order creation?**
  - Spring `@Transactional` will automatically retry deadlock exceptions (using default retry policy). If deadlock persists after retries, system returns HTTP 500 error with retry suggestion. Row-level locking (`SELECT FOR UPDATE`) is ordered by SKU ID to minimize deadlock probability.

- **What happens when reservation release fails mid-transaction** (e.g., some items released, others failed)?
  - All release operations are wrapped in a single `@Transactional` method. If any step fails, the entire transaction is rolled back, ensuring atomicity. No partial releases are possible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically trigger inventory reservation when an order transitions from cart to confirmed order (order status: PENDING_PAYMENT).

- **FR-002**: System MUST expand Bill of Materials (BOM) recursively for all finished products in the order, calculating the total raw material requirements by aggregating quantities across all BOM levels and deduplicating SKUs.

- **FR-003**: System MUST use pessimistic row-level locking (`SELECT FOR UPDATE`) when checking and reserving inventory to prevent race conditions in concurrent order scenarios.

- **FR-004**: System MUST validate that available inventory (`on_hand_qty - reserved_qty`) is sufficient for all materials before creating reservations. If any material is insufficient, the system MUST reject the entire order and return detailed shortage information.

- **FR-005**: System MUST create one `inventory_reservations` record per SKU per order, linking `order_id`, `store_id`, `sku_id`, `reserved_quantity`, and setting status to ACTIVE.

- **FR-006**: System MUST create BOM snapshots for all finished products at order creation time, storing the exact BOM structure and quantities used for reservation, enabling consistent deduction even if BOM definitions change later.

- **FR-007**: System MUST update `reserved_qty` in the `inventory` table for each reserved SKU, ensuring that `available_qty = on_hand_qty - reserved_qty` reflects real-time availability for subsequent orders.

- **FR-008**: System MUST ensure all reservation operations (BOM expansion, inventory check, reservation creation, inventory update) are executed within a single database transaction with READ_COMMITTED isolation level and 30-second timeout.

- **FR-009**: System MUST release reserved inventory when an order is cancelled, subtracting `reserved_quantity` from `reserved_qty` in the inventory table, marking reservation status as CANCELLED, and creating RESERVATION_RELEASE transaction logs.

- **FR-010**: System MUST log all reservation and release operations in the `inventory_transactions` table with transaction type, quantity changes, related order ID, and operator ID for audit trails.

- **FR-011**: System MUST prevent negative inventory values by validating that `reserved_qty >= 0` and `on_hand_qty >= reserved_qty` after each operation, treating any inconsistency as data corruption and rejecting the transaction.

- **FR-012**: System MUST support both finished products (with BOM) and raw materials (without BOM) in the same order, treating raw materials as direct 1:1 reservations without BOM expansion.

- **FR-013**: System MUST return user-friendly error messages when reservation fails, including SKU name, current available quantity, required quantity, shortage amount, and unit of measurement for each insufficient material.

- **FR-014**: System MUST support configurable BOM depth limits (default: 10 levels) to prevent infinite recursion, throwing `BomDepthExceededException` if depth is exceeded.

- **FR-015**: System MUST handle partial order cancellations by releasing only the reservations for cancelled items, leaving fulfilled items unchanged.

### Key Entities

- **ProductOrder**: Represents a customer order containing one or more order items. Attributes: order ID, user ID, store ID, order status (PENDING_PAYMENT, PAID, SHIPPED, COMPLETED, CANCELLED), total amount, timestamps, version (for optimistic locking).

- **OrderItem**: Represents a single line item in an order. Attributes: SKU ID, SKU name, quantity, unit price, subtotal. Relationships: belongs to one ProductOrder, references one SKU.

- **InventoryReservation**: Represents a reservation of inventory for an order. Attributes: reservation ID, order ID, store ID, SKU ID, reserved_quantity, status (ACTIVE, FULFILLED, CANCELLED, EXPIRED), expires_at, created_at. Relationships: belongs to one ProductOrder, references one Inventory record.

- **Inventory**: Represents stock levels at a store. Attributes: store ID, SKU ID, on_hand_qty (physical stock), reserved_qty (locked for orders), available_qty (calculated as on_hand_qty - reserved_qty), updated_at. Relationships: belongs to one Store, references one SKU.

- **BomSnapshot**: Frozen copy of BOM structure at order creation time. Attributes: order ID, finished product SKU ID, material SKU ID, quantity_per_unit, BOM level, created_at. Relationships: belongs to one ProductOrder, references multiple SKUs.

- **InventoryTransaction**: Audit log for all inventory changes. Attributes: transaction ID, store ID, SKU ID, transaction_type (RESERVATION, RESERVATION_RELEASE, DEDUCTION, INBOUND, ADJUSTMENT), quantity, quantity_before, quantity_after, related_order_id, operator_id, notes, created_at.

- **SKU (Stock Keeping Unit)**: Product definition. Attributes: SKU ID, SKU name, category ID, unit of measurement, has_bom (boolean indicating if BOM expansion needed), status. Relationships: may have multiple BOM components, belongs to one category.

- **BomComponent**: Defines material requirements for finished products. Attributes: finished_product_id (SKU ID), material_id (SKU ID), quantity_per_unit, unit, sequence. Relationships: recursive (BomComponent can reference another finished product as material).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Orders are successfully created with inventory reservation within 2 seconds for 95% of requests, including BOM expansion and database locking operations.

- **SC-002**: System prevents all overselling scenarios, ensuring 100% accuracy in concurrent order tests with 50 simultaneous users ordering the same limited-stock item (only N orders succeed where N = available quantity).

- **SC-003**: Inventory availability displayed to customers is accurate within 1 second of order placement, reflecting real-time reserved quantities across all stores.

- **SC-004**: Order cancellations release reserved inventory within 1 second, making stock immediately available for new orders.

- **SC-005**: BOM expansion correctly handles multi-level structures up to 10 levels deep, with 100% accuracy in material quantity calculations verified through audit logs.

- **SC-006**: System handles 1000 concurrent order creation requests without deadlocks or transaction timeouts, maintaining sub-3-second response times.

- **SC-007**: Insufficient inventory errors provide clear, actionable information, enabling customers to adjust their orders without contacting support in 90% of cases.

- **SC-008**: Inventory transaction logs capture 100% of reservation and release operations with complete audit trails (who, what, when, why) for compliance and troubleshooting.

- **SC-009**: BOM snapshot functionality ensures order fulfillment accuracy even after BOM changes, with 0% discrepancies between reserved materials and fulfillment requirements.

- **SC-010**: System recovers gracefully from database failures or timeouts, rolling back all partial changes and returning clear error messages in 100% of failure scenarios.

## Assumptions

- **Assumption 1**: The existing `InventoryReservationService` (from spec P005-bom-inventory-deduction) already implements the core reservation logic with BOM expansion, pessimistic locking, and transaction management. This spec focuses on integrating reservation into the order creation workflow.

- **Assumption 2**: Order creation follows the standard e-commerce flow: Cart → Order Confirmation → Payment → Fulfillment. Reservation occurs at the "Order Confirmation" step (order status: PENDING_PAYMENT), before payment is processed.

- **Assumption 3**: Each store maintains independent inventory. Reservations are store-specific and cannot span multiple stores (no cross-store inventory allocation).

- **Assumption 4**: BOM definitions are managed by the product management team and stored in the `bom_components` table. Changes to BOM definitions do not retroactively affect existing orders (snapshots preserve original BOM).

- **Assumption 5**: The system uses Spring Boot with JPA for database access, PostgreSQL for data storage, and supports transaction management with configurable isolation levels.

- **Assumption 6**: Reservation expiry (User Story 4) is handled by a scheduled job (e.g., Spring `@Scheduled` task running every 5 minutes) that scans for expired reservations based on `expires_at` timestamp.

- **Assumption 7**: The system has an authentication/authorization mechanism to identify the operator performing order cancellations. Operator ID is recorded in transaction logs for audit purposes.

- **Assumption 8**: Inventory quantities use `BigDecimal` with precision (19,4) to support fractional units (e.g., grams, milliliters) and avoid floating-point arithmetic errors.

- **Assumption 9**: The system displays estimated product availability to customers before order placement, calculated as `MIN(on_hand_qty - reserved_qty)` across required materials after BOM expansion. This is an approximation and may change between display and actual order placement due to concurrency.

- **Assumption 10**: Order cancellation can be triggered by customers (self-service), operators (manual intervention), or system (payment timeout). All paths invoke the same `releaseReservation()` service method.

## Out of Scope

The following are explicitly **not** included in this feature:

- **Cross-store inventory allocation**: This feature does not support transferring inventory between stores to fulfill orders. Each order is fulfilled entirely from a single store's inventory.

- **Inventory forecasting and demand planning**: This feature does not predict future inventory needs or suggest reorder quantities based on reservation patterns.

- **Dynamic pricing based on inventory levels**: This feature does not adjust product prices based on stock availability (e.g., surge pricing for low-stock items).

- **Partial order fulfillment**: This feature does not support splitting orders into multiple shipments when some items are out of stock. Orders are either fully reserved or fully rejected.

- **Real-time inventory synchronization with external systems**: This feature assumes inventory data is managed within the Cinema Business Center Platform database. Integration with external ERP systems is out of scope.

- **Manual reservation adjustments**: This feature does not provide a UI for operators to manually create, modify, or delete reservations. All reservations are system-generated based on order lifecycle.

- **Reservation priority or queuing**: This feature does not support prioritizing certain customers (e.g., VIP members) or placing customers in a queue when inventory is insufficient. Reservation is strictly first-come, first-served.

- **Inventory locking for shopping carts**: This feature does not reserve inventory when items are added to a cart (before order confirmation). Reservation only occurs after order placement.

- **Rollback of reservation after payment failure**: This feature assumes payment processing is handled separately. If payment fails after reservation, the reservation expiry mechanism (User Story 4) will eventually release the inventory, or the order must be explicitly cancelled.

- **Notification to customers about inventory shortages**: This feature returns error messages via API responses but does not send proactive notifications (email, SMS, push notifications) to customers about inventory availability changes.

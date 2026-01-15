# Error Codes: BOM Inventory Reservation & Deduction

**Feature**: P005-bom-inventory-deduction
**Module Prefix**: INV (Inventory)
**Date**: 2025-12-29

---

## Error Code Format

All error codes follow the format: `<MODULE>_<CATEGORY>_<NUMBER>`

- **MODULE**: INV (Inventory)
- **CATEGORY**: 3-letter error type (VAL, NTF, DUP, BIZ, SYS)
- **NUMBER**: 3-digit sequence (001-999)

---

## Validation Errors (VAL) - HTTP 400

| Code | Message | Trigger Scenario | Recommended Action |
|------|---------|------------------|-------------------|
| INV_VAL_001 | Invalid reservation request | Items array is empty | Provide at least one item in the request |
| INV_VAL_002 | Invalid SKU ID format | SKU ID is not a valid UUID | Check SKU ID format |
| INV_VAL_003 | Invalid quantity | Quantity is zero or negative | Provide positive quantity value |
| INV_VAL_004 | Missing required field: {field} | Required field is null/empty | Provide all required fields |
| INV_VAL_005 | Invalid deduction request | Order ID or operator ID missing | Include orderId and operatorId |
| INV_VAL_006 | Invalid manual adjustment | Adjustment quantity is negative | Provide valid adjustment quantity |

---

## Not Found Errors (NTF) - HTTP 404

| Code | Message | Trigger Scenario | Recommended Action |
|------|---------|------------------|-------------------|
| INV_NTF_001 | No active reservations found for order | Order has no ACTIVE reservations | Check order status or create reservation first |
| INV_NTF_002 | Inventory record not found | SKU not found in inventory | Create inventory record for this SKU/store |
| INV_NTF_003 | BOM formula not found | SKU has no BOM configuration | Configure BOM formula in P001 |
| INV_NTF_004 | Order not found | Referenced order does not exist | Verify order ID |
| INV_NTF_005 | Transaction log not found | Transaction ID does not exist | Verify transaction ID |

---

## Conflict Errors (DUP) - HTTP 409

| Code | Message | Trigger Scenario | Recommended Action |
|------|---------|------------------|-------------------|
| INV_DUP_001 | Reservation already exists for order | Attempting duplicate reservation | Check existing reservations before creating new one |
| INV_DUP_002 | Order already fulfilled | Attempting to deduct already-fulfilled order | Verify order fulfillment status |

---

## Business Rule Errors (BIZ) - HTTP 422

| Code | Message | Trigger Scenario | Recommended Action |
|------|---------|------------------|-------------------|
| INV_BIZ_001 | Insufficient inventory for order | Available inventory < required quantity | Display shortage details to user, suggest reducing quantity or cancelling order |
| INV_BIZ_002 | Insufficient current inventory for deduction | Current inventory < reserved quantity (data inconsistency) | Trigger admin alert, check for manual adjustments or system errors |
| INV_BIZ_003 | Reservation has expired | Reservation timeout exceeded | Release expired reservation and create new one if needed |
| INV_BIZ_004 | BOM depth exceeds maximum (3 layers) | Combo product has >3 nesting levels | Simplify BOM structure or split combo into multiple products |
| INV_BIZ_005 | Circular BOM dependency detected | BOM formula has circular reference | Fix BOM configuration to remove circular dependency |
| INV_BIZ_006 | Cannot release non-active reservation | Attempting to release FULFILLED/CANCELLED reservation | Verify reservation status before releasing |
| INV_BIZ_007 | Inventory negative after deduction | Deduction would result in negative inventory | Enable "allow negative inventory" or adjust deduction quantity |

---

## System Errors (SYS) - HTTP 500

| Code | Message | Trigger Scenario | Recommended Action |
|------|---------|------------------|-------------------|
| INV_SYS_001 | Internal server error during reservation | Unexpected exception in reservation logic | Check server logs, retry request |
| INV_SYS_002 | Internal server error during deduction | Unexpected exception in deduction logic | Check server logs, contact support |
| INV_SYS_003 | Database transaction rollback | Transaction failed and was rolled back | Check database logs, retry request |
| INV_SYS_004 | Lock acquisition timeout | Failed to acquire row lock within timeout | Retry request, check for deadlocks |

---

## Error Response Examples

### INV_BIZ_001: Insufficient Inventory

**Scenario**: Customer orders 1 cocktail requiring 150ml cola, but only 100ml available.

```json
{
  "success": false,
  "error": "INV_BIZ_001",
  "message": "Insufficient inventory for order",
  "details": {
    "shortages": [
      {
        "skuId": "raw002",
        "skuName": "可乐糖浆",
        "available": 100,
        "required": 150,
        "shortage": 50,
        "unit": "ml"
      }
    ]
  },
  "timestamp": "2025-12-29T10:30:00Z"
}
```

**Frontend Handling**:
```typescript
if (error.error === 'INV_BIZ_001') {
  const shortages = error.details.shortages;
  const message = shortages.map(s =>
    `${s.skuName}库存不足: 需要${s.required}${s.unit}, 当前可用${s.available}${s.unit}, 缺口${s.shortage}${s.unit}`
  ).join('\n');
  showError(message);
}
```

### INV_NTF_001: No Active Reservations

**Scenario**: Attempting to release reservation for order with no active reservations.

```json
{
  "success": false,
  "error": "INV_NTF_001",
  "message": "No active reservations found for order",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2025-12-29T10:35:00Z"
}
```

**Frontend Handling**:
```typescript
if (error.error === 'INV_NTF_001') {
  showWarning('该订单没有活跃的库存预占记录，可能已被释放或履约');
  // No retry needed
}
```

### INV_BIZ_002: Insufficient Current Inventory

**Scenario**: Deduction fails because current inventory was manually adjusted to below reserved quantity.

```json
{
  "success": false,
  "error": "INV_BIZ_002",
  "message": "Insufficient current inventory for deduction",
  "details": {
    "skuId": "raw001",
    "skuName": "威士忌",
    "currentQuantity": 30,
    "reservedQuantity": 45,
    "requiredQuantity": 45,
    "shortage": 15
  },
  "timestamp": "2025-12-29T10:40:00Z"
}
```

**Frontend Handling**:
```typescript
if (error.error === 'INV_BIZ_002') {
  showAlert({
    title: '库存数据异常',
    message: `${error.details.skuName}的现存库存(${error.details.currentQuantity})低于预占库存(${error.details.reservedQuantity})，请联系管理员核查`,
    severity: 'error'
  });
  // Trigger admin notification
  notifyAdmin(error);
}
```

---

## Frontend Error Handling Utility

```typescript
/**
 * @spec P005-bom-inventory-deduction
 * 统一错误处理工具
 */
export function handleInventoryError(error: ApiError): string {
  const errorHandlers: Record<string, (error: ApiError) => string> = {
    'INV_BIZ_001': (err) => {
      const shortages = err.details.shortages || [];
      return shortages.map((s: any) =>
        `${s.skuName}库存不足: 需要${s.required}${s.unit}, 可用${s.available}${s.unit}`
      ).join('\n');
    },
    'INV_NTF_001': () => '该订单没有活跃的库存预占记录',
    'INV_NTF_003': () => 'BOM配方未配置，请联系管理员',
    'INV_BIZ_002': (err) => `库存数据异常: ${err.details.skuName}现存库存低于预占库存`,
    'INV_BIZ_003': () => '库存预占已超时，请重新下单',
    'INV_DUP_002': () => '订单已履约，无法重复扣减',
    'INV_SYS_001': () => '系统异常，请稍后重试',
    'INV_SYS_004': () => '系统繁忙，请稍后重试',
  };

  const handler = errorHandlers[error.error];
  return handler ? handler(error) : error.message || '未知错误';
}
```

---

## Backend Exception Classes

```java
/**
 * @spec P005-bom-inventory-deduction
 * 库存相关异常枚举
 */
public enum InventoryErrorCode {

    // Validation errors (400)
    INV_VAL_001("Invalid reservation request", HttpStatus.BAD_REQUEST),
    INV_VAL_002("Invalid SKU ID format", HttpStatus.BAD_REQUEST),
    INV_VAL_003("Invalid quantity", HttpStatus.BAD_REQUEST),
    INV_VAL_004("Missing required field: {0}", HttpStatus.BAD_REQUEST),
    INV_VAL_005("Invalid deduction request", HttpStatus.BAD_REQUEST),

    // Not found errors (404)
    INV_NTF_001("No active reservations found for order", HttpStatus.NOT_FOUND),
    INV_NTF_002("Inventory record not found", HttpStatus.NOT_FOUND),
    INV_NTF_003("BOM formula not found", HttpStatus.NOT_FOUND),
    INV_NTF_004("Order not found", HttpStatus.NOT_FOUND),

    // Conflict errors (409)
    INV_DUP_001("Reservation already exists for order", HttpStatus.CONFLICT),
    INV_DUP_002("Order already fulfilled", HttpStatus.CONFLICT),

    // Business rule errors (422)
    INV_BIZ_001("Insufficient inventory for order", HttpStatus.UNPROCESSABLE_ENTITY),
    INV_BIZ_002("Insufficient current inventory for deduction", HttpStatus.UNPROCESSABLE_ENTITY),
    INV_BIZ_003("Reservation has expired", HttpStatus.UNPROCESSABLE_ENTITY),
    INV_BIZ_004("BOM depth exceeds maximum (3 layers)", HttpStatus.UNPROCESSABLE_ENTITY),
    INV_BIZ_005("Circular BOM dependency detected", HttpStatus.UNPROCESSABLE_ENTITY),
    INV_BIZ_006("Cannot release non-active reservation", HttpStatus.UNPROCESSABLE_ENTITY),
    INV_BIZ_007("Inventory negative after deduction", HttpStatus.UNPROCESSABLE_ENTITY),

    // System errors (500)
    INV_SYS_001("Internal server error during reservation", HttpStatus.INTERNAL_SERVER_ERROR),
    INV_SYS_002("Internal server error during deduction", HttpStatus.INTERNAL_SERVER_ERROR),
    INV_SYS_003("Database transaction rollback", HttpStatus.INTERNAL_SERVER_ERROR),
    INV_SYS_004("Lock acquisition timeout", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String message;
    private final HttpStatus httpStatus;

    InventoryErrorCode(String message, HttpStatus httpStatus) {
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return this.name();
    }

    public String getMessage() {
        return this.message;
    }

    public HttpStatus getHttpStatus() {
        return this.httpStatus;
    }
}

/**
 * @spec P005-bom-inventory-deduction
 * 库存不足异常
 */
public class InsufficientInventoryException extends BusinessException {
    private final List<InventoryShortage> shortages;

    public InsufficientInventoryException(List<InventoryShortage> shortages) {
        super(InventoryErrorCode.INV_BIZ_001);
        this.shortages = shortages;
    }

    @Override
    public Map<String, Object> getDetails() {
        return Map.of("shortages", shortages);
    }
}

/**
 * @spec P005-bom-inventory-deduction
 * 库存短缺详情
 */
public record InventoryShortage(
    String skuId,
    String skuName,
    BigDecimal available,
    BigDecimal required,
    BigDecimal shortage,
    String unit
) {}
```

---

**Error Codes Documentation Complete** ✅

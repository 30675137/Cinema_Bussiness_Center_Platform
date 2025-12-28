# Error Codes Documentation - 饮品订单系统

**Feature**: O003-beverage-order
**Version**: 1.0.0
**Date**: 2025-12-27
**Status**: Active

符合 constitution.md API Error Code Standards (08-api-standards.md R8.8)

---

## 错误编号规范

**格式**: `<模块前缀>_<类别>_<序号>`

**模块前缀**:
- `BEV`: 饮品 (Beverage)
- `ORD`: 订单 (Order)

**错误类别**:
| 类别 | 含义 | HTTP 状态码 |
|------|------|------------|
| NTF | 未找到 (Not Found) | 404 |
| VAL | 验证错误 (Validation Error) | 400 |
| BIZ | 业务规则 (Business Rule) | 422 |
| SYS | 系统错误 (System Error) | 500 |

---

## 饮品相关错误 (BEV_*)

### BEV_NTF_001: 饮品不存在

**HTTP 状态码**: 404

**触发场景**:
- C端查询饮品详情时，饮品 ID 不存在
- 添加订单项时，引用的饮品 ID 不存在

**响应示例**:
```json
{
  "success": false,
  "error": "BEV_NTF_001",
  "message": "饮品不存在: abc123",
  "details": {
    "beverageId": "abc123"
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- 前端显示: "该饮品已下架"
- 操作: 返回饮品列表页

---

### BEV_NTF_002: 饮品规格不存在

**HTTP 状态码**: 404

**触发场景**:
- 下单时选择的规格 ID 在数据库中不存在
- 规格已被删除

**响应示例**:
```json
{
  "success": false,
  "error": "BEV_NTF_002",
  "message": "饮品规格不存在",
  "details": {
    "specId": "spec_123"
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- 前端显示: "该规格已不可用，请重新选择"
- 操作: 刷新规格列表

---

### BEV_NTF_003: 饮品配方不存在

**HTTP 状态码**: 404

**触发场景**:
- B端开始制作时，后端无法找到对应的 BOM 配方
- 配方数据缺失

**响应示例**:
```json
{
  "success": false,
  "error": "BEV_NTF_003",
  "message": "饮品配方不存在",
  "details": {
    "beverageId": "bev_123",
    "specCombination": {"size": "large"}
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- 前端显示: "配方数据缺失，无法制作"
- 操作: 联系管理员补充配方数据

---

### BEV_VAL_001: 饮品已下架

**HTTP 状态码**: 400

**触发场景**:
- 尝试下单时，饮品状态为 `INACTIVE`

**响应示例**:
```json
{
  "success": false,
  "error": "BEV_VAL_001",
  "message": "饮品已下架",
  "details": {
    "beverageId": "bev_123",
    "status": "INACTIVE"
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- 前端显示: "该饮品已下架"
- 操作: 从购物车移除该商品

---

### BEV_VAL_002: 饮品已售罄

**HTTP 状态码**: 400

**触发场景**:
- 尝试下单时，饮品状态为 `OUT_OF_STOCK`

**响应示例**:
```json
{
  "success": false,
  "error": "BEV_VAL_002",
  "message": "饮品已售罄",
  "details": {
    "beverageId": "bev_123",
    "status": "OUT_OF_STOCK"
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- 前端显示: "该饮品已售罄"
- 操作: 禁用下单按钮

---

### BEV_VAL_003: 饮品规格无效

**HTTP 状态码**: 400

**触发场景**:
- 下单时提交的规格组合不合法（如缺少必选规格）

**处理建议**:
- 前端显示: "请选择完整的规格"
- 操作: 高亮未选择的规格项

---

### BEV_BIZ_001: 原料库存不足

**HTTP 状态码**: 422

**触发场景**:
- B端开始制作时，BOM 扣料检查发现原料库存不足

**响应示例**:
```json
{
  "success": false,
  "error": "BEV_BIZ_001",
  "message": "原料 '咖啡豆' 库存不足: 需要 50.00，可用 20.00",
  "details": {
    "skuId": "sku_001",
    "skuName": "咖啡豆",
    "required": 50.0,
    "available": 20.0
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- B端显示: "原料不足: {skuName}，请联系仓库补货"
- 操作: 订单保持 `PENDING_PRODUCTION` 状态，等待补货

---

## 订单相关错误 (ORD_*)

### ORD_NTF_001: 订单不存在

**HTTP 状态码**: 404

**触发场景**:
- 查询订单详情时，订单 ID 或订单号不存在

**响应示例**:
```json
{
  "success": false,
  "error": "ORD_NTF_001",
  "message": "订单不存在: BORDT202512271200001234",
  "details": {
    "orderNumber": "BORDT202512271200001234"
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- 前端显示: "订单不存在"
- 操作: 返回订单列表页

---

### ORD_NTF_002: 取餐号不存在

**HTTP 状态码**: 404

**触发场景**:
- 查询取餐号时，取餐号不存在

**处理建议**:
- 前端显示: "取餐号不存在"

---

### ORD_VAL_001: 订单状态无效

**HTTP 状态码**: 400

**触发场景**:
- 提交的订单状态值不在允许的枚举范围内

**处理建议**:
- 前端显示: "订单状态无效"

---

### ORD_VAL_002: 订单金额无效

**HTTP 状态码**: 400

**触发场景**:
- 订单总价 < 0
- 订单总价与订单项小计总和不匹配

**处理建议**:
- 前端显示: "订单金额计算错误"
- 操作: 重新计算订单总价

---

### ORD_VAL_003: 订单商品项为空

**HTTP 状态码**: 400

**触发场景**:
- 创建订单时，订单商品项数组为空

**响应示例**:
```json
{
  "success": false,
  "error": "ORD_VAL_003",
  "message": "订单商品项不能为空",
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- 前端显示: "请至少选择一件商品"

---

### ORD_BIZ_001: 订单状态流转非法

**HTTP 状态码**: 422

**触发场景**:
- 尝试非法的状态流转（如 `DELIVERED` -> `PRODUCING`）

**响应示例**:
```json
{
  "success": false,
  "error": "ORD_BIZ_001",
  "message": "订单状态流转非法: DELIVERED -> PRODUCING",
  "details": {
    "fromStatus": "DELIVERED",
    "toStatus": "PRODUCING"
  },
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**处理建议**:
- B端显示: "订单已完成，无法修改状态"

---

### ORD_BIZ_002: 支付失败

**HTTP 状态码**: 422

**触发场景**:
- Mock 支付失败（MVP 阶段不会触发，为后续扩展保留）

**处理建议**:
- C端显示: "支付失败，请重试"

---

### ORD_BIZ_003: BOM 扣料失败

**HTTP 状态码**: 422

**触发场景**:
- 调用 P004 库存调整 API 失败
- 库存扣减时发生错误

**处理建议**:
- B端显示: "库存扣减失败，请重试"

---

### ORD_BIZ_004: 取餐号已用尽

**HTTP 状态码**: 422

**触发场景**:
- 当日取餐号序号已达到 999 上限

**响应示例**:
```json
{
  "success": false,
  "error": "ORD_BIZ_004",
  "message": "当日取餐号已用尽（超过999）",
  "details": {
    "storeId": "store_001",
    "date": "2025-12-27",
    "maxSequence": 999
  },
  "timestamp": "2025-12-27T23:59:00Z"
}
```

**处理建议**:
- B端显示: "取餐号已用尽，请联系管理员"
- 操作: 暂停接单

---

### ORD_BIZ_005: 订单已取消，无法操作

**HTTP 状态码**: 422

**触发场景**:
- 尝试对已取消的订单进行操作（如开始制作）

**处理建议**:
- B端显示: "订单已取消，无法操作"

---

## 系统错误 (SYS_*)

### SYS_001: 数据库错误

**HTTP 状态码**: 500

**触发场景**:
- 数据库连接失败
- SQL 执行异常

**处理建议**:
- 前端显示: "系统繁忙，请稍后重试"

---

### SYS_002: 外部服务调用失败

**HTTP 状态码**: 500

**触发场景**:
- 调用 P003/P004 库存 API 失败
- Supabase 调用超时

**处理建议**:
- 前端显示: "服务暂时不可用，请稍后重试"

---

### SYS_003: 并发冲突

**HTTP 状态码**: 409

**触发场景**:
- 乐观锁冲突
- 取餐号生成时的并发冲突（Advisory Lock 失败）

**处理建议**:
- 前端显示: "操作冲突，请重试"

---

## 前端错误处理流程

```typescript
// 统一错误处理函数
function handleApiError(error: ApiError) {
  const errorCode = error.error;

  switch (errorCode) {
    case 'BEV_NTF_001':
      message.error('该饮品已下架');
      router.push('/beverages');
      break;

    case 'BEV_BIZ_001':
      notification.warning({
        message: '原料不足',
        description: error.message,
      });
      break;

    case 'ORD_BIZ_001':
      message.error('订单状态流转非法');
      break;

    default:
      message.error(error.message || '操作失败');
  }
}
```

---

## 后端异常映射

GlobalExceptionHandler 统一处理：

```java
@ExceptionHandler(BeverageException.class)
public ResponseEntity<ErrorResponse> handleBeverageException(BeverageException ex) {
    logger.warn("Beverage exception: {}", ex.getMessage());
    ErrorResponse error = ErrorResponse.of(
        ex.getErrorCode().getCode(),
        ex.getMessage(),
        ex.getDetails()
    );
    return ResponseEntity
        .status(ex.getErrorCode().getHttpStatus())
        .body(error);
}
```

---

## 变更日志

### v1.0.0 (2025-12-27)
- 初始版本，定义所有 MVP 阶段错误代码
- 覆盖饮品、订单、系统错误三大类别
- 符合 constitution.md API Error Code Standards

<!-- @spec M001-material-unit-system -->

# 采购入库换算集成文档

## 概述

本文档说明如何在采购入库业务流程中集成统一单位换算服务。

## 集成架构

```
采购订单服务 (ProcurementOrderService)
    ↓
ProcurementInboundIntegration
    ↓
ProcurementConversionService
    ↓
CommonConversionService
    ↓
    ├─→ MaterialConversion (物料级换算)
    └─→ GlobalConversion (全局换算)
```

## 业务场景

### 1. 采购订单创建

**场景**：采购1箱可乐（24瓶/箱），预估库存数量

```java
@Service
public class ProcurementOrderService {

    @Autowired
    private ProcurementInboundIntegration inboundIntegration;

    public void createPurchaseOrder(PurchaseOrderRequest request) {
        // 换算采购数量到库存数量
        BigDecimal estimatedInventory = inboundIntegration.calculateInboundQuantity(
            request.getMaterialId(),
            request.getQuantity(),      // 1箱
            request.getPurchaseUnit(),  // "箱"
            material.getInventoryUnit() // "瓶"
        );
        // estimatedInventory = 24瓶

        order.setEstimatedInventory(estimatedInventory);
    }
}
```

### 2. 收货入库

**场景**：收到2.5升糖浆，自动换算为库存单位（毫升）

```java
@Service
public class InboundReceiptService {

    @Autowired
    private ProcurementInboundIntegration inboundIntegration;

    public void receiveGoods(ReceiptRequest request) {
        BigDecimal inboundQuantity = inboundIntegration.calculateInboundQuantity(
            request.getMaterialId(),
            request.getReceivedQuantity(), // 2.5
            request.getPurchaseUnit(),     // "L"
            material.getInventoryUnit()    // "ml"
        );
        // inboundQuantity = 2500ml

        // 更新库存
        inventoryService.addInventory(materialId, inboundQuantity);
    }
}
```

### 3. 库存报表展示

**场景**：库存有5000ml糖浆，报表显示对应的采购单位数量

```java
@Service
public class InventoryReportService {

    @Autowired
    private ProcurementInboundIntegration inboundIntegration;

    public InventoryReportDTO generateReport(UUID materialId) {
        BigDecimal inventoryQty = inventoryRepository.getQuantity(materialId); // 5000ml

        BigDecimal purchaseQty = inboundIntegration.convertInventoryToPurchaseUnit(
            materialId,
            inventoryQty,     // 5000
            "ml",             // 库存单位
            "L"               // 采购单位
        );
        // purchaseQty = 5.0L

        return InventoryReportDTO.builder()
            .inventoryQuantity(inventoryQty)
            .purchaseQuantity(purchaseQty)
            .build();
    }
}
```

## 换算优先级

1. **物料级换算率优先**：如果物料配置了专属换算率（`useGlobalConversion = false`），使用物料级换算
2. **全局换算率回退**：如果物料未配置专属换算率（`useGlobalConversion = true`），使用全局换算规则

## 错误处理

### 换算不可用

```java
try {
    BigDecimal qty = inboundIntegration.calculateInboundQuantity(...);
} catch (IllegalStateException e) {
    // 换算规则不存在
    log.error("Conversion not available: {}", e.getMessage());
    throw new BusinessException("无法换算采购单位到库存单位");
}
```

### 物料不存在

```java
try {
    BigDecimal qty = procurementConversionService.convertPurchaseToInventory(...);
} catch (IllegalArgumentException e) {
    // 物料不存在
    log.error("Material not found: {}", e.getMessage());
    throw new BusinessException("物料不存在");
}
```

## 测试用例

### 单元测试

```java
@Test
void testCalculateInboundQuantity() {
    // 准备数据
    UUID materialId = UUID.randomUUID();
    BigDecimal purchaseQty = new BigDecimal("2.5"); // 2.5升

    when(procurementConversionService.canConvertPurchaseToInventory(...))
        .thenReturn(true);
    when(procurementConversionService.convertPurchaseToInventory(...))
        .thenReturn(new BigDecimal("2500.00")); // 2500毫升

    // 执行
    BigDecimal result = inboundIntegration.calculateInboundQuantity(
        materialId, purchaseQty, "L", "ml"
    );

    // 验证
    assertThat(result).isEqualByComparingTo("2500.00");
}
```

### 集成测试

```java
@SpringBootTest
class ProcurementInboundIntegrationTest {

    @Autowired
    private ProcurementInboundIntegration integration;

    @Autowired
    private MaterialRepository materialRepository;

    @Test
    void testRealConversion() {
        // 创建测试物料
        Material material = createTestMaterial();
        materialRepository.save(material);

        // 执行换算
        BigDecimal result = integration.calculateInboundQuantity(
            material.getId(),
            new BigDecimal("10.0"),
            material.getPurchaseUnit().getCode(),
            material.getInventoryUnit().getCode()
        );

        // 验证结果
        assertThat(result).isNotNull();
    }
}
```

## API 端点（可选）

如果需要前端调用换算服务：

```http
POST /api/conversions/convert
Content-Type: application/json

{
  "fromUnitCode": "L",
  "toUnitCode": "ml",
  "quantity": 2.5,
  "materialId": "uuid"
}

Response:
{
  "success": true,
  "data": {
    "convertedQuantity": 2500.00,
    "source": "MATERIAL",
    "conversionPath": "物料级换算 (MAT-RAW-001): L -> ml (率: 1000.00)"
  }
}
```

## 最佳实践

1. **总是验证换算可用性**：在执行换算前调用 `canConvert()` 验证
2. **记录换算路径**：在日志中记录换算来源（物料级/全局）
3. **精度控制**：保留6位小数精度，避免精度丢失
4. **异常传播**：将换算异常转换为业务异常，提供友好错误信息

## 后续扩展

- [ ] 支持批量换算（减少数据库查询）
- [ ] 换算缓存（提升性能）
- [ ] 换算历史记录（审计需求）
- [ ] 多级换算（A -> B -> C）

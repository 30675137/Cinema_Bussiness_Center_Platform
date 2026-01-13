<!-- @spec M001-material-unit-system -->

# BOM配方用量换算集成文档

## 概述

本文档说明如何在BOM配方管理和生产计划中集成统一单位换算服务。

## 集成架构

```
BOM服务层 (BomService)
    ↓
BomCalculationIntegration
    ↓
BomConversionService
    ↓
CommonConversionService
    ↓
    ├─→ MaterialConversion (物料级换算)
    └─→ GlobalConversion (全局换算)
```

## 业务场景

### 1. BOM配方创建验证

**场景**：创建饮品配方时，验证BOM单位可以换算为库存单位

```java
@Service
public class BomService {

    @Autowired
    private BomCalculationIntegration bomIntegration;

    public void createBom(BomCreateRequest request) {
        for (BomComponent component : request.getComponents()) {
            // 验证BOM单位可以换算为库存单位
            boolean valid = bomIntegration.validateBomUnits(
                component.getMaterialId(),
                component.getBomUnitCode(),  // "L" (配方单位)
                material.getInventoryUnit()   // "ml" (库存单位)
            );

            if (!valid) {
                throw new BusinessException(
                    "BOM单位 " + component.getBomUnitCode() +
                    " 无法换算为库存单位 " + material.getInventoryUnit()
                );
            }
        }

        bomRepository.save(bom);
    }
}
```

### 2. 生产计划 - 计算原料需求

**场景**：生产100杯可乐，计算所需糖浆用量

BOM配方：
- 成品：可乐（1杯）
- 组件：糖浆 0.05L/杯
- 库存单位：ml

```java
@Service
public class ProductionPlanService {

    @Autowired
    private BomCalculationIntegration bomIntegration;

    public ProductionPlan createProductionPlan(
        UUID productId,
        BigDecimal productQuantity) {

        List<BomComponent> components = bomRepository.findByProductId(productId);

        for (BomComponent component : components) {
            // 计算所需原料总量
            BigDecimal required = bomIntegration.calculateMaterialRequirement(
                component.getMaterialId(),
                component.getBomQuantity(),    // 0.05L/杯
                component.getBomUnitCode(),    // "L"
                component.getInventoryUnit(),  // "ml"
                productQuantity                // 100杯
            );
            // required = 5000ml (0.05L × 100 × 1000)

            plan.addRequirement(component.getMaterialId(), required);
        }

        return plan;
    }
}
```

### 3. BOM展示 - 单位统一展示

**场景**：在界面上统一展示为库存单位

```java
@Service
public class BomDisplayService {

    @Autowired
    private BomCalculationIntegration bomIntegration;

    public BomDisplayDTO getBomDisplay(UUID bomId) {
        Bom bom = bomRepository.findById(bomId);
        List<BomComponentDTO> displayComponents = new ArrayList<>();

        for (BomComponent component : bom.getComponents()) {
            // 换算为库存单位展示
            BigDecimal displayQty = bomIntegration.convertBomQuantityForDisplay(
                component.getMaterialId(),
                component.getBomQuantity(),  // 0.05L
                component.getBomUnitCode(),  // "L"
                material.getInventoryUnit()  // "ml"
            );
            // displayQty = 50ml

            displayComponents.add(BomComponentDTO.builder()
                .materialName(material.getName())
                .quantity(displayQty)
                .unit(material.getInventoryUnit())
                .build());
        }

        return BomDisplayDTO.builder()
            .components(displayComponents)
            .build();
    }
}
```

### 4. 成本核算 - 换算为成本单位

**场景**：计算成品成本，原料成本按采购单位计算

```java
@Service
public class CostCalculationService {

    @Autowired
    private BomCalculationIntegration bomIntegration;

    public BigDecimal calculateProductCost(UUID productId) {
        List<BomComponent> components = bomRepository.findByProductId(productId);
        BigDecimal totalCost = BigDecimal.ZERO;

        for (BomComponent component : components) {
            Material material = materialRepository.findById(component.getMaterialId());

            // 换算BOM用量到采购单位
            BigDecimal purchaseQty = bomIntegration.convertBomQuantityForDisplay(
                component.getMaterialId(),
                component.getBomQuantity(),      // 0.05L
                component.getBomUnitCode(),      // "L"
                material.getPurchaseUnit()       // "箱" (假设1箱=24L)
            );
            // purchaseQty = 0.05 / 24 = 0.00208箱

            BigDecimal componentCost = purchaseQty.multiply(material.getPurchasePrice());
            totalCost = totalCost.add(componentCost);
        }

        return totalCost;
    }
}
```

## BOM组件类型处理

### SKU组件

```java
// BOM组件类型为SKU（成品引用）
if (component.getComponentType() == ComponentType.SKU) {
    UUID skuId = component.getComponentId();
    // 使用SKU的库存单位进行换算
    BigDecimal required = bomIntegration.calculateMaterialRequirement(
        skuId,
        component.getBomQuantity(),
        component.getBomUnitCode(),
        sku.getInventoryUnit(),
        productQuantity
    );
}
```

### Material组件

```java
// BOM组件类型为Material（原料/包材引用）
if (component.getComponentType() == ComponentType.MATERIAL) {
    UUID materialId = component.getMaterialId();
    // 使用Material的库存单位进行换算
    BigDecimal required = bomIntegration.calculateMaterialRequirement(
        materialId,
        component.getBomQuantity(),
        component.getBomUnitCode(),
        material.getInventoryUnit(),
        productQuantity
    );
}
```

## 常见配方示例

### 饮品配方

```
成品：拿铁咖啡 1杯
组件：
  - 咖啡豆: 20g (BOM单位: g, 库存单位: g)
  - 牛奶: 0.2L (BOM单位: L, 库存单位: ml)
  - 糖浆: 0.02L (BOM单位: L, 库存单位: ml)
  - 纸杯: 1个 (BOM单位: 个, 库存单位: 个)
```

换算结果（生产100杯）：
- 咖啡豆: 20g × 100 = 2000g
- 牛奶: 0.2L × 100 × 1000 = 20000ml
- 糖浆: 0.02L × 100 × 1000 = 2000ml
- 纸杯: 1个 × 100 = 100个

### 套餐配方

```
成品：家庭套餐 1份
组件：
  - 可乐 (SKU): 4瓶
  - 爆米花 (SKU): 2桶
  - 电影票 (SKU): 4张
```

## 错误处理

### BOM单位无法换算

```java
try {
    BigDecimal required = bomIntegration.calculateMaterialRequirement(...);
} catch (IllegalStateException e) {
    log.error("BOM unit conversion failed: {}", e.getMessage());
    throw new BusinessException("BOM配方单位无法换算到库存单位");
}
```

### 组件不存在

```java
try {
    BigDecimal required = bomIntegration.calculateMaterialRequirement(...);
} catch (IllegalArgumentException e) {
    log.error("Component not found: {}", e.getMessage());
    throw new BusinessException("BOM组件不存在");
}
```

## 测试用例

### 单元测试

```java
@Test
void testCalculateMaterialRequirement() {
    UUID materialId = UUID.randomUUID();

    when(bomConversionService.canConvertBomQuantity(...)).thenReturn(true);
    when(bomConversionService.calculateRequiredQuantity(...))
        .thenReturn(new BigDecimal("5000.00"));

    BigDecimal result = bomIntegration.calculateMaterialRequirement(
        materialId,
        new BigDecimal("0.05"), // 0.05L/杯
        "L",
        "ml",
        new BigDecimal("100")   // 100杯
    );

    assertThat(result).isEqualByComparingTo("5000.00");
}
```

### 集成测试

```java
@SpringBootTest
class BomCalculationIntegrationTest {

    @Autowired
    private BomCalculationIntegration integration;

    @Autowired
    private MaterialRepository materialRepository;

    @Test
    void testRealBomConversion() {
        Material material = createTestMaterial();
        materialRepository.save(material);

        BigDecimal result = integration.calculateMaterialRequirement(
            material.getId(),
            new BigDecimal("0.05"),
            "L",
            material.getInventoryUnit().getCode(),
            new BigDecimal("100")
        );

        assertThat(result).isNotNull();
        assertThat(result).isGreaterThan(BigDecimal.ZERO);
    }
}
```

## 最佳实践

1. **BOM创建时验证单位**：确保BOM单位可以换算为库存单位
2. **保存BOM单位**：BOM组件记录应保存原始BOM单位，不要提前换算
3. **按需换算**：在使用时才进行换算，保留原始配方数据
4. **精度控制**：BOM用量保留6位小数，避免累积误差
5. **批量计算优化**：如需计算多个BOM，考虑批量换算减少数据库查询

## 后续扩展

- [ ] BOM版本管理（单位变更时的兼容性）
- [ ] BOM用量自动调整（根据库存单位优化配方）
- [ ] 成本核算优化（缓存换算结果）
- [ ] 生产损耗率计算（换算后考虑损耗）

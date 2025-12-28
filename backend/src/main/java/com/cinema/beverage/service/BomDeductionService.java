/**
 * @spec O003-beverage-order
 * BOM自动扣料服务
 */
package com.cinema.beverage.service;

import com.cinema.beverage.dto.BomItem;
import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.entity.BeverageOrderItem;
import com.cinema.beverage.exception.InsufficientInventoryException;
import com.cinema.inventory.dto.AdjustmentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

/**
 * BOM自动扣料服务
 *
 * 职责：
 * 1. 根据饮品订单计算所需原料清单
 * 2. 调用库存调整API进行自动扣料
 * 3. 记录扣料结果和失败信息
 *
 * US2: B端订单接收与出品
 * AC3: 自动BOM扣料（根据配方扣减原料库存）
 */
@Service
public class BomDeductionService {

    private static final Logger logger = LoggerFactory.getLogger(BomDeductionService.class);

    private final RestTemplate restTemplate;
    private final BomRecipeService bomRecipeService;
    private final InventoryIntegrationService inventoryService;

    public BomDeductionService(RestTemplate restTemplate, BomRecipeService bomRecipeService,
                               InventoryIntegrationService inventoryService) {
        this.restTemplate = restTemplate;
        this.bomRecipeService = bomRecipeService;
        this.inventoryService = inventoryService;
    }

    /**
     * 执行订单的BOM自动扣料 (T088: 添加事务管理和库存验证)
     *
     * @param order 已完成制作的订单
     * @return 扣料结果汇总
     */
    @Transactional(rollbackFor = Exception.class)
    public BomDeductionResult deductMaterialsForOrder(BeverageOrder order) {
        // Structured logging for BOM deduction start (FR-027)
        logger.info("BomDeduction - START: orderNumber={}, orderId={}, storeId={}, operation=BOM_DEDUCT",
                order.getOrderNumber(), order.getId(), order.getStoreId());

        BomDeductionResult result = new BomDeductionResult();
        result.setOrderId(order.getId());
        result.setOrderNumber(order.getOrderNumber());
        result.setStoreId(order.getStoreId());

        try {
            // 1. 计算订单所需原料清单
            List<MaterialDeductionItem> materialItems = calculateMaterialRequirements(order);
            result.setTotalMaterials(materialItems.size());

            if (materialItems.isEmpty()) {
                logger.warn("BomDeduction - SKIP: orderNumber={}, orderId={}, operation=BOM_DEDUCT, reason=NO_MATERIALS",
                        order.getOrderNumber(), order.getId());
                result.setSuccess(true);
                return result;
            }

            // 2. T088: 验证所有库存充足性（在扣料前验证，避免部分成功部分失败）
            validateInventory(materialItems, order);

            // 3. 执行扣料（验证通过后，一次性扣减所有原料）
            int successCount = 0;
            for (MaterialDeductionItem item : materialItems) {
                performInventoryDeduction(item, order);
                successCount++;
                result.addSuccessItem(item);
            }

            result.setSuccessCount(successCount);
            result.setSuccess(true);

            // Structured logging for complete success (FR-027)
            logger.info("BomDeduction - SUCCESS: orderNumber={}, orderId={}, totalMaterials={}, successCount={}, operation=BOM_DEDUCT",
                    order.getOrderNumber(), order.getId(), materialItems.size(), successCount);

        } catch (InsufficientInventoryException e) {
            // T088: 库存不足异常，触发事务回滚
            logger.error("BomDeduction - INSUFFICIENT_INVENTORY: orderNumber={}, orderId={}, operation=BOM_DEDUCT, error={}",
                    order.getOrderNumber(), order.getId(), e.getMessage());
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
            throw e; // 重新抛出异常以触发事务回滚
        } catch (Exception e) {
            // Structured logging for execution failure (FR-027)
            logger.error("BomDeduction - FAILED: orderNumber={}, orderId={}, operation=BOM_DEDUCT, error={}",
                    order.getOrderNumber(), order.getId(), e.getMessage(), e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
            throw new RuntimeException("BOM扣料失败: " + e.getMessage(), e); // 触发事务回滚
        }

        return result;
    }

    /**
     * T088: 验证库存充足性
     *
     * 在执行扣料前，验证所有原料的库存是否充足
     * 如果任何一项库存不足，抛出异常，事务回滚
     *
     * @param materialItems 原料清单
     * @param order 订单信息
     * @throws InsufficientInventoryException 库存不足异常
     */
    private void validateInventory(List<MaterialDeductionItem> materialItems, BeverageOrder order) {
        logger.info("InventoryValidation - START: orderNumber={}, orderId={}, materialCount={}, operation=VALIDATE_INVENTORY",
                order.getOrderNumber(), order.getId(), materialItems.size());

        List<String> insufficientItems = new ArrayList<>();

        for (MaterialDeductionItem item : materialItems) {
            try {
                // T086: 查询当前库存（使用 InventoryIntegrationService）
                InventoryIntegrationService.InventoryInfo inventory = queryInventory(item.getSkuId(), item.getStoreId());

                if (inventory == null) {
                    String error = String.format("库存记录不存在: %s (SKU: %s)", item.getMaterialName(), item.getSkuId());
                    insufficientItems.add(error);
                    logger.warn("InventoryValidation - NOT_FOUND: orderNumber={}, orderId={}, skuId={}, materialName={}, storeId={}, operation=VALIDATE_INVENTORY",
                            order.getOrderNumber(), order.getId(), item.getSkuId(), item.getMaterialName(), item.getStoreId());
                    continue;
                }

                // 获取可用库存数量
                BigDecimal availableQty = getAvailableQty(inventory);
                BigDecimal requiredQty = BigDecimal.valueOf(item.getQuantity());

                // 验证库存是否充足
                if (availableQty.compareTo(requiredQty) < 0) {
                    String error = String.format("%s: 可用库存 %s %s < 需求 %s %s",
                            item.getMaterialName(), availableQty, item.getUnit(), requiredQty, item.getUnit());
                    insufficientItems.add(error);
                    logger.warn("InventoryValidation - INSUFFICIENT: orderNumber={}, orderId={}, skuId={}, materialName={}, available={}, required={}, unit={}, operation=VALIDATE_INVENTORY",
                            order.getOrderNumber(), order.getId(), item.getSkuId(), item.getMaterialName(),
                            availableQty, requiredQty, item.getUnit());
                } else {
                    logger.debug("InventoryValidation - OK: orderNumber={}, orderId={}, skuId={}, materialName={}, available={}, required={}, unit={}, operation=VALIDATE_INVENTORY",
                            order.getOrderNumber(), order.getId(), item.getSkuId(), item.getMaterialName(),
                            availableQty, requiredQty, item.getUnit());
                }
            } catch (Exception e) {
                String error = String.format("%s: 库存查询失败 - %s", item.getMaterialName(), e.getMessage());
                insufficientItems.add(error);
                logger.error("InventoryValidation - QUERY_FAILED: orderNumber={}, orderId={}, skuId={}, materialName={}, operation=VALIDATE_INVENTORY, error={}",
                        order.getOrderNumber(), order.getId(), item.getSkuId(), item.getMaterialName(), e.getMessage());
            }
        }

        // 如果有任何库存不足，抛出异常
        if (!insufficientItems.isEmpty()) {
            String errorMessage = "库存不足，无法完成扣料:\n" + String.join("\n", insufficientItems);
            logger.error("InventoryValidation - FAILED: orderNumber={}, orderId={}, insufficientCount={}, operation=VALIDATE_INVENTORY",
                    order.getOrderNumber(), order.getId(), insufficientItems.size());
            throw new InsufficientInventoryException(errorMessage);
        }

        logger.info("InventoryValidation - SUCCESS: orderNumber={}, orderId={}, materialCount={}, operation=VALIDATE_INVENTORY",
                order.getOrderNumber(), order.getId(), materialItems.size());
    }

    /**
     * T086: 查询库存信息（使用 InventoryIntegrationService）
     *
     * @param skuId SKU ID
     * @param storeId 门店 ID
     * @return 库存信息
     */
    private InventoryIntegrationService.InventoryInfo queryInventory(UUID skuId, UUID storeId) {
        return inventoryService.queryInventory(skuId, storeId);
    }

    /**
     * T086: 从库存信息中提取可用数量
     *
     * @param inventory 库存信息
     * @return 可用数量
     */
    private BigDecimal getAvailableQty(InventoryIntegrationService.InventoryInfo inventory) {
        return inventory != null ? inventory.getAvailableQty() : BigDecimal.ZERO;
    }

    /**
     * 计算订单所需原料清单
     */
    private List<MaterialDeductionItem> calculateMaterialRequirements(BeverageOrder order) {
        Map<UUID, MaterialDeductionItem> materialMap = new HashMap<>();

        for (BeverageOrderItem orderItem : order.getItems()) {
            // 获取饮品配方
            List<BomItem> bomItems = bomRecipeService.getRecipeByBeverageId(orderItem.getBeverageId());

            for (BomItem bomItem : bomItems) {
                int totalQuantity = bomItem.getQuantity() * orderItem.getQuantity();

                materialMap.compute(bomItem.getSkuId(), (skuId, existing) -> {
                    if (existing == null) {
                        return MaterialDeductionItem.builder()
                                .skuId(skuId)
                                .materialName(bomItem.getMaterialName())
                                .quantity(totalQuantity)
                                .unit(bomItem.getUnit())
                                .storeId(order.getStoreId())
                                .build();
                    } else {
                        existing.setQuantity(existing.getQuantity() + totalQuantity);
                        return existing;
                    }
                });
            }
        }

        return new ArrayList<>(materialMap.values());
    }

    /**
     * 执行单个原料的库存扣减
     */
    private void performInventoryDeduction(MaterialDeductionItem item, BeverageOrder order) {
        AdjustmentRequest request = AdjustmentRequest.builder()
                .skuId(item.getSkuId().toString())
                .storeId(item.getStoreId().toString())
                .adjustmentType("shortage") // 使用盘亏类型扣减
                .quantity(item.getQuantity())
                .reasonCode("BOM_DEDUCTION")
                .reasonText("饮品订单自动扣料")
                .remarks(String.format("订单号: %s, 饮品制作完成", order.getOrderNumber()))
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AdjustmentRequest> requestEntity = new HttpEntity<>(request, headers);

        // 调用库存调整API
        String apiUrl = "http://localhost:8080/api/adjustments";

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("库存调整API调用失败: " + response.getStatusCode());
            }

            // Structured logging for successful inventory deduction (FR-027)
            logger.info("InventoryDeduction - SUCCESS: orderNumber={}, orderId={}, skuId={}, materialName={}, quantity={}, unit={}, storeId={}, operation=INVENTORY_DEDUCT",
                    order.getOrderNumber(), order.getId(), item.getSkuId(), item.getMaterialName(),
                    item.getQuantity(), item.getUnit(), item.getStoreId());
        } catch (Exception e) {
            // Structured logging for failed inventory deduction (FR-027)
            logger.error("InventoryDeduction - FAILED: orderNumber={}, orderId={}, skuId={}, materialName={}, quantity={}, unit={}, storeId={}, operation=INVENTORY_DEDUCT, error={}",
                    order.getOrderNumber(), order.getId(), item.getSkuId(), item.getMaterialName(),
                    item.getQuantity(), item.getUnit(), item.getStoreId(), e.getMessage());
            throw e;
        }
    }

    /**
     * 原料扣料项
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MaterialDeductionItem {
        private UUID skuId;
        private String materialName;
        private Integer quantity;
        private String unit;
        private UUID storeId;
    }

    /**
     * BOM扣料结果
     */
    @lombok.Data
    public static class BomDeductionResult {
        private UUID orderId;
        private String orderNumber;
        private UUID storeId;
        private boolean success;
        private int totalMaterials;
        private int successCount;
        private int failureCount;
        private String errorMessage;
        private List<MaterialDeductionItem> successItems = new ArrayList<>();
        private Map<MaterialDeductionItem, String> failureItems = new HashMap<>();

        public void addSuccessItem(MaterialDeductionItem item) {
            successItems.add(item);
        }

        public void addFailureItem(MaterialDeductionItem item, String error) {
            failureItems.put(item, error);
            failureCount++;
        }
    }
}

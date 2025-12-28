/**
 * @spec O003-beverage-order
 * 库存集成服务 (T086)
 */
package com.cinema.beverage.service;

import com.cinema.inventory.dto.AdjustmentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * 库存集成服务
 *
 * 职责:
 * 1. 封装库存查询 API 调用（P003）
 * 2. 封装库存调整 API 调用（P004）
 * 3. 提供统一的错误处理和日志记录
 *
 * 目的: 降低 BomDeductionService 的耦合度，便于维护和测试
 */
@Service
public class InventoryIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(InventoryIntegrationService.class);

    private final RestTemplate restTemplate;

    @Value("${inventory.api.base-url:http://localhost:8080}")
    private String inventoryApiBaseUrl;

    public InventoryIntegrationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 查询库存信息
     *
     * @param skuId SKU ID
     * @param storeId 门店 ID
     * @return 库存信息（包含 availableQty, onHandQty, reservedQty 等）
     */
    public InventoryInfo queryInventory(UUID skuId, UUID storeId) {
        String apiUrl = String.format("%s/api/inventory/check?skuId=%s&storeId=%s",
                inventoryApiBaseUrl, skuId, storeId);

        try {
            logger.debug("Querying inventory: skuId={}, storeId={}, url={}", skuId, storeId, apiUrl);

            ResponseEntity<Map> response = restTemplate.getForEntity(apiUrl, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();

                // ApiResponse<T> 格式: {success: true, data: {...}}
                if (Boolean.TRUE.equals(body.get("success")) && body.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    return mapToInventoryInfo(data);
                }
            }

            logger.warn("Inventory query returned no data: skuId={}, storeId={}", skuId, storeId);
            return null;

        } catch (Exception e) {
            logger.error("Failed to query inventory: skuId={}, storeId={}, error={}",
                    skuId, storeId, e.getMessage());
            throw new InventoryApiException("库存查询失败: " + e.getMessage(), e);
        }
    }

    /**
     * 执行库存调整（扣减）
     *
     * @param request 调整请求
     * @return 是否成功
     */
    public boolean adjustInventory(AdjustmentRequest request) {
        String apiUrl = inventoryApiBaseUrl + "/api/adjustments";

        try {
            logger.debug("Adjusting inventory: skuId={}, storeId={}, type={}, quantity={}, url={}",
                    request.getSkuId(), request.getStoreId(), request.getAdjustmentType(),
                    request.getQuantity(), apiUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AdjustmentRequest> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Inventory adjusted successfully: skuId={}, storeId={}, quantity={}",
                        request.getSkuId(), request.getStoreId(), request.getQuantity());
                return true;
            } else {
                logger.error("Inventory adjustment failed: status={}, skuId={}, storeId={}",
                        response.getStatusCode(), request.getSkuId(), request.getStoreId());
                return false;
            }

        } catch (Exception e) {
            logger.error("Failed to adjust inventory: skuId={}, storeId={}, error={}",
                    request.getSkuId(), request.getStoreId(), e.getMessage());
            throw new InventoryApiException("库存调整失败: " + e.getMessage(), e);
        }
    }

    /**
     * 批量查询库存信息
     *
     * @param skuIds SKU ID 列表
     * @param storeId 门店 ID
     * @return 库存信息列表
     */
    public Map<UUID, InventoryInfo> batchQueryInventory(Iterable<UUID> skuIds, UUID storeId) {
        Map<UUID, InventoryInfo> inventoryMap = new java.util.HashMap<>();

        for (UUID skuId : skuIds) {
            try {
                InventoryInfo info = queryInventory(skuId, storeId);
                if (info != null) {
                    inventoryMap.put(skuId, info);
                }
            } catch (Exception e) {
                logger.warn("Failed to query inventory for SKU {}: {}", skuId, e.getMessage());
            }
        }

        return inventoryMap;
    }

    /**
     * 映射库存数据到 InventoryInfo 对象
     */
    private InventoryInfo mapToInventoryInfo(Map<String, Object> data) {
        InventoryInfo info = new InventoryInfo();
        info.setId(parseUUID(data.get("id")));
        info.setSkuId(parseUUID(data.get("skuId")));
        info.setStoreId(parseUUID(data.get("storeId")));
        info.setAvailableQty(parseBigDecimal(data.get("availableQty"), data.get("available_qty")));
        info.setOnHandQty(parseBigDecimal(data.get("onHandQty"), data.get("on_hand_qty")));
        info.setReservedQty(parseBigDecimal(data.get("reservedQty"), data.get("reserved_qty")));
        info.setSafetyStock(parseBigDecimal(data.get("safetyStock"), data.get("safety_stock")));
        return info;
    }

    /**
     * 解析 UUID
     */
    private UUID parseUUID(Object value) {
        if (value instanceof String) {
            try {
                return UUID.fromString((String) value);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * 解析 BigDecimal（支持多种字段命名）
     */
    private BigDecimal parseBigDecimal(Object... values) {
        for (Object value : values) {
            if (value instanceof Number) {
                return BigDecimal.valueOf(((Number) value).doubleValue());
            } else if (value instanceof String) {
                try {
                    return new BigDecimal((String) value);
                } catch (NumberFormatException e) {
                    // 继续尝试下一个值
                }
            }
        }
        return BigDecimal.ZERO;
    }

    /**
     * 库存信息 DTO
     */
    public static class InventoryInfo {
        private UUID id;
        private UUID skuId;
        private UUID storeId;
        private BigDecimal availableQty;
        private BigDecimal onHandQty;
        private BigDecimal reservedQty;
        private BigDecimal safetyStock;

        // Getters and Setters

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public UUID getSkuId() {
            return skuId;
        }

        public void setSkuId(UUID skuId) {
            this.skuId = skuId;
        }

        public UUID getStoreId() {
            return storeId;
        }

        public void setStoreId(UUID storeId) {
            this.storeId = storeId;
        }

        public BigDecimal getAvailableQty() {
            return availableQty;
        }

        public void setAvailableQty(BigDecimal availableQty) {
            this.availableQty = availableQty;
        }

        public BigDecimal getOnHandQty() {
            return onHandQty;
        }

        public void setOnHandQty(BigDecimal onHandQty) {
            this.onHandQty = onHandQty;
        }

        public BigDecimal getReservedQty() {
            return reservedQty;
        }

        public void setReservedQty(BigDecimal reservedQty) {
            this.reservedQty = reservedQty;
        }

        public BigDecimal getSafetyStock() {
            return safetyStock;
        }

        public void setSafetyStock(BigDecimal safetyStock) {
            this.safetyStock = safetyStock;
        }
    }

    /**
     * 库存 API 调用异常
     */
    public static class InventoryApiException extends RuntimeException {
        public InventoryApiException(String message) {
            super(message);
        }

        public InventoryApiException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

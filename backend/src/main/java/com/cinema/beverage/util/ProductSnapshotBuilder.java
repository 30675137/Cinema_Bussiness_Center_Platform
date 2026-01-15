/**
 * @spec O013-order-channel-migration
 * 商品快照构建工具
 */
package com.cinema.beverage.util;

import com.cinema.channelproduct.domain.ChannelProductConfig;
import com.cinema.channelproduct.domain.ChannelProductSpec;
import com.cinema.hallstore.domain.Sku;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品快照构建器
 * 
 * @spec O013-order-channel-migration
 * 用于在下单时创建商品快照，保存下单时的完整商品信息
 */
@Component
@RequiredArgsConstructor
public class ProductSnapshotBuilder {

    private static final Logger logger = LoggerFactory.getLogger(ProductSnapshotBuilder.class);

    private final ObjectMapper objectMapper;

    /**
     * 构建商品快照
     *
     * @param channelProduct 渠道商品配置
     * @param sku SKU 信息
     * @param selectedSpecs 选中的规格 (可选)
     * @return JSON 格式的商品快照
     */
    public String buildSnapshot(
            ChannelProductConfig channelProduct, 
            Sku sku, 
            Map<String, Object> selectedSpecs) {
        
        Map<String, Object> snapshot = new HashMap<>();
        
        // 快照时间戳
        snapshot.put("snapshotAt", LocalDateTime.now().toString());
        
        // 渠道商品信息
        Map<String, Object> channelProductInfo = new HashMap<>();
        channelProductInfo.put("id", channelProduct.getId().toString());
        channelProductInfo.put("displayName", channelProduct.getDisplayName());
        channelProductInfo.put("channelType", channelProduct.getChannelType().name());
        channelProductInfo.put("channelPrice", channelProduct.getChannelPrice());
        channelProductInfo.put("mainImage", channelProduct.getMainImage());
        channelProductInfo.put("description", channelProduct.getDescription());
        
        // 规格配置
        List<ChannelProductSpec> specs = channelProduct.getSpecs();
        if (specs != null && !specs.isEmpty()) {
            channelProductInfo.put("specs", specs);
        }
        
        snapshot.put("channelProduct", channelProductInfo);
        
        // SKU 信息
        Map<String, Object> skuInfo = new HashMap<>();
        skuInfo.put("id", sku.getId().toString());
        skuInfo.put("code", sku.getCode());
        skuInfo.put("name", sku.getName());
        skuInfo.put("price", sku.getPrice());
        skuInfo.put("skuType", sku.getSkuType().name());
        snapshot.put("sku", skuInfo);
        
        // 选中的规格
        if (selectedSpecs != null && !selectedSpecs.isEmpty()) {
            snapshot.put("selectedSpecs", selectedSpecs);
        }
        
        // 计算实际价格 (分)
        Long effectivePrice = channelProduct.getChannelPrice();
        if (effectivePrice == null && sku.getPrice() != null) {
            // 如果渠道价格为空，使用 SKU 价格（元 -> 分）
            effectivePrice = sku.getPrice().multiply(new BigDecimal("100")).longValue();
        }
        
        // 加上规格调整价格
        if (selectedSpecs != null) {
            for (Object specValue : selectedSpecs.values()) {
                if (specValue instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> specOption = (Map<String, Object>) specValue;
                    Object priceAdjust = specOption.get("priceAdjust");
                    if (priceAdjust instanceof Number) {
                        effectivePrice += ((Number) priceAdjust).longValue();
                    }
                }
            }
        }
        snapshot.put("effectivePrice", effectivePrice);
        
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            logger.error("构建商品快照失败: channelProductId={}", channelProduct.getId(), e);
            return "{}";
        }
    }

    /**
     * 简化版本：仅从渠道商品构建快照
     *
     * @param channelProduct 渠道商品配置
     * @param sku SKU 信息
     * @return JSON 格式的商品快照
     */
    public String buildSnapshot(ChannelProductConfig channelProduct, Sku sku) {
        return buildSnapshot(channelProduct, sku, null);
    }
}

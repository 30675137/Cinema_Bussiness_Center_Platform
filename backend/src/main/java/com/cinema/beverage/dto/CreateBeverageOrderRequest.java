/**
 * @spec O003-beverage-order
 * @spec O013-order-channel-migration
 * 创建订单请求DTO
 */
package com.cinema.beverage.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 创建订单请求
 *
 * 对应 spec: O003-beverage-order, O013-order-channel-migration
 * 使用场景: C端创建订单
 * 
 * @spec O013-order-channel-migration 变更说明:
 * - OrderItemRequest.skuId 已废弃，使用 channelProductId 替代
 * - selectedSpecs 格式更新为新结构
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBeverageOrderRequest {

    /**
     * 门店ID
     */
    @NotNull(message = "门店ID不能为空")
    private UUID storeId;

    /**
     * 订单项列表
     */
    @NotEmpty(message = "订单商品项不能为空")
    @Valid
    private List<OrderItemRequest> items;

    /**
     * 顾客备注
     */
    @Size(max = 500, message = "备注长度不能超过500")
    private String customerNote;

    /**
     * 订单项请求
     * 
     * @spec O013-order-channel-migration 迁移说明:
     * - 新增 channelProductId 字段，作为主要商品标识
     * - skuId 字段已废弃，保留用于向后兼容
     * - selectedSpecs 格式支持新旧两种结构
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {

        /**
         * @spec O013-order-channel-migration 渠道商品配置 ID
         * 关联 channel_product_config 表，作为主要商品标识
         * 优先使用此字段，如果为空则回退到 skuId
         */
        private UUID channelProductId;

        /**
         * @deprecated @spec O013-order-channel-migration
         * 已废弃字段，保留用于向后兼容
         * 新订单请使用 channelProductId
         */
        @Deprecated
        private UUID skuId;

        /**
         * @spec O013-order-channel-migration 选中的规格
         * 新格式: {"SIZE": {"optionId": "xxx", "optionName": "大杯", "priceAdjust": 300}}
         * 旧格式 (兼容): {"size": "大杯", "temperature": "热"}
         * 
         * 后端会自动检测格式并进行转换
         */
        private Map<String, Object> selectedSpecs;

        /**
         * 数量
         */
        @NotNull(message = "数量不能为空")
        @Min(value = 1, message = "数量至少为1")
        private Integer quantity;

        /**
         * 顾客备注
         */
        @Size(max = 200, message = "备注长度不能超过200")
        private String customerNote;

        /**
         * 获取有效的商品ID
         * @spec O013-order-channel-migration 优先返回 channelProductId，如果为空则返回 skuId
         * @return 商品ID (渠道商品ID 或 SKU ID)
         */
        public UUID getEffectiveProductId() {
            return channelProductId != null ? channelProductId : skuId;
        }
    }
}

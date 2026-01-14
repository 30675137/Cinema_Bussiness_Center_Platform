/**
 * @spec O003-beverage-order
 * @spec O013-order-channel-migration
 * 订单数据传输对象
 */
package com.cinema.beverage.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.entity.BeverageOrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 订单DTO
 *
 * 对应 spec: O003-beverage-order, O013-order-channel-migration
 * 使用场景: C端订单列表、B端订单管理
 * 
 * @spec O013-order-channel-migration 变更说明:
 * - OrderItemDTO 新增 channelProductId, productName, productImageUrl, productSnapshot 字段
 * - 保留 beverageId, beverageName, beverageImageUrl 用于向后兼容
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageOrderDTO {

    /**
     * 订单ID
     */
    private UUID id;

    /**
     * 订单号
     */
    private String orderNumber;

    /**
     * 用户ID
     */
    private UUID userId;

    /**
     * 门店ID
     */
    private UUID storeId;

    /**
     * 订单总价
     */
    private BigDecimal totalPrice;

    /**
     * 订单状态
     */
    private String status;

    /**
     * 支付方式
     */
    private String paymentMethod;

    /**
     * 交易ID
     */
    private String transactionId;

    /**
     * 支付时间
     */
    private LocalDateTime paidAt;

    /**
     * 制作开始时间
     */
    private LocalDateTime productionStartTime;

    /**
     * 制作完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 交付时间
     */
    private LocalDateTime deliveredAt;

    /**
     * 取消时间
     */
    private LocalDateTime cancelledAt;

    /**
     * 顾客备注
     */
    private String customerNote;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 订单项列表
     */
    private List<OrderItemDTO> items;

    /**
     * 取餐号
     */
    private String queueNumber;

    /**
     * 库存预占状态
     * 2026-01-14: 新增用于E2E测试
     */
    private String reservationStatus;

    /**
     * 从实体转换为DTO
     */
    public static BeverageOrderDTO fromEntity(BeverageOrder order) {
        return fromEntity(order, null);
    }

    /**
     * 从实体转换为DTO（带取餐号）
     */
    public static BeverageOrderDTO fromEntity(BeverageOrder order, String queueNumber) {
        return fromEntity(order, queueNumber, null);
    }

    /**
     * 从实体转换为DTO（带取餐号和库存预占状态）
     * 2026-01-14: 新增reservationStatus参数
     */
    public static BeverageOrderDTO fromEntity(BeverageOrder order, String queueNumber, String reservationStatus) {
        if (order == null) {
            return null;
        }

        List<OrderItemDTO> itemDTOs = order.getItems() != null
                ? order.getItems().stream().map(OrderItemDTO::fromEntity).collect(Collectors.toList())
                : List.of();

        // 计算预占状态（如果未传入）
        String resStatus = reservationStatus;
        if (resStatus == null) {
            resStatus = switch (order.getStatus()) {
                case CANCELLED -> "CANCELLED";
                case PENDING_PAYMENT, PENDING_PRODUCTION, PRODUCING, COMPLETED -> "RESERVED";
                case DELIVERED -> "RELEASED";
            };
        }

        return BeverageOrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .storeId(order.getStoreId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .paymentMethod(order.getPaymentMethod())
                .transactionId(order.getTransactionId())
                .paidAt(order.getPaidAt())
                .productionStartTime(order.getProductionStartTime())
                .completedAt(order.getCompletedAt())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .customerNote(order.getCustomerNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemDTOs)
                .queueNumber(queueNumber)
                .reservationStatus(resStatus)
                .build();
    }

    /**
     * 订单项DTO
     * 
     * @spec O013-order-channel-migration 迁移说明:
     * - 新增 channelProductId, productName, productImageUrl, productSnapshot 字段
     * - 保留 beverageId, beverageName, beverageImageUrl 用于向后兼容
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        /**
         * 订单项ID
         */
        private UUID id;

        /**
         * @spec O013-order-channel-migration 渠道商品配置 ID
         * 关联 channel_product_config 表
         */
        private UUID channelProductId;

        /**
         * @spec O013-order-channel-migration SKU ID
         * 用于库存扣减
         */
        private UUID skuId;

        /**
         * @deprecated @spec O013-order-channel-migration
         * 已废弃字段，保留用于向后兼容
         */
        @Deprecated
        private UUID beverageId;

        /**
         * @spec O013-order-channel-migration 商品名称快照
         */
        private String productName;

        /**
         * @spec O013-order-channel-migration 商品图片URL快照
         */
        private String productImageUrl;

        /**
         * @spec O013-order-channel-migration 商品快照 (JSON字符串)
         * 包含下单时的完整商品信息
         */
        private String productSnapshot;

        /**
         * @deprecated @spec O013-order-channel-migration
         * 已废弃，使用 productName 替代
         */
        @Deprecated
        private String beverageName;

        /**
         * @deprecated @spec O013-order-channel-migration
         * 已废弃，使用 productImageUrl 替代
         */
        @Deprecated
        private String beverageImageUrl;

        /**
         * 选中的规格 (JSON字符串)
         */
        private String selectedSpecs;

        /**
         * 数量
         */
        private Integer quantity;

        /**
         * 单价
         */
        private BigDecimal unitPrice;

        /**
         * 小计
         */
        private BigDecimal subtotal;

        /**
         * 顾客备注
         */
        private String customerNote;

        /**
         * 从实体转换为DTO
         * @spec O013-order-channel-migration 支持新旧字段兼容
         */
        public static OrderItemDTO fromEntity(BeverageOrderItem item) {
            if (item == null) {
                return null;
            }

            // @spec O013-order-channel-migration 字段映射:
            // - 新字段: channelProductId, skuId, productName, productImageUrl, productSnapshot
            // - 旧字段 (兼容): beverageId, beverageName, beverageImageUrl
            UUID channelProductId = item.getChannelProductId();
            UUID skuId = item.getSkuId();
            String productName = item.getProductName();
            String productImageUrl = item.getProductImageUrl();
            String productSnapshot = item.getProductSnapshot();
            
            // 向后兼容: 旧字段使用新字段的值填充
            UUID beverageId = item.getBeverageId() != null ? item.getBeverageId() : skuId;

            return OrderItemDTO.builder()
                    .id(item.getId())
                    // 新字段
                    .channelProductId(channelProductId)
                    .skuId(skuId)
                    .productName(productName)
                    .productImageUrl(productImageUrl)
                    .productSnapshot(productSnapshot)
                    // 旧字段 (向后兼容)
                    .beverageId(beverageId)
                    .beverageName(productName) // 使用新字段值
                    .beverageImageUrl(productImageUrl) // 使用新字段值
                    // 其他字段
                    .selectedSpecs(item.getSelectedSpecs())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .subtotal(item.getSubtotal())
                    .customerNote(item.getCustomerNote())
                    .build();
        }
    }
}

/**
 * @spec O003-beverage-order
 * 饮品订单数据传输对象
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
 * 饮品订单DTO
 *
 * 对应 spec: O003-beverage-order
 * 使用场景: C端订单列表、B端订单管理
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
         * 饮品ID
         * 2026-01-14: 使用beverage_id字段（实际存储SKU ID）
         */
        private UUID beverageId;

        /**
         * SKU ID（2026-01-14重构后的主字段）
         */
        private UUID skuId;

        /**
         * 饮品名称
         */
        private String beverageName;

        /**
         * 饮品图片URL
         */
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
         * 2026-01-14：支持新旧字段兼容
         */
        public static OrderItemDTO fromEntity(BeverageOrderItem item) {
            if (item == null) {
                return null;
            }

            // 2026-01-14: 使用beverage_id字段（实际存储的是SKU ID）
            UUID beverageId = item.getBeverageId();

            return OrderItemDTO.builder()
                    .id(item.getId())
                    .beverageId(beverageId) // 实际存储SKU ID
                    .skuId(beverageId) // skuId字段使用相同值
                    .beverageName(item.getBeverageName())
                    .beverageImageUrl(item.getBeverageImageUrl())
                    .selectedSpecs(item.getSelectedSpecs())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .subtotal(item.getSubtotal())
                    .customerNote(item.getCustomerNote())
                    .build();
        }
    }
}

/**
 * @spec O003-beverage-order
 * 统一订单 DTO - 合并商品订单和饮品订单
 */
package com.cinema.order.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 统一订单 DTO
 *
 * 用于在订单列表中同时展示商品订单和饮品订单
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedOrderDTO {

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
     * 用户名（冗余字段，便于显示）
     */
    private String userName;

    /**
     * 订单类型: PRODUCT(商品订单), BEVERAGE(饮品订单)
     */
    private OrderType orderType;

    /**
     * 订单状态
     */
    private String status;

    /**
     * 订单总价
     */
    private BigDecimal totalPrice;

    /**
     * 支付方式
     */
    private String paymentMethod;

    /**
     * 支付时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paidAt;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 订单类型枚举
     */
    public enum OrderType {
        /**
         * 商品订单（商城购物订单）
         */
        PRODUCT,

        /**
         * 饮品订单（堂食饮品订单）
         */
        BEVERAGE
    }
}

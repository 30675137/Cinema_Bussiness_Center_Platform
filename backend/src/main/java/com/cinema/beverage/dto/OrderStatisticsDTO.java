/**
 * @spec O003-beverage-order
 * 订单统计 DTO
 */
package com.cinema.beverage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 订单统计 DTO
 *
 * 用于 B端 营业统计功能
 * US3: 订单历史与统计 - FR-022
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatisticsDTO {

    /**
     * 统计时间范围
     */
    private DateRangeDTO dateRange;

    /**
     * 订单统计
     */
    private OrderMetrics orderMetrics;

    /**
     * 销售统计
     */
    private SalesMetrics salesMetrics;

    /**
     * 热销饮品排行
     */
    private List<BestSellingItem> bestSellingBeverages;

    /**
     * 门店ID（可选，用于门店级统计）
     */
    private UUID storeId;

    /**
     * 时间范围 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DateRangeDTO {
        private LocalDate startDate;
        private LocalDate endDate;
        private String rangeType; // TODAY, WEEK, MONTH, CUSTOM
    }

    /**
     * 订单指标
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderMetrics {
        /**
         * 总订单数
         */
        private Long totalOrders;

        /**
         * 已完成订单数
         */
        private Long completedOrders;

        /**
         * 已取消订单数
         */
        private Long cancelledOrders;

        /**
         * 订单完成率（%）
         */
        private Double completionRate;

        /**
         * 平均制作时长（分钟）
         */
        private Double averagePreparationTime;
    }

    /**
     * 销售指标
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesMetrics {
        /**
         * 总销售额（元）
         */
        private BigDecimal totalRevenue;

        /**
         * 平均客单价（元）
         */
        private BigDecimal averageOrderValue;

        /**
         * 总销售数量（杯数）
         */
        private Long totalQuantity;

        /**
         * 最畅销饮品名称
         */
        private String topSellingBeverage;

        /**
         * 最畅销饮品销量
         */
        private Long topSellingQuantity;
    }

    /**
     * 热销商品项
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BestSellingItem {
        /**
         * 饮品ID
         */
        private UUID beverageId;

        /**
         * 饮品名称
         */
        private String beverageName;

        /**
         * 销售数量
         */
        private Long quantity;

        /**
         * 销售额
         */
        private BigDecimal revenue;

        /**
         * 销售占比（%）
         */
        private Double percentage;

        /**
         * 排名
         */
        private Integer rank;
    }
}

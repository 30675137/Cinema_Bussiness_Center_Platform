/**
 * @spec O003-beverage-order
 * 销售报表 DTO
 */
package com.cinema.beverage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 销售报表 DTO
 *
 * 用于 B端 报表导出功能（Excel格式）
 * US3: 订单历史与统计 - FR-023
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportDTO {

    /**
     * 报表元数据
     */
    private ReportMetadata metadata;

    /**
     * 汇总数据
     */
    private SummaryStat statistics;

    /**
     * 订单明细列表
     */
    private List<OrderDetailRow> orderDetails;

    /**
     * 热销商品列表
     */
    private List<BestSellingRow> bestSellingItems;

    /**
     * 原料消耗统计
     */
    private List<MaterialConsumptionRow> materialConsumption;

    /**
     * 报表元数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportMetadata {
        /**
         * 报表标题
         */
        private String title;

        /**
         * 报表类型（DAILY, WEEKLY, MONTHLY, CUSTOM）
         */
        private String reportType;

        /**
         * 起始日期
         */
        private LocalDate startDate;

        /**
         * 截止日期
         */
        private LocalDate endDate;

        /**
         * 门店ID（可选）
         */
        private UUID storeId;

        /**
         * 门店名称（可选）
         */
        private String storeName;

        /**
         * 生成时间
         */
        private LocalDateTime generatedAt;

        /**
         * 生成人员
         */
        private String generatedBy;
    }

    /**
     * 汇总统计
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStat {
        /**
         * 订单总数
         */
        private Long totalOrders;

        /**
         * 销售总额（元）
         */
        private BigDecimal totalRevenue;

        /**
         * 总销量（杯数）
         */
        private Long totalQuantity;

        /**
         * 平均客单价（元）
         */
        private BigDecimal averageOrderValue;

        /**
         * 完成率（%）
         */
        private Double completionRate;
    }

    /**
     * 订单明细行
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDetailRow {
        /**
         * 订单号
         */
        private String orderNumber;

        /**
         * 取餐号
         */
        private String queueNumber;

        /**
         * 下单时间
         */
        private LocalDateTime orderTime;

        /**
         * 饮品名称
         */
        private String beverageName;

        /**
         * 规格
         */
        private String specifications;

        /**
         * 数量
         */
        private Integer quantity;

        /**
         * 单价（元）
         */
        private BigDecimal unitPrice;

        /**
         * 小计（元）
         */
        private BigDecimal subtotal;

        /**
         * 订单总价（元）
         */
        private BigDecimal orderTotal;

        /**
         * 订单状态
         */
        private String status;

        /**
         * 完成时间
         */
        private LocalDateTime completedTime;
    }

    /**
     * 热销商品行
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BestSellingRow {
        /**
         * 排名
         */
        private Integer rank;

        /**
         * 饮品名称
         */
        private String beverageName;

        /**
         * 分类
         */
        private String category;

        /**
         * 销售数量
         */
        private Long quantity;

        /**
         * 销售额（元）
         */
        private BigDecimal revenue;

        /**
         * 销售占比（%）
         */
        private Double percentage;
    }

    /**
     * 原料消耗行
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialConsumptionRow {
        /**
         * 原料名称
         */
        private String materialName;

        /**
         * 消耗数量
         */
        private Integer quantity;

        /**
         * 单位
         */
        private String unit;

        /**
         * 单价（元）
         */
        private BigDecimal unitCost;

        /**
         * 总成本（元）
         */
        private BigDecimal totalCost;

        /**
         * 备注
         */
        private String remarks;
    }
}

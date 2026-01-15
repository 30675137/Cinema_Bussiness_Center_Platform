/**
 * @spec O003-beverage-order
 * 饮品订单实体类
 */
package com.cinema.beverage.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * 饮品订单实体
 *
 * 映射数据库表: beverage_orders
 * 对应 spec: O003-beverage-order
 */
@Entity
@Table(name = "beverage_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageOrder {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    /**
     * 订单号 (格式: BORDT + yyyyMMddHHmmss + 4位随机数)
     */
    @NotBlank(message = "订单号不能为空")
    @Size(max = 50, message = "订单号长度不能超过50")
    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    /**
     * 门店ID
     */
    @NotNull(message = "门店ID不能为空")
    @Column(name = "store_id", nullable = false, columnDefinition = "uuid")
    private UUID storeId;

    /**
     * 订单总价 (单位: 元)
     */
    @NotNull(message = "订单总价不能为空")
    @Min(value = 0, message = "订单总价不能为负数")
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    /**
     * 订单状态
     */
    @NotNull(message = "订单状态不能为空")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    /**
     * 支付方式
     */
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    /**
     * 交易ID
     */
    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    /**
     * 支付时间
     */
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /**
     * 制作开始时间
     */
    @Column(name = "production_start_time")
    private LocalDateTime productionStartTime;

    /**
     * 制作完成时间
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * 交付时间
     */
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    /**
     * 取消时间
     */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    /**
     * 顾客备注
     */
    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 订单项列表 (一对多关系)
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BeverageOrderItem> items = new ArrayList<>();

    /**
     * 订单状态枚举
     */
    public enum OrderStatus {
        /** 待支付 */
        PENDING_PAYMENT,
        /** 待制作 */
        PENDING_PRODUCTION,
        /** 制作中 */
        PRODUCING,
        /** 已完成 (等待取餐) */
        COMPLETED,
        /** 已交付 */
        DELIVERED,
        /** 已取消 */
        CANCELLED
    }

    /**
     * 检查订单状态是否可以流转到目标状态
     */
    public boolean canTransitionTo(OrderStatus targetStatus) {
        if (this.status == targetStatus) {
            return false; // 相同状态不允许流转
        }

        // 已取消的订单不能再流转
        if (this.status == OrderStatus.CANCELLED) {
            return false;
        }

        // 定义允许的状态流转路径
        return switch (this.status) {
            case PENDING_PAYMENT -> targetStatus == OrderStatus.PENDING_PRODUCTION || targetStatus == OrderStatus.CANCELLED;
            case PENDING_PRODUCTION -> targetStatus == OrderStatus.PRODUCING || targetStatus == OrderStatus.CANCELLED;
            case PRODUCING -> targetStatus == OrderStatus.COMPLETED;
            case COMPLETED -> targetStatus == OrderStatus.DELIVERED;
            case DELIVERED -> false; // 已交付后不能再流转
            case CANCELLED -> false; // 已取消后不能再流转
        };
    }

    /**
     * 添加订单项
     */
    public void addItem(BeverageOrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    /**
     * 移除订单项
     */
    public void removeItem(BeverageOrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}

/**
 * @spec O003-beverage-order
 * 取餐号实体类
 */
package com.cinema.beverage.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;

/**
 * 取餐号实体
 *
 * 映射数据库表: queue_numbers
 * 对应 spec: O003-beverage-order
 *
 * 说明: 取餐号格式为 D001-D999，每日重置，通过 PostgreSQL Advisory Lock 保证并发安全
 */
@Entity
@Table(name = "queue_numbers", uniqueConstraints = {
    @UniqueConstraint(name = "uk_queue_number_store_date_seq", columnNames = {"store_id", "date", "sequence"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueNumber {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    /**
     * 门店ID
     */
    @NotNull(message = "门店ID不能为空")
    @Column(name = "store_id", nullable = false, columnDefinition = "uuid")
    private UUID storeId;

    /**
     * 订单ID
     */
    @NotNull(message = "订单ID不能为空")
    @Column(name = "order_id", nullable = false, columnDefinition = "uuid")
    private UUID orderId;

    /**
     * 取餐号 (格式: D001-D999)
     */
    @NotBlank(message = "取餐号不能为空")
    @Size(max = 10, message = "取餐号长度不能超过10")
    @Column(name = "queue_number", nullable = false, length = 10)
    private String queueNumber;

    /**
     * 日期 (用于每日重置序号)
     */
    @NotNull(message = "日期不能为空")
    @Column(nullable = false)
    private LocalDate date;

    /**
     * 当日序号 (1-999)
     */
    @NotNull(message = "序号不能为空")
    @Min(value = 1, message = "序号最小为1")
    @Max(value = 999, message = "序号最大为999")
    @Column(nullable = false)
    private Integer sequence;

    /**
     * 取餐号状态
     */
    @NotNull(message = "取餐号状态不能为空")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private QueueStatus status = QueueStatus.ACTIVE;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 取餐号状态枚举
     */
    public enum QueueStatus {
        /** 激活（等待叫号） */
        ACTIVE,
        /** 已叫号 */
        CALLED,
        /** 已完成（已取餐） */
        COMPLETED
    }

    /**
     * 格式化取餐号
     * 格式: D + 三位数序号 (例如: D001, D123, D999)
     */
    public static String formatQueueNumber(int sequence) {
        if (sequence < 1 || sequence > 999) {
            throw new IllegalArgumentException("序号必须在1-999之间");
        }
        return String.format("D%03d", sequence);
    }

    /**
     * 解析取餐号获取序号
     */
    public static int parseSequence(String queueNumber) {
        if (queueNumber == null || !queueNumber.matches("^D\\d{3}$")) {
            throw new IllegalArgumentException("取餐号格式无效: " + queueNumber);
        }
        return Integer.parseInt(queueNumber.substring(1));
    }
}

package com.cinema.hallstore.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 套餐子项实体类
 * 用于套餐SKU的子项配置
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "combo_items", uniqueConstraints = {
    @UniqueConstraint(name = "uk_combo_sub_item", columnNames = {"combo_id", "sub_item_id"})
})
@EntityListeners(AuditingEntityListener.class)
public class ComboItem {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * 套餐SKU ID
     */
    @Column(name = "combo_id", nullable = false)
    private UUID comboId;

    /**
     * 子项SKU ID (不能是套餐类型,避免嵌套套餐)
     */
    @Column(name = "sub_item_id", nullable = false)
    private UUID subItemId;

    /**
     * 子项数量
     */
    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    /**
     * 子项单位
     */
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    /**
     * 单位成本快照(保存时记录,用于成本计算)
     */
    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    /**
     * 排序序号
     */
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 可选: 关联到套餐SKU实体 (延迟加载)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_id", insertable = false, updatable = false)
    private Sku combo;

    /**
     * 可选: 关联到子项SKU实体 (延迟加载)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_item_id", insertable = false, updatable = false)
    private Sku subItem;

    /**
     * 计算总成本 = 数量 × 单位成本
     */
    public BigDecimal getTotalCost() {
        if (quantity == null || unitCost == null) {
            return BigDecimal.ZERO;
        }
        return quantity.multiply(unitCost);
    }
}

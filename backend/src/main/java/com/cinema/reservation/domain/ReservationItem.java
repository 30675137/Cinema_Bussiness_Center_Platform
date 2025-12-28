package com.cinema.reservation.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 预约单加购项明细实体
 * <p>
 * 记录预约单中的加购项信息，包含加购项名称和价格的快照，
 * 防止主数据变更影响历史订单。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Entity
@Table(name = "reservation_items")
public class ReservationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 关联的预约单
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_order_id", nullable = false)
    private ReservationOrder reservationOrder;

    /**
     * 加购项ID（引用原始加购项）
     */
    @NotNull(message = "加购项ID不能为空")
    @Column(name = "addon_item_id", nullable = false)
    private UUID addonItemId;

    /**
     * 加购项名称快照（创建时保存）
     */
    @NotBlank(message = "加购项名称不能为空")
    @Size(max = 100, message = "加购项名称不能超过100个字符")
    @Column(name = "addon_name_snapshot", nullable = false, length = 100)
    private String addonNameSnapshot;

    /**
     * 加购项单价快照（创建时保存）
     */
    @NotNull(message = "加购项单价不能为空")
    @DecimalMin(value = "0.00", message = "加购项单价不能为负数")
    @Column(name = "addon_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal addonPriceSnapshot;

    /**
     * 数量
     */
    @NotNull(message = "数量不能为空")
    @Min(value = 1, message = "数量必须大于0")
    @Column(nullable = false)
    private Integer quantity;

    /**
     * 小计金额（单价 * 数量）
     */
    @NotNull(message = "小计金额不能为空")
    @DecimalMin(value = "0.00", message = "小计金额不能为负数")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Lifecycle callbacks

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        // 自动计算小计
        if (this.subtotal == null && this.addonPriceSnapshot != null && this.quantity != null) {
            this.subtotal = this.addonPriceSnapshot.multiply(BigDecimal.valueOf(this.quantity));
        }
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ReservationOrder getReservationOrder() {
        return reservationOrder;
    }

    public void setReservationOrder(ReservationOrder reservationOrder) {
        this.reservationOrder = reservationOrder;
    }

    public UUID getAddonItemId() {
        return addonItemId;
    }

    public void setAddonItemId(UUID addonItemId) {
        this.addonItemId = addonItemId;
    }

    public String getAddonNameSnapshot() {
        return addonNameSnapshot;
    }

    public void setAddonNameSnapshot(String addonNameSnapshot) {
        this.addonNameSnapshot = addonNameSnapshot;
    }

    public BigDecimal getAddonPriceSnapshot() {
        return addonPriceSnapshot;
    }

    public void setAddonPriceSnapshot(BigDecimal addonPriceSnapshot) {
        this.addonPriceSnapshot = addonPriceSnapshot;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "ReservationItem{" +
                "id=" + id +
                ", addonNameSnapshot='" + addonNameSnapshot + '\'' +
                ", quantity=" + quantity +
                ", subtotal=" + subtotal +
                '}';
    }
}

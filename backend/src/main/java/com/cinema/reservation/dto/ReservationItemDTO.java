package com.cinema.reservation.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 预约单加购项明细 DTO
 * <p>
 * 用于返回预约单中的加购项明细信息。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class ReservationItemDTO {

    /**
     * 明细ID
     */
    private UUID id;

    /**
     * 加购项ID
     */
    private UUID addonItemId;

    /**
     * 加购项名称
     */
    private String addonItemName;

    /**
     * 加购项分类
     */
    private String category;

    /**
     * 数量
     */
    private Integer quantity;

    /**
     * 单价
     */
    private BigDecimal unitPrice;

    /**
     * 小计金额
     */
    private BigDecimal subtotal;

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAddonItemId() {
        return addonItemId;
    }

    public void setAddonItemId(UUID addonItemId) {
        this.addonItemId = addonItemId;
    }

    public String getAddonItemName() {
        return addonItemName;
    }

    public void setAddonItemName(String addonItemName) {
        this.addonItemName = addonItemName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}

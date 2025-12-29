package com.cinema.reservation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * 预约单列表项 DTO
 * <p>
 * 用于 B 端预约单列表页面的简化展示。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class ReservationListItemDTO {

    /**
     * 预约单ID
     */
    private UUID id;

    /**
     * 预约单号
     */
    private String orderNumber;

    /**
     * 联系人姓名
     */
    private String contactName;

    /**
     * 联系人手机号
     */
    private String contactPhone;

    /**
     * 场景包名称
     */
    private String scenarioPackageName;

    /**
     * 套餐名称
     */
    private String packageTierName;

    /**
     * 预订日期
     */
    private LocalDate reservationDate;

    /**
     * 预订时间
     */
    private LocalTime reservationTime;

    /**
     * 总金额
     */
    private BigDecimal totalAmount;

    /**
     * 状态
     */
    private String status;

    /**
     * 状态显示名称
     */
    private String statusDisplayName;

    /**
     * 是否要求支付
     */
    private Boolean requiresPayment;

    /**
     * 创建时间
     */
    private Instant createdAt;

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getScenarioPackageName() {
        return scenarioPackageName;
    }

    public void setScenarioPackageName(String scenarioPackageName) {
        this.scenarioPackageName = scenarioPackageName;
    }

    public String getPackageTierName() {
        return packageTierName;
    }

    public void setPackageTierName(String packageTierName) {
        this.packageTierName = packageTierName;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public LocalTime getReservationTime() {
        return reservationTime;
    }

    public void setReservationTime(LocalTime reservationTime) {
        this.reservationTime = reservationTime;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusDisplayName() {
        return statusDisplayName;
    }

    public void setStatusDisplayName(String statusDisplayName) {
        this.statusDisplayName = statusDisplayName;
    }

    public Boolean getRequiresPayment() {
        return requiresPayment;
    }

    public void setRequiresPayment(Boolean requiresPayment) {
        this.requiresPayment = requiresPayment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

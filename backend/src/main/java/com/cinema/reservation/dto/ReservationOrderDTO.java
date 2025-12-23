package com.cinema.reservation.dto;

import com.cinema.reservation.domain.enums.ReservationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * 预约单响应 DTO
 * <p>
 * 用于返回预约单详情信息。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class ReservationOrderDTO {

    /**
     * 预约单ID
     */
    private UUID id;

    /**
     * 预约单号
     */
    private String orderNumber;

    /**
     * 客户用户ID
     */
    private UUID userId;

    /**
     * 场景包ID
     */
    private UUID scenarioPackageId;

    /**
     * 场景包名称
     */
    private String scenarioPackageName;

    /**
     * 套餐ID
     */
    private UUID packageTierId;

    /**
     * 套餐名称
     */
    private String packageTierName;

    /**
     * 时段模板ID
     */
    private UUID timeSlotTemplateId;

    /**
     * 预订日期
     */
    private LocalDate reservationDate;

    /**
     * 预订时段开始时间
     */
    private LocalTime reservationTime;

    /**
     * 预订时段结束时间
     */
    private LocalTime reservationEndTime;

    /**
     * 联系人姓名
     */
    private String contactName;

    /**
     * 联系人手机号
     */
    private String contactPhone;

    /**
     * 备注
     */
    private String remark;

    /**
     * 总金额
     */
    private BigDecimal totalAmount;

    /**
     * 预约状态
     */
    private ReservationStatus status;

    /**
     * 状态显示名称
     */
    private String statusDisplayName;

    /**
     * 是否要求支付
     */
    private Boolean requiresPayment;

    /**
     * 支付流水号
     */
    private String paymentId;

    /**
     * 支付时间
     */
    private Instant paymentTime;

    /**
     * 取消原因
     */
    private String cancelReason;

    /**
     * 取消时间
     */
    private Instant cancelledAt;

    /**
     * 加购项列表
     */
    private List<ReservationItemDTO> items;

    /**
     * 操作日志列表
     */
    private List<OperationLogDTO> operationLogs;

    /**
     * 创建时间
     */
    private Instant createdAt;

    /**
     * 更新时间
     */
    private Instant updatedAt;

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

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getScenarioPackageId() {
        return scenarioPackageId;
    }

    public void setScenarioPackageId(UUID scenarioPackageId) {
        this.scenarioPackageId = scenarioPackageId;
    }

    public String getScenarioPackageName() {
        return scenarioPackageName;
    }

    public void setScenarioPackageName(String scenarioPackageName) {
        this.scenarioPackageName = scenarioPackageName;
    }

    public UUID getPackageTierId() {
        return packageTierId;
    }

    public void setPackageTierId(UUID packageTierId) {
        this.packageTierId = packageTierId;
    }

    public String getPackageTierName() {
        return packageTierName;
    }

    public void setPackageTierName(String packageTierName) {
        this.packageTierName = packageTierName;
    }

    public UUID getTimeSlotTemplateId() {
        return timeSlotTemplateId;
    }

    public void setTimeSlotTemplateId(UUID timeSlotTemplateId) {
        this.timeSlotTemplateId = timeSlotTemplateId;
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

    public LocalTime getReservationEndTime() {
        return reservationEndTime;
    }

    public void setReservationEndTime(LocalTime reservationEndTime) {
        this.reservationEndTime = reservationEndTime;
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

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
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

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public Instant getPaymentTime() {
        return paymentTime;
    }

    public void setPaymentTime(Instant paymentTime) {
        this.paymentTime = paymentTime;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Instant cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public List<ReservationItemDTO> getItems() {
        return items;
    }

    public void setItems(List<ReservationItemDTO> items) {
        this.items = items;
    }

    public List<OperationLogDTO> getOperationLogs() {
        return operationLogs;
    }

    public void setOperationLogs(List<OperationLogDTO> operationLogs) {
        this.operationLogs = operationLogs;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

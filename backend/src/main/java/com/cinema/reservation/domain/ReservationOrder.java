package com.cinema.reservation.domain;

import com.cinema.reservation.domain.enums.ReservationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 预约单实体
 * <p>
 * 表示一次客户的场景包预订意向，包含预约单号、客户信息、
 * 场景包选择、时段选择、套餐和加购项、联系人信息、总金额、状态等核心属性。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Entity
@Table(name = "reservation_orders")
public class ReservationOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 预约单号，格式：R+yyyyMMddHHmmss+4位随机数
     */
    @NotBlank(message = "预约单号不能为空")
    @Column(name = "order_number", nullable = false, length = 20, unique = true)
    private String orderNumber;

    /**
     * 客户用户ID
     */
    @NotNull(message = "用户ID不能为空")
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * 场景包ID
     */
    @NotNull(message = "场景包ID不能为空")
    @Column(name = "scenario_package_id", nullable = false)
    private UUID scenarioPackageId;

    /**
     * 套餐ID
     */
    @NotNull(message = "套餐ID不能为空")
    @Column(name = "package_tier_id", nullable = false)
    private UUID packageTierId;

    /**
     * 时段模板ID
     */
    @NotNull(message = "时段模板ID不能为空")
    @Column(name = "time_slot_template_id", nullable = false)
    private UUID timeSlotTemplateId;

    /**
     * 预订日期
     */
    @NotNull(message = "预订日期不能为空")
    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    /**
     * 预订时段开始时间
     */
    @NotNull(message = "预订时间不能为空")
    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;

    /**
     * 联系人姓名
     */
    @NotBlank(message = "联系人姓名不能为空")
    @Size(max = 100, message = "联系人姓名不能超过100个字符")
    @Column(name = "contact_name", nullable = false, length = 100)
    private String contactName;

    /**
     * 联系人手机号
     */
    @NotBlank(message = "联系人手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;

    /**
     * 备注
     */
    @Size(max = 200, message = "备注不能超过200个字符")
    @Column(columnDefinition = "TEXT")
    private String remark;

    /**
     * 总金额
     */
    @NotNull(message = "总金额不能为空")
    @DecimalMin(value = "0.01", message = "总金额必须大于0")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /**
     * 预约单状态
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    /**
     * 是否要求支付（运营人员确认时设置）
     */
    @Column(name = "requires_payment", nullable = false)
    private Boolean requiresPayment = false;

    /**
     * 支付流水号
     */
    @Column(name = "payment_id", length = 100)
    private String paymentId;

    /**
     * 支付时间
     */
    @Column(name = "payment_time")
    private Instant paymentTime;

    /**
     * 乐观锁版本号
     */
    @Version
    @Column(nullable = false)
    private Long version = 0L;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * 取消时间
     */
    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    /**
     * 取消原因
     */
    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    /**
     * 加购项明细列表
     */
    @OneToMany(mappedBy = "reservationOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationItem> items = new ArrayList<>();

    /**
     * 操作日志列表
     */
    @OneToMany(mappedBy = "reservationOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationOperationLog> operationLogs = new ArrayList<>();

    // Lifecycle callbacks

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Business methods

    /**
     * 添加加购项
     */
    public void addItem(ReservationItem item) {
        items.add(item);
        item.setReservationOrder(this);
    }

    /**
     * 添加操作日志
     */
    public void addOperationLog(ReservationOperationLog log) {
        operationLogs.add(log);
        log.setReservationOrder(this);
    }

    /**
     * 确认预约
     *
     * @param requiresPayment 是否要求支付
     */
    public void confirm(boolean requiresPayment) {
        if (!status.canTransitionTo(requiresPayment ? ReservationStatus.CONFIRMED : ReservationStatus.COMPLETED)) {
            throw new IllegalStateException("无法从状态 " + status + " 确认预约");
        }
        this.requiresPayment = requiresPayment;
        this.status = requiresPayment ? ReservationStatus.CONFIRMED : ReservationStatus.COMPLETED;
    }

    /**
     * 取消预约
     *
     * @param reason 取消原因
     */
    public void cancel(String reason) {
        if (!status.canTransitionTo(ReservationStatus.CANCELLED)) {
            throw new IllegalStateException("无法从状态 " + status + " 取消预约");
        }
        this.status = ReservationStatus.CANCELLED;
        this.cancelReason = reason;
        this.cancelledAt = Instant.now();
    }

    /**
     * 完成支付
     *
     * @param paymentId 支付流水号
     */
    public void completePayment(String paymentId) {
        if (!status.canTransitionTo(ReservationStatus.COMPLETED)) {
            throw new IllegalStateException("无法从状态 " + status + " 完成支付");
        }
        this.status = ReservationStatus.COMPLETED;
        this.paymentId = paymentId;
        this.paymentTime = Instant.now();
    }

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

    public UUID getPackageTierId() {
        return packageTierId;
    }

    public void setPackageTierId(UUID packageTierId) {
        this.packageTierId = packageTierId;
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

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
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

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Instant cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }

    public List<ReservationItem> getItems() {
        return items;
    }

    public void setItems(List<ReservationItem> items) {
        this.items = items;
    }

    public List<ReservationOperationLog> getOperationLogs() {
        return operationLogs;
    }

    public void setOperationLogs(List<ReservationOperationLog> operationLogs) {
        this.operationLogs = operationLogs;
    }

    @Override
    public String toString() {
        return "ReservationOrder{" +
                "id=" + id +
                ", orderNumber='" + orderNumber + '\'' +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                ", version=" + version +
                '}';
    }
}

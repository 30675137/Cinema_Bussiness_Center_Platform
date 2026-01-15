package com.cinema.reservation.domain;

import com.cinema.reservation.domain.enums.OperationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * 预约单操作日志实体
 * <p>
 * 记录预约单的所有操作历史，包括操作类型、操作人、操作时间、
 * 修改前后的数据快照、操作原因等，用于审计和追溯。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Entity
@Table(name = "reservation_operation_logs")
public class ReservationOperationLog {

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
     * 操作类型
     */
    @NotNull(message = "操作类型不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    /**
     * 操作人ID（可为空，如系统自动操作）
     */
    @Column(name = "operator_id")
    private UUID operatorId;

    /**
     * 操作人名称
     */
    @Size(max = 100, message = "操作人名称不能超过100个字符")
    @Column(name = "operator_name", length = 100)
    private String operatorName;

    /**
     * 修改前数据快照（JSONB）
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_value", columnDefinition = "jsonb")
    private Map<String, Object> beforeValue;

    /**
     * 修改后数据快照（JSONB）
     */
    @NotNull(message = "修改后数据不能为空")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_value", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> afterValue;

    /**
     * 操作时间
     */
    @Column(name = "operation_time", nullable = false)
    private Instant operationTime;

    /**
     * 操作IP地址
     */
    @Size(max = 45, message = "IP地址不能超过45个字符")
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * 备注（如取消原因、支付选项等）
     */
    @Column(columnDefinition = "TEXT")
    private String remark;

    // Lifecycle callbacks

    @PrePersist
    protected void onCreate() {
        if (this.operationTime == null) {
            this.operationTime = Instant.now();
        }
    }

    // Static factory methods

    /**
     * 创建操作日志
     */
    public static ReservationOperationLog create(
            OperationType operationType,
            UUID operatorId,
            String operatorName,
            Map<String, Object> beforeValue,
            Map<String, Object> afterValue,
            String ipAddress,
            String remark) {
        ReservationOperationLog log = new ReservationOperationLog();
        log.setOperationType(operationType);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setBeforeValue(beforeValue);
        log.setAfterValue(afterValue);
        log.setIpAddress(ipAddress);
        log.setRemark(remark);
        log.setOperationTime(Instant.now());
        return log;
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

    public OperationType getOperationType() {
        return operationType;
    }

    public void setOperationType(OperationType operationType) {
        this.operationType = operationType;
    }

    public UUID getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(UUID operatorId) {
        this.operatorId = operatorId;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public Map<String, Object> getBeforeValue() {
        return beforeValue;
    }

    public void setBeforeValue(Map<String, Object> beforeValue) {
        this.beforeValue = beforeValue;
    }

    public Map<String, Object> getAfterValue() {
        return afterValue;
    }

    public void setAfterValue(Map<String, Object> afterValue) {
        this.afterValue = afterValue;
    }

    public Instant getOperationTime() {
        return operationTime;
    }

    public void setOperationTime(Instant operationTime) {
        this.operationTime = operationTime;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    @Override
    public String toString() {
        return "ReservationOperationLog{" +
                "id=" + id +
                ", operationType=" + operationType +
                ", operatorName='" + operatorName + '\'' +
                ", operationTime=" + operationTime +
                '}';
    }
}

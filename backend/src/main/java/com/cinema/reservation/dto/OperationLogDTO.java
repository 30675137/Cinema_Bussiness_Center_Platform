package com.cinema.reservation.dto;

import com.cinema.reservation.domain.enums.OperationType;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * 操作日志 DTO
 * <p>
 * 用于返回预约单的操作日志信息。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class OperationLogDTO {

    /**
     * 日志ID
     */
    private UUID id;

    /**
     * 操作类型
     */
    private OperationType operationType;

    /**
     * 操作类型显示名称
     */
    private String operationTypeDisplayName;

    /**
     * 操作人ID
     */
    private UUID operatorId;

    /**
     * 操作人名称
     */
    private String operatorName;

    /**
     * 操作时间
     */
    private Instant operatedAt;

    /**
     * 操作原因/备注
     */
    private String reason;

    /**
     * 状态变更前
     */
    private String previousStatus;

    /**
     * 状态变更后
     */
    private String newStatus;

    /**
     * 扩展数据
     */
    private Map<String, Object> extraData;

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public OperationType getOperationType() {
        return operationType;
    }

    public void setOperationType(OperationType operationType) {
        this.operationType = operationType;
    }

    public String getOperationTypeDisplayName() {
        return operationTypeDisplayName;
    }

    public void setOperationTypeDisplayName(String operationTypeDisplayName) {
        this.operationTypeDisplayName = operationTypeDisplayName;
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

    public Instant getOperatedAt() {
        return operatedAt;
    }

    public void setOperatedAt(Instant operatedAt) {
        this.operatedAt = operatedAt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public Map<String, Object> getExtraData() {
        return extraData;
    }

    public void setExtraData(Map<String, Object> extraData) {
        this.extraData = extraData;
    }
}

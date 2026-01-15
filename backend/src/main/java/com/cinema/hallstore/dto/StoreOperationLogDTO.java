package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.StoreOperationLog;
import com.cinema.hallstore.domain.enums.OperationType;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for StoreOperationLog responses
 * 
 * @since 022-store-crud
 */
public class StoreOperationLogDTO {

    private UUID id;
    private UUID storeId;
    private OperationType operationType;
    private UUID operatorId;
    private String operatorName;
    private Map<String, Object> beforeValue;
    private Map<String, Object> afterValue;
    private Instant operationTime;
    private String ipAddress;
    private String remark;

    // Default constructor
    public StoreOperationLogDTO() {}

    // Constructor from domain entity
    public StoreOperationLogDTO(StoreOperationLog log) {
        this.id = log.getId();
        this.storeId = log.getStoreId();
        this.operationType = log.getOperationType();
        this.operatorId = log.getOperatorId();
        this.operatorName = log.getOperatorName();
        this.beforeValue = log.getBeforeValue();
        this.afterValue = log.getAfterValue();
        this.operationTime = log.getOperationTime();
        this.ipAddress = log.getIpAddress();
        this.remark = log.getRemark();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
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
}

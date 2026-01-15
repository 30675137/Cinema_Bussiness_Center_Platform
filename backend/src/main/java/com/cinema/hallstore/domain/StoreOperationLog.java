package com.cinema.hallstore.domain;

import com.cinema.hallstore.domain.enums.OperationType;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * StoreOperationLog 领域模型，对应 store_operation_logs 表
 * 用于记录门店所有操作的审计日志
 * 
 * @since 022-store-crud
 */
public class StoreOperationLog {

    private UUID id;
    private UUID storeId;
    private OperationType operationType;
    private UUID operatorId;
    private String operatorName;
    private Map<String, Object> beforeValue;  // JSONB
    private Map<String, Object> afterValue;   // JSONB
    private Instant operationTime;
    private String ipAddress;
    private String remark;

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StoreOperationLog)) return false;
        StoreOperationLog that = (StoreOperationLog) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "StoreOperationLog{" +
                "id=" + id +
                ", storeId=" + storeId +
                ", operationType=" + operationType +
                ", operatorName='" + operatorName + '\'' +
                ", operationTime=" + operationTime +
                '}';
    }
}

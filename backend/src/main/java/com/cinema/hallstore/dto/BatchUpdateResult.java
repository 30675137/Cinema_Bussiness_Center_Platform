package com.cinema.hallstore.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * BatchUpdateResult - 批量更新结果
 *
 * <p>用于批量更新预约设置操作的响应，包含成功数量、失败数量和失败详情</p>
 */
public class BatchUpdateResult {

    private Integer successCount = 0;
    private Integer failureCount = 0;
    private List<FailureDetail> failures = new ArrayList<>();

    public Integer getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(Integer successCount) {
        this.successCount = successCount;
    }

    public Integer getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(Integer failureCount) {
        this.failureCount = failureCount;
    }

    public List<FailureDetail> getFailures() {
        return failures;
    }

    public void setFailures(List<FailureDetail> failures) {
        this.failures = failures;
    }

    /**
     * 添加失败详情
     */
    public void addFailure(String storeId, String error, String message) {
        FailureDetail detail = new FailureDetail();
        detail.setStoreId(storeId);
        detail.setError(error);
        detail.setMessage(message);
        this.failures.add(detail);
        this.failureCount = this.failures.size();
    }

    /**
     * 增加成功计数
     */
    public void incrementSuccess() {
        this.successCount++;
    }

    /**
     * FailureDetail - 批量更新失败详情
     */
    public static class FailureDetail {
        private String storeId;
        private String error;
        private String message;

        public String getStoreId() {
            return storeId;
        }

        public void setStoreId(String storeId) {
            this.storeId = storeId;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}


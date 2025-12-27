package com.cinema.reservation.domain.enums;

/**
 * 预约单操作类型枚举
 * <p>
 * 用于操作日志记录，区分不同类型的操作
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public enum OperationType {

    /**
     * 创建 - 用户创建预约单
     */
    CREATE("创建预约"),

    /**
     * 确认 - 运营人员确认预约
     */
    CONFIRM("确认预约"),

    /**
     * 取消 - 取消预约（运营或用户）
     */
    CANCEL("取消预约"),

    /**
     * 更新 - 修改预约信息
     */
    UPDATE("修改信息"),

    /**
     * 支付 - 用户完成支付
     */
    PAYMENT("完成支付");

    private final String displayName;

    OperationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

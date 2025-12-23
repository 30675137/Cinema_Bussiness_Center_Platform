package com.cinema.reservation.domain.enums;

/**
 * 预约单状态枚举
 * <p>
 * 状态流转规则：
 * - PENDING → CONFIRMED (运营确认,要求支付)
 * - PENDING → COMPLETED (运营确认,无需支付)
 * - PENDING → CANCELLED (取消)
 * - CONFIRMED → COMPLETED (支付成功)
 * - CONFIRMED → CANCELLED (取消)
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public enum ReservationStatus {

    /**
     * 待确认 - 用户创建预约后的初始状态
     */
    PENDING("待确认"),

    /**
     * 已确认 - 运营人员确认预约，等待用户支付
     */
    CONFIRMED("已确认"),

    /**
     * 已取消 - 预约被取消（运营取消或超时自动取消）
     */
    CANCELLED("已取消"),

    /**
     * 已完成 - 预约已完成（已支付或无需支付）
     */
    COMPLETED("已完成");

    private final String displayName;

    ReservationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * 检查是否可以转换到目标状态
     *
     * @param target 目标状态
     * @return true 如果转换合法
     */
    public boolean canTransitionTo(ReservationStatus target) {
        if (this == target) {
            return false; // 不允许转换到相同状态
        }

        return switch (this) {
            case PENDING -> target == CONFIRMED || target == COMPLETED || target == CANCELLED;
            case CONFIRMED -> target == COMPLETED || target == CANCELLED;
            case COMPLETED, CANCELLED -> false; // 终态不可转换
        };
    }

    /**
     * 检查是否为终态
     *
     * @return true 如果是终态
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED;
    }
}

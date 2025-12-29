package com.cinema.reservation.exception;

import com.cinema.reservation.domain.enums.ReservationStatus;

/**
 * 无效状态转换异常
 * <p>
 * 当预约单状态转换不符合状态机规则时抛出此异常。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class InvalidStatusTransitionException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final ReservationStatus fromStatus;
    private final ReservationStatus toStatus;

    /**
     * 默认构造器
     */
    public InvalidStatusTransitionException() {
        super("无效的状态转换");
        this.fromStatus = null;
        this.toStatus = null;
    }

    /**
     * 带消息的构造器
     *
     * @param message 异常消息
     */
    public InvalidStatusTransitionException(String message) {
        super(message);
        this.fromStatus = null;
        this.toStatus = null;
    }

    /**
     * 带状态信息的构造器
     *
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     */
    public InvalidStatusTransitionException(ReservationStatus fromStatus, ReservationStatus toStatus) {
        super(String.format("无法从状态 [%s] 转换到 [%s]", 
                fromStatus != null ? fromStatus.getDisplayName() : "null",
                toStatus != null ? toStatus.getDisplayName() : "null"));
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }

    /**
     * 带状态信息和消息的构造器
     *
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     * @param message    异常消息
     */
    public InvalidStatusTransitionException(ReservationStatus fromStatus, ReservationStatus toStatus, String message) {
        super(message);
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }

    /**
     * 获取当前状态
     *
     * @return 当前状态
     */
    public ReservationStatus getFromStatus() {
        return fromStatus;
    }

    /**
     * 获取目标状态
     *
     * @return 目标状态
     */
    public ReservationStatus getToStatus() {
        return toStatus;
    }
}

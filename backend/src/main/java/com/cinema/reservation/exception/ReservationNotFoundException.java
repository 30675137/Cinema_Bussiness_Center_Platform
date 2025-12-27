package com.cinema.reservation.exception;

/**
 * 预约单不存在异常
 * <p>
 * 当查询预约单不存在时抛出此异常。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class ReservationNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 默认构造器
     */
    public ReservationNotFoundException() {
        super("预约单不存在");
    }

    /**
     * 带消息的构造器
     *
     * @param message 异常消息
     */
    public ReservationNotFoundException(String message) {
        super(message);
    }

    /**
     * 根据预约单号构造
     *
     * @param orderNumber 预约单号
     * @return 异常实例
     */
    public static ReservationNotFoundException byOrderNumber(String orderNumber) {
        return new ReservationNotFoundException("预约单不存在: " + orderNumber);
    }

    /**
     * 根据预约单ID构造
     *
     * @param id 预约单ID
     * @return 异常实例
     */
    public static ReservationNotFoundException byId(String id) {
        return new ReservationNotFoundException("预约单不存在, ID: " + id);
    }
}

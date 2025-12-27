package com.cinema.reservation.repository;

import com.cinema.reservation.domain.ReservationOperationLog;
import com.cinema.reservation.domain.enums.OperationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * 预约单操作日志 Repository
 * <p>
 * 提供预约单操作日志的数据访问接口，用于追踪预约单的状态变更历史。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Repository
public interface ReservationOperationLogRepository extends JpaRepository<ReservationOperationLog, UUID> {

    /**
     * 根据预约单ID查询所有操作日志（按时间倒序）
     *
     * @param reservationOrderId 预约单ID
     * @return 操作日志列表
     */
    @Query("SELECT l FROM ReservationOperationLog l WHERE l.reservationOrder.id = :reservationOrderId ORDER BY l.operationTime DESC")
    List<ReservationOperationLog> findByReservationOrderIdOrderByOperationTimeDesc(@Param("reservationOrderId") UUID reservationOrderId);

    /**
     * 根据预约单ID和操作类型查询日志
     *
     * @param reservationOrderId 预约单ID
     * @param operationType      操作类型
     * @return 操作日志列表
     */
    @Query("SELECT l FROM ReservationOperationLog l WHERE l.reservationOrder.id = :reservationOrderId AND l.operationType = :operationType ORDER BY l.operationTime DESC")
    List<ReservationOperationLog> findByReservationOrderIdAndOperationType(
            @Param("reservationOrderId") UUID reservationOrderId,
            @Param("operationType") OperationType operationType
    );

    /**
     * 查询指定时间范围内的操作日志
     *
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 操作日志列表
     */
    @Query("SELECT l FROM ReservationOperationLog l WHERE l.operationTime BETWEEN :startTime AND :endTime ORDER BY l.operationTime DESC")
    List<ReservationOperationLog> findByOperationTimeBetween(
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime
    );

    /**
     * 查询指定操作人的操作日志
     *
     * @param operatorId 操作人ID
     * @return 操作日志列表
     */
    List<ReservationOperationLog> findByOperatorIdOrderByOperationTimeDesc(UUID operatorId);
}

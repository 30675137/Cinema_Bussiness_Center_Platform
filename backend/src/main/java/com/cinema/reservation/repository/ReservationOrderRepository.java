package com.cinema.reservation.repository;

import com.cinema.reservation.domain.ReservationOrder;
import com.cinema.reservation.domain.enums.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 预约单 Repository
 * <p>
 * 提供预约单的数据访问接口，包含按条件查询、分页查询、
 * 状态筛选、时段库存统计等方法。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Repository
public interface ReservationOrderRepository extends JpaRepository<ReservationOrder, UUID> {

    /**
     * 根据预约单号查询
     *
     * @param orderNumber 预约单号
     * @return Optional 预约单
     */
    Optional<ReservationOrder> findByOrderNumber(String orderNumber);

    /**
     * 根据预约单号查询（带悲观锁，用于并发更新场景）
     *
     * @param orderNumber 预约单号
     * @return Optional 预约单
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ReservationOrder r WHERE r.orderNumber = :orderNumber")
    Optional<ReservationOrder> findByOrderNumberForUpdate(@Param("orderNumber") String orderNumber);

    /**
     * 根据ID查询（带悲观锁，用于并发更新场景）
     *
     * @param id 预约单ID
     * @return Optional 预约单
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ReservationOrder r WHERE r.id = :id")
    Optional<ReservationOrder> findByIdForUpdate(@Param("id") UUID id);

    /**
     * 根据用户ID查询预约单列表
     *
     * @param userId 用户ID
     * @return 预约单列表
     */
    List<ReservationOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * 根据用户ID分页查询预约单
     *
     * @param userId   用户ID
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<ReservationOrder> findByUserId(UUID userId, Pageable pageable);

    /**
     * 根据状态分页查询预约单（B端运营平台使用）
     *
     * @param status   预约状态
     * @param pageable 分页参数
     * @return 分页结果
     */
    Page<ReservationOrder> findByStatus(ReservationStatus status, Pageable pageable);

    /**
     * 分页查询所有预约单（B端运营平台使用）
     *
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT r FROM ReservationOrder r ORDER BY r.createdAt DESC")
    Page<ReservationOrder> findAllOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 多条件组合查询预约单（B端运营平台使用）
     *
     * @param orderNumber     预约单号（模糊匹配，可选）
     * @param contactPhone    联系人手机号（可选）
     * @param status          状态（可选）
     * @param reservationDate 预订日期（可选）
     * @param pageable        分页参数
     * @return 分页结果
     */
    @Query("SELECT r FROM ReservationOrder r WHERE " +
            "(:orderNumber IS NULL OR r.orderNumber LIKE %:orderNumber%) AND " +
            "(:contactPhone IS NULL OR r.contactPhone = :contactPhone) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:reservationDate IS NULL OR r.reservationDate = :reservationDate) " +
            "ORDER BY r.createdAt DESC")
    Page<ReservationOrder> findByConditions(
            @Param("orderNumber") String orderNumber,
            @Param("contactPhone") String contactPhone,
            @Param("status") ReservationStatus status,
            @Param("reservationDate") LocalDate reservationDate,
            Pageable pageable
    );

    /**
     * 统计指定日期、时段模板下已确认/待确认的预约数量（用于库存计算）
     * <p>
     * 状态为 PENDING、CONFIRMED 的预约会占用库存
     * </p>
     *
     * @param reservationDate    预订日期
     * @param timeSlotTemplateId 时段模板ID
     * @return 占用库存的预约数量
     */
    @Query("SELECT COUNT(r) FROM ReservationOrder r WHERE " +
            "r.reservationDate = :reservationDate AND " +
            "r.timeSlotTemplateId = :timeSlotTemplateId AND " +
            "r.status IN ('PENDING', 'CONFIRMED')")
    int countOccupiedByDateAndTimeSlot(
            @Param("reservationDate") LocalDate reservationDate,
            @Param("timeSlotTemplateId") UUID timeSlotTemplateId
    );

    /**
     * 查询指定场景包的预约单列表
     *
     * @param scenarioPackageId 场景包ID
     * @param pageable          分页参数
     * @return 分页结果
     */
    Page<ReservationOrder> findByScenarioPackageId(UUID scenarioPackageId, Pageable pageable);

    /**
     * 检查预约单号是否存在
     *
     * @param orderNumber 预约单号
     * @return 是否存在
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * 统计用户的待处理订单数量
     * <p>
     * 待处理订单定义：
     * - PENDING（待确认）
     * - CONFIRMED 且 requiresPayment=true（已确认待支付）
     * </p>
     *
     * @param userId 用户ID
     * @return 待处理订单数量
     */
    @Query("SELECT COUNT(r) FROM ReservationOrder r WHERE " +
            "r.userId = :userId AND " +
            "(r.status = 'PENDING' OR (r.status = 'CONFIRMED' AND r.requiresPayment = true))")
    long countPendingByUserId(@Param("userId") UUID userId);
}

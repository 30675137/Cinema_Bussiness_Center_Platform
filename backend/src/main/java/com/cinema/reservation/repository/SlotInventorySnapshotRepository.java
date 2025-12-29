package com.cinema.reservation.repository;

import com.cinema.reservation.domain.SlotInventorySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 时段库存快照 Repository
 * <p>
 * 提供时段库存快照的数据访问接口，用于记录预约创建时的库存状态。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Repository
public interface SlotInventorySnapshotRepository extends JpaRepository<SlotInventorySnapshot, UUID> {

    /**
     * 根据预约单ID查询库存快照
     *
     * @param reservationOrderId 预约单ID
     * @return Optional 库存快照
     */
    Optional<SlotInventorySnapshot> findByReservationOrderId(UUID reservationOrderId);

    /**
     * 根据时段模板ID和预订日期查询库存快照
     *
     * @param timeSlotTemplateId 时段模板ID
     * @param reservationDate    预订日期
     * @return 库存快照列表
     */
    List<SlotInventorySnapshot> findByTimeSlotTemplateIdAndReservationDate(
            UUID timeSlotTemplateId,
            LocalDate reservationDate
    );

    /**
     * 根据时段模板ID和日期范围查询库存快照
     *
     * @param timeSlotTemplateId 时段模板ID
     * @param startDate          开始日期
     * @param endDate            结束日期
     * @return 库存快照列表
     */
    @Query("SELECT s FROM SlotInventorySnapshot s WHERE s.timeSlotTemplateId = :timeSlotTemplateId AND s.reservationDate BETWEEN :startDate AND :endDate ORDER BY s.reservationDate ASC")
    List<SlotInventorySnapshot> findByTimeSlotTemplateIdAndReservationDateBetween(
            @Param("timeSlotTemplateId") UUID timeSlotTemplateId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 查询有可用库存的时段快照
     *
     * @param timeSlotTemplateId 时段模板ID
     * @param reservationDate    预订日期
     * @return 有可用库存的快照列表
     */
    @Query("SELECT s FROM SlotInventorySnapshot s WHERE s.timeSlotTemplateId = :timeSlotTemplateId AND s.reservationDate = :reservationDate AND s.remainingCapacity > 0")
    List<SlotInventorySnapshot> findAvailableByTimeSlotTemplateIdAndReservationDate(
            @Param("timeSlotTemplateId") UUID timeSlotTemplateId,
            @Param("reservationDate") LocalDate reservationDate
    );

    /**
     * 删除指定日期之前的历史库存快照
     *
     * @param date 日期
     * @return 删除的记录数
     */
    @Query("DELETE FROM SlotInventorySnapshot s WHERE s.reservationDate < :date")
    int deleteByReservationDateBefore(@Param("date") LocalDate date);
}

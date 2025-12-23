package com.cinema.reservation.repository;

import com.cinema.reservation.domain.ReservationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 预约单加购项 Repository
 * <p>
 * 提供预约单加购项明细的数据访问接口。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Repository
public interface ReservationItemRepository extends JpaRepository<ReservationItem, UUID> {

    /**
     * 根据预约单ID查询所有加购项
     *
     * @param reservationOrderId 预约单ID
     * @return 加购项列表
     */
    List<ReservationItem> findByReservationOrderId(UUID reservationOrderId);

    /**
     * 根据预约单ID删除所有加购项
     *
     * @param reservationOrderId 预约单ID
     */
    @Modifying
    @Query("DELETE FROM ReservationItem i WHERE i.reservationOrder.id = :reservationOrderId")
    void deleteByReservationOrderId(@Param("reservationOrderId") UUID reservationOrderId);

    /**
     * 统计预约单的加购项数量
     *
     * @param reservationOrderId 预约单ID
     * @return 加购项数量
     */
    @Query("SELECT COUNT(i) FROM ReservationItem i WHERE i.reservationOrder.id = :reservationOrderId")
    int countByReservationOrderId(@Param("reservationOrderId") UUID reservationOrderId);
}

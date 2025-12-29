/**
 * @spec O003-beverage-order
 * 饮品订单数据访问层
 */
package com.cinema.beverage.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.entity.BeverageOrder.OrderStatus;

/**
 * 饮品订单Repository
 *
 * 对应 spec: O003-beverage-order
 * 提供订单数据的CRUD操作和自定义查询
 */
@Repository
public interface BeverageOrderRepository extends JpaRepository<BeverageOrder, UUID> {

    /**
     * 根据订单号查询订单
     */
    Optional<BeverageOrder> findByOrderNumber(String orderNumber);

    /**
     * 根据用户ID查询订单列表（分页）
     */
    Page<BeverageOrder> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * 根据门店ID和状态查询订单列表
     */
    List<BeverageOrder> findByStoreIdAndStatusOrderByCreatedAtDesc(UUID storeId, OrderStatus status);

    /**
     * 根据门店ID查询订单列表（分页）
     */
    Page<BeverageOrder> findByStoreIdOrderByCreatedAtDesc(UUID storeId, Pageable pageable);

    /**
     * 根据门店ID和状态查询订单列表（分页）
     */
    Page<BeverageOrder> findByStoreIdAndStatusOrderByCreatedAtDesc(
            UUID storeId,
            OrderStatus status,
            Pageable pageable
    );

    /**
     * 根据状态查询订单列表（分页）
     */
    Page<BeverageOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    /**
     * 根据门店ID和状态列表查询订单列表
     */
    List<BeverageOrder> findByStoreIdAndStatusInOrderByCreatedAtAsc(
            UUID storeId,
            List<OrderStatus> statuses
    );

    /**
     * 根据门店ID、状态和时间范围查询订单列表
     */
    @Query("SELECT o FROM BeverageOrder o WHERE o.storeId = :storeId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND o.createdAt >= :startTime AND o.createdAt <= :endTime " +
           "ORDER BY o.createdAt DESC")
    Page<BeverageOrder> findByStoreAndStatusAndTimeRange(
            @Param("storeId") UUID storeId,
            @Param("status") OrderStatus status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    /**
     * 统计门店待处理订单数量（待制作 + 制作中）
     */
    @Query("SELECT COUNT(o) FROM BeverageOrder o WHERE o.storeId = :storeId " +
           "AND o.status IN ('PENDING_PRODUCTION', 'PRODUCING')")
    long countPendingOrdersByStore(@Param("storeId") UUID storeId);

    /**
     * 查询门店今日订单统计
     */
    @Query("SELECT o.status, COUNT(o), SUM(o.totalPrice) " +
           "FROM BeverageOrder o " +
           "WHERE o.storeId = :storeId " +
           "AND o.createdAt >= :startOfDay AND o.createdAt < :endOfDay " +
           "GROUP BY o.status")
    List<Object[]> getTodayOrderStats(
            @Param("storeId") UUID storeId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    /**
     * 检查订单号是否已存在
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * 根据用户ID和状态查询订单列表
     * US3: 订单历史筛选
     */
    Page<BeverageOrder> findByUserIdAndStatusOrderByCreatedAtDesc(
            UUID userId,
            OrderStatus status,
            Pageable pageable
    );

    /**
     * 根据用户ID和时间范围查询订单列表
     * US3: 订单历史筛选
     */
    Page<BeverageOrder> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID userId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * 根据门店ID和时间范围查询订单列表
     * US3: 订单历史筛选
     */
    Page<BeverageOrder> findByStoreIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID storeId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * 根据状态和时间范围查询订单列表
     * US3: 订单历史筛选
     */
    Page<BeverageOrder> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
            OrderStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * 查询全部订单（分页，按时间倒序）
     * US3: B端查询全部历史订单
     */
    Page<BeverageOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

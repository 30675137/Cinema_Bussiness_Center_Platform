/**
 * @spec N001-purchase-inbound
 * 采购订单数据访问接口
 */
package com.cinema.procurement.repository;

import com.cinema.procurement.entity.PurchaseOrderEntity;
import com.cinema.procurement.entity.PurchaseOrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrderEntity, UUID> {

    Optional<PurchaseOrderEntity> findByOrderNumber(String orderNumber);

    @Query("SELECT po FROM PurchaseOrderEntity po " +
           "LEFT JOIN FETCH po.supplier " +
           "LEFT JOIN FETCH po.store " +
           "WHERE po.id = :id")
    Optional<PurchaseOrderEntity> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT po FROM PurchaseOrderEntity po " +
           "LEFT JOIN FETCH po.supplier " +
           "LEFT JOIN FETCH po.store " +
           "LEFT JOIN FETCH po.items " +
           "WHERE po.id = :id")
    Optional<PurchaseOrderEntity> findByIdWithItems(@Param("id") UUID id);

    @Query("SELECT po FROM PurchaseOrderEntity po " +
           "LEFT JOIN FETCH po.supplier " +
           "LEFT JOIN FETCH po.store " +
           "WHERE (:storeId IS NULL OR po.storeId = :storeId) " +
           "AND (:status IS NULL OR po.status = :status) " +
           "ORDER BY po.createdAt DESC")
    Page<PurchaseOrderEntity> findByFilters(
        @Param("storeId") UUID storeId,
        @Param("status") PurchaseOrderStatus status,
        Pageable pageable
    );

    @Query("SELECT COUNT(po) FROM PurchaseOrderEntity po " +
           "WHERE (:storeId IS NULL OR po.storeId = :storeId) " +
           "AND (:status IS NULL OR po.status = :status)")
    long countByFilters(@Param("storeId") UUID storeId, @Param("status") PurchaseOrderStatus status);

    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT po FROM PurchaseOrderEntity po WHERE po.id = :id")
    Optional<PurchaseOrderEntity> findByIdWithLock(@Param("id") UUID id);

    @Query(value = "SELECT generate_po_number()", nativeQuery = true)
    String generateOrderNumber();

    /**
     * 按门店和状态统计订单数量
     */
    @Query("SELECT COUNT(po) FROM PurchaseOrderEntity po " +
           "WHERE (:storeId IS NULL OR po.storeId = :storeId) " +
           "AND po.status = :status")
    long countByStoreIdAndStatus(@Param("storeId") UUID storeId, @Param("status") PurchaseOrderStatus status);
}

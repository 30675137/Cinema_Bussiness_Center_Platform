/**
 * @spec N001-purchase-inbound
 * 收货入库单数据访问接口
 */
package com.cinema.procurement.repository;

import com.cinema.procurement.entity.GoodsReceiptEntity;
import com.cinema.procurement.entity.GoodsReceiptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceiptEntity, UUID> {

    Optional<GoodsReceiptEntity> findByReceiptNumber(String receiptNumber);

    @Query("SELECT gr FROM GoodsReceiptEntity gr " +
           "LEFT JOIN FETCH gr.purchaseOrder " +
           "LEFT JOIN FETCH gr.store " +
           "WHERE gr.id = :id")
    Optional<GoodsReceiptEntity> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT gr FROM GoodsReceiptEntity gr " +
           "LEFT JOIN FETCH gr.purchaseOrder " +
           "LEFT JOIN FETCH gr.store " +
           "LEFT JOIN FETCH gr.items " +
           "WHERE gr.id = :id")
    Optional<GoodsReceiptEntity> findByIdWithItems(@Param("id") UUID id);

    List<GoodsReceiptEntity> findByPurchaseOrderId(UUID purchaseOrderId);

    @Query("SELECT gr FROM GoodsReceiptEntity gr " +
           "LEFT JOIN FETCH gr.purchaseOrder po " +
           "LEFT JOIN FETCH po.supplier " +
           "LEFT JOIN FETCH gr.store " +
           "WHERE (:storeId IS NULL OR gr.storeId = :storeId) " +
           "AND (:status IS NULL OR gr.status = :status) " +
           "ORDER BY gr.createdAt DESC")
    Page<GoodsReceiptEntity> findByFilters(
        @Param("storeId") UUID storeId,
        @Param("status") GoodsReceiptStatus status,
        Pageable pageable
    );

    @Query(value = "SELECT generate_gr_number()", nativeQuery = true)
    String generateReceiptNumber();
}

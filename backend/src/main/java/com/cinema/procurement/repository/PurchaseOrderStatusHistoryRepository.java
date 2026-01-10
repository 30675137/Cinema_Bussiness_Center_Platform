/**
 * @spec N001-purchase-inbound
 * 采购订单状态历史仓库
 */
package com.cinema.procurement.repository;

import com.cinema.procurement.entity.PurchaseOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseOrderStatusHistoryRepository extends JpaRepository<PurchaseOrderStatusHistory, UUID> {

    /**
     * 根据采购订单ID查询状态变更历史（按时间倒序）
     */
    @Query("SELECT h FROM PurchaseOrderStatusHistory h WHERE h.purchaseOrder.id = :purchaseOrderId ORDER BY h.createdAt DESC")
    List<PurchaseOrderStatusHistory> findByPurchaseOrderIdOrderByCreatedAtDesc(@Param("purchaseOrderId") UUID purchaseOrderId);

    /**
     * 根据采购订单ID查询状态变更历史（按时间正序）
     */
    @Query("SELECT h FROM PurchaseOrderStatusHistory h WHERE h.purchaseOrder.id = :purchaseOrderId ORDER BY h.createdAt ASC")
    List<PurchaseOrderStatusHistory> findByPurchaseOrderIdOrderByCreatedAtAsc(@Param("purchaseOrderId") UUID purchaseOrderId);
}

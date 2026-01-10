/**
 * @spec N001-purchase-inbound
 * 采购订单明细数据访问接口
 */
package com.cinema.procurement.repository;

import com.cinema.procurement.entity.PurchaseOrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItemEntity, UUID> {

    List<PurchaseOrderItemEntity> findByPurchaseOrderId(UUID purchaseOrderId);

    @Query("SELECT poi FROM PurchaseOrderItemEntity poi " +
           "LEFT JOIN FETCH poi.sku " +
           "WHERE poi.purchaseOrder.id = :purchaseOrderId")
    List<PurchaseOrderItemEntity> findByPurchaseOrderIdWithSku(@Param("purchaseOrderId") UUID purchaseOrderId);

    void deleteByPurchaseOrderId(UUID purchaseOrderId);
}

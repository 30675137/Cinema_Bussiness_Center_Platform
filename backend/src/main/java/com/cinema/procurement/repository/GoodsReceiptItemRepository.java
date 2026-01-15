/**
 * @spec N001-purchase-inbound
 * 收货入库明细数据访问接口
 */
package com.cinema.procurement.repository;

import com.cinema.procurement.entity.GoodsReceiptItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GoodsReceiptItemRepository extends JpaRepository<GoodsReceiptItemEntity, UUID> {

    List<GoodsReceiptItemEntity> findByGoodsReceiptId(UUID goodsReceiptId);

    @Query("SELECT gri FROM GoodsReceiptItemEntity gri " +
           "LEFT JOIN FETCH gri.sku " +
           "WHERE gri.goodsReceipt.id = :goodsReceiptId")
    List<GoodsReceiptItemEntity> findByGoodsReceiptIdWithSku(@Param("goodsReceiptId") UUID goodsReceiptId);
}

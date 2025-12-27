package com.cinema.inventory.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.inventory.domain.InventoryAdjustment;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 库存调整 Repository
 * 
 * P004-inventory-adjustment
 */
@Repository
public interface AdjustmentRepository extends JpaRepository<InventoryAdjustment, UUID> {

  /**
   * 根据调整单号查询
   */
  Optional<InventoryAdjustment> findByAdjustmentNumber(String adjustmentNumber);

  /**
   * 根据SKU和门店查询
   */
  List<InventoryAdjustment> findBySkuIdAndStoreId(UUID skuId, UUID storeId);

  /**
   * 根据状态查询（分页）
   */
  Page<InventoryAdjustment> findByStatus(String status, Pageable pageable);

  /**
   * 根据多个状态查询（分页）
   */
  Page<InventoryAdjustment> findByStatusIn(List<String> statuses, Pageable pageable);

  /**
   * 根据SKU查询（分页）
   */
  Page<InventoryAdjustment> findBySkuId(UUID skuId, Pageable pageable);

  /**
   * 根据门店查询（分页）
   */
  Page<InventoryAdjustment> findByStoreId(UUID storeId, Pageable pageable);

  /**
   * 根据操作人查询（分页）
   */
  Page<InventoryAdjustment> findByOperatorId(UUID operatorId, Pageable pageable);

  /**
   * 查询待审批记录（分页）
   */
  @Query("SELECT a FROM InventoryAdjustment a WHERE a.status = 'pending_approval' ORDER BY a.createdAt DESC")
  Page<InventoryAdjustment> findPendingApprovals(Pageable pageable);

  /**
   * 统计待审批数量
   */
  @Query("SELECT COUNT(a) FROM InventoryAdjustment a WHERE a.status = 'pending_approval'")
  long countPendingApprovals();

  /**
   * 根据时间范围查询
   */
  @Query("SELECT a FROM InventoryAdjustment a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
  Page<InventoryAdjustment> findByDateRange(
      @Param("startDate") OffsetDateTime startDate,
      @Param("endDate") OffsetDateTime endDate,
      Pageable pageable);

  /**
   * 复合查询：根据SKU、门店、状态、类型、时间范围查询
   */
  @Query("SELECT a FROM InventoryAdjustment a WHERE " +
      "(:skuId IS NULL OR a.skuId = :skuId) AND " +
      "(:storeId IS NULL OR a.storeId = :storeId) AND " +
      "(:status IS NULL OR a.status = :status) AND " +
      "(:adjustmentType IS NULL OR a.adjustmentType = :adjustmentType) AND " +
      "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
      "(:endDate IS NULL OR a.createdAt <= :endDate) " +
      "ORDER BY a.createdAt DESC")
  Page<InventoryAdjustment> findWithFilters(
      @Param("skuId") UUID skuId,
      @Param("storeId") UUID storeId,
      @Param("status") String status,
      @Param("adjustmentType") String adjustmentType,
      @Param("startDate") OffsetDateTime startDate,
      @Param("endDate") OffsetDateTime endDate,
      Pageable pageable);

  /**
   * 检查是否存在指定SKU和门店的待审批调整
   */
  @Query("SELECT COUNT(a) > 0 FROM InventoryAdjustment a WHERE " +
      "a.skuId = :skuId AND a.storeId = :storeId AND a.status = 'pending_approval'")
  boolean existsPendingAdjustment(@Param("skuId") UUID skuId, @Param("storeId") UUID storeId);

  /**
   * 查找当天最大的调整单号
   * 用于生成新的调整单号序列
   * 
   * @param prefix 单号前缀，如 "ADJ20251227"
   * @return 当天最大单号，如 "ADJ202512270005"
   */
  @Query("SELECT MAX(a.adjustmentNumber) FROM InventoryAdjustment a WHERE a.adjustmentNumber LIKE :prefix%")
  Optional<String> findMaxAdjustmentNumberByPrefix(@Param("prefix") String prefix);
}

package com.cinema.inventory.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.inventory.domain.ApprovalRecord;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 审批记录 Repository
 * 
 * P004-inventory-adjustment
 */
@Repository
public interface ApprovalRepository extends JpaRepository<ApprovalRecord, UUID> {

  /**
   * 根据调整单ID查询审批记录（按时间降序）
   */
  List<ApprovalRecord> findByAdjustmentIdOrderByActionTimeDesc(UUID adjustmentId);

  /**
   * 根据审批人查询审批记录（分页）
   */
  Page<ApprovalRecord> findByApproverId(UUID approverId, Pageable pageable);

  /**
   * 根据审批操作类型查询
   */
  List<ApprovalRecord> findByAction(String action);

  /**
   * 根据调整单ID查询最新的审批记录
   */
  @Query("SELECT ar FROM ApprovalRecord ar WHERE ar.adjustmentId = :adjustmentId ORDER BY ar.actionTime DESC")
  List<ApprovalRecord> findLatestByAdjustmentId(@Param("adjustmentId") UUID adjustmentId);

  /**
   * 查询某时间段内的审批记录
   */
  @Query("SELECT ar FROM ApprovalRecord ar WHERE ar.actionTime BETWEEN :startDate AND :endDate ORDER BY ar.actionTime DESC")
  Page<ApprovalRecord> findByDateRange(
      @Param("startDate") OffsetDateTime startDate,
      @Param("endDate") OffsetDateTime endDate,
      Pageable pageable);

  /**
   * 统计审批人的审批数量
   */
  @Query("SELECT COUNT(ar) FROM ApprovalRecord ar WHERE ar.approverId = :approverId AND ar.action = :action")
  long countByApproverAndAction(@Param("approverId") UUID approverId, @Param("action") String action);

  /**
   * 查询调整单是否已有审批记录
   */
  boolean existsByAdjustmentId(UUID adjustmentId);
}

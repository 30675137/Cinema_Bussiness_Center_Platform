package com.cinema.inventory.service;

import com.cinema.inventory.domain.InventoryAdjustment;
import com.cinema.inventory.dto.AdjustmentRequest;
import com.cinema.inventory.dto.AdjustmentResponse;
import com.cinema.inventory.repository.AdjustmentRepository;
import com.cinema.inventory.repository.StoreInventoryRepository;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 库存调整服务层
 * 提供库存调整创建、审批、撤回等业务逻辑。
 * 
 * P004-inventory-adjustment
 * 
 * @since US1 - 录入库存调整
 */
@Service
public class InventoryAdjustmentService {

  private static final Logger logger = LoggerFactory.getLogger(InventoryAdjustmentService.class);

  /**
   * 审批阈值（元）
   * 调整金额 >= 此值时需要审批
   */
  private static final BigDecimal APPROVAL_THRESHOLD = new BigDecimal("1000");

  private final AdjustmentRepository adjustmentRepository;
  private final StoreInventoryRepository inventoryRepository;

  public InventoryAdjustmentService(
      AdjustmentRepository adjustmentRepository,
      StoreInventoryRepository inventoryRepository) {
    this.adjustmentRepository = adjustmentRepository;
    this.inventoryRepository = inventoryRepository;
  }

  /**
   * 创建库存调整
   * 
   * 业务规则：
   * 1. 验证 SKU 和门店存在
   * 2. 获取当前库存数量
   * 3. 计算调整后库存（盘盈增加，盘亏/报损减少）
   * 4. 计算调整金额（数量 × 单价）
   * 5. 判断是否需要审批（金额 >= 1000元）
   * 6. 如果不需要审批，立即更新库存并生成流水
   * 7. 如果需要审批，进入待审批状态
   * 
   * @param request      调整请求
   * @param operatorId   操作人ID
   * @param operatorName 操作人姓名
   * @return 调整响应
   */
  @Transactional
  public AdjustmentResponse createAdjustment(
      AdjustmentRequest request,
      UUID operatorId,
      String operatorName) {

    logger.info("Creating adjustment: skuId={}, storeId={}, type={}, quantity={}",
        request.getSkuId(), request.getStoreId(),
        request.getAdjustmentType(), request.getQuantity());

    // 1. 验证并获取库存记录
    UUID skuId = UUID.fromString(request.getSkuId());
    UUID storeId = UUID.fromString(request.getStoreId());

    // 从库存表获取当前库存
    var inventoryOpt = inventoryRepository.findBySkuIdAndStoreId(skuId, storeId);
    if (inventoryOpt.isEmpty()) {
      throw new ResourceNotFoundException("库存记录", "skuId=" + skuId + ", storeId=" + storeId);
    }
    var inventory = inventoryOpt.get();
    
    int currentStock = inventory.getOnHandQty().intValue();
    int currentAvailable = inventory.getAvailableQty().intValue();
    // TODO: 从 SKU 表获取单价，暂用默认值
    BigDecimal unitPrice = new BigDecimal("50.00");
    
    logger.debug("Current inventory: onHand={}, available={}", currentStock, currentAvailable);

    // 2. 计算调整后库存
    boolean isIncrease = "surplus".equals(request.getAdjustmentType());
    int stockAfter = isIncrease
        ? currentStock + request.getQuantity()
        : currentStock - request.getQuantity();
    int availableAfter = isIncrease
        ? currentAvailable + request.getQuantity()
        : currentAvailable - request.getQuantity();

    // 验证库存不能为负
    if (stockAfter < 0 || availableAfter < 0) {
      throw new BusinessException("INSUFFICIENT_STOCK", "库存不足，无法执行此调整");
    }

    // 3. 计算调整金额
    BigDecimal adjustmentAmount = unitPrice.multiply(new BigDecimal(request.getQuantity()));

    // 4. 判断是否需要审批
    boolean requiresApproval = adjustmentAmount.compareTo(APPROVAL_THRESHOLD) >= 0;

    // 5. 生成调整单号
    String adjustmentNumber = generateAdjustmentNumber();

    // 6. 创建调整记录
    InventoryAdjustment adjustment = InventoryAdjustment.builder()
        .adjustmentNumber(adjustmentNumber)
        .skuId(skuId)
        .storeId(storeId)
        .adjustmentType(request.getAdjustmentType())
        .quantity(request.getQuantity())
        .unitPrice(unitPrice)
        .reasonCode(request.getReasonCode())
        .reasonText(request.getReasonText())
        .remarks(request.getRemarks())
        .stockBefore(currentStock)
        .stockAfter(stockAfter)
        .availableBefore(currentAvailable)
        .availableAfter(availableAfter)
        .requiresApproval(requiresApproval)
        .operatorId(operatorId)
        .operatorName(operatorName)
        .status(requiresApproval ? "pending_approval" : "approved")
        .build();

    // 7. 保存调整记录
    InventoryAdjustment savedAdjustment = adjustmentRepository.save(adjustment);
    logger.info("Adjustment created: id={}, number={}, requiresApproval={}",
        savedAdjustment.getId(), adjustmentNumber, requiresApproval);

    // 8. 如果不需要审批，立即更新库存
    if (!requiresApproval) {
      updateInventoryStock(skuId, storeId, stockAfter, availableAfter);
      // TODO: 生成流水记录
      logger.info("Inventory updated immediately: skuId={}, stockAfter={}", skuId, stockAfter);
    }

    // 9. 构建响应
    return toResponse(savedAdjustment, unitPrice);
  }

  /**
   * 生成调整单号
   * 格式：ADJ + 日期 + 序号（如 ADJ202512260001）
   * 从数据库查询当天最大序号，避免重启后序号冲突
   */
  private String generateAdjustmentNumber() {
    String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
    String prefix = "ADJ" + dateStr;
    
    // 从数据库查询当天最大序号
    long nextSeq = adjustmentRepository.findMaxAdjustmentNumberByPrefix(prefix)
        .map(maxNumber -> {
          // 解析序号部分，如 ADJ202512270005 -> 5
          String seqPart = maxNumber.substring(prefix.length());
          try {
            return Long.parseLong(seqPart) + 1;
          } catch (NumberFormatException e) {
            logger.warn("Failed to parse adjustment number sequence: {}", maxNumber);
            return 1L;
          }
        })
        .orElse(1L);
    
    return String.format("%s%04d", prefix, nextSeq);
  }

  /**
   * 更新库存数量
   * 立即更新库存表中的现存数量和可用数量
   */
  private void updateInventoryStock(UUID skuId, UUID storeId, int stockAfter, int availableAfter) {
    logger.info("Updating inventory: skuId={}, storeId={}, stockAfter={}, availableAfter={}",
        skuId, storeId, stockAfter, availableAfter);
    
    // 查询库存记录获取ID
    var inventoryOpt = inventoryRepository.findBySkuIdAndStoreId(skuId, storeId);
    if (inventoryOpt.isEmpty()) {
      logger.error("Inventory record not found for update: skuId={}, storeId={}", skuId, storeId);
      throw new ResourceNotFoundException("库存记录", "skuId=" + skuId + ", storeId=" + storeId);
    }
    
    var inventory = inventoryOpt.get();
    boolean success = inventoryRepository.updateInventoryQty(
        inventory.getId(),
        new BigDecimal(stockAfter),
        new BigDecimal(availableAfter)
    );
    
    if (!success) {
      logger.error("Failed to update inventory: id={}", inventory.getId());
      throw new BusinessException("UPDATE_FAILED", "更新库存失败");
    }
    
    logger.info("Inventory updated successfully: id={}, stockAfter={}, availableAfter={}",
        inventory.getId(), stockAfter, availableAfter);
  }

  /**
   * 转换为响应 DTO
   */
  private AdjustmentResponse toResponse(InventoryAdjustment adjustment, BigDecimal unitPrice) {
    return AdjustmentResponse.builder()
        .id(adjustment.getId().toString())
        .adjustmentNumber(adjustment.getAdjustmentNumber())
        .skuId(adjustment.getSkuId().toString())
        .storeId(adjustment.getStoreId().toString())
        .adjustmentType(adjustment.getAdjustmentType())
        .quantity(adjustment.getQuantity())
        .unitPrice(unitPrice)
        .adjustmentAmount(adjustment.getAdjustmentAmount())
        .reasonCode(adjustment.getReasonCode())
        .reasonText(adjustment.getReasonText())
        .remarks(adjustment.getRemarks())
        .status(adjustment.getStatus())
        .stockBefore(adjustment.getStockBefore())
        .stockAfter(adjustment.getStockAfter())
        .availableBefore(adjustment.getAvailableBefore())
        .availableAfter(adjustment.getAvailableAfter())
        .requiresApproval(adjustment.getRequiresApproval())
        .operatorId(adjustment.getOperatorId().toString())
        .operatorName(adjustment.getOperatorName())
        .createdAt(adjustment.getCreatedAt())
        .updatedAt(adjustment.getUpdatedAt())
        .version(adjustment.getVersion())
        .build();
  }

  /**
   * 根据ID获取调整记录
   */
  public AdjustmentResponse getAdjustmentById(UUID id) {
    InventoryAdjustment adjustment = adjustmentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("调整记录", id.toString()));
    return toResponse(adjustment, adjustment.getUnitPrice());
  }

  /**
   * 撤回调整申请
   * 仅允许撤回待审批状态的记录
   */
  @Transactional
  public AdjustmentResponse withdrawAdjustment(UUID id, UUID operatorId) {
    InventoryAdjustment adjustment = adjustmentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("调整记录", id.toString()));

    if (!adjustment.canWithdraw()) {
      throw new BusinessException("INVALID_STATUS", "当前状态不允许撤回");
    }

    if (!adjustment.getOperatorId().equals(operatorId)) {
      throw new BusinessException("PERMISSION_DENIED", "只能撤回自己创建的调整申请");
    }

    adjustment.setStatus("withdrawn");
    adjustment.setUpdatedAt(OffsetDateTime.now());

    InventoryAdjustment saved = adjustmentRepository.save(adjustment);
    logger.info("Adjustment withdrawn: id={}", id);

    return toResponse(saved, saved.getUnitPrice());
  }
}

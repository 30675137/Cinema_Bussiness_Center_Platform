package com.cinema.inventory.controller;

import com.cinema.inventory.domain.StoreInventory;
import com.cinema.inventory.repository.InventoryTransactionRepository;
import com.cinema.inventory.repository.InventoryTransactionRepository.InventoryTransaction;
import com.cinema.inventory.repository.StoreInventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 安全库存 API 控制器
 * 提供安全库存更新接口，支持乐观锁冲突检测。
 * 
 * P004-inventory-adjustment
 * 实现 T061 任务。
 * 
 * @since US5 - 设置安全库存阈值
 */
@RestController
@RequestMapping("/api/inventory")
public class SafetyStockController {

  private static final Logger logger = LoggerFactory.getLogger(SafetyStockController.class);

  private final StoreInventoryRepository inventoryRepository;
  private final InventoryTransactionRepository transactionRepository;

  // 版本号存储（用于乐观锁）
  private final ConcurrentHashMap<String, Integer> versionStore = new ConcurrentHashMap<>();

  @Autowired
  public SafetyStockController(
      StoreInventoryRepository inventoryRepository,
      InventoryTransactionRepository transactionRepository) {
    this.inventoryRepository = inventoryRepository;
    this.transactionRepository = transactionRepository;
  }

  /**
   * 更新安全库存
   * 
   * PUT /api/inventory/{id}/safety-stock
   * 
   * 支持乐观锁，如果版本号不匹配返回 409 Conflict
   * 
   * @param id      库存记录ID
   * @param request 更新请求 { safetyStock: number, version: number }
   * @return 更新结果
   */
  @PutMapping("/{id}/safety-stock")
  public ResponseEntity<Map<String, Object>> updateSafetyStock(
      @PathVariable String id,
      @RequestBody Map<String, Object> request) {

    logger.info("PUT /api/inventory/{}/safety-stock - request={}", id, request);

    Integer newSafetyStock = (Integer) request.get("safetyStock");
    Integer clientVersion = (Integer) request.get("version");

    if (newSafetyStock == null || newSafetyStock < 0) {
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("error", "INVALID_VALUE");
      response.put("message", "安全库存值必须为非负整数");
      return ResponseEntity.badRequest().body(response);
    }

    if (clientVersion == null) {
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("error", "MISSING_VERSION");
      response.put("message", "缺少版本号参数");
      return ResponseEntity.badRequest().body(response);
    }

    // 获取当前版本（模拟从数据库读取）
    Integer currentVersion = versionStore.getOrDefault(id, 1);

    // 乐观锁检查
    if (!clientVersion.equals(currentVersion)) {
      logger.warn("乐观锁冲突 - id={}, clientVersion={}, currentVersion={}",
          id, clientVersion, currentVersion);

      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("error", "CONCURRENT_MODIFICATION");
      response.put("message", "该记录已被他人修改，请刷新后重试");
      response.put("currentVersion", currentVersion);
      return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // 更新版本号
    int newVersion = currentVersion + 1;
    versionStore.put(id, newVersion);

    // 调用 Repository 更新数据库
    UUID inventoryId;
    StoreInventory inventory;
    BigDecimal oldSafetyStock;
    try {
      inventoryId = UUID.fromString(id);

      // 先获取库存详情（获取 skuId, storeId 和旧的 safetyStock）
      Optional<StoreInventory> inventoryOpt = inventoryRepository.findById(inventoryId);
      if (inventoryOpt.isEmpty()) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "NOT_FOUND");
        response.put("message", "库存记录不存在");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
      }
      inventory = inventoryOpt.get();
      oldSafetyStock = inventory.getSafetyStock();

      // 更新安全库存
      boolean success = inventoryRepository.updateSafetyStock(inventoryId, BigDecimal.valueOf(newSafetyStock));

      if (!success) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "UPDATE_FAILED");
        response.put("message", "更新安全库存失败");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
      }

      // 创建库存流水记录
      createSafetyStockTransaction(inventory, oldSafetyStock, BigDecimal.valueOf(newSafetyStock));

    } catch (IllegalArgumentException e) {
      Map<String, Object> response = new HashMap<>();
      response.put("success", false);
      response.put("error", "INVALID_ID");
      response.put("message", "无效的库存记录ID");
      return ResponseEntity.badRequest().body(response);
    }

    logger.info("安全库存更新成功 - id={}, newSafetyStock={}, newVersion={}",
        id, newSafetyStock, newVersion);

    Map<String, Object> data = new HashMap<>();
    data.put("id", id);
    data.put("safetyStock", newSafetyStock);
    data.put("version", newVersion);
    data.put("updatedAt", OffsetDateTime.now().toString());

    Map<String, Object> response = new HashMap<>();
    response.put("success", true);
    response.put("data", data);
    response.put("message", "安全库存已更新");

    return ResponseEntity.ok(response);
  }

  /**
   * 获取库存详情（包含版本号）
   * 
   * GET /api/inventory/{id}
   * 
   * 注意：此端点可能与 InventoryController 中的端点重复，
   * 实际实现时应该合并或协调。
   */
  @GetMapping("/{id}/version")
  public ResponseEntity<Map<String, Object>> getInventoryVersion(@PathVariable String id) {
    logger.info("GET /api/inventory/{}/version", id);

    Integer currentVersion = versionStore.getOrDefault(id, 1);

    Map<String, Object> data = new HashMap<>();
    data.put("id", id);
    data.put("version", currentVersion);

    Map<String, Object> response = new HashMap<>();
    response.put("success", true);
    response.put("data", data);

    return ResponseEntity.ok(response);
  }

  /**
   * 创建安全库存变更流水记录
   */
  private void createSafetyStockTransaction(StoreInventory inventory, BigDecimal oldSafetyStock,
      BigDecimal newSafetyStock) {
    try {
      InventoryTransaction txn = new InventoryTransaction();
      txn.skuId = inventory.getSkuId();
      txn.storeId = inventory.getStoreId();
      txn.transactionType = "safety_stock_update";
      txn.quantity = 0; // 安全库存变更不影响实际库存数量
      txn.stockBefore = inventory.getOnHandQty() != null ? inventory.getOnHandQty().intValue() : 0;
      txn.stockAfter = inventory.getOnHandQty() != null ? inventory.getOnHandQty().intValue() : 0;
      txn.availableBefore = inventory.getAvailableQty() != null ? inventory.getAvailableQty().intValue() : 0;
      txn.availableAfter = inventory.getAvailableQty() != null ? inventory.getAvailableQty().intValue() : 0;
      txn.sourceType = "safety_stock_config";
      txn.sourceDocument = "SAFETY-" + inventory.getId().toString().substring(0, 8).toUpperCase();
      txn.operatorName = "系统";
      txn.remarks = String.format("安全库存从 %s 调整为 %s",
          oldSafetyStock != null ? oldSafetyStock.intValue() : 0,
          newSafetyStock.intValue());

      transactionRepository.create(txn);
      logger.info("Created safety stock transaction for inventory {}: {} -> {}",
          inventory.getId(), oldSafetyStock, newSafetyStock);
    } catch (Exception e) {
      // 流水创建失败不影响主流程，仅记录日志
      logger.error("Failed to create safety stock transaction for inventory {}", inventory.getId(), e);
    }
  }
}

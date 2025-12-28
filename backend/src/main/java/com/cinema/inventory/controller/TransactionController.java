package com.cinema.inventory.controller;

import com.cinema.inventory.domain.StoreInventory;
import com.cinema.inventory.repository.InventoryTransactionRepository;
import com.cinema.inventory.repository.InventoryTransactionRepository.InventoryTransaction;
import com.cinema.inventory.repository.StoreInventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * 库存流水 API 控制器
 * 提供库存流水记录查询和库存调整接口。
 * 
 * P004-inventory-adjustment
 * 
 * @since US2 - 查看库存流水记录
 */
@RestController
@RequestMapping("/api/inventory/transactions")
public class TransactionController {

  private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

  private final StoreInventoryRepository storeInventoryRepository;
  private final InventoryTransactionRepository transactionRepository;

  public TransactionController(
      StoreInventoryRepository storeInventoryRepository,
      InventoryTransactionRepository transactionRepository) {
    this.storeInventoryRepository = storeInventoryRepository;
    this.transactionRepository = transactionRepository;
  }

  /**
   * 查询库存流水列表
   * 
   * GET /api/inventory/transactions?skuId=xxx&storeId=xxx&page=1&pageSize=20
   */
  @GetMapping
  public ResponseEntity<Map<String, Object>> listTransactions(
      @RequestParam(required = false) String skuId,
      @RequestParam(required = false) String storeId,
      @RequestParam(required = false) String startDate,
      @RequestParam(required = false) String endDate,
      @RequestParam(defaultValue = "1") Integer page,
      @RequestParam(defaultValue = "20") Integer pageSize) {

    logger.info("GET /api/inventory/transactions - skuId={}, storeId={}, page={}, pageSize={}",
        skuId, storeId, page, pageSize);

    try {
      UUID skuUuid = parseUUID(skuId);
      UUID storeUuid = parseUUID(storeId);

      List<InventoryTransaction> transactions = transactionRepository.findByParams(skuUuid, storeUuid, page, pageSize);
      long total = transactionRepository.countByParams(skuUuid, storeUuid);

      // 转换为前端期望的格式，包含 SKU 和 Store 关联信息
      List<Map<String, Object>> transactionList = new ArrayList<>();
      for (InventoryTransaction txn : transactions) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", txn.id != null ? txn.id.toString() : null);
        item.put("skuId", txn.skuId != null ? txn.skuId.toString() : null);
        item.put("storeId", txn.storeId != null ? txn.storeId.toString() : null);
        item.put("transactionType", txn.transactionType);
        item.put("quantity", txn.quantity);
        item.put("stockBefore", txn.stockBefore);
        item.put("stockAfter", txn.stockAfter);
        item.put("availableBefore", txn.availableBefore);
        item.put("availableAfter", txn.availableAfter);
        item.put("sourceType", txn.sourceType);
        item.put("sourceDocument", txn.sourceDocument);
        item.put("operatorId", txn.operatorId != null ? txn.operatorId.toString() : null);
        item.put("operatorName", txn.operatorName);
        item.put("remarks", txn.remarks);
        item.put("transactionTime", txn.transactionTime != null ? txn.transactionTime.toString() : null);
        item.put("createdAt", txn.createdAt != null ? txn.createdAt.toString() : null);

        // 添加 SKU 关联信息
        Map<String, Object> skuInfo = new HashMap<>();
        if (txn.skus != null) {
          skuInfo.put("skuCode", txn.skus.code);
          skuInfo.put("name", txn.skus.name);
          skuInfo.put("unit", txn.skus.mainUnit);
        }
        item.put("sku", skuInfo);

        // 添加 Store 关联信息
        Map<String, Object> storeInfo = new HashMap<>();
        if (txn.stores != null) {
          storeInfo.put("code", txn.stores.code);
          storeInfo.put("name", txn.stores.name);
        }
        item.put("store", storeInfo);

        // 添加 operator 信息
        Map<String, Object> operatorInfo = new HashMap<>();
        operatorInfo.put("name", txn.operatorName);
        item.put("operator", operatorInfo);

        transactionList.add(item);
      }

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("data", transactionList);
      response.put("total", total);
      response.put("page", page);
      response.put("pageSize", pageSize);

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      logger.error("Error fetching transactions", e);
      Map<String, Object> errorResponse = new HashMap<>();
      errorResponse.put("success", false);
      errorResponse.put("message", "Failed to fetch transactions: " + e.getMessage());
      return ResponseEntity.internalServerError().body(errorResponse);
    }
  }

  /**
   * 查询单条流水详情
   * 
   * GET /api/inventory/transactions/{id}
   */
  @GetMapping("/{id}")
  public ResponseEntity<Map<String, Object>> getTransaction(@PathVariable String id) {
    logger.info("GET /api/inventory/transactions/{} - 查询流水详情", id);

    // TODO: 实现单条流水详情查询
    Map<String, Object> response = new HashMap<>();
    response.put("success", false);
    response.put("message", "Not implemented yet");
    return ResponseEntity.status(501).body(response);
  }

  /**
   * 创建库存流水记录（库存调整）
   * 
   * POST /api/inventory/transactions
   * 
   * 用于记录库存调整操作，同时更新库存数量。
   * 
   * Request Body:
   * {
   * "skuId": "uuid",
   * "storeId": "uuid",
   * "transactionType": "adjustment_in" | "adjustment_out" | "damage_out" | ...,
   * "quantity": 10,
   * "sourceType": "adjustment_order",
   * "sourceDocument": "ADJ20251226001",
   * "operatorId": "uuid",
   * "operatorName": "操作员",
   * "remarks": "盘点调整"
   * }
   */
  @PostMapping
  public ResponseEntity<Map<String, Object>> createTransaction(@RequestBody Map<String, Object> requestBody) {
    logger.info("POST /api/inventory/transactions - 创建库存流水");

    try {
      // 解析请求参数
      String skuIdStr = (String) requestBody.get("skuId");
      String storeIdStr = (String) requestBody.get("storeId");
      String transactionType = (String) requestBody.getOrDefault("transactionType", "adjustment_in");
      Object quantityObj = requestBody.getOrDefault("quantity", 0);
      int quantity = quantityObj instanceof Number ? ((Number) quantityObj).intValue() : 0;
      String sourceType = (String) requestBody.getOrDefault("sourceType", "adjustment_order");
      String sourceDocument = (String) requestBody.get("sourceDocument");
      String operatorIdStr = (String) requestBody.get("operatorId");
      String operatorName = (String) requestBody.getOrDefault("operatorName", "系统");
      String remarks = (String) requestBody.get("remarks");

      if (skuIdStr == null || storeIdStr == null) {
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "skuId and storeId are required"));
      }

      UUID skuId = UUID.fromString(skuIdStr);
      UUID storeId = UUID.fromString(storeIdStr);
      UUID operatorId = parseUUID(operatorIdStr); // 使用安全解析，"current-user"等无效值返回null

      // 判断是入库还是出库
      boolean isIn = transactionType != null && transactionType.contains("_in");

      // 1. 查询当前库存
      Optional<StoreInventory> inventoryOpt = storeInventoryRepository.findBySkuIdAndStoreId(skuId, storeId);

      int stockBefore;
      int availableBefore;
      int stockAfter;
      int availableAfter;
      UUID inventoryId;

      if (inventoryOpt.isPresent()) {
        StoreInventory inventory = inventoryOpt.get();
        inventoryId = inventory.getId();
        stockBefore = inventory.getOnHandQty().intValue();
        availableBefore = inventory.getAvailableQty().intValue();

        // 计算调整后的库存
        if (isIn) {
          stockAfter = stockBefore + quantity;
          availableAfter = availableBefore + quantity;
        } else {
          stockAfter = Math.max(0, stockBefore - quantity);
          availableAfter = Math.max(0, availableBefore - quantity);
        }

        // 2. 更新库存
        boolean updated = storeInventoryRepository.updateInventoryQty(
            inventoryId,
            BigDecimal.valueOf(stockAfter),
            BigDecimal.valueOf(availableAfter));

        if (!updated) {
          logger.error("Failed to update inventory for sku={}, store={}", skuId, storeId);
          return ResponseEntity.internalServerError().body(Map.of(
              "success", false,
              "message", "Failed to update inventory"));
        }

        logger.info("Updated inventory: sku={}, store={}, stockBefore={}, stockAfter={}",
            skuId, storeId, stockBefore, stockAfter);
      } else {
        // 库存记录不存在
        logger.warn("Inventory record not found for sku={}, store={}", skuId, storeId);
        stockBefore = 0;
        availableBefore = 0;
        stockAfter = isIn ? quantity : 0;
        availableAfter = isIn ? quantity : 0;
        inventoryId = null;
        // TODO: 可以选择创建新的库存记录
      }

      // 3. 创建流水记录
      InventoryTransaction txn = new InventoryTransaction();
      txn.skuId = skuId;
      txn.storeId = storeId;
      txn.transactionType = transactionType;
      txn.quantity = isIn ? quantity : -quantity;
      txn.stockBefore = stockBefore;
      txn.stockAfter = stockAfter;
      txn.availableBefore = availableBefore;
      txn.availableAfter = availableAfter;
      txn.sourceType = sourceType;
      txn.sourceDocument = sourceDocument;
      txn.operatorId = operatorId;
      txn.operatorName = operatorName;
      txn.remarks = remarks;

      InventoryTransaction savedTxn = transactionRepository.create(txn);

      // 4. 构建响应
      Map<String, Object> response = new HashMap<>();
      response.put("id", savedTxn.id != null ? savedTxn.id.toString() : UUID.randomUUID().toString());
      response.put("skuId", skuId.toString());
      response.put("storeId", storeId.toString());
      response.put("transactionType", transactionType);
      response.put("quantity", quantity);
      response.put("stockBefore", stockBefore);
      response.put("stockAfter", stockAfter);
      response.put("availableBefore", availableBefore);
      response.put("availableAfter", availableAfter);
      response.put("sourceType", sourceType);
      response.put("sourceDocument", sourceDocument);
      response.put("operatorId", operatorIdStr);
      response.put("operatorName", operatorName);
      response.put("remarks", remarks);
      response.put("transactionTime", OffsetDateTime.now().toString());
      response.put("createdAt", OffsetDateTime.now().toString());
      response.put("updatedAt", OffsetDateTime.now().toString());

      // 添加空的关联对象以满足前端类型要求
      response.put("store", new HashMap<String, Object>());
      response.put("sku", new HashMap<String, Object>());
      response.put("operator", new HashMap<String, Object>());

      logger.info("创建库存流水成功: type={}, quantity={}, stockBefore={}, stockAfter={}",
          transactionType, quantity, stockBefore, stockAfter);

      return ResponseEntity.status(201).body(response);
    } catch (IllegalArgumentException e) {
      logger.error("Invalid request parameters", e);
      return ResponseEntity.badRequest().body(Map.of(
          "success", false,
          "message", "Invalid request: " + e.getMessage()));
    } catch (Exception e) {
      logger.error("Error creating transaction", e);
      return ResponseEntity.internalServerError().body(Map.of(
          "success", false,
          "message", "Failed to create transaction: " + e.getMessage()));
    }
  }

  // ========== 辅助方法 ==========

  private UUID parseUUID(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    try {
      return UUID.fromString(value);
    } catch (IllegalArgumentException e) {
      logger.warn("Invalid UUID format: {}", value);
      return null;
    }
  }
}

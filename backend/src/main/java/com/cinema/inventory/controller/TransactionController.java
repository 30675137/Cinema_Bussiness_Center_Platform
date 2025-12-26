package com.cinema.inventory.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * 库存流水 API 控制器
 * 提供库存流水记录查询接口。
 * 
 * P004-inventory-adjustment
 * 实现 T035 任务。
 * 
 * @since US2 - 查看库存流水记录
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    /**
     * 查询库存流水列表
     * 
     * GET /api/transactions?skuId=xxx&storeId=xxx&startDate=xxx&endDate=xxx&page=1&pageSize=20
     * 
     * @param skuId SKU ID（可选）
     * @param storeId 门店ID（可选）
     * @param startDate 开始日期（可选，格式：YYYY-MM-DD）
     * @param endDate 结束日期（可选，格式：YYYY-MM-DD）
     * @param page 页码（默认1）
     * @param pageSize 每页条数（默认20）
     * @return 流水记录列表
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listTransactions(
            @RequestParam(required = false) String skuId,
            @RequestParam(required = false) String storeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {

        logger.info("GET /api/transactions - skuId={}, storeId={}, startDate={}, endDate={}, page={}, pageSize={}",
                skuId, storeId, startDate, endDate, page, pageSize);

        // TODO: 实现实际的流水查询逻辑，从数据库获取真实数据
        // 当前返回开发调试用的模拟数据
        List<Map<String, Object>> transactions = new ArrayList<>();
        String[] types = {"purchase_in", "sale_out", "adjustment_in", "adjustment_out", "damage_out"};
        
        int count = Math.min(pageSize, 10);
        for (int i = 0; i < count; i++) {
            Map<String, Object> transaction = new HashMap<>();
            String type = types[i % types.length];
            boolean isIn = type.contains("_in");
            int quantity = (int) (Math.random() * 20) + 1;
            int stockBefore = 100 - i * 5;
            int stockAfter = stockBefore + (isIn ? quantity : -quantity);
            
            transaction.put("id", "txn-" + UUID.randomUUID().toString().substring(0, 8));
            transaction.put("skuId", skuId != null ? skuId : "sku-001");
            transaction.put("storeId", storeId != null ? storeId : "store-001");
            transaction.put("transactionType", type);
            transaction.put("quantity", isIn ? quantity : -quantity);
            transaction.put("stockBefore", stockBefore);
            transaction.put("stockAfter", stockAfter);
            transaction.put("operatorId", "user-001");
            transaction.put("operatorName", "库存管理员");
            transaction.put("remarks", "系统自动生成");
            transaction.put("transactionTime", OffsetDateTime.now().minusHours(i * 2).toString());
            transaction.put("createdAt", OffsetDateTime.now().minusHours(i * 2).toString());
            
            transactions.add(transaction);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", transactions);
        response.put("total", 50);
        response.put("page", page);
        response.put("pageSize", pageSize);

        return ResponseEntity.ok(response);
    }

    /**
     * 查询单条流水详情
     * 
     * GET /api/transactions/{id}
     * 
     * @param id 流水ID
     * @return 流水详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTransaction(@PathVariable String id) {
        logger.info("GET /api/transactions/{} - 查询流水详情", id);

        // TODO: 实现实际的流水详情查询
        Map<String, Object> transaction = new HashMap<>();
        transaction.put("id", id);
        transaction.put("skuId", "sku-001");
        transaction.put("storeId", "store-001");
        transaction.put("transactionType", "adjustment_in");
        transaction.put("quantity", 10);
        transaction.put("stockBefore", 100);
        transaction.put("stockAfter", 110);
        transaction.put("operatorId", "user-001");
        transaction.put("operatorName", "库存管理员");
        transaction.put("remarks", "盘盈调整");
        transaction.put("transactionTime", OffsetDateTime.now().toString());
        transaction.put("createdAt", OffsetDateTime.now().toString());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", transaction);

        return ResponseEntity.ok(response);
    }
}

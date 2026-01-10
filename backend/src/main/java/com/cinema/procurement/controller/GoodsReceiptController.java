/**
 * @spec N001-purchase-inbound
 * 收货入库控制器
 */
package com.cinema.procurement.controller;

import com.cinema.procurement.dto.CreateGoodsReceiptRequest;
import com.cinema.procurement.dto.GoodsReceiptDTO;
import com.cinema.procurement.entity.GoodsReceiptStatus;
import com.cinema.procurement.service.GoodsReceiptService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/goods-receipts")
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    public GoodsReceiptController(GoodsReceiptService goodsReceiptService) {
        this.goodsReceiptService = goodsReceiptService;
    }

    /**
     * 获取收货入库单列表
     * GET /api/goods-receipts?storeId=xxx&status=PENDING&page=1&pageSize=20
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(required = false) UUID storeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        GoodsReceiptStatus receiptStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                receiptStatus = GoodsReceiptStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // 忽略无效状态
            }
        }

        Page<GoodsReceiptDTO> result = goodsReceiptService.findByFilters(storeId, receiptStatus, page, pageSize);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", result.getContent());
        response.put("total", result.getTotalElements());
        response.put("page", page);
        response.put("pageSize", pageSize);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 获取收货入库单详情
     * GET /api/goods-receipts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable UUID id) {
        GoodsReceiptDTO receipt = goodsReceiptService.findById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", receipt);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 创建收货入库单
     * POST /api/goods-receipts
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody CreateGoodsReceiptRequest request) {
        GoodsReceiptDTO created = goodsReceiptService.create(request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", created);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 确认收货（更新库存）
     * POST /api/goods-receipts/{id}/confirm
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirm(@PathVariable UUID id) {
        GoodsReceiptDTO receipt = goodsReceiptService.confirm(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", receipt);
        response.put("message", "收货确认成功，库存已更新");
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 取消收货单
     * POST /api/goods-receipts/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancel(@PathVariable UUID id) {
        GoodsReceiptDTO receipt = goodsReceiptService.cancel(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", receipt);
        response.put("message", "收货单已取消");
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }
}

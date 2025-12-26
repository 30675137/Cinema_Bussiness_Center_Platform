package com.cinema.inventory.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
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

    // 模拟版本号存储（实际应该从数据库获取）
    private final ConcurrentHashMap<String, Integer> versionStore = new ConcurrentHashMap<>();

    /**
     * 更新安全库存
     * 
     * PUT /api/inventory/{id}/safety-stock
     * 
     * 支持乐观锁，如果版本号不匹配返回 409 Conflict
     * 
     * @param id 库存记录ID
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

        // TODO: 实际实现应该：
        // 1. 从数据库查询库存记录
        // 2. 检查版本号是否匹配
        // 3. 更新安全库存值和版本号
        // 4. 重新计算库存状态（正常/低库存/缺货）
        // 5. 保存到数据库

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
}

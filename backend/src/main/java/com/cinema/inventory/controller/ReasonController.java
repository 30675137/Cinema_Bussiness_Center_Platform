package com.cinema.inventory.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 调整原因 API 控制器
 * 提供库存调整原因字典查询接口。
 * 
 * P004-inventory-adjustment
 * 实现 T039 任务。
 * 
 * @since US3 - 填写调整原因（必填）
 */
@RestController
@RequestMapping("/api/adjustment-reasons")
public class ReasonController {

    private static final Logger logger = LoggerFactory.getLogger(ReasonController.class);

    /**
     * 查询调整原因列表
     * 
     * GET /api/adjustment-reasons
     * GET /api/adjustment-reasons?category=surplus
     * 
     * @param category 调整类型过滤（可选）：surplus, shortage, damage
     * @return 原因列表
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listReasons(
            @RequestParam(required = false) String category) {

        logger.info("GET /api/adjustment-reasons - category={}", category);

        // 调整原因数据（实际应从数据库获取）
        List<Map<String, Object>> allReasons = new ArrayList<>();
        
        // 盘盈原因
        allReasons.add(createReason("SURPLUS_COUNT", "盘点盈余", "surplus", 1));
        allReasons.add(createReason("SURPLUS_RETURN", "退货入库", "surplus", 2));
        allReasons.add(createReason("SURPLUS_TRANSFER", "调拨入库", "surplus", 3));
        allReasons.add(createReason("SURPLUS_OTHER", "其他盈余", "surplus", 4));
        
        // 盘亏原因
        allReasons.add(createReason("SHORTAGE_COUNT", "盘点亏损", "shortage", 1));
        allReasons.add(createReason("SHORTAGE_SALE", "销售损耗", "shortage", 2));
        allReasons.add(createReason("SHORTAGE_TRANSFER", "调拨出库", "shortage", 3));
        allReasons.add(createReason("SHORTAGE_OTHER", "其他亏损", "shortage", 4));
        
        // 报损原因
        allReasons.add(createReason("DAMAGE_EXPIRED", "过期报废", "damage", 1));
        allReasons.add(createReason("DAMAGE_QUALITY", "质量问题", "damage", 2));
        allReasons.add(createReason("DAMAGE_STORAGE", "仓储损坏", "damage", 3));
        allReasons.add(createReason("DAMAGE_OTHER", "其他报损", "damage", 4));

        // 按类型过滤
        List<Map<String, Object>> filteredReasons;
        if (category != null && !category.isEmpty()) {
            filteredReasons = new ArrayList<>();
            for (Map<String, Object> reason : allReasons) {
                if (category.equals(reason.get("category"))) {
                    filteredReasons.add(reason);
                }
            }
        } else {
            filteredReasons = allReasons;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", filteredReasons);

        return ResponseEntity.ok(response);
    }

    /**
     * 创建原因对象
     */
    private Map<String, Object> createReason(String code, String name, String category, int sortOrder) {
        Map<String, Object> reason = new HashMap<>();
        reason.put("id", UUID.randomUUID().toString());
        reason.put("code", code);
        reason.put("name", name);
        reason.put("category", category);
        reason.put("isActive", true);
        reason.put("sortOrder", sortOrder);
        return reason;
    }
}

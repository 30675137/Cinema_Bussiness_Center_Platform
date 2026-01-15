/**
 * @spec N001-purchase-inbound
 * 采购模块门店控制器
 *
 * 提供采购模块专用的门店查询 API，数据来源于 JPA 仓库
 */
package com.cinema.procurement.controller;

import com.cinema.inventory.repository.StoreJpaRepository;
import com.cinema.procurement.dto.ProcurementStoreDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/procurement/stores")
public class ProcurementStoreController {

    private final StoreJpaRepository storeRepository;

    public ProcurementStoreController(StoreJpaRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    /**
     * 获取门店列表（采购模块专用）
     * GET /api/procurement/stores
     *
     * 返回 JPA 数据库中的门店列表，用于采购订单创建时选择
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list() {
        List<ProcurementStoreDTO> stores = storeRepository.findAll()
            .stream()
            .map(ProcurementStoreDTO::fromEntity)
            .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", stores);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }
}

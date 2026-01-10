/**
 * @spec N001-purchase-inbound
 * 供应商控制器
 */
package com.cinema.procurement.controller;

import com.cinema.procurement.dto.SupplierDTO;
import com.cinema.procurement.entity.SupplierStatus;
import com.cinema.procurement.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    /**
     * 获取供应商列表
     * GET /api/suppliers?status=ACTIVE
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(required = false) String status) {

        SupplierStatus supplierStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                supplierStatus = SupplierStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // 忽略无效状态，返回所有
            }
        }

        List<SupplierDTO> suppliers = supplierService.findByStatus(supplierStatus);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", suppliers);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }
}

/**
 * @spec N001-purchase-inbound
 * @spec N003-supplier-edit
 * 供应商控制器
 */
package com.cinema.procurement.controller;

import com.cinema.procurement.dto.SupplierCreateRequest;
import com.cinema.procurement.dto.SupplierDTO;
import com.cinema.procurement.dto.SupplierUpdateRequest;
import com.cinema.procurement.entity.SupplierStatus;
import com.cinema.procurement.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    /**
     * 创建供应商
     * POST /api/suppliers
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody SupplierCreateRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            SupplierDTO created = supplierService.create(request);
            response.put("success", true);
            response.put("data", created);
            response.put("timestamp", Instant.now().toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "SUP_DUP_001");
            response.put("message", e.getMessage());
            response.put("timestamp", Instant.now().toString());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    /**
     * 更新供应商
     * PUT /api/suppliers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable UUID id,
            @Valid @RequestBody SupplierUpdateRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            SupplierDTO updated = supplierService.update(id, request);
            response.put("success", true);
            response.put("data", updated);
            response.put("timestamp", Instant.now().toString());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "SUP_NTF_001");
            response.put("message", e.getMessage());
            response.put("timestamp", Instant.now().toString());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}

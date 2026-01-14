package com.cinema.material.controller;

import com.cinema.material.domain.MaterialCategory;
import com.cinema.material.dto.MaterialRequest;
import com.cinema.material.dto.MaterialResponse;
import com.cinema.material.service.IMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * M001: 物料管理控制器
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Slf4j
@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final IMaterialService materialService;

    /**
     * 创建物料
     */
    @PostMapping
    public ResponseEntity<MaterialResponse> createMaterial(@Valid @RequestBody MaterialRequest request) {
        log.info("Received request to create material: {}", request.getName());
        MaterialResponse response = materialService.createMaterial(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 更新物料
     */
    @PutMapping("/{id}")
    public ResponseEntity<MaterialResponse> updateMaterial(
            @PathVariable UUID id,
            @Valid @RequestBody MaterialRequest request) {
        log.info("Received request to update material: {}", id);
        MaterialResponse response = materialService.updateMaterial(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 删除物料
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        log.info("Received request to delete material: {}", id);
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 根据ID获取物料
     */
    @GetMapping("/{id}")
    public ResponseEntity<MaterialResponse> getMaterialById(@PathVariable UUID id) {
        log.info("Received request to get material by id: {}", id);
        MaterialResponse response = materialService.getMaterialById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 根据编码获取物料
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<MaterialResponse> getMaterialByCode(@PathVariable String code) {
        log.info("Received request to get material by code: {}", code);
        MaterialResponse response = materialService.getMaterialByCode(code);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取所有物料 (支持按分类和状态筛选)
     */
    @GetMapping
    public ResponseEntity<List<MaterialResponse>> getAllMaterials(
            @RequestParam(required = false) MaterialCategory category,
            @RequestParam(required = false) String status) {
        log.info("Received request to get all materials, category: {}, status: {}", category, status);
        
        List<MaterialResponse> responses;
        if (category != null && status != null) {
            responses = materialService.getMaterialsByCategoryAndStatus(category, status);
        } else if (category != null) {
            responses = materialService.getMaterialsByCategory(category);
        } else {
            responses = materialService.getAllMaterials();
        }
        
        return ResponseEntity.ok(responses);
    }
}

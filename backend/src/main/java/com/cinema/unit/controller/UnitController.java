package com.cinema.unit.controller;

import com.cinema.unit.domain.UnitCategory;
import com.cinema.unit.dto.UnitRequest;
import com.cinema.unit.dto.UnitResponse;
import com.cinema.unit.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 单位管理控制器
 * 
 * @author Cinema Platform Team
 * @version 1.0
 * @since 2025-01-11
 */
@Slf4j
@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    /**
     * 创建单位
     */
    @PostMapping
    public ResponseEntity<UnitResponse> createUnit(@Valid @RequestBody UnitRequest request) {
        log.info("Received request to create unit: {}", request.getCode());
        UnitResponse response = unitService.createUnit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 更新单位
     */
    @PutMapping("/{id}")
    public ResponseEntity<UnitResponse> updateUnit(
            @PathVariable UUID id,
            @Valid @RequestBody UnitRequest request) {
        log.info("Received request to update unit: {}", id);
        UnitResponse response = unitService.updateUnit(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 删除单位
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable UUID id) {
        log.info("Received request to delete unit: {}", id);
        unitService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 根据ID获取单位
     */
    @GetMapping("/{id}")
    public ResponseEntity<UnitResponse> getUnitById(@PathVariable UUID id) {
        log.info("Received request to get unit by id: {}", id);
        UnitResponse response = unitService.getUnitById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 根据代码获取单位
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<UnitResponse> getUnitByCode(@PathVariable String code) {
        log.info("Received request to get unit by code: {}", code);
        UnitResponse response = unitService.getUnitByCode(code);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取所有单位
     */
    @GetMapping
    public ResponseEntity<List<UnitResponse>> getAllUnits() {
        log.info("Received request to get all units");
        List<UnitResponse> responses = unitService.getAllUnits();
        return ResponseEntity.ok(responses);
    }

    /**
     * 根据分类获取单位
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<UnitResponse>> getUnitsByCategory(@PathVariable UnitCategory category) {
        log.info("Received request to get units by category: {}", category);
        List<UnitResponse> responses = unitService.getUnitsByCategory(category);
        return ResponseEntity.ok(responses);
    }

    /**
     * 获取基础单位
     */
    @GetMapping("/base")
    public ResponseEntity<List<UnitResponse>> getBaseUnits() {
        log.info("Received request to get base units");
        List<UnitResponse> responses = unitService.getBaseUnits();
        return ResponseEntity.ok(responses);
    }
}

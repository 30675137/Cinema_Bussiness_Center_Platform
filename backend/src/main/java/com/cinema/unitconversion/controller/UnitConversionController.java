package com.cinema.unitconversion.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.unitconversion.dto.*;
import com.cinema.unitconversion.service.ConversionPathService;
import com.cinema.unitconversion.service.UnitConversionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 单位换算规则 REST 控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/unit-conversions")
@RequiredArgsConstructor
public class UnitConversionController {

    private final UnitConversionService service;
    private final ConversionPathService pathService;

    /**
     * GET /api/unit-conversions - 获取所有换算规则
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitConversionDto>>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        log.debug("获取换算规则列表, category={}, search={}", category, search);
        List<UnitConversionDto> conversions = service.getAll(category, search);
        return ResponseEntity.ok(ApiResponse.success(conversions));
    }

    /**
     * GET /api/unit-conversions/stats - 获取统计信息
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ConversionStatsResponse>> getStats() {
        log.debug("获取换算规则统计");
        ConversionStatsResponse stats = service.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * GET /api/unit-conversions/{id} - 获取单个换算规则
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitConversionDto>> getById(@PathVariable UUID id) {
        log.debug("获取换算规则, id={}", id);
        try {
            UnitConversionDto conversion = service.getById(id);
            return ResponseEntity.ok(ApiResponse.success(conversion));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getMessage()));
        }
    }

    /**
     * POST /api/unit-conversions - 创建换算规则
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UnitConversionDto>> create(
            @Valid @RequestBody CreateConversionRequest request) {
        log.debug("创建换算规则: {} → {}", request.getFromUnit(), request.getToUnit());
        try {
            UnitConversionDto created = service.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(created, "创建成功"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.failure(e.getMessage()));
        }
    }

    /**
     * PUT /api/unit-conversions/{id} - 更新换算规则
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitConversionDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreateConversionRequest request) {
        log.debug("更新换算规则, id={}", id);
        try {
            UnitConversionDto updated = service.update(id, request);
            return ResponseEntity.ok(ApiResponse.success(updated, "更新成功"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.failure(e.getMessage()));
        }
    }

    /**
     * DELETE /api/unit-conversions/{id} - 删除换算规则
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.debug("删除换算规则, id={}", id);
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/unit-conversions/validate-cycle - 验证循环依赖
     */
    @PostMapping("/validate-cycle")
    public ResponseEntity<ApiResponse<CycleValidationResponse>> validateCycle(
            @Valid @RequestBody CycleValidationRequest request) {
        log.debug("验证循环依赖: {} → {}", request.getFromUnit(), request.getToUnit());
        CycleValidationResponse result = pathService.validateCycle(
                request.getFromUnit(),
                request.getToUnit(),
                request.getExcludeId()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * POST /api/unit-conversions/calculate-path - 计算换算路径
     */
    @PostMapping("/calculate-path")
    public ResponseEntity<ApiResponse<ConversionPathResponse>> calculatePath(
            @Valid @RequestBody CalculatePathRequest request) {
        log.debug("计算换算路径: {} → {}", request.getFromUnit(), request.getToUnit());
        ConversionPathResponse result = pathService.calculatePath(
                request.getFromUnit(),
                request.getToUnit()
        );

        if (!result.isFound()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.success(result));
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

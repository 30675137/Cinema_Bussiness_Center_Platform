/**
 * @spec M001-material-unit-system
 * @spec N004-procurement-material-selector
 */
package com.cinema.material.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.material.dto.MaterialCreateRequest;
import com.cinema.material.dto.MaterialResponse;
import com.cinema.material.dto.MaterialUpdateRequest;
import com.cinema.material.entity.Material;
import com.cinema.material.service.MaterialService;
import com.cinema.unit.entity.Unit;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    /**
     * 创建物料
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MaterialResponse>> createMaterial(
            @Valid @RequestBody MaterialCreateRequest request) {
        log.info("Creating material: {}", request.getName());

        Material material = Material.builder()
                .code(request.getCode())
                .name(request.getName())
                .category(request.getCategory())
                .inventoryUnit(Unit.builder().id(request.getInventoryUnitId()).build())
                .purchaseUnit(Unit.builder().id(request.getPurchaseUnitId()).build())
                .conversionRate(request.getConversionRate())
                .useGlobalConversion(request.getUseGlobalConversion())
                .standardCost(request.getStandardCost())
                .description(request.getDescription())
                .specification(request.getSpecification())
                .status("ACTIVE")
                .build();

        Material created = materialService.createMaterial(material);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(MaterialResponse.fromEntity(created)));
    }

    /**
     * 获取所有物料（支持分类筛选、搜索和分页）
     * N004: Enhanced for MaterialSkuSelector component
     *
     * @param category 物料分类 (RAW_MATERIAL, PACKAGING)
     * @param search 搜索关键词 (名称、编码、规格)
     * @param page 页码 (0-indexed)
     * @param size 页大小 (默认20，最大100)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllMaterials(
            @RequestParam(required = false) Material.MaterialCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting materials: category={}, search={}, page={}, size={}", category, search, page, size);

        // Limit page size to 100
        size = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, size);

        Page<Material> materialsPage;
        if (category != null && search != null && !search.isBlank()) {
            // Filter by category AND search term
            materialsPage = materialService.findByCategoryAndSearchTerm(category, search, pageable);
        } else if (category != null) {
            // Filter by category only
            materialsPage = materialService.findByCategoryPaged(category, pageable);
        } else if (search != null && !search.isBlank()) {
            // Filter by search term only
            materialsPage = materialService.findBySearchTerm(search, pageable);
        } else {
            // No filter - return all active materials
            materialsPage = materialService.findAllActivePaged(pageable);
        }

        List<MaterialResponse> data = materialsPage.getContent().stream()
                .map(MaterialResponse::fromEntity)
                .collect(Collectors.toList());

        // N004: Return paginated response per api.yaml contract
        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        result.put("total", materialsPage.getTotalElements());
        result.put("page", page);
        result.put("pageSize", size);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 按ID获取物料
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaterialResponse>> getMaterialById(@PathVariable UUID id) {
        log.info("Getting material by ID: {}", id);

        Material material = materialService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(MaterialResponse.fromEntity(material)));
    }

    /**
     * 按编码获取物料
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<MaterialResponse>> getMaterialByCode(@PathVariable String code) {
        log.info("Getting material by code: {}", code);

        Material material = materialService.findByCode(code);
        return ResponseEntity.ok(ApiResponse.success(MaterialResponse.fromEntity(material)));
    }

    /**
     * 更新物料
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MaterialResponse>> updateMaterial(
            @PathVariable UUID id,
            @Valid @RequestBody MaterialUpdateRequest request) {
        log.info("Updating material: {}", id);

        Material materialUpdate = Material.builder()
                .name(request.getName())
                .inventoryUnit(request.getInventoryUnitId() != null
                        ? Unit.builder().id(request.getInventoryUnitId()).build()
                        : null)
                .purchaseUnit(request.getPurchaseUnitId() != null
                        ? Unit.builder().id(request.getPurchaseUnitId()).build()
                        : null)
                .conversionRate(request.getConversionRate())
                .useGlobalConversion(request.getUseGlobalConversion())
                .standardCost(request.getStandardCost())
                .description(request.getDescription())
                .specification(request.getSpecification())
                .build();

        Material updated = materialService.updateMaterial(id, materialUpdate);
        return ResponseEntity.ok(ApiResponse.success(MaterialResponse.fromEntity(updated)));
    }

    /**
     * 删除物料
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(@PathVariable UUID id) {
        log.info("Deleting material: {}", id);

        materialService.deleteMaterial(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

/** @spec M001-material-unit-system */
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
                .description(request.getDescription())
                .specification(request.getSpecification())
                .build();

        Material created = materialService.createMaterial(material);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(MaterialResponse.fromEntity(created)));
    }

    /**
     * 获取所有物料（可选按分类筛选）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> getAllMaterials(
            @RequestParam(required = false) Material.MaterialCategory category) {
        log.info("Getting all materials, category: {}", category);

        List<Material> materials = category != null
                ? materialService.findByCategory(category)
                : materialService.findAll();

        List<MaterialResponse> response = materials.stream()
                .map(MaterialResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
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

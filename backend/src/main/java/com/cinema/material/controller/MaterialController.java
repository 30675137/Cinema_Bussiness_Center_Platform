/**
 * @spec M001-material-unit-system
 * @spec N004-procurement-material-selector
 * @spec M002-material-filter
 */
package com.cinema.material.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.material.dto.MaterialCreateRequest;
import com.cinema.material.dto.MaterialFilterDTO;
import com.cinema.material.dto.MaterialImportResultDTO;
import com.cinema.material.dto.MaterialResponse;
import com.cinema.material.dto.MaterialUpdateRequest;
import com.cinema.material.entity.Material;
import com.cinema.material.entity.MaterialStatus;
import com.cinema.material.service.MaterialExportService;
import com.cinema.material.service.MaterialImportService;
import com.cinema.material.service.MaterialService;
import com.cinema.unit.entity.Unit;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@Validated
public class MaterialController {

    private final MaterialService materialService;
    private final MaterialExportService materialExportService;
    private final MaterialImportService materialImportService;

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
     * 获取所有物料（支持筛选、搜索和分页）
     * M002: Enhanced with comprehensive filter support
     * N004: Compatible with MaterialSkuSelector component
     *
     * @param category 物料分类 (RAW_MATERIAL, PACKAGING) - M002
     * @param status 物料状态 (ACTIVE, INACTIVE) - M002
     * @param minCost 最小标准成本 - M002
     * @param maxCost 最大标准成本 - M002
     * @param keyword 搜索关键词 (编码、名称) - M002
     * @param search 搜索关键词 (名称、编码、规格) - N004 (deprecated, use keyword instead)
     * @param page 页码 (0-indexed)
     * @param size 页大小 (默认20，最大100)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllMaterials(
            @RequestParam(required = false) Material.MaterialCategory category,
            @RequestParam(required = false) MaterialStatus status,
            @RequestParam(required = false) BigDecimal minCost,
            @RequestParam(required = false) BigDecimal maxCost,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search, // N004 compatibility
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // M002: Use keyword if provided, otherwise fall back to search (N004 compatibility)
        String searchTerm = keyword != null ? keyword : search;
        
        log.info("Getting materials: category={}, status={}, minCost={}, maxCost={}, keyword={}, page={}, size={}",
                category, status, minCost, maxCost, searchTerm, page, size);

        // Limit page size to 100
        size = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, size);

        Page<Material> materialsPage;
        
        // M002: Check if any filter is applied
        boolean hasFilter = category != null || status != null || minCost != null || maxCost != null || searchTerm != null;
        
        if (hasFilter) {
            // M002: Use comprehensive filter
            MaterialFilterDTO filter = new MaterialFilterDTO();
            filter.setCategory(category);
            filter.setStatus(status);
            filter.setMinCost(minCost);
            filter.setMaxCost(maxCost);
            filter.setKeyword(searchTerm);
            
            materialsPage = materialService.filterMaterials(filter, pageable);
        } else {
            // N004: No filter - return all active materials
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

    // ========== M002-material-filter: US2 - 批量导出 ==========

    /**
     * 导出物料数据为 Excel
     * User Story: US2 - 批量导出物料数据
     *
     * @param category 物料分类
     * @param status 物料状态
     * @param minCost 最小成本
     * @param maxCost 最大成本
     * @param keyword 关键词
     * @return Excel 文件二进制流
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportMaterials(
            @RequestParam(required = false) Material.MaterialCategory category,
            @RequestParam(required = false) MaterialStatus status,
            @RequestParam(required = false) BigDecimal minCost,
            @RequestParam(required = false) BigDecimal maxCost,
            @RequestParam(required = false) String keyword) {

        log.info("Exporting materials: category={}, status={}, minCost={}, maxCost={}, keyword={}",
                category, status, minCost, maxCost, keyword);

        try {
            // 构建筛选条件
            MaterialFilterDTO filter = new MaterialFilterDTO();
            filter.setCategory(category);
            filter.setStatus(status);
            filter.setMinCost(minCost);
            filter.setMaxCost(maxCost);
            filter.setKeyword(keyword);

            // 导出 Excel
            byte[] excelData = materialExportService.exportMaterials(filter);
            String fileName = materialExportService.generateFileName();

            // 设置响应头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", 
                new String(fileName.getBytes("UTF-8"), "ISO-8859-1")); // 中文文件名编码
            headers.setContentLength(excelData.length);

            log.info("Material export completed, file size: {} bytes", excelData.length);
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            log.warn("Export failed: {}", e.getMessage());
            // 返回错误信息（注：这里应该返回 JSON 错误，但为了简化直接抛出）
            throw e;
        } catch (Exception e) {
            log.error("Export failed with unexpected error", e);
            throw new RuntimeException("导出失败：" + e.getMessage());
        }
    }

    // ========== M002-material-filter: US3 - 批量导入 ==========

    /**
     * 预览导入数据（不保存到数据库）
     * User Story: US3 - 批量导入物料数据
     * 
     * <p>功能说明：
     * <ul>
     *   <li>上传 Excel 文件</li>
     *   <li>解析并校验数据</li>
     *   <li>返回校验结果（包含成功和失败的记录）</li>
     *   <li>不保存到数据库</li>
     * </ul>
     * 
     * @param file Excel 文件 (.xlsx 或 .xls)
     * @return 导入结果（包含校验详情）
     */
    @PostMapping("/import/preview")
    public ResponseEntity<ApiResponse<MaterialImportResultDTO>> previewImport(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        
        log.info("Previewing import: fileName={}, size={} bytes", 
                file.getOriginalFilename(), file.getSize());

        try {
            MaterialImportResultDTO result = materialImportService.previewImport(file);
            
            log.info("Preview completed: totalCount={}, successCount={}, failureCount={}",
                    result.getTotalCount(), result.getSuccessCount(), result.getFailureCount());
            
            return ResponseEntity.ok(ApiResponse.success(result));
            
        } catch (IllegalArgumentException e) {
            log.warn("Preview validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure(e.getMessage()));
        } catch (Exception e) {
            log.error("Preview failed with unexpected error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("预览失败：" + e.getMessage()));
        }
    }

    /**
     * 确认导入数据（保存到数据库）
     * User Story: US3 - 批量导入物料数据
     * 
     * <p>功能说明：
     * <ul>
     *   <li>上传 Excel 文件</li>
     *   <li>解析并校验数据</li>
     *   <li>只保存通过校验的记录</li>
     *   <li>返回导入结果（包含成功和失败的记录）</li>
     * </ul>
     * 
     * <p>注意事项：
     * <ul>
     *   <li>如果记录校验失败，将跳过该记录</li>
     *   <li>部分成功也会返回成功响应</li>
     *   <li>前端需要检查 failureCount 判断是否有失败记录</li>
     * </ul>
     * 
     * @param file Excel 文件 (.xlsx 或 .xls)
     * @return 导入结果（包含保存详情）
     */
    @PostMapping("/import/confirm")
    public ResponseEntity<ApiResponse<MaterialImportResultDTO>> confirmImport(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        
        log.info("Confirming import: fileName={}, size={} bytes", 
                file.getOriginalFilename(), file.getSize());

        try {
            MaterialImportResultDTO result = materialImportService.confirmImport(file);
            
            log.info("Import completed: totalCount={}, successCount={}, failureCount={}",
                    result.getTotalCount(), result.getSuccessCount(), result.getFailureCount());
            
            return ResponseEntity.ok(ApiResponse.success(result));
            
        } catch (IllegalArgumentException e) {
            log.warn("Import validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure(e.getMessage()));
        } catch (Exception e) {
            log.error("Import failed with unexpected error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("导入失败：" + e.getMessage()));
        }
    }
}

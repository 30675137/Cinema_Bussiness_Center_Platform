package com.cinema.scenariopackage.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.common.dto.ListResponse;
import com.cinema.scenariopackage.dto.CreatePackageRequest;
import com.cinema.scenariopackage.dto.ScenarioPackageDTO;
import com.cinema.scenariopackage.dto.ScenarioPackageSummary;
import com.cinema.scenariopackage.dto.UpdatePackageRequest;
import com.cinema.scenariopackage.service.ScenarioPackageService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 场景包管理控制器（MVP版本）
 * <p>
 * 提供场景包的 REST API 接口
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@RestController
@RequestMapping("/api/scenario-packages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ScenarioPackageController {

    private static final Logger logger = LoggerFactory.getLogger(ScenarioPackageController.class);

    private final ScenarioPackageService packageService;

    public ScenarioPackageController(ScenarioPackageService packageService) {
        this.packageService = packageService;
    }

    /**
     * 创建场景包
     *
     * @param request 创建请求
     * @return 创建的场景包详情
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> createPackage(
            @Valid @RequestBody CreatePackageRequest request) {
        logger.info("POST /api/scenario-packages - Create package: {}", request.getName());

        ScenarioPackageDTO dto = packageService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto));
    }

    /**
     * 查询场景包列表（分页）
     *
     * @param page      页码（从0开始）
     * @param size      每页大小
     * @param sortBy    排序字段
     * @param sortOrder 排序方向
     * @return 场景包列表
     */
    @GetMapping
    public ResponseEntity<ListResponse<ScenarioPackageSummary>> listPackages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        logger.info("GET /api/scenario-packages - List packages: page={}, size={}", page, size);

        Page<ScenarioPackageSummary> packages = packageService.findAll(page, size, sortBy, sortOrder);

        return ResponseEntity.ok(
                ListResponse.success(
                        packages.getContent(),
                        packages.getTotalElements()
                )
        );
    }

    /**
     * 根据 ID 查询场景包详情
     *
     * @param id 场景包 ID
     * @return 场景包详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> getPackage(@PathVariable UUID id) {
        logger.info("GET /api/scenario-packages/{} - Get package details", id);

        ScenarioPackageDTO dto = packageService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 更新场景包
     *
     * @param id      场景包 ID
     * @param request 更新请求
     * @return 更新后的场景包详情
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> updatePackage(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePackageRequest request) {
        logger.info("PUT /api/scenario-packages/{} - Update package", id);

        ScenarioPackageDTO dto = packageService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 删除场景包（软删除）
     *
     * @param id 场景包 ID
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable UUID id) {
        logger.info("DELETE /api/scenario-packages/{} - Delete package", id);

        packageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

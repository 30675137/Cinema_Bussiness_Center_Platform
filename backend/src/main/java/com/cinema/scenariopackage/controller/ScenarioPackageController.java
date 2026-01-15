package com.cinema.scenariopackage.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.common.dto.ListResponse;
import com.cinema.scenariopackage.dto.*;
import com.cinema.scenariopackage.service.ImageUploadService;
import com.cinema.scenariopackage.service.ScenarioPackageService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
public class ScenarioPackageController {

    private static final Logger logger = LoggerFactory.getLogger(ScenarioPackageController.class);

    private final ScenarioPackageService packageService;
    private final ImageUploadService imageUploadService;

    public ScenarioPackageController(ScenarioPackageService packageService, ImageUploadService imageUploadService) {
        this.packageService = packageService;
        this.imageUploadService = imageUploadService;
    }

    /**
     * 创建场景包（T035）
     * <p>
     * 数据验证处理：
     * - @Valid 注解触发 Bean Validation 验证
     * - 验证失败时抛出 MethodArgumentNotValidException
     * - GlobalExceptionHandler 捕获并返回 400 错误，包含详细的字段错误信息
     * - 错误格式：{ code: "VALIDATION_ERROR", message: "请求参数验证失败", details: {...} }
     * </p>
     *
     * @param request 创建请求（必须通过 @Valid 验证）
     * @return 创建的场景包详情（201 Created）
     * @throws MethodArgumentNotValidException 当请求参数验证失败时（由 GlobalExceptionHandler 处理）
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
     * 查询已发布的场景包列表（用于C端小程序首页）
     * <p>
     * 符合 018-hall-reserve-homepage API 契约
     * 仅返回状态为 PUBLISHED 的场景包
     * </p>
     *
     * @return 已发布场景包列表
     */
    @GetMapping("/published")
    public ResponseEntity<ApiResponse<java.util.List<ScenarioPackageListItemDTO>>> listPublishedPackages() {
        logger.info("GET /api/scenario-packages/published - List published packages for Taro frontend");

        java.util.List<ScenarioPackageListItemDTO> packages = packageService.findPublishedPackagesForTaro();

        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.maxAge(5, java.util.concurrent.TimeUnit.MINUTES))
                .body(ApiResponse.success(packages));
    }

    /**
     * 查询场景包列表（分页，B端后台使用）
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
                        packages.getTotalElements()));
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

    // ==================== 图片上传相关端点 ====================

    /**
     * 生成背景图片上传预签名 URL
     * <p>
     * 前端使用该 URL 直接上传图片到 Supabase Storage，上传成功后调用 PATCH 接口确认
     * </p>
     *
     * @param id      场景包 ID
     * @param request 上传请求（文件名、大小、MIME类型）
     * @return 预签名上传 URL 和公开访问 URL
     */
    @PostMapping("/{id}/image")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> generateImageUploadUrl(
            @PathVariable UUID id,
            @Valid @RequestBody ImageUploadRequest request) {
        logger.info("POST /api/scenario-packages/{}/image - Generate upload URL for: {}", id, request.getFileName());

        // 验证场景包是否存在
        packageService.findById(id);

        ImageUploadResponse response = imageUploadService.generateUploadUrl(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 确认图片上传成功
     * <p>
     * 前端上传图片到 Supabase Storage 成功后，调用此接口更新数据库中的 background_image_url 字段
     * </p>
     *
     * @param id      场景包 ID
     * @param request 确认请求（公开访问 URL）
     * @return 更新后的场景包详情
     */
    @PatchMapping("/{id}/image")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> confirmImageUpload(
            @PathVariable UUID id,
            @Valid @RequestBody ImageConfirmRequest request) {
        logger.info("PATCH /api/scenario-packages/{}/image - Confirm upload: {}", id, request.getPublicUrl());

        ScenarioPackageDTO dto = packageService.updateBackgroundImage(id, request.getPublicUrl());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    // ==================== US2: 规则配置与内容管理端点 ====================

    /**
     * 配置场景包规则
     *
     * @param id      场景包 ID
     * @param request 规则配置请求
     * @return 更新后的场景包详情
     */
    @PutMapping("/{id}/rules")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> configureRules(
            @PathVariable UUID id,
            @Valid @RequestBody ConfigureRulesRequest request) {
        logger.info("PUT /api/scenario-packages/{}/rules - Configure rules", id);

        ScenarioPackageDTO dto = packageService.configureRules(id, request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 添加硬权益
     *
     * @param id      场景包 ID
     * @param request 添加权益请求
     * @return 更新后的场景包详情
     */
    @PostMapping("/{id}/benefits")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> addBenefit(
            @PathVariable UUID id,
            @Valid @RequestBody AddBenefitRequest request) {
        logger.info("POST /api/scenario-packages/{}/benefits - Add benefit: {}", id, request.getBenefitType());

        ScenarioPackageDTO dto = packageService.addBenefit(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto));
    }

    /**
     * 删除硬权益
     *
     * @param id        场景包 ID
     * @param benefitId 权益 ID
     * @return 更新后的场景包详情
     */
    @DeleteMapping("/{id}/benefits/{benefitId}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> removeBenefit(
            @PathVariable UUID id,
            @PathVariable UUID benefitId) {
        logger.info("DELETE /api/scenario-packages/{}/benefits/{} - Remove benefit", id, benefitId);

        ScenarioPackageDTO dto = packageService.removeBenefit(id, benefitId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 添加单品（软权益）
     *
     * @param id      场景包 ID
     * @param request 添加单品请求
     * @return 更新后的场景包详情
     */
    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddItemRequest request) {
        logger.info("POST /api/scenario-packages/{}/items - Add item: {}", id, request.getItemId());

        ScenarioPackageDTO dto = packageService.addItem(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto));
    }

    /**
     * 更新单品数量
     *
     * @param id       场景包 ID
     * @param itemId   单品记录 ID
     * @param quantity 新数量
     * @return 更新后的场景包详情
     */
    @PutMapping("/{id}/items/{itemId}/quantity")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> updateItemQuantity(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @RequestParam Integer quantity) {
        logger.info("PUT /api/scenario-packages/{}/items/{}/quantity - Update to: {}", id, itemId, quantity);

        ScenarioPackageDTO dto = packageService.updateItemQuantity(id, itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 删除单品
     *
     * @param id     场景包 ID
     * @param itemId 单品记录 ID
     * @return 更新后的场景包详情
     */
    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> removeItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId) {
        logger.info("DELETE /api/scenario-packages/{}/items/{} - Remove item", id, itemId);

        ScenarioPackageDTO dto = packageService.removeItem(id, itemId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    /**
     * 添加服务
     *
     * @param id      场景包 ID
     * @param request 添加服务请求
     * @return 更新后的场景包详情
     */
    @PostMapping("/{id}/services")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> addService(
            @PathVariable UUID id,
            @Valid @RequestBody AddServiceRequest request) {
        logger.info("POST /api/scenario-packages/{}/services - Add service: {}", id, request.getServiceId());

        ScenarioPackageDTO dto = packageService.addService(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto));
    }

    /**
     * 删除服务
     *
     * @param id        场景包 ID
     * @param serviceId 服务记录 ID
     * @return 更新后的场景包详情
     */
    @DeleteMapping("/{id}/services/{serviceId}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> removeService(
            @PathVariable UUID id,
            @PathVariable UUID serviceId) {
        logger.info("DELETE /api/scenario-packages/{}/services/{} - Remove service", id, serviceId);

        ScenarioPackageDTO dto = packageService.removeService(id, serviceId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    // ==================== 套餐档位、加购项、时段模板 API ====================

    /**
     * 获取场景包的套餐档位列表
     */
    @GetMapping("/{id}/tiers")
    public ResponseEntity<ApiResponse<java.util.List<com.cinema.scenariopackage.model.PackageTier>>> getPackageTiers(
            @PathVariable UUID id) {
        logger.info("GET /api/scenario-packages/{}/tiers - Get package tiers", id);
        java.util.List<com.cinema.scenariopackage.model.PackageTier> tiers = packageService.getPackageTiers(id);
        return ResponseEntity.ok(ApiResponse.success(tiers));
    }

    /**
     * 创建套餐档位
     */
    @PostMapping("/{id}/tiers")
    public ResponseEntity<ApiResponse<com.cinema.scenariopackage.model.PackageTier>> createPackageTier(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePackageTierRequest request) {
        logger.info("POST /api/scenario-packages/{}/tiers - Create package tier: {}", id, request.getName());
        com.cinema.scenariopackage.model.PackageTier tier = packageService.createPackageTier(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(tier));
    }

    /**
     * 更新套餐档位
     */
    @PutMapping("/{id}/tiers/{tierId}")
    public ResponseEntity<ApiResponse<com.cinema.scenariopackage.model.PackageTier>> updatePackageTier(
            @PathVariable UUID id,
            @PathVariable UUID tierId,
            @Valid @RequestBody CreatePackageTierRequest request) {
        logger.info("PUT /api/scenario-packages/{}/tiers/{} - Update package tier", id, tierId);
        com.cinema.scenariopackage.model.PackageTier tier = packageService.updatePackageTier(id, tierId, request);
        return ResponseEntity.ok(ApiResponse.success(tier));
    }

    /**
     * 删除套餐档位
     */
    @DeleteMapping("/{id}/tiers/{tierId}")
    public ResponseEntity<Void> deletePackageTier(
            @PathVariable UUID id,
            @PathVariable UUID tierId) {
        logger.info("DELETE /api/scenario-packages/{}/tiers/{} - Delete package tier", id, tierId);
        packageService.deletePackageTier(id, tierId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 获取场景包关联的加购项
     */
    @GetMapping("/{id}/addons")
    public ResponseEntity<ApiResponse<java.util.List<com.cinema.scenariopackage.model.PackageAddon>>> getPackageAddons(
            @PathVariable UUID id) {
        logger.info("GET /api/scenario-packages/{}/addons - Get package addons", id);
        java.util.List<com.cinema.scenariopackage.model.PackageAddon> addons = packageService.getPackageAddons(id);
        return ResponseEntity.ok(ApiResponse.success(addons));
    }

    /**
     * 获取场景包的时段模板
     */
    @GetMapping("/{id}/time-slot-templates")
    public ResponseEntity<ApiResponse<java.util.List<com.cinema.scenariopackage.model.TimeSlotTemplate>>> getTimeSlotTemplates(
            @PathVariable UUID id) {
        logger.info("GET /api/scenario-packages/{}/time-slot-templates - Get time slot templates", id);
        java.util.List<com.cinema.scenariopackage.model.TimeSlotTemplate> templates = packageService.getTimeSlotTemplates(id);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    /**
     * 创建时段模板
     */
    @PostMapping("/{id}/time-slot-templates")
    public ResponseEntity<ApiResponse<com.cinema.scenariopackage.model.TimeSlotTemplate>> createTimeSlotTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody com.cinema.scenariopackage.dto.CreateTimeSlotTemplateRequest request) {
        logger.info("POST /api/scenario-packages/{}/time-slot-templates - Create time slot template", id);
        com.cinema.scenariopackage.model.TimeSlotTemplate template = packageService.createTimeSlotTemplate(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(template));
    }

    /**
     * 更新时段模板
     */
    @PutMapping("/{id}/time-slot-templates/{templateId}")
    public ResponseEntity<ApiResponse<com.cinema.scenariopackage.model.TimeSlotTemplate>> updateTimeSlotTemplate(
            @PathVariable UUID id,
            @PathVariable UUID templateId,
            @Valid @RequestBody com.cinema.scenariopackage.dto.CreateTimeSlotTemplateRequest request) {
        logger.info("PUT /api/scenario-packages/{}/time-slot-templates/{} - Update time slot template", id, templateId);
        com.cinema.scenariopackage.model.TimeSlotTemplate template = packageService.updateTimeSlotTemplate(id, templateId, request);
        return ResponseEntity.ok(ApiResponse.success(template));
    }

    /**
     * 删除时段模板
     */
    @DeleteMapping("/{id}/time-slot-templates/{templateId}")
    public ResponseEntity<Void> deleteTimeSlotTemplate(
            @PathVariable UUID id,
            @PathVariable UUID templateId) {
        logger.info("DELETE /api/scenario-packages/{}/time-slot-templates/{} - Delete time slot template", id, templateId);
        packageService.deleteTimeSlotTemplate(id, templateId);
        return ResponseEntity.noContent().build();
    }

    // ==================== T071: 时段覆盖 API ====================

    /**
     * 获取场景包的时段覆盖列表
     *
     * @param id        场景包 ID
     * @param startDate 开始日期（可选）
     * @param endDate   结束日期（可选）
     * @return 时段覆盖列表
     */
    @GetMapping("/{id}/time-slot-overrides")
    public ResponseEntity<ApiResponse<java.util.List<com.cinema.scenariopackage.model.TimeSlotOverride>>> getTimeSlotOverrides(
            @PathVariable UUID id,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        logger.info("GET /api/scenario-packages/{}/time-slot-overrides - Get time slot overrides", id);
        
        java.util.List<com.cinema.scenariopackage.model.TimeSlotOverride> overrides;
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            overrides = packageService.getTimeSlotOverridesByDateRange(id, start, end);
        } else {
            overrides = packageService.getTimeSlotOverrides(id);
        }
        return ResponseEntity.ok(ApiResponse.success(overrides));
    }

    /**
     * 创建时段覆盖
     *
     * @param id      场景包 ID
     * @param request 创建请求
     * @return 创建的时段覆盖
     */
    @PostMapping("/{id}/time-slot-overrides")
    public ResponseEntity<ApiResponse<com.cinema.scenariopackage.model.TimeSlotOverride>> createTimeSlotOverride(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTimeSlotOverrideRequest request) {
        logger.info("POST /api/scenario-packages/{}/time-slot-overrides - Create time slot override for date: {}", id, request.getDate());
        com.cinema.scenariopackage.model.TimeSlotOverride override = packageService.createTimeSlotOverride(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(override));
    }

    /**
     * 更新时段覆盖
     *
     * @param id         场景包 ID
     * @param overrideId 覆盖规则 ID
     * @param request    更新请求
     * @return 更新后的时段覆盖
     */
    @PutMapping("/{id}/time-slot-overrides/{overrideId}")
    public ResponseEntity<ApiResponse<com.cinema.scenariopackage.model.TimeSlotOverride>> updateTimeSlotOverride(
            @PathVariable UUID id,
            @PathVariable UUID overrideId,
            @Valid @RequestBody CreateTimeSlotOverrideRequest request) {
        logger.info("PUT /api/scenario-packages/{}/time-slot-overrides/{} - Update time slot override", id, overrideId);
        com.cinema.scenariopackage.model.TimeSlotOverride override = packageService.updateTimeSlotOverride(id, overrideId, request);
        return ResponseEntity.ok(ApiResponse.success(override));
    }

    /**
     * 删除时段覆盖
     *
     * @param id         场景包 ID
     * @param overrideId 覆盖规则 ID
     * @return 204 No Content
     */
    @DeleteMapping("/{id}/time-slot-overrides/{overrideId}")
    public ResponseEntity<Void> deleteTimeSlotOverride(
            @PathVariable UUID id,
            @PathVariable UUID overrideId) {
        logger.info("DELETE /api/scenario-packages/{}/time-slot-overrides/{} - Delete time slot override", id, overrideId);
        packageService.deleteTimeSlotOverride(id, overrideId);
        return ResponseEntity.noContent().build();
    }
}

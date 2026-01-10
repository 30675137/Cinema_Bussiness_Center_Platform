package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.Spu;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.repository.SpuJpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * SPU管理控制器
 * - 提供SPU CRUD接口
 * - 支持 /api/spu (前端路径) 和 /api/spus (REST规范) 双路径
 *
 * @spec P001-spu-management
 */
@RestController
@RequestMapping({"/api/spu", "/api/spus"})
public class SpuController {

    private final SpuJpaRepository spuRepository;

    public SpuController(SpuJpaRepository spuRepository) {
        this.spuRepository = spuRepository;
    }

    /**
     * 查询SPU列表
     * GET /api/spu/list 或 GET /api/spus
     *
     * @param status    状态筛选
     * @param categoryId 类目ID筛选
     * @param brandId   品牌ID筛选
     * @param keyword   关键词搜索(名称/编码)
     * @param page      页码
     * @param pageSize  每页大小
     */
    @GetMapping({"", "/list"})
    public ResponseEntity<Map<String, Object>> getSpus(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        // 使用 JPA Repository 的综合查询方法
        List<Spu> spus = spuRepository.findAllWithFilters(status, categoryId, brandId, keyword);

        // 简单分页
        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, spus.size());
        List<Spu> pagedSpus = start < spus.size() ? spus.subList(start, end) : List.of();

        Map<String, Object> response = Map.of(
                "success", true,
                "data", pagedSpus,
                "total", spus.size(),
                "page", page,
                "pageSize", pageSize,
                "totalPages", (int) Math.ceil((double) spus.size() / pageSize),
                "message", "查询成功"
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 获取SPU详情
     * GET /api/spus/{id}
     *
     * @param id SPU ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Spu>> getSpu(@PathVariable UUID id) {
        return spuRepository.findById(id)
                .map(spu -> ResponseEntity.ok(ApiResponse.success(spu)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.failure("SPU_NOT_FOUND", "SPU不存在", null)));
    }

    /**
     * 创建SPU
     * POST /api/spu/create 或 POST /api/spus
     *
     * @spec B001-fix-brand-creation
     * @param spu SPU数据
     */
    @PostMapping({"", "/create"})
    public ResponseEntity<ApiResponse<Spu>> createSpu(@RequestBody Spu spu) {
        try {
            if (spu.getId() == null) {
                spu.setId(UUID.randomUUID());
            }
            // 自动生成SPU编码
            if (spu.getCode() == null || spu.getCode().isEmpty()) {
                spu.setCode("SPU" + System.currentTimeMillis());
            }
            // 手动设置时间字段（避免JPA审计的LocalDateTime/OffsetDateTime转换问题）
            OffsetDateTime now = OffsetDateTime.now();
            if (spu.getCreatedAt() == null) {
                spu.setCreatedAt(now);
            }
            spu.setUpdatedAt(now);

            Spu createdSpu = spuRepository.save(spu);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdSpu));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("CREATE_ERROR", e.getMessage(), null));
        }
    }

    /**
     * 更新SPU
     * PUT /api/spus/{id}
     *
     * @spec B001-fix-brand-creation
     * @param id  SPU ID
     * @param updateData SPU更新数据
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Spu>> updateSpu(@PathVariable UUID id, @RequestBody Spu updateData) {
        return spuRepository.findById(id)
                .map(existingSpu -> {
                    // 合并更新：只更新提供的字段，保留原有值
                    if (updateData.getName() != null) {
                        existingSpu.setName(updateData.getName());
                    }
                    if (updateData.getShortName() != null) {
                        existingSpu.setShortName(updateData.getShortName());
                    }
                    if (updateData.getDescription() != null) {
                        existingSpu.setDescription(updateData.getDescription());
                    }
                    if (updateData.getCategoryId() != null) {
                        existingSpu.setCategoryId(updateData.getCategoryId());
                    }
                    if (updateData.getCategoryName() != null) {
                        existingSpu.setCategoryName(updateData.getCategoryName());
                    }
                    if (updateData.getBrandId() != null) {
                        existingSpu.setBrandId(updateData.getBrandId());
                    }
                    if (updateData.getBrandName() != null) {
                        existingSpu.setBrandName(updateData.getBrandName());
                    }
                    if (updateData.getStatus() != null) {
                        existingSpu.setStatus(updateData.getStatus());
                    }
                    if (updateData.getProductType() != null) {
                        existingSpu.setProductType(updateData.getProductType());
                    }
                    if (updateData.getUnit() != null) {
                        existingSpu.setUnit(updateData.getUnit());
                    }
                    if (updateData.getTags() != null) {
                        existingSpu.setTags(updateData.getTags());
                    }
                    if (updateData.getImages() != null) {
                        existingSpu.setImages(updateData.getImages());
                    }
                    if (updateData.getSpecifications() != null) {
                        existingSpu.setSpecifications(updateData.getSpecifications());
                    }
                    if (updateData.getAttributes() != null) {
                        existingSpu.setAttributes(updateData.getAttributes());
                    }
                    // 更新时间戳
                    existingSpu.setUpdatedAt(OffsetDateTime.now());

                    Spu savedSpu = spuRepository.save(existingSpu);
                    return ResponseEntity.ok(ApiResponse.success(savedSpu));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.failure("SPU_NOT_FOUND", "SPU不存在", null)));
    }

    /**
     * 删除SPU
     * DELETE /api/spus/{id}
     *
     * @param id SPU ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpu(@PathVariable UUID id) {
        if (!spuRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("SPU_NOT_FOUND", "SPU不存在", null));
        }

        spuRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 批量操作SPU
     * POST /api/spu/batch
     *
     * @spec B001-fix-brand-creation
     * @param request 批量操作请求 {operation: "delete", ids: [...]}
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> batchOperation(@RequestBody Map<String, Object> request) {
        String operation = (String) request.get("operation");
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) request.get("ids");

        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "未提供要操作的SPU ID"
            ));
        }

        if ("delete".equals(operation)) {
            int successCount = 0;
            int failedCount = 0;

            for (String idStr : ids) {
                try {
                    UUID id = UUID.fromString(idStr);
                    if (spuRepository.existsById(id)) {
                        spuRepository.deleteById(id);
                        successCount++;
                    } else {
                        failedCount++;
                    }
                } catch (IllegalArgumentException e) {
                    failedCount++;
                }
            }

            String message = failedCount > 0
                    ? String.format("成功删除 %d 个 SPU，失败 %d 个", successCount, failedCount)
                    : String.format("成功删除 %d 个 SPU", successCount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of("processedCount", successCount, "failedCount", failedCount),
                    "message", message
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "不支持的操作类型: " + operation
        ));
    }
}

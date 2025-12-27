package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.Spu;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.repository.SpuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * SPU管理控制器
 * - 提供SPU CRUD接口
 */
@RestController
@RequestMapping("/api/spus")
public class SpuController {

    private final SpuRepository spuRepository;

    public SpuController(SpuRepository spuRepository) {
        this.spuRepository = spuRepository;
    }

    /**
     * 查询SPU列表
     * GET /api/spus
     *
     * @param status    状态筛选
     * @param categoryId 类目ID筛选
     * @param brandId   品牌ID筛选
     * @param keyword   关键词搜索(名称/编码)
     * @param page      页码
     * @param pageSize  每页大小
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getSpus(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        List<Spu> spus = spuRepository.findAll(status, categoryId, brandId, keyword);

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
     * POST /api/spus
     *
     * @param spu SPU数据
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Spu>> createSpu(@RequestBody Spu spu) {
        try {
            if (spu.getId() == null) {
                spu.setId(UUID.randomUUID());
            }
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
     * @param id  SPU ID
     * @param spu SPU数据
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Spu>> updateSpu(@PathVariable UUID id, @RequestBody Spu spu) {
        if (!spuRepository.findById(id).isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("SPU_NOT_FOUND", "SPU不存在", null));
        }
        
        spu.setId(id);
        Spu updatedSpu = spuRepository.update(spu);
        return ResponseEntity.ok(ApiResponse.success(updatedSpu));
    }

    /**
     * 删除SPU
     * DELETE /api/spus/{id}
     *
     * @param id SPU ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpu(@PathVariable UUID id) {
        if (!spuRepository.findById(id).isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("SPU_NOT_FOUND", "SPU不存在", null));
        }
        
        spuRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

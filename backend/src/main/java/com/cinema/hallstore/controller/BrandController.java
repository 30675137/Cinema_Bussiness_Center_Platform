package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.Brand;
import com.cinema.hallstore.repository.BrandRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 品牌管理API Controller
 * 提供品牌的CRUD操作
 */
@RestController
@RequestMapping("/api/v1/brands")
public class BrandController {

    private static final Logger logger = LoggerFactory.getLogger(BrandController.class);
    private final BrandRepository brandRepository;

    public BrandController(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    /**
     * 获取品牌列表
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getBrands(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String brandType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        logger.debug("Getting brands with keyword={}, brandType={}, status={}, page={}, pageSize={}",
                keyword, brandType, status, page, pageSize);

        List<Brand> allBrands;
        
        // 根据筛选条件查询
        if (keyword != null && !keyword.isEmpty()) {
            allBrands = brandRepository.search(keyword);
        } else if (status != null && !status.isEmpty()) {
            allBrands = brandRepository.findByStatus(status);
        } else if (brandType != null && !brandType.isEmpty()) {
            allBrands = brandRepository.findByBrandType(brandType);
        } else {
            allBrands = brandRepository.findAll();
        }

        // 额外过滤
        if (allBrands != null) {
            if (status != null && !status.isEmpty() && keyword != null) {
                allBrands = allBrands.stream()
                        .filter(b -> status.equals(b.getStatus()))
                        .collect(Collectors.toList());
            }
            if (brandType != null && !brandType.isEmpty() && (keyword != null || status != null)) {
                allBrands = allBrands.stream()
                        .filter(b -> brandType.equals(b.getBrandType()))
                        .collect(Collectors.toList());
            }
        }

        int total = allBrands != null ? allBrands.size() : 0;
        int totalPages = (int) Math.ceil((double) total / pageSize);

        // 分页处理
        int fromIndex = (page - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, total);
        List<Brand> pagedBrands = allBrands != null && fromIndex < total 
                ? allBrands.subList(fromIndex, toIndex) 
                : List.of();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", pagedBrands);
        response.put("message", "查询成功");
        response.put("timestamp", OffsetDateTime.now().toString());
        
        // 分页信息
        Map<String, Object> pagination = new HashMap<>();
        pagination.put("current", page);
        pagination.put("pageSize", pageSize);
        pagination.put("total", total);
        pagination.put("totalPages", totalPages);
        pagination.put("hasNext", page < totalPages);
        pagination.put("hasPrev", page > 1);
        response.put("pagination", pagination);

        return ResponseEntity.ok(response);
    }

    /**
     * 获取品牌详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBrandById(@PathVariable String id) {
        logger.debug("Getting brand by id: {}", id);
        
        Optional<Brand> brand = brandRepository.findById(id);
        
        Map<String, Object> response = new HashMap<>();
        if (brand.isPresent()) {
            Brand b = brand.get();
            // 添加使用统计（暂时返回空数据）
            Map<String, Object> usageStats = new HashMap<>();
            usageStats.put("brandId", b.getId());
            usageStats.put("spuCount", 0);
            usageStats.put("skuCount", 0);
            usageStats.put("calculatedAt", OffsetDateTime.now().toString());
            
            Map<String, Object> data = new HashMap<>();
            data.put("brand", b);
            data.put("usageStats", usageStats);
            
            response.put("success", true);
            response.put("data", b);
            response.put("usageStats", usageStats);
            response.put("message", "查询成功");
        } else {
            response.put("success", false);
            response.put("message", "品牌不存在");
        }
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 创建品牌
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBrand(@RequestBody Brand brand) {
        logger.debug("Creating brand: {}", brand.getName());
        
        // 生成品牌编码
        if (brand.getBrandCode() == null || brand.getBrandCode().isEmpty()) {
            brand.setBrandCode("BRAND" + System.currentTimeMillis());
        }
        
        // 设置默认状态
        if (brand.getStatus() == null) {
            brand.setStatus("draft");
        }
        
        brand.setCreatedBy("system");
        brand.setUpdatedBy("system");
        
        Brand saved = brandRepository.save(brand);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", saved);
        response.put("message", "创建成功");
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 更新品牌
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBrand(
            @PathVariable String id,
            @RequestBody Brand brand
    ) {
        logger.debug("Updating brand: {}", id);
        
        Optional<Brand> existing = brandRepository.findById(id);
        
        Map<String, Object> response = new HashMap<>();
        if (existing.isPresent()) {
            Brand toUpdate = existing.get();
            
            // 更新字段
            if (brand.getName() != null) toUpdate.setName(brand.getName());
            if (brand.getEnglishName() != null) toUpdate.setEnglishName(brand.getEnglishName());
            if (brand.getBrandType() != null) toUpdate.setBrandType(brand.getBrandType());
            if (brand.getPrimaryCategories() != null) toUpdate.setPrimaryCategories(brand.getPrimaryCategories());
            if (brand.getCompany() != null) toUpdate.setCompany(brand.getCompany());
            if (brand.getBrandLevel() != null) toUpdate.setBrandLevel(brand.getBrandLevel());
            if (brand.getTags() != null) toUpdate.setTags(brand.getTags());
            if (brand.getDescription() != null) toUpdate.setDescription(brand.getDescription());
            if (brand.getLogoUrl() != null) toUpdate.setLogoUrl(brand.getLogoUrl());
            
            toUpdate.setUpdatedBy("system");
            
            Brand saved = brandRepository.save(toUpdate);
            
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "更新成功");
        } else {
            response.put("success", false);
            response.put("message", "品牌不存在");
        }
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 删除品牌
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBrand(@PathVariable String id) {
        logger.debug("Deleting brand: {}", id);
        
        brandRepository.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "删除成功");
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 更新品牌状态
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateBrandStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusRequest
    ) {
        logger.debug("Updating brand status: {} to {}", id, statusRequest.get("status"));
        
        Optional<Brand> existing = brandRepository.findById(id);
        
        Map<String, Object> response = new HashMap<>();
        if (existing.isPresent()) {
            Brand toUpdate = existing.get();
            toUpdate.setStatus(statusRequest.get("status"));
            toUpdate.setUpdatedBy("system");
            
            Brand saved = brandRepository.save(toUpdate);
            
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "状态更新成功");
        } else {
            response.put("success", false);
            response.put("message", "品牌不存在");
        }
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 检查品牌名称是否重复
     */
    @GetMapping("/check-name")
    public ResponseEntity<Map<String, Object>> checkNameDuplication(
            @RequestParam String name,
            @RequestParam String brandType,
            @RequestParam(required = false) String excludeId
    ) {
        List<Brand> brands = brandRepository.search(name);
        
        boolean isDuplicate = brands != null && brands.stream()
                .filter(b -> name.equals(b.getName()) && brandType.equals(b.getBrandType()))
                .anyMatch(b -> excludeId == null || !excludeId.equals(b.getId()));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        Map<String, Boolean> data = new HashMap<>();
        data.put("isDuplicate", isDuplicate);
        response.put("data", data);
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 检查品牌编码是否存在
     */
    @GetMapping("/check-code")
    public ResponseEntity<Map<String, Object>> checkBrandCodeExists(
            @RequestParam String code,
            @RequestParam(required = false) String excludeId
    ) {
        Optional<Brand> brand = brandRepository.findByBrandCode(code);
        
        boolean exists = brand.isPresent() && 
                (excludeId == null || !excludeId.equals(brand.get().getId()));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        Map<String, Boolean> data = new HashMap<>();
        data.put("exists", exists);
        response.put("data", data);
        response.put("timestamp", OffsetDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
}

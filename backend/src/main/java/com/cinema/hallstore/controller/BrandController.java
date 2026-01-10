package com.cinema.hallstore.controller;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.Brand;
import com.cinema.hallstore.repository.BrandJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * 品牌管理API Controller
 * 提供品牌的CRUD操作
 *
 * @spec B001-fix-brand-creation
 */
@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private static final Logger logger = LoggerFactory.getLogger(BrandController.class);
    private final BrandJpaRepository brandRepository;
    private final SupabaseConfig supabaseConfig;
    private final RestTemplate restTemplate;

    @Value("${supabase.storage.bucket:brand-logos}")
    private String bucketName;

    public BrandController(BrandJpaRepository brandRepository,
                           SupabaseConfig supabaseConfig,
                           RestTemplate restTemplate) {
        this.brandRepository = brandRepository;
        this.supabaseConfig = supabaseConfig;
        this.restTemplate = restTemplate;
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

        // 使用 JPA 综合查询方法，支持关键词、品牌类型、状态筛选
        List<Brand> allBrands = brandRepository.findAllWithFilters(keyword, brandType, status);

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
        response.put("timestamp", Instant.now().toString());
        
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

        UUID brandId = UUID.fromString(id);
        Optional<Brand> brand = brandRepository.findById(brandId);
        
        Map<String, Object> response = new HashMap<>();
        if (brand.isPresent()) {
            Brand b = brand.get();
            // 添加使用统计（暂时返回空数据）
            Map<String, Object> usageStats = new HashMap<>();
            usageStats.put("brandId", b.getId());
            usageStats.put("spuCount", 0);
            usageStats.put("skuCount", 0);
            usageStats.put("calculatedAt", Instant.now().toString());
            
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
        response.put("timestamp", Instant.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 创建品牌
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBrand(@RequestBody Brand brand) {
        logger.debug("Creating brand: {}", brand.getName());

        // UUID 由 JPA 自动生成，无需手动设置

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
        response.put("timestamp", Instant.now().toString());
        
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

        UUID brandId = UUID.fromString(id);
        Optional<Brand> existing = brandRepository.findById(brandId);
        
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
        response.put("timestamp", Instant.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 删除品牌
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBrand(@PathVariable String id) {
        logger.debug("Deleting brand: {}", id);

        UUID brandId = UUID.fromString(id);
        brandRepository.deleteById(brandId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "删除成功");
        response.put("timestamp", Instant.now().toString());
        
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

        UUID brandId = UUID.fromString(id);
        Optional<Brand> existing = brandRepository.findById(brandId);
        
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
        response.put("timestamp", Instant.now().toString());
        
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
        // 使用 JPA 方法直接检查重复
        UUID excludeUuid = (excludeId != null && !excludeId.isEmpty()) ? UUID.fromString(excludeId) : null;
        boolean isDuplicate = brandRepository.existsByNameAndBrandType(name, brandType, excludeUuid);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        Map<String, Boolean> data = new HashMap<>();
        data.put("isDuplicate", isDuplicate);
        response.put("data", data);
        response.put("timestamp", Instant.now().toString());

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

        UUID excludeUuid = (excludeId != null && !excludeId.isEmpty()) ? UUID.fromString(excludeId) : null;
        boolean exists = brand.isPresent() &&
                (excludeUuid == null || !excludeUuid.equals(brand.get().getId()));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        Map<String, Boolean> data = new HashMap<>();
        data.put("exists", exists);
        response.put("data", data);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * @spec B001-fix-brand-creation
     * 上传品牌Logo
     */
    @PostMapping("/{id}/logo")
    public ResponseEntity<Map<String, Object>> uploadLogo(
            @PathVariable String id,
            @RequestParam("logo") MultipartFile file
    ) {
        logger.debug("Uploading logo for brand: {}", id);

        UUID brandId = UUID.fromString(id);
        Optional<Brand> existing = brandRepository.findById(brandId);

        Map<String, Object> response = new HashMap<>();
        if (existing.isEmpty()) {
            response.put("success", false);
            response.put("message", "品牌不存在");
            response.put("timestamp", Instant.now().toString());
            return ResponseEntity.status(404).body(response);
        }

        try {
            // 生成唯一文件名
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName != null && originalFileName.contains(".")
                    ? originalFileName.substring(originalFileName.lastIndexOf("."))
                    : ".png";
            String fileName = "brand-logos/" + brandId + "-" + System.currentTimeMillis() + extension;

            // 上传到 Supabase Storage
            String storageUrl = supabaseConfig.getUrl() + "/storage/v1/object/" + bucketName + "/" + fileName;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseConfig.getServiceRoleKey());
            headers.set("apikey", supabaseConfig.getServiceRoleKey());
            headers.setContentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : "image/png"
            ));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> uploadResponse = restTemplate.exchange(
                    storageUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (!uploadResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("上传失败: " + uploadResponse.getStatusCode());
            }

            // 生成公开访问URL
            String publicUrl = supabaseConfig.getUrl() + "/storage/v1/object/public/" + bucketName + "/" + fileName;

            // 更新品牌的logoUrl
            Brand toUpdate = existing.get();
            toUpdate.setLogoUrl(publicUrl);
            toUpdate.setUpdatedBy("system");
            brandRepository.save(toUpdate);

            response.put("success", true);
            Map<String, String> data = new HashMap<>();
            data.put("logoUrl", publicUrl);
            response.put("data", data);
            response.put("message", "Logo上传成功");
            response.put("timestamp", Instant.now().toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Logo上传失败: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Logo上传失败: " + e.getMessage());
            response.put("timestamp", Instant.now().toString());
            return ResponseEntity.status(500).body(response);
        }
    }
}

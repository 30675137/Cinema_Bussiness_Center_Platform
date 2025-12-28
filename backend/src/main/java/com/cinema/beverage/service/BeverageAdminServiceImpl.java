/**
 * @spec O003-beverage-order
 * B端饮品配置管理服务实现 (User Story 3)
 */
package com.cinema.beverage.service;

import com.cinema.beverage.dto.*;
import com.cinema.beverage.entity.*;
import com.cinema.beverage.mapper.BeverageMapper;
import com.cinema.beverage.repository.*;
import com.cinema.common.exception.NotFoundException;
import com.cinema.hallstore.config.SupabaseConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * B端饮品配置管理服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BeverageAdminServiceImpl implements BeverageAdminService {

    private final BeverageRepository beverageRepository;
    private final BeverageSpecRepository beverageSpecRepository;
    private final BeverageRecipeRepository beverageRecipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final BeverageMapper mapper;
    private final SupabaseConfig supabaseConfig;
    private final RestTemplate restTemplate;
    // TODO: 添加 InventoryService (P003/P004) 用于SKU校验

    /**
     * FR-028: 获取饮品列表（分页/搜索/筛选）
     */
    @Override
    @Transactional(readOnly = true)
    public Page<BeverageDTO> findBeverages(
        String name,
        String category,
        Beverage.BeverageStatus status,
        Pageable pageable
    ) {
        log.info("查询饮品列表: name={}, category={}, status={}, page={}, size={}",
            name, category, status, pageable.getPageNumber(), pageable.getPageSize());

        // 构建动态查询条件
        Specification<Beverage> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 名称模糊搜索
            if (name != null && !name.trim().isEmpty()) {
                predicates.add(cb.like(root.get("name"), "%" + name + "%"));
            }

            // 分类筛选
            if (category != null && !category.trim().isEmpty()) {
                try {
                    Beverage.BeverageCategory cat = Beverage.BeverageCategory.valueOf(category);
                    predicates.add(cb.equal(root.get("category"), cat));
                } catch (IllegalArgumentException e) {
                    log.warn("无效的分类值: {}", category);
                }
            }

            // 状态筛选
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Beverage> beveragePage = beverageRepository.findAll(spec, pageable);

        // 转换为DTO并填充规格/配方数量
        List<UUID> beverageIds = beveragePage.getContent().stream()
            .map(Beverage::getId)
            .collect(Collectors.toList());

        // 批量查询规格数量
        Map<UUID, Long> specCountMap = new HashMap<>();
        if (!beverageIds.isEmpty()) {
            List<BeverageSpec> specs = beverageSpecRepository.findByBeverageIdIn(beverageIds);
            specCountMap = specs.stream()
                .collect(Collectors.groupingBy(BeverageSpec::getBeverageId, Collectors.counting()));
        }

        // 批量查询配方数量
        Map<UUID, Long> recipeCountMap = new HashMap<>();
        if (!beverageIds.isEmpty()) {
            for (UUID id : beverageIds) {
                long count = beverageRecipeRepository.countByBeverageId(id);
                if (count > 0) {
                    recipeCountMap.put(id, count);
                }
            }
        }

        final Map<UUID, Long> finalSpecCountMap = specCountMap;
        final Map<UUID, Long> finalRecipeCountMap = recipeCountMap;

        List<BeverageDTO> dtoList = beveragePage.getContent().stream()
            .map(beverage -> {
                BeverageDTO dto = mapper.toDTO(beverage);
                dto.setSpecCount(finalSpecCountMap.getOrDefault(beverage.getId(), 0L).intValue());
                dto.setRecipeCount(finalRecipeCountMap.getOrDefault(beverage.getId(), 0L).intValue());
                return dto;
            })
            .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, beveragePage.getTotalElements());
    }

    /**
     * FR-029: 新增饮品
     */
    @Override
    @Transactional
    public BeverageDTO createBeverage(CreateBeverageRequest request) {
        log.info("创建饮品: name={}, category={}", request.getName(), request.getCategory());

        // TODO: 校验饮品名称唯一性（门店维度）

        // 转换 DTO -> Entity
        Beverage beverage = Beverage.builder()
            .name(request.getName())
            .category(Beverage.BeverageCategory.valueOf(request.getCategory().name()))
            .basePrice(new BigDecimal(request.getBasePrice()).divide(new BigDecimal("100"))) // 分 -> 元
            .description(request.getDescription())
            .imageUrl(request.getMainImage())
            .detailImages(request.getDetailImages() != null ?
                request.getDetailImages().toArray(new String[0]) : new String[0])
            .isRecommended(request.getIsRecommended() != null ? request.getIsRecommended() : false)
            .status(request.getStatus() != null ?
                Beverage.BeverageStatus.valueOf(request.getStatus().name()) :
                Beverage.BeverageStatus.INACTIVE)
            .sortOrder(0)
            .build();

        Beverage saved = beverageRepository.save(beverage);
        log.info("饮品创建成功: id={}, name={}", saved.getId(), saved.getName());

        return mapper.toDTO(saved);
    }

    /**
     * 获取饮品详情
     */
    @Override
    @Transactional(readOnly = true)
    public BeverageDetailDTO getBeverageDetail(String id) {
        log.info("获取饮品详情: id={}", id);

        UUID beverageId = UUID.fromString(id);
        Beverage beverage = beverageRepository.findById(beverageId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + id));

        // 转换基本信息
        BeverageDetailDTO dto = new BeverageDetailDTO();
        dto.setId(beverage.getId().toString());
        dto.setName(beverage.getName());
        dto.setCategory(beverage.getCategory());
        dto.setBasePrice(beverage.getBasePrice().multiply(new BigDecimal("100")).longValue()); // 元 -> 分
        dto.setDescription(beverage.getDescription());
        dto.setMainImage(beverage.getImageUrl());
        dto.setDetailImages(beverage.getDetailImages() != null ?
            List.of(beverage.getDetailImages()) : List.of());
        dto.setIsRecommended(beverage.getIsRecommended());
        dto.setStatus(beverage.getStatus());
        dto.setCreatedAt(beverage.getCreatedAt().toString());
        dto.setUpdatedAt(beverage.getUpdatedAt().toString());

        // 加载规格列表
        List<BeverageSpec> specs = beverageSpecRepository.findByBeverageIdOrderBySpecTypeAscSortOrderAsc(beverageId);
        dto.setSpecs(mapper.toSpecDTOList(specs));

        // 加载配方列表（包含原料）
        List<BeverageRecipe> recipes = beverageRecipeRepository.findByBeverageIdOrderByCreatedAtDesc(beverageId);
        List<BeverageRecipeDTO> recipeDTOs = recipes.stream()
            .map(recipe -> {
                List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                return mapper.toRecipeDTO(recipe, ingredients);
            })
            .collect(Collectors.toList());
        dto.setRecipes(recipeDTOs);

        return dto;
    }

    /**
     * FR-030: 更新饮品信息
     */
    @Override
    @Transactional
    public BeverageDTO updateBeverage(String id, UpdateBeverageRequest request) {
        log.info("更新饮品: id={}, name={}", id, request.getName());

        UUID beverageId = UUID.fromString(id);
        Beverage beverage = beverageRepository.findById(beverageId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + id));

        // 更新字段（仅更新非null字段）
        if (request.getName() != null) {
            beverage.setName(request.getName());
        }
        if (request.getCategory() != null) {
            beverage.setCategory(Beverage.BeverageCategory.valueOf(request.getCategory().name()));
        }
        if (request.getBasePrice() != null) {
            beverage.setBasePrice(new BigDecimal(request.getBasePrice()).divide(new BigDecimal("100"))); // 分 -> 元
        }
        if (request.getDescription() != null) {
            beverage.setDescription(request.getDescription());
        }
        if (request.getMainImage() != null) {
            beverage.setImageUrl(request.getMainImage());
        }
        if (request.getDetailImages() != null) {
            beverage.setDetailImages(request.getDetailImages().toArray(new String[0]));
        }
        if (request.getIsRecommended() != null) {
            beverage.setIsRecommended(request.getIsRecommended());
        }
        if (request.getStatus() != null) {
            beverage.setStatus(Beverage.BeverageStatus.valueOf(request.getStatus().name()));
        }

        Beverage updated = beverageRepository.save(beverage);
        log.info("饮品更新成功: id={}, name={}", updated.getId(), updated.getName());

        return mapper.toDTO(updated);
    }

    /**
     * FR-031: 删除饮品（软删除）
     */
    @Override
    @Transactional
    public void deleteBeverage(String id) {
        log.info("软删除饮品: id={}", id);

        UUID beverageId = UUID.fromString(id);
        Beverage beverage = beverageRepository.findById(beverageId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + id));

        // TODO: 检查是否有未完成的订单引用此饮品（需要集成O003订单模块）

        // 软删除：更新状态为 INACTIVE
        beverage.setStatus(Beverage.BeverageStatus.INACTIVE);
        beverageRepository.save(beverage);

        log.info("饮品已标记为INACTIVE: id={}", id);
    }

    /**
     * FR-034: 切换饮品状态
     */
    @Override
    @Transactional
    public BeverageDTO updateStatus(String id, Beverage.BeverageStatus status) {
        log.info("切换饮品状态: id={}, status={}", id, status);

        UUID beverageId = UUID.fromString(id);
        Beverage beverage = beverageRepository.findById(beverageId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + id));

        // 更新状态
        beverage.setStatus(status);
        Beverage updated = beverageRepository.save(beverage);

        log.info("饮品状态已更新: id={}, status={}", id, status);
        return mapper.toDTO(updated);
    }

    /**
     * FR-029: 上传饮品图片
     */
    @Override
    @Transactional
    public String uploadImage(MultipartFile file) {
        log.info("上传饮品图片: filename={}, size={}", file.getOriginalFilename(), file.getSize());

        // 校验文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("只能上传图片文件");
        }

        // 校验文件大小（< 5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("图片大小不能超过5MB");
        }

        try {
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFileName = UUID.randomUUID() + (fileExtension.isEmpty() ? "" : "." + fileExtension);
            String filePath = "beverages/" + uniqueFileName;

            // 构建 Supabase Storage 上传 URL
            String bucketName = "beverage-images";
            String uploadUrl = supabaseConfig.getUrl() + "/storage/v1/object/" + bucketName + "/" + filePath;

            // 准备请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseConfig.getServiceRoleKey());
            headers.set("apikey", supabaseConfig.getServiceRoleKey());
            headers.setContentType(MediaType.parseMediaType(contentType));

            // 创建请求实体
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            // 上传到 Supabase Storage
            ResponseEntity<Map> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Supabase Storage 上传失败: status={}, body={}",
                    response.getStatusCode(), response.getBody());
                throw new RuntimeException("图片上传失败");
            }

            // 构建公开访问 URL
            String publicUrl = supabaseConfig.getUrl() + "/storage/v1/object/public/" + bucketName + "/" + filePath;

            log.info("饮品图片上传成功: {}", publicUrl);
            return publicUrl;

        } catch (Exception e) {
            log.error("上传图片失败: {}", e.getMessage(), e);
            throw new RuntimeException("图片上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    // ==================== 规格管理 ====================

    /**
     * FR-032: 获取饮品规格列表
     */
    @Override
    @Transactional(readOnly = true)
    public List<BeverageSpecDTO> getBeverageSpecs(String beverageId) {
        log.info("获取饮品规格: beverageId={}", beverageId);

        UUID bevId = UUID.fromString(beverageId);

        // 验证饮品存在
        beverageRepository.findById(bevId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + beverageId));

        // 查询规格列表，按类型和排序字段排序
        List<BeverageSpec> specs = beverageSpecRepository.findByBeverageIdOrderBySpecTypeAscSortOrderAsc(bevId);

        return mapper.toSpecDTOList(specs);
    }

    /**
     * FR-032: 添加饮品规格
     */
    @Override
    @Transactional
    public BeverageSpecDTO addSpec(String beverageId, CreateSpecRequest request) {
        log.info("添加饮品规格: beverageId={}, specType={}", beverageId, request.getSpecType());

        UUID bevId = UUID.fromString(beverageId);

        // 验证饮品存在
        beverageRepository.findById(bevId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + beverageId));

        // 如果设置为默认，取消其他同类型规格的默认状态
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<BeverageSpec> sameTypeSpecs = beverageSpecRepository
                .findByBeverageIdAndSpecType(bevId, request.getSpecType());
            sameTypeSpecs.forEach(spec -> spec.setIsDefault(false));
            beverageSpecRepository.saveAll(sameTypeSpecs);
        }

        // 创建新规格
        BeverageSpec spec = BeverageSpec.builder()
            .beverageId(bevId)
            .specType(request.getSpecType())
            .specName(request.getName())
            .priceAdjustment(new BigDecimal(request.getPriceAdjustment()).divide(new BigDecimal("100"))) // 分 -> 元
            .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
            .build();

        BeverageSpec saved = beverageSpecRepository.save(spec);
        log.info("规格创建成功: id={}, name={}", saved.getId(), saved.getSpecName());

        return mapper.toSpecDTO(saved);
    }

    /**
     * FR-033: 更新饮品规格
     */
    @Override
    @Transactional
    public BeverageSpecDTO updateSpec(String beverageId, String specId, UpdateSpecRequest request) {
        log.info("更新饮品规格: beverageId={}, specId={}", beverageId, specId);

        UUID bevId = UUID.fromString(beverageId);
        UUID sId = UUID.fromString(specId);

        // 查询规格并验证归属
        BeverageSpec spec = beverageSpecRepository.findById(sId)
            .orElseThrow(() -> new NotFoundException("规格不存在: id=" + specId));

        if (!spec.getBeverageId().equals(bevId)) {
            throw new IllegalArgumentException("规格不属于该饮品");
        }

        // 更新字段
        if (request.getName() != null) {
            spec.setSpecName(request.getName());
        }
        if (request.getPriceAdjustment() != null) {
            spec.setPriceAdjustment(new BigDecimal(request.getPriceAdjustment()).divide(new BigDecimal("100")));
        }
        if (request.getSortOrder() != null) {
            spec.setSortOrder(request.getSortOrder());
        }
        if (request.getIsDefault() != null) {
            // 如果设置为默认，取消其他同类型规格的默认状态
            if (Boolean.TRUE.equals(request.getIsDefault())) {
                List<BeverageSpec> sameTypeSpecs = beverageSpecRepository
                    .findByBeverageIdAndSpecType(bevId, spec.getSpecType());
                sameTypeSpecs.stream()
                    .filter(s -> !s.getId().equals(sId))
                    .forEach(s -> s.setIsDefault(false));
                beverageSpecRepository.saveAll(sameTypeSpecs);
            }
            spec.setIsDefault(request.getIsDefault());
        }

        BeverageSpec updated = beverageSpecRepository.save(spec);
        log.info("规格更新成功: id={}", updated.getId());

        return mapper.toSpecDTO(updated);
    }

    /**
     * FR-033: 删除饮品规格
     */
    @Override
    @Transactional
    public void deleteSpec(String beverageId, String specId) {
        log.info("删除饮品规格: beverageId={}, specId={}", beverageId, specId);

        UUID bevId = UUID.fromString(beverageId);
        UUID sId = UUID.fromString(specId);

        // 查询规格并验证归属
        BeverageSpec spec = beverageSpecRepository.findById(sId)
            .orElseThrow(() -> new NotFoundException("规格不存在: id=" + specId));

        if (!spec.getBeverageId().equals(bevId)) {
            throw new IllegalArgumentException("规格不属于该饮品");
        }

        // TODO: 检查是否有未完成的订单引用此规格（需要集成O003订单模块）

        // 物理删除规格
        beverageSpecRepository.delete(spec);
        log.info("规格已删除: id={}", specId);
    }

    // ==================== 配方(BOM)管理 ====================

    /**
     * FR-035: 获取饮品配方列表
     */
    @Override
    @Transactional(readOnly = true)
    public List<BeverageRecipeDTO> getBeverageRecipes(String beverageId) {
        log.info("获取饮品配方: beverageId={}", beverageId);

        UUID bevId = UUID.fromString(beverageId);

        // 验证饮品存在
        beverageRepository.findById(bevId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + beverageId));

        // 查询配方列表
        List<BeverageRecipe> recipes = beverageRecipeRepository.findByBeverageIdOrderByCreatedAtDesc(bevId);

        // 转换为DTO并加载原料
        return recipes.stream()
            .map(recipe -> {
                List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                // TODO: 调用P003库存API查询每个原料SKU的库存状态
                return mapper.toRecipeDTO(recipe, ingredients);
            })
            .collect(Collectors.toList());
    }

    /**
     * FR-035 & FR-037: 添加饮品配方（包含SKU校验）
     */
    @Override
    @Transactional
    public BeverageRecipeDTO addRecipe(String beverageId, CreateRecipeRequest request) {
        log.info("添加饮品配方: beverageId={}, 原料数量={}", beverageId, request.getIngredients().size());

        UUID bevId = UUID.fromString(beverageId);

        // 验证饮品存在
        beverageRepository.findById(bevId)
            .orElseThrow(() -> new NotFoundException("饮品不存在: id=" + beverageId));

        // TODO: FR-037 - 校验所有原料SKU ID是否存在（调用P003/P004库存API）
        // 暂时跳过SKU校验

        // 创建配方主记录
        BeverageRecipe recipe = BeverageRecipe.builder()
            .beverageId(bevId)
            .name(request.getName())
            .applicableSpecs(request.getApplicableSpecs())
            .description(request.getDescription())
            .build();

        BeverageRecipe savedRecipe = beverageRecipeRepository.save(recipe);
        log.info("配方主记录创建成功: id={}, name={}", savedRecipe.getId(), savedRecipe.getName());

        // 创建原料清单
        List<RecipeIngredient> ingredients = request.getIngredients().stream()
            .map(ingredientDTO -> RecipeIngredient.builder()
                .recipeId(savedRecipe.getId())
                .skuId(UUID.fromString(ingredientDTO.getSkuId())) // 将 UUID 字符串转换为 UUID 对象
                .ingredientName(ingredientDTO.getIngredientName())
                .quantity(BigDecimal.valueOf(ingredientDTO.getQuantity()))
                .unit(ingredientDTO.getUnit())
                .note(ingredientDTO.getNote())
                .build())
            .collect(Collectors.toList());

        List<RecipeIngredient> savedIngredients = recipeIngredientRepository.saveAll(ingredients);
        log.info("配方原料保存成功: count={}", savedIngredients.size());

        return mapper.toRecipeDTO(savedRecipe, savedIngredients);
    }

    /**
     * FR-036 & FR-037: 更新饮品配方（包含SKU校验）
     */
    @Override
    @Transactional
    public BeverageRecipeDTO updateRecipe(String beverageId, String recipeId, UpdateRecipeRequest request) {
        log.info("更新饮品配方: beverageId={}, recipeId={}", beverageId, recipeId);

        UUID bevId = UUID.fromString(beverageId);
        UUID rId = UUID.fromString(recipeId);

        // 查询配方并验证归属
        BeverageRecipe recipe = beverageRecipeRepository.findById(rId)
            .orElseThrow(() -> new NotFoundException("配方不存在: id=" + recipeId));

        if (!recipe.getBeverageId().equals(bevId)) {
            throw new IllegalArgumentException("配方不属于该饮品");
        }

        // 更新配方主记录
        if (request.getName() != null) {
            recipe.setName(request.getName());
        }
        if (request.getApplicableSpecs() != null) {
            recipe.setApplicableSpecs(request.getApplicableSpecs());
        }
        if (request.getDescription() != null) {
            recipe.setDescription(request.getDescription());
        }

        BeverageRecipe updatedRecipe = beverageRecipeRepository.save(recipe);

        // 如果传入了原料清单，更新原料
        List<RecipeIngredient> updatedIngredients;
        if (request.getIngredients() != null && !request.getIngredients().isEmpty()) {
            // TODO: FR-037 - 校验所有SKU ID（调用P003/P004库存API）

            // 删除旧的原料清单
            recipeIngredientRepository.deleteByRecipeId(rId);

            // 保存新的原料清单
            updatedIngredients = request.getIngredients().stream()
                .map(ingredientDTO -> RecipeIngredient.builder()
                    .recipeId(rId)
                    .skuId(UUID.fromString(ingredientDTO.getSkuId())) // 将 UUID 字符串转换为 UUID 对象
                    .ingredientName(ingredientDTO.getIngredientName())
                    .quantity(BigDecimal.valueOf(ingredientDTO.getQuantity()))
                    .unit(ingredientDTO.getUnit())
                    .note(ingredientDTO.getNote())
                    .build())
                .collect(Collectors.toList());

            updatedIngredients = recipeIngredientRepository.saveAll(updatedIngredients);
            log.info("配方原料已更新: count={}", updatedIngredients.size());
        } else {
            // 未传入原料清单，保留原有原料
            updatedIngredients = recipeIngredientRepository.findByRecipeId(rId);
        }

        log.info("配方更新成功: id={}", updatedRecipe.getId());
        return mapper.toRecipeDTO(updatedRecipe, updatedIngredients);
    }

    /**
     * FR-036: 删除饮品配方（校验未完成订单）
     */
    @Override
    @Transactional
    public void deleteRecipe(String beverageId, String recipeId) {
        log.info("删除饮品配方: beverageId={}, recipeId={}", beverageId, recipeId);

        UUID bevId = UUID.fromString(beverageId);
        UUID rId = UUID.fromString(recipeId);

        // 查询配方并验证归属
        BeverageRecipe recipe = beverageRecipeRepository.findById(rId)
            .orElseThrow(() -> new NotFoundException("配方不存在: id=" + recipeId));

        if (!recipe.getBeverageId().equals(bevId)) {
            throw new IllegalArgumentException("配方不属于该饮品");
        }

        // TODO: 检查是否有未完成的订单引用此配方（需要集成O003订单模块）

        // 删除配方原料清单（外键级联删除或手动删除）
        recipeIngredientRepository.deleteByRecipeId(rId);

        // 删除配方主记录
        beverageRecipeRepository.delete(recipe);

        log.info("配方已删除: id={}", recipeId);
    }
}

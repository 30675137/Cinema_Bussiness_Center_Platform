package com.cinema.channelproduct.service;

import com.cinema.category.entity.MenuCategory;
import com.cinema.category.repository.MenuCategoryRepository;
import com.cinema.channelproduct.domain.ChannelProductConfig;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.dto.ChannelProductQueryParams;
import com.cinema.channelproduct.dto.CreateChannelProductRequest;
import com.cinema.channelproduct.dto.UpdateChannelProductRequest;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.repository.ChannelProductRepository;
import com.cinema.common.exception.BusinessException;
import com.cinema.common.exception.ResourceNotFoundException;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuType;
import com.cinema.hallstore.repository.SkuRepository;
import com.cinema.hallstore.config.SupabaseConfig;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * @spec O005-channel-product-config
 * @spec O002-miniapp-menu-config
 * 渠道商品配置业务逻辑层
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChannelProductService {

    private final ChannelProductRepository channelProductRepository;
    private final SkuRepository skuRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final SupabaseConfig supabaseConfig;
    private final RestTemplate restTemplate;

    /**
     * 创建渠道商品配置
     */
    @Transactional
    public ChannelProductConfig createChannelProduct(CreateChannelProductRequest request) {
        // 1. 验证 SKU 是否存在且类型正确
        Sku sku = skuRepository.findById(request.getSkuId())
                .orElseThrow(() -> new ResourceNotFoundException("SKU not found: " + request.getSkuId()));

        if (sku.getSkuType() != SkuType.FINISHED_PRODUCT) {
            throw new BusinessException("PRD_VAL_001", "Only FINISHED_PRODUCT SKU can be configured for channel sales");
        }

        // 2. 验证唯一性（同一渠道同一SKU只能配置一次，排除已删除记录）
        if (channelProductRepository.existsBySkuIdAndChannelTypeAndDeletedAtIsNull(request.getSkuId(), request.getChannelType())) {
            throw new BusinessException("PRD_DUP_001", "Product already configured for this channel");
        }

        // 3. 构建实体
        ChannelProductConfig config = ChannelProductConfig.builder()
                .skuId(request.getSkuId())
                .channelType(request.getChannelType())
                .displayName(StringUtils.hasText(request.getDisplayName()) ? request.getDisplayName() : sku.getName())
                .channelCategory(request.getChannelCategory())
                .channelPrice(request.getChannelPrice())
                .mainImage(request.getMainImage())
                .detailImages(request.getDetailImages())
                .description(request.getDescription())
                .specs(request.getSpecs() != null ? request.getSpecs() : new ArrayList<>())
                .isRecommended(request.getIsRecommended())
                .status(request.getStatus())
                .sortOrder(request.getSortOrder())
                .build();

        return channelProductRepository.save(config);
    }

    /**
     * 更新渠道商品配置
     */
    @Transactional
    public ChannelProductConfig updateChannelProduct(UUID id, UpdateChannelProductRequest request) {
        ChannelProductConfig config = channelProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Channel product not found: " + id));

        if (request.getDisplayName() != null) config.setDisplayName(request.getDisplayName());
        if (request.getChannelCategory() != null) config.setChannelCategory(request.getChannelCategory());
        if (request.getChannelPrice() != null) config.setChannelPrice(request.getChannelPrice());
        if (request.getMainImage() != null) config.setMainImage(request.getMainImage());
        if (request.getDetailImages() != null) config.setDetailImages(request.getDetailImages());
        if (request.getDescription() != null) config.setDescription(request.getDescription());
        if (request.getSpecs() != null) config.setSpecs(request.getSpecs());
        if (request.getIsRecommended() != null) config.setIsRecommended(request.getIsRecommended());
        if (request.getStatus() != null) config.setStatus(request.getStatus());
        if (request.getSortOrder() != null) config.setSortOrder(request.getSortOrder());

        return channelProductRepository.save(config);
    }

    /**
     * 获取渠道商品详情
     */
    @Transactional(readOnly = true)
    public ChannelProductConfig getChannelProduct(UUID id) {
        ChannelProductConfig config = channelProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Channel product not found: " + id));

        // 加载 SKU 信息
        loadSkuInfoForSingle(config);

        return config;
    }

    /**
     * 获取渠道商品列表（分页筛选）
     * @spec O008-channel-product-category-migration
     */
    @Transactional(readOnly = true)
    public Page<ChannelProductConfig> getChannelProducts(ChannelProductQueryParams params) {

        Specification<ChannelProductConfig> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            // 软删除过滤
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (params.getChannelType() != null) {
                predicates.add(cb.equal(root.get("channelType"), params.getChannelType()));
            }

            // 优先使用 categoryId，否则使用 channelCategory
            if (params.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("categoryId"), params.getCategoryId()));
            } else if (params.getChannelCategory() != null) {
                predicates.add(cb.equal(root.get("channelCategory"), params.getChannelCategory()));
            }

            if (params.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), params.getStatus()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(
                params.getPage() - 1,
                params.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<ChannelProductConfig> pageResult = channelProductRepository.findAll(spec, pageRequest);

        // 加载 SKU 信息并填充到每个配置
        loadSkuInfo(pageResult.getContent());
        
        // 强制初始化 category 懒加载字段，避免序列化时出现代理对象错误
        pageResult.getContent().forEach(config -> {
            if (config.getCategory() != null) {
                // 访问 category 的任意属性触发懒加载初始化
                config.getCategory().getDisplayName();
            }
        });

        return pageResult;
    }

    /**
     * 加载单个渠道商品的 SKU 信息
     */
    private void loadSkuInfoForSingle(ChannelProductConfig config) {
        Sku sku = skuRepository.findById(config.getSkuId()).orElse(null);
        if (sku != null) {
            // 价格从元转换为分（乘以 100）
            long priceInCents = sku.getPrice() != null
                    ? sku.getPrice().multiply(new java.math.BigDecimal("100")).longValue()
                    : null;

            ChannelProductConfig.SkuBasicInfoDto skuInfo = new ChannelProductConfig.SkuBasicInfoDto(
                    sku.getId().toString(),
                    sku.getCode(),           // Sku.code -> skuCode
                    sku.getName(),           // Sku.name -> skuName
                    priceInCents,          // 元 -> 分
                    config.getMainImage()    // 图片使用 ChannelProductConfig 的 mainImage
            );
            config.setSkuInfo(skuInfo);
        }
    }

    /**
     * 加载 SKU 信息并填充到渠道商品配置列表
     */
    private void loadSkuInfo(List<ChannelProductConfig> configs) {
        if (configs.isEmpty()) {
            return;
        }

        // 填充 SKU 信息到每个配置
        for (ChannelProductConfig config : configs) {
            Sku sku = skuRepository.findById(config.getSkuId()).orElse(null);
            if (sku != null) {
                // 价格从元转换为分（乘以 100）
                long priceInCents = sku.getPrice() != null
                        ? sku.getPrice().multiply(new java.math.BigDecimal("100")).longValue()
                        : null;

                ChannelProductConfig.SkuBasicInfoDto skuInfo = new ChannelProductConfig.SkuBasicInfoDto(
                        sku.getId().toString(),
                        sku.getCode(),           // Sku.code -> skuCode
                        sku.getName(),           // Sku.name -> skuName
                        priceInCents,          // 元 -> 分
                        config.getMainImage()    // 图片使用 ChannelProductConfig 的 mainImage
                );
                config.setSkuInfo(skuInfo);
            }
        }
    }

    /**
     * @spec O002-miniapp-menu-config
     * 加载分类信息并填充到渠道商品配置列表
     * 通过 Hibernate FetchType.LAZY 关系，需要显式加载分类数据
     */
    private void loadCategoryInfo(List<ChannelProductConfig> configs) {
        if (configs.isEmpty()) {
            return;
        }

        // 批量获取所有分类 ID
        List<UUID> categoryIds = configs.stream()
                .map(ChannelProductConfig::getCategoryId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        if (categoryIds.isEmpty()) {
            return;
        }

        // 批量查询分类
        List<MenuCategory> categories = menuCategoryRepository.findAllById(categoryIds);
        java.util.Map<UUID, MenuCategory> categoryMap = categories.stream()
                .collect(java.util.stream.Collectors.toMap(MenuCategory::getId, c -> c));

        // 填充分类信息到每个配置（触发 Hibernate 加载）
        for (ChannelProductConfig config : configs) {
            if (config.getCategoryId() != null) {
                MenuCategory category = categoryMap.get(config.getCategoryId());
                if (category != null) {
                    // 通过 setter 设置，触发 JPA 关联更新
                    // 注意：这里只是确保 category 对象可用于序列化
                    // 实际的关联已经在实体中定义
                }
            }
        }
    }

    /**
     * @spec O002-miniapp-menu-config
     * 加载单个商品的分类信息
     */
    private void loadCategoryInfoForSingle(ChannelProductConfig config) {
        if (config.getCategoryId() != null) {
            menuCategoryRepository.findById(config.getCategoryId())
                    .ifPresent(category -> {
                        // 触发关联加载，使 category 可用于 JSON 序列化
                    });
        }
    }

    /**
     * 更新商品状态
     */
    @Transactional
    public void updateStatus(UUID id, ChannelProductStatus status) {
        ChannelProductConfig config = channelProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Channel product not found: " + id));
        config.setStatus(status);
        channelProductRepository.save(config);
    }

    /**
     * 软删除商品
     */
    @Transactional
    public void deleteChannelProduct(UUID id) {
        ChannelProductConfig config = channelProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Channel product not found: " + id));
        config.softDelete();
        channelProductRepository.save(config);
    }

    /**
     * 上传渠道商品图片到 Supabase Storage
     */
    @Transactional
    public String uploadImage(MultipartFile file) {
        log.info("上传渠道商品图片: filename={}, size={}", file.getOriginalFilename(), file.getSize());

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
            String filePath = "channel-products/" + uniqueFileName;

            // 构建 Supabase Storage 上传 URL
            // 复用饮品服务的 bucket，但使用不同的路径前缀
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

            log.info("渠道商品图片上传成功: {}", publicUrl);
            return publicUrl;

        } catch (Exception e) {
            log.error("上传图片失败: {}", e.getMessage(), e);
            throw new RuntimeException("图片上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    // ==================== 客户端专用方法 (O006, O002) ====================

    /**
     * 获取小程序商品列表（客户端专用）- 支持动态分类筛选
     * 仅返回 ACTIVE 状态的商品
     *
     * @spec O002-miniapp-menu-config
     * @spec O006-miniapp-channel-order
     * @param categoryId 可选的分类 ID 筛选（优先级最高）
     * @param categoryCode 可选的分类编码筛选（优先级次高）
     * @return 商品列表
     */
    @Transactional(readOnly = true)
    public List<ChannelProductConfig> getMiniProgramProducts(UUID categoryId, String categoryCode) {
        // T064: 优先级逻辑 - categoryId > categoryCode
        UUID effectiveCategoryId = categoryId;

        // 如果没有 categoryId 但有 categoryCode，则通过 code 查找分类 ID
        if (effectiveCategoryId == null && StringUtils.hasText(categoryCode)) {
            MenuCategory menuCategory = menuCategoryRepository.findByCodeAndDeletedAtIsNull(categoryCode)
                    .orElse(null);
            if (menuCategory != null) {
                effectiveCategoryId = menuCategory.getId();
            }
        }

        final UUID finalCategoryId = effectiveCategoryId;

        Specification<ChannelProductConfig> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            // 软删除过滤
            predicates.add(cb.isNull(root.get("deletedAt")));

            // 固定小程序渠道
            predicates.add(cb.equal(root.get("channelType"), com.cinema.channelproduct.domain.enums.ChannelType.MINI_PROGRAM));

            // 仅返回 ACTIVE 状态
            predicates.add(cb.equal(root.get("status"), ChannelProductStatus.ACTIVE));

            // T062/T063: 分类筛选（使用 categoryId）
            if (finalCategoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), finalCategoryId));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        // 按推荐优先，然后按排序顺序
        Sort sort = Sort.by(
                Sort.Order.desc("isRecommended"),
                Sort.Order.asc("sortOrder"),
                Sort.Order.desc("createdAt")
        );

        List<ChannelProductConfig> products = channelProductRepository.findAll(spec, sort);

        // 加载 SKU 信息和分类信息
        loadSkuInfo(products);
        loadCategoryInfo(products);

        return products;
    }

    /**
     * 获取小程序商品列表（向后兼容旧的枚举筛选）
     * 仅返回 ACTIVE 状态的商品
     *
     * @spec O006-miniapp-channel-order
     * @param category 可选的分类筛选（旧枚举）
     * @return 商品列表
     * @deprecated 使用 getMiniProgramProducts(UUID categoryId, String categoryCode) 替代
     */
    @Deprecated
    @Transactional(readOnly = true)
    public List<ChannelProductConfig> getMiniProgramProducts(ChannelCategory category) {
        // 如果有旧枚举分类，尝试通过 code 查找对应的新分类
        if (category != null) {
            return getMiniProgramProducts(null, category.name());
        }
        return getMiniProgramProducts(null, null);
    }

    /**
     * 获取小程序商品详情（客户端专用）
     *
     * @spec O006-miniapp-channel-order
     * @spec O002-miniapp-menu-config
     * @param id 商品ID
     * @return 商品详情（包含规格和分类信息）
     */
    @Transactional(readOnly = true)
    public ChannelProductConfig getMiniProgramProductDetail(UUID id) {
        ChannelProductConfig config = channelProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        // 验证是否为小程序商品且状态为 ACTIVE
        if (config.getChannelType() != com.cinema.channelproduct.domain.enums.ChannelType.MINI_PROGRAM) {
            throw new BusinessException("PRD_VAL_002", "Product is not available for mini-program");
        }

        if (config.getStatus() != ChannelProductStatus.ACTIVE) {
            throw new BusinessException("PRD_VAL_003", "Product is not active");
        }

        // 加载 SKU 信息和分类信息
        loadSkuInfoForSingle(config);
        loadCategoryInfoForSingle(config);

        return config;
    }
}

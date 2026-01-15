package com.cinema.channelproduct.controller;

import com.cinema.category.entity.MenuCategory;
import com.cinema.channelproduct.domain.ChannelProductConfig;
import com.cinema.channelproduct.domain.ChannelProductSpec;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.dto.ChannelProductDTO;
import com.cinema.channelproduct.dto.ChannelProductDetailDTO;
import com.cinema.channelproduct.service.ChannelProductService;
import com.cinema.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @spec O006-miniapp-channel-order
 * @spec O002-miniapp-menu-config
 * 渠道商品客户端 API 控制器
 *
 * 提供以下端点:
 * - GET /api/client/channel-products/mini-program - 获取小程序商品列表
 * - GET /api/client/channel-products/mini-program/{id} - 获取小程序商品详情
 * - GET /api/client/channel-products/mini-program/{id}/specs - 获取小程序商品规格
 *
 * 注意:
 * - 此控制器仅提供只读查询接口
 * - 不需要认证即可访问（公开API）
 * - 仅返回状态为 ACTIVE 的小程序渠道商品
 */
@Slf4j
@RestController
@RequestMapping("/api/client/channel-products")
@RequiredArgsConstructor
public class ChannelProductClientController {

    private final ChannelProductService channelProductService;

    /**
     * @spec O002-miniapp-menu-config
     * 获取小程序商品列表
     *
     * 筛选参数优先级: categoryId > category (code)
     *
     * @param categoryId 分类 ID 筛选（可选，UUID 格式，优先级最高）
     * @param category 分类编码筛选（可选，支持新分类编码和旧枚举值）
     * @return 商品列表响应
     */
    @GetMapping("/mini-program")
    public ResponseEntity<ApiResponse<List<ChannelProductDTO>>> getMiniProgramProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String category) {

        log.info("获取小程序商品列表, categoryId={}, category={}", categoryId, category);

        List<ChannelProductConfig> configs = channelProductService.getMiniProgramProducts(categoryId, category);

        // 转换为 DTO
        List<ChannelProductDTO> products = configs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        log.info("返回 {} 个商品", products.size());

        return ResponseEntity.ok(ApiResponse.success(products));
    }

    /**
     * 获取小程序商品详情
     *
     * @param id 商品ID
     * @return 商品详情响应
     */
    @GetMapping("/mini-program/{id}")
    public ResponseEntity<ApiResponse<ChannelProductDetailDTO>> getMiniProgramProductDetail(
            @PathVariable UUID id) {

        log.info("获取小程序商品详情, id={}", id);

        ChannelProductConfig config = channelProductService.getMiniProgramProductDetail(id);

        ChannelProductDetailDTO detail = convertToDetailDTO(config);

        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    /**
     * 获取小程序商品规格列表
     *
     * @param id 商品ID
     * @return 规格列表响应
     */
    @GetMapping("/mini-program/{id}/specs")
    public ResponseEntity<ApiResponse<List<ChannelProductSpec>>> getMiniProgramProductSpecs(
            @PathVariable UUID id) {

        log.info("获取小程序商品规格, id={}", id);

        ChannelProductConfig config = channelProductService.getMiniProgramProductDetail(id);

        List<ChannelProductSpec> specs = config.getSpecs();

        log.info("返回 {} 个规格", specs.size());

        return ResponseEntity.ok(ApiResponse.success(specs));
    }

    // ==================== 私有辅助方法 ====================

    /**
     * @spec O002-miniapp-menu-config
     * 转换 Entity 为列表 DTO（包含分类信息）
     */
    private ChannelProductDTO convertToDTO(ChannelProductConfig config) {
        ChannelProductDTO.ChannelProductDTOBuilder builder = ChannelProductDTO.builder()
                .id(config.getId().toString())
                .skuId(config.getSkuId().toString())
                .channelCategory(config.getChannelCategory())
                .displayName(config.getDisplayName())
                .basePrice(config.getChannelPrice())
                .mainImage(config.getMainImage())
                .detailImages(config.getDetailImages() != null
                    ? config.getDetailImages().toArray(new String[0])
                    : new String[0])
                .description(config.getDescription())
                .status(config.getStatus())
                .isRecommended(config.getIsRecommended())
                .sortOrder(config.getSortOrder())
                .stockStatus("IN_STOCK"); // 预留字段，未来实现库存查询

        // 填充分类信息
        if (config.getCategoryId() != null) {
            builder.categoryId(config.getCategoryId().toString());
        }

        MenuCategory category = config.getCategory();
        if (category != null) {
            builder.category(ChannelProductDTO.CategoryInfo.builder()
                    .id(category.getId().toString())
                    .code(category.getCode())
                    .displayName(category.getDisplayName())
                    .build());
        }

        return builder.build();
    }

    /**
     * @spec O002-miniapp-menu-config
     * 转换 Entity 为详情 DTO（包含分类信息）
     */
    private ChannelProductDetailDTO convertToDetailDTO(ChannelProductConfig config) {
        ChannelProductDetailDTO.ChannelProductDetailDTOBuilder builder = ChannelProductDetailDTO.builder()
                .id(config.getId().toString())
                .skuId(config.getSkuId().toString())
                .channelCategory(config.getChannelCategory())
                .displayName(config.getDisplayName())
                .basePrice(config.getChannelPrice())
                .mainImage(config.getMainImage())
                .detailImages(config.getDetailImages() != null
                    ? config.getDetailImages().toArray(new String[0])
                    : new String[0])
                .description(config.getDescription())
                .status(config.getStatus())
                .isRecommended(config.getIsRecommended())
                .sortOrder(config.getSortOrder())
                .stockStatus("IN_STOCK") // 预留字段
                .specs(config.getSpecs());

        // 填充分类信息
        if (config.getCategoryId() != null) {
            builder.categoryId(config.getCategoryId().toString());
        }

        MenuCategory category = config.getCategory();
        if (category != null) {
            builder.category(ChannelProductDetailDTO.CategoryInfo.builder()
                    .id(category.getId().toString())
                    .code(category.getCode())
                    .displayName(category.getDisplayName())
                    .build());
        }

        return builder.build();
    }
}

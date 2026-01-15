package com.cinema.channelproduct.dto;

import com.cinema.channelproduct.domain.ChannelProductSpec;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * @spec O005-channel-product-config
 * 创建渠道商品配置请求
 */
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateChannelProductRequest {

    /**
     * SKU ID
     */
    @NotNull(message = "SKU ID不能为空")
    private UUID skuId;

    /**
     * 渠道类型（默认为 MINI_PROGRAM）
     */
    @Builder.Default
    private ChannelType channelType = ChannelType.MINI_PROGRAM;

    /**
     * 渠道展示名称
     */
    private String displayName;

    /**
     * @spec O008-channel-product-category-migration
     * 菜单分类 ID（关联 menu_category.id）
     */
    @NotNull(message = "菜单分类不能为空")
    private UUID categoryId;

    /**
     * 渠道价格（分）
     */
    private Long channelPrice;

    /**
     * 主图 URL
     */
    private String mainImage;

    /**
     * 详情图 URL 数组
     */
    private List<String> detailImages;

    /**
     * 描述
     */
    private String description;

    /**
     * 规格配置
     */
    private List<ChannelProductSpec> specs;

    /**
     * 是否推荐
     */
    @Builder.Default
    private Boolean isRecommended = false;

    /**
     * 初始状态
     */
    @Builder.Default
    private ChannelProductStatus status = ChannelProductStatus.ACTIVE;

    /**
     * 排序序号
     */
    @Builder.Default
    private Integer sortOrder = 0;
}

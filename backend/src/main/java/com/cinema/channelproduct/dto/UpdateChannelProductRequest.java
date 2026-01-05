package com.cinema.channelproduct.dto;

import com.cinema.channelproduct.domain.ChannelProductSpec;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * @spec O005-channel-product-config
 * 更新渠道商品配置请求
 */
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateChannelProductRequest {

    private String displayName;
    /**
     * @spec O008-channel-product-category-migration
     * 菜单分类 ID
     */
    private UUID categoryId;
    private Long channelPrice;
    private String mainImage;
    private List<String> detailImages;
    private String description;
    private List<ChannelProductSpec> specs;
    private Boolean isRecommended;
    private ChannelProductStatus status;
    private Integer sortOrder;
}

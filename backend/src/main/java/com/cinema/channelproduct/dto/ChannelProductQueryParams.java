package com.cinema.channelproduct.dto;

import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * 渠道商品查询参数
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelProductQueryParams {
    private ChannelType channelType;
    
    /**
     * @deprecated 使用 categoryId 替代
     */
    @Deprecated
    private ChannelCategory channelCategory;
    
    /**
     * @spec O008-channel-product-category-migration
     * 分类 ID（关联 menu_category.id）
     */
    private UUID categoryId;
    
    private ChannelProductStatus status;
    private String keyword;
    @Builder.Default
    private int page = 1;
    @Builder.Default
    private int size = 20;
}

package com.cinema.channelproduct.dto;

import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @spec O005-channel-product-config
 * 渠道商品查询参数
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelProductQueryParams {
    private ChannelType channelType;
    private ChannelCategory channelCategory;
    private ChannelProductStatus status;
    private String keyword;
    @Builder.Default
    private int page = 1;
    @Builder.Default
    private int size = 20;
}

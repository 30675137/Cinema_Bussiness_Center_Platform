/**
 * @spec O006-miniapp-channel-order
 * 渠道商品详情客户端 DTO
 */
package com.cinema.channelproduct.dto;

import com.cinema.channelproduct.domain.ChannelProductSpec;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 渠道商品详情 DTO
 * 对应前端类型: miniapp-ordering/src/types/channelProduct.ts - ChannelProductDTO (完整版)
 *
 * 使用场景: 小程序商品详情页
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelProductDetailDTO {

    /**
     * 渠道商品配置 ID (UUID字符串)
     */
    private String id;

    /**
     * 关联的 SKU ID (UUID字符串)
     */
    private String skuId;

    /**
     * 渠道分类
     */
    private ChannelCategory channelCategory;

    /**
     * 展示名称
     */
    private String displayName;

    /**
     * 渠道价格（单位：分）
     */
    private Long basePrice;

    /**
     * 主图 URL
     */
    private String mainImage;

    /**
     * 详情图 URL 数组
     */
    private String[] detailImages;

    /**
     * 商品描述
     */
    private String description;

    /**
     * 商品状态
     */
    private ChannelProductStatus status;

    /**
     * 是否推荐
     */
    private Boolean isRecommended;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 库存状态（预留字段）
     */
    private String stockStatus;

    /**
     * 规格配置列表
     */
    private List<ChannelProductSpec> specs;
}

/**
 * @spec O006-miniapp-channel-order
 * @spec O002-miniapp-menu-config
 * 渠道商品客户端 DTO - 用于小程序商品列表展示
 */
package com.cinema.channelproduct.dto;

import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 渠道商品列表 DTO
 * 对应前端类型: miniapp-ordering/src/types/channelProduct.ts - ChannelProductDTO
 *
 * 使用场景: 小程序商品菜单列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelProductDTO {

    /**
     * 渠道商品配置 ID (UUID字符串)
     */
    private String id;

    /**
     * 关联的 SKU ID (UUID字符串)
     */
    private String skuId;

    /**
     * 渠道分类（旧枚举，保留向后兼容）
     * @deprecated 使用 category 对象替代
     */
    @Deprecated
    private ChannelCategory channelCategory;

    /**
     * @spec O002-miniapp-menu-config
     * 分类 ID (UUID字符串)
     */
    private String categoryId;

    /**
     * @spec O002-miniapp-menu-config
     * 分类信息（嵌套对象）
     */
    private CategoryInfo category;

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
     * 库存状态（预留字段，未来扩展）
     */
    private String stockStatus;

    /**
     * @spec O002-miniapp-menu-config
     * 分类信息嵌套 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        /**
         * 分类 ID
         */
        private String id;

        /**
         * 分类编码
         */
        private String code;

        /**
         * 显示名称
         */
        private String displayName;
    }
}

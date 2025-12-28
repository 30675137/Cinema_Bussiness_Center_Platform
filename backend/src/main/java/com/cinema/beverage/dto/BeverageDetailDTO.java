/**
 * @spec O003-beverage-order
 * 饮品详情数据传输对象
 */
package com.cinema.beverage.dto;

import java.util.List;

import com.cinema.beverage.entity.Beverage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 饮品详情DTO - 用于B端/C端饮品详情展示
 *
 * 对应 spec: O003-beverage-order
 * 使用场景: B端饮品管理详情页、C端饮品详情页，包含完整信息、规格列表和配方列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageDetailDTO {

    /**
     * 饮品ID (UUID字符串)
     */
    private String id;

    /**
     * 饮品名称
     */
    private String name;

    /**
     * 饮品描述
     */
    private String description;

    /**
     * 饮品分类
     */
    private Beverage.BeverageCategory category;

    /**
     * 主图URL
     */
    private String mainImage;

    /**
     * 详情图片列表
     */
    private List<String> detailImages;

    /**
     * 基础价格（单位：分）
     */
    private Long basePrice;

    /**
     * 饮品状态
     */
    private Beverage.BeverageStatus status;

    /**
     * 是否推荐
     */
    private Boolean isRecommended;

    /**
     * 创建时间
     */
    private String createdAt;

    /**
     * 更新时间
     */
    private String updatedAt;

    /**
     * 可选规格列表（按规格类型分组）
     */
    private List<BeverageSpecDTO> specs;

    /**
     * 配方列表
     */
    private List<BeverageRecipeDTO> recipes;

}

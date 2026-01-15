package com.cinema.channelproduct.repository;

import com.cinema.channelproduct.domain.ChannelProductConfig;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

/**
 * @spec O005-channel-product-config
 * @spec O002-miniapp-menu-config
 * 渠道商品配置数据访问层
 */
@Repository
public interface ChannelProductRepository extends JpaRepository<ChannelProductConfig, UUID>, JpaSpecificationExecutor<ChannelProductConfig> {

    /**
     * 检查同一 SKU 在同一渠道是否已配置（排除软删除记录）
     *
     * @param skuId SKU ID
     * @param channelType 渠道类型
     * @return 是否存在未删除的配置
     */
    boolean existsBySkuIdAndChannelTypeAndDeletedAtIsNull(UUID skuId, ChannelType channelType);

    /**
     * 根据 SKU ID 和渠道类型查找配置
     *
     * @param skuId SKU ID
     * @param channelType 渠道类型
     * @return 配置信息
     */
    Optional<ChannelProductConfig> findBySkuIdAndChannelType(UUID skuId, ChannelType channelType);

    /**
     * 根据渠道类型查询
     */
    Page<ChannelProductConfig> findByChannelType(ChannelType channelType, Pageable pageable);

    /**
     * 根据渠道类型和状态查询
     */
    Page<ChannelProductConfig> findByChannelTypeAndStatus(ChannelType channelType, ChannelProductStatus status, Pageable pageable);

    /**
     * 根据渠道类型和分类查询
     */
    Page<ChannelProductConfig> findByChannelTypeAndChannelCategory(ChannelType channelType, ChannelCategory channelCategory, Pageable pageable);

    /**
     * 查找所有关联的 SKU ID
     *
     * @param ids 渠道商品配置 ID 列表
     * @return SKU ID 列表
     */
    @Query("SELECT DISTINCT c.skuId FROM ChannelProductConfig c WHERE c.id IN :ids AND c.deletedAt IS NULL")
    List<UUID> findDistinctSkuIdsByIdInAndDeletedAtIsNull(@Param("ids") List<UUID> ids);

    /**
     * @spec O002-miniapp-menu-config
     * 统计分类下的商品数量
     *
     * @param categoryId 分类 ID
     * @return 商品数量
     */
    @Query("SELECT COUNT(c) FROM ChannelProductConfig c WHERE c.categoryId = :categoryId AND c.deletedAt IS NULL")
    int countByCategoryId(@Param("categoryId") UUID categoryId);

    /**
     * @spec O002-miniapp-menu-config
     * 批量更新商品分类（用于删除分类时迁移商品）
     *
     * @param oldCategoryId 原分类 ID
     * @param newCategoryId 新分类 ID
     */
    @Modifying
    @Query("UPDATE ChannelProductConfig c SET c.categoryId = :newCategoryId WHERE c.categoryId = :oldCategoryId AND c.deletedAt IS NULL")
    void updateCategoryId(@Param("oldCategoryId") UUID oldCategoryId, @Param("newCategoryId") UUID newCategoryId);

    /**
     * @spec O002-miniapp-menu-config
     * 根据分类 ID 查询商品
     *
     * @param categoryId 分类 ID
     * @param pageable 分页参数
     * @return 商品列表
     */
    Page<ChannelProductConfig> findByCategoryIdAndDeletedAtIsNull(@Param("categoryId") UUID categoryId, Pageable pageable);
}

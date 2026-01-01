package com.cinema.channelproduct.repository;

import com.cinema.channelproduct.domain.ChannelProductConfig;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * @spec O005-channel-product-config
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
}

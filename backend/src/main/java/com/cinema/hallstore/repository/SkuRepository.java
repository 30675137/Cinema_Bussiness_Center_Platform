package com.cinema.hallstore.repository;

import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * SKU Repository
 * 通过 JPA 实现 SKU 数据的查询和 CRUD 操作
 *
 * 重构说明：从 Supabase REST API 改为 JPA 实现
 *
 * @since P001-sku-master-data
 */
@Repository
public class SkuRepository {

    private final SkuJpaRepository jpaRepository;

    public SkuRepository(SkuJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    /**
     * 查询 SKU 列表，支持按类型、状态、门店筛选
     */
    public List<Sku> findAll(SkuType skuType, SkuStatus status, String storeId, String keyword) {
        // 使用 JPA 综合查询
        List<Sku> results = jpaRepository.findAllWithFilters(skuType, status, keyword);

        // 按门店范围筛选（如果指定了门店）
        if (storeId != null && !storeId.trim().isEmpty()) {
            return results.stream()
                    .filter(sku -> sku.isAvailableInStore(storeId))
                    .toList();
        }

        return results;
    }

    /**
     * 按 ID 查询 SKU
     */
    public Optional<Sku> findById(UUID id) {
        return jpaRepository.findById(id);
    }

    /**
     * 按编码查询 SKU（检查唯一性）
     */
    public Optional<Sku> findByCode(String code) {
        return jpaRepository.findByCode(code);
    }

    /**
     * 按 SKU 类型查询
     */
    public List<Sku> findBySkuType(SkuType skuType) {
        return jpaRepository.findBySkuType(skuType);
    }

    /**
     * 按状态查询
     */
    public List<Sku> findByStatus(SkuStatus status) {
        return jpaRepository.findByStatus(status);
    }

    /**
     * 创建或更新 SKU
     */
    public Sku save(Sku sku) {
        return jpaRepository.save(sku);
    }

    /**
     * 更新 SKU
     */
    public Sku update(Sku sku) {
        return jpaRepository.save(sku);
    }

    /**
     * 删除 SKU
     */
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }

    /**
     * 检查编码是否存在
     */
    public boolean existsByCode(String code) {
        return jpaRepository.existsByCode(code);
    }

    /**
     * 检查编码是否存在（排除指定 ID）
     */
    public boolean existsByCodeAndIdNot(String code, UUID excludeId) {
        return jpaRepository.existsByCodeAndIdNot(code, excludeId);
    }

    /**
     * 删除 SKU
     */
    public void delete(UUID id) {
        deleteById(id);
    }

    /**
     * 删除 SKU 并立即刷新（用于立即触发数据库约束检查）
     */
    public void deleteAndFlush(UUID id) {
        jpaRepository.deleteById(id);
        jpaRepository.flush();
    }
}

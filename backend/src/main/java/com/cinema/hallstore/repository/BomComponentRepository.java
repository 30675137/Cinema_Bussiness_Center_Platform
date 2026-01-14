package com.cinema.hallstore.repository;

import com.cinema.hallstore.domain.BomComponent;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * BOM组件 Repository
 * 通过 JPA 实现BOM组件数据的查询和CRUD操作
 *
 * @since P001-sku-master-data
 */
@Repository
public class BomComponentRepository {

    private final BomComponentJpaRepository jpaRepository;

    public BomComponentRepository(BomComponentJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    /**
     * 按成品ID查询BOM组件列表
     */
    public List<BomComponent> findByFinishedProductId(UUID finishedProductId) {
        return jpaRepository.findByFinishedProductIdOrderBySortOrderAsc(finishedProductId);
    }

    /**
     * 按成品ID查询BOM组件列表，同时加载组件SKU信息
     */
    public List<BomComponent> findByFinishedProductIdWithComponent(UUID finishedProductId) {
        return jpaRepository.findByFinishedProductIdWithComponent(finishedProductId);
    }

    /**
     * 按组件ID查询引用该组件的BOM列表(检查依赖)
     */
    public List<BomComponent> findByComponentId(UUID componentId) {
        return jpaRepository.findByComponentId(componentId);
    }

    /**
     * 创建或更新BOM组件
     */
    public BomComponent save(BomComponent component) {
        return jpaRepository.save(component);
    }

    /**
     * 批量创建或更新BOM组件
     */
    public List<BomComponent> saveAll(List<BomComponent> components) {
        return jpaRepository.saveAll(components);
    }

    /**
     * 删除成品的所有BOM组件
     */
    @Transactional
    public void deleteByFinishedProductId(UUID finishedProductId) {
        jpaRepository.deleteByFinishedProductId(finishedProductId);
    }

    /**
     * 删除指定BOM组件
     */
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}

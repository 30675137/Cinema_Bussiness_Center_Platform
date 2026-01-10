package com.cinema.hallstore.repository;

import com.cinema.hallstore.domain.BomComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * BOM组件 JPA Repository
 * 使用 Spring Data JPA 实现 BOM 组件数据的查询和 CRUD 操作
 *
 * @since P001-sku-master-data
 */
@Repository
public interface BomComponentJpaRepository extends JpaRepository<BomComponent, UUID> {

    /**
     * 按成品ID查询BOM组件列表（不加载关联实体）
     */
    List<BomComponent> findByFinishedProductIdOrderBySortOrderAsc(UUID finishedProductId);

    /**
     * 按成品ID查询BOM组件列表，同时加载组件SKU信息
     * 用于需要展示组件名称的场景（如编辑页面）
     */
    @Query("SELECT bc FROM BomComponent bc LEFT JOIN FETCH bc.component WHERE bc.finishedProductId = :finishedProductId ORDER BY bc.sortOrder ASC")
    List<BomComponent> findByFinishedProductIdWithComponent(@Param("finishedProductId") UUID finishedProductId);

    /**
     * 按组件ID查询引用该组件的BOM列表(检查依赖)
     */
    List<BomComponent> findByComponentId(UUID componentId);

    /**
     * 删除成品的所有BOM组件
     */
    void deleteByFinishedProductId(UUID finishedProductId);
}

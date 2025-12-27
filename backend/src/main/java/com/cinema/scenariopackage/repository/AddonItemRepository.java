package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.AddonItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 加购项 Repository
 */
@Repository
public interface AddonItemRepository extends JpaRepository<AddonItem, UUID> {

    /**
     * 查询所有启用的加购项
     */
    @Query("SELECT a FROM AddonItem a WHERE a.isActive = true ORDER BY a.category, a.name")
    List<AddonItem> findAllActive();

    /**
     * 根据分类查询加购项
     */
    List<AddonItem> findByCategoryAndIsActiveTrue(String category);
}

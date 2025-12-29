/**
 * @spec O003-beverage-order
 * 饮品规格数据访问层
 */
package com.cinema.beverage.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.beverage.entity.BeverageSpec;
import com.cinema.beverage.entity.BeverageSpec.SpecType;

/**
 * 饮品规格Repository
 *
 * 对应 spec: O003-beverage-order
 * 提供饮品规格数据的CRUD操作和自定义查询
 */
@Repository
public interface BeverageSpecRepository extends JpaRepository<BeverageSpec, UUID> {

    /**
     * 根据饮品ID查询所有规格，按规格类型和排序顺序排列
     */
    List<BeverageSpec> findByBeverageIdOrderBySpecTypeAscSortOrderAsc(UUID beverageId);

    /**
     * 根据饮品ID和规格类型查询规格
     */
    List<BeverageSpec> findByBeverageIdAndSpecTypeOrderBySortOrderAsc(
            UUID beverageId,
            SpecType specType
    );

    /**
     * 根据饮品ID和规格类型查询规格（用于默认规格切换）
     */
    List<BeverageSpec> findByBeverageIdAndSpecType(
            UUID beverageId,
            SpecType specType
    );

    /**
     * 批量查询多个饮品的规格
     */
    @Query("SELECT s FROM BeverageSpec s WHERE s.beverageId IN :beverageIds ORDER BY s.beverageId, s.specType, s.sortOrder")
    List<BeverageSpec> findByBeverageIdIn(@Param("beverageIds") List<UUID> beverageIds);

    /**
     * 删除指定饮品的所有规格
     */
    void deleteByBeverageId(UUID beverageId);
}

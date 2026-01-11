package com.cinema.unitconversion.repository;

import com.cinema.unitconversion.domain.UnitCategory;
import com.cinema.unitconversion.domain.UnitConversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 单位换算规则数据访问层
 */
@Repository
public interface UnitConversionRepository extends JpaRepository<UnitConversion, UUID> {

    /**
     * 按类别查找所有换算规则
     */
    List<UnitConversion> findByCategory(UnitCategory category);

    /**
     * 按源单位和目标单位查找换算规则
     */
    Optional<UnitConversion> findByFromUnitAndToUnit(String fromUnit, String toUnit);

    /**
     * 按源单位和目标单位查找换算规则（大小写不敏感）
     */
    Optional<UnitConversion> findByFromUnitIgnoreCaseAndToUnitIgnoreCase(String fromUnit, String toUnit);

    /**
     * 检查是否存在指定的换算规则（排除某个ID）
     */
    @Query("SELECT COUNT(c) > 0 FROM UnitConversion c WHERE c.fromUnit = :fromUnit AND c.toUnit = :toUnit AND c.id <> :excludeId")
    boolean existsByFromUnitAndToUnitExcluding(@Param("fromUnit") String fromUnit,
                                                @Param("toUnit") String toUnit,
                                                @Param("excludeId") UUID excludeId);

    /**
     * 检查是否存在指定的换算规则
     */
    boolean existsByFromUnitAndToUnit(String fromUnit, String toUnit);

    /**
     * 按类别统计数量
     */
    long countByCategory(UnitCategory category);

    /**
     * 搜索换算规则（按源单位或目标单位模糊匹配）
     */
    @Query("SELECT c FROM UnitConversion c WHERE LOWER(c.fromUnit) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.toUnit) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<UnitConversion> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 按类别和关键词搜索
     */
    @Query("SELECT c FROM UnitConversion c WHERE c.category = :category AND (LOWER(c.fromUnit) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.toUnit) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<UnitConversion> searchByCategoryAndKeyword(@Param("category") UnitCategory category,
                                                     @Param("keyword") String keyword);

    /**
     * 查找以指定单位为源的所有换算规则
     */
    List<UnitConversion> findByFromUnit(String fromUnit);

    /**
     * 查找以指定单位为目标的所有换算规则
     */
    List<UnitConversion> findByToUnit(String toUnit);

    /**
     * 查找涉及指定单位的所有换算规则（源或目标）
     */
    @Query("SELECT c FROM UnitConversion c WHERE c.fromUnit = :unit OR c.toUnit = :unit")
    List<UnitConversion> findByUnit(@Param("unit") String unit);
}

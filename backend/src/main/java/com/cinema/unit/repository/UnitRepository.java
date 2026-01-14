package com.cinema.unit.repository;

import com.cinema.unit.domain.Unit;
import com.cinema.unit.domain.UnitCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * M001: 单位主数据 Repository
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Repository
public interface UnitRepository extends JpaRepository<Unit, UUID> {
    
    /**
     * 根据单位代码查询
     * @param code 单位代码
     * @return Unit 实体
     */
    Optional<Unit> findByCode(String code);
    
    /**
     * 根据分类查询
     * @param category 单位分类
     * @return 单位列表
     */
    List<Unit> findByCategory(UnitCategory category);
    
    /**
     * 查询所有基础单位
     * @param isBaseUnit 是否基础单位
     * @return 单位列表
     */
    List<Unit> findByIsBaseUnit(Boolean isBaseUnit);
    
    /**
     * 检查单位代码是否存在
     * @param code 单位代码
     * @return 是否存在
     */
    boolean existsByCode(String code);
}

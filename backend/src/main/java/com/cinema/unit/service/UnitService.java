package com.cinema.unit.service;

import com.cinema.unit.domain.UnitCategory;
import com.cinema.unit.dto.UnitRequest;
import com.cinema.unit.dto.UnitResponse;

import java.util.List;
import java.util.UUID;

/**
 * M001: 单位主数据服务接口
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public interface UnitService {
    
    /**
     * 创建单位
     * @param request 单位请求
     * @return 单位响应
     */
    UnitResponse createUnit(UnitRequest request);
    
    /**
     * 更新单位
     * @param id 单位ID
     * @param request 单位请求
     * @return 单位响应
     */
    UnitResponse updateUnit(UUID id, UnitRequest request);
    
    /**
     * 删除单位
     * @param id 单位ID
     */
    void deleteUnit(UUID id);
    
    /**
     * 根据ID查询单位
     * @param id 单位ID
     * @return 单位响应
     */
    UnitResponse getUnitById(UUID id);
    
    /**
     * 根据代码查询单位
     * @param code 单位代码
     * @return 单位响应
     */
    UnitResponse getUnitByCode(String code);
    
    /**
     * 查询所有单位
     * @return 单位列表
     */
    List<UnitResponse> getAllUnits();
    
    /**
     * 根据分类查询单位
     * @param category 单位分类
     * @return 单位列表
     */
    List<UnitResponse> getUnitsByCategory(UnitCategory category);
    
    /**
     * 查询基础单位
     * @return 基础单位列表
     */
    List<UnitResponse> getBaseUnits();
}

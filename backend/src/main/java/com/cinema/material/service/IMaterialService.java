package com.cinema.material.service;

import com.cinema.material.domain.MaterialCategory;
import com.cinema.material.dto.MaterialRequest;
import com.cinema.material.dto.MaterialResponse;

import java.util.List;
import java.util.UUID;

/**
 * M001: 物料服务接口
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public interface IMaterialService {
    
    /**
     * 创建物料
     * 如果编码为空,自动生成编码 (MAT-RAW-XXX 或 MAT-PKG-XXX)
     */
    MaterialResponse createMaterial(MaterialRequest request);
    
    /**
     * 更新物料
     */
    MaterialResponse updateMaterial(UUID id, MaterialRequest request);
    
    /**
     * 删除物料
     * 检查是否被BOM或库存引用
     */
    void deleteMaterial(UUID id);
    
    /**
     * 根据ID获取物料
     */
    MaterialResponse getMaterialById(UUID id);
    
    /**
     * 根据编码获取物料
     */
    MaterialResponse getMaterialByCode(String code);
    
    /**
     * 获取所有物料
     */
    List<MaterialResponse> getAllMaterials();
    
    /**
     * 根据分类获取物料
     */
    List<MaterialResponse> getMaterialsByCategory(MaterialCategory category);
    
    /**
     * 根据分类和状态获取物料
     */
    List<MaterialResponse> getMaterialsByCategoryAndStatus(MaterialCategory category, String status);
}

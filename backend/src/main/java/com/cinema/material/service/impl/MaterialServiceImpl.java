package com.cinema.material.service.impl;

import com.cinema.material.domain.MaterialCategory;
import com.cinema.material.dto.MaterialRequest;
import com.cinema.material.dto.MaterialResponse;
import com.cinema.material.entity.Material;
import com.cinema.material.exception.MaterialInUseException;
import com.cinema.material.exception.MaterialNotFoundException;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.material.service.IMaterialService;
import com.cinema.unit.domain.Unit;
import com.cinema.unit.exception.UnitNotFoundException;
import com.cinema.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * M001: 物料服务实现类
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements IMaterialService {

    private final MaterialRepository materialRepository;
    private final UnitRepository unitRepository;

    @Override
    @Transactional
    public MaterialResponse createMaterial(MaterialRequest request) {
        log.info("Creating material: {}", request.getName());
        
        // 验证库存单位存在
        Unit inventoryUnit = unitRepository.findById(request.getInventoryUnitId())
                .orElseThrow(() -> new UnitNotFoundException(
                        "Inventory unit not found: " + request.getInventoryUnitId()));
        
        // 验证采购单位存在
        Unit purchaseUnit = unitRepository.findById(request.getPurchaseUnitId())
                .orElseThrow(() -> new UnitNotFoundException(
                        "Purchase unit not found: " + request.getPurchaseUnitId()));
        
        // 自动生成物料编码（如果未提供）
        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            String prefix = request.getCategory() == MaterialCategory.RAW_MATERIAL
                    ? "MAT-RAW-"
                    : "MAT-PKG-";
            Long sequence = materialRepository.getNextCodeSequence();
            code = prefix + String.format("%03d", sequence);
        }
        
        // 验证物料编码唯一性
        if (materialRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Material code already exists: " + code);
        }
        
        // 创建物料实体
        Material material = Material.builder()
                .code(code)
                .name(request.getName())
                .category(request.getCategory())
                .inventoryUnit(inventoryUnit)
                .purchaseUnit(purchaseUnit)
                .conversionRate(request.getConversionRate())
                .useGlobalConversion(request.getUseGlobalConversion())
                .specification(request.getSpecification())
                .description(request.getDescription())
                .standardCost(request.getStandardCost())
                .status(request.getStatus())
                .build();
        
        // 保存物料
        Material savedMaterial = materialRepository.save(material);
        log.info("Material created successfully: {}", savedMaterial.getCode());
        
        return MaterialResponse.fromEntity(savedMaterial);
    }

    @Override
    @Transactional
    public MaterialResponse updateMaterial(UUID id, MaterialRequest request) {
        log.info("Updating material: {}", id);
        
        // 查询现有物料
        Material existing = materialRepository.findById(id)
                .orElseThrow(() -> new MaterialNotFoundException("Material not found: " + id));
        
        // 更新允许修改的字段
        if (request.getName() != null) {
            existing.setName(request.getName());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getSpecification() != null) {
            existing.setSpecification(request.getSpecification());
        }
        if (request.getStandardCost() != null) {
            existing.setStandardCost(request.getStandardCost());
        }
        
        // 更新库存单位（如果提供）
        if (request.getInventoryUnitId() != null) {
            Unit inventoryUnit = unitRepository.findById(request.getInventoryUnitId())
                    .orElseThrow(() -> new UnitNotFoundException(
                            "Inventory unit not found: " + request.getInventoryUnitId()));
            existing.setInventoryUnit(inventoryUnit);
        }
        
        // 更新采购单位（如果提供）
        if (request.getPurchaseUnitId() != null) {
            Unit purchaseUnit = unitRepository.findById(request.getPurchaseUnitId())
                    .orElseThrow(() -> new UnitNotFoundException(
                            "Purchase unit not found: " + request.getPurchaseUnitId()));
            existing.setPurchaseUnit(purchaseUnit);
        }
        
        // 更新换算率
        if (request.getConversionRate() != null) {
            existing.setConversionRate(request.getConversionRate());
        }
        if (request.getUseGlobalConversion() != null) {
            existing.setUseGlobalConversion(request.getUseGlobalConversion());
        }
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }
        
        // 保存更新
        Material updatedMaterial = materialRepository.save(existing);
        log.info("Material updated successfully: {}", updatedMaterial.getCode());
        
        return MaterialResponse.fromEntity(updatedMaterial);
    }

    @Override
    @Transactional
    public void deleteMaterial(UUID id) {
        log.info("Deleting material: {}", id);
        
        // 查询物料
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new MaterialNotFoundException("Material not found: " + id));
        
        // 检查是否被BOM组件引用
        if (materialRepository.isReferencedByBomComponents(id)) {
            throw new MaterialInUseException(
                    "Material is referenced by BOM components and cannot be deleted: " + material.getCode());
        }
        
        // 检查是否被库存引用
        if (materialRepository.isReferencedByInventory(id)) {
            throw new MaterialInUseException(
                    "Material is referenced by inventory and cannot be deleted: " + material.getCode());
        }
        
        // 删除物料
        materialRepository.delete(material);
        log.info("Material deleted successfully: {}", material.getCode());
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialResponse getMaterialById(UUID id) {
        log.debug("Getting material by id: {}", id);
        
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new MaterialNotFoundException("Material not found: " + id));
        
        return MaterialResponse.fromEntity(material);
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialResponse getMaterialByCode(String code) {
        log.debug("Getting material by code: {}", code);
        
        Material material = materialRepository.findByCode(code)
                .orElseThrow(() -> new MaterialNotFoundException("Material not found with code: " + code));
        
        return MaterialResponse.fromEntity(material);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getAllMaterials() {
        log.debug("Getting all materials");
        
        List<Material> materials = materialRepository.findAll();
        
        return materials.stream()
                .map(MaterialResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getMaterialsByCategory(MaterialCategory category) {
        log.debug("Getting materials by category: {}", category);
        
        List<Material> materials = materialRepository.findByCategory(category);
        
        return materials.stream()
                .map(MaterialResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getMaterialsByCategoryAndStatus(MaterialCategory category, String status) {
        log.debug("Getting materials by category: {} and status: {}", category, status);
        
        List<Material> materials = materialRepository.findByCategoryAndStatus(category, status);
        
        return materials.stream()
                .map(MaterialResponse::fromEntity)
                .collect(Collectors.toList());
    }
}

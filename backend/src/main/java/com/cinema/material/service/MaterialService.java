/**
 * @spec M001-material-unit-system
 * @spec N004-procurement-material-selector
 */
package com.cinema.material.service;

import com.cinema.material.entity.Material;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.unit.entity.Unit;
import com.cinema.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final UnitRepository unitRepository;

    /**
     * 创建物料
     * 如果物料编码为空，自动生成编码
     */
    @Transactional
    public Material createMaterial(Material material) {
        // 验证库存单位存在
        Unit inventoryUnit = unitRepository.findById(material.getInventoryUnit().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inventory unit not found: " + material.getInventoryUnit().getId()));

        // 验证采购单位存在
        Unit purchaseUnit = unitRepository.findById(material.getPurchaseUnit().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Purchase unit not found: " + material.getPurchaseUnit().getId()));

        // 自动生成物料编码（如果未提供）
        if (material.getCode() == null || material.getCode().isEmpty()) {
            String prefix = material.getCategory() == Material.MaterialCategory.RAW_MATERIAL
                    ? "MAT-RAW-"
                    : "MAT-PKG-";
            Long sequence = materialRepository.getNextCodeSequence();
            material.setCode(prefix + String.format("%03d", sequence));
        }

        // 验证物料编码唯一性
        if (materialRepository.existsByCode(material.getCode())) {
            throw new IllegalArgumentException("Material code already exists: " + material.getCode());
        }

        material.setInventoryUnit(inventoryUnit);
        material.setPurchaseUnit(purchaseUnit);

        log.info("Creating material with code: {}, name: {}", material.getCode(), material.getName());
        return materialRepository.save(material);
    }

    /**
     * 按ID查询物料
     */
    @Transactional(readOnly = true)
    public Material findById(UUID id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material not found: " + id));
    }

    /**
     * 按编码查询物料
     */
    @Transactional(readOnly = true)
    public Material findByCode(String code) {
        return materialRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Material not found with code: " + code));
    }

    /**
     * 按分类查询物料列表
     */
    @Transactional(readOnly = true)
    public List<Material> findByCategory(Material.MaterialCategory category) {
        return materialRepository.findByCategory(category);
    }

    /**
     * 查询所有物料
     */
    @Transactional(readOnly = true)
    public List<Material> findAll() {
        return materialRepository.findAll();
    }

    // ========== N004: Search and pagination methods for Material selector ==========

    /**
     * 按搜索词查询物料（分页）
     * N004: 用于 MaterialSkuSelector 组件
     */
    @Transactional(readOnly = true)
    public Page<Material> findBySearchTerm(String searchTerm, Pageable pageable) {
        return materialRepository.findBySearchTerm(searchTerm, pageable);
    }

    /**
     * 按分类查询物料（分页）
     * N004: 用于 MaterialSkuSelector 组件
     */
    @Transactional(readOnly = true)
    public Page<Material> findByCategoryPaged(Material.MaterialCategory category, Pageable pageable) {
        return materialRepository.findByCategoryPaged(category, pageable);
    }

    /**
     * 按分类和搜索词查询物料（分页）
     * N004: 用于 MaterialSkuSelector 组件
     */
    @Transactional(readOnly = true)
    public Page<Material> findByCategoryAndSearchTerm(
            Material.MaterialCategory category, String searchTerm, Pageable pageable) {
        return materialRepository.findByCategoryAndSearchTerm(category, searchTerm, pageable);
    }

    /**
     * 查询所有活跃物料（分页）
     * N004: 用于 MaterialSkuSelector 组件
     */
    @Transactional(readOnly = true)
    public Page<Material> findAllActivePaged(Pageable pageable) {
        return materialRepository.findAllActivePaged(pageable);
    }

    /**
     * 更新物料
     */
    @Transactional
    public Material updateMaterial(UUID id, Material materialUpdate) {
        Material existing = findById(id);

        // 更新允许修改的字段
        if (materialUpdate.getName() != null) {
            existing.setName(materialUpdate.getName());
        }
        if (materialUpdate.getDescription() != null) {
            existing.setDescription(materialUpdate.getDescription());
        }
        if (materialUpdate.getSpecification() != null) {
            existing.setSpecification(materialUpdate.getSpecification());
        }

        // 更新库存单位（如果提供）
        if (materialUpdate.getInventoryUnit() != null && materialUpdate.getInventoryUnit().getId() != null) {
            Unit inventoryUnit = unitRepository.findById(materialUpdate.getInventoryUnit().getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Inventory unit not found: " + materialUpdate.getInventoryUnit().getId()));
            existing.setInventoryUnit(inventoryUnit);
        }

        // 更新采购单位（如果提供）
        if (materialUpdate.getPurchaseUnit() != null && materialUpdate.getPurchaseUnit().getId() != null) {
            Unit purchaseUnit = unitRepository.findById(materialUpdate.getPurchaseUnit().getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Purchase unit not found: " + materialUpdate.getPurchaseUnit().getId()));
            existing.setPurchaseUnit(purchaseUnit);
        }

        // 更新换算率
        if (materialUpdate.getConversionRate() != null) {
            existing.setConversionRate(materialUpdate.getConversionRate());
        }
        if (materialUpdate.getUseGlobalConversion() != null) {
            existing.setUseGlobalConversion(materialUpdate.getUseGlobalConversion());
        }
        // 更新标准成本
        if (materialUpdate.getStandardCost() != null) {
            existing.setStandardCost(materialUpdate.getStandardCost());
        }

        log.info("Updating material: {}", id);
        return materialRepository.save(existing);
    }

    /**
     * 删除物料
     * 检查是否被BOM引用
     */
    @Transactional
    public void deleteMaterial(UUID id) {
        Material material = findById(id);

        // 检查是否被BOM组件引用
        if (materialRepository.isReferencedByBomComponents(id)) {
            throw new IllegalStateException(
                    "Material is referenced by BOM components and cannot be deleted: " + material.getCode());
        }

        log.info("Deleting material: {}", material.getCode());
        materialRepository.delete(material);
    }
}
